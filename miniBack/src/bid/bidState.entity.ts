import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, RelationId } from 'typeorm';
import { Auction } from '../auction/auction.entity';

@Entity({ name: 'auction_bid_state' })
export class BidState {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'auction_id' })
    auctionId: number;

    @OneToOne(() => Auction, (auction) => auction.state, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'auction_id' })
    auction: Auction;

    @Column({ name: 'current_bid', nullable: true })
    currentBid: string;

    @Column({ name: 'highest_bidder', nullable: true })
    highestBidder: string;

    @Column({ name: 'bid_count', default: 0 })
    bidCount: number;

    @Column({ name: 'bidder_count', default: 0 })
    bidderCount: number;

    @Column({ name: 'last_bid_at', type: 'timestamp', nullable: true })
    lastBidAt: Date;

    @Column({ name: 'end_at', type: 'timestamp', nullable: true })
    endAt: Date;

}
