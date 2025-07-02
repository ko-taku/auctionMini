import {
    Controller,
    Get,
    Post,
    Body,
    Query,
} from '@nestjs/common';
import { MetaService } from './meta.service';

@Controller('meta')
export class MetaController {
    constructor(private readonly metaService: MetaService) { }

    /**
     * ✅ 예약 nonce 받아오기
     * POST /meta/nonce/reserve
     */
    @Post('nonce/reserve')
    async reserveNonce(
        @Body('forwarder') forwarderAddress: string,
        @Body('user') userAddress: string,
    ) {
        const nonce = await this.metaService.reserveNonce(forwarderAddress, userAddress);
        return { nonce };
    }

    /**
     * ✅ 단순 on-chain nonce 확인
     * GET /meta/nonce/current
     */
    @Get('nonce/current')
    async getOnChainNonce(
        @Query('forwarder') forwarderAddress: string,
        @Query('user') userAddress: string,
    ) {
        const nonce = await this.metaService.getOnChainNonce(forwarderAddress, userAddress);
        return { nonce };
    }

    /**
     * ✅ relay
     * POST /meta/relay
     */
    @Post('relay')
    async relayMetaTransaction(
        @Body() body,
    ) {
        const { forwarder, request, signature } = body;
        return await this.metaService.relayMetaTransaction(forwarder, request, signature);
    }
}
