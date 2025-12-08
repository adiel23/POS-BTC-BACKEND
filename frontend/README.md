# Nostr Auth Frontend

Interfaz de demostración para probar autenticación Nostr con el backend.

## Instalación

```bash
cd frontend
npm install
```

## Uso

1. **Iniciar el backend:**
   ```bash
   cd ..
   npm run start:dev
   ```

2. **Iniciar el frontend (en otra terminal):**
   ```bash
   cd frontend
   npm start
   ```

3. **Abrir en navegador:**
   - La aplicación se abrirá en `http://localhost:3000`
   - Asegúrate de tener instalada una extensión Nostr como [Alby](https://getalby.com/)

## Características

- ✅ Detección automática de extensiones NIP-07
- ✅ Firma de eventos con clave privada del usuario
- ✅ Autenticación con backend via JWT
- ✅ Prueba de endpoints protegidos
- ✅ Manejo de sesión con localStorage
- 🎨 UI moderna con estilos dark theme

## Tecnologías

- React 18
- TypeScript
- Nostr (NIP-07)
