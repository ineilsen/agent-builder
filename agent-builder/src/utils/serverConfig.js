const STORAGE_KEY = 'agent_builder_settings';

const isLocalhost = (host) =>
    !host || host === 'localhost' || host === '127.0.0.1';

/**
 * Read the active server config from localStorage (saved by SettingsModal).
 *
 * Returns three URL helpers:
 *   neuroSanBase  — string prefix for Tornado /api/v1/* requests
 *   nsflowUrl(p)  — builds the full URL for an NSFlow REST call (p starts with /)
 *   getWsBase(wp) — builds the WebSocket base URL given 'ws:' or 'wss:'
 *
 * When the configured host is localhost/127.0.0.1 all prefixes are empty so
 * requests flow through the Vite dev-server proxy (or nginx in production).
 * When a remote host is set, absolute URLs are returned so the browser talks
 * directly to the remote Neuro SAN / NSFlow servers without a local proxy.
 */
export const getServerConfig = () => {
    let settings = {};
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) settings = JSON.parse(stored);
    } catch {}

    const host     = settings.NEURO_SAN_SERVER_HOST       || 'localhost';
    const httpPort = settings.NEURO_SAN_SERVER_HTTP_PORT  || '8080';
    const wsPort   = settings.NEURO_SAN_WEB_CLIENT_PORT   || '4173';
    const protocol = settings.NEURO_SAN_SERVER_CONNECTION || 'http';

    if (isLocalhost(host)) {
        // Relative paths — proxied by Vite (dev) or nginx (prod)
        return {
            neuroSanBase: '',
            nsflowUrl: (path) => `/nsflow-api${path}`,
            getWsBase: (wsProto) => `${wsProto}//${window.location.host}/nsflow`,
        };
    }

    // Remote server — bypass proxy with absolute URLs
    return {
        neuroSanBase: `${protocol}://${host}:${httpPort}`,
        nsflowUrl: (path) => `${protocol}://${host}:${wsPort}/api/v1${path}`,
        getWsBase: (wsProto) => `${wsProto}//${host}:${wsPort}/api/v1/ws`,
    };
};
