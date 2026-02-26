const API_BASE_URL = '/api/local';

const agentBuilderService = {
    /**
     * Get list of all agent networks (direct file scan across registries)
     */
    getAllNetworks: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/all-networks`);
            if (!response.ok) {
                throw new Error('Failed to fetch all networks');
            }
            const data = await response.json();
            return data.networks || [];
        } catch (error) {
            console.error('Error fetching all networks:', error);
            return [];
        }
    },

    /**
     * Get list of native coded tools from toolbox_info.hocon
     */
    getTools: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/tools`);
            if (!response.ok) {
                throw new Error('Failed to fetch tools');
            }
            const data = await response.json();
            return data || [];
        } catch (error) {
            console.error('Error fetching tools:', error);
            return [];
        }
    },

    /**
     * Get list of MCP servers from mcp_info.hocon
     */
    getMcpServers: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/mcp-servers`);
            if (!response.ok) {
                throw new Error('Failed to fetch MCP servers');
            }
            const data = await response.json();
            return data || [];
        } catch (error) {
            console.error('Error fetching MCP servers:', error);
            return [];
        }
    },

    /**
     * Get network details (re-using existing parser)
     */
    getNetworkGraph: async (networkName) => {
        try {
            const response = await fetch(`${API_BASE_URL}/network-content?path=${encodeURIComponent(networkName)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch network graph');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching network graph:', error);
            throw error;
        }
    },

    /**
     * Ask Gemini Copilot for architectural changes
     * @param {string} networkPath - Path to existing network (or null for draft)
     * @param {string} prompt - User's request
     * @param {object} currentGraphData - Optional: Current graph state {nodes, edges, metadata} for draft networks
     */
    generateCopilotPlan: async (networkPath, prompt, currentGraphData = null) => {
        try {
            // Fetch strictly allowed real platform tools and subnetworks
            const [networks, tools] = await Promise.all([
                agentBuilderService.getAllNetworks(),
                agentBuilderService.getTools()
            ]);
            const availableSubnetworks = networks.map(n => "/" + n);
            const availableTools = Object.keys(tools).filter(k => k !== 'error');

            const enrichedPrompt = `${prompt}

CRITICAL RULES:
1. You are ONLY allowed to add valid native tools or subnetworks to the agents.
2. DO NOT invent, hallucinate, or suggest any tools that are not listed here.
3. You MUST ONLY use tools from this exact list: ${JSON.stringify(availableTools)}
4. You MUST ONLY use subnetworks from this exact list: ${JSON.stringify(availableSubnetworks)}`;

            const requestBody = { prompt: enrichedPrompt };

            // If currentGraphData is provided (draft network), generate HOCON from it
            if (currentGraphData && currentGraphData.nodes && currentGraphData.edges) {
                const { default: HoconGenerator } = await import('../utils/HoconGenerator.js');
                const hoconContent = HoconGenerator.generateHocon(
                    currentGraphData.nodes,
                    currentGraphData.edges,
                    currentGraphData.metadata || {}
                );
                requestBody.hoconContent = hoconContent;
            } else {
                // Otherwise use network path (existing network)
                requestBody.networkPath = networkPath;
            }

            const response = await fetch(`${API_BASE_URL}/copilot-generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.details || 'Copilot generation failed');
            }
            return await response.json();
        } catch (error) {
            console.error('Error generating copilot plan:', error);
            throw error;
        }
    },

    /**
     * Dispatch copilot update to the native agent_network_designer agent via nsflow
     * Returns an async generator that yields parsed JSON line objects (logs, responses, etc)
     */
    dispatchCopilotUpdateToNsflow: async function* (networkPath, planDescription) {
        try {
            const messagePayload = {
                text: `FILE: ${networkPath}.hocon\nYOUR TASK: Modify the existing network EXACTLY matching this PLAN: ${planDescription}.\nCRITICAL: Do not rename the network. If an agent had instructions, it MUST STILL HAVE INSTRUCTIONS. Do not lose any agents!`
            };

            const response = await fetch('/api/v1/agent_network_designer/streaming_chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_message: messagePayload,
                    sly_data: {},
                    chat_context: {}
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || errData.error || 'Failed to dispatch to agent_network_designer');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const data = JSON.parse(line);
                        yield data; // Yield the parsed JSON object to the caller
                    } catch (e) {
                        // ignore unparseable lines
                    }
                }
            }
        } catch (error) {
            console.error('Error dispatching to nsflow:', error);
            throw error;
        }
    },

    /**
     * Save network directly to registry (no download)
     * @param {string} networkPath - Path relative to registries/ (e.g., "my_network" or "industry/my_network")
     * @param {string} hoconContent - Complete HOCON content to save
     * @param {boolean} overwrite - Whether to overwrite existing file
     * @returns {Promise<{success: boolean, path: string, message: string}>}
     */
    saveToRegistry: async (networkPath, hoconContent, overwrite = false) => {
        try {
            const response = await fetch(`${API_BASE_URL}/save-to-registry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ networkPath, hoconContent, overwrite })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409 && data.exists) {
                    // File exists, need confirmation
                    return { ...data, needsConfirmation: true };
                }
                throw new Error(data.message || data.error || 'Failed to save to registry');
            }

            return data;
        } catch (error) {
            console.error('Error saving to registry:', error);
            throw error;
        }
    }
};

export default agentBuilderService;
