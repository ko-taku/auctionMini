import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Auction } from '../auction/auction.entity';

@Entity({ name: 'auction_bid_user' })
export class BidUser {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_address' })
    userAddress: string;

    @Column({ name: 'auction_id' })
    auctionId: number;

    @Column({ name: 'bid_count', default: 0 })
    bidCount: number;

    @Column({ name: 'user_max_bid', type: 'varchar', length: 100, nullable: true })
    userMaxBid: string;

    @Column({ name: 'last_bid_at', type: 'timestamp', nullable: true })
    lastBidAt: Date;

    // 🔗 경매 정보 연결
    @ManyToOne(() => Auction, { onDelete: 'CASCADE' })
    //N:1 관계, 여러 명의 사용자가 하나의 경매에 입찰하는 현재 구조에 알맞음
    //CASCADE는 해당 경매가 삭제되면(row 삭제) 그 경매에 연결된 모든 biduser row도 삭제된다 정합성 유지에 매우 중요
    @JoinColumn({ name: 'auction_id' })
    //auction_bid_user 테이블에서 auction_id라는 컬럼을 외래키로 사용하겠다는 의미
    auction: Auction;
}
