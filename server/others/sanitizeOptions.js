function sanitizeOptions(options = {}) {
    return {
        autoRestartAfterDecline: options.autoRestartAfterDecline ?? true,
        answerPoint: Math.min(100, Math.max(1, Number(options.answerPoint) || 1)),
        winPoint: Math.min(1000, Math.max(1, Number(options.winPoint) || 10)),
        deductPointOnWrongAnswer: Boolean(options.deductPointOnWrongAnswer),
        isPublic: Boolean(options.isPublic),
    };
}

function isAdminRegistration(userPassword, adminPassword) {
    return Boolean(
        adminPassword
        && typeof userPassword === 'string'
        && userPassword.length > 0
        && userPassword === adminPassword
    );
}

function normalizeUserName(userName, { min = 1, max = 32 } = {}) {
    if (typeof userName !== 'string') {
        return null;
    }
    const trimmed = userName.trim();
    if (trimmed.length < min || trimmed.length > max) {
        return null;
    }
    return trimmed;
}

module.exports = {
    sanitizeOptions,
    isAdminRegistration,
    normalizeUserName,
};
