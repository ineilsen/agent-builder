import axios from 'axios';
import { parseHoconToGraph } from '../utils/HoconGraphMapper';

// Local API Base URL (Vite Middleware)
const API_BASE_URL = '/api/local';

// Mock Data for Fallback
const MOCK_NETWORKS = [
    "aaosa",
    "aaosa_basic",
    "agent_network_architect",
    "log_analysis_agents",
    "keybank",
    "six_thinking_hats"
];

const MOCK_GRAPH_DATA = {
    "aaosa": {
        "nodes": [
            { "id": "orchestrator", "type": "orch", "data": { "label": "Orchestrator", "instructions": "Main controller" }, "position": { "x": 300, "y": 50 } },
            { "id": "planner", "type": "agent", "data": { "label": "Planner", "instructions": "Creates plans" }, "position": { "x": 100, "y": 200 } },
            { "id": "executor", "type": "agent", "data": { "label": "Executor", "instructions": "Executes tasks" }, "position": { "x": 500, "y": 200 } }
        ],
        "edges": [
            { "id": "e1", "source": "orchestrator", "target": "planner", "animated": true },
            { "id": "e2", "source": "orchestrator", "target": "executor", "animated": true }
        ]
    }
};

const agentNetworkService = {
    /**
     * Fetches the list of available locally registered agent networks (HOCON files).
     */
    getNetworks: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/networks`);
            return response.data.networks || response.data;
        } catch (error) {
            console.warn("Local API unavailable, using mock networks:", error);
            return MOCK_NETWORKS;
        }
    },

    /**
     * Fetches the raw HOCON content (parsed to JSON by server) and maps it.
     */
    getNetworkGraph: async (networkName) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/network-content`, {
                params: { path: networkName }
            });

            // Map JSON to Graph
            return parseHoconToGraph(response.data);

        } catch (error) {
            console.warn(`Failed to fetch graph for ${networkName}, using mock if available:`, error);
            if (MOCK_GRAPH_DATA[networkName]) {
                return MOCK_GRAPH_DATA[networkName];
            }
            // Return a basic placeholder structure
            return {
                nodes: [
                    { id: "error-node", type: "system", data: { label: `Error loading ${networkName}` }, position: { x: 250, y: 100 } }
                ],
                edges: []
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
