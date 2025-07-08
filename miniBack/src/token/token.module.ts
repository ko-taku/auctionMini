// src/token/token.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { TokenController } from './token.controller';
import { TokenService } from './token.service';

import { Claim } from '../claim/claim.entity';
import { MetaModule } from '../meta/meta.module';
import { EthersProvider } from './ethers.provider';

@Module({
    imports: [
        // ✅ TypeORM으로 Claim Entity 주입
        TypeOrmModule.forFeature([Claim]),

        // ✅ MetaModule을 import해서 relay 기능 재사용
        MetaModule,
    ],
    controllers: [TokenController],
    providers: [
        TokenService,
        EthersProvider, // EthersProvider가 따로 필요하면 여기도 추가
    ],
})
export class TokenModule { }
