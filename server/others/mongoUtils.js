const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 25;

function isVersionError(err) {
    return err?.name === 'VersionError';
}

async function retryOnVersionError(fn, { maxRetries = MAX_RETRIES } = {}) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            if (isVersionError(err) && attempt < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
                continue;
            }
            throw err;
        }
    }
}

function registerProcessErrorHandlers() {
    process.on('unhandledRejection', (reason) => {
        console.error('Unhandled rejection:', reason);
    });

    process.on('uncaughtException', (err) => {
        console.error('Uncaught exception:', err);
    });
}

function safeSocketOn(socket, event, handler, errorMessage = 'An unexpected error occurred') {
    socket.on(event, async (payload) => {
        try {
            await handler(payload ?? {});
        } catch (error) {
            console.error(`Socket ${event} error:`, error);
            socket.emit('serverError', { message: errorMessage });
        }
    });
}

module.exports = {
    retryOnVersionError,
    registerProcessErrorHandlers,
    safeSocketOn,
};
