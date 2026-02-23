import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, User, Bot, Loader2, Activity } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ExecutionVisualizerModal from './ExecutionVisualizerModal';

const ChatPanel = ({
    messages = [],
    onSendMessage,
    isConnected = false,
    isLoading = false,
    networkName = ''
}) => {
    const [inputValue, setInputValue] = useState('');
    const [selectedExecution, setSelectedExecution] = useState(null);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
        }
    }, [inputValue]);

    const handleSend = () => {
        if (!inputValue.trim() || !isConnected) return;
        onSendMessage(inputValue.trim());
        setInputValue('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const sampleQueries = [
        "What can you help me with?",
        "Show me your capabilities"
    ];

    return (
        <div className="h-full flex flex-col bg-white dark:bg-[#15161a] overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50/50 dark:bg-[#0f1115]">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mb-4 border border-white/5">
                            <Bot className="w-8 h-8 text-blue-400/50" />
                        </div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white/80">Agent Chat Ready</p>
                        <p className="text-xs mt-1 mb-6 text-center max-w-[200px]">Connect to a network to verify agent behaviors.</p>

                        <div className="space-y-2 w-full max-w-[240px]">
                            {sampleQueries.map((query, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => isConnected && onSendMessage(query)}
                                    disabled={!isConnected}
                                    className="w-full px-3 py-2 text-xs text-left bg-white dark:bg-[#1a1d21] hover:bg-blue-50 dark:hover:bg-blue-500/10 text-gray-600 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-white/5 disabled:opacity-50 transition-colors shadow-sm"
                                >
                                    "{query}"
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender !== 'user' && (
                                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center border border-purple-200 dark:border-purple-500/20 shrink-0 mt-1">
                                    <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                </div>
                            )}

                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${msg.sender === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white dark:bg-[#1a1d21] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/5 rounded-bl-none'
                                }`}>
                                <div className="min-w-0">
                                    {msg.sender !== 'user' && msg.agent && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">{msg.agent}</span>
                                            <span className="text-[10px] text-gray-400 dark:text-gray-600">•</span>
                                            <span className="text-[10px] text-gray-400 dark:text-gray-600">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    )}

                                    <div className={`text-sm leading-relaxed whitespace-pre-wrap break-words markdown-content ${msg.sender === 'user' ? 'text-white/95' : 'text-gray-700 dark:text-gray-300'}`}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>

                                    {/* Execution Visualizer Button */}
                                    {msg.executionData && (
                                        <button
                                            onClick={() => setSelectedExecution(msg.executionData)}
                                            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors border border-purple-200 dark:border-purple-500/20 w-full"
                                        >
                                            <Activity className="w-3.5 h-3.5" />
                                            <span className="text-xs font-semibold">View Execution Trace</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {msg.sender === 'user' && (
                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center border border-blue-200 dark:border-blue-500/20 shrink-0 mt-1">
                                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                            )}
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex justify-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center border border-purple-200 dark:border-purple-500/20 shrink-0">
                            <Loader2 className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-spin" />
                        </div>
                        <div className="bg-white dark:bg-[#1a1d21] border border-gray-200 dark:border-white/5 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2 shadow-sm">
                            <span className="flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce"></span>
                            </span>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200 dark:border-white/5 bg-gray-50/80 dark:bg-[#0a0b0d]/95 backdrop-blur-md">
                <div className="flex items-end gap-2 bg-white dark:bg-[#15161a] border border-gray-300 dark:border-white/10 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all shadow-sm">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isConnected ? `Message ${networkName || 'Agent'}...` : "Connect to start chatting..."}
                        disabled={!isConnected}
                        className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none custom-scrollbar py-1.5 px-1 max-h-[150px] min-h-[24px]"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || !isConnected}
                        className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-white/5 dark:disabled:to-white/5 disabled:cursor-not-allowed rounded-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 shrink-0"
                    >
                        <Send className="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>

            {/* Execution Visualizer Modal */}
            <ExecutionVisualizerModal
                isOpen={!!selectedExecution}
                onClose={() => setSelectedExecution(null)}
                executionData={selectedExecution}
            />
        </div>
    );
};



export default ChatPanel;
