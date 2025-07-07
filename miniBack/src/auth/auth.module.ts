import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '20m' },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule { }
