/**
 * Application configuration.
 * Override any value with a VITE_ env var in .env.local (gitignored).
 *
 * Example .env.local:
 *   VITE_AGENT_BUILDER_URL=http://ec2-xx-xx-xx-xx.compute-1.amazonaws.com:5174
 */
const config = {
    /** URL of the standalone Agent Builder application */
    AGENT_BUILDER_URL: import.meta.env.VITE_AGENT_BUILDER_URL || 'http://localhost:5174',
};

export default config;
