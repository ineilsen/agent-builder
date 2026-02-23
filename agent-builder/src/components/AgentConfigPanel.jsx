import React, { useState } from 'react';
import { Settings, Save, X, Database, Activity, Cpu, MessageSquare, Sliders, HardDrive } from 'lucide-react';

const AgentConfigPanel = ({ agentId, instructions, onSave, onClose }) => {
    const [activeTab, setActiveTab] = useState('model'); // model, parameters, memory

    // Local State for Config
    const [provider, setProvider] = useState('Anthropic');
    const [model, setModel] = useState('claude-3-opus');
    const [localInstructions, setLocalInstructions] = useState(instructions || '');
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(4096);
    const [memoryTable, setMemoryTable] = useState('agent_memory_default');
    const [loggingEnabled, setLoggingEnabled] = useState(true);

    const modelProviders = {
        'Anthropic': [
            { id: 'claude-3-opus', name: 'Claude 3 Opus' },
            { id: 'claude-3-sonnet', name: 'Claude 3.5 Sonnet' },
            { id: 'claude-e-haiku', name: 'Claude 3 Haiku' }
        ],
        'OpenAI': [
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
            { id: 'gpt-4o', name: 'GPT-4o' },
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
        ],
        'Google': [
            { id: 'gemini-pro', name: 'Gemini 1.5 Pro' },
        ]
    };

    const handleSave = () => {
        onSave({
            agentId,
            instructions: localInstructions,
            modelConfig: { provider, model, temperature, maxTokens },
            memory: { table: memoryTable },
            logging: loggingEnabled
        });
    };

    return (
        <div className="absolute top-4 right-4 w-[400px] bg-white/95 dark:bg-[#1a1d21]/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden max-h-[calc(100%-32px)] transition-colors duration-200">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Settings className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">{agentId}</h3>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Configuration</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-white/5 mx-5 mt-2">
                <button onClick={() => setActiveTab('model')} className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${activeTab === 'model' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Model & Prompt</button>
                <button onClick={() => setActiveTab('parameters')} className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${activeTab === 'parameters' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Parameters</button>
                <button onClick={() => setActiveTab('memory')} className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${activeTab === 'memory' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Memory & Logs</button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto custom-scrollbar flex-grow space-y-5">

                {activeTab === 'model' && (
                    <>
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Cpu className="w-3.5 h-3.5" /> Model Selection
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.keys(modelProviders).map(p => (
                                    <button key={p} onClick={() => { setProvider(p); setModel(modelProviders[p][0].id); }}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${provider === p ? 'bg-blue-600 text-white border-blue-500' : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-xs text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-blue-500">
                                {modelProviders[provider].map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-3 h-full flex flex-col">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <MessageSquare className="w-3.5 h-3.5" /> System Instructions
                            </label>
                            <textarea
                                value={localInstructions}
                                onChange={(e) => setLocalInstructions(e.target.value)}
                                className="w-full h-40 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-xs font-mono text-gray-800 dark:text-gray-300 focus:ring-1 focus:ring-blue-500 resize-none"
                                placeholder="You are a helpful agent..."
                            />
                        </div>
                    </>
                )}

                {activeTab === 'parameters' && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Sliders className="w-3.5 h-3.5" /> Temperature
                                </label>
                                <span className="text-xs font-mono text-blue-500">{temperature}</span>
                            </div>
                            <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                            <p className="text-[10px] text-gray-500">Controls randomness: Lower is more deterministic, higher is more creative.</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Sliders className="w-3.5 h-3.5" /> Max Tokens
                                </label>
                                <span className="text-xs font-mono text-blue-500">{maxTokens}</span>
                            </div>
                            <input type="number" value={maxTokens} onChange={(e) => setMaxTokens(parseInt(e.target.value))} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-xs text-gray-700 dark:text-gray-300" />
                        </div>
                    </div>
                )}

                {activeTab === 'memory' && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Database className="w-3.5 h-3.5" /> Persistent Storage (Table)
                            </label>
                            <div className="relative">
                                <HardDrive className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                                <input type="text" value={memoryTable} onChange={(e) => setMemoryTable(e.target.value)}
                                    className="w-full pl-9 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-xs text-gray-700 dark:text-gray-300 font-mono" />
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${loggingEnabled ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-gray-200 dark:bg-white/10 text-gray-500'}`}>
                                    <Activity className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">Execution Logging</h4>
                                    <p className="text-[10px] text-gray-500">Log all inputs and outputs to audit trail.</p>
                                </div>
                            </div>
                            <button onClick={() => setLoggingEnabled(!loggingEnabled)} className={`w-10 h-5 rounded-full relative transition-colors ${loggingEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${loggingEnabled ? 'left-6' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                )}

            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 shrink-0">
                <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-2.5 text-xs font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <Save className="w-3.5 h-3.5" />
                    Save Configuration
                </button>
            </div>

        </div>
    );
};

export default AgentConfigPanel;
