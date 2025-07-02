import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import ForwarderAbi from '../abis/MinimalForwarder.json';
import { EthersProvider } from './ethers.provider';

@Injectable()
export class MetaService {
    // ✅ 메모리 기반 nonce 예약
    private reservations: Record<string, Record<string, number>> = {};

    constructor(
        private readonly ethersProvider: EthersProvider,
    ) { }

    /**
     * 예약용 nonce 제공
     */
    async reserveNonce(forwarderAddress: string, userAddress: string): Promise<number> {
        const forwarder = new ethers.Contract(
            forwarderAddress,
            ForwarderAbi,
            this.ethersProvider.provider
        );

        const onChainNonce = await forwarder.nonces(userAddress);
        const nonce = Number(onChainNonce);

        // 서버 예약
        if (!this.reservations[userAddress]) {
            this.reservations[userAddress] = {};
        }
        this.reservations[userAddress][forwarderAddress] = nonce;

        console.log(`✅ Reserved nonce=${nonce} for user=${userAddress} on forwarder=${forwarderAddress}`);
        return nonce;
    }

    /**
     * 단순 Forwarder의 현재 on-chain nonce 읽기 (디버그용)
     */
    async getOnChainNonce(forwarderAddress: string, userAddress: string): Promise<number> {
        const forwarder = new ethers.Contract(
            forwarderAddress,
            ForwarderAbi,
            this.ethersProvider.provider
        );

        const nonce = await forwarder.nonces(userAddress);
        return nonce.toNumber();
    }

    /**
     * relay 처리
     */
    async relayMetaTransaction(
        forwarderAddress: string,
        request: any,
        signature: string,
    ): Promise<any> {
        // 1️⃣ 서버 예약 확인
        const reservedNonce = this.reservations?.[request.from]?.[forwarderAddress];
        if (reservedNonce === undefined) {
            throw new Error(`❌ No reserved nonce for user=${request.from} on forwarder=${forwarderAddress}`);
        }
        if (Number(request.nonce) !== reservedNonce) {
            throw new Error(`❌ Invalid nonce. Expected reserved=${reservedNonce}, got=${request.nonce}`);
        }

        console.log(`✅ Nonce check passed for user=${request.from}: ${reservedNonce}`);

        // 2️⃣ Forwarder 컨트랙트
        const forwarder = new ethers.Contract(
            forwarderAddress,
            ForwarderAbi,
            this.ethersProvider.wallet,
        );

        // 3️⃣ verify
        const isValid = await forwarder.verify({ ...request, signature });
        if (!isValid) {
            throw new Error('❌ Invalid signature');
        }

        console.log('✅ Signature verified.');

        // 4️⃣ execute
        const tx = await forwarder.execute({ ...request, signature }, {
            gasLimit: 500_000,
        });

        console.log(`✅ Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`✅ Transaction mined: ${receipt.hash}`);

        const txHash = receipt?.hash || receipt?.transactionHash || 'UNKNOWN';
        //ethersV6은 hash, V5는 transactionHash, 둘 다 없으면 UNKNOWN
        // 5️⃣ 예약 해제
        delete this.reservations[request.from][forwarderAddress];

        return {
            txHash,
            status: receipt.status ?? null,
        };
    }
}
