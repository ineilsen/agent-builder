import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import agentBuilderService from '../services/agentBuilderService';
import StudioFlowCanvas from '../components/StudioFlowCanvas';
import FuturisticPromptEditor from '../components/FuturisticPromptEditor';
import { parseHoconToGraph } from '../utils/HoconGraphMapper';
import { Network, Share2, Settings, MessageSquare, Play, Box, X, Save, ChevronRight, ChevronDown, Code, Plus, Bot, Wrench, Globe, Library, Sparkles, Move, Link, AlertCircle, Maximize2, Puzzle, TerminalSquare, Database, Moon, Sun, Download } from 'lucide-react';
import ComponentLibrary from '../components/ComponentLibrary';
import DesignerCopilot from '../components/DesignerCopilot';
import McpMarketplace from '../components/McpMarketplace';
import SettingsModal from '../components/SettingsModal';
import ToolIdeEditor from '../components/ToolIdeEditor';
import NativeGenerationTerminal from '../components/NativeGenerationTerminal';
import ExecutionLogsPanel from '../components/ExecutionLogsPanel';
import AgentConfigDrawer from '../components/AgentConfigDrawer';
import { AgentNetworkProvider, useAgentNetwork } from '../context/AgentNetworkContext';


const AgentBuilderV2Content = () => {
    // 1. Get networks from Context
    const { networks, loadNetworks, loading: contextLoading, activeAgents, agentChain } = useAgentNetwork();

    const [selectedNetwork, setSelectedNetwork] = useState(null);
    const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
    const [networkHoconData, setNetworkHoconData] = useState(null); // Store raw HOCON for export
    // const [isLoading, setIsLoading] = useState(true); // Replaced by contextLoading
    const [isGraphLoading, setIsGraphLoading] = useState(false);

    // Editor Drawer State
    const [selectedAgentId, setSelectedAgentId] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [agentConfig, setAgentConfig] = useState({});

    // Add Agent Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // UI State
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [isNetworksOpen, setIsNetworksOpen] = useState(true);
    const [isCopilotOpen, setIsCopilotOpen] = useState(false);
    const [isMcpOpen, setIsMcpOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Native Compilation Terminal State
    const [nativeLogs, setNativeLogs] = useState([]);
    const [isNativeCompiling, setIsNativeCompiling] = useState(false);
    const nativeAbortControllerRef = useRef(null);

    // Logs Panel State
    const [isLogsPanelCollapsed, setIsLogsPanelCollapsed] = useState(true);

    const toggleSidebar = (sidebar) => {
        setIsLibraryOpen(sidebar === 'library' ? !isLibraryOpen : false);
        setIsNetworksOpen(sidebar === 'networks' ? !isNetworksOpen : false);
        setIsCopilotOpen(sidebar === 'copilot' ? !isCopilotOpen : false);
        setIsMcpOpen(sidebar === 'mcp' ? !isMcpOpen : false);
    };
    const [isTesting, setIsTesting] = useState(false);
    const [isArrangeMode, setIsArrangeMode] = useState(false);
    const [isConfigureMode, setIsConfigureMode] = useState(false);
    const [expandedNetworkFolders, setExpandedNetworkFolders] = useState(new Set(['Core']));
    const [theme, setTheme] = useState(() => {
        try { return localStorage.getItem('agent-builder-theme') || 'dark'; }
        catch { return 'dark'; }
    });

    // Save to Registry State
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [saveDialogData, setSaveDialogData] = useState(null);
    const [saveNotification, setSaveNotification] = useState({ show: false, message: '', type: 'success' });

    const toggleNetworkFolder = (folderName) => {
        setExpandedNetworkFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(folderName)) newSet.delete(folderName);
            else newSet.add(folderName);
            return newSet;
        });
    };

    // Group networks into folders
    const groupedNetworks = useMemo(() => {
        const groups = {
            'Core': { items: [], icon: Bot, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            'tools': { items: [], icon: Wrench, color: 'text-rose-500', bg: 'bg-rose-500/10' },
            'basic': { items: [], icon: Puzzle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            'industry': { items: [], icon: Globe, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
            'experimental': { items: [], icon: TerminalSquare, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            'generated': { items: [], icon: Database, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            'Other': { items: [], icon: Puzzle, color: 'text-gray-500', bg: 'bg-gray-500/10' }
        };

        if (!networks || networks.length === 0) return [];

        networks.forEach(networkPath => {
            const parts = networkPath.split('/');
            const name = parts[parts.length - 1];

            if (parts.length === 1) {
                // Root level file -> Core
                groups['Core'].items.push({
                    id: networkPath,
                    label: name.replace(/_/g, ' '),
                    path: networkPath
                });
            } else {
                const folder = parts[0];
                if (!groups[folder]) {
                    groups[folder] = { items: [], icon: Box, color: 'text-gray-400', bg: 'bg-gray-800/50' };
                }
                groups[folder].items.push({
                    id: networkPath,
                    label: name.replace(/_/g, ' '),
                    path: networkPath
                });
            }
        });

        // Filter out empty groups
        const result = [];
        for (const [folderName, groupData] of Object.entries(groups)) {
            if (groupData.items.length > 0) {
                groupData.items.sort((a, b) => a.label.localeCompare(b.label));
                result.push({
                    category: folderName,
                    ...groupData
                });
            }
        }

        return result;
    }, [networks]);

    // Compute active network connections based on agent chain telemetry
    const activeConnections = useMemo(() => {
        if (!agentChain || agentChain.length < 2) return [];
        const conns = [];
        for (let i = 0; i < agentChain.length - 1; i++) {
            conns.push({ source: agentChain[i], target: agentChain[i + 1] });
        }
        return conns;
    }, [agentChain]);

    useEffect(() => {
        loadNetworks();
    }, [loadNetworks]);

    // Persist theme to localStorage whenever it changes
    useEffect(() => {
        try { localStorage.setItem('agent-builder-theme', theme); }
        catch { }
    }, [theme]);

    // Restore last selected network from localStorage after networks are loaded
    useEffect(() => {
        if (networks && networks.length > 0 && !selectedNetwork) {
            try {
                const lastNetwork = localStorage.getItem('agent-builder-last-network');
                if (lastNetwork && networks.includes(lastNetwork)) {
                    handleNetworkSelect(lastNetwork);
                }
            } catch { }
        }
    }, [networks]); // eslint-disable-line react-hooks/exhaustive-deps

    // Load graph when a network is selected
    const handleNetworkSelect = async (networkName) => {
        setSelectedNetwork(networkName);
        try { localStorage.setItem('agent-builder-last-network', networkName); } catch { }
        setIsGraphLoading(true);
        setSelectedAgentId(null);
        setIsDrawerOpen(false);

        try {
            const rawData = await agentBuilderService.getNetworkGraph(networkName);

            // Store raw HOCON for export
            setNetworkHoconData(rawData);

            // Transform raw HOCON to Graph Data
            const graph = parseHoconToGraph(rawData);
            setGraphData(graph);

            // Build a map of agent configs for easier editing
            const configs = {};
            if (graph.nodes) {
                graph.nodes.forEach(node => {
                    configs[node.id] = {
                        label: node.data?.label || node.id,
                        instructions: node.data?.instructions || '',
                        model: node.data?.llmModel || 'gpt-4o',
                        tools: node.data?.dropdownTools || [],
                        type: node.type // Store type for UI logic
                    };
                });
            }
            setAgentConfig(configs);

        } catch (error) {
            console.error("Failed to load graph:", error);
        } finally {
            setIsGraphLoading(false);
        }
    };

    const handleCreateNewNetwork = () => {
        const newNetworkId = `draft_${Date.now()}`;
        setSelectedNetwork('Draft Network');
        setNetworkHoconData(null); // Clear stored HOCON data for new network

        // Create a default Orchestrator (frontman) node
        const defaultFrontmanId = `frontman_${Date.now().toString().slice(-4)}`;
        const defaultNode = {
            id: defaultFrontmanId,
            type: 'frontman',
            data: { label: 'Main Orchestrator Agent', instructions: 'You are the primary orchestration agent.' },
            position: { x: window.innerWidth / 2 - 150, y: 150 } // Roughly top-center
        };

        setGraphData({ nodes: [defaultNode], edges: [] });

        setAgentConfig({
            [defaultFrontmanId]: {
                label: 'Main Orchestrator Agent',
                instructions: 'You are the primary orchestration agent.',
                model: 'gpt-4o',
                tools: [],
                type: 'frontman'
            }
        });

        setSelectedAgentId(defaultFrontmanId);
        setIsDrawerOpen(true);
        setIsConfigureMode(true);
        setIsArrangeMode(true);
        toggleSidebar('networks'); // Keep networks open or adjust based on preference. Will trigger library if changed.
    };

    // Handle Node Click -> Open Drawer
    const handleNodeClick = (e, node) => {
        if (!node) {
            // Background click
            setIsDrawerOpen(false);
            setSelectedAgentId(null);
            return;
        }

        setSelectedAgentId(node.id);
        if (isConfigureMode) {
            setIsDrawerOpen(true);
        }
    };

    const toggleConfigureMode = () => {
        const newMode = !isConfigureMode;
        setIsConfigureMode(newMode);
        if (newMode && selectedAgentId) {
            setIsDrawerOpen(true);
        } else if (!newMode) {
            setIsDrawerOpen(false);
        }
    };

    const handleExportNetwork = async () => {
        if (!graphData?.nodes || !graphData?.edges || !selectedNetwork) return;

        try {
            // Dynamically import HoconGenerator
            const { default: HoconGenerator } = await import('../utils/HoconGenerator');

            // Generate HOCON from current graph state
            const hoconContent = HoconGenerator.generateHocon(
                graphData.nodes,
                graphData.edges,
                {
                    description: networkHoconData?.metadata?.description || '',
                    model: networkHoconData?.llm_config?.model_name || 'gpt-4o',
                    temperature: networkHoconData?.llm_config?.temperature || 0.7,
                    maxTokens: networkHoconData?.llm_config?.max_tokens || 2000,
                    sample_queries: networkHoconData?.metadata?.sample_queries || []
                }
            );

            // Download file
            const timestamp = new Date().toISOString().split('T')[0];
            const networkName = selectedNetwork.split('/').pop().replace(/\.hocon$/, '');
            const filename = `${networkName}_export_${timestamp}.hocon`;

            const blob = new Blob([hoconContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log(`✅ Exported ${filename} (${graphData.nodes.length} agents, ${graphData.edges.length} connections)`);
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error.message}`);
        }
    };

    const handleSaveToRegistry = async (forceOverwrite = false) => {
        if (!graphData?.nodes || !graphData?.edges || !selectedNetwork) return;

        setIsSaving(true);
        try {
            // Generate HOCON content
            const { default: HoconGenerator } = await import('../utils/HoconGenerator');
            const hoconContent = HoconGenerator.generateHocon(
                graphData.nodes,
                graphData.edges,
                {
                    description: networkHoconData?.metadata?.description || '',
                    model: networkHoconData?.llm_config?.model_name || 'gpt-4o',
                    temperature: networkHoconData?.llm_config?.temperature || 0.7,
                    maxTokens: networkHoconData?.llm_config?.max_tokens || 2000,
                    sample_queries: networkHoconData?.metadata?.sample_queries || []
                }
            );

            // Get network path (remove .hocon extension if present)
            const networkPath = selectedNetwork.replace(/\.hocon$/, '');

            // Attempt to save
            const result = await agentBuilderService.saveToRegistry(
                networkPath,
                hoconContent,
                forceOverwrite
            );

            if (result.needsConfirmation) {
                // File exists, show confirmation dialog
                setSaveDialogData({ networkPath, hoconContent });
                setShowSaveDialog(true);
            } else {
                // Success
                setSaveNotification({
                    show: true,
                    message: result.message || 'Network saved successfully!',
                    type: 'success'
                });
                setTimeout(() => setSaveNotification({ show: false, message: '', type: 'success' }), 3000);
                console.log(`✅ Saved to registry: ${result.path}`);

                // Reload networks to show in sidebar
                await loadNetworks();
            }
        } catch (error) {
            console.error('Save to registry failed:', error);
            setSaveNotification({
                show: true,
                message: error.message || 'Failed to save to registry',
                type: 'error'
            });
            setTimeout(() => setSaveNotification({ show: false, message: '', type: 'error' }), 5000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmOverwrite = async () => {
        setShowSaveDialog(false);
        if (saveDialogData) {
            await handleSaveToRegistry(true); // Retry with overwrite=true
            setSaveDialogData(null);
        }
    };

    const handleConfigChange = (field, value) => {
        setAgentConfig(prev => ({
            ...prev,
            [selectedAgentId]: {
                ...prev[selectedAgentId],
                [field]: value
            }
        }));
    };

    const handleAddAgent = (type) => {
        if (!selectedNetwork) return;

        const newId = `${type}_${Date.now().toString().slice(-4)} `;
        const label = `New ${type.charAt(0).toUpperCase() + type.slice(1)} `;

        // Add to Graph Nodes
        const newNode = {
            id: newId,
            type: type === 'network' ? 'sub-network' : type, // 'agent', 'tool', 'sub-network'
            data: { label: label, instructions: '' },
            position: { x: 250, y: 100 } // Default position
        };

        setGraphData(prev => ({
            ...prev,
            nodes: [...prev.nodes, newNode]
        }));

        // Add to Config
        setAgentConfig(prev => ({
            ...prev,
            [newId]: {
                label: label,
                instructions: '',
                model: 'gpt-4o',
                tools: [],
                type: type === 'network' ? 'sub-network' : type
            }
        }));

        setIsAddModalOpen(false);

        // Select new agent
        setSelectedAgentId(newId);
        setIsDrawerOpen(true);
    };

    const handleAddChild = (parentId, type = 'agent') => {
        console.log('[AgentBuilderV2] handleAddChild called:', { parentId, type });
        const parentNode = graphData.nodes.find(n => n.id === parentId);

        if (!parentNode) {
            console.error('[AgentBuilderV2] Parent node not found:', parentId);
            return;
        }

        const newId = `${type}_${Date.now().toString().slice(-4)} `;
        const label = `New ${type.charAt(0).toUpperCase() + type.slice(1)} `;

        // Calculate position (below parent)
        const newPosition = {
            x: parentNode.position ? parentNode.position.x : parentNode.x,
            y: (parentNode.position ? parentNode.position.y : parentNode.y) + 250
        };

        const newNode = {
            id: newId,
            type: type, // 'agent', 'tool', 'sub-network'
            data: { label: label, instructions: '' },
            position: newPosition
        };

        const newEdge = {
            source: parentId,
            target: newId
        };

        console.log('[AgentBuilderV2] Adding new node and edge:', { newNode, newEdge });

        setGraphData(prev => ({
            nodes: [...prev.nodes, newNode],
            edges: [...prev.edges, newEdge]
        }));

        setAgentConfig(prev => ({
            ...prev,
            [newId]: {
                label: label,
                instructions: '',
                model: 'gpt-4o',
                tools: [],
                type: type
            }
        }));

        // Auto select the new child
        setSelectedAgentId(newId);
        setIsDrawerOpen(true);
    };

    // Handle manual connection creation (Shift+Click)
    const handleConnect = (sourceId, targetId) => {
        console.log('[AgentBuilderV2] handleConnect called:', { sourceId, targetId });

        // Verify nodes exist
        const sourceNode = graphData.nodes.find(n => n.id === sourceId);
        const targetNode = graphData.nodes.find(n => n.id === targetId);

        if (!sourceNode || !targetNode) {
            console.error('[AgentBuilderV2] Source or target node not found');
            return;
        }

        // Check for duplicate (should already be validated in canvas, but double-check)
        const isDuplicate = graphData.edges.some(
            e => (e.source === sourceId && e.target === targetId) ||
                 (e.source === targetId && e.target === sourceId)
        );

        if (isDuplicate) {
            console.warn('[AgentBuilderV2] Connection already exists');
            return;
        }

        const newEdge = {
            source: sourceId,
            target: targetId
        };

        console.log('[AgentBuilderV2] ✅ Adding new connection:', newEdge);

        setGraphData(prev => ({
            ...prev,
            edges: [...prev.edges, newEdge]
        }));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const reactFlowType = e.dataTransfer.getData('application/reactflow');
        if (!reactFlowType) return;

        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            const { type, label } = data;

            // Simplified position calculation (rough offset from screen coords)
            const position = {
                x: e.clientX - 350,
                y: e.clientY - 150
            };

            const newId = `${type}_${Date.now().toString().slice(-4)} `;

            const newNode = {
                id: newId,
                type: type,
                data: { label: label, instructions: '' },
                position: position
            };

            setGraphData(prev => ({
                ...prev,
                nodes: [...prev.nodes, newNode]
            }));

            setAgentConfig(prev => ({
                ...prev,
                [newId]: {
                    label: label,
                    instructions: '',
                    model: 'gpt-4o',
                    tools: [],
                    type: type
                }
            }));

            // Optional: Auto select on drop
            // setSelectedAgentId(newId);
            // setIsDrawerOpen(true);
        } catch (err) {
            console.error('Drop error:', err);
        }
    };

    // Apply copilot-generated HOCON directly to canvas (for draft networks)
    const handleApplyCopilotHocon = async (hoconContent) => {
        try {
            // HOCON string needs to be parsed by backend
            // Send to backend parser endpoint
            const response = await fetch('/api/local/parse-hocon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hoconContent })
            });

            if (!response.ok) {
                throw new Error('Failed to parse HOCON content');
            }

            const rawData = await response.json();

            // Store raw HOCON for export
            setNetworkHoconData(rawData);

            // Transform to graph data
            const graph = parseHoconToGraph(rawData);
            setGraphData(graph);

            // Build agent configs
            const configs = {};
            if (graph.nodes) {
                graph.nodes.forEach(node => {
                    configs[node.id] = {
                        label: node.data?.label || node.id,
                        instructions: node.data?.instructions || '',
                        model: node.data?.llmModel || 'gpt-4o',
                        tools: node.data?.dropdownTools || [],
                        type: node.type
                    };
                });
            }
            setAgentConfig(configs);

            console.log('✅ Canvas updated from copilot HOCON');
        } catch (error) {
            console.error('Failed to apply copilot HOCON:', error);
            alert(`Failed to update canvas: ${error.message}`);
        }
    };

    const handleAutoGenerateGraph = async (planDescription, mode = 'native') => {
        if (!selectedNetwork || !planDescription) return;

        try {
            if (planDescription === "RELOAD_ONLY") {
                // Already updated via Direct LLM, just reload the graph state
                await handleNetworkSelect(selectedNetwork);
                return;
            }

            if (mode === 'native') {
                setIsNativeCompiling(true);
                setNativeLogs([]);

                // Read from the async generator
                const generator = agentBuilderService.dispatchCopilotUpdateToNsflow(selectedNetwork, planDescription);

                try {
                    setNativeLogs([{ time: new Date().toLocaleTimeString(), message: 'Initiating neural compilation via agent_network_designer...', isHighlight: true }]);
                    for await (const chunk of generator) {
                        if (chunk.log) {
                            setNativeLogs(prev => [...prev, {
                                time: new Date().toLocaleTimeString(),
                                message: chunk.log,
                                isHighlight: chunk.log.includes('Invoking') || chunk.log.includes('Saved') || chunk.log.includes('CRITICAL')
                            }]);
                        } else if (chunk.response) {
                            setNativeLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message: chunk.response.text || "Compilation complete.", isHighlight: true }]);
                        } else if (chunk.tool_call || chunk.function_call) {
                            const tName = chunk.tool_call?.name || chunk.function_call?.name;
                            setNativeLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message: `Executing tool -> ${tName}...`, isHighlight: true }]);
                        }
                    }
                } catch (streamErr) {
                    setNativeLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message: `Stream Error: ${streamErr.message}`, isError: true }]);
                }

                // Wait a moment for UX then reload and close
                setTimeout(async () => {
                    await handleNetworkSelect(selectedNetwork);
                    setTimeout(() => setIsNativeCompiling(false), 2500);
                }, 1000);
            }

        } catch (error) {
            console.error("Failed to generate network natively:", error);
            setNativeLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message: `Fatal Error: ${error.message}`, isError: true }]);
            // alert(`Failed to execute Agent Network Designer: ${error.message}`);
        }
    };

    const handleTestAgent = () => {
        if (!graphData.edges || graphData.edges.length === 0) return;
        setIsTesting(true);

        // Turn all edges animated and purple to simulate Sly-Data flow
        setGraphData(prev => ({
            ...prev,
            edges: prev.edges.map(e => ({ ...e, animated: true, style: { stroke: '#a855f7', strokeWidth: 2 } }))
        }));

        // Stop animation after 3 seconds
        setTimeout(() => {
            setIsTesting(false);
            setGraphData(prev => ({
                ...prev,
                edges: prev.edges.map(e => ({ ...e, animated: false, style: {} }))
            }));
        }, 3000);
    };

    const currentAgent = agentConfig[selectedAgentId];

    return (
        <div className={theme === 'dark' ? 'dark' : ''}>
            <div className="flex h-screen w-screen bg-gray-50 dark:bg-[#0b0c0e] text-gray-900 dark:text-gray-100 font-sans overflow-hidden transition-colors duration-300">
                {/* LEFT SIDEBAR - NAVIGATION */}
                <div className="w-16 flex flex-col items-center py-4 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111216] z-40 transition-colors duration-300">
                    <div className="mb-6 flex flex-col items-center">
                        <div className="w-11 h-11 bg-white dark:bg-white rounded-lg flex items-center justify-center border border-gray-300 dark:border-gray-400 shadow-sm">
                            <img
                                src="/assets/Cognizant/cog-icon.png"
                                alt="Cognizant Neuro AI"
                                className="w-7 h-7 object-contain"
                                onError={(e) => {
                                    console.error('Failed to load Cognizant logo');
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 w-full px-2">
                        <SidebarIcon
                            icon={<Network size={20} />}
                            onClick={() => toggleSidebar('networks')}
                            active={isNetworksOpen}
                            title="Agent Networks"
                        />
                        <SidebarIcon
                            icon={<Library size={20} />}
                            onClick={() => toggleSidebar('library')}
                            active={isLibraryOpen}
                            title="Component Library"
                        />
                        <SidebarIcon
                            icon={<Sparkles size={20} />}
                            onClick={() => toggleSidebar('copilot')}
                            active={isCopilotOpen}
                            title="Designer Copilot"
                        />
                        <SidebarIcon
                            icon={<Box size={20} />}
                            onClick={() => toggleSidebar('mcp')}
                            active={isMcpOpen}
                            title="MCP Marketplace"
                        />
                    </div>

                    <div className="mt-auto flex flex-col gap-4 w-full px-2">
                        <SidebarIcon
                            icon={theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            title="Toggle Theme"
                        />
                        <SidebarIcon
                            icon={<Settings size={20} />}
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            active={isSettingsOpen}
                            title="Global Settings"
                        />
                    </div>
                </div>

                {/* AGENT NETWORK LIST (Floating Sidebar) */}
                <div className={`
                    fixed left-16 top-0 bottom-0 w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#15161a] flex flex-col z-30 transition-all duration-300 ease-in-out shadow-xl
                    ${isNetworksOpen ? 'translate-x-0' : '-translate-x-full opacity-0 pointer-events-none'}
                `}>
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Agent Networks</h2>
                        <button
                            onClick={handleCreateNewNetwork}
                            className="p-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                            title="Create Blank Network"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                        {contextLoading ? (
                            <div className="text-center p-4 text-gray-500 text-sm flex items-center justify-center gap-2">
                                <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                                Loading...
                            </div>
                        ) : (
                            groupedNetworks.map(section => {
                                const isExpanded = expandedNetworkFolders.has(section.category);
                                const Icon = section.icon;

                                return (
                                    <div key={section.category} className="mb-2">
                                        <button
                                            onClick={() => toggleNetworkFolder(section.category)}
                                            className="w-full flex items-center justify-between p-2 rounded-md transition-colors group hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1 rounded ${section.bg} ${section.color}`}>
                                                    <Icon size={14} />
                                                </div>
                                                <span className="text-xs font-semibold uppercase tracking-wider">{section.category} <span className="text-gray-600 ml-1">({section.items.length})</span></span>
                                            </div>
                                            {isExpanded ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
                                        </button>

                                        {isExpanded && (
                                            <div className="mt-1 space-y-1 pl-4 border-l border-gray-800 ml-3">
                                                {section.items.map(net => {
                                                    const isSelected = selectedNetwork === net.path;
                                                    return (
                                                        <button
                                                            key={net.id}
                                                            onClick={() => handleNetworkSelect(net.path)}
                                                            className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-3 transition-colors group ${isSelected
                                                                ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-600/30'
                                                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-transparent dashed-border-hover'
                                                                }`}
                                                        >
                                                            <div className={`w-6 h-6 rounded shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'}`}>
                                                                <Share2 size={12} />
                                                            </div>
                                                            <span className="text-xs font-medium capitalize truncate">{net.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* COMPONENT LIBRARY SIDEBAR */}
                <ComponentLibrary isOpen={isLibraryOpen} onToggle={() => toggleSidebar('library')} />

                {/* MCP MARKETPLACE SIDEBAR */}
                <McpMarketplace isOpen={isMcpOpen} onToggle={() => toggleSidebar('mcp')} />

                {/* DESIGNER COPILOT SIDEBAR */}
                <DesignerCopilot
                    isOpen={isCopilotOpen}
                    onGenerateGraph={handleAutoGenerateGraph}
                    onApplyHocon={handleApplyCopilotHocon}
                    networkPath={selectedNetwork}
                    currentGraphData={{
                        nodes: graphData.nodes,
                        edges: graphData.edges,
                        metadata: {
                            description: networkHoconData?.metadata?.description || '',
                            model: networkHoconData?.llm_config?.model_name || 'gpt-4o',
                            temperature: networkHoconData?.llm_config?.temperature || 0.7,
                            maxTokens: networkHoconData?.llm_config?.max_tokens || 2000,
                            sample_queries: networkHoconData?.metadata?.sample_queries || []
                        }
                    }}
                />

                {/* MAIN CANVAS AREA */}
                <div
                    className="flex-1 flex flex-col bg-gray-50 dark:bg-[#0b0c0e] transition-colors duration-300 relative h-full"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    {/* Header */}
                    <header className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 bg-white dark:bg-[#111216] transition-colors duration-300 z-10">
                        <div className="flex items-center gap-4">
                            <h1 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                {selectedNetwork ? (
                                    <>
                                        <span className="text-gray-500 font-normal">Network /</span> {selectedNetwork.split('/').pop().replace(/_/g, ' ')}
                                    </>
                                ) : 'Select a Network'}
                            </h1>
                            {selectedNetwork && (
                                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-green-900/30 text-green-400 border border-green-800 rounded">Active</span>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {selectedNetwork && (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setIsArrangeMode(!isArrangeMode)}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all duration-200 border ${isArrangeMode
                                            ? 'bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30 shadow-sm'
                                            : 'bg-white dark:bg-[#1a1d21] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <Move size={14} className={isArrangeMode ? 'animate-pulse' : ''} /> Arrange
                                    </button>

                                    <button
                                        onClick={toggleConfigureMode}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all duration-200 border ${isConfigureMode
                                            ? 'bg-purple-50 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30 shadow-sm'
                                            : 'bg-white dark:bg-[#1a1d21] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <Settings size={14} /> Configure
                                    </button>

                                    <button
                                        onClick={handleExportNetwork}
                                        className="px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all duration-200 border bg-blue-600 dark:bg-blue-600 text-white border-blue-700 hover:bg-blue-700 dark:hover:bg-blue-500 shadow-sm"
                                        title="Export current network as HOCON file"
                                    >
                                        <Download size={14} /> Export
                                    </button>

                                    <button
                                        onClick={() => handleSaveToRegistry(false)}
                                        disabled={isSaving}
                                        className="px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all duration-200 border bg-green-600 dark:bg-green-600 text-white border-green-700 hover:bg-green-700 dark:hover:bg-green-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Save directly to registries folder"
                                    >
                                        <Save size={14} /> {isSaving ? 'Saving...' : 'Save to Registry'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </header>

                    {/* Canvas Content */}
                    <div className="flex-1 overflow-hidden relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
                        {selectedNetwork ? (
                            isGraphLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-gray-500 text-sm">Visualizing Neural Network...</p>
                                    </div>
                                </div>
                            ) : (
                                <StudioFlowCanvas
                                    nodes={graphData.nodes || []}
                                    connections={graphData.edges || []}
                                    onNodeClick={handleNodeClick}
                                    selectedNodeId={selectedAgentId}
                                    agentConfigs={agentConfig}
                                    onAddNode={(parentId, type) => handleAddChild(parentId, type)} // Pass add node handler
                                    onConnect={handleConnect} // Handle manual Shift+Click connections
                                    isArrangeMode={isArrangeMode}
                                    activeAgents={activeAgents}
                                    activeConnections={activeConnections}
                                />
                            )
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                                <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mb-6">
                                    <Network size={48} className="text-gray-600" />
                                </div>
                                <p className="text-xl font-light">Select a neural network architecture to begin</p>
                            </div>
                        )}
                    </div>

                    {/* Execution Logs Panel */}
                    {selectedNetwork && (
                        <div className={`shrink-0 z-20 border-t border-gray-200 dark:border-gray-800 transition-all duration-300 bg-white dark:bg-[#111214] ${isLogsPanelCollapsed ? 'h-8' : 'h-64'}`}>
                            <ExecutionLogsPanel
                                isCollapsed={isLogsPanelCollapsed}
                                onToggleCollapse={() => setIsLogsPanelCollapsed(!isLogsPanelCollapsed)}
                            />
                        </div>
                    )}
                </div>

                {/* NATIVE GENERATION CONSOLE (Absolute Bottom of Canvas) */}
                <NativeGenerationTerminal
                    isVisible={isNativeCompiling}
                    logs={nativeLogs}
                    onCancel={() => setIsNativeCompiling(false)}
                />

                {/* RIGHT SIDEBAR - ENHANCED AGENT EDITOR DRAWER */}
                {isDrawerOpen && selectedAgentId && (
                    <div className="w-[450px] border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111216] transition-colors duration-300 flex flex-col h-full shadow-2xl z-30 animate-in slide-in-from-right duration-300">
                        <AgentConfigDrawer
                            agentId={selectedAgentId}
                            agentConfig={currentAgent}
                            onSave={(savedConfig) => {
                                // Update agent config with all the new settings
                                setAgentConfig(prev => ({
                                    ...prev,
                                    [selectedAgentId]: {
                                        ...prev[selectedAgentId],
                                        label: savedConfig.label,
                                        instructions: savedConfig.instructions,
                                        command: savedConfig.command,
                                        function: savedConfig.function,
                                        tools: savedConfig.tools,
                                        mcp_servers: savedConfig.mcp_servers,
                                        model: savedConfig.model,
                                        llm_config: savedConfig.llm_config,
                                        memory: savedConfig.memory,
                                        logging: savedConfig.logging
                                    }
                                }));
                                setIsDrawerOpen(false);
                            }}
                            onClose={() => setIsDrawerOpen(false)}
                        />
                    </div>
                )}
            </div>

            {/* SETTINGS MODAL */}
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            {/* SAVE CONFIRMATION DIALOG */}
            {showSaveDialog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-[#1a1d21] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 max-w-md w-full mx-4">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                    Overwrite Existing Network?
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    The network "<span className="font-mono text-blue-600 dark:text-blue-400">{selectedNetwork}</span>" already exists in the registry.
                                    Do you want to replace it with the current version?
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowSaveDialog(false);
                                    setSaveDialogData(null);
                                }}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmOverwrite}
                                className="px-4 py-2 rounded-lg text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-sm"
                            >
                                Overwrite
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SAVE NOTIFICATION */}
            {saveNotification.show && (
                <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className={`rounded-lg shadow-lg border px-4 py-3 flex items-center gap-3 min-w-[300px] ${
                        saveNotification.type === 'success'
                            ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'
                    }`}>
                        {saveNotification.type === 'success' ? (
                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800/50 flex items-center justify-center shrink-0">
                                <Save className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-800/50 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                        )}
                        <p className={`text-sm font-medium ${
                            saveNotification.type === 'success'
                                ? 'text-green-900 dark:text-green-100'
                                : 'text-red-900 dark:text-red-100'
                        }`}>
                            {saveNotification.message}
                        </p>
                    </div>
                </div>
            )}

        </div>
    );
};

// Sub-component for sidebar icons
const SidebarIcon = ({ icon, active, onClick, title }) => (
    <button
        onClick={onClick}
        title={title}
        className={`w-full aspect-square flex items-center justify-center rounded-lg transition-all ${active
            ? 'bg-blue-50 dark:bg-[#1a1d21] text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30 shadow-sm'
            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-300'
            }`}>
        {icon}
    </button>
);

const AgentBuilderV2 = () => {
    return (
        <AgentNetworkProvider>
            <AgentBuilderV2Content />
        </AgentNetworkProvider>
    );
};

export default AgentBuilderV2;
