import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) { }

    async login(address: string, signature: string): Promise<string> {
        const message = "로그인을 위해 서명해주세요.";

        let recovered: string;
        try {
            recovered = ethers.verifyMessage(message, signature);
        } catch {
            throw new UnauthorizedException('Invalid signature');
        }

        if (recovered.toLowerCase() !== address.toLowerCase()) {
            throw new UnauthorizedException('Invalid signature');
        }

        // 검증 성공 → JWT 발급
        return this.jwtService.sign({ address });
    }

    async verifyToken(token: string) {
        try {
            return this.jwtService.verify(token);
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
