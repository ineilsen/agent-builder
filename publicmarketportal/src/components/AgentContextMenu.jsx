import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Wrench, Globe, Check, Plus, Trash2 } from 'lucide-react';
import { availableTools, toolCategories } from '../data/toolsData';
import { mcpData } from '../data/mcpData';

/**
 * Floating context menu for adding tools and MCP connections to an agent
 * Opens on right-click of an agent node
 */
const AgentContextMenu = ({
    isOpen,
    position,
    agentId,
    agentName,
    currentTools = [],
    currentMCPs = [],
    onClose,
    onAddTool,
    onRemoveTool,
    onAddMCP,
    onRemoveMCP,
    onApply
}) => {
    const [activeTab, setActiveTab] = useState('tools');
    const [toolSearch, setToolSearch] = useState('');
    const [mcpSearch, setMcpSearch] = useState('');
    const [selectedTools, setSelectedTools] = useState(new Set(currentTools));
    const [selectedMCPs, setSelectedMCPs] = useState(new Set(currentMCPs));
    const [toolCategory, setToolCategory] = useState('All');
    const menuRef = useRef(null);

    // Sync with props when opened
    useEffect(() => {
        if (isOpen) {
            setSelectedTools(new Set(currentTools));
            setSelectedMCPs(new Set(currentMCPs));
            setToolSearch('');
            setMcpSearch('');
            setToolCategory('All');
        }
    }, [isOpen, currentTools, currentMCPs]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    // Close on Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Filter tools
    const filteredTools = availableTools.filter(tool => {
        const matchesSearch = toolSearch === '' ||
            tool.name.toLowerCase().includes(toolSearch.toLowerCase()) ||
            tool.description.toLowerCase().includes(toolSearch.toLowerCase());
        const matchesCategory = toolCategory === 'All' || tool.category === toolCategory;
        return matchesSearch && matchesCategory;
    });

    // Filter MCPs
    const filteredMCPs = mcpData.filter(mcp =>
        mcpSearch === '' ||
        mcp.name.toLowerCase().includes(mcpSearch.toLowerCase()) ||
        mcp.description.toLowerCase().includes(mcpSearch.toLowerCase())
    );

    const toggleTool = (toolId) => {
        setSelectedTools(prev => {
            const next = new Set(prev);
            if (next.has(toolId)) {
                next.delete(toolId);
            } else {
                next.add(toolId);
            }
            return next;
        });
    };

    const toggleMCP = (mcpId) => {
        setSelectedMCPs(prev => {
            const next = new Set(prev);
            if (next.has(mcpId)) {
                next.delete(mcpId);
            } else {
                next.add(mcpId);
            }
            return next;
        });
    };

    const handleApply = () => {
        // Calculate changes
        const addedTools = [...selectedTools].filter(t => !currentTools.includes(t));
        const removedTools = currentTools.filter(t => !selectedTools.has(t));
        const addedMCPs = [...selectedMCPs].filter(m => !currentMCPs.includes(m));
        const removedMCPs = currentMCPs.filter(m => !selectedMCPs.has(m));

        // Apply changes
        addedTools.forEach(t => onAddTool?.(agentId, t));
        removedTools.forEach(t => onRemoveTool?.(agentId, t));
        addedMCPs.forEach(m => onAddMCP?.(agentId, m));
        removedMCPs.forEach(m => onRemoveMCP?.(agentId, m));

        onApply?.({
            agentId,
            tools: [...selectedTools],
            mcps: [...selectedMCPs]
        });
        onClose();
    };

    const hasChanges = () => {
        const toolsChanged = currentTools.length !== selectedTools.size ||
            currentTools.some(t => !selectedTools.has(t));
        const mcpsChanged = currentMCPs.length !== selectedMCPs.size ||
            currentMCPs.some(m => !selectedMCPs.has(m));
        return toolsChanged || mcpsChanged;
    };

    // Position the menu - keep it within viewport
    const menuStyle = {
        position: 'fixed',
        left: Math.min(position.x, window.innerWidth - 420),
        top: Math.min(position.y, window.innerHeight - 500),
        zIndex: 1000
    };

    return (
        <div
            ref={menuRef}
            style={menuStyle}
            className="w-[400px] max-h-[480px] bg-white/95 dark:bg-[#1a1d21]/95 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-white/10 shadow-2xl dark:shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
        >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Plus className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Configure Agent</h3>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{agentName || agentId}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                    <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-white/5">
                <button
                    onClick={() => setActiveTab('tools')}
                    className={`flex-1 px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 transition-colors
            ${activeTab === 'tools'
                            ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-500 bg-cyan-50/50 dark:bg-cyan-500/10'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    <Wrench className="w-3.5 h-3.5" />
                    Tools
                    <span className="px-1.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-[10px]">
                        {selectedTools.size}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('mcp')}
                    className={`flex-1 px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 transition-colors
            ${activeTab === 'mcp'
                            ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    <Globe className="w-3.5 h-3.5" />
                    MCP Servers
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-[10px]">
                        {selectedMCPs.size}
                    </span>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {activeTab === 'tools' && (
                    <>
                        {/* Search & Filter */}
                        <div className="p-3 space-y-2 border-b border-gray-100 dark:border-white/5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search tools..."
                                    value={toolSearch}
                                    onChange={(e) => setToolSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-gray-900 dark:text-white placeholder-gray-400"
                                />
                            </div>
                            <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar">
                                {toolCategories.slice(0, 7).map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setToolCategory(cat)}
                                        className={`px-2 py-1 text-[10px] font-medium rounded-md whitespace-nowrap transition-colors
                      ${toolCategory === cat
                                                ? 'bg-cyan-500 text-white'
                                                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tool List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {filteredTools.map(tool => {
                                const isSelected = selectedTools.has(tool.id);
                                const Icon = tool.icon;
                                return (
                                    <div
                                        key={tool.id}
                                        onClick={() => toggleTool(tool.id)}
                                        className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all
                      ${isSelected
                                                ? 'bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30'
                                                : 'hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                      ${isSelected ? 'bg-cyan-500 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">{tool.name}</span>
                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-500">{tool.category}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{tool.description}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                      ${isSelected
                                                ? 'bg-cyan-500 border-cyan-500'
                                                : 'border-gray-300 dark:border-gray-600'}`}>
                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredTools.length === 0 && (
                                <div className="text-center py-8 text-gray-400 text-xs">
                                    No tools match your search
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'mcp' && (
                    <>
                        {/* MCP Search */}
                        <div className="p-3 border-b border-gray-100 dark:border-white/5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search MCP servers..."
                                    value={mcpSearch}
                                    onChange={(e) => setMcpSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-gray-900 dark:text-white placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* MCP List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {filteredMCPs.map(mcp => {
                                const isSelected = selectedMCPs.has(mcp.id);
                                const Icon = mcp.icon;
                                return (
                                    <div
                                        key={mcp.id}
                                        onClick={() => toggleMCP(mcp.id)}
                                        className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all
                      ${isSelected
                                                ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30'
                                                : 'hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${mcp.iconBg}`}>
                                            <Icon className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">{mcp.name}</span>
                                                {mcp.govApproved && (
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400">Gov</span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{mcp.organization}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                      ${isSelected
                                                ? 'bg-emerald-500 border-emerald-500'
                                                : 'border-gray-300 dark:border-gray-600'}`}>
                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredMCPs.length === 0 && (
                                <div className="text-center py-8 text-gray-400 text-xs">
                                    No MCP servers match your search
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 flex items-center justify-between">
                <div className="text-[10px] text-gray-500">
                    {selectedTools.size} tools, {selectedMCPs.size} MCPs selected
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        disabled={!hasChanges()}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all
              ${hasChanges()
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25'
                                : 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed'}`}
                    >
                        Apply Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AgentContextMenu;
