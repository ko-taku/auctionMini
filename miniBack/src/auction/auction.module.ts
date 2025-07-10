import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EthersProvider } from './ethers.provider';
import { MetaModule } from '../meta/meta.module';
import { AuctionController } from './auction.controller';
import { AuctionService } from './auction.service';
import { Auction } from './auction.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Auction]),
        // ✅ MetaModule을 import해서 relay 기능 재사용
        MetaModule,
    ],
    controllers: [AuctionController],
    providers: [
        AuctionService,
        EthersProvider, // EthersProvider가 따로 필요하면 여기도 추가
    ],
})
export class AuctionModule { }
