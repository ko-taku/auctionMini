import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EthersProvider } from './ethers.provider';
import { MetaModule } from '../meta/meta.module';
import { BidController } from './bid.controller';
import { BidService } from './bid.service';
import { BidState } from './bidState.entity';
import { BidUser } from './bidUser.entity';
import { AuctionModule } from '../auction/auction.module'; // ✅

@Module({
    imports: [
        TypeOrmModule.forFeature([BidState, BidUser]),
        // ✅ MetaModule을 import해서 relay 기능 재사용
        MetaModule,
        forwardRef(() => AuctionModule), // ✅
    ],
    controllers: [BidController],
    providers: [
        BidService,
        EthersProvider, // EthersProvider가 따로 필요하면 여기도 추가
    ],
    exports: [BidService], // ✅ export 꼭 해줘야 다른 모듈에서 사용 가능
})
export class BidModule { }
