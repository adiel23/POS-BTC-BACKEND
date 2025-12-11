# Integración de Frontend React Native con Autenticación Nostr

Este documento detalla los pasos para integrar una aplicación React Native con el sistema de autenticación Nostr del backend.

## 1. Prerrequisitos e Instalación

Necesitarás instalar las siguientes dependencias en tu proyecto React Native:

```bash
npm install axios nostr-tools react-native-get-random-values text-encoding
# O si usas yarn
yarn add axios nostr-tools react-native-get-random-values text-encoding
```

- `nostr-tools`: Biblioteca central para criptografía y eventos Nostr.
- `react-native-get-random-values`: Polyfill necesario para `crypto.getRandomValues`.
- `text-encoding`: Polyfill para `TextEncoder`/`TextDecoder`.

## 2. Configuración de Polyfills

En el archivo de entrada de tu aplicación (usualmente `index.js` o `App.tsx`), agrega los polyfills en la parte superior **antes de cualquier otra importación**:

```javascript
// index.js / App.tsx
import 'react-native-get-random-values';
import { TextEncoder, TextDecoder } from 'text-encoding';

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}
if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder;
}
```

## 3. Servicio de Autenticación (AuthService)

Crea un archivo `src/services/AuthService.ts` (o similar) para manejar la lógica de Nostr y las llamadas a la API.

```typescript
import axios from 'axios';
import {
  finalizeEvent,
  generateSecretKey,
  getPublicKey,
} from 'nostr-tools/pure';
import { bytesToHex, hexToBytes } from '@nostr-tools/utils';

const API_URL = 'http://TU_IP_LOCAL:3000'; // Cambia esto por la URL de tu backend

// Crear una instancia de axios configurada
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const AuthService = {
  /**
   * Inicia sesión usando una clave privada (nsec/hex)
   * @param privateKeyHex - Clave privada en formato hex
   */
  login: async (privateKeyHex: string) => {
    try {
      // 1. Obtener la clave privada en Uint8Array
      const sk = hexToBytes(privateKeyHex);

      // 2. Obtener la clave pública
      const pk = getPublicKey(sk);

      // 3. Crear el evento de autenticación
      const eventTemplate = {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: 'Login to POS-BTC',
        pubkey: pk,
      };

      // 4. Firmar el evento
      const signedEvent = finalizeEvent(eventTemplate, sk);

      // 5. Enviar al backend usando axios
      const response = await api.post('/auth/login', signedEvent);

      // Axios lanza error automáticamente si status no es 2xx,
      // así que aquí ya tenemos éxito.
      const data = response.data;

      // data.access_token es tu JWT para futuras peticiones
      // Configurar el token para futuras peticiones
      // api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;

      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        throw new Error(error.response.data.message || 'Error en el login');
      }
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Genera una nueva clave privada para usuarios nuevos (demo)
   */
  generateKeys: () => {
    const sk = generateSecretKey();
    const pk = getPublicKey(sk);
    return {
      privateKey: bytesToHex(sk),
      publicKey: pk,
    };
  },
};
```

## 4. Ejemplo de Uso en Componente

```tsx
import React, { useState } from 'react';
import { View, Button, Text, Alert } from 'react-native';
import { AuthService } from './services/AuthService';

const LoginScreen = () => {
  const [token, setToken] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      // En una app real, recuperarías la clave guardada de forma segura
      // Aquí generamos una nueva para probar el flujo inmediatamente
      const keys = AuthService.generateKeys();

      console.log('Intentando login con:', keys.publicKey);

      const result = await AuthService.login(keys.privateKey);

      setToken(result.access_token);
      Alert.alert('Éxito', `Token recibido para ${result.npub}`);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={{ padding: 20, justifyContent: 'center', flex: 1 }}>
      <Text style={{ marginBottom: 20 }}>Nostr Auth Demo</Text>
      {token ? (
        <Text>Logueado! Token: {token.slice(0, 20)}...</Text>
      ) : (
        <Button title="Login con Nostr (Generar Keys)" onPress={handleLogin} />
      )}
    </View>
  );
};

export default LoginScreen;
```

## Notas Importantes

1.  **Seguridad**: Nunca guardes claves privadas (`nsec`) en texto plano o AsyncStorage simple. Usa bibliotecas como `react-native-keychain` o `react-native-encrypted-storage`.
2.  **Red**: Asegúrate de que el dispositivo/emulador pueda alcanzar al backend.
    - Android Emulator: Usa ip `10.0.2.2` en lugar de `localhost`.
    - Dispositivo Físico: Usa la IP de tu red local (ej. `192.168.1.X`).
3.  **Relays**: Esta integración es directa con tu API (HTTP), no requiere conexión WebSocket a Relays de Nostr a menos que quieras publicar/leer eventos de la red global.
