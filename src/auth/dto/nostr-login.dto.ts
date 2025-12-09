import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
} from 'class-validator';

/**
 * DTO para validar el evento Nostr firmado enviado en el login
 * Compatible con NIP-01 (Nostr Event)
 */
export class NostrLoginDto {
  @ApiProperty({ name: 'id', example: '' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ name: 'pubkey', example: '' })
  @IsNotEmpty()
  pubkey: string;

  @ApiProperty({ name: 'created_at', example: '' })
  @IsNumber()
  created_at: number;

  @ApiProperty({ name: 'kind', example: '' })
  @IsNumber()
  kind: number;

  @ApiProperty({ name: 'tags', example: '' })
  @IsArray()
  tags: string[][];

  @ApiProperty({ name: 'content', example: '' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ name: 'sig', example: '' })
  @IsString()
  @IsNotEmpty()
  sig: string;
}
