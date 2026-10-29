import config from '../config.js';
import { STORAGE_KEYS, getStorageItem, persistAuthTokens } from './storage.js';

export async function refreshAccessToken() {
    const refreshToken = getStorageItem(STORAGE_KEYS.refreshToken);
    if (!refreshToken) {
        return null;
    }

    const response = await fetch(`${config.serverUrl}/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.success || !data.token) {
        return null;
    }

    persistAuthTokens({
        token: data.token,
        refreshToken: data.refreshToken,
    });

    return data.token;
}

export async function authenticateWithStoredToken() {
    let token = getStorageItem(STORAGE_KEYS.token);
    if (!token) {
        return { ok: false, reason: 'noToken' };
    }

    const tryAuthenticate = async (accessToken) => {
        const response = await fetch(`${config.serverUrl}/authenticate`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await response.json().catch(() => null);
        return { response, data };
    };

    let { response, data } = await tryAuthenticate(token);

    if ((!response.ok || !data?.success) && response.status === 403 && data?.message === 'Token invalide.') {
        const refreshedToken = await refreshAccessToken();
        if (!refreshedToken) {
            return {
                ok: false,
                reason: 'authError',
                message: data?.message || 'Token invalide.',
            };
        }

        token = refreshedToken;
        ({ response, data } = await tryAuthenticate(token));
    }

    if (!response.ok || !data?.success) {
        return {
            ok: false,
            reason: data?.message === 'Utilisateur introuvable.' ? 'userMissing' : 'authError',
            message: data?.message || 'Erreur d\'authentification.',
        };
    }

    persistAuthTokens({
        token: data.token || token,
        refreshToken: data.refreshToken,
    });

    return {
        ok: true,
        token: getStorageItem(STORAGE_KEYS.token) || token,
        user: data,
    };
}
