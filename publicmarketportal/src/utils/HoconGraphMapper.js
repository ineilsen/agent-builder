
/**
 * Parses a HOCON object (already parsed JSON) into a React Flow graph (nodes/edges).
 * Replicates logic from nsflow's agent_network_utils.py
 */
export const parseHoconToGraph = (config) => {
    try {
        let nodes = [];
        let edges = [];
        let agentDetails = {};

        const tools = config.tools || [];
        const nodeLookup = {};

        // Extract network-level llm_config as default
        const networkLlmConfig = config.llm_config || {};
        const defaultModelName = networkLlmConfig.model_name || 'gpt-4o';
        const defaultProvider = networkLlmConfig.class || 'openai';
        const defaultTemperature = networkLlmConfig.temperature;

        // Build lookup
        tools.forEach(tool => {
            const name = tool.name || 'unknown_agent';
            nodeLookup[name] = tool;
        });

        const referencedAgents = new Set();
        tools.forEach(tool => {
            (tool.tools || []).forEach(child => {
                if (nodeLookup[child]) referencedAgents.add(child);
            });
        });

        // Ensure frontman name is valid
        let frontmanName = tools.find(t => t.name && !referencedAgents.has(t.name))?.name;
        if (!frontmanName && tools.length > 0) frontmanName = tools[0].name;

        if (!frontmanName) return { nodes: [], edges: [], agentDetails: {}, networkLlmConfig: { model: defaultModelName, provider: defaultProvider } };

        const processedNodes = new Set();
        const processedEdges = new Set(); // Track edge IDs

        // Recursive processor
        const processAgent = (agentName, parentName, depth, x = 0, y = 0) => {
            // Avoid cycles or duplicates
            // But we might need to add edge even if node exists (multi-parent)
            // If node exists, we just add edge and return?
            // Dagre needs all edges.

            const agent = nodeLookup[agentName];
            if (!agent) return;

            const agentId = agent.name;

            // Add Node if not processed
            if (!processedNodes.has(agentId)) {
                processedNodes.add(agentId);

                const childNodes = [];
                const dropdownTools = [];
                const subNetworks = [];

                // Determine specific type
                let nodeType = 'agent';
                if (agentId === frontmanName) {
                    nodeType = 'frontman';
                } else if (agent.class && agent.class !== "No class") {
                    nodeType = 'tool';
                }

                // Process tools (children)
                (agent.tools || []).forEach(toolName => {
                    if (toolName.startsWith('/') || toolName.includes(':') || toolName.includes('/')) {
                        subNetworks.push(toolName.replace(/^\//, ''));
                    } else if (nodeLookup[toolName]) {
                        const childAgent = nodeLookup[toolName];
                        if ((childAgent.class || "No class") === "No class") {
                            childNodes.push(toolName);
                        } else {
                            dropdownTools.push(toolName);
                        }
                    }
                });

                // Extract agent-level LLM config (overrides network default)
                const agentLlmConfig = agent.llm_config || {};
                const llmModel = agentLlmConfig.model_name || defaultModelName;
                const llmProvider = agentLlmConfig.class || defaultProvider;
                const llmTemperature = agentLlmConfig.temperature ?? defaultTemperature;

                // Add Node
                nodes.push({
                    id: agentId,
                    type: nodeType,
                    data: {
                        label: agentId,
                        depth,
                        parent: parentName,
                        children: childNodes,
                        dropdownTools,
                        subNetworks,
                        instructions: agent.instructions,
                        class: agent.class,
                        toolCount: dropdownTools.length + subNetworks.length,
                        // LLM Config
                        llmModel,
                        llmProvider,
                        llmTemperature,
                        hasCustomLlm: !!agent.llm_config
                    },
                    position: { x, y }
                });

                // Add details
                agentDetails[agentId] = {
                    instructions: agent.instructions || "No instructions",
                    command: agent.command || "No command",
                    class: agent.class,
                    dropdownTools,
                    subNetworks,
                    // LLM Config
                    llmModel,
                    llmProvider,
                    llmTemperature,
                    hasCustomLlm: !!agent.llm_config
                };


                // Process children nodes
                childNodes.forEach((childId) => {
                    // Add Edge
                    const edgeId = `${agentId}-${childId}`;
                    if (!processedEdges.has(edgeId)) {
                        processedEdges.add(edgeId);
                        edges.push({
                            id: edgeId,
                            source: agentId,
                            target: childId,
                            animated: true,
                            type: 'default'
                        });
                    }
                    processAgent(childId, agentId, depth + 1);
                });

                // Sub-networks nodes
                subNetworks.forEach((sub) => {
                    if (!processedNodes.has(sub)) {
                        processedNodes.add(sub);
                        nodes.push({
                            id: sub,
                            type: 'sub-network',
                            data: {
                                label: sub,
                                depth: depth + 1,
                                parent: agentId,
                                color: 'green'
                            },
                            position: { x: 0, y: 0 }
                        });
                    }
                    const edgeId = `${agentId}-${sub}`;
                    if (!processedEdges.has(edgeId)) {
                        processedEdges.add(edgeId);
                        edges.push({
                            id: edgeId,
                            source: agentId,
                            target: sub,
                            animated: true,
                            style: { stroke: '#10b981' }
                        });
                    }
                });
            } else {
                // Node exists, but we are visiting from a new parent (maybe?)
                // If we are here, it means this agent was already processed.
                // We should verify if we need to add an edge from current parent?
                // Wait, processAgent is called for children of 'parentName'. 
                // But logic above iterates agent's tools (children) and calls processAgent(child).
                // We need to handle the incoming edge logic outside? 
                // No, edges are added by the parent's loop.
                // Wait, lines 106-115 in original code:
                // childNodes.forEach(child => addEdge; processAgent(child));
                // Duplicate check is inside processAgent?
                // If I put duplicate check at start of processAgent, and edge addition is done by caller...
                // The caller is inside processAgent of parent.
                // So edge addition happens BEFORE recursive call.

                // BUT, if I revisit a node (cycle or multiparent), I won't enter block.
                // And caller adds edge.
                // This is correct! The edge is added by the parent loop.
                // The recursion stops if node is visited.
            }
        };

        processAgent(frontmanName, null, 0);

        return { nodes, edges, agentDetails };

    } catch (e) {
        console.error("HOCON Map Error", e);
        return { nodes: [], edges: [], agentDetails: {} };
    }
};
