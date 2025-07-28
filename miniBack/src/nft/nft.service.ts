import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import NFT_ABI from '../abis/UserMintedNFT.json';

@Injectable()
export class NftService {
    private readonly logger = new Logger(NftService.name);
    private readonly provider: ethers.JsonRpcProvider;
    private readonly nftContract: ethers.Contract;

    constructor(private readonly configService: ConfigService) {
        const rpcUrl = this.configService.get<string>('RPC_URL');

        this.logger.log(`📡 RPC URL 설정값: ${rpcUrl}`);

        // ✅ provider 생성 및 연결 확인
        try {
            this.provider = new ethers.JsonRpcProvider(rpcUrl);
            this.logger.log(`🚀 provider 객체 생성됨, 네트워크 감지 중...`);

            // 🔍 즉시 연결 테스트 (네트워크 감지)
            this.provider.getNetwork().then((network) => {
                this.logger.log(`✅ 연결된 네트워크: chainId=${network.chainId}, name=${network.name}`);
            }).catch((err) => {
                this.logger.error("❌ getNetwork() 실패", err);
            });
        } catch (err) {
            this.logger.error("❌ provider 생성 중 예외 발생", err);
            throw err;
        }

        // ✅ NFT 컨트랙트 인스턴스
        this.nftContract = new ethers.Contract(
            this.configService.get('NFT_CONTRACT_ADDRESS'),
            NFT_ABI.abi,
            this.provider
        );
    }

    async getNFTListFromChain() {
        this.logger.log('📦 getNFTListFromChain 시작');

        try {
            const filter = this.nftContract.filters.Minted();
            const events = await this.nftContract.queryFilter(filter);
            this.logger.log(`🔍 Minted 이벤트 ${events.length}건 조회됨`);

            const blockCache: Record<number, number> = {};
            const results = [];

            for (const event of events) {
                if (!("args" in event) || !event.args) continue;

                const { tokenId, minter, uri } = event.args;
                const blockNumber = event.blockNumber;

                let timestamp = blockCache[blockNumber];
                if (!timestamp) {
                    const block = await this.provider.getBlock(blockNumber);
                    if (!block) {
                        this.logger.warn(`❗ 블록 ${blockNumber} 조회 실패`);
                        continue;
                    }
                    timestamp = block.timestamp;
                    blockCache[blockNumber] = timestamp;
                }

                let owner: string;
                try {
                    owner = await this.nftContract.ownerOf(tokenId);
                } catch (err) {
                    this.logger.warn(`⚠️ tokenId=${tokenId}의 ownerOf 조회 실패: ${err}`);
                    continue;
                }

                let metadata: any = {};
                try {
                    const response = await fetch(uri);
                    metadata = await response.json();
                } catch (err) {
                    this.logger.warn(`⚠️ 메타데이터 fetch 실패: ${uri}`);
                }

                results.push({
                    tokenId: tokenId.toString(),
                    minter,
                    mintedAtRaw: timestamp,
                    mintedAt: new Date(timestamp * 1000).toLocaleString('ko-KR'),
                    owner,
                    metadata,
                });
            }

            this.logger.log(`✅ NFT ${results.length}건 반환`);
            return results.sort((a, b) => b.mintedAtRaw - a.mintedAtRaw);
        } catch (error) {
            this.logger.error('❌ NFT 목록 조회 실패', error);
            throw error;
        }
    }
}
