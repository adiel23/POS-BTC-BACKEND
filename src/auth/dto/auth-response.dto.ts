/**
 * DTO para la respuesta del endpoint de login
 */
export class AuthResponseDto {
    access_token: string;
    pubkey: string;
    npub?: string;
}
