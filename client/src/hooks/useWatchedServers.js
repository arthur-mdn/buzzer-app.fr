import { useEffect, useRef } from 'react';

export function useWatchedServers(socket, servers) {
    const watchedCodesRef = useRef([]);
    const codesKey = (servers || [])
        .map((server) => server?.code)
        .filter(Boolean)
        .join('|');

    useEffect(() => {
        if (!socket) {
            return;
        }

        const nextCodes = codesKey ? codesKey.split('|') : [];
        const previousCodes = watchedCodesRef.current;

        previousCodes
            .filter((code) => !nextCodes.includes(code))
            .forEach((code) => socket.emit('unwatchServer', { serverCode: code }));

        nextCodes
            .filter((code) => !previousCodes.includes(code))
            .forEach((code) => socket.emit('watchServer', { serverCode: code }));

        watchedCodesRef.current = nextCodes;
    }, [socket, codesKey]);

    useEffect(() => {
        if (!socket) {
            return undefined;
        }

        return () => {
            watchedCodesRef.current.forEach((code) => {
                socket.emit('unwatchServer', { serverCode: code });
            });
            watchedCodesRef.current = [];
        };
    }, [socket]);
}
