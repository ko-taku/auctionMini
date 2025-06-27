import { Module } from '@nestjs/common';
import { PinataService } from './pinata.service';
import { PinataController } from './pinata.controller';
import { ConfigModule } from '@nestjs/config';
import { EthersProvider } from './ethers.provider';

@Module({
  imports: [ConfigModule],
  providers: [PinataService, EthersProvider],
  controllers: [PinataController],
})
export class PinataModule { }
