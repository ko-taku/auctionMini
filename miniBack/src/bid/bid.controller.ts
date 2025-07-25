import { Body, Controller, Get, Post, Req, UseGuards, UsePipes, ValidationPipe, UnauthorizedException } from '@nestjs/common';
import { BidService } from './bid.service';
import { RelayRequestDto } from './dto/relay-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

interface JwtPayload {
    address: string;
}
interface AuthedRequest extends ExpressRequest {
    user: JwtPayload;
}


@Controller('bid')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class BidController {
    constructor(private readonly bidService: BidService) { }

    /** ========== RESERVE ========== */
    @UseGuards(JwtAuthGuard)
    @Post('reserve')
    async reserve(@Req() req: AuthedRequest, @Body() body: { forwarder: string }) {
        console.log('✅ reserve called with body:', body, 'user:', req.user.address);
        return this.bidService.reserveNonce(body.forwarder, req.user.address);
    }

    /** ========== RELAY ========== */
    @UseGuards(JwtAuthGuard)
    @Post('relay')
    async relay(
        @Req() req: AuthedRequest,
        @Body() relayDto: RelayRequestDto
    ) {
        if (req.user.address.toLowerCase() !== relayDto.request.from.toLowerCase()) {
            throw new UnauthorizedException('JWT address does not match request.from');
        }

        return await this.bidService.relay(relayDto.forwarder, relayDto.request, relayDto.signature);
    }

    /** ========== LIST ========== */
    @UseGuards(JwtAuthGuard)
    @Get('mybidlist')
    async getMyBidList(@Req() req: AuthedRequest) {
        const user = req.user.address;
        return this.bidService.getUserBidsList(user);
    }
}
