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
 * Load agent configuration from backend
 * @param {string} agentId - The agent identifier
 * @returns {Promise<object|null>} The agent configuration or null
 */
export const loadAgentConfig = async (agentId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/agents/${agentId}/config`);

        if (!response.ok) {
            // Fallback to localStorage
            return loadFromLocalStorage(agentId);
        }

        return await response.json();
    } catch (error) {
        console.warn('Failed to load from backend, using localStorage:', error);
        return loadFromLocalStorage(agentId);
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

/**
 * Load agent configuration from localStorage
 * @param {string} agentId - The agent identifier
 * @returns {object|null} The configuration or null
 */
const loadFromLocalStorage = (agentId) => {
    const key = `agent_config_${agentId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
};

/**
 * Delete agent configuration
 * @param {string} agentId - The agent identifier
 * @returns {Promise<boolean>} Success status
 */
export const deleteAgentConfig = async (agentId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/agents/${agentId}/config`, {
            method: 'DELETE'
        });

        // Also remove from localStorage
        localStorage.removeItem(`agent_config_${agentId}`);

        return response.ok;
    } catch (error) {
        console.warn('Failed to delete from backend:', error);
        localStorage.removeItem(`agent_config_${agentId}`);
        return true;
    }
};

/**
 * List all saved agent configurations
 * @returns {Promise<Array>} Array of agent configurations
 */
export const listAgentConfigs = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/agents/configs`);

        if (!response.ok) {
            return listFromLocalStorage();
        }

        return await response.json();
    } catch (error) {
        console.warn('Failed to list from backend, using localStorage:', error);
        return listFromLocalStorage();
    }
};

/**
 * List all configurations from localStorage
 * @returns {Array} Array of configurations
 */
const listFromLocalStorage = () => {
    const configs = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('agent_config_')) {
            const config = localStorage.getItem(key);
            if (config) {
                configs.push(JSON.parse(config));
            }
        }
    }
    return configs;
};

export default {
    saveAgentConfig,
    loadAgentConfig,
    deleteAgentConfig,
    listAgentConfigs
};
