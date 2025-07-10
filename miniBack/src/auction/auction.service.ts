import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';

import { Auction } from './auction.entity';
import { EthersProvider } from './ethers.provider';
import { MetaService } from '../meta/meta.service';

import AuctionManagerAbi from '../abis/AuctionManager.json';
import MinimalForwarderAbi from '../abis/MinimalForwarder.json';

@Injectable()
export class AuctionService {
    private readonly wallet: ethers.Wallet;
    private readonly forwarder: ethers.Contract;
    private readonly auctionManager: ethers.Contract;

    private nonceMap: Record<string, number> = {};

    constructor(
        @InjectRepository(Auction)
        private readonly auctionRepo: Repository<Auction>,
        private readonly ethersProvider: EthersProvider,
        private readonly metaService: MetaService,
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
        // 2️⃣ Calldata 파싱
        const decoded = this.decodeCreateAuctionCalldata(request.data);
        console.log("디코디드 데이터: ", decoded);
        // 1️⃣ 메타트랜잭션 relaying
        const { txHash } = await this.metaService.relayMetaTransaction(
            forwarder,
            request,
            signature
        );


        // 3️⃣ DB endAt 계산
        const now = new Date();
        const endAt = new Date(now.getTime() + decoded.duration * 1000);

        // 4️⃣ DB 저장
        await this.auctionRepo.save({
            creator: request.from,
            nftContract: decoded.nftContract,
            tokenId: decoded.tokenId,
            startPrice: decoded.startPrice,
            minIncrement: decoded.minIncrement,
            duration: decoded.duration,
            txHash,
            endAt,
            escrowedAt: now,                       // ✅ escrow 시점
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
        const auctions = await this.auctionRepo.find();

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
            highestBid: undefined,           // 나중에 bid_state JOIN 하면 가능
            endAt: auction.endAt?.toISOString() ?? null,
            contractAddress: auction.nftContract,
            tokenId: auction.tokenId,
        }));
    }
}
