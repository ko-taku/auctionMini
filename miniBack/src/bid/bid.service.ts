import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';
import { MetaService } from '../meta/meta.service';
import { EthersProvider } from './ethers.provider';

import AuctionManagerAbi from '../abis/AuctionManager.json';
import MinimalForwarderAbi from '../abis/MinimalForwarder.json';

import { BidState } from './bidState.entity';
import { BidUser } from './bidUser.entity';

@Injectable()
export class BidService {
    private readonly wallet: ethers.Wallet;
    private readonly forwarder: ethers.Contract;
    private readonly auctionManager: ethers.Contract;
    private readonly logger = new Logger(BidService.name);

    constructor(
        @InjectRepository(BidState)
        private readonly bidStateRepo: Repository<BidState>,
        @InjectRepository(BidUser)
        private readonly bidUserRepo: Repository<BidUser>,
        private readonly ethersProvider: EthersProvider,
        private readonly metaService: MetaService,
    ) {
        this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, this.ethersProvider.provider);

        this.forwarder = new ethers.Contract(
            process.env.FORWARDER_ADDRESS!,
            MinimalForwarderAbi,
            this.wallet
        );

        this.auctionManager = new ethers.Contract(
            process.env.AUCTION_MANAGER_ADDRESS!,
            AuctionManagerAbi.abi,
            this.wallet
        );
    }

    /**
     * ✅ 1️⃣ Nonce Reservation
     */
    async reserveNonce(forwarder: string, userAddress: string): Promise<{ nonce: number }> {
        const nonce = await this.metaService.reserveNonce(forwarder, userAddress);
        return { nonce };
    }

    /**
     * ✅ 2️⃣ relay & bid 상태 반영
     */
    async relay(forwarder: string, request: any, signature: string): Promise<any> {
        this.logger.log(`✅ relay called. request.from=${request.from}`);

        // 1️⃣ 메타트랜잭션 실행
        const { txHash } = await this.metaService.relayMetaTransaction(forwarder, request, signature);
        this.logger.log(`✅ tx relayed: ${txHash}`);

        // 2️⃣ calldata 파싱 → bid(auctionId, amount)
        const iface = new ethers.Interface(AuctionManagerAbi.abi);
        const parsed = iface.parseTransaction({ data: request.data });
        if (!parsed || (parsed.name !== 'bid' && parsed.name !== 'bidWithPermit')) {
            throw new Error('Invalid calldata. Not a bid() or bidWithPermit() call.');
        }


        const auctionId = Number(parsed.args[0]);
        const amount = ethers.formatUnits(parsed.args[1], 18);
        const userAddress = request.from;
        const bidAt = new Date();

        this.logger.log(`✅ Decoded bid → auctionId=${auctionId}, amount=${amount}, user=${userAddress}`);

        // 3️⃣ DB 상태 업데이트
        await this.updateBidStateAndUser({
            auctionId,
            userAddress,
            amount,
            bidAt,
        });

        return { txHash };
    }

    /**
     * ✅ 3️⃣ 상태 테이블 업데이트
     */
    private async updateBidStateAndUser({
        auctionId,
        userAddress,
        amount,
        bidAt,
    }: {
        auctionId: number;
        userAddress: string;
        amount: string;
        bidAt: Date;
    }): Promise<void> {
        this.logger.debug(`✅ updateBidStateAndUser for auctionId=${auctionId}`);

        // ⭐️ auction_bid_state UPSERT
        const existingState = await this.bidStateRepo.findOneBy({ auctionId });
        if (!existingState) {
            await this.bidStateRepo.save({
                auctionId,
                currentBid: amount,
                highestBidder: userAddress,
                bidCount: 1,
                bidderCount: 1,
                lastBidAt: bidAt,
            });
            this.logger.log(`✅ Created new AuctionBidState`);
        } else {
            const isNewBidder = !(await this.bidUserRepo.findOneBy({ auctionId, userAddress }));

            await this.bidStateRepo.update(
                { id: existingState.id },
                {
                    currentBid: amount,
                    highestBidder: userAddress,
                    bidCount: () => `"bid_count" + 1`,
                    bidderCount: isNewBidder ? () => `"bidder_count" + 1` : existingState.bidderCount,
                    lastBidAt: bidAt,
                }
            );
            this.logger.log(`✅ Updated AuctionBidState`);
        }

        // ⭐️ auction_bid_user UPSERT
        const existingUser = await this.bidUserRepo.findOneBy({ auctionId, userAddress });
        if (!existingUser) {
            await this.bidUserRepo.save({
                auctionId,
                userAddress,
                bidCount: 1,
                userMaxBid: amount,
                lastBidAt: bidAt,
            });
            this.logger.log(`✅ Created new AuctionBidUser`);
        } else {
            await this.bidUserRepo.update(
                { id: existingUser.id },
                {
                    bidCount: () => `"bid_count" + 1`,
                    userMaxBid: amount,
                    lastBidAt: bidAt,
                }
            );
            this.logger.log(`✅ Updated AuctionBidUser`);
        }
    }

    async getUserBidsList(userAddress: string) {
        const bids = await this.bidUserRepo.find({
            where: { userAddress },
            relations: ['auction', 'auction.state'], // auctionRegister 테이블과 JOIN
            order: { lastBidAt: 'DESC' }
        });

        return bids.map((b) => ({
            id: b.auction.id,
            tokenId: b.auction.tokenId,
            contractAddress: b.auction.nftContract,
            nftMetadata: {
                image: b.auction.nftImage,
                name: b.auction.nftName,
                description: b.auction.nftDescription,
            },
            startPrice: b.auction.startPrice,
            highestBid: b.auction.state?.currentBid ?? "0",
            endAt: b.auction.endAt,
            active: b.auction.active,
            creator: b.auction.creator,

            // ✅ 유저 개인 입찰 정보
            userMaxBid: b.userMaxBid,
            bidCount: b.bidCount,

            // ✅ 최고 입찰자인지 여부
            isHighestBidder:
                b.auction.state?.highestBidder?.toLowerCase() === b.userAddress.toLowerCase(),

        }));
    }

    async finalizeBidStats(auctionId: number) {
        const state = await this.bidStateRepo.findOne({ where: { auctionId } });
        if (!state) return;

        await this.bidStateRepo.update({ auctionId }, {
            endAt: new Date(),
        });
    }

    async hasAnyBids(auctionId: number): Promise<boolean> {
        const bidState = await this.bidStateRepo.findOne({
            where: { auctionId },
        });
        return !!bidState && Number(bidState.bidCount) > 0;
    }
}
