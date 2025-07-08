import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

import { Claim } from '../claim/claim.entity';
import { MetaService } from '../meta/meta.service';
import { EthersProvider } from './ethers.provider';

import AttendanceRewardMeta from '../abis/AttendanceRewardMeta.json';
import MinimalForwarderAbi from '../abis/MinimalForwarder.json';

import { RelayRequestDto } from './dto/relay-request.dto';

type ClaimType = 'engage' | 'auction';

@Injectable()
export class TokenService {
    constructor(
        @InjectRepository(Claim)
        private readonly claimRepo: Repository<Claim>,
        private readonly metaService: MetaService,
        private readonly ethersProvider: EthersProvider,
        private readonly configService: ConfigService,
    ) { }

    /** ✅ 오늘 날짜 (YYYY-MM-DD) */
    private todayDate(): string {
        return new Date().toISOString().split('T')[0];
    }

    /** ✅ MinimalForwarder 컨트랙트 인스턴스 생성 */
    private getForwarderContract(): ethers.Contract {
        const forwarderAddress = this.configService.get<string>('FORWARDER_ADDRESS');
        console.log('✅ forwarderAddress:', forwarderAddress);
        console.log('✅ provider:', this.ethersProvider.provider);
        return new ethers.Contract(
            forwarderAddress,
            MinimalForwarderAbi,
            this.ethersProvider.provider
        );
    }

    /** ✅ AttendanceRewardMeta 컨트랙트 인스턴스 생성 */
    private getAttendanceContract(): ethers.Contract {
        const contractAddress = this.configService.get<string>('ATTENDANCE_ADDRESS');
        return new ethers.Contract(
            contractAddress,
            AttendanceRewardMeta.abi,
            this.ethersProvider.wallet
        );
    }

    async getClaimStatus(userAddress: string) {
        let claim = await this.claimRepo.findOneBy({ address: userAddress });
        if (!claim) {
            return {
                totalClaimEngage: 0,
                totalClaimAuction: 0,
            };
        }

        return {
            totalClaimEngage: claim.totalClaimEngage ?? 0,
            totalClaimAuction: claim.totalClaimAuction ?? 0,
        }

    }

    /** ========== 1️⃣ reserve ========== */
    async reserve(type: ClaimType, userAddress: string) {
        const today = this.todayDate();

        // ✅ DB에서 오늘 이미 출석했는지 체크
        let claim = await this.claimRepo.findOneBy({ address: userAddress });
        if (!claim) {
            claim = this.claimRepo.create({ address: userAddress });
        }
        if ((type === 'engage' && claim.lastClaimEngage === today) ||
            (type === 'auction' && claim.lastClaimAuction === today)) {
            throw new Error(`오늘 이미 ${type} 출석을 완료했습니다.`);
        }

        // ✅ Forwarder 컨트랙트에서 nonce 조회
        const forwarder = this.getForwarderContract();
        const nonceBn = await forwarder.nonces(userAddress);
        const nonce = Number(nonceBn);

        // ✅ nonce reservation 기록
        await this.metaService.reserveNonce(String(forwarder.target), userAddress);

        return { nonce };
    }

    /** ========== 2️⃣ relay ========== */
    async relay(
        type: ClaimType,
        userAddress: string,
        body: RelayRequestDto
    ) {
        const { forwarder, request, signature } = body;

        const today = this.todayDate();

        // ✅ DB에서 오늘 이미 출석했는지 재확인
        let claim = await this.claimRepo.findOneBy({ address: userAddress });
        if (!claim) {
            claim = this.claimRepo.create({ address: userAddress });
        }
        if ((type === 'engage' && claim.lastClaimEngage === today) ||
            (type === 'auction' && claim.lastClaimAuction === today)) {
            throw new Error(`오늘 이미 ${type} 출석을 완료했습니다.`);
        }

        // ✅ EIP-712 도메인 정보
        const network = await this.ethersProvider.provider.getNetwork();
        const domain = {
            name: 'AuctionSystem',
            version: '1',
            chainId: network.chainId,
            verifyingContract: String(forwarder),
        };
        const types = {
            ForwardRequest: [
                { name: 'from', type: 'address' },
                { name: 'to', type: 'address' },
                { name: 'value', type: 'uint256' },
                { name: 'gas', type: 'uint256' },
                { name: 'nonce', type: 'uint256' },
                { name: 'deadline', type: 'uint48' },
                { name: 'data', type: 'bytes' },
            ],
        };

        // ✅ 서명 검증
        const recovered = ethers.verifyTypedData(domain, types, request, signature);
        if (recovered.toLowerCase() !== userAddress.toLowerCase()) {
            throw new Error('Signature mismatch');
        }

        // ✅ relayMetaTransaction 실행
        await this.metaService.relayMetaTransaction(
            String(forwarder),
            request,
            signature
        );

        // ✅ 출석 기록 DB 업데이트
        if (type === 'engage') {
            claim.lastClaimEngage = today;
            claim.totalClaimEngage = (claim.totalClaimEngage || 0) + 1;
        } else {
            claim.lastClaimAuction = today;
            claim.totalClaimAuction = (claim.totalClaimAuction || 0) + 1;
        }
        await this.claimRepo.save(claim);

        return { success: true };
    }
}
