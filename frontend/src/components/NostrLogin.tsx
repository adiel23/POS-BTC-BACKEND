import React, { useState, useEffect } from 'react';

/**
 * Interfaz TypeScript para window.nostr (NIP-07)
 * Define los métodos disponibles en extensiones como Alby, nos2x, etc.
 */
interface NostrWindow extends Window {
    nostr?: {
        getPublicKey(): Promise<string>;
        signEvent(event: UnsignedEvent): Promise<SignedEvent>;
    };
}

/**
 * Evento Nostr sin firmar
 */
interface UnsignedEvent {
    kind: number;
    created_at: number;
    tags: string[][];
    content: string;
}

/**
 * Evento Nostr firmado (compatible con NIP-01)
 */
interface SignedEvent extends UnsignedEvent {
    id: string;
    pubkey: string;
    sig: string;
}

/**
 * Respuesta del endpoint /auth/login
 */
interface AuthResponse {
    access_token: string;
    pubkey: string;
    npub?: string;
}

/**
 * Componente de autenticación Nostr
 * Permite login usando firma criptográfica (NIP-07)
 */
const NostrLogin: React.FC = () => {
    const [hasNostrExtension, setHasNostrExtension] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [publicKey, setPublicKey] = useState<string>('');
    const [accessToken, setAccessToken] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [profileData, setProfileData] = useState<any>(null);

    const API_BASE_URL = 'http://localhost:3000';

    /**
     * Detectar si la extensión NIP-07 está disponible
     */
    useEffect(() => {
        const checkNostrExtension = () => {
            const nostrWindow = window as NostrWindow;
            if (nostrWindow.nostr) {
                setHasNostrExtension(true);
            } else {
                setHasNostrExtension(false);
            }
        };

        checkNostrExtension();

        // Verificar si ya hay sesión guardada
        const savedToken = localStorage.getItem('nostr_jwt');
        const savedPubkey = localStorage.getItem('nostr_pubkey');

        if (savedToken && savedPubkey) {
            setAccessToken(savedToken);
            setPublicKey(savedPubkey);
            setIsLoggedIn(true);
        }
    }, []);

    /**
     * Abreviar public key para mostrar
     */
    const abbreviateKey = (key: string): string => {
        if (!key) return '';
        return `${key.slice(0, 8)}...${key.slice(-8)}`;
    };

    /**
     * Manejar el login con Nostr
     */
    const handleLogin = async () => {
        setLoading(true);
        setError('');

        try {
            const nostrWindow = window as NostrWindow;

            if (!nostrWindow.nostr) {
                throw new Error('Extensión Nostr no encontrada');
            }

            // 1. Obtener public key del usuario
            const pubkey = await nostrWindow.nostr.getPublicKey();
            console.log('Public key obtenida:', pubkey);

            // 2. Crear evento sin firmar
            const unsignedEvent: UnsignedEvent = {
                kind: 22242, // Kind para auth (NIP-42 style)
                created_at: Math.floor(Date.now() / 1000),
                tags: [],
                content: 'Auth request',
            };

            console.log('Evento sin firmar:', unsignedEvent);

            // 3. Solicitar firma del evento a la extensión
            const signedEvent = await nostrWindow.nostr.signEvent(unsignedEvent);
            console.log('Evento firmado:', signedEvent);

            // 4. Enviar evento firmado al backend
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signedEvent),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error en la autenticación');
            }

            const data: AuthResponse = await response.json();
            console.log('Respuesta del servidor:', data);

            // 5. Guardar token y public key
            localStorage.setItem('nostr_jwt', data.access_token);
            localStorage.setItem('nostr_pubkey', data.pubkey);

            setAccessToken(data.access_token);
            setPublicKey(data.pubkey);
            setIsLoggedIn(true);

            console.log('✅ Login exitoso!');
        } catch (err: any) {
            console.error('Error durante login:', err);
            setError(err.message || 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Probar endpoint protegido /auth/profile
     */
    const handleTestProtectedEndpoint = async () => {
        setLoading(true);
        setError('');
        setProfileData(null);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Datos del perfil:', data);
            setProfileData(data);
        } catch (err: any) {
            console.error('Error al obtener perfil:', err);
            setError(err.message || 'Error al acceder al endpoint protegido');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Cerrar sesión
     */
    const handleLogout = () => {
        localStorage.removeItem('nostr_jwt');
        localStorage.removeItem('nostr_pubkey');
        setAccessToken('');
        setPublicKey('');
        setIsLoggedIn(false);
        setProfileData(null);
        setError('');
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>🔐 Autenticación Nostr</h1>
                <p style={styles.subtitle}>Prueba del sistema de autenticación con firma criptográfica</p>

                {/* Estado de la extensión */}
                <div style={styles.section}>
                    <div style={styles.statusBadge}>
                        {hasNostrExtension ? (
                            <span style={styles.successText}>✅ Extensión NIP-07 detectada</span>
                        ) : (
                            <span style={styles.errorText}>
                                ❌ Por favor instala una extensión de Nostr (ej. <a href="https://getalby.com/" target="_blank" rel="noopener noreferrer">Alby</a>)
                            </span>
                        )}
                    </div>
                </div>

                {/* Login / Estado de sesión */}
                {!isLoggedIn ? (
                    <div style={styles.section}>
                        <button
                            onClick={handleLogin}
                            disabled={!hasNostrExtension || loading}
                            style={{
                                ...styles.button,
                                ...((!hasNostrExtension || loading) ? styles.buttonDisabled : {}),
                            }}
                        >
                            {loading ? '⏳ Firmando...' : '🔑 Iniciar Sesión con Nostr'}
                        </button>
                    </div>
                ) : (
                    <div style={styles.section}>
                        <div style={styles.userInfo}>
                            <p style={styles.label}>👤 Logueado como:</p>
                            <code style={styles.code}>{abbreviateKey(publicKey)}</code>
                            <p style={styles.labelSmall}>Public Key completa:</p>
                            <code style={styles.codeSmall}>{publicKey}</code>
                        </div>

                        {/* Botones de acción */}
                        <div style={styles.buttonGroup}>
                            <button
                                onClick={handleTestProtectedEndpoint}
                                disabled={loading}
                                style={styles.button}
                            >
                                {loading ? '⏳ Cargando...' : '🔒 Probar AuthGuard'}
                            </button>

                            <button
                                onClick={handleLogout}
                                style={styles.buttonSecondary}
                            >
                                🚪 Cerrar Sesión
                            </button>
                        </div>
                    </div>
                )}

                {/* Mensajes de error */}
                {error && (
                    <div style={styles.errorBox}>
                        <strong>❌ Error:</strong> {error}
                    </div>
                )}

                {/* Respuesta del endpoint protegido */}
                {profileData && (
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>📋 Respuesta de /auth/profile</h3>
                        <pre style={styles.jsonOutput}>
                            {JSON.stringify(profileData, null, 2)}
                        </pre>
                    </div>
                )}

                {/* Información adicional */}
                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        💡 <strong>Cómo funciona:</strong>
                    </p>
                    <ol style={styles.instructionsList}>
                        <li>La extensión firma un evento Nostr (Kind 22242)</li>
                        <li>El evento se envía a <code>POST /auth/login</code></li>
                        <li>El backend verifica la firma criptográfica</li>
                        <li>Si es válida, retorna un JWT</li>
                        <li>El JWT se usa para acceder a endpoints protegidos</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

/**
 * Estilos inline del componente
 */
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    card: {
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
        color: '#f1f5f9',
    },
    title: {
        fontSize: '32px',
        fontWeight: '700',
        marginBottom: '8px',
        color: '#f1f5f9',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: '16px',
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: '30px',
    },
    section: {
        marginBottom: '24px',
    },
    statusBadge: {
        padding: '12px 16px',
        borderRadius: '8px',
        backgroundColor: '#334155',
        textAlign: 'center',
    },
    successText: {
        color: '#4ade80',
        fontWeight: '600',
    },
    errorText: {
        color: '#f87171',
        fontWeight: '600',
    },
    button: {
        width: '100%',
        padding: '14px 24px',
        fontSize: '16px',
        fontWeight: '600',
        color: '#ffffff',
        backgroundColor: '#8b5cf6',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        marginBottom: '12px',
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    buttonSecondary: {
        width: '100%',
        padding: '14px 24px',
        fontSize: '16px',
        fontWeight: '600',
        color: '#f1f5f9',
        backgroundColor: '#475569',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    buttonGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    userInfo: {
        backgroundColor: '#334155',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
    },
    label: {
        fontSize: '14px',
        color: '#94a3b8',
        marginBottom: '8px',
        fontWeight: '600',
    },
    labelSmall: {
        fontSize: '12px',
        color: '#64748b',
        marginTop: '12px',
        marginBottom: '4px',
    },
    code: {
        display: 'block',
        backgroundColor: '#1e293b',
        padding: '12px',
        borderRadius: '6px',
        fontSize: '18px',
        fontFamily: 'monospace',
        color: '#a78bfa',
        wordBreak: 'break-all',
    },
    codeSmall: {
        display: 'block',
        backgroundColor: '#1e293b',
        padding: '8px',
        borderRadius: '6px',
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#94a3b8',
        wordBreak: 'break-all',
    },
    errorBox: {
        backgroundColor: '#7f1d1d',
        color: '#fecaca',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #991b1b',
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#f1f5f9',
        marginBottom: '12px',
    },
    jsonOutput: {
        backgroundColor: '#0f172a',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '13px',
        fontFamily: 'monospace',
        color: '#4ade80',
        overflow: 'auto',
        maxHeight: '300px',
        border: '1px solid #334155',
    },
    footer: {
        marginTop: '32px',
        paddingTop: '24px',
        borderTop: '1px solid #334155',
    },
    footerText: {
        fontSize: '14px',
        color: '#94a3b8',
        marginBottom: '12px',
    },
    instructionsList: {
        fontSize: '13px',
        color: '#cbd5e1',
        lineHeight: '1.8',
        paddingLeft: '20px',
    },
};

export default NostrLogin;
