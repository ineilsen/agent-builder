import React, { useState, useRef, useEffect } from 'react';
import { Terminal, MessageSquare, Download, Clock, Zap, Bot, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useAgentNetwork } from '../context/AgentNetworkContext';

// Format timestamp
const formatTimestamp = (date = new Date()) => {
    return date.toISOString().replace('T', ' ').split('.')[0];
};

// Tab configuration
const TABS = [
    { id: 'agent-chat', label: 'Agent Chat', icon: MessageSquare },
    { id: 'logs', label: 'Execution Logs', icon: Terminal },
];

const ExecutionLogsPanel = ({ isCollapsed, onToggleCollapse }) => {
    const {
        internalChatMessages = [],
        executionLogs = [],
        currentNetwork,
        isChatConnected,
        llmCallCount = 0,
        totalResponseTime = 0
    } = useAgentNetwork();

    const [activeTab, setActiveTab] = useState('agent-chat');
    const messagesEndRef = useRef(null);
    const logsEndRef = useRef(null);

    // Auto-scroll
    useEffect(() => {
        if (activeTab === 'agent-chat') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else {
            logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [internalChatMessages, executionLogs, activeTab]);

    // Download logs
    const handleDownload = () => {
        const content = activeTab === 'agent-chat'
            ? internalChatMessages.map(m => `[${m.timestamp}] ${m.sender}: ${m.text}`).join('\n')
            : executionLogs.map(l => `[${l.timestamp}] ${l.agent} (${l.source}): ${l.message}`).join('\n');

        const blob = new Blob([content], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${activeTab}_${currentNetwork || 'logs'}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Format average response time
    const avgResponseTime = llmCallCount > 0
        ? `${(totalResponseTime / llmCallCount / 1000).toFixed(2)}s`
        : '--';

    if (isCollapsed) {
        return (
            <div
                className="h-8 bg-white dark:bg-[#111214] border-t border-gray-200 dark:border-white/5 flex items-center justify-between px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                onClick={onToggleCollapse}
            >
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Logs</span>
                        <span className="text-gray-400 dark:text-gray-500">({executionLogs.length})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Agent Chat</span>
                        <span className="text-gray-400 dark:text-gray-500">({internalChatMessages.length})</span>
                    </div>
                    {isChatConnected && (
                        <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-green-600 dark:text-green-400">Connected</span>
                        </div>
                    )}
                </div>
                <ChevronUp className="w-4 h-4 text-gray-400" />
            </div>
        );
    }

    return (
        <div className="h-full bg-white dark:bg-[#111214] border-t border-gray-200 dark:border-white/5 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0a0b0d]">
                {/* Tabs */}
                <div className="flex items-center gap-1">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors
                ${activeTab === tab.id
                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                                }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            <span>{tab.label}</span>
                            <span className="text-gray-400 dark:text-gray-500 ml-1">
                                ({tab.id === 'agent-chat' ? internalChatMessages.length : executionLogs.length})
                            </span>
                        </button>
                    ))}
                </div>

                {/* Stats & Actions */}
                <div className="flex items-center gap-3">
                    {/* Quick Stats */}
                    <div className="hidden sm:flex items-center gap-3 text-[10px] text-gray-500">
                        <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-yellow-500" />
                            <span>{llmCallCount} LLM calls</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-purple-500" />
                            <span>Avg: {avgResponseTime}</span>
                        </div>
                    </div>

                    {/* Download */}
                    <button
                        onClick={handleDownload}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="Download"
                    >
                        <Download className="w-3.5 h-3.5" />
                    </button>

                    {/* Collapse */}
                    <button
                        onClick={onToggleCollapse}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="Collapse"
                    >
                        <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 font-mono text-xs">
                {activeTab === 'agent-chat' ? (
                    internalChatMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                            <Bot className="w-8 h-8 mb-2 text-gray-300 dark:text-gray-600" />
                            <p className="text-xs">No agent conversations yet</p>
                            <p className="text-[10px] mt-1">Agent-to-agent messages will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            {internalChatMessages.map((msg, idx) => (
                                <div key={idx} className="group">
                                    <div className="flex items-start gap-2">
                                        <span className="text-gray-400 dark:text-gray-500 shrink-0">[{msg.timestamp}]</span>
                                        <span className="text-purple-600 dark:text-purple-400 font-semibold shrink-0">{msg.sender}:</span>
                                        <span className="text-gray-700 dark:text-gray-300 break-words">{msg.text}</span>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )
                ) : (
                    executionLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                            <Terminal className="w-8 h-8 mb-2 text-gray-300 dark:text-gray-600" />
                            <p className="text-xs">No logs yet</p>
                            <p className="text-[10px] mt-1">Execution logs will appear here when connected</p>
                        </div>
                    ) : (
                        <div className="space-y-0.5">
                            {executionLogs.map((log, idx) => {
                                // Try to parse message as JSON for rich display
                                let messageContent = log.message;
                                let isJson = false;
                                try {
                                    if (log.message.startsWith('{') || log.message.startsWith('[')) {
                                        const parsed = JSON.parse(log.message);
                                        isJson = true;
                                        // Format token_accounting nicely
                                        if (parsed.token_accounting) {
                                            const ta = parsed.token_accounting;
                                            messageContent = `💰 Tokens: ${ta.total_tokens} (prompt: ${ta.prompt_tokens}, completion: ${ta.completion_tokens}) | Cost: $${ta.total_cost?.toFixed(4) || '0'} | Time: ${ta.time_taken?.toFixed(2) || '?'}s`;
                                        } else if (parsed.otrace) {
                                            messageContent = `🔗 Agent Chain: ${parsed.otrace.join(' → ')}`;
                                        } else {
                                            messageContent = JSON.stringify(parsed, null, 2);
                                        }
                                    }
                                } catch (e) {
                                    // Not JSON, use as-is
                                }

                                // Color code by source
                                const sourceColor =
                                    log.source === 'NeuroSan' ? 'text-orange-500' :
                                        log.source === 'nsflow' ? 'text-pink-500' :
                                            log.source === 'Tool' ? 'text-yellow-500' :
                                                log.source === 'Agent' ? 'text-green-500' :
                                                    log.source === 'Frontend' ? 'text-gray-400' :
                                                        log.source === 'Error' ? 'text-red-500' :
                                                            'text-cyan-500';

                                return (
                                    <div key={idx} className={`flex items-start gap-1.5 leading-relaxed ${isJson ? 'bg-black/20 rounded p-1 my-1' : ''}`}>
                                        <span className="text-gray-500 dark:text-gray-500 shrink-0 text-[10px]">[{log.timestamp}]</span>
                                        <span className="text-green-600 dark:text-green-400 shrink-0">{log.agent}</span>
                                        <span className={`shrink-0 font-semibold ${sourceColor}`}>
                                            ({log.source})
                                        </span>
                                        <span className={`text-gray-600 dark:text-gray-300 ${isJson ? 'whitespace-pre-wrap text-[10px]' : ''}`}>
                                            : {messageContent}
                                        </span>
                                    </div>
                                );
                            })}
                            <div ref={logsEndRef} />
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default ExecutionLogsPanel;
