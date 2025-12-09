import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para la respuesta del endpoint de login
 */
export class AuthResponseDto {
  @ApiProperty({ name: 'access_token', example: '' })
  access_token: string;
  @ApiProperty({ name: 'pubkey', example: '' })
  pubkey: string;
  @ApiProperty({ name: 'npub', example: '' })
  npub?: string;
}
