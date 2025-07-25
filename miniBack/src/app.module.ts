import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PinataModule } from './pinata/pinata.module';
import { MetaModule } from './meta/meta.module';
import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';
import { AuctionModule } from './auction/auction.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidModule } from './bid/bid.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 모든 모듈에서 환경변수 사용 가능
    }),
    // ✅ TypeORM 전역 DB 연결
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule,
        ScheduleModule.forRoot(),
      ],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: +config.get<string>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // 개발 시 true도 가능, 운영에서는 false 권장
      }),
    }),

    PinataModule,
    MetaModule,
    AuthModule,
    TokenModule,
    AuctionModule,
    BidModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
