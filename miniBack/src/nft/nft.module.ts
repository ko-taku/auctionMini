import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EthersProvider } from './ethers.provider';
import { MetaModule } from '../meta/meta.module';
import { NftController } from './nft.controller';
import { NftService } from './nft.service';
import { BidModule } from '../bid/bid.module';

@Module({
    imports: [
        MetaModule,
        forwardRef(() => BidModule), // 👈 의존성 순환 방지
    ],
    controllers: [NftController],
    providers: [
        NftService,
        EthersProvider, // EthersProvider가 따로 필요하면 여기도 추가
    ],
    exports: [NftService], // 👈 다른 모듈에서 사용할 수도 있으면
})
export class NftModule { }
