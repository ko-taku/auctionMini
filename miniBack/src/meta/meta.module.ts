import { Module } from '@nestjs/common';
import { MetaService } from './meta.service';
import { MetaController } from './meta.controller';
import { ConfigModule } from '@nestjs/config';
import { EthersProvider } from './ethers.provider';

@Module({
    imports: [ConfigModule],
    providers: [MetaService, EthersProvider],
    controllers: [MetaController],
})
export class MetaModule { }
