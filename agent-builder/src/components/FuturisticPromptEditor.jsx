import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Wand2, Copy, Check, Info, Maximize2 } from 'lucide-react';

const FuturisticPromptEditor = ({ value, onChange, onOptimize }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [copied, setCopied] = useState(false);
    const textareaRef = useRef(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Auto-resize
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [value]);

    return (
        <div className={`relative group rounded-xl bg-gray-50 dark:bg-[#0b0c0e]/50 backdrop-blur-md border outline outline-1 outline-transparent transition-all duration-300 ${isFocused
            ? 'border-blue-400 dark:border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)] dark:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] outline-blue-400/30 ring-2 ring-blue-100 dark:ring-blue-500/20'
            : 'border-gray-300 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-700 shadow-sm'
            }`}>
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 rounded-t-xl transition-colors duration-300">
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 dark:bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-blue-500"></span>
                    </span>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-700 dark:text-gray-400">Prompt Engineering</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleCopy}
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white rounded transition-colors"
                        title="Copy to clipboard"
                    >
                        {copied ? <Check size={14} className="text-green-500 dark:text-green-400" /> : <Copy size={14} />}
                    </button>
                    <button
                        className="flex items-center gap-1.5 px-2 py-1 bg-purple-100 dark:bg-purple-500/10 hover:bg-purple-200 dark:hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 rounded text-[10px] font-bold uppercase transition-all"
                        onClick={onOptimize}
                        title="Optimize with Neuro AI"
                    >
                        <Wand2 size={12} /> Auto-Optimize
                    </button>
                    <button className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                        <Maximize2 size={14} />
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="relative p-1">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full min-h-[300px] bg-transparent text-sm text-gray-900 font-medium dark:text-gray-300 font-mono leading-relaxed p-4 outline-none resize-none custom-scrollbar placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    placeholder="Describe your agent's persona, goals, and constraints..."
                    spellCheck="false"
                />

                {/* Floating "AI Suggestions" Badge (Visual only for now) */}
                <div className="absolute bottom-4 right-4 pointer-events-none">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 backdrop-blur text-[10px] text-blue-300 animate-pulse">
                        <Sparkles size={10} />
                        <span>AI Active</span>
                    </div>
                </div>
            </div>

            {/* Footer / Stats */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-black/20 rounded-b-xl flex justify-between items-center text-[10px] text-gray-600 dark:text-gray-500 font-mono transition-colors duration-300">
                <div>
                    <span>Chars: {value?.length || 0}</span>
                    <span className="mx-2">|</span>
                    <span>Tokens: {Math.ceil((value?.length || 0) / 4)} (est.)</span>
                </div>
                <div className="flex items-center gap-1">
                    <Info size={12} />
                    <span>Supports &#123;&#123; variables &#125;&#125;</span>
                </div>
            </div>
        </div>
    );
};

export default FuturisticPromptEditor;
