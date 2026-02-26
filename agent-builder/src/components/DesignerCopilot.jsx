import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, Sparkles, CheckCircle2, Loader2, GitBranch, XCircle, RefreshCw, Maximize2, X, ChevronDown, ChevronRight, Zap, Network, Wrench, Plus, Eye, MessageSquare, Terminal, Download } from 'lucide-react';
import agentBuilderService from '../services/agentBuilderService';
import StudioChatPanel from './StudioChatPanel';
import { useAgentNetwork } from '../context/AgentNetworkContext';

// ---------- Mermaid Renderer ----------
const MermaidDiagram = ({ plan }) => {
    const containerRef = useRef(null);
    const [error, setError] = useState(null);

    const buildDiagram = useCallback(() => {
        if (!plan?.connections || plan.connections.length === 0) return null;
        const newAgents = new Set([...(plan.agents?.new || [])]);
        const lines = [`flowchart TD`];
        const nodeIds = {};
        let nodeCounter = 0;

        const getNodeId = (name) => {
            if (!nodeIds[name]) {
                nodeIds[name] = `N${nodeCounter++}`;
            }
            return nodeIds[name];
        };

        plan.connections.forEach(([from, to]) => {
            const fromId = getNodeId(from);
            const toId = getNodeId(to);
            const fromLabel = from.replace(/['"]/g, '');
            const toLabel = to.replace(/['"]/g, '');
            const fromStyle = newAgents.has(from) ? `${fromId}(["✨ ${fromLabel}"])` : `${fromId}["${fromLabel}"]`;
            const toStyle = newAgents.has(to) ? `${toId}(["✨ ${toLabel}"])` : `${toId}["${toLabel}"]`;
            lines.push(`    ${fromStyle} --> ${toStyle}`);
        });

        // Style new nodes
        const newIds = [...newAgents].map(n => nodeIds[n]).filter(Boolean);
        if (newIds.length > 0) {
            lines.push(`    classDef newNode fill:#16a34a,stroke:#15803d,color:#fff`);
            lines.push(`    class ${newIds.join(',')} newNode`);
        }

        return lines.join('\n');
    }, [plan]);

    useEffect(() => {
        if (!containerRef.current) return;
        const diagram = buildDiagram();
        if (!diagram) {
            containerRef.current.innerHTML = '<p class="text-gray-400 text-sm text-center pt-8">No connections to preview</p>';
            return;
        }

        import('mermaid').then(({ default: mermaid }) => {
            mermaid.initialize({
                startOnLoad: false,
                theme: 'dark',
                flowchart: { curve: 'basis', useMaxWidth: true },
                themeVariables: {
                    primaryColor: '#1e40af',
                    primaryTextColor: '#e2e8f0',
                    primaryBorderColor: '#3b82f6',
                    lineColor: '#64748b',
                    secondaryColor: '#0f172a',
                    tertiaryColor: '#1e293b',
                    background: '#0f172a',
                    nodeBorder: '#3b82f6',
                }
            });

            const id = `mermaid-${Date.now()}`;
            mermaid.render(id, diagram)
                .then(({ svg }) => {
                    if (containerRef.current) {
                        containerRef.current.innerHTML = svg;
                        const svgEl = containerRef.current.querySelector('svg');
                        if (svgEl) {
                            svgEl.style.maxWidth = '100%';
                            svgEl.style.height = 'auto';
                        }
                    }
                })
                .catch(err => {
                    console.error('Mermaid render error:', err);
                    setError('Could not render diagram');
                });
        });
    }, [buildDiagram]);

    if (error) return <div className="text-red-400 text-xs p-4">{error}</div>;
    return <div ref={containerRef} className="flex items-center justify-center min-h-[200px] p-4" />;
};

// ---------- Expandable Plan Modal ----------
const PlanModal = ({ plan, onClose, onApprove, onCancel, isApproving }) => {
    const [hoconOpen, setHoconOpen] = useState(false);

    if (!plan) return null;

    const newAgents = plan.agents?.new || [];
    const existingAgents = plan.agents?.existing || [];
    const newTools = plan.tools?.new || [];
    const existingTools = plan.tools?.existing || [];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 dark:bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div
                className="w-full max-w-[90vw] h-[90vh] bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#111827] flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center">
                            <Network size={18} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 dark:text-white text-base">{plan.title}</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Architecture Change Preview</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel — Plan Details */}
                    <div className="w-[420px] flex-shrink-0 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-y-auto custom-scrollbar p-6 gap-6">

                        {/* Description */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">What's Changing</h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{plan.description}</p>
                        </div>

                        {/* Change List */}
                        {plan.changes && plan.changes.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Specific Changes</h3>
                                <ul className="space-y-2">
                                    {plan.changes.map((change, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                                            <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">→</span>
                                            <span>{change}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Agents */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                Agents
                                {newAgents.length > 0 && (
                                    <span className="ml-2 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 text-[10px] px-1.5 py-0.5 rounded-full border border-green-200 dark:border-green-700">
                                        +{newAgents.length} new
                                    </span>
                                )}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {newAgents.map(a => (
                                    <span key={a} className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/40 dark:border-green-700 dark:text-green-300 text-xs font-medium">
                                        <Plus size={10} /> {a}
                                    </span>
                                ))}
                                {existingAgents.map(a => (
                                    <span key={a} className="px-2 py-1 rounded-md bg-gray-100 border border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 text-xs">
                                        {a}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Tools */}
                        {(newTools.length > 0 || existingTools.length > 0) && (
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                    Tools
                                    {newTools.length > 0 && (
                                        <span className="ml-2 bg-purple-900/50 text-purple-400 text-[10px] px-1.5 py-0.5 rounded-full border border-purple-700">
                                            +{newTools.length} new
                                        </span>
                                    )}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {newTools.map(t => (
                                        <span key={t} className="flex items-center gap-1 px-2 py-1 rounded-md bg-purple-50 border border-purple-200 text-purple-700 dark:bg-purple-900/40 dark:border-purple-700 dark:text-purple-300 text-xs font-medium">
                                            <Plus size={10} /> {t}
                                        </span>
                                    ))}
                                    {existingTools.map(t => (
                                        <span key={t} className="px-2 py-1 rounded-md bg-gray-100 border border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 text-xs font-mono">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* HOCON Toggle */}
                        {plan.hocon && (
                            <div>
                                <button
                                    onClick={() => setHoconOpen(v => !v)}
                                    className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors font-mono"
                                >
                                    {hoconOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    View HOCON ({plan.hocon.split('\n').length} lines)
                                </button>
                                {hoconOpen && (
                                    <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black custom-scrollbar">
                                        <pre className="p-3 text-[10px] text-green-600 dark:text-green-400 font-mono whitespace-pre-wrap">{plan.hocon}</pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Panel — Mermaid Graph */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 pt-4 pb-2 flex-shrink-0 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800/50">
                            <GitBranch size={14} className="text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Network Topology Preview</span>
                            <span className="ml-auto text-[10px] text-gray-500 dark:text-gray-600">✨ = New Agent</span>
                        </div>
                        <div className="flex-1 overflow-auto custom-scrollbar bg-gray-50/50 dark:bg-[#0a0f1a] p-4">
                            <MermaidDiagram plan={plan} />
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#111827] flex items-center justify-between">
                    <button
                        onClick={onCancel}
                        disabled={isApproving}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white dark:hover:border-gray-500 text-sm transition-colors disabled:opacity-50"
                    >
                        <XCircle size={14} /> Cancel Plan
                    </button>
                    <div className="flex gap-3">
                        {/* Download HOCON Button */}
                        {plan.hocon && (
                            <button
                                onClick={() => {
                                    const filename = plan.title
                                        .toLowerCase()
                                        .replace(/\s+/g, '_')
                                        .replace(/[^a-z0-9_]/g, '') + '.hocon';
                                    const blob = new Blob([plan.hocon], { type: 'text/plain;charset=utf-8' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = filename;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                }}
                                disabled={isApproving}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-600 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600 text-sm font-medium transition-colors disabled:opacity-50"
                                title="Download HOCON file to your local machine"
                            >
                                <Download size={14} />
                                Download HOCON
                            </button>
                        )}
                        <button
                            onClick={onApprove}
                            disabled={isApproving}
                            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-900/40 disabled:opacity-50"
                        >
                            {isApproving ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                            {isApproving ? 'Applying...' : 'Approve & Apply'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ---------- Compact Plan Card ----------
const PlanCard = ({ plan, onExpand, onApprove, onCancel, isActive, isApproving }) => {
    const newAgentCount = (plan?.agents?.new || []).length;
    const newToolCount = (plan?.tools?.new || []).length;

    return (
        <div className={`w-full bg-[#0d1117] border rounded-xl p-4 shadow-xl mt-2 transition-all ${isActive ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-gray-800 opacity-60'}`}>
            {/* Card Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <GitBranch size={15} className="text-blue-400 flex-shrink-0 mt-0.5" />
                    <h4 className="text-sm font-bold text-white leading-tight">{plan?.title || 'Architecture Plan'}</h4>
                </div>
                {isActive && (
                    <button
                        onClick={onExpand}
                        className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 bg-blue-900/20 border border-blue-800/50 px-2 py-1 rounded-md transition-colors flex-shrink-0"
                    >
                        <Maximize2 size={10} /> Expand
                    </button>
                )}
            </div>

            {/* Description */}
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">{plan?.description}</p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
                {newAgentCount > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-900/40 border border-green-800 text-green-400 text-[10px] font-bold">
                        <Plus size={9} /> {newAgentCount} new agent{newAgentCount > 1 ? 's' : ''}
                    </span>
                )}
                {newToolCount > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-900/40 border border-purple-800 text-purple-400 text-[10px] font-bold">
                        <Wrench size={9} /> {newToolCount} new tool{newToolCount > 1 ? 's' : ''}
                    </span>
                )}
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700 text-gray-400 text-[10px]">
                    <Network size={9} /> {(plan?.agents?.existing || []).length + newAgentCount} total agents
                </span>
            </div>

            {/* Preview Graph teaser */}
            {isActive && (
                <button
                    onClick={onExpand}
                    className="w-full mb-3 flex items-center justify-center gap-2 p-3 rounded-lg bg-slate-900/60 border border-dashed border-gray-700 hover:border-blue-600 hover:bg-blue-950/20 text-gray-500 hover:text-blue-400 text-xs transition-all"
                >
                    <Eye size={13} /> Click to preview network topology graph
                </button>
            )}

            {/* Action Buttons */}
            {isActive && (
                <div className="flex gap-2">
                    <button
                        onClick={onCancel}
                        disabled={isApproving}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-gray-400 border border-gray-700 rounded-lg hover:text-white hover:border-gray-500 transition-colors disabled:opacity-50"
                    >
                        <XCircle size={12} /> Cancel
                    </button>
                    <button
                        onClick={onApprove}
                        disabled={isApproving}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg transition-colors disabled:opacity-50"
                    >
                        {isApproving ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                        {isApproving ? 'Applying...' : 'Approve & Apply'}
                    </button>
                </div>
            )}
        </div>
    );
};

// ---------- Main Copilot Component ----------
const DesignerCopilot = ({ isOpen, onGenerateGraph, onApplyHocon, networkPath, currentGraphData }) => {
    // Top-Level Tabs
    const [activeTab, setActiveTab] = useState('architect'); // 'architect' | 'chat'
    // Architect Engine Switch
    const [architectEngine, setArchitectEngine] = useState('native'); // 'direct' | 'native'

    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I'm the Network Designer Copilot. Describe what you'd like to build or change, and I'll generate a full architecture plan with a visual preview."
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [planState, setPlanState] = useState(null); // null | 'reviewing' | 'approved'
    const [networkUpdated, setNetworkUpdated] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Chat dependencies
    const {
        connectChat,
        disconnectChat,
        sendChatMessage,
        chatMessages,
        isChatConnected,
        isChatLoading,
        activeAgents
    } = useAgentNetwork();

    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isGenerating]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;
        if (!networkPath) {
            setMessages(prev => [...prev,
            { role: 'user', content: inputValue },
            { role: 'assistant', content: 'Please select a network from the sidebar first.' }
            ]);
            setInputValue('');
            return;
        }

        const userText = inputValue;
        setMessages(prev => [...prev, { role: 'user', content: userText }]);
        setInputValue('');
        setIsGenerating(true);
        setCurrentPlan(null);
        setPlanState(null);

        try {
            if (architectEngine === 'native') {
                // If using Native mode, we bypass the plan card and directly call graph update
                if (onGenerateGraph) {
                    await onGenerateGraph(userText, 'native');
                }
            } else {
                // Gemini Direct Mode (Mermaid preview flow)
                const result = await agentBuilderService.generateCopilotPlan(networkPath, userText, currentGraphData);

                if (result?.plan) {
                    setCurrentPlan(result.plan);
                    setPlanState('reviewing');
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: planState === 'reviewing'
                            ? "I've revised the plan based on your feedback."
                            : "Here's the proposed architecture change. Review the plan and expand for the full graph preview:",
                        isPlan: true,
                        plan: result.plan
                    }]);
                } else {
                    throw new Error(result?.error || 'Invalid response from Copilot');
                }
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApprovePlan = async () => {
        if (!currentPlan?.hocon) return;
        setIsApproving(true);
        setIsModalOpen(false);
        setPlanState('approved');
        setMessages(prev => [...prev,
        { role: 'user', content: 'Approve & Apply plan.' },
        { role: 'assistant', content: '⚡ Applying changes to canvas...' }
        ]);

        try {
            // Apply HOCON directly to canvas (updates graph state without file save)
            if (onApplyHocon) {
                onApplyHocon(currentPlan.hocon);
                setNetworkUpdated(true);
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `✅ **${currentPlan.title}** applied! Your canvas has been updated.`
                }]);
            } else {
                // Fallback: save to disk for existing networks
                const saveResponse = await fetch('/api/local/copilot-save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ networkPath, hocon: currentPlan.hocon })
                });
                if (!saveResponse.ok) throw new Error('Failed to save HOCON to disk.');

                setNetworkUpdated(true);
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `✅ **${currentPlan.title}** applied! Click Refresh Canvas to see your updated network.`
                }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Failed to apply: ${error.message}` }]);
        } finally {
            setIsApproving(false);
            setCurrentPlan(null);
            setPlanState(null);
        }
    };

    const handleCancelPlan = () => {
        setIsModalOpen(false);
        setPlanState(null);
        setCurrentPlan(null);
        setMessages(prev => [...prev,
        { role: 'user', content: 'Cancel this plan.' },
        { role: 'assistant', content: 'Plan cancelled. What else would you like to change?' }
        ]);
    };

    return (
        <>
            {/* Expandable Modal */}
            {isModalOpen && currentPlan && (
                <PlanModal
                    plan={currentPlan}
                    onClose={() => setIsModalOpen(false)}
                    onApprove={handleApprovePlan}
                    onCancel={handleCancelPlan}
                    isApproving={isApproving}
                />
            )}

            {/* Copilot Side Panel */}
            <div className={`
                fixed right-0 top-16 bottom-0 z-40 bg-white dark:bg-[#111216] border-l border-gray-200 dark:border-gray-800
                transition-all duration-300 ease-in-out flex flex-col shadow-2xl
                ${isOpen ? 'w-[400px] translate-x-0' : 'w-0 translate-x-full opacity-0 pointer-events-none'}
            `}>
                {/* Header */}
                {/* Header Top Layer */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-[#15161a] flex-shrink-0">
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

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-500/30">
                                {activeTab === 'architect' ? <Sparkles size={16} /> : <MessageSquare size={16} />}
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                                    {activeTab === 'architect' ? 'Network Designer Copilot' : 'Live Network Chat'}
                                </h2>
                                <span className={`text-[10px] flex items-center gap-1 ${activeTab === 'architect' || isChatConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'architect' || isChatConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                    {activeTab === 'architect'
                                        ? (architectEngine === 'direct' ? 'Online · Gemini 2.5 Pro' : 'Online · Neuro SAN Native')
                                        : (isChatConnected ? 'Connected to WebSocket' : 'Disconnected')
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                    {activeTab === 'chat' && (
                        <button
                            onClick={isChatConnected ? disconnectChat : () => connectChat(networkPath)}
                            disabled={isChatLoading}
                            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${isChatConnected
                                ? 'bg-red-900/40 text-red-400 border border-red-800 hover:bg-red-900/60'
                                : 'bg-green-900/40 text-green-400 border border-green-800 hover:bg-green-900/60'
                                }`}
                        >
                            {isChatLoading ? 'Connecting...' : isChatConnected ? 'Disconnect' : 'Connect'}
                        </button>
                    )}
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-gray-100 dark:bg-[#1a1d21] p-1.5 shrink-0 border-b border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('architect')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'architect'
                            ? 'bg-white dark:bg-[#2d3139] text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#22262d]'
                            }`}
                    >
                        <Sparkles size={14} /> Architect
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'chat'
                            ? 'bg-white dark:bg-[#2d3139] text-purple-600 dark:text-purple-400 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#22262d]'
                            }`}
                    >
                        <MessageSquare size={14} /> Chat Test
                    </button>
                </div>

                {/* Engine Switch (Only in Architect Mode) */}
                {activeTab === 'architect' && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-800 shrink-0">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Engine:</span>
                        <div className="flex items-center bg-gray-200 dark:bg-[#15161a] rounded p-0.5">
                            <button
                                onClick={() => setArchitectEngine('native')}
                                className={`px-2 py-1 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider rounded-sm transition-colors ${architectEngine === 'native' ? 'bg-[#2d3139] text-emerald-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'
                                    }`}
                                title="Use Neuro SAN's built-in robust generator ( streams terminal logs )"
                            >
                                <Terminal size={10} /> Native
                            </button>
                            <button
                                onClick={() => setArchitectEngine('direct')}
                                className={`px-2 py-1 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider rounded-sm transition-colors ${architectEngine === 'direct' ? 'bg-[#2d3139] text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'
                                    }`}
                                title="Use direct LLM with rich Mermaid visualizer"
                            >
                                <Bot size={10} /> Direct
                            </button>
                        </div>
                    </div>
                )}

                {/* Content Area */}
                {activeTab === 'architect' ? (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="shrink-0 w-7 h-7 rounded-full bg-blue-600/50 flex items-center justify-center">
                                            <Bot size={14} className="text-white" />
                                        </div>
                                    )}
                                    <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-sm'
                                            : 'bg-gray-100 dark:bg-[#1a1d21] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-tl-sm'
                                            }`}>
                                            {msg.content}
                                        </div>

                                        {/* Plan Card */}
                                        {msg.isPlan && msg.plan && (
                                            <PlanCard
                                                plan={msg.plan}
                                                isActive={currentPlan === msg.plan && planState === 'reviewing'}
                                                isApproving={isApproving}
                                                onExpand={() => {
                                                    setCurrentPlan(msg.plan);
                                                    setIsModalOpen(true);
                                                }}
                                                onApprove={handleApprovePlan}
                                                onCancel={handleCancelPlan}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {isGenerating && (
                                <div className="flex gap-3">
                                    <div className="shrink-0 w-7 h-7 rounded-full bg-blue-600/50 flex items-center justify-center">
                                        <Bot size={14} className="text-white" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex gap-1 bg-gray-100 dark:bg-[#1a1d21] border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm items-center h-10 w-16">
                                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                        <span className="text-[10px] text-gray-500 pl-1">Analysing & generating plan (15-30s)...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#15161a] flex flex-col gap-3 flex-shrink-0">

                            {/* Refresh Canvas Banner */}
                            {networkUpdated && (
                                <div className="flex items-center justify-between gap-2 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg px-3 py-2">
                                    <span className="text-xs text-green-700 dark:text-green-300 font-medium">✅ Network saved to disk</span>
                                    <button
                                        onClick={async () => {
                                            if (onGenerateGraph) {
                                                try { await onGenerateGraph('RELOAD_ONLY'); } catch (e) { console.warn(e); }
                                            }
                                            setNetworkUpdated(false);
                                        }}
                                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-md transition-colors"
                                    >
                                        <RefreshCw size={12} /> Refresh Canvas
                                    </button>
                                </div>
                            )}

                            {/* Input */}
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !isGenerating && handleSend()}
                                    placeholder={planState === 'reviewing' ? 'Request revisions or approve above...' : 'Describe the network you want to build...'}
                                    className="w-full bg-white dark:bg-[#111216] border border-gray-200 dark:border-gray-700 focus:border-blue-500 rounded-lg py-3 pl-4 pr-12 text-sm text-gray-900 dark:text-gray-200 outline-none transition-colors shadow-inner"
                                    disabled={isGenerating || isApproving}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || isGenerating || isApproving}
                                    className="absolute right-2 w-8 h-8 rounded bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center disabled:opacity-50 disabled:bg-gray-700 transition-colors shadow-md"
                                >
                                    {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                </button>
                            </div>

                            <div className="text-[10px] text-gray-500 text-center font-medium tracking-wide">
                                POWERED BY {architectEngine === 'direct' ? 'GEMINI 2.5 PRO' : 'AGENT_NETWORK_DESIGNER (NATIVE)'}
                            </div>
                        </div>
                    </>
                ) : (
                    // CHAT TAB
                    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#0b0c0e]">
                        <StudioChatPanel
                            messages={chatMessages}
                            onSendMessage={sendChatMessage}
                            isConnected={isChatConnected}
                            isLoading={isChatLoading || (chatMessages.length > 0 && chatMessages[chatMessages.length - 1].sender === 'user')}
                            networkName={networkPath?.split('/').pop()}
                        />
                    </div>
                )}
            </div>
        </>
    );
};

export default DesignerCopilot;
