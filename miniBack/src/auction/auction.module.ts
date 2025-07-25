import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EthersProvider } from './ethers.provider';
import { MetaModule } from '../meta/meta.module';
import { AuctionController } from './auction.controller';
import { AuctionService } from './auction.service';
import { BidModule } from '../bid/bid.module';
import { Auction } from './auction.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Auction]),
        // ✅ MetaModule을 import해서 relay 기능 재사용
        MetaModule,
        forwardRef(() => BidModule), // 👈 의존성 순환 방지
    ],
    controllers: [AuctionController],
    providers: [
        AuctionService,
        EthersProvider, // EthersProvider가 따로 필요하면 여기도 추가
    ],
    exports: [AuctionService], // 👈 다른 모듈에서 사용할 수도 있으면
})
export class AuctionModule { }
