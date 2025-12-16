import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { NostrLoginDto, AuthResponseDto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * Controlador de autenticación
 * Maneja endpoints de login y perfil de usuario
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Endpoint de login que recibe un evento Nostr firmado
   * @param event - Evento Nostr con firma criptográfica del usuario
   * @returns JWT y datos del usuario
   */
  @Post('login')
  @ApiOperation({
    summary: 'Login with Nostr event',
    description:
      'Authenticates a user using a signed Nostr event (NIP-01). Returns a JWT access token.',
  })
  @ApiBody({
    type: NostrLoginDto,
    description: 'Signed Nostr event acting as credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'User authenticated successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid Nostr event structure' })
  @ApiResponse({
    status: 401,
    description: 'Invalid signature or authentication failed',
  })
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
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Retrieves the profile information of the authenticated user based on the JWT token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    schema: {
      example: {
        message: 'Autenticación exitosa',
        user: { pubkey: 'npub...', userId: 'uuid' },
        timestamp: 1620000000,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT',
  })
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
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Verify JWT token validity',
    description:
      'Checks if the provided JWT token is valid and active without returning full profile data.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token is valid',
    schema: { example: { valid: true, pubkey: 'npub...' } },
  })
  @ApiResponse({ status: 401, description: 'Token is invalid or expired' })
  @HttpCode(HttpStatus.OK)
  verifyToken(@Request() req) {
    return {
      valid: true,
      pubkey: req.user.pubkey,
    };
  }
}
