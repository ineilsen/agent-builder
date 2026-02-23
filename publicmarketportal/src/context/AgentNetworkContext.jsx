import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import agentNetworkService from '../services/agentNetworkService';

const AgentNetworkContext = createContext();

export const useAgentNetwork = () => useContext(AgentNetworkContext);

// Generate a unique session ID
const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

// Format timestamp
const formatTimestamp = () => new Date().toISOString().replace('T', ' ').split('.')[0];

// Neuro-SAN server - requests are proxied through Vite to port 8080
const NEURO_SAN_BASE_URL = '';

export const AgentNetworkProvider = ({ children }) => {
    const [networks, setNetworks] = useState([]);
    const [currentNetwork, setCurrentNetwork] = useState(null);
    const [selectedAgentId, setSelectedAgentId] = useState(null);
    const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Backend connectivity state
    const [isServerAvailable, setIsServerAvailable] = useState(false);

    // Chat state
    const [sessionId] = useState(() => generateSessionId());
    const [chatMessages, setChatMessages] = useState([]);
    const [logEntries, setLogEntries] = useState([]);
    const [isChatConnected, setIsChatConnected] = useState(false);
    const [isChatLoading, setIsChatLoading] = useState(false);

    // Internal chat (agent-to-agent) and execution logs
    const [internalChatMessages, setInternalChatMessages] = useState([]);
    const [executionLogs, setExecutionLogs] = useState([]);

    // Stats
    const [llmCallCount, setLlmCallCount] = useState(0);
    const [totalResponseTime, setTotalResponseTime] = useState(0);

    // Real-time network animation state
    const [activeAgents, setActiveAgents] = useState(new Set());
    const [agentChain, setAgentChain] = useState([]);

    // Chat context for conversation continuity
    const chatContextRef = useRef({});

    // Active streaming request abort controller
    const abortControllerRef = useRef(null);

    // Execution Trace Accumulator Ref (persists across renders/callbacks)
    const currentExecutionTraceRef = useRef(null);

    // Helper to add a step to the current trace
    const addTraceStep = useCallback((agent, type, description, details = {}, status = 'success') => {
        if (!currentExecutionTraceRef.current) return;

        const trace = currentExecutionTraceRef.current;
        const stepId = `step_${trace.steps.length + 1}`;

        trace.steps.push({
            id: stepId,
            timestamp: Date.now(),
            agent,
            type,
            description,
            status,
            details
        });

        // Auto-link to previous step
        if (trace.steps.length > 1) {
            const prev = trace.steps[trace.steps.length - 2];
            trace.edges.push({ source: prev.id, target: stepId });
        }
    }, []);

    // Helper to start a new trace
    const startNewTrace = useCallback((networkName, initialInput) => {
        currentExecutionTraceRef.current = {
            id: `exec_${Date.now()}`,
            timestamp: Date.now(),
            network: networkName,
            steps: [],
            edges: []
        };
        // Add initial trigger step
        addTraceStep(networkName, 'trigger', 'Message Sent', { input: initialInput });
    }, [addTraceStep]);

    // nsflow WebSocket refs
    const chatSocketRef = useRef(null);       // Chat WebSocket for messaging
    const logsSocketRef = useRef(null);       // Logs WebSocket for telemetry
    const internalChatSocketRef = useRef(null); // Internal chat WebSocket

    // Check server availability on mount using /api/v1/list endpoint
    useEffect(() => {
        const checkServer = async () => {
            try {
                const r = await fetch(`${NEURO_SAN_BASE_URL}/api/v1/list`, { method: 'GET' });
                if (r.ok) {
                    setIsServerAvailable(true);
                    console.log('[NeuroSAN] Server available via /api/v1/list');
                }
            } catch (e) {
                console.warn('[NeuroSAN] Server not available:', e.message);
                setIsServerAvailable(false);
            }
        };
        checkServer();
    }, []);

    // Load list of networks on mount
    useEffect(() => {
        const fetchNetworks = async () => {
            setIsLoading(true);
            try {
                const data = await agentNetworkService.getNetworks();
                setNetworks(data || []);
                if (data && data.length > 0) {
                    loadNetwork(data[0]);
                }
            } catch (err) {
                console.error("Failed to load networks", err);
                setError("Failed to load networks");
            } finally {
                setIsLoading(false);
            }
        };
        fetchNetworks();
    }, []);

    // Load a specific network graph
    const loadNetwork = async (networkName) => {
        if (!networkName) return;

        setIsLoading(true);
        setCurrentNetwork(networkName);
        setError(null);
        setSelectedAgentId(null);

        // Abort any active streaming request when switching networks
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        try {
            const data = await agentNetworkService.getNetworkGraph(networkName);
            setGraphData(data);
        } catch (err) {
            console.error(`Failed to load network ${networkName}`, err);
            setError(`Failed to load ${networkName}`);
            setGraphData({ nodes: [], edges: [] });
        } finally {
            setIsLoading(false);
        }
    };

    const selectAgent = (agentId) => {
        setSelectedAgentId(agentId);
    };

    const updateAgentPrompt = async (agentName, newPrompt) => {
        if (!currentNetwork || !agentName) return;
        try {
            await agentNetworkService.updatePrompt(currentNetwork, agentName, newPrompt);
            setGraphData(prev => ({
                ...prev,
                nodes: prev.nodes.map(n =>
                    n.id === agentName
                        ? { ...n, data: { ...n.data, instructions: newPrompt } }
                        : n
                ),
                agentDetails: {
                    ...prev.agentDetails,
                    [agentName]: {
                        ...prev.agentDetails?.[agentName],
                        instructions: newPrompt
                    }
                }
            }));
            return true;
        } catch (err) {
            console.error("Failed to update prompt", err);
            setError(`Failed to update prompt for ${agentName}`);
            return false;
        }
    };

    // Helper to add execution log entry
    const addExecutionLog = useCallback((agent, source, message, metadata = {}) => {
        const entry = {
            timestamp: formatTimestamp(),
            agent,
            source,
            message,
            ...metadata
        };
        setLogEntries(prev => [...prev, entry]);
        setExecutionLogs(prev => [...prev, entry]);
    }, []);

    // Helper to add internal chat message
    const addInternalChatMessage = useCallback((sender, text, metadata = {}) => {
        setInternalChatMessages(prev => [...prev, {
            timestamp: formatTimestamp(),
            sender,
            text,
            ...metadata
        }]);
    }, []);

    // Helper to add main chat message
    const addChatMessage = useCallback((sender, text, agent = null, executionData = null) => {
        setChatMessages(prev => [...prev, { sender, text, agent, executionData }]);
    }, []);


    // --- HTTP Streaming Logic ---

    // Connect Action (triggered by user click)
    const connectChat = useCallback(async () => {
        if (!currentNetwork) return;

        // Reset state
        chatContextRef.current = {};
        setChatMessages([]);
        setLogEntries([]);
        setInternalChatMessages([]);
        setExecutionLogs([]);
        setLlmCallCount(0);
        setTotalResponseTime(0);

        // Mark as connected
        setIsChatConnected(true);
        addExecutionLog('System', 'Frontend', `Ready to chat with ${currentNetwork}`);
        addChatMessage('system', `Connected to ${currentNetwork}. Send a message to begin.`);

        // --- Connect to nsflow WebSockets ---
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsBase = `${protocol}//${window.location.host}/nsflow`;

        // 1. Chat WebSocket - bidirectional messaging (triggers telemetry via LogsRegistry)
        try {
            const chatUrl = `${wsBase}/chat/${currentNetwork}/${sessionId}`;
            chatSocketRef.current = new WebSocket(chatUrl);

            chatSocketRef.current.onopen = () => {
                console.log('[nsflow-Chat] Connected');
                addExecutionLog(currentNetwork, 'nsflow', 'Chat WebSocket connected');
            };

            chatSocketRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    // Handle AI response messages
                    if (data.message && data.message.type === 'AI') {
                        const responseText = data.message.text || '';
                        if (responseText) {
                            // Finish trace associated with this response
                            addTraceStep(currentNetwork, 'finish', 'Process Completed', { response: responseText });

                            addChatMessage('agent', responseText, currentNetwork, currentExecutionTraceRef.current);
                            addExecutionLog(currentNetwork, 'Agent', 'Response received via WebSocket');
                            setIsChatLoading(false);
                            // Clear active agents after delay to let animation complete
                            setTimeout(() => {
                                setActiveAgents(new Set());
                                setAgentChain([]);
                            }, 2000);
                        }
                    }
                } catch (e) {
                    console.warn('[nsflow-Chat] Parse error:', e);
                }
            };

            chatSocketRef.current.onerror = (err) => {
                console.warn('[nsflow-Chat] Connection failed, will fall back to HTTP');
            };

            chatSocketRef.current.onclose = () => {
                console.log('[nsflow-Chat] Disconnected');
            };
        } catch (e) {
            console.warn('[nsflow-Chat] Failed to connect:', e.message);
        }

        // 2. Logs WebSocket - receives execution logs with token_accounting, otrace, etc.
        try {
            const logsUrl = `${wsBase}/logs/${currentNetwork}/${sessionId}`;
            logsSocketRef.current = new WebSocket(logsUrl);

            logsSocketRef.current.onopen = () => {
                console.log('[nsflow-Logs] Connected');
                addExecutionLog(currentNetwork, 'nsflow', 'Logs WebSocket connected');
            };

            logsSocketRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    // Parse rich log data
                    if (data.otrace) {
                        // Update agent chain for real-time animation
                        const agents = Array.isArray(data.otrace) ? data.otrace : [];
                        if (agents.length > 0) {
                            setAgentChain(agents);
                            setActiveAgents(new Set(agents));

                            // Visualize Delegation
                            const activeAgent = agents[agents.length - 1];
                            const parentAgent = agents.length > 1 ? agents[agents.length - 2] : 'Orchestrator';
                            addTraceStep(activeAgent, 'delegation', `Delegated to ${activeAgent}`, {
                                from: parentAgent,
                                chain: agents
                            });
                        }
                        addExecutionLog(currentNetwork, 'NeuroSan', JSON.stringify({ otrace: data.otrace }));
                    }
                    if (data.token_accounting) {
                        addExecutionLog(currentNetwork, 'NeuroSan', JSON.stringify({ token_accounting: data.token_accounting }));
                        addTraceStep(currentNetwork, 'metric', 'Token Usage', data.token_accounting);

                        if (data.token_accounting.successful_requests) {
                            setLlmCallCount(prev => prev + data.token_accounting.successful_requests);
                        }
                    }
                    if (data.log || data.message) {
                        const logMsg = data.log || data.message;
                        addExecutionLog(data.agent_name || currentNetwork, 'nsflow', logMsg);

                        // Trace significant logs
                        if (logMsg && logMsg.length > 20) {
                            addTraceStep(data.agent_name || currentNetwork, 'thought', 'Reasoning', { content: logMsg });
                        }
                    }
                } catch (e) {
                    // Raw log message
                    addExecutionLog(currentNetwork, 'nsflow', event.data);
                }
            };

            logsSocketRef.current.onerror = (err) => {
                console.warn('[nsflow-Logs] Connection failed (nsflow may not be running)');
            };

            logsSocketRef.current.onclose = () => {
                console.log('[nsflow-Logs] Disconnected');
            };
        } catch (e) {
            console.warn('[nsflow-Logs] Failed to connect:', e.message);
        }

        // 2. Internal Chat WebSocket - agent-to-agent messages
        try {
            const internalChatUrl = `${wsBase}/internalchat/${currentNetwork}/${sessionId}`;
            internalChatSocketRef.current = new WebSocket(internalChatUrl);

            internalChatSocketRef.current.onopen = () => {
                console.log('[nsflow-InternalChat] Connected');
                addExecutionLog(currentNetwork, 'nsflow', 'Internal chat WebSocket connected');
            };

            internalChatSocketRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('[nsflow-InternalChat] Received:', data);

                    // nsflow format: {message: {otrace: [...], text: "..."}}
                    if (data.message) {
                        const msg = data.message;

                        // Handle structured message with otrace and text
                        if (typeof msg === 'object' && msg.otrace && msg.text) {
                            const agents = Array.isArray(msg.otrace) ? msg.otrace : [msg.otrace];
                            const sender = agents.length > 0 ? agents[agents.length - 1] : currentNetwork;
                            const text = msg.text;

                            // Update active agents for real-time animation
                            if (agents.length > 0) {
                                setAgentChain(agents);
                                setActiveAgents(new Set(agents));
                            }

                            if (text && text.trim()) {
                                addInternalChatMessage(sender, text, {
                                    type: 'agent_message',
                                    trace: agents
                                });
                                // Also log with agent chain visualization
                                if (agents.length > 1) {
                                    addExecutionLog(sender, 'Internal', `🔗 ${agents.join(' → ')}: ${text.substring(0, 100)}...`);
                                } else {
                                    addExecutionLog(sender, 'Internal', text.substring(0, 150));
                                }

                                // Trace internal response
                                addTraceStep(sender, 'response', 'Internal Agent Response', { text });
                            }
                        }
                        // Handle string message (connection/disconnection notifications)
                        else if (typeof msg === 'string') {
                            addExecutionLog(currentNetwork, 'nsflow', msg);
                        }
                    }
                } catch (e) {
                    console.warn('[nsflow-InternalChat] Parse error:', e, event.data);
                }
            };

            internalChatSocketRef.current.onerror = (err) => {
                console.warn('[nsflow-InternalChat] Connection failed');
            };

            internalChatSocketRef.current.onclose = () => {
                console.log('[nsflow-InternalChat] Disconnected');
            };
        } catch (e) {
            console.warn('[nsflow-InternalChat] Failed to connect:', e.message);
        }

    }, [currentNetwork, sessionId, addExecutionLog, addChatMessage, addInternalChatMessage]);


    // Disconnect (abort any pending request and close WebSockets)
    const disconnectChat = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        // Close nsflow WebSockets
        if (chatSocketRef.current) {
            chatSocketRef.current.close();
            chatSocketRef.current = null;
        }
        if (logsSocketRef.current) {
            logsSocketRef.current.close();
            logsSocketRef.current = null;
        }
        if (internalChatSocketRef.current) {
            internalChatSocketRef.current.close();
            internalChatSocketRef.current = null;
        }
        setIsChatConnected(false);
        addExecutionLog(currentNetwork || 'System', 'Frontend', 'Disconnected');
    }, [currentNetwork, addExecutionLog]);


    // Send message via nsflow WebSocket (with HTTP fallback)
    const sendChatMessage = useCallback(async (text) => {
        if (!isChatConnected || !currentNetwork) {
            console.error("Chat not connected");
            addExecutionLog('System', 'Frontend', 'Cannot send - not connected');
            return;
        }

        // Add user message via HTTP streaming
        addChatMessage('user', text);
        addInternalChatMessage('User', text, { type: 'user_input' });
        addExecutionLog('User', 'Input', `"${text.substring(0, 80)}${text.length > 80 ? '...' : ''}"`);

        setIsChatLoading(true);
        const startTime = Date.now();

        // Initialize new trace
        startNewTrace(currentNetwork, text);

        // Execution Trace Accumulator for Visualization
        const currentExecutionTrace = {
            id: `exec_${Date.now()}`,
            timestamp: Date.now(),
            network: currentNetwork,
            steps: [], // { id, type, agent, description, status, timestamp, details }
            edges: []  // { source, target }
        };

        const addTraceStep = (agent, type, description, details = {}, status = 'success') => {
            currentExecutionTrace.steps.push({
                id: `step_${currentExecutionTrace.steps.length + 1}`,
                timestamp: Date.now(),
                agent,
                type,
                description,
                status,
                details
            });
            // Auto-create edge from previous step if reasonable
            if (currentExecutionTrace.steps.length > 1) {
                const prev = currentExecutionTrace.steps[currentExecutionTrace.steps.length - 2];
                // Simple previous->current linkage
                currentExecutionTrace.edges.push({ source: prev.id, target: `step_${currentExecutionTrace.steps.length}` });
            }
        };

        // Try WebSocket first if connected
        if (chatSocketRef.current && chatSocketRef.current.readyState === WebSocket.OPEN) {
            try {
                const wsPayload = {
                    message: text,
                    chat_context: chatContextRef.current,
                    sly_data: {}
                };
                chatSocketRef.current.send(JSON.stringify(wsPayload));
                addExecutionLog(currentNetwork, 'WebSocket', `Message sent via nsflow chat`);
                addTraceStep(currentNetwork, 'trigger', 'Message Sent via WebSocket', { text });
                // Response will come async via onmessage handler - tracing there is harder with this architecture 
                // without refactoring onmessage to share state. For now, we focus on HTTP streaming which is the robust fallback 
                // or we accept that WS tracing might be less detailed in this iteration.
                return;
            } catch (e) {
                console.warn('[nsflow-Chat] Failed to send via WebSocket, falling back to HTTP:', e);
            }
        }

        // Fallback to HTTP streaming
        addExecutionLog(currentNetwork, 'HTTP', 'Falling back to HTTP streaming...');
        addTraceStep('System', 'start', 'Workflow Started', { input: text });

        abortControllerRef.current = new AbortController();

        try {
            // Build request payload matching neuro-san StreamingChatHandler expectations
            const payload = {
                user_message: { text: text },
                sly_data: {},
                chat_context: chatContextRef.current
            };

            const streamingUrl = `${NEURO_SAN_BASE_URL}/api/v1/${currentNetwork}/streaming_chat`;

            const response = await fetch(streamingUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            setLlmCallCount(prev => prev + 1);

            // Read streaming response (JSON-lines format)
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let finalResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Process complete lines
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer

                for (const line of lines) {
                    if (!line.trim()) continue;

                    try {
                        const data = JSON.parse(line);

                        // 1. Handle otrace (agent delegation chain)
                        if (data.otrace) {
                            const traceChain = Array.isArray(data.otrace) ? data.otrace : [data.otrace];
                            addExecutionLog(currentNetwork, 'NeuroSan', JSON.stringify({ otrace: data.otrace }));

                            // Add visualization step for delegation
                            if (traceChain.length > 0) {
                                const activeAgent = traceChain[traceChain.length - 1];
                                const parentAgent = traceChain.length > 1 ? traceChain[traceChain.length - 2] : 'Orchestrator';

                                addTraceStep(activeAgent, 'delegation', `Delegated to ${activeAgent}`, {
                                    from: parentAgent,
                                    chain: traceChain
                                });
                            }

                            if (traceChain.length > 0) {
                                const agentName = traceChain[traceChain.length - 1];
                                addInternalChatMessage(agentName, `Agent invoked`, { type: 'delegation', trace: data.otrace });
                            }
                        }

                        // 2. Handle token_accounting (costs, model usage)
                        if (data.token_accounting) {
                            const ta = data.token_accounting;
                            addExecutionLog(currentNetwork, 'NeuroSan', JSON.stringify({ token_accounting: ta }));
                            addTraceStep(currentNetwork, 'metric', 'Token Usage Recorded', ta);

                            // Update stats
                            if (ta.successful_requests) {
                                setLlmCallCount(prev => prev + ta.successful_requests);
                            }
                            if (ta.time_taken_in_seconds) {
                                setTotalResponseTime(prev => prev + (ta.time_taken_in_seconds * 1000));
                            }
                        }

                        // 3. Handle response messages
                        if (data.response) {
                            const msgText = data.response.text || data.response.message || JSON.stringify(data.response);
                            const origin = data.response.origin || currentNetwork;

                            finalResponse = msgText;

                            addExecutionLog(origin, 'Agent', `Responding...`);
                            addTraceStep(origin, 'response', 'Generating Response', { text: msgText });

                            if (data.response.origin && data.response.origin !== currentNetwork) {
                                addInternalChatMessage(data.response.origin, msgText, { type: 'agent_message' });
                            }
                        }

                        // 5. Handle tool invocations from internal agent chat
                        if (data.tool_call || data.function_call) {
                            const toolName = data.tool_call?.name || data.function_call?.name || 'unknown';
                            const toolArgs = data.tool_call?.arguments || data.function_call?.arguments || {};

                            addInternalChatMessage(currentNetwork, `Invoking: ${toolName}`, { type: 'tool_call' });
                            addExecutionLog(currentNetwork, 'Tool', `Invoking ${toolName}`);

                            addTraceStep(currentNetwork, 'tool', `Executing Tool: ${toolName}`, {
                                tool: toolName,
                                arguments: toolArgs
                            }, 'warning'); // Use warning color/status for tool calls (yellow)
                        }

                        // 6. Handle state updates
                        if (data.state || data.last_chat_response) {
                            addExecutionLog(currentNetwork, 'nsflow', `state updated`);
                        }

                        // 7. Update chat context
                        if (data.chat_context) {
                            chatContextRef.current = data.chat_context;
                        }

                        // 8. Handle explicit log messages (thoughts/reasoning)
                        if (data.log) {
                            addExecutionLog(data.agent_name || currentNetwork, 'Stream', data.log);
                            // Capture specific thoughts as steps if they look significant
                            if (data.log.length > 20) {
                                addTraceStep(data.agent_name || currentNetwork, 'thought', 'Reasoning', { content: data.log });
                            }
                        }

                    } catch (parseErr) {
                        addExecutionLog(currentNetwork, 'Raw', line);
                    }
                }
            }

            // Add final node
            addTraceStep(currentNetwork, 'finish', 'Process Completed', { response: finalResponse });

            // Add final agent response to chat WITH EXECUTION DATA
            if (finalResponse) {
                addChatMessage('agent', finalResponse, currentNetwork, currentExecutionTrace);
            }

            const elapsed = Date.now() - startTime;
            setTotalResponseTime(prev => prev + elapsed);
            addExecutionLog(currentNetwork, 'Complete', `Response received in ${elapsed}ms`);

        } catch (err) {
            if (err.name === 'AbortError') {
                addExecutionLog('System', 'Cancelled', 'Request was cancelled');
                addTraceStep('System', 'error', 'Request Cancelled', {}, 'error');
            } else {
                console.error('[HTTP-Stream] Error:', err);
                addExecutionLog('System', 'Error', `Request failed: ${err.message}`);
                addChatMessage('system', `Error: ${err.message}`);
                addTraceStep('System', 'error', `Error: ${err.message}`, {}, 'error');
            }
        } finally {
            setIsChatLoading(false);
            abortControllerRef.current = null;
        }
    }, [isChatConnected, currentNetwork, addChatMessage, addInternalChatMessage, addExecutionLog]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return (
        <AgentNetworkContext.Provider value={{
            networks,
            currentNetwork,
            graphData,
            isLoading,
            error,
            loadNetwork,
            selectedAgentId,
            selectAgent,
            updateAgentPrompt,
            // Server state
            isServerAvailable,
            // Chat
            sessionId,
            chatMessages,
            logEntries,
            isChatConnected,
            isChatLoading,
            connectChat,
            sendChatMessage,
            disconnectChat,
            // Internal chat and execution logs
            internalChatMessages,
            executionLogs,
            // Stats
            llmCallCount,
            totalResponseTime,
            // Real-time animation
            activeAgents,
            agentChain,
            clearActiveAgents: () => { setActiveAgents(new Set()); setAgentChain([]); }
        }}>
            {children}
        </AgentNetworkContext.Provider>
    );
};

