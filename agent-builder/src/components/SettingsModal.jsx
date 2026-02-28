import { useState } from 'react';
import { X, Server, BrainCircuit, Cloud, Box, Database, Activity, Shield, Save, Check } from 'lucide-react';

const STORAGE_KEY = 'agent_builder_settings';

/** Parse a URL string into { host, port, protocol } with safe fallbacks. */
const parseUrl = (raw, defaultHost, defaultPort) => {
    try {
        const u = new URL(raw);
        return {
            host: u.hostname || defaultHost,
            port: u.port || defaultPort,
            protocol: u.protocol.replace(':', '') || 'http',
        };
    } catch {
        return { host: defaultHost, port: defaultPort, protocol: 'http' };
    }
};

const neuroSan = parseUrl(import.meta.env.VITE_NEURO_SAN_URL || '', 'localhost', '8080');
const nsflow   = parseUrl(import.meta.env.VITE_NSFLOW_URL   || '', 'localhost', '4173');

const DEFAULT_SETTINGS = {
    // Server & Core — seeded from VITE_NEURO_SAN_URL / VITE_NSFLOW_URL env vars
    NEURO_SAN_SERVER_HOST: neuroSan.host,
    NEURO_SAN_SERVER_CONNECTION: neuroSan.protocol,
    NEURO_SAN_SERVER_HTTP_PORT: neuroSan.port,
    NEURO_SAN_WEB_CLIENT_PORT: nsflow.port,
    AGENT_SERVICE_LOG_JSON: "logging.json",
    THINKING_FILE: "/tmp/agent_thinking.txt",

    // LLM Providers
    OPENAI_API_KEY: "",
    ANTHROPIC_API_KEY: "",
    GOOGLE_API_KEY: "",
    AWS_ACCESS_KEY_ID: "",
    AWS_SECRET_ACCESS_KEY: "",

    // Global LLM Defaults (from llm_config.hocon)
    DEFAULT_LLM_CLASS: "azure-openai",
    DEFAULT_LLM_MODEL_NAME: "gpt-4o",

    // Azure OpenAI
    AZURE_OPENAI_ENDPOINT: "",
    OPENAI_API_VERSION: "",
    AZURE_OPENAI_API_KEY: "",
    AZURE_OPENAI_DEPLOYMENT_NAME: "",

    // Intranet & ServiceNow
    MI_BASE_URL: "",
    MI_APP_URL: "",
    MI_INTRANET: "",
    MI_HCM: "",
    MI_ABSENCE_MANAGEMENT: "",
    MI_TRAVEL_AND_EXPENSE: "",
    MI_GSD: "",
    SERVICENOW_INSTANCE_URL: "",
    SERVICENOW_USER: "",
    SERVICENOW_PWD: "",
    SERVICENOW_CALLER_EMAIL: "",
    SERVICENOW_GET_AGENTS_QUERY: "",

    // Cloud & External APIs (Agentforce, Agentspace, Brave)
    AGENTFORCE_MY_DOMAIN_URL: "",
    AGENTFORCE_AGENT_ID: "",
    AGENTFORCE_CLIENT_ID: "",
    AGENTFORCE_CLIENT_SECRET: "",
    GOOGLE_APPLICATION_CREDENTIALS: "",
    SERVICE_ACCT_EMAIL: "",
    ENGINE_ID: "",
    GCP_PROJECT_ID: "",
    GCP_LOCATION: "",
    BRAVE_API_KEY: "",
    BRAVE_URL: "https://api.search.brave.com/res/v1/web/search?q=",
    BRAVE_TIMEOUT: "30",

    // Observability
    PHOENIX_ENABLED: "false",
    PHOENIX_AUTOSTART: "false",
    LOGBRIDGE_ENABLED: "true",
};

/** Load persisted settings from localStorage, falling back to env-seeded defaults. */
const loadSettings = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            // Merge: stored values override defaults so new fields still appear
            return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        }
    } catch { /* ignore corrupt storage */ }
    return DEFAULT_SETTINGS;
};

const SettingsModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('server');
    const [savedState, setSavedState] = useState(false);
    const [settings, setSettings] = useState(loadSettings);

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        setSavedState(true);
        setTimeout(() => setSavedState(false), 2000);
    };

    if (!isOpen) return null;

    const tabs = [
        { id: 'server', label: 'Server Core', icon: Server },
        { id: 'llm', label: 'LLM Providers', icon: BrainCircuit },
        { id: 'azure', label: 'Azure OpenAI', icon: Cloud },
        { id: 'intranet', label: 'Intranet & ECM', icon: Database },
        { id: 'cloud', label: 'Cloud APIs', icon: Box },
        { id: 'observability', label: 'Observability', icon: Activity },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white dark:bg-[#111216] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#15161a]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-500/30">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Environment Configuration</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Manage your .env registry across global components</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body Elements */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#15161A]/50 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 border border-transparent'
                                        }`}
                                >
                                    <Icon size={16} className={isActive ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 bg-white dark:bg-[#0b0c0e] p-6 overflow-y-auto custom-scrollbar">
                        <div className="max-w-3xl mx-auto space-y-8 pb-10">

                            {/* Server Configuration */}
                            {activeTab === 'server' && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 border-b border-gray-200 dark:border-gray-800 pb-2">NeuroSan Core</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Base connection logic for the main NeuroSan daemon and Web Client.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField label="Server Host" value={settings.NEURO_SAN_SERVER_HOST} onChange={(v) => handleChange('NEURO_SAN_SERVER_HOST', v)} />
                                        <InputField label="Connection Protocol" value={settings.NEURO_SAN_SERVER_CONNECTION} onChange={(v) => handleChange('NEURO_SAN_SERVER_CONNECTION', v)} />
                                        <InputField label="HTTP Port" type="number" value={settings.NEURO_SAN_SERVER_HTTP_PORT} onChange={(v) => handleChange('NEURO_SAN_SERVER_HTTP_PORT', v)} />
                                        <InputField label="Web Client Port" type="number" value={settings.NEURO_SAN_WEB_CLIENT_PORT} onChange={(v) => handleChange('NEURO_SAN_WEB_CLIENT_PORT', v)} />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 mt-4">
                                        <InputField label="Log JSON File" value={settings.AGENT_SERVICE_LOG_JSON} onChange={(v) => handleChange('AGENT_SERVICE_LOG_JSON', v)} />
                                        <InputField label="Thinking File Path" value={settings.THINKING_FILE} onChange={(v) => handleChange('THINKING_FILE', v)} help="File storing agent's streaming thoughts." />
                                    </div>
                                </div>
                            )}

                            {/* LLM Providers */}
                            {activeTab === 'llm' && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    {/* Global Default Section */}
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 border-b border-gray-200 dark:border-gray-800 pb-2">Global LLM Default Config</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Fallback configuration used if agents do not specify their own model <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">(llm_config.hocon)</span>.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <SelectField
                                            label="Default Model Class"
                                            value={settings.DEFAULT_LLM_CLASS}
                                            onChange={(v) => handleChange('DEFAULT_LLM_CLASS', v)}
                                            options={['azure-openai', 'openai', 'anthropic', 'gemini', 'bedrock', 'nvidia', 'ollama']}
                                        />
                                        <InputField
                                            label="Default Model Name"
                                            value={settings.DEFAULT_LLM_MODEL_NAME}
                                            onChange={(v) => handleChange('DEFAULT_LLM_MODEL_NAME', v)}
                                        />
                                    </div>

                                    <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-800">
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 border-b border-gray-200 dark:border-gray-800 pb-2">LLM Provider API Keys</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Global API keys for connecting standard Large Language Models.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <SecretField label="OpenAI API Key" value={settings.OPENAI_API_KEY} onChange={(v) => handleChange('OPENAI_API_KEY', v)} />
                                        <SecretField label="Anthropic API Key" value={settings.ANTHROPIC_API_KEY} onChange={(v) => handleChange('ANTHROPIC_API_KEY', v)} />
                                        <SecretField label="Google Gemini API Key" value={settings.GOOGLE_API_KEY} onChange={(v) => handleChange('GOOGLE_API_KEY', v)} />
                                    </div>
                                    <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-800">
                                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">AWS Bedrock Credentials</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputField label="AWS Access Key ID" value={settings.AWS_ACCESS_KEY_ID} onChange={(v) => handleChange('AWS_ACCESS_KEY_ID', v)} />
                                            <SecretField label="AWS Secret Access Key" value={settings.AWS_SECRET_ACCESS_KEY} onChange={(v) => handleChange('AWS_SECRET_ACCESS_KEY', v)} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Azure OpenAI */}
                            {activeTab === 'azure' && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 border-b border-gray-200 dark:border-gray-800 pb-2">Azure OpenAI</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Enterprise connection details for Microsoft Azure OpenAI endpoints.</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <InputField label="Azure Endpoint URL" value={settings.AZURE_OPENAI_ENDPOINT} onChange={(v) => handleChange('AZURE_OPENAI_ENDPOINT', v)} help="e.g. https://<your base url>.openai.azure.com/" />
                                        <InputField label="API Version" value={settings.OPENAI_API_VERSION} onChange={(v) => handleChange('OPENAI_API_VERSION', v)} help="e.g. 2024-12-01-preview" />
                                        <SecretField label="Azure API Key" value={settings.AZURE_OPENAI_API_KEY} onChange={(v) => handleChange('AZURE_OPENAI_API_KEY', v)} />
                                        <InputField label="Deployment Name" value={settings.AZURE_OPENAI_DEPLOYMENT_NAME} onChange={(v) => handleChange('AZURE_OPENAI_DEPLOYMENT_NAME', v)} />
                                    </div>
                                </div>
                            )}

                            {/* Intranet & ECM */}
                            {activeTab === 'intranet' && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 border-b border-gray-200 dark:border-gray-800 pb-2">Intranet & Oracle HCM</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Base URLs for corporate systems used by internal agents.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField label="MI Base URL" value={settings.MI_BASE_URL} onChange={(v) => handleChange('MI_BASE_URL', v)} />
                                        <InputField label="MI App URL" value={settings.MI_APP_URL} onChange={(v) => handleChange('MI_APP_URL', v)} />
                                        <InputField label="MI Intranet" value={settings.MI_INTRANET} onChange={(v) => handleChange('MI_INTRANET', v)} />
                                        <InputField label="MI HCM API" value={settings.MI_HCM} onChange={(v) => handleChange('MI_HCM', v)} />
                                        <InputField label="Absence Management" value={settings.MI_ABSENCE_MANAGEMENT} onChange={(v) => handleChange('MI_ABSENCE_MANAGEMENT', v)} />
                                        <InputField label="Travel & Expense" value={settings.MI_TRAVEL_AND_EXPENSE} onChange={(v) => handleChange('MI_TRAVEL_AND_EXPENSE', v)} />
                                    </div>

                                    <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-800">
                                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">ServiceNow Integrations</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputField label="Instance URL" value={settings.SERVICENOW_INSTANCE_URL} onChange={(v) => handleChange('SERVICENOW_INSTANCE_URL', v)} />
                                            <InputField label="Caller Email" value={settings.SERVICENOW_CALLER_EMAIL} onChange={(v) => handleChange('SERVICENOW_CALLER_EMAIL', v)} />
                                            <InputField label="ServiceNow User" value={settings.SERVICENOW_USER} onChange={(v) => handleChange('SERVICENOW_USER', v)} />
                                            <SecretField label="ServiceNow Password" value={settings.SERVICENOW_PWD} onChange={(v) => handleChange('SERVICENOW_PWD', v)} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Cloud APIs */}
                            {activeTab === 'cloud' && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 border-b border-gray-200 dark:border-gray-800 pb-2">Salesforce Agentforce</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField label="My Domain URL" value={settings.AGENTFORCE_MY_DOMAIN_URL} onChange={(v) => handleChange('AGENTFORCE_MY_DOMAIN_URL', v)} />
                                        <InputField label="Agent ID" value={settings.AGENTFORCE_AGENT_ID} onChange={(v) => handleChange('AGENTFORCE_AGENT_ID', v)} />
                                        <InputField label="Client ID" value={settings.AGENTFORCE_CLIENT_ID} onChange={(v) => handleChange('AGENTFORCE_CLIENT_ID', v)} />
                                        <SecretField label="Client Secret" value={settings.AGENTFORCE_CLIENT_SECRET} onChange={(v) => handleChange('AGENTFORCE_CLIENT_SECRET', v)} />
                                    </div>

                                    <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-800">
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 border-b border-gray-200 dark:border-gray-800 pb-2">Google Agentspace</h3>
                                        <div className="grid grid-cols-1 gap-4 mt-4">
                                            <InputField label="GCP Project ID" value={settings.GCP_PROJECT_ID} onChange={(v) => handleChange('GCP_PROJECT_ID', v)} />
                                            <InputField label="Engine ID" value={settings.ENGINE_ID} onChange={(v) => handleChange('ENGINE_ID', v)} />
                                            <InputField label="Service Account Email" value={settings.SERVICE_ACCT_EMAIL} onChange={(v) => handleChange('SERVICE_ACCT_EMAIL', v)} />
                                            <InputField label="Google Application Credentials JSON Path" value={settings.GOOGLE_APPLICATION_CREDENTIALS} onChange={(v) => handleChange('GOOGLE_APPLICATION_CREDENTIALS', v)} />
                                        </div>
                                    </div>

                                    <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-800">
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 border-b border-gray-200 dark:border-gray-800 pb-2">Brave Web Search</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <SecretField label="Brave API Key" value={settings.BRAVE_API_KEY} onChange={(v) => handleChange('BRAVE_API_KEY', v)} />
                                            <InputField label="Timeout" type="number" value={settings.BRAVE_TIMEOUT} onChange={(v) => handleChange('BRAVE_TIMEOUT', v)} />
                                            <div className="md:col-span-2">
                                                <InputField label="Brave URL" value={settings.BRAVE_URL} onChange={(v) => handleChange('BRAVE_URL', v)} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Observability */}
                            {activeTab === 'observability' && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 border-b border-gray-200 dark:border-gray-800 pb-2">Observability & Logging</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Configure local metrics, tracing, and log bridges.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <SelectField label="Phoenix Enabled" value={settings.PHOENIX_ENABLED} onChange={(v) => handleChange('PHOENIX_ENABLED', v)} options={['true', 'false']} />
                                        <SelectField label="Phoenix Auto-Start" value={settings.PHOENIX_AUTOSTART} onChange={(v) => handleChange('PHOENIX_AUTOSTART', v)} options={['true', 'false']} />
                                        <SelectField label="Log Bridge Enabled" value={settings.LOGBRIDGE_ENABLED} onChange={(v) => handleChange('LOGBRIDGE_ENABLED', v)} options={['true', 'false']} />
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#15161a] flex justify-end gap-3 rounded-b-2xl transition-colors">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1a1d21] border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={savedState}
                        className={`px-5 py-2 text-sm font-bold flex items-center gap-2 rounded-lg transition-all duration-200 shadow-lg ${savedState
                            ? 'bg-green-600 text-white shadow-green-900/20'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
                            }`}
                    >
                        {savedState ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Environments</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Reusable UI Components
const InputField = ({ label, value, onChange, type = "text", help }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white dark:bg-[#111216] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600"
            placeholder={`Enter ${label}...`}
        />
        {help && <span className="text-[10px] text-gray-500 dark:text-gray-500">{help}</span>}
    </div>
);

const SecretField = ({ label, value, onChange }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">{label}</label>
        <input
            type="password"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white dark:bg-[#111216] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-colors font-mono tracking-widest"
            placeholder="••••••••••••••••••••••••••••••"
        />
    </div>
);

const SelectField = ({ label, value, onChange, options }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white dark:bg-[#111216] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

export default SettingsModal;
