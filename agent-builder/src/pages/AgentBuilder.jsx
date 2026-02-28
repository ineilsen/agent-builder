import React, { useState, useEffect } from 'react';
import { Wrench, Play, Settings, Layers, MessageCircle, Sun, Moon, X, Maximize2, Minimize2 } from 'lucide-react';
import ComponentCard from '../components/ComponentCard';
import FlowCanvas from '../components/FlowCanvas';
import ChatPanel from '../components/ChatPanel';
import ExecutionLogsPanel from '../components/ExecutionLogsPanel';
import AgentConfigPanel from '../components/AgentConfigPanel';
import { components, platforms } from '../data/agentBuilderData';
import { AgentNetworkProvider, useAgentNetwork } from '../context/AgentNetworkContext';

const AgentBuilderContent = () => {
  const {
    networks, currentNetwork, loadNetwork, graphData, selectAgent, selectedAgentId,
    updateAgentPrompt, isLoading, error,
    chatMessages, isChatConnected, isChatLoading,
    connectChat, sendChatMessage, disconnectChat,
    // Real-time animation state
    activeAgents, agentChain,
    addNode
  } = useAgentNetwork();

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [configAgentId, setConfigAgentId] = useState(null);
  const [agentConfigs, setAgentConfigs] = useState({});
  const [isLogsPanelCollapsed, setIsLogsPanelCollapsed] = useState(false);
  const [activePopover, setActivePopover] = useState({ id: null, rect: null });
  const [platformConfigs, setPlatformConfigs] = useState({});
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Compute active connections based on the agent chain
  const activeConnections = React.useMemo(() => {
    if (!agentChain || agentChain.length < 2) return [];

    const connections = [];
    for (let i = 0; i < agentChain.length - 1; i++) {
      connections.push({
        source: agentChain[i],
        target: agentChain[i + 1]
      });
    }
    return connections;
  }, [agentChain]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const handleTestChat = () => {
    if (isChatConnected) {
      disconnectChat();
    } else {
      connectChat();
    }
  };

  const handleConfigSave = async (config) => {
    if (config.agentId && config.instructions) {
      await updateAgentPrompt(config.agentId, config.instructions);
    }
    setAgentConfigs(prev => ({ ...prev, [config.agentId]: config }));
    setConfigAgentId(null);
  };

  const currentInstructions = (configAgentId && graphData?.agentDetails?.[configAgentId]?.instructions) || '';

  return (
    <div className="h-full w-full flex flex-col bg-gray-100 dark:bg-[#0a0b0d] overflow-hidden text-gray-900 dark:text-gray-100 font-sans">
      {/* Compact Header */}
      <div className="bg-white/90 dark:bg-[#111214]/90 backdrop-blur-md border-b border-gray-300 dark:border-white/5 py-2 px-4 shrink-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md text-white">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight leading-none">Agent Builder Studio</h1>
              <span className="text-[10px] text-gray-500">Network Editor</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={currentNetwork || ''}
              onChange={(e) => loadNetwork(e.target.value)}
              className="bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[200px]"
            >
              <option value="" disabled>Select Network</option>
              {networks.map(net => (
                <option key={net} value={net}>{net}</option>
              ))}
            </select>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 rounded-md bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
              title={isDarkMode ? "Light Mode" : "Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleTestChat}
              disabled={!currentNetwork}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all
                ${isChatConnected
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20'
                  : currentNetwork
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                    : 'bg-gray-200 dark:bg-white/5 text-gray-400 cursor-not-allowed'}
              `}
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isChatConnected ? 'Disconnect' : 'Connect'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout - Full Bleed */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Left Sidebar - Compact */}
        <div className="w-[320px] shrink-0 border-r border-gray-300 dark:border-white/5 bg-white dark:bg-[#0a0b0d] flex flex-col p-2 gap-2 overflow-y-auto custom-scrollbar">
          {/* Components */}
          <div className="bg-white dark:bg-[#15161a] rounded-lg border border-gray-300 dark:border-white/5 p-2.5">
            <div className="flex items-center space-x-2 mb-2 text-gray-600 dark:text-white/60">
              <Layers className="w-3.5 h-3.5" />
              <h3 className="font-semibold text-xs">Components</h3>
            </div>
            <div className="space-y-1.5">
              {components.map(component => (
                <ComponentCard key={component.id} component={component} />
              ))}
            </div>
          </div>

          {/* Platform */}
          <div className="bg-white dark:bg-[#15161a] rounded-lg border border-gray-300 dark:border-white/5 p-2.5">
            <div className="flex items-center space-x-2 mb-2 text-gray-600 dark:text-white/60">
              <Settings className="w-3.5 h-3.5" />
              <h3 className="font-semibold text-xs">Platform</h3>
            </div>
            <div className="space-y-1.5 pb-20">
              {platforms.map(platform => {
                const isConfigured = platformConfigs[platform.id]?.configured || (platform.status === 'Connected');
                const isPopoverOpen = activePopover.id === platform.id;

                return (
                  <div key={platform.id} className="relative">
                    <div
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setActivePopover(isPopoverOpen ? { id: null, rect: null } : { id: platform.id, rect });
                      }}
                      className={`border ${isPopoverOpen ? 'border-blue-500 bg-blue-50 dark:bg-white/10' : 'border-gray-300 dark:border-white/5'} rounded-md p-2 hover:border-blue-500/30 hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer group`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-base group-hover:scale-110 transition-transform">{platform.emoji}</span>
                        <div>
                          <p className="text-[11px] font-semibold text-gray-800 dark:text-gray-200">{platform.name}</p>
                          <div className="flex gap-1 mt-0.5">
                            {isConfigured ? (
                              <>
                                <span className="text-[9px] px-1 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium">Connected</span>
                                <span className="text-[9px] px-1 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">Configured</span>
                              </>
                            ) : (
                              <span className="text-[9px] px-1 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 font-medium">Not Connected</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center - Canvas + Bottom Logs Panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-100 dark:bg-[#050506] relative">

          {/* Canvas Area */}
          <div className={`overflow-hidden transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-[60] bg-gray-100 dark:bg-[#050506]' : `relative ${isLogsPanelCollapsed ? 'flex-1' : 'flex-[7]'}`}`}>
            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="absolute top-4 right-4 z-20 p-2 bg-white dark:bg-[#15161a] border border-gray-200 dark:border-white/10 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 transition-colors"
              title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {isLoading && (
              <div className="absolute inset-0 bg-white/60 dark:bg-black/60 z-30 flex items-center justify-center backdrop-blur-sm">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mb-2"></div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium text-xs">Loading...</span>
                </div>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 bg-white/80 dark:bg-black/80 z-30 flex flex-col items-center justify-center p-4 text-center">
                <div className="text-red-500 font-semibold mb-1 text-sm">Error</div>
                <p className="text-gray-600 dark:text-gray-400 text-xs mb-3">{error}</p>
                <button onClick={() => loadNetwork(currentNetwork)} className="px-2 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded text-xs font-medium">Retry</button>
              </div>
            )}

            <FlowCanvas
              nodes={graphData?.nodes || []}
              connections={graphData?.edges || []}
              onNodeClick={(_, node) => selectAgent(node?.id)}
              onMenuClick={(agentId) => setConfigAgentId(agentId)}
              selectedNodeId={selectedAgentId}
              agentConfigs={agentConfigs}
              activeAgents={activeAgents}
              activeConnections={activeConnections}
              onAddNode={(parentId, type) => addNode(parentId, type)}
            />

            {configAgentId && (
              <AgentConfigPanel
                agentId={configAgentId}
                instructions={currentInstructions}
                onSave={handleConfigSave}
                onClose={() => setConfigAgentId(null)}
              />
            )}
          </div>

          {/* Bottom Logs Panel (Full Width) */}
          <div className={`shrink-0 ${isLogsPanelCollapsed ? 'h-8' : 'flex-[3] min-h-[200px]'}`}>
            <ExecutionLogsPanel
              isCollapsed={isLogsPanelCollapsed}
              onToggleCollapse={() => setIsLogsPanelCollapsed(!isLogsPanelCollapsed)}
            />
          </div>
        </div>

        {/* Right Sidebar - Chat Only */}
        <div className="w-[475px] shrink-0 border-l border-gray-300 dark:border-white/5 bg-white dark:bg-[#0a0b0d] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-300 dark:border-white/5 bg-white dark:bg-[#111214] shrink-0">
            <div className="flex items-center space-x-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Chat</span>
              {isChatConnected && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>}
            </div>
            {currentNetwork && (
              <span className="text-[10px] text-gray-500 dark:text-gray-400">{currentNetwork}</span>
            )}
          </div>

          <div className="flex-1 overflow-hidden bg-white dark:bg-[#15161a]">
            <ChatPanel
              messages={chatMessages}
              onSendMessage={sendChatMessage}
              isConnected={isChatConnected}
              isLoading={isChatLoading}
              networkName={currentNetwork}
            />
          </div>
        </div>
      </div>

      {/* Global Popover */}
      {
        activePopover.id && activePopover.rect && (
          <div
            className="fixed z-[100] w-64 bg-white dark:bg-[#15161a] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200"
            style={{
              top: Math.min(activePopover.rect.top, window.innerHeight - 350),
              left: activePopover.rect.right + 10
            }}
          >
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-white/5 pb-2">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                {platforms.find(p => p.id === activePopover.id)?.emoji} Configure {platforms.find(p => p.id === activePopover.id)?.name}
              </h4>
              <button onClick={() => setActivePopover({ id: null, rect: null })} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">API Key</label>
                <div className="relative">
                  <input
                    type="password"
                    defaultValue="sk-........................"
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none dark:text-gray-300"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Endpoint URL</label>
                <input
                  type="text"
                  defaultValue={`https://api.${activePopover.id.toLowerCase()}.com/v1`}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Model Name</label>
                <select className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300">
                  <option>Default (Recommended)</option>
                  <option>Latest V4</option>
                  <option>Legacy V3</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    setPlatformConfigs(prev => ({ ...prev, [activePopover.id]: { configured: true } }));
                    setActivePopover({ id: null, rect: null });
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 rounded font-medium transition-colors"
                >
                  {(platformConfigs[activePopover.id]?.configured || platforms.find(p => p.id === activePopover.id)?.status === 'Connected') ? 'Update' : 'Connect'}
                </button>
                {(platformConfigs[activePopover.id]?.configured || platforms.find(p => p.id === activePopover.id)?.status === 'Connected') && (
                  <button
                    onClick={() => {
                      setPlatformConfigs(prev => ({ ...prev, [activePopover.id]: { configured: false } }));
                      setActivePopover({ id: null, rect: null });
                    }}
                    className="px-3 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 text-xs py-1.5 rounded font-medium transition-colors"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

const AgentBuilder = () => {
  return (
    <AgentNetworkProvider>
      <AgentBuilderContent />
    </AgentNetworkProvider>
  );
};

export default AgentBuilder;
