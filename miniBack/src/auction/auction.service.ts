import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { ethers } from 'ethers';
import axios from 'axios';
import { Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule'; // NestJS Scheduler

import { Auction } from './auction.entity';
import { EthersProvider } from './ethers.provider';
import { MetaService } from '../meta/meta.service';
import { BidService } from '../bid/bid.service'; // 👈 추가

import AuctionManagerAbi from '../abis/AuctionManager.json';
import MinimalForwarderAbi from '../abis/MinimalForwarder.json';
import { error } from 'console';

@Injectable()
export class AuctionService {
    private readonly wallet: ethers.Wallet;
    private readonly forwarder: ethers.Contract;
    private readonly auctionManager: ethers.Contract;
    private readonly logger = new Logger(AuctionService.name);

    private nonceMap: Record<string, number> = {};

    constructor(
        @InjectRepository(Auction)
        private readonly auctionRepo: Repository<Auction>,
        private readonly ethersProvider: EthersProvider,
        private readonly metaService: MetaService,
        @Inject(forwardRef(() => BidService))
        private readonly bidService: BidService, // 👈 의존성 주입, forwardRef :양방향 참조 방지용으로 사용
    ) {
        // ✅ Relayer wallet 연결
        this.wallet = new ethers.Wallet(
            process.env.PRIVATE_KEY!,
            this.ethersProvider.provider
        );

        // ✅ Forwarder Contract
        this.forwarder = new ethers.Contract(
            process.env.FORWARDER_ADDRESS!,
            MinimalForwarderAbi,
            this.wallet
        );

        // ✅ AuctionManager Contract
        this.auctionManager = new ethers.Contract(
            process.env.AUCTION_MANAGER_ADDRESS!,
            AuctionManagerAbi.abi,
            this.wallet
        );
    }

    // ✅ 1️⃣ Nonce Reservation (메타트랜잭션용)
    async reserveNonce(forwarder: string, userAddress: string): Promise<{ nonce: number }> {
        const nonce = await this.metaService.reserveNonce(forwarder, userAddress);
        return { nonce };
    }

    async relay(forwarder: string, request: any, signature: string): Promise<any> {
        console.log("릴레이 request: ", request);
        // 1️⃣ 메타트랜잭션 relaying
        const { txHash } = await this.metaService.relayMetaTransaction(
            forwarder,
            request,
            signature
        );

        console.log(`✅ relay txHash: ${txHash}`);

        // 2️⃣ Calldata 파싱
        const decoded = this.decodeCreateAuctionCalldata(request.data);
        console.log("디코디드 데이터: ", decoded);

        const userMintedNFT = new ethers.Contract(
            decoded.nftContract,
            ['function tokenURI(uint256) view returns (string)'],
            this.ethersProvider.provider
        );

        const tokenUri = await userMintedNFT.tokenURI(decoded.tokenId);
        //tokenURI가 가르키는건 IPFS에 저장된 메타데이터 JSON 파일인데블록체인에서 tokenURI() 호출하면 링크만 줘서
        //링크가 가르키는 JSON 내용은 오프체인에 존재한다 그래서 그 링크를 실제로 HTTP로 GET 요청해서 JSON 내용을 가져와야 한다

        const response = await axios.get(tokenUri);
        //axios는 tokenURI가 알려주는 메타데이터 JSON 링크를 HTTP로 요청해서 내용을 가져오는 역할을 한다
        const metadata = response.data;
        console.log("db등록 전 메타데이터: ", metadata);

        // 3️⃣ AuctionCreated 이벤트에서 auctionId 추출
        const receipt = await this.ethersProvider.provider.getTransactionReceipt(txHash);
        console.log("✅ receipt:", receipt);
        console.log("✅ receipt.스테이터스:", receipt.status);
        const iface = new ethers.Interface(AuctionManagerAbi.abi);


        console.log("✅ receipt 로그:", receipt.logs);

        let auctionId: number | undefined;
        for (const log of receipt.logs) {
            if (log.address.toLowerCase() !== process.env.AUCTION_MANAGER_ADDRESS.toLowerCase()) {
                continue;
            }
            try {
                const parsed = iface.parseLog(log);
                this.logger.debug(`✅ parsed.name = ${parsed.name}`);
                if (parsed.name === "AuctionCreated") {
                    const auctionIdRaw = parsed.args.auctionId;

                    // 타입 안전하게 변환
                    //로거로 확인해보니 타입이 bigint였다 그래서 처음 if인 bigint만 Number로 변환해주면 된다
                    if (typeof auctionIdRaw === 'bigint') {
                        auctionId = Number(auctionIdRaw);
                    } else if (auctionIdRaw && typeof auctionIdRaw.toNumber === 'function') {
                        auctionId = auctionIdRaw.toNumber();
                    } else if (typeof auctionIdRaw === 'string') {
                        auctionId = parseInt(auctionIdRaw, 10);
                    } else if (typeof auctionIdRaw === 'number') {
                        auctionId = auctionIdRaw;
                    } else {
                        throw new Error(`❌ 알 수 없는 auctionId 타입: ${typeof auctionIdRaw}`);
                    }

                    this.logger.log(`✅ AuctionCreated 이벤트 파싱 성공: auctionId=${auctionId}`);
                    break;
                }
            } catch (err) {
                this.logger.warn(`⚠️ parseLog 실패 (AuctionManager 이벤트 아님?): ${err}`);
                this.logger.debug(`⚠️ 로그 topics: ${JSON.stringify(log.topics)}`);
            }
        }

        if (auctionId === undefined) {
            throw new Error("❌ AuctionCreated 이벤트에서 auctionId를 찾을 수 없습니다!");
        }
        console.log("✅ Extracted auctionId:", auctionId);

        // 3️⃣ DB endAt 계산
        const now = new Date();
        const endAt = new Date(now.getTime() + decoded.duration * 1000);

        const startPrice = parseInt(ethers.formatUnits(decoded.startPrice, 18)).toString();
        const minIncrement = parseInt(ethers.formatUnits(decoded.minIncrement, 18)).toString();

        // 4️⃣ DB 저장
        await this.auctionRepo.save({
            id: auctionId,
            creator: request.from,
            nftContract: decoded.nftContract,
            tokenId: decoded.tokenId,
            startPrice,
            minIncrement,
            duration: decoded.duration,
            nftImage: metadata.image,
            nftName: metadata.name,
            nftDescription: metadata.description,
            txHash,
            endAt,
            escrowedAt: now,                       // ✅ escrow 시점
            active: true,
        });

        return { txHash };
    }


    // ✅ 3️⃣ ABI 디코딩 함수 (AuctionManager.createAuction calldata 해석)
    private decodeCreateAuctionCalldata(data: string) {
        const iface = new ethers.Interface(AuctionManagerAbi.abi);

        const parsed = iface.parseTransaction({ data });
        if (!parsed || parsed.name !== 'createAuction') {
            throw new Error('Invalid calldata for createAuction');
        }

        const [nftContract, tokenId, startPrice, minIncrement, duration] = parsed.args;

        return {
            nftContract,
            tokenId: tokenId.toString(),
            startPrice: startPrice.toString(),
            minIncrement: minIncrement.toString(),
            duration: Number(duration),
        };
    }

    async getAuctionList() {
        // ✅ DB에서 모든 경매 등록 정보 가져오기
        const auctions = await this.auctionRepo.find({
            relations: ['state'], // auction.state → BidState
            order: { createdAt: 'DESC' }
        });

        // ✅ 프론트에서 원하는 구조로 매핑
        return auctions.map((auction) => ({
            id: auction.id,
            nftMetadata: {
                name: auction.nftName,
                image: auction.nftImage,
                description: auction.nftDescription,
            },
            creator: auction.creator,
            startPrice: auction.startPrice,
            highestBid: auction.state?.currentBid ?? null,        // ✅ 현재 입찰가
            minIncrement: auction.minIncrement,                   // ✅ 최소 입찰 상승가
            totalBids: auction.state?.bidCount ?? 0,              // ✅ 총 입찰 수
            endAt: auction.endAt?.toISOString() ?? null,
            contractAddress: auction.nftContract,
            tokenId: auction.tokenId,
            active: auction.active,
        }));
    }

    @Cron('*/30 * * * * *') // 매 30초마다 실행
    async handleAuctionEndings() {
        const now = new Date();

        // 1️⃣ 종료된 경매 찾기
        const expiredAuctions = await this.auctionRepo.find({
            where: {
                active: true,
                endAt: LessThanOrEqual(now),
            },
        });

        if (expiredAuctions.length === 0) {
            return; // 종료 대상 없음
        }

        this.logger.log(`🔔 종료 대상 경매 ${expiredAuctions.length}건 발견`);

        for (const auction of expiredAuctions) {
            try {

                const hasBids = await this.bidService.hasAnyBids(auction.id);

                if (hasBids) {
                    // ✅ 정상적인 경매 종료
                    const tx = await this.auctionManager.endAuction(auction.id);
                    await this.bidService.finalizeBidStats(auction.id);
                    this.logger.log(`✅ 경매 종료 완료 (auctionId: ${auction.id})`);
                    this.logger.log(`🧾 종료 트랜잭션 해시: ${tx.hash}`);
                } else {
                    // ✅ 입찰 없는 경매 취소
                    const tx = await this.auctionManager.cancelAuction(auction.id);
                    this.logger.log(`✅ 경매 취소 완료 (auctionId: ${auction.id})`);
                    this.logger.log(`🧾 취소 트랜잭션 해시: ${tx.hash}`);
                }

                // ✅ DB에서 active 상태 false로 갱신
                await this.auctionRepo.update({ id: auction.id }, { active: false });
            } catch (err) {
                this.logger.error(`❌ 종료 처리 실패 (auctionId: ${auction.id})`, err);
            }
        }
    }
}
