import { Controller, Post, Get, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { NostrLoginDto, AuthResponseDto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * Controlador de autenticación
 * Maneja endpoints de login y perfil de usuario
 */
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * POST /auth/login
     * Endpoint de login que recibe un evento Nostr firmado
     * @param event - Evento Nostr con firma criptográfica del usuario
     * @returns JWT y datos del usuario
     */
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() event: NostrLoginDto): Promise<AuthResponseDto> {
        return this.authService.validateNostrEvent(event);
    }

    /**
     * GET /auth/profile
     * Endpoint protegido que retorna la información del usuario autenticado
     * Requiere JWT válido en el header Authorization
     * @param req - Request con el usuario inyectado por el guard
     * @returns Información del perfil del usuario
     */
    @Get('profile')
    @UseGuards(JwtAuthGuard)
    getProfile(@Request() req) {
        return {
            message: 'Autenticación exitosa',
            user: req.user,
            timestamp: Math.floor(Date.now() / 1000),
        };
    }

    /**
     * POST /auth/verify
     * Endpoint para verificar si un token es válido sin necesidad de hacer una petición completa
     */
    @Post('verify')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    verifyToken(@Request() req) {
        return {
            valid: true,
            pubkey: req.user.pubkey,
        };
    }
}
