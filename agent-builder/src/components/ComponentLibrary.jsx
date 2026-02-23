import React, { useState, useMemo } from 'react';
import { Bot, Wrench, Globe, TerminalSquare, Search, Calculator, Database, ChevronDown, ChevronRight, Puzzle } from 'lucide-react';
import { useAgentNetwork } from '../context/AgentNetworkContext';

const ComponentLibrary = ({ isOpen, onToggle }) => {
    const { tools } = useAgentNetwork();

    // State to track which folders are expanded
    const [expandedFolders, setExpandedFolders] = useState(new Set(['Search', 'Knowledge Retrieval', 'OpenAI', 'Anthropic', 'Google', 'General Tools']));

    const toggleFolder = (folderName) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(folderName)) {
                newSet.delete(folderName);
            } else {
                newSet.add(folderName);
            }
            return newSet;
        });
    };

    const handleDragStart = (e, item) => {
        e.dataTransfer.setData('application/reactflow', item.type);
        e.dataTransfer.setData('application/json', JSON.stringify({
            label: item.label,
            type: item.type,
            sourceId: item.id
        }));
        e.dataTransfer.effectAllowed = 'move';
    };

    // Group tools into categories
    const groupedComponents = useMemo(() => {
        const groups = {
            'Anthropic': { items: [], icon: Bot, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            'OpenAI': { items: [], icon: Bot, color: 'text-green-500', bg: 'bg-green-500/10' },
            'Google': { items: [], icon: Bot, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            'Search': { items: [], icon: Search, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            'Knowledge Retrieval': { items: [], icon: Database, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
            'General Tools': { items: [], icon: Wrench, color: 'text-rose-500', bg: 'bg-rose-500/10' }
        };

        if (!tools || tools.length === 0) return [];

        tools.forEach(tool => {
            const id = tool.id.toLowerCase();
            const cls = tool.class.toLowerCase();

            let category = 'General Tools';

            if (id.includes('rag') || cls.includes('rag')) {
                category = 'Knowledge Retrieval';
            } else if (id.includes('search') || cls.includes('search') || id.includes('serper') || id.includes('tavily')) {
                // OpenAI/Anthropic search ones should go to their respective providers or to search? Let's put everything 'search' into Search unless strongly branded.
                if (id.includes('anthropic')) category = 'Anthropic';
                else if (id.includes('openai')) category = 'OpenAI';
                else category = 'Search';
            } else if (id.includes('anthropic') || cls.includes('anthropic')) {
                category = 'Anthropic';
            } else if (id.includes('openai') || cls.includes('openai')) {
                category = 'OpenAI';
            } else if (id.includes('gemini') || id.includes('google') || cls.includes('gemini') || cls.includes('google')) {
                category = 'Google';
            }

            groups[category].items.push({
                id: tool.id,
                type: 'native-tool',
                label: tool.id.replace(/_/g, ' '),
                path: tool.class,
                description: tool.description
            });
        });

        // Filter out empty groups and convert to an array for rendering
        const result = [];
        for (const [folderName, groupData] of Object.entries(groups)) {
            if (groupData.items.length > 0) {
                // Sort items alphabetically within the folder
                groupData.items.sort((a, b) => a.label.localeCompare(b.label));
                result.push({
                    category: folderName,
                    ...groupData
                });
            }
        }

        return result;
    }, [tools]);

    return (
        <div
            className={`
                fixed left-0 top-16 bottom-0 z-40 bg-white dark:bg-[#1a1d21] border-r border-gray-200 dark:border-white/10
                transition-all duration-300 ease-in-out flex flex-col shadow-xl
                ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0 pointer-events-none'}
            `}
        >
            <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Component Library</h2>
                <button
                    onClick={onToggle}
                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {groupedComponents.map((section) => {
                    const isExpanded = expandedFolders.has(section.category);
                    const FolderIcon = section.icon;
                    return (
                        <div key={section.category} className="mb-2">
                            {/* Folder Header */}
                            <button
                                onClick={() => toggleFolder(section.category)}
                                className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors group"
                            >
                                <div className="text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300 transition-colors">
                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </div>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex-1 text-left">
                                    {section.category}
                                </span>
                                <span className="text-[10px] bg-gray-100 dark:bg-white/10 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
                                    {section.items.length}
                                </span>
                            </button>

                            {/* Folder Contents */}
                            {isExpanded && (
                                <div className="ml-2 pl-2 border-l border-gray-200 dark:border-white/10 mt-1 grid gap-1">
                                    {section.items.map((item, index) => (
                                        <div
                                            key={`${item.id}-${index}`}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, item)}
                                            className={`
                                                flex items-center gap-3 p-1.5 rounded-lg cursor-grab active:cursor-grabbing
                                                border border-transparent hover:border-gray-200 dark:hover:border-white/10
                                                hover:bg-gray-50 dark:hover:bg-white/5 transition-all
                                            `}
                                            title={item.path}
                                        >
                                            <div className={`p-1 rounded-md ${section.bg}`}>
                                                <FolderIcon className={`w-3.5 h-3.5 ${section.color}`} />
                                            </div>
                                            <span className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate">
                                                {item.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
                <div className="text-[11px] text-gray-500 dark:text-gray-400 text-center font-medium">
                    Drag components onto the canvas
                </div>
            </div>
        </div>
    );
};

export default ComponentLibrary;
