import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

/**
 * Tests unitarios para el servicio de autenticación
 */
describe('AuthService', () => {
    let service: AuthService;
    let jwtService: JwtService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn().mockReturnValue('mock-jwt-token'),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateJwtPayload', () => {
        it('should return user data for valid payload', async () => {
            const payload = {
                pubkey: '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
                sub: '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
            };

            const result = await service.validateJwtPayload(payload);

            expect(result).toEqual({
                pubkey: payload.pubkey,
                sub: payload.sub,
            });
        });

        it('should throw UnauthorizedException if pubkey is missing', async () => {
            const payload = { sub: 'some-id' };

            await expect(service.validateJwtPayload(payload)).rejects.toThrow(
                UnauthorizedException,
            );
        });
    });
});
