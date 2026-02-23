import React, { useState } from 'react';
import { Box, Server, Database, Cloud, Code, ChevronRight, ChevronDown, Download, Search } from 'lucide-react';

const McpMarketplace = ({ isOpen, onToggle }) => {
    // Mock Data for MCP Servers
    const [expandedFolders, setExpandedFolders] = useState(new Set(['Official', 'Community']));
    const [searchQuery, setSearchQuery] = useState('');

    const toggleFolder = (folderName) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(folderName)) newSet.delete(folderName);
            else newSet.add(folderName);
            return newSet;
        });
    };

    const mockServers = [
        { id: 'mcp-1', name: 'PostgreSQL Explorer', publisher: 'Official', icon: Database, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Read/Write query access to Postgres databases.' },
        { id: 'mcp-2', name: 'GitHub Integration', publisher: 'Official', icon: Code, color: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-200 dark:bg-gray-700/50', desc: 'Manage issues, PRs, and repository contents.' },
        { id: 'mcp-3', name: 'AWS Cloud Tools', publisher: 'Official', icon: Cloud, color: 'text-orange-500', bg: 'bg-orange-500/10', desc: 'Manage EC2, S3, and Lambda functions.' },
        { id: 'mcp-4', name: 'Slack Bot Notifier', publisher: 'Community', icon: Server, color: 'text-pink-500', bg: 'bg-pink-500/10', desc: 'Send direct messages and channel notifications.' },
        { id: 'mcp-5', name: 'Jira Agile Planner', publisher: 'Community', icon: Server, color: 'text-blue-600', bg: 'bg-blue-600/10', desc: 'Create and transition Jira tickets easily.' },
    ];

    const groupedServers = {
        'Official': mockServers.filter(s => s.publisher === 'Official'),
        'Community': mockServers.filter(s => s.publisher === 'Community')
    };

    const handleDragStart = (e, server) => {
        e.dataTransfer.setData('application/reactflow', 'sub-network'); // Treat MCPs similarly to sub-networks visually for now
        e.dataTransfer.setData('application/json', JSON.stringify({
            label: server.name,
            type: 'sub-network',
            sourceId: server.id,
            description: server.desc
        }));
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            className={`
                fixed left-0 top-16 bottom-0 z-40 bg-white dark:bg-[#1a1d21] border-r border-gray-200 dark:border-white/10
                transition-all duration-300 ease-in-out flex flex-col shadow-xl
                ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0 pointer-events-none'}
            `}
        >
            <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Box size={16} className="text-purple-600 dark:text-purple-400" />
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">MCP Marketplace</h2>
                </div>
                <button
                    onClick={onToggle}
                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="p-3 border-b border-gray-200 dark:border-white/10">
                <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search servers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-md focus:outline-none focus:border-purple-500 dark:focus:border-purple-500 text-gray-800 dark:text-gray-200"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {Object.entries(groupedServers).map(([category, items]) => {
                    const isExpanded = expandedFolders.has(category);
                    const filteredItems = items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

                    if (filteredItems.length === 0) return null;

                    return (
                        <div key={category} className="mb-2">
                            {/* Folder Header */}
                            <button
                                onClick={() => toggleFolder(category)}
                                className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors group"
                            >
                                <div className="text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300 transition-colors">
                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </div>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex-1 text-left">
                                    {category}
                                </span>
                                <span className="text-[10px] bg-gray-100 dark:bg-white/10 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
                                    {filteredItems.length}
                                </span>
                            </button>

                            {/* Folder Contents */}
                            {isExpanded && (
                                <div className="ml-2 pl-2 border-l border-gray-200 dark:border-white/10 mt-1 grid gap-1">
                                    {filteredItems.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <div
                                                key={item.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, item)}
                                                className={`
                                                    p-2 rounded-lg cursor-grab active:cursor-grabbing group
                                                    border border-transparent hover:border-gray-200 dark:hover:border-white/10
                                                    hover:bg-gray-50 dark:hover:bg-white/5 transition-all
                                                `}
                                                title={item.desc}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-1.5 rounded-md ${item.bg}`}>
                                                        <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                            {item.name}
                                                        </div>
                                                        <div className="text-[9px] text-gray-500 dark:text-gray-500 truncate mt-0.5">
                                                            {item.desc}
                                                        </div>
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Download size={12} className="text-purple-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black/20 text-center">
                <a href="#" className="text-[10px] font-medium text-purple-600 dark:text-purple-400 hover:underline">
                    Publish your own standard →
                </a>
            </div>
        </div>
    );
};

export default McpMarketplace;
