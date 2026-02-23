import React, { useState } from 'react';
import { Code, Terminal, Play, Save, CheckCircle2 } from 'lucide-react';

const ToolIdeEditor = ({ toolName = 'Custom Tool', sourceCode = '', onSave }) => {
    const [code, setCode] = useState(sourceCode || 'def execute_tool(inputs):\n    """\n    Custom tool logic here\n    """\n    return {"status": "success"}');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            if (onSave) onSave(code);
        }, 500);
    };

    return (
        <div className="flex flex-col h-full bg-[#111216] border border-gray-800 rounded-lg overflow-hidden">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between border-b border-gray-800 bg-[#15161a]">
                <div className="flex">
                    <div className="px-4 py-2 border-r border-gray-800 text-xs font-mono text-gray-300 bg-[#1a1d21] flex items-center gap-2">
                        <Code size={12} className="text-cyan-400" />
                        {toolName.toLowerCase().replace(/\s+/g, '_')}.py
                    </div>
                </div>
                <div className="flex items-center gap-2 pr-2">
                    <button className="p-1.5 text-gray-500 hover:text-white transition-colors" title="Run Test">
                        <Play size={14} className="text-green-500" />
                    </button>
                </div>
            </div>

            {/* Code Editor Area */}
            <div className="flex-1 relative bg-[#0b0c0e] font-mono text-sm leading-relaxed overflow-hidden flex">
                {/* Line Numbers */}
                <div className="w-10 bg-[#111216] border-r border-gray-800 text-right pr-2 py-4 text-gray-600 select-none">
                    {code.split('\\n').map((_, i) => (
                        <div key={i}>{i + 1}</div>
                    ))}
                </div>
                {/* Textarea */}
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck="false"
                    className="flex-1 bg-transparent text-gray-300 p-4 outline-none resize-none whitespace-pre overflow-auto"
                />
            </div>

            {/* Terminal / Output Area (Collapsed) */}
            <div className="h-24 bg-[#0b0c0e] border-t border-gray-800 flex flex-col">
                <div className="bg-[#15161a] border-b border-gray-800 px-3 py-1 text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2">
                    <Terminal size={12} /> Console Output
                </div>
                <div className="p-2 text-xs font-mono text-gray-500 h-full overflow-y-auto">
                    <span className="text-green-500">➜</span> Ready. Waiting for execution.
                </div>
            </div>
        </div>
    );
};

export default ToolIdeEditor;
