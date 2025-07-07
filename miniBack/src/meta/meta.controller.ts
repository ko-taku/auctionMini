import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    Req,
    UseGuards,
    UnauthorizedException,
} from '@nestjs/common';
import { MetaService } from './meta.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

interface JwtPayload {
    address: string;
}

interface AuthedRequest extends ExpressRequest {
    user: JwtPayload;
}

@Controller('meta')
export class MetaController {
    constructor(private readonly metaService: MetaService) { }

    /**
     * ✅ 예약 nonce 받아오기
     * POST /meta/nonce/reserve
     */
    @UseGuards(JwtAuthGuard)
    @Post('nonce/reserve')
    async reserveNonce(
        @Req() req: AuthedRequest,
        @Body('forwarder') forwarderAddress: string,
        @Body('user') userAddress: string,
    ) {
        if (req.user.address.toLowerCase() !== userAddress.toLowerCase()) {
            throw new UnauthorizedException('주소가 JWT와 일치하지 않습니다');
        }

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
    @UseGuards(JwtAuthGuard)
    @Post('relay')
    async relayMetaTransaction(
        @Req() req: AuthedRequest,
        @Body() body,
    ) {
        const { forwarder, request, signature } = body;

        if (req.user.address.toLowerCase() !== body.request.from.toLowerCase()) {
            throw new UnauthorizedException('주소 불일치');
        }

        return await this.metaService.relayMetaTransaction(forwarder, request, signature);
    }
}
