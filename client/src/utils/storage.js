const PREFIX = 'buzzerapp_';

export const STORAGE_KEYS = {
    token: `${PREFIX}token`,
    userName: `${PREFIX}userName`,
    userId: `${PREFIX}userId`,
};

const LEGACY_KEYS = {
    [STORAGE_KEYS.token]: 'token',
    [STORAGE_KEYS.userName]: 'userName',
    [STORAGE_KEYS.userId]: 'userId',
};

function migrateLegacyKey(key) {
    const legacyKey = LEGACY_KEYS[key];
    if (!legacyKey) {
        return null;
    }

    const legacyValue = localStorage.getItem(legacyKey);
    if (legacyValue == null) {
        return null;
    }

    localStorage.setItem(key, legacyValue);
    localStorage.removeItem(legacyKey);
    return legacyValue;
}

export function getStorageItem(key) {
    const value = localStorage.getItem(key);
    if (value != null) {
        return value;
    }
    return migrateLegacyKey(key);
}

export function setStorageItem(key, value) {
    localStorage.setItem(key, value);
    const legacyKey = LEGACY_KEYS[key];
    if (legacyKey) {
        localStorage.removeItem(legacyKey);
    }
}

export function removeStorageItem(key) {
    localStorage.removeItem(key);
    const legacyKey = LEGACY_KEYS[key];
    if (legacyKey) {
        localStorage.removeItem(legacyKey);
    }
}

export function clearAuthStorage() {
    removeStorageItem(STORAGE_KEYS.token);
    removeStorageItem(STORAGE_KEYS.userName);
    removeStorageItem(STORAGE_KEYS.userId);
}
