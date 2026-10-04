export function eventMatchesServer(payload, serverCode) {
    if (!serverCode) {
        return false;
    }

    const eventCode = payload?.serverCode
        ?? payload?.server?.code
        ?? payload?.code
        ?? (typeof payload === 'string' ? payload : null);

    if (!eventCode) {
        return false;
    }

    return String(eventCode) === String(serverCode);
}
