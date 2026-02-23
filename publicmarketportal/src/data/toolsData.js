import { Search, Mail, Image, Video, Code, FileText, Globe, Database, MessageSquare, Zap } from 'lucide-react';

/**
 * Available tools from registries/tools directory
 * These can be added to agents via the context menu
 */
export const availableTools = [
    // Search Tools
    { id: 'google_search', name: 'Google Search', category: 'Search', icon: Search, description: 'Search the web using Google' },
    { id: 'brave_search', name: 'Brave Search', category: 'Search', icon: Search, description: 'Privacy-focused web search' },
    { id: 'ddgs_search', name: 'DuckDuckGo Search', category: 'Search', icon: Search, description: 'Privacy-first search engine' },
    { id: 'wikimedia_search', name: 'Wikimedia Search', category: 'Search', icon: Search, description: 'Search Wikimedia projects' },

    // RAG Tools
    { id: 'arxiv_rag', name: 'ArXiv RAG', category: 'Knowledge', icon: FileText, description: 'Research paper retrieval from ArXiv' },
    { id: 'wikipedia_rag', name: 'Wikipedia RAG', category: 'Knowledge', icon: Globe, description: 'Wikipedia knowledge retrieval' },
    { id: 'confluence_rag', name: 'Confluence RAG', category: 'Knowledge', icon: Database, description: 'Confluence documentation search' },
    { id: 'pdf_rag', name: 'PDF RAG', category: 'Knowledge', icon: FileText, description: 'Extract and query PDF documents' },
    { id: 'agentic_rag', name: 'Agentic RAG', category: 'Knowledge', icon: Database, description: 'Advanced agentic retrieval' },

    // Communication
    { id: 'gmail', name: 'Gmail', category: 'Communication', icon: Mail, description: 'Send and manage Gmail emails' },

    // Web & Search (AI Provider)
    { id: 'anthropic_web_search', name: 'Anthropic Web Search', category: 'AI Search', icon: Search, description: 'Claude-powered web search' },
    { id: 'openai_web_search', name: 'OpenAI Web Search', category: 'AI Search', icon: Search, description: 'GPT-powered web search' },

    // Code Execution
    { id: 'anthropic_code_execution', name: 'Anthropic Code Exec', category: 'Code', icon: Code, description: 'Execute code with Claude' },
    { id: 'openai_code_interpreter', name: 'OpenAI Code Interpreter', category: 'Code', icon: Code, description: 'Run code with GPT' },

    // Image Generation
    { id: 'openai_image_generation', name: 'DALL-E Image Gen', category: 'Media', icon: Image, description: 'Generate images with DALL-E' },
    { id: 'gemini_image_generation', name: 'Gemini Image Gen', category: 'Media', icon: Image, description: 'Generate images with Gemini' },

    // Video
    { id: 'openai_video_generation', name: 'OpenAI Video Gen', category: 'Media', icon: Video, description: 'Generate videos with Sora' },

    // Visual
    { id: 'visual_question_answering', name: 'Visual QA', category: 'Vision', icon: Image, description: 'Answer questions about images' },

    // Location
    { id: 'google_maps', name: 'Google Maps', category: 'Location', icon: Globe, description: 'Maps and location services' },

    // Agent Integrations
    { id: 'agentforce', name: 'Agentforce', category: 'Agents', icon: Zap, description: 'Salesforce Agentforce integration' },
    { id: 'agentspace_adapter', name: 'AgentSpace Adapter', category: 'Agents', icon: Zap, description: 'Google AgentSpace connector' },
    { id: 'now_agents', name: 'ServiceNow Agents', category: 'Agents', icon: Zap, description: 'ServiceNow Now Agents' },

    // MCP
    { id: 'mcp_bmi_streamable_http', name: 'MCP BMI HTTP', category: 'MCP', icon: Globe, description: 'Streamable HTTP MCP tool' },

    // Research
    { id: 'a2a_research_report', name: 'A2A Research Report', category: 'Research', icon: FileText, description: 'Generate research reports' },

    // Utility
    { id: 'agent_network_html_creator', name: 'HTML Creator', category: 'Utility', icon: Code, description: 'Create HTML from agent networks' },
];

/**
 * Tool categories for filtering
 */
export const toolCategories = [
    'All',
    'Search',
    'Knowledge',
    'Communication',
    'AI Search',
    'Code',
    'Media',
    'Vision',
    'Location',
    'Agents',
    'MCP',
    'Research',
    'Utility'
];

/**
 * Get tool by ID
 */
export const getToolById = (toolId) => {
    return availableTools.find(t => t.id === toolId);
};

/**
 * Get tools by category
 */
export const getToolsByCategory = (category) => {
    if (category === 'All') return availableTools;
    return availableTools.filter(t => t.category === category);
};
