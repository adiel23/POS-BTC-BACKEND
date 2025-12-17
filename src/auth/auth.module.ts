import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { MerchantsModule } from 'src/merchants/merchants.module';

/**
 * Módulo de autenticación basado en Nostr
 * Proporciona validación de eventos firmados y generación de JWT
 */
@Module({
    imports: [
        ConfigModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'your-super-secret-key-change-this-in-production',
                signOptions: {
                    expiresIn: '24h',
                },
            }),
        }),
        MerchantsModule
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule { }
