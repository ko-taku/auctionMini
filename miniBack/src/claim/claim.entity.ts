import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'attendance_claim' })
export class Claim {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    address: string;

    @Column({ name: 'total_claim_engage', default: 0 })
    totalClaimEngage: number;

    @Column({ name: 'total_claim_auction', default: 0 })
    totalClaimAuction: number;

    @Column({ name: 'last_claim_engage', type: 'date', nullable: true })
    lastClaimEngage: string;

    @Column({ name: 'last_claim_auction', type: 'date', nullable: true })
    lastClaimAuction: string;
}
