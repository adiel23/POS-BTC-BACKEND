import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verifyEvent } from 'nostr-tools/pure';
import { nip19 } from 'nostr-tools';
import { NostrLoginDto, AuthResponseDto } from './dto';

/**
 * Servicio de autenticación basado en Nostr
 * Valida eventos firmados y genera JWT
 */
@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(private jwtService: JwtService) { }

    /**
     * Valida un evento Nostr firmado y genera un JWT
     * @param event - Evento Nostr que contiene la firma criptográfica
     * @returns Token JWT con la información del usuario
     */
    async validateNostrEvent(event: NostrLoginDto): Promise<AuthResponseDto> {
        try {
            // Verificar la firma criptográfica del evento usando nostr-tools
            const isValid = verifyEvent(event);

            if (!isValid) {
                this.logger.warn(`Intento de login fallido: firma inválida para pubkey ${event.pubkey}`);
                throw new UnauthorizedException('Firma del evento Nostr inválida');
            }

            // Verificar que el evento no sea muy antiguo (5 minutos)
            const eventAge = Date.now() / 1000 - event.created_at;
            if (eventAge > 300) {
                this.logger.warn(`Evento expirado: ${eventAge} segundos de antigüedad`);
                throw new UnauthorizedException('El evento ha expirado. Por favor, genera un nuevo evento.');
            }

            // Verificar que el evento no sea del futuro
            if (event.created_at > Date.now() / 1000 + 60) {
                throw new UnauthorizedException('El evento es del futuro');
            }

            this.logger.log(`Usuario autenticado exitosamente: ${event.pubkey}`);

            // Generar JWT con la pubkey como subject
            const payload = {
                sub: event.pubkey,
                pubkey: event.pubkey,
                iat: Math.floor(Date.now() / 1000),
            };

            const access_token = this.jwtService.sign(payload);

            // Convertir pubkey a npub (formato bech32)
            let npub: string | undefined;
            try {
                npub = nip19.npubEncode(event.pubkey);
            } catch (error) {
                this.logger.warn(`No se pudo convertir pubkey a npub: ${error.message}`);
            }

            return {
                access_token,
                pubkey: event.pubkey,
                npub,
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            this.logger.error(`Error validando evento Nostr: ${error.message}`, error.stack);
            throw new UnauthorizedException('Error al validar el evento Nostr');
        }
    }

    /**
     * Valida el payload del JWT
     * @param payload - Payload decodificado del JWT
     * @returns Datos del usuario
     */
    async validateJwtPayload(payload: any) {
        if (!payload.pubkey) {
            throw new UnauthorizedException('Token inválido: falta pubkey');
        }

        return {
            pubkey: payload.pubkey,
            sub: payload.sub,
        };
    }
}
