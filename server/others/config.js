const MIN_JWT_SECRET_LENGTH = 32;

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
    if (!process.env.DB_URI) {
        throw new Error('DB_URI must be set');
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
};
