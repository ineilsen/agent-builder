/**
 * Agent Configuration API Service
 * Handles persistence of agent configurations to backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5174/api';

/**
 * Save agent configuration to backend
 * @param {string} agentId - The agent identifier
 * @param {object} config - The agent configuration object
 * @returns {Promise<object>} The saved configuration
 */
export const saveAgentConfig = async (agentId, config) => {
    try {
        const response = await fetch(`${API_BASE_URL}/agents/${agentId}/config`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(config)
        });

        if (!response.ok) {
            // If backend is not available, fallback to localStorage
            if (response.status === 404 || response.status === 0) {
                console.warn('Backend API not available, using localStorage fallback');
                return saveToLocalStorage(agentId, config);
            }
            throw new Error(`Failed to save configuration: ${response.statusText}`);
        }

        const data = await response.json();

        // Also save to localStorage as backup
        saveToLocalStorage(agentId, config);

        return data;
    } catch (error) {
        // Fallback to localStorage if network error
        console.warn('Network error, using localStorage fallback:', error);
        return saveToLocalStorage(agentId, config);
    }
};

/**
 * Save agent configuration to localStorage
 * @param {string} agentId - The agent identifier
 * @param {object} config - The configuration object
 * @returns {object} The saved configuration
 */
const saveToLocalStorage = (agentId, config) => {
    const key = `agent_config_${agentId}`;
    const configWithTimestamp = {
        ...config,
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(configWithTimestamp));
    return configWithTimestamp;
};

export default { saveAgentConfig };
