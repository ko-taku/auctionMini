import { Body, Controller, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TokenService } from './token.service';
import { Request as ExpressRequest } from 'express';
import { RelayRequestDto } from './dto/relay-request.dto';

interface JwtPayload {
    address: string;
}
interface AuthedRequest extends ExpressRequest {
    user: JwtPayload;
}

//whitelist: true → DTO 클래스에 데코레이터 붙은 속성만 허용
//forbidNonWhitelisted: true → DTO 클래스에 정의 안된 속성 → 요청 거부 400
@Controller('claim')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class TokenController {
    constructor(private readonly tokenService: TokenService) { }

    /** ========== ENGAGE ========== */
    @UseGuards(JwtAuthGuard)
    @Post('engage/reserve')
    async reserveEngage(@Req() req: AuthedRequest) {
        return this.tokenService.reserve('engage', req.user.address);
    }

    @UseGuards(JwtAuthGuard)
    @Post('engage/relay')
    async relayEngage(
        @Req() req: AuthedRequest,
        @Body() body: RelayRequestDto
    ) {
        return this.tokenService.relay('engage', req.user.address, body);
    }

    /** ========== AUCTION ========== */
    @UseGuards(JwtAuthGuard)
    @Post('auction/reserve')
    async reserveAuction(@Req() req: AuthedRequest) {
        return this.tokenService.reserve('auction', req.user.address);
    }

    @UseGuards(JwtAuthGuard)
    @Post('auction/relay')
    async relayAuction(
        @Req() req: AuthedRequest,
        @Body() body: RelayRequestDto
    ) {
        return this.tokenService.relay('auction', req.user.address, body);
    }
}
