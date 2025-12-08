import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

/**
 * DTO para validar el evento Nostr firmado enviado en el login
 * Compatible con NIP-01 (Nostr Event)
 */
export class NostrLoginDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    pubkey: string;

    @IsNumber()
    created_at: number;

    @IsNumber()
    kind: number;

    @IsArray()
    tags: string[][];

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsNotEmpty()
    sig: string;
}
