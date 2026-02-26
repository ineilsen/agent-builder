import React, { useState, useMemo, useEffect } from 'react';
import {
    Save, X, Wrench, Search, Plus, Trash2, CheckCircle, Circle,
    Cpu, MessageSquare, Terminal, Package, Info, Sliders, Activity, Database, HardDrive, Loader, Download, Sparkles, Bot, Server, Code, Cloud, Shield
} from 'lucide-react';
import FuturisticPromptEditor from './FuturisticPromptEditor';
import { saveAgentConfig } from '../services/agentApi';
import { useAgentNetwork } from '../context/AgentNetworkContext';

const AgentConfigDrawer = ({ agentId, agentConfig, onSave, onClose }) => {
    // Get real tools and MCP servers from context
    const { tools: contextTools, mcpServers: contextMcpServers } = useAgentNetwork();
    // Active tab management
    const [activeTab, setActiveTab] = useState('overview');
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
    const [pendingAgentId, setPendingAgentId] = useState(null);

    // Initialize config from props
    const initializeConfig = (config) => ({
        name: config?.label || agentId,
        description: config?.function?.description || '',
        instructions: config?.instructions || '',
        command: config?.command || '',

        // Function parameters
        functionParams: config?.function?.parameters?.properties || {},
        requiredParams: config?.function?.parameters?.required || [],

        // Tools
        selectedTools: config?.tools || [],

        // MCP
        selectedMcp: config?.mcp_servers || [],

        // LLM Config
        model: config?.model || 'gpt-4o',
        temperature: config?.llm_config?.temperature || 0.7,
        maxTokens: config?.llm_config?.max_tokens || 4096,

        // Memory & Logging
        memoryTable: config?.memory?.table || 'agent_memory_default',
        loggingEnabled: config?.logging !== false
    });

    // Local state for all configuration
    const [config, setConfig] = useState(() => initializeConfig(agentConfig));

    // **CRITICAL FIX**: Update config when agentId or agentConfig changes (switching agents)
    useEffect(() => {
        console.log('[AgentConfigDrawer] Agent switched:', { agentId, agentConfig, hasUnsavedChanges });

        // If we have unsaved changes and the agent is different, warn the user
        if (hasUnsavedChanges && pendingAgentId !== agentId) {
            setPendingAgentId(agentId);
            setShowUnsavedWarning(true);
            return; // Don't switch yet
        }

        // Otherwise, switch immediately
        setConfig(initializeConfig(agentConfig));
        setHasUnsavedChanges(false);
        setActiveTab('overview'); // Reset to overview when switching agents
        setPendingAgentId(null);
    }, [agentId]); // Re-run when agentId changes

    // Handle unsaved changes confirmation
    const handleDiscardChanges = () => {
        setConfig(initializeConfig(agentConfig));
        setHasUnsavedChanges(false);
        setShowUnsavedWarning(false);
        setPendingAgentId(null);
        setActiveTab('overview');
    };

    const handleKeepEditing = () => {
        setShowUnsavedWarning(false);
        // Don't clear pendingAgentId - we'll check it on next agent switch
    };

    // Track unsaved changes - wrapper around setConfig
    const updateConfig = (updates) => {
        setConfig(prev => ({ ...prev, ...updates }));
        setHasUnsavedChanges(true);
    };

    // Tool search and filter
    const [toolSearch, setToolSearch] = useState('');
    const [toolCategoryFilter, setToolCategoryFilter] = useState('All');
    const [mcpSearch, setMcpSearch] = useState('');

    // Transform context tools to UI format and extract categories
    const { availableTools, toolCategories } = useMemo(() => {
        if (!contextTools || contextTools.length === 0) {
            return { availableTools: [], toolCategories: ['All'] };
        }

        // Transform tools from context format to UI format
        const tools = contextTools.map(tool => ({
            id: tool.id,
            name: tool.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            category: tool.id.includes('search') ? 'Search' :
                      tool.id.includes('rag') ? 'Knowledge' :
                      tool.id.includes('image') || tool.id.includes('video') ? 'Media' :
                      tool.id.includes('code') ? 'Code' :
                      tool.id.includes('mail') || tool.id.includes('slack') ? 'Communication' :
                      tool.id.includes('agentforce') || tool.id.includes('agentspace') || tool.id.includes('now_agents') ? 'Agents' :
                      tool.id.includes('mcp') ? 'MCP' : 'General',
            icon: Bot, // Default icon
            description: tool.description || 'No description available'
        }));

        // Extract unique categories
        const categories = ['All', ...new Set(tools.map(t => t.category))].sort();

        return { availableTools: tools, toolCategories: categories };
    }, [contextTools]);

    // Filtered tools
    const filteredTools = useMemo(() => {
        let tools = availableTools;

        if (toolCategoryFilter !== 'All') {
            tools = tools.filter(t => t.category === toolCategoryFilter);
        }

        if (toolSearch) {
            tools = tools.filter(t =>
                t.name.toLowerCase().includes(toolSearch.toLowerCase()) ||
                t.description.toLowerCase().includes(toolSearch.toLowerCase())
            );
        }

        return tools;
    }, [availableTools, toolSearch, toolCategoryFilter]);

    // Transform context MCP servers to UI format
    const availableMcp = useMemo(() => {
        if (!contextMcpServers || contextMcpServers.length === 0) {
            return [];
        }

        // Map icon based on MCP server type
        const getIconForMcp = (mcpId, mcpClass) => {
            if (mcpId.includes('github') || mcpClass.includes('github')) return Code;
            if (mcpId.includes('aws') || mcpId.includes('cloud')) return Cloud;
            if (mcpId.includes('security') || mcpId.includes('gdpr')) return Shield;
            if (mcpId.includes('postgres') || mcpId.includes('database')) return Database;
            return Server; // Default icon
        };

        return contextMcpServers.map(mcp => ({
            id: mcp.id,
            name: mcp.name || mcp.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: mcp.description || 'No description available',
            organization: mcp.class?.split('.').pop() || 'Neuro SAN',
            icon: getIconForMcp(mcp.id, mcp.class || ''),
            iconBg: 'bg-blue-500',
            transport: mcp.transport || 'stdio',
            capabilities: mcp.capabilities || [],
            govApproved: false // Could be determined from metadata
        }));
    }, [contextMcpServers]);

    // Filtered MCP
    const filteredMcp = useMemo(() => {
        if (!mcpSearch) return availableMcp;
        return availableMcp.filter(mcp =>
            mcp.name.toLowerCase().includes(mcpSearch.toLowerCase()) ||
            mcp.description.toLowerCase().includes(mcpSearch.toLowerCase())
        );
    }, [availableMcp, mcpSearch]);

    // Toggle tool selection
    const toggleTool = (toolId) => {
        const newTools = config.selectedTools.includes(toolId)
            ? config.selectedTools.filter(id => id !== toolId)
            : [...config.selectedTools, toolId];
        updateConfig({ selectedTools: newTools });
    };

    // Toggle MCP selection
    const toggleMcp = (mcpId) => {
        const newMcp = config.selectedMcp.includes(mcpId)
            ? config.selectedMcp.filter(id => id !== mcpId)
            : [...config.selectedMcp, mcpId];
        updateConfig({ selectedMcp: newMcp });
    };

    // Add new parameter
    const [newParamName, setNewParamName] = useState('');
    const [showAddParam, setShowAddParam] = useState(false);

    const addParameter = () => {
        if (newParamName && !config.functionParams[newParamName]) {
            updateConfig({
                functionParams: {
                    ...config.functionParams,
                    [newParamName]: { type: 'string', description: '' }
                }
            });
            setNewParamName('');
            setShowAddParam(false);
        }
    };

    const removeParameter = (paramName) => {
        const newParams = { ...config.functionParams };
        delete newParams[paramName];
        updateConfig({
            functionParams: newParams,
            requiredParams: config.requiredParams.filter(p => p !== paramName)
        });
    };

    const updateParameter = (paramName, field, value) => {
        updateConfig({
            functionParams: {
                ...config.functionParams,
                [paramName]: {
                    ...config.functionParams[paramName],
                    [field]: value
                }
            }
        });
    };

    const toggleRequired = (paramName) => {
        const newRequired = config.requiredParams.includes(paramName)
            ? config.requiredParams.filter(p => p !== paramName)
            : [...config.requiredParams, paramName];
        updateConfig({ requiredParams: newRequired });
    };

    // Handle save with backend persistence
    const handleSave = async () => {
        setIsSaving(true);

        const savedConfig = {
            agentId,
            label: config.name,
            function: {
                description: config.description,
                parameters: {
                    type: 'object',
                    properties: config.functionParams,
                    required: config.requiredParams
                }
            },
            instructions: config.instructions,
            command: config.command,
            tools: config.selectedTools,
            mcp_servers: config.selectedMcp,
            model: config.model,
            llm_config: {
                temperature: config.temperature,
                max_tokens: config.maxTokens
            },
            memory: { table: config.memoryTable },
            logging: config.loggingEnabled
        };

        try {
            // Call backend API to persist configuration (with localStorage fallback)
            await saveAgentConfig(agentId, savedConfig);

            // Call parent's onSave to update local state
            onSave(savedConfig);
            setHasUnsavedChanges(false);

            console.log('✅ Agent configuration saved successfully:', agentId);
        } catch (error) {
            console.error('❌ Error saving agent configuration:', error);
            alert('Failed to save configuration. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // Tab definitions
    const tabs = [
        { id: 'overview', label: 'Overview', icon: Info },
        { id: 'function', label: 'Function', icon: Wrench },
        { id: 'instructions', label: 'Instructions', icon: MessageSquare },
        { id: 'tools', label: 'Tools', icon: Wrench, badge: config.selectedTools.length },
        { id: 'mcp', label: 'MCP', icon: Package, badge: config.selectedMcp.length },
        { id: 'model', label: 'Model', icon: Cpu },
        { id: 'advanced', label: 'Advanced', icon: Sliders }
    ];

    return (
        <>
            {/* Drawer Header */}
            <div className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 bg-gray-50 dark:bg-[#15161a]">
                <div className="flex items-center gap-3 flex-1">
                    {/* Cognizant Neuro AI Branding - Minimalist Corporate */}
                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white dark:bg-white rounded-lg border-2 border-gray-300 dark:border-gray-400 shadow-sm">
                        <img
                            src="/assets/Cognizant/cog-icon.png"
                            alt="Cognizant"
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                                console.error('Failed to load Cognizant logo');
                                e.target.style.display = 'none';
                            }}
                        />
                        <div className="flex flex-col -space-y-0.5">
                            <div className="text-[9px] font-black text-gray-800 uppercase tracking-tight leading-[1.1]">
                                Neuro AI
                            </div>
                            <div className="text-[7px] text-gray-600 font-semibold uppercase leading-tight">
                                Cognizant
                            </div>
                        </div>
                    </div>

                    {/* Vertical divider */}
                    <div className="h-8 w-px bg-gray-300 dark:bg-gray-700" />

                    <div className="flex-1">
                        <input
                            type="text"
                            value={config.name}
                            onChange={(e) => updateConfig({ name: e.target.value })}
                            className="text-sm font-bold text-gray-900 dark:text-white leading-tight bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-700 focus:border-purple-500 focus:outline-none transition-colors w-full px-1 -mx-1 py-0.5 rounded-sm"
                            placeholder="Agent Name"
                        />
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-500 font-mono block px-1">{agentId}</span>
                            {hasUnsavedChanges && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold">
                                    Unsaved
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            // Build agent-only HOCON
                            const agentHocon = `{
  "name": "${config.name}",
  "function": {
    "description": "${config.description || ''}",
    "parameters": ${JSON.stringify(config.functionParams || {}, null, 2)},
    "required": ${JSON.stringify(config.requiredParams || [])}
  },
  "instructions": """
${config.instructions || ''}
  """,
  "tools": [${(config.selectedTools || []).map(t => `"${t}"`).join(', ')}],
  "llm_config": {
    "model_name": "${config.model || 'gpt-4o'}",
    "temperature": ${config.temperature ?? 0.7},
    "max_tokens": ${config.maxTokens || 2000}
  }
}`;
                            // Download
                            const filename = `${config.name}_agent.hocon`;
                            const blob = new Blob([agentHocon], { type: 'text/plain;charset=utf-8' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = filename;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            console.log(`✅ Exported ${filename}`);
                        }}
                        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Export agent as HOCON"
                    >
                        <Download size={18} />
                    </button>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Tabs - Horizontal Scrollable */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto custom-scrollbar bg-white dark:bg-[#111216]">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap relative
                                ${activeTab === tab.id
                                    ? 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{tab.label}</span>
                            {tab.badge > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 text-[9px] rounded-full bg-purple-500 text-white font-bold">
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-5">
                        <div>
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                                Description
                            </label>
                            <textarea
                                value={config.description}
                                onChange={(e) => updateConfig({ description: e.target.value })}
                                className="w-full h-24 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-xs text-gray-800 dark:text-gray-300 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none resize-none transition-all"
                                placeholder="What does this agent do?"
                            />
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-500/10 dark:to-blue-500/10 rounded-xl p-4 border border-purple-200/50 dark:border-purple-500/20">
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-purple-500" />
                                Quick Stats
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{config.selectedTools.length}</div>
                                    <div className="text-[10px] text-gray-600 dark:text-gray-400 uppercase tracking-wide">Tools</div>
                                </div>
                                <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{config.selectedMcp.length}</div>
                                    <div className="text-[10px] text-gray-600 dark:text-gray-400 uppercase tracking-wide">MCP Servers</div>
                                </div>
                                <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{Object.keys(config.functionParams).length}</div>
                                    <div className="text-[10px] text-gray-600 dark:text-gray-400 uppercase tracking-wide">Parameters</div>
                                </div>
                                <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3">
                                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{config.model.split('-')[0].toUpperCase()}</div>
                                    <div className="text-[10px] text-gray-600 dark:text-gray-400 uppercase tracking-wide">Model</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Function Tab */}
                {activeTab === 'function' && (
                    <div className="space-y-5">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Function Parameters</h4>
                            <button
                                onClick={() => setShowAddParam(!showAddParam)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Parameter
                            </button>
                        </div>

                        {showAddParam && (
                            <div className="bg-purple-50 dark:bg-purple-500/10 rounded-xl p-4 border border-purple-200 dark:border-purple-500/20 space-y-3">
                                <input
                                    type="text"
                                    value={newParamName}
                                    onChange={(e) => setNewParamName(e.target.value)}
                                    placeholder="Parameter name (e.g., query, mode)"
                                    className="w-full bg-white dark:bg-black/20 border border-purple-200 dark:border-purple-500/20 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-gray-300 focus:ring-2 focus:ring-purple-500/50 outline-none"
                                    onKeyDown={(e) => e.key === 'Enter' && addParameter()}
                                />
                                <div className="flex gap-2">
                                    <button onClick={addParameter} className="flex-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg py-2 text-xs font-medium">
                                        Add
                                    </button>
                                    <button onClick={() => setShowAddParam(false)} className="px-4 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg py-2 text-xs font-medium">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {Object.entries(config.functionParams).map(([paramName, paramConfig]) => (
                                <div key={paramName} className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleRequired(paramName)}
                                                className="transition-all"
                                            >
                                                {config.requiredParams.includes(paramName) ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Circle className="w-4 h-4 text-gray-400" />
                                                )}
                                            </button>
                                            <code className="font-mono text-xs font-bold text-gray-900 dark:text-white">{paramName}</code>
                                            {config.requiredParams.includes(paramName) && (
                                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium">Required</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => removeParameter(paramName)}
                                            className="p-1 hover:bg-red-100 dark:hover:bg-red-500/20 rounded text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <div>
                                            <label className="text-[10px] text-gray-500 mb-1 block">Type</label>
                                            <select
                                                value={paramConfig.type}
                                                onChange={(e) => updateParameter(paramName, 'type', e.target.value)}
                                                className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300"
                                            >
                                                <option value="string">string</option>
                                                <option value="number">number</option>
                                                <option value="boolean">boolean</option>
                                                <option value="array">array</option>
                                                <option value="object">object</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-500 mb-1 block">Description</label>
                                            <textarea
                                                value={paramConfig.description}
                                                onChange={(e) => updateParameter(paramName, 'description', e.target.value)}
                                                className="w-full h-16 bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 resize-none"
                                                placeholder="Describe this parameter..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Instructions Tab */}
                {activeTab === 'instructions' && (
                    <div className="space-y-5">
                        <div>
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <MessageSquare className="w-3.5 h-3.5" />
                                System Instructions
                            </label>
                            <FuturisticPromptEditor
                                value={config.instructions}
                                onChange={(val) => updateConfig({ instructions: val })}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Terminal className="w-3.5 h-3.5" />
                                Response Command Template
                            </label>
                            <textarea
                                value={config.command}
                                onChange={(e) => updateConfig({ command: e.target.value })}
                                className="w-full h-32 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-xs font-mono text-gray-800 dark:text-gray-300 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none resize-none leading-relaxed"
                                placeholder="Define response format (JSON, text, etc.)..."
                            />
                        </div>
                    </div>
                )}

                {/* Tools Tab */}
                {activeTab === 'tools' && (
                    <div className="space-y-5">
                        {/* Header with tool count */}
                        <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-500/10 dark:to-blue-500/10 rounded-xl p-4 border border-purple-200/50 dark:border-purple-500/20">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-500" />
                                <span className="text-xs font-bold text-gray-900 dark:text-white">
                                    Real Neuro SAN Tools
                                </span>
                            </div>
                            <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                                {availableTools.length} tools available
                            </span>
                        </div>

                        {/* Search and Filter */}
                        <div className="space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={toolSearch}
                                    onChange={(e) => setToolSearch(e.target.value)}
                                    placeholder="Search tools..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-800 dark:text-gray-300 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {toolCategories.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => setToolCategoryFilter(category)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all
                                            ${toolCategoryFilter === category
                                                ? 'bg-purple-500 text-white shadow-sm'
                                                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Selected Tools */}
                        {config.selectedTools.length > 0 && (
                            <div className="bg-purple-50 dark:bg-purple-500/10 rounded-xl p-4 border border-purple-200 dark:border-purple-500/20">
                                <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300 mb-3 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Selected Tools ({config.selectedTools.length})
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {config.selectedTools.map(toolId => {
                                        const tool = availableTools.find(t => t.id === toolId);
                                        if (!tool) return null;
                                        const Icon = tool.icon;
                                        return (
                                            <div
                                                key={toolId}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-black/20 rounded-lg border border-purple-200 dark:border-purple-500/20"
                                            >
                                                <Icon className="w-3.5 h-3.5 text-purple-500" />
                                                <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{tool.name}</span>
                                                <button
                                                    onClick={() => toggleTool(toolId)}
                                                    className="p-0.5 hover:bg-red-100 dark:hover:bg-red-500/20 rounded text-red-500 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Available Tools */}
                        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                            {filteredTools.length === 0 && availableTools.length === 0 ? (
                                <div className="text-center py-12">
                                    <Loader className="w-8 h-8 animate-spin mx-auto text-purple-500 mb-3" />
                                    <p className="text-xs text-gray-500">Loading tools from Neuro SAN...</p>
                                </div>
                            ) : filteredTools.length === 0 ? (
                                <div className="text-center py-12">
                                    <Search className="w-8 h-8 mx-auto text-gray-400 mb-3" />
                                    <p className="text-xs text-gray-500">No tools match your search</p>
                                </div>
                            ) : (
                                filteredTools.map(tool => {
                                    const Icon = tool.icon;
                                    const isSelected = config.selectedTools.includes(tool.id);
                                    return (
                                        <button
                                            key={tool.id}
                                            onClick={() => toggleTool(tool.id)}
                                            className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left
                                                ${isSelected
                                                    ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30'
                                                    : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-white/10'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400'}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h5 className="text-xs font-semibold text-gray-900 dark:text-white">{tool.name}</h5>
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400">
                                                        {tool.category}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{tool.description}</p>
                                            </div>
                                            {isSelected && (
                                                <CheckCircle className="w-5 h-5 text-purple-500 shrink-0" />
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* MCP Tab */}
                {activeTab === 'mcp' && (
                    <div className="space-y-5">
                        {/* Header with MCP count */}
                        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-xl p-4 border border-blue-200/50 dark:border-blue-500/20">
                            <div className="flex items-center gap-2">
                                <Server className="w-4 h-4 text-blue-500" />
                                <span className="text-xs font-bold text-gray-900 dark:text-white">
                                    Real MCP Servers
                                </span>
                            </div>
                            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                                {availableMcp.length} servers available
                            </span>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={mcpSearch}
                                onChange={(e) => setMcpSearch(e.target.value)}
                                placeholder="Search MCP servers..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-800 dark:text-gray-300 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none"
                            />
                        </div>

                        {/* Selected MCP */}
                        {config.selectedMcp.length > 0 && (
                            <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 border border-blue-200 dark:border-blue-500/20">
                                <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    Active MCP Servers ({config.selectedMcp.length})
                                </h4>
                                <div className="space-y-2">
                                    {config.selectedMcp.map(mcpId => {
                                        const mcp = mcpData.find(m => m.id === mcpId);
                                        if (!mcp) return null;
                                        const Icon = mcp.icon;
                                        return (
                                            <div
                                                key={mcpId}
                                                className="flex items-center gap-3 p-3 bg-white dark:bg-black/20 rounded-lg border border-blue-200 dark:border-blue-500/20"
                                            >
                                                <div className={`w-8 h-8 rounded-lg ${mcp.iconBg} flex items-center justify-center text-white shrink-0`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="text-xs font-semibold text-gray-900 dark:text-white">{mcp.name}</h5>
                                                    <p className="text-[10px] text-gray-500">{mcp.organization}</p>
                                                </div>
                                                <button
                                                    onClick={() => toggleMcp(mcpId)}
                                                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-500/20 rounded text-red-500 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Available MCP */}
                        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                            {filteredMcp.length === 0 && availableMcp.length === 0 ? (
                                <div className="text-center py-12">
                                    <Loader className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-3" />
                                    <p className="text-xs text-gray-500">Loading MCP servers from Neuro SAN...</p>
                                </div>
                            ) : filteredMcp.length === 0 ? (
                                <div className="text-center py-12">
                                    <Search className="w-8 h-8 mx-auto text-gray-400 mb-3" />
                                    <p className="text-xs text-gray-500">No MCP servers match your search</p>
                                </div>
                            ) : (
                                filteredMcp.map(mcp => {
                                    const Icon = mcp.icon;
                                    const isSelected = config.selectedMcp.includes(mcp.id);
                                    return (
                                        <button
                                            key={mcp.id}
                                            onClick={() => toggleMcp(mcp.id)}
                                            className={`w-full flex items-start gap-3 p-4 rounded-xl border transition-all text-left
                                                ${isSelected
                                                    ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30 shadow-sm'
                                                    : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-white/10'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl ${mcp.iconBg} flex items-center justify-center text-white shrink-0`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h5 className="text-xs font-bold text-gray-900 dark:text-white">{mcp.name}</h5>
                                                    {mcp.govApproved && (
                                                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-bold">GOV</span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{mcp.description}</p>
                                                <div className="flex items-center gap-2 text-[9px] text-gray-500">
                                                    <span>{mcp.organization}</span>
                                                    <span>•</span>
                                                    <span>{mcp.transport}</span>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <CheckCircle className="w-5 h-5 text-blue-500 shrink-0" />
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* Model Tab */}
                {activeTab === 'model' && (
                    <div className="space-y-5">
                        <div>
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <Cpu className="w-3.5 h-3.5" />
                                Model Selection
                            </label>
                            <select
                                value={config.model}
                                onChange={(e) => updateConfig({ model: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-purple-500/50 outline-none"
                            >
                                <option value="gpt-4o">GPT-4o (OpenAI)</option>
                                <option value="gpt-4-turbo">GPT-4 Turbo (OpenAI)</option>
                                <option value="claude-3-opus">Claude 3 Opus (Anthropic)</option>
                                <option value="claude-3-sonnet">Claude 3.5 Sonnet (Anthropic)</option>
                                <option value="claude-3-haiku">Claude 3 Haiku (Anthropic)</option>
                                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Google)</option>
                            </select>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Sliders className="w-3.5 h-3.5" />
                                        Temperature
                                    </label>
                                    <span className="text-xs font-mono font-bold text-purple-500">{config.temperature}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="2"
                                    step="0.1"
                                    value={config.temperature}
                                    onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) })}
                                    className="w-full accent-purple-500"
                                />
                                <div className="flex justify-between text-[9px] text-gray-500 mt-1">
                                    <span>Deterministic</span>
                                    <span>Balanced</span>
                                    <span>Creative</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Max Tokens</label>
                                <input
                                    type="number"
                                    value={config.maxTokens}
                                    onChange={(e) => updateConfig({ maxTokens: parseInt(e.target.value) })}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-purple-500/50 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Advanced Tab */}
                {activeTab === 'advanced' && (
                    <div className="space-y-5">
                        <div>
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Database className="w-3.5 h-3.5" />
                                Memory Table
                            </label>
                            <div className="relative">
                                <HardDrive className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={config.memoryTable}
                                    onChange={(e) => updateConfig({ memoryTable: e.target.value })}
                                    className="w-full pl-10 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs text-gray-700 dark:text-gray-300 font-mono focus:ring-2 focus:ring-purple-500/50 outline-none"
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.loggingEnabled ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-gray-200 dark:bg-white/10 text-gray-500'}`}>
                                    <Activity className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">Execution Logging</h4>
                                    <p className="text-[10px] text-gray-500">Log all inputs and outputs</p>
                                </div>
                            </div>
                            <button
                                onClick={() => updateConfig({ loggingEnabled: !config.loggingEnabled })}
                                className={`w-12 h-6 rounded-full relative transition-all ${config.loggingEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${config.loggingEnabled ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#15161a] transition-colors duration-300 flex justify-end gap-3">
                <button
                    onClick={onClose}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2 shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isSaving ? (
                        <>
                            <Loader size={16} className="animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            {/* Unsaved Changes Warning Modal */}
            {showUnsavedWarning && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1a1b1f] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md mx-4 animate-in zoom-in duration-200">
                        <div className="flex items-start gap-4 mb-5">
                            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center shrink-0">
                                <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                    Unsaved Changes
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    You have unsaved changes to this agent configuration. Do you want to discard them and switch agents?
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleKeepEditing}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                            >
                                Keep Editing
                            </button>
                            <button
                                onClick={handleDiscardChanges}
                                className="px-4 py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                            >
                                Discard Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AgentConfigDrawer;
