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
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                        <Bot className="w-8 h-8 mb-2 text-gray-300 dark:text-gray-600" />
                        <p className="font-medium">No messages yet</p>
                        <p className="text-[10px] mt-0.5">Send a message to start</p>
                        <div className="mt-3 space-y-1.5 w-full max-w-[200px]">
                            {sampleQueries.map((query, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => isConnected && onSendMessage(query)}
                                    disabled={!isConnected}
                                    className="w-full px-2 py-1 text-[10px] bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-white/5 disabled:opacity-50"
                                >
                                    {query}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-lg px-2.5 py-1.5 ${msg.sender === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/5'
                                }`}>
                                <div className="flex items-start gap-1.5">
                                    {msg.sender !== 'user' && <Bot className="w-3 h-3 text-purple-500 mt-0.5 shrink-0" />}
                                    <div className="min-w-0">
                                        {msg.sender !== 'user' && msg.agent && (
                                            <span className="text-[9px] text-purple-500 font-medium block">{msg.agent}</span>
                                        )}
                                        <div className="text-xs whitespace-pre-wrap break-words markdown-content">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>

                                        {/* Execution Visualizer Button */}
                                        {msg.executionData && (
                                            <button
                                                onClick={() => setSelectedExecution(msg.executionData)}
                                                className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors border border-purple-200 dark:border-purple-500/30"
                                            >
                                                <Activity className="w-3 h-3" />
                                                <span className="text-[10px] font-semibold">Execution Visual</span>
                                            </button>
                                        )}
                                    </div>
                                    {msg.sender === 'user' && <User className="w-3 h-3 text-blue-200 mt-0.5 shrink-0" />}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg px-2 py-1 flex items-center gap-1.5">
                            <Loader2 className="w-3 h-3 text-purple-500 animate-spin" />
                            <span className="text-[10px] text-gray-500">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-2 border-t border-gray-200 dark:border-white/5 bg-gray-50/80 dark:bg-[#111214]/80">
                <div className="flex items-end gap-1.5 bg-white dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-lg p-1.5 focus-within:ring-1 focus-within:ring-blue-500">
                    <textarea
                        ref={textareaRef}
                        rows={3}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isConnected ? "Message..." : "Not connected"}
                        disabled={!isConnected}
                        className="flex-1 bg-transparent text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none custom-scrollbar py-1 px-1"
                        style={{ height: '150px' }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || !isConnected}
                        className="p-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 dark:disabled:bg-white/5 disabled:cursor-not-allowed rounded transition-colors shrink-0"
                    >
                        <Send className="w-3 h-3 text-white" />
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
