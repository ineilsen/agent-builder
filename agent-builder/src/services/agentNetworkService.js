import axios from 'axios';

// Local API Base URL (Vite Middleware) — used only by updatePrompt
const API_BASE_URL = '/api/local';

const agentNetworkService = {
    /**
     * Fetches the list of available agent networks from the remote Neuro SAN server.
     */
    getNetworks: async () => {
        try {
            const response = await axios.get('/api/v1/list');
            const agents = response.data.agents || response.data;
            if (Array.isArray(agents) && agents.length > 0) {
                return agents.map(a => a.agent_name ?? a);
            }
            return [];
        } catch (error) {
            console.warn("Neuro SAN /api/v1/list unavailable:", error.message);
            return [];
        }
    },

    /**
     * Fetches the network graph from the remote Neuro SAN server.
     * Primary: NSFlow connectivity + per-agent config fetched in parallel.
     *   - connectivity/{name}          → nodes + edges structure (works for all names incl. slash-paths)
     *   - networkconfig/{name}/agent/{id} → instructions + llm_config per agent (also works for slash-paths)
     * Fallback: local HOCON file via Vite middleware (original behaviour).
     */
    getNetworkGraph: async (networkName) => {
        // Primary: remote NSFlow — structure + per-agent instructions in parallel
        try {
            const connRes = await axios.get(`/nsflow-api/connectivity/${networkName}`);
            const { nodes = [], edges = [] } = connRes.data;

            // Fetch each agent's full config (instructions, llm_config, etc.) in parallel
            const agentConfigs = await Promise.all(
                nodes.map(node =>
                    axios.get(`/nsflow-api/networkconfig/${networkName}/agent/${node.id}`)
                        .then(r => r.data)
                        .catch(() => null)  // individual failures are tolerated
                )
            );

            // Build a map: agentId → config
            const cfgMap = {};
            nodes.forEach((node, i) => {
                if (agentConfigs[i]) cfgMap[node.id] = agentConfigs[i];
            });

            // Merge connectivity nodes with per-agent config data
            const normalizedNodes = nodes.map(node => {
                const cfg = cfgMap[node.id] || {};
                const llm = cfg.llm_config || {};
                return {
                    ...node,
                    data: {
                        ...node.data,
                        dropdownTools: node.data.dropdown_tools || [],
                        subNetworks: node.data.sub_networks || [],
                        instructions: cfg.instructions || '',
                        command: cfg.command || '',
                        class: llm.class,
                        llmModel: llm.model_name,
                        llmProvider: llm.class,
                        hasCustomLlm: !!cfg.llm_config,
                        toolCount: (node.data.dropdown_tools?.length || 0) + (node.data.sub_networks?.length || 0),
                    }
                };
            });

            const agentDetails = {};
            normalizedNodes.forEach(node => {
                agentDetails[node.id] = {
                    instructions: node.data.instructions,
                    command: node.data.command,
                    class: node.data.class,
                    dropdownTools: node.data.dropdownTools,
                    subNetworks: node.data.subNetworks,
                    llmModel: node.data.llmModel,
                    llmProvider: node.data.llmProvider,
                    hasCustomLlm: node.data.hasCustomLlm,
                };
            });

            return { nodes: normalizedNodes, edges, agentDetails };
        } catch (error) {
            console.warn(`Remote NSFlow graph fetch failed for ${networkName}:`, error.message);
            return {
                nodes: [
                    { id: "error-node", type: "system", data: { label: `Failed to load "${networkName}" from server` }, position: { x: 250, y: 100 } }
                ],
                edges: [],
                agentDetails: {}
            };
        }
    },

    /**
     * Updates the agent's prompt/instructions in the HOCON file.
     */
    updatePrompt: async (networkPath, agentName, newPrompt) => {
        try {
            await axios.post(`${API_BASE_URL}/update-agent-prompt`, {
                networkPath,
                agentName,
                newPrompt
            });
            return true;
        } catch (error) {
            console.error("Failed to update prompt:", error);
            throw error;
        }
    }
};

export default agentNetworkService;
