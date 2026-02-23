import React, { useEffect, useRef } from 'react';
import { Terminal, Loader2, XCircle } from 'lucide-react';

const NativeGenerationTerminal = ({ logs = [], isVisible, onCancel }) => {
    const bottomRef = useRef(null);

    // Auto-scroll to bottom when new logs stream in
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    if (!isVisible) return null;

    return (
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-[#0a0f14] border-t border-gray-800 shadow-2xl z-50 flex flex-col font-mono animate-in slide-in-from-bottom-full duration-300">
            {/* Header */}
            <div className="h-8 bg-[#151c24] border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-emerald-500" />
                    <span className="text-xs text-gray-400 font-semibold tracking-wider">NSFLOW NATIVE COMPILER</span>
                    <Loader2 size={12} className="text-blue-400 animate-spin ml-2" />
                </div>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="text-gray-500 hover:text-red-400 flex items-center gap-1.5 px-2 py-0.5 rounded transition-colors"
                        title="Cancel Compilation"
                    >
                        <XCircle size={14} />
                        <span className="text-[10px] uppercase font-bold tracking-widest hidden sm:inline">Cancel</span>
                    </button>
                )}
            </div>

            {/* Log Stream Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-black/50 text-emerald-400/90 text-sm">
                {logs.length === 0 ? (
                    <div className="text-gray-600 animate-pulse text-xs">Waiting for agent_network_designer execution...</div>
                ) : (
                    <div className="space-y-1">
                        {logs.map((log, i) => (
                            <div key={i} className="flex gap-3 leading-tight opacity-90 hover:opacity-100 transition-opacity">
                                <span className="text-gray-600 shrink-0 select-none text-xs mt-0.5">[{log.time}]</span>
                                <span className={`flex-1 break-words ${log.isError ? 'text-red-400' : log.isHighlight ? 'text-blue-400 font-bold' : ''}`}>
                                    {log.message}
                                </span>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default NativeGenerationTerminal;
