import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { BidState } from '../bid/bidState.entity';

@Entity({ name: 'auction_register' })
export class Auction {
    @Column({ primary: true })
    id: number;

    @Column({ name: 'creator' })
    creator: string;  // ✅ 경매 등록자 (원래 소유자)

    @Column({ name: 'nft_contract' })
    nftContract: string;

    @Column({ name: 'token_id' })
    tokenId: string;

    @Column({ name: 'start_price' })
    startPrice: string;

    @Column({ name: 'min_increment' })
    minIncrement: string;

    @Column({ name: 'duration' })
    duration: number;

    @Column({ name: 'nft_image', nullable: true })
    nftImage: string;

    @Column({ name: 'nft_name', nullable: true })
    nftName: string;

    @Column({ name: 'nft_description', nullable: true })
    nftDescription: string;

    @Column({ name: 'tx_hash', nullable: true })
    txHash: string;

    @Column({
        name: 'created_at',
        type: 'timestamp',
        default: () => 'NOW()',
    })
    createdAt: Date;

    @Column({ name: 'end_at', type: 'timestamp', nullable: true })
    endAt: Date;

    @Column({ name: 'escrowed_at', type: 'timestamp', nullable: true })
    escrowedAt: Date;  // ✅ 유저가 escrow 전송한 시점

    @Column({ name: 'active', default: true })
    active: boolean;

    @OneToOne(() => BidState, (state) => state.auction)
    state: BidState;
}
