import {
    Controller,
    Get,
    Req,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { NftService } from './nft.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

interface JwtPayload {
    address: string;
}
interface AuthedRequest extends ExpressRequest {
    user: JwtPayload;
}

@Controller('nft')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class NftController {
    constructor(private readonly nftService: NftService) { }

    /** ========== LIST ========== */
    @UseGuards(JwtAuthGuard)
    @Get('list')
    async getNFTList(@Req() req: AuthedRequest) {
        console.log('✅ getNFTList called by:', req.user.address);
        return await this.nftService.getNFTListFromChain();
    }
}