function objectIdToTime(id) {
    if (!id) return 0;
    const hex = String(id).slice(0, 8);
    if (!/^[a-f0-9]{8}$/i.test(hex)) return 0;
    return parseInt(hex, 16) * 1000;
}

export function getServerRecencyTime(server) {
    const updated = server?.updatedAt ? new Date(server.updatedAt).getTime() : 0;
    const created = server?.createdAt ? new Date(server.createdAt).getTime() : 0;
    return Math.max(updated, created, objectIdToTime(server?._id));
}

export function sortServersByRecency(servers) {
    return [...servers].sort((a, b) => getServerRecencyTime(b) - getServerRecencyTime(a));
}

export function countOnlinePlayers(server) {
    return server?.players?.filter((player) => player.state === 'online').length ?? 0;
}
