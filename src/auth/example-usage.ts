/**
 * Script de ejemplo para demostrar cómo usar el módulo de autenticación
 * Este script simula un cliente que firma un evento Nostr y lo envía al backend
 * 
 * IMPORTANTE: Este es solo un ejemplo. En producción, usa una extensión NIP-07
 * como Alby, nos2x, etc. para firmar eventos de forma segura.
 */

import { schnorr } from '@noble/curves/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';

// Ejemplo de clave privada (NUNCA uses esto en producción)
const EXAMPLE_PRIVATE_KEY = 'e7c0f7c7e8c2f7c7e8c2f7c7e8c2f7c7e8c2f7c7e8c2f7c7e8c2f7c7e8c2f7c7';

/**
 * Crea un evento Nostr firmado
 */
function createSignedEvent(privateKey: string, content: string) {
    // Derivar public key de la private key
    const publicKey = bytesToHex(schnorr.getPublicKey(privateKey));

    const event = {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content,
        pubkey: publicKey,
    };

    // Serializar el evento para el hash
    const serialized = JSON.stringify([
        0,
        event.pubkey,
        event.created_at,
        event.kind,
        event.tags,
        event.content,
    ]);

    // Calcular el ID del evento (hash SHA256)
    const hash = sha256(new TextEncoder().encode(serialized));
    const id = bytesToHex(hash);

    // Firmar el evento
    const signature = schnorr.sign(hash, privateKey);
    const sig = bytesToHex(signature);

    return {
        id,
        pubkey: publicKey,
        created_at: event.created_at,
        kind: event.kind,
        tags: event.tags,
        content: event.content,
        sig,
    };
}

/**
 * Ejemplo de uso con fetch
 */
async function exampleLogin() {
    // 1. Crear evento firmado
    const signedEvent = createSignedEvent(EXAMPLE_PRIVATE_KEY, 'Login request');

    console.log('📝 Evento firmado:', signedEvent);

    // 2. Enviar al endpoint de login
    try {
        const response = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(signedEvent),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Login exitoso:', data);

        // 3. Usar el JWT para acceder a un endpoint protegido
        const profileResponse = await fetch('http://localhost:3000/auth/profile', {
            headers: {
                'Authorization': `Bearer ${data.access_token}`,
            },
        });

        const profile = await profileResponse.json();
        console.log('👤 Perfil:', profile);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Descomentar para ejecutar
// exampleLogin();

export { createSignedEvent, exampleLogin };
