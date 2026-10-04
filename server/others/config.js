const MIN_JWT_SECRET_LENGTH = 32;

const FORBIDDEN_JWT_SECRETS = new Set([
    'REPLACE_WITH_A_LONG_RANDOM_SECRET_AT_LEAST_32_CHARS',
    'R08U5T_789324985_7897ezaoucsecret',
]);

const FORBIDDEN_ADMIN_PASSWORDS = new Set([
    'SET_A_PASSWORD_FOR_THE_USER_TO_GET_ADMIN_PRIVILEGES_PLEASE_CHANGE_IT',
]);

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (typeof secret !== 'string' || secret.trim().length < MIN_JWT_SECRET_LENGTH) {
        return null;
    }
    return secret.trim();
}

function assertConfig() {
    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
        throw new Error(
            `JWT_SECRET must be set to a string of at least ${MIN_JWT_SECRET_LENGTH} characters`
        );
    }
    if (FORBIDDEN_JWT_SECRETS.has(jwtSecret)) {
        throw new Error('JWT_SECRET must not use a known placeholder or example value');
    }
    if (!process.env.DB_URI) {
        throw new Error('DB_URI must be set');
    }

    const rawAdmin = process.env.ADMIN_PASSWORD;
    if (typeof rawAdmin === 'string' && FORBIDDEN_ADMIN_PASSWORDS.has(rawAdmin)) {
        throw new Error('ADMIN_PASSWORD must not use the example placeholder value');
    }

    return { jwtSecret };
}

const adminPassword = typeof process.env.ADMIN_PASSWORD === 'string' && process.env.ADMIN_PASSWORD.length > 0
    ? process.env.ADMIN_PASSWORD
    : null;

module.exports = {
    dbUri: process.env.DB_URI,
    port: process.env.PORT || 3000,
    clientUrl: process.env.CLIENT_URL,
    adminPassword,
    getJwtSecret,
    assertConfig,
    MIN_JWT_SECRET_LENGTH,
    FORBIDDEN_JWT_SECRETS,
    FORBIDDEN_ADMIN_PASSWORDS,
};
