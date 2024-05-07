const config = {
    port: import.meta.env.VITE_PORT || 3000,
    instanceUrl: import.meta.env.VITE_INSTANCE_URL,
    serverUrl: import.meta.env.VITE_SERVER_URL,
    serverSocketUrl: import.meta.env.VITE_SERVER_SOCKET_URL,
    sendPings: import.meta.env.VITE_SEND_PINGS
};

export default config;