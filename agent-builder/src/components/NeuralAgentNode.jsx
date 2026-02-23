import React, { useState } from 'react';
import {
    Bot, CircuitBoard, Wrench, Globe, MoreHorizontal,
    ChevronDown, Cpu, Thermometer, Hash, Zap
} from 'lucide-react';
import './neural-flow.css';

/**
 * NeuralAgentNode - Futuristic enterprise-grade agent card
 * 
 * Features:
 * - Compact pill-shaped design with progressive disclosure
 * - Status ring animations based on agent type
 * - Expandable details panel
 * - Professional enterprise aesthetic
 */
const NeuralAgentNode = ({
    node,
    onMouseDown,
    isSelected,
    isActive = false,
    onClick,
    onMenuClick,
    onContextMenu,
    agentConfig,
    agentTools = [],
    agentMCPs = [],
    onAddChild,
    isArrangeMode = false
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { type, data } = node;

    // Type configuration with colors and icons
    const getTypeConfig = (type) => {
        switch (type) {
            case 'frontman':
                return {
                    icon: CircuitBoard,
                    label: 'Main Agent',
                    colorClass: 'purple',
                    typeClass: 'type-frontman'
                };
            case 'tool':
                return {
                    icon: Wrench,
                    label: 'Tool',
                    colorClass: 'cyan',
                    typeClass: 'type-tool'
                };
            case 'sub-network':
                return {
                    icon: Globe,
                    label: 'Network',
                    colorClass: 'emerald',
                    typeClass: 'type-network'
                };
            case 'agent':
            default:
                return {
                    icon: Bot,
                    label: 'Agent',
                    colorClass: 'blue',
                    typeClass: 'type-agent'
                };
        }
    };

    const config = getTypeConfig(type);
    const Icon = config.icon;

    // Extract metadata from node data
    const modelName = data?.llmModel;
    const llmProvider = data?.llmProvider;
    const temp = data?.llmTemperature;
    const hasCustomLlm = data?.hasCustomLlm;

    // Combine tools from data and props
    const allTools = [...(data?.dropdownTools || []), ...agentTools];
    const allMCPs = [...(data?.subNetworks || []), ...agentMCPs];
    const displayTools = allTools.slice(0, 3);
    const extraToolCount = Math.max(0, allTools.length - 3);

    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu?.(e, node);
    };

    const handleExpandToggle = (e) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <div
            id={node.id}
            className={`neural-node absolute ${config.typeClass} ${isSelected ? 'selected' : ''} ${isActive ? 'active' : ''} ${isExpanded ? 'expanded' : ''} select-none`}
            style={{
                transform: `translate(${node.position ? node.position.x : node.x}px, ${node.position ? node.position.y : node.y}px)`,
                willChange: 'transform',
                transition: 'none', // Ensure no transition on the wrapper during drag
                cursor: isArrangeMode ? 'grab' : 'pointer'
            }}
            onMouseDown={(e) => {
                if (isArrangeMode) {
                    e.stopPropagation();
                    e.preventDefault(); // Prevent native HTML dragging or text selection
                    onMouseDown(e, node);
                }
            }}
            onClick={onClick}
            onContextMenu={handleContextMenu}
        >
            {/* Main Content Row */}
            <div className="flex items-start gap-3 p-4">
                {/* Icon Container */}
                <div className={`neural-icon-container ${config.colorClass}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div >

                {/* Info Section */}
                < div className="flex-1 min-w-0" >
                    <div className="flex items-center justify-between gap-2">
                        <h4
                            className="text-sm font-bold text-gray-900 dark:text-white leading-tight truncate"
                            title={data?.label}
                        >
                            {data?.label}
                        </h4>
                        <div className="flex items-center gap-1 shrink-0">
                            {/* Expand Button */}
                            {(allTools.length > 0 || allMCPs.length > 0 || data?.instructions) && (
                                <button
                                    onClick={handleExpandToggle}
                                    className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                >
                                    <ChevronDown className={`w-4 h-4 text-gray-400 neural-expand-icon ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                            )}
                            {/* Menu Button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); onMenuClick?.(node.id); }}
                                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                                <MoreHorizontal className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                            </button>
                        </div>
                    </div>

                    {/* Brief Description */}
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug neural-line-clamp-2 mt-1">
                        {data?.instructions || 'No description'}
                    </p>
                </div >
            </div >

            {/* Compact Meta Pills */}
            < div className="neural-meta-pills px-4 pb-3" >
                {/* Model Badge */}
                {
                    modelName && (
                        <span className={`neural-pill ${hasCustomLlm ? 'model' : ''}`}>
                            <Cpu className="w-3 h-3" />
                            <span className="truncate max-w-[80px]">
                                {llmProvider ? `${llmProvider}/` : ''}{modelName}
                            </span>
                        </span>
                    )
                }

                {/* Temperature */}
                {
                    temp !== undefined && (
                        <span className="neural-pill">
                            <Thermometer className="w-3 h-3" />
                            {temp}
                        </span>
                    )
                }

                {/* Tool Count */}
                {
                    allTools.length > 0 && (
                        <span className="neural-pill">
                            <Wrench className="w-3 h-3" />
                            {allTools.length} tools
                        </span>
                    )
                }

                {/* MCP Count */}
                {
                    allMCPs.length > 0 && (
                        <span className="neural-pill">
                            <Globe className="w-3 h-3" />
                            {allMCPs.length} MCPs
                        </span>
                    )
                }
            </div >

            {/* Expandable Details Panel */}
            < div className="neural-expand-panel" >
                {/* Full Instructions */}
                {
                    data?.instructions && (
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-3.5 h-3.5 text-purple-500" />
                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Instructions</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-h-24 overflow-y-auto custom-scrollbar">
                                {data?.instructions}
                            </p>
                        </div>
                    )
                }

                {/* Tools List */}
                {
                    allTools.length > 0 && (
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Wrench className="w-3.5 h-3.5 text-cyan-500" />
                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tools</span>
                            </div>
                            <div className="neural-tools-grid">
                                {allTools.map((tool, idx) => (
                                    <div key={idx} className="neural-tool-chip" title={tool}>
                                        <Wrench className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{tool}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }

                {/* MCPs List */}
                {
                    allMCPs.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">MCP Connections</span>
                            </div>
                            <div className="neural-tools-grid">
                                {allMCPs.map((mcp, idx) => (
                                    <div key={idx} className="neural-mcp-chip" title={mcp}>
                                        <Globe className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{mcp}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }

                {/* Empty State */}
                {
                    allTools.length === 0 && allMCPs.length === 0 && !data?.instructions && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4 italic">
                            Right-click to configure this agent
                        </p>
                    )
                }
            </div >

            {/* Connection Ports */}
            {/* Top Port (Input) */}
            <div className="neural-port top" />

            {/* Bottom Port (Output/Add) - Only for Agents/Frontman */}
            {
                (type !== 'tool' && type !== 'sub-network') && (
                    <div className={`neural-port bottom group/port ${isSelected ? 'is-selected' : ''}`}>
                        {/* Visual Dot */}
                        <div className={`w-3 h-3 bg-white dark:bg-[#1a1d21] border-2 border-gray-400 dark:border-gray-600 rounded-full transition-all duration-300 ${isSelected ? 'border-blue-500 bg-blue-500 scale-110' : ''}`} />

                        {/* Hit Area & Button Container - Explicitly high z-index and clickability */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center z-[100] cursor-pointer">
                            <button
                                className={`
                            w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white
                            shadow-lg shadow-blue-600/40 transition-all duration-200 transform
                            hover:scale-125 active:scale-95
                            ${isSelected ? 'opacity-100 translate-y-6 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none group-hover/port:opacity-100 group-hover/port:translate-y-6 group-hover/port:pointer-events-auto'}
                        `}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onAddChild && onAddChild(node.id, e);
                                }}
                                title="Add connected node"
                            >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default NeuralAgentNode;
