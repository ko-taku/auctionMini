import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PinataModule } from './pinata/pinata.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 모든 모듈에서 환경변수 사용 가능
    }),
    PinataModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
