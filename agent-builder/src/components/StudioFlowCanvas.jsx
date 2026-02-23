import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Zap, Bot, Box, Globe, CircuitBoard, Layers,
  Settings, Wrench, MoreHorizontal, ChevronRight,
  Database, Server, Cpu, Thermometer, Hash, Sparkles, LayoutGrid
} from 'lucide-react';
import { getLayoutedElements } from '../utils/dagre-layout';
import AgentContextMenu from './AgentContextMenu';
import NeuralAgentNode from './NeuralAgentNode';
import SynapticConnection from './SynapticConnection';

// Enhanced Node Component
const Node = ({ node, onMouseDown, isSelected, onClick, onMenuClick, onContextMenu, agentConfig, agentTools = [], agentMCPs = [], isActive = false, onAddChild, isArrangeMode }) => {
  const { type, data } = node;

  // Icon and Theme configurations
  const getTypeConfig = (type) => {
    switch (type) {
      case 'frontman':
        return {
          icon: CircuitBoard,
          header: 'Main Agent',
          style: isActive
            ? 'border-purple-600 shadow-[0_0_40px_rgba(168,85,247,0.3)] dark:border-purple-500 dark:shadow-[0_0_40px_rgba(168,85,247,0.6)] ring-2 ring-purple-300 dark:ring-purple-400/50 animate-agent-pulse'
            : 'border-purple-400 dark:border-purple-500/80 shadow-md dark:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)] hover:border-purple-500',
          headerBg: 'bg-purple-50 dark:bg-gradient-to-r dark:from-purple-900/80 dark:to-purple-800/50 border-b border-purple-200 dark:border-transparent',
          iconBg: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300',
          headerText: 'text-purple-900 font-bold dark:font-semibold dark:text-white/70',
          activeIndicator: true
        };
      case 'tool':
        return {
          icon: Wrench,
          header: 'Coded Tool',
          style: isActive
            ? 'border-cyan-600 shadow-[0_0_30px_rgba(6,182,212,0.3)] dark:border-cyan-500 dark:shadow-[0_0_30px_rgba(6,182,212,0.6)] ring-2 ring-cyan-300 dark:ring-cyan-400/50 animate-agent-pulse'
            : 'border-cyan-300 dark:border-cyan-500/30 shadow-md hover:border-cyan-400',
          headerBg: 'bg-cyan-50 dark:bg-gradient-to-r dark:from-cyan-900/60 dark:to-cyan-800/30 border-b border-cyan-200 dark:border-transparent',
          iconBg: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300',
          headerText: 'text-cyan-900 font-bold dark:font-semibold dark:text-white/70',
          activeIndicator: false
        };
      case 'native-tool':
        return {
          icon: Thermometer, // General icon since Native Tools range heavily, but let's use Database or Zap? Let's use Layers
          header: 'Native integration',
          style: isActive
            ? 'border-rose-600 shadow-[0_0_30px_rgba(244,63,94,0.3)] dark:border-rose-500 dark:shadow-[0_0_30px_rgba(244,63,94,0.6)] ring-2 ring-rose-300 dark:ring-rose-400/50 animate-agent-pulse'
            : 'border-rose-300 dark:border-rose-500/30 shadow-md hover:border-rose-400',
          headerBg: 'bg-rose-50 dark:bg-gradient-to-r dark:from-rose-900/60 dark:to-rose-800/30 border-b border-rose-200 dark:border-transparent',
          iconBg: 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300',
          headerText: 'text-rose-900 font-bold dark:font-semibold dark:text-white/70',
          activeIndicator: false
        };
      case 'sub-network':
        return {
          icon: Globe,
          header: 'External Network',
          style: isActive
            ? 'border-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.3)] dark:border-emerald-500 dark:shadow-[0_0_30px_rgba(16,185,129,0.6)] ring-2 ring-emerald-300 dark:ring-emerald-400/50 animate-agent-pulse'
            : 'border-emerald-300 dark:border-emerald-500/30 shadow-md hover:border-emerald-400',
          headerBg: 'bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/60 dark:to-emerald-800/30',
          iconBg: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300',
          headerText: 'text-emerald-900 dark:text-white/70',
          activeIndicator: false
        };
      case 'agent':
      default:
        return {
          icon: Bot,
          header: 'Sub-Agent',
          style: isActive
            ? 'border-blue-600 shadow-[0_0_30px_rgba(59,130,246,0.3)] dark:border-blue-500 dark:shadow-[0_0_30px_rgba(59,130,246,0.6)] ring-2 ring-blue-300 dark:ring-blue-400/50 animate-agent-pulse'
            : 'border-blue-300 dark:border-blue-500/30 shadow-md hover:border-blue-400',
          headerBg: 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/60 dark:to-blue-800/30',
          iconBg: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300',
          headerText: 'text-blue-900 dark:text-white/70',
          activeIndicator: true
        };
    }
  };

  const config = getTypeConfig(type);
  const Icon = config.icon;

  // Extract LLM config display values - from node data (populated by HoconGraphMapper)
  const modelName = data?.llmModel;
  const llmProvider = data?.llmProvider;
  const temp = data?.llmTemperature;
  const hasCustomLlm = data?.hasCustomLlm;
  const tokens = agentConfig?.modelConfig?.maxTokens;

  // Get tools to display - combine dropdownTools with agentTools
  const displayTools = [...(data?.dropdownTools || []), ...agentTools].slice(0, 3);
  const extraToolCount = Math.max(0, (data?.dropdownTools?.length || 0) + agentTools.length - 3);

  // Get MCPs to display
  const displayMCPs = [...(data?.subNetworks || []), ...agentMCPs].slice(0, 2);
  const extraMCPCount = Math.max(0, (data?.subNetworks?.length || 0) + agentMCPs.length - 2);

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu?.(e, node);
  };

  const bgMain = 'bg-white dark:bg-[#111216]/90';
  const borderMain = isActive ? config.style : `border border-gray-200 dark:border-gray-800/50 shadow-sm dark:shadow-xl hover:border-gray-300 dark:hover:border-gray-700 ${config.style}`;

  return (
    <div
      id={node.id}
      className={`absolute w-[280px] rounded-xl backdrop-blur-xl ${bgMain} transition-colors duration-300 group z-10 select-none
        ${isSelected
          ? '!border-blue-500 dark:!border-blue-400/50 !shadow-2xl dark:!shadow-[0_0_50px_-10px_rgba(59,130,246,0.3)] z-20'
          : isActive
            ? 'z-20'
            : borderMain}
      `}
      style={{
        transform: `translate(${node.position ? node.position.x : node.x}px, ${node.position ? node.position.y : node.y}px) ${isSelected || isActive ? 'scale(1.05)' : ''}`,
        willChange: 'transform',
        transition: 'border-color 300ms, box-shadow 300ms', // No transform transition during active drag tracking
        cursor: isArrangeMode ? 'grab' : 'pointer'
      }}
      onMouseDown={(e) => {
        if (isArrangeMode) {
          e.stopPropagation();
          e.preventDefault(); // Prevent native HTML dragging or text selection
          onMouseDown(e, node);
        }
      }}
      onClick={onClick}
      onContextMenu={handleContextMenu}
    >
      {/* Header */}
      <div className={`px-4 py-2.5 rounded-t-xl flex justify-between items-center border-b border-gray-100 dark:border-white/5 ${config.headerBg}`}>
        <div className="flex items-center gap-2">
          {config.activeIndicator && (
            isActive ? (
              <div className="relative flex h-3 w-3 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-spin-slow" style={{ border: '1px solid transparent', borderTopColor: 'white' }}></span>
                </span>
              </div>
            ) : (
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500/50"></span>
              </span>
            )
          )}
          <span className={`text-[10px] font-bold uppercase tracking-widest ${config.headerText}`}>{config.header}</span>
        </div>
        <div
          onClick={(e) => { e.stopPropagation(); onMenuClick && onMenuClick(node.id); }}
          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <MoreHorizontal className="w-4 h-4 text-gray-400 dark:text-white/50 cursor-pointer hover:text-gray-600 dark:hover:text-white" />
        </div>
      </div>

      {/* Body - unchanged content */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-transparent dark:border-white/5 ${config.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-1 truncate" title={data?.label}>{data?.label}</h4>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-tight line-clamp-2 min-h-[2.5em]" title={data?.instructions}>
              {data?.instructions || 'No description available'}
            </p>
          </div>
        </div>

        {/* LLM Model Badge - Always show if available */}
        {modelName && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border 
              ${hasCustomLlm
                ? 'bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-500/20 dark:to-fuchsia-500/20 border-violet-200 dark:border-violet-500/30'
                : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/5'}`}>
              <Cpu className={`w-3 h-3 ${hasCustomLlm ? 'text-violet-600 dark:text-violet-400' : 'text-gray-500'}`} />
              <span className={`text-[9px] font-mono font-semibold whitespace-nowrap 
                ${hasCustomLlm ? 'text-violet-700 dark:text-violet-300' : 'text-gray-600 dark:text-gray-300'}`}>
                {llmProvider ? `${llmProvider}/` : ''}{modelName}
              </span>
            </div>
            {temp !== undefined && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5">
                <Thermometer className="w-3 h-3 text-gray-500" />
                <span className="text-[9px] font-mono text-gray-600 dark:text-gray-300">{temp}</span>
              </div>
            )}
            {tokens !== undefined && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5">
                <Hash className="w-3 h-3 text-gray-500" />
                <span className="text-[9px] font-mono text-gray-600 dark:text-gray-300">{tokens}</span>
              </div>
            )}
          </div>
        )}

        {/* Tools Pills - Show individual tool names */}
        {displayTools.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-1 mb-1.5">
              <Wrench className="w-3 h-3 text-cyan-500" />
              <span className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tools</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {displayTools.map((tool, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-[9px] font-medium text-cyan-700 dark:text-cyan-300 truncate max-w-[100px]"
                  title={tool}
                >
                  {tool}
                </span>
              ))}
              {extraToolCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-[9px] font-medium text-gray-500">
                  +{extraToolCount}
                </span>
              )}
            </div>
          </div>
        )}

        {/* MCP Connections */}
        {displayMCPs.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center gap-1 mb-1.5">
              <Globe className="w-3 h-3 text-emerald-500" />
              <span className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">MCP</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {displayMCPs.map((mcp, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-[9px] font-medium text-emerald-700 dark:text-emerald-300 truncate max-w-[100px]"
                  title={mcp}
                >
                  {mcp}
                </span>
              ))}
              {extraMCPCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-[9px] font-medium text-gray-500">
                  +{extraMCPCount}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Empty state hint */}
        {displayTools.length === 0 && displayMCPs.length === 0 && type !== 'tool' && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5 text-center">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 italic">
              Right-click to add tools & MCPs
            </p>
          </div>
        )}
      </div>

      {/* Connection Ports with Active Glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-[#1a1d21] border-2 rounded-full transition-colors 
        ${isActive ? 'border-purple-500 shadow-[0_0_10px_purple]' : 'border-gray-400 dark:border-gray-600 group-hover:border-blue-500 dark:group-hover:border-white'}`} />

      {/* Bottom Port (Output/Add) - Only for Agents/Frontman */}
      {(type !== 'tool' && type !== 'sub-network') && (
        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-12 h-12 flex items-center justify-center group/port z-20`}>
          {/* Visual Dot */}
          <div className={`absolute w-3 h-3 bg-white dark:bg-[#1a1d21] border-2 rounded-full shadow-md transition-all duration-300
            ${isActive ? 'border-purple-500 shadow-[0_0_10px_purple]' : 'border-gray-900 dark:border-white dark:shadow-[0_0_10px_rgba(255,255,255,0.5)]'}
            ${isSelected ? 'border-blue-500 bg-blue-500 scale-110' : ''}
          `} />

          {/* Add Button - Accessible when node is selected OR hovered */}
          <button
            className={`
                  w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white
                  shadow-lg shadow-blue-600/40 transition-all duration-200 transform
                  hover:scale-125 active:scale-95 z-30
                  ${isSelected ? 'opacity-100 translate-y-6 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none group-hover/port:opacity-100 group-hover/port:translate-y-6 group-hover/port:pointer-events-auto'}
              `}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddChild && onAddChild(node.id, e);
            }}
            title="Add connected node"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};


/**
 * Menu to select which type of node to add
 */
const AddNodeMenu = ({ isOpen, position, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed z-50 bg-white dark:bg-[#1a1d21] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl p-1 animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-1 min-w-[140px]"
      style={{
        top: position.y,
        left: position.x
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 mb-1">
        Add Node
      </div>

      <button
        onClick={() => onSelect('agent')}
        className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-300 rounded text-left transition-colors"
      >
        <Bot className="w-3.5 h-3.5" />
        <span>Sub-Agent</span>
      </button>

      <button
        onClick={() => onSelect('tool')}
        className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-cyan-50 dark:hover:bg-cyan-500/20 hover:text-cyan-600 dark:hover:text-cyan-300 rounded text-left transition-colors"
      >
        <Wrench className="w-3.5 h-3.5" />
        <span>Coded Tool</span>
      </button>

      <button
        onClick={() => onSelect('sub-network')}
        className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-300 rounded text-left transition-colors"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>Sub-Network</span>
      </button>
    </div>
  );
};


const FlowCanvas = ({
  nodes: initialNodes = [],
  connections: initialConnections = [],
  onNodeClick,
  onMenuClick,
  selectedNodeId,
  agentConfigs = {},
  onToolsChange,
  activeAgents = new Set(),
  activeConnections = [],
  onAddNode, // Prop from parent
  isArrangeMode = false
}) => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [viewMode, setViewMode] = useState('classic'); // 'classic' | 'neural'

  // Context menu state
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    nodeId: null,
    nodeName: null
  });

  // Add Node Menu State
  const [addMenu, setAddMenu] = useState({
    isOpen: false,
    parentId: null,
    position: { x: 0, y: 0 }
  });

  // Handler to open the Add Menu
  const handleAddChildClick = (parentId, event) => {
    // Calculate position
    const x = event?.clientX || (window.innerWidth / 2);
    const y = event?.clientY || (window.innerHeight / 2);

    setAddMenu({
      isOpen: true,
      parentId,
      position: { x, y }
    });
  };

  // Handler for menu selection
  const handleNodeTypeSelect = (type) => {
    console.log('[FlowCanvas] handleNodeTypeSelect triggered:', type);
    console.log('[FlowCanvas] Current addMenu state:', addMenu);

    if (addMenu.parentId && onAddNode) {
      console.log('[FlowCanvas] Calling onAddNode with:', addMenu.parentId, type);
      onAddNode(addMenu.parentId, type);
    } else {
      console.error('[FlowCanvas] Missing parentId or onAddNode prop', { parentId: addMenu.parentId, hasOnAddNode: !!onAddNode });
    }
    setAddMenu({ isOpen: false, parentId: null, position: { x: 0, y: 0 } });
  };


  // Track added tools/MCPs per agent (local state for UI, should be lifted to parent for persistence)
  const [agentToolsMap, setAgentToolsMap] = useState({});
  const [agentMCPsMap, setAgentMCPsMap] = useState({});

  const containerRef = useRef(null);
  const dragRef = useRef({
    isDragging: false,
    mode: null, // 'node' or 'pan'
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    nodeId: null
  });

  // Apply Layout on Load
  useEffect(() => {
    if (initialNodes.length > 0) {
      const { nodes: layoutedNodes, edges } = getLayoutedElements(
        initialNodes,
        initialConnections,
        'TB' // Top-Bottom layout
      );
      setNodes(layoutedNodes);
      setConnections(edges);
    } else {
      setNodes([]);
      setConnections([]);
    }
  }, [initialNodes, initialConnections]);

  // Initial Auto-Fit
  useEffect(() => {
    if (nodes.length > 0 && containerRef.current) {
      setTimeout(fitToScreen, 50);
    }
  }, [nodes]);

  // Camera Controls
  const focusOnNode = useCallback((nodeId) => {
    if (!containerRef.current || !nodeId) return;
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const { clientWidth: containerW, clientHeight: containerH } = containerRef.current;
    const nodeCenterX = node.position.x + 140;
    const nodeCenterY = node.position.y + 100;
    const scale = 1.1;
    const x = (containerW / 2) - (nodeCenterX * scale);
    const y = (containerH / 2) - (nodeCenterY * scale);
    setViewTransform({ x, y, scale });
  }, [nodes]);

  useEffect(() => {
    if (selectedNodeId && !isArrangeMode) {
      focusOnNode(selectedNodeId);
    }
  }, [selectedNodeId, focusOnNode, isArrangeMode]);

  const handleBackgroundClick = (e) => {
    if (dragRef.current.wasDragging) return;
    if (onNodeClick) onNodeClick(e, null); // Deselect
    setAddMenu(prev => ({ ...prev, isOpen: false })); // Close add menu
    setContextMenu(prev => ({ ...prev, isOpen: false })); // Close context menu
    // fitToScreen(); // Don't fit on every click, it's annoying
  };

  const fitToScreen = useCallback(() => {
    if (!containerRef.current || nodes.length === 0) return;

    const padding = 100;
    const xs = nodes.map(n => n.position.x);
    const ys = nodes.map(n => n.position.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs) + 280;
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys) + 200;

    const contentW = maxX - minX;
    const contentH = maxY - minY;

    const { clientWidth: containerW, clientHeight: containerH } = containerRef.current;

    // Fit but scale gently
    const scaleX = (containerW - padding * 2) / contentW;
    const scaleY = (containerH - padding * 2) / contentH;
    let scale = Math.min(scaleX, scaleY, 1);

    const contentCenterX = minX + contentW / 2;
    const contentCenterY = minY + contentH / 2;

    const x = (containerW / 2) - (contentCenterX * scale);
    const y = (containerH / 2) - (contentCenterY * scale);

    setViewTransform({ x, y, scale });
  }, [nodes]);

  const handleMouseDown = (e, node = null) => {
    const isNode = !!node;
    if (isNode && !isArrangeMode) {
      e.stopPropagation(); // Stop pan dragging from starting when clicking a locked node
      return;
    }

    dragRef.current = {
      isDragging: true,
      mode: isNode ? 'node' : 'pan',
      startX: e.clientX,
      startY: e.clientY,
      nodeId: node?.id,
      initialNodeX: node ? (node.position?.x ?? node.x ?? 0) : 0,
      initialNodeY: node ? (node.position?.y ?? node.y ?? 0) : 0,
      initialPanX: viewTransform.x,
      initialPanY: viewTransform.y
    };

    if (isNode) {
      e.stopPropagation();
    }

    // Close menus on interaction
    setAddMenu(prev => ({ ...prev, isOpen: false }));
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  };

  /* Drag Optimization: Use ref to track animation frame */
  const rafRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!dragRef.current.isDragging) return;

    const { mode, startX, startY, initialNodeX, initialNodeY, initialPanX, initialPanY, nodeId } = dragRef.current;

    // Calculate raw delta
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      dragRef.current.moved = true;
    }

    // Cancel existing frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // Schedule update
    rafRef.current = requestAnimationFrame(() => {
      if (mode === 'node') {
        const scaledDx = dx / viewTransform.scale;
        const scaledDy = dy / viewTransform.scale;

        setNodes(prev => prev.map(n => {
          if (n.id === nodeId) {
            return { ...n, position: { x: initialNodeX + scaledDx, y: initialNodeY + scaledDy } };
          }
          return n;
        }));
      } else {
        setViewTransform(prev => ({
          ...prev,
          x: initialPanX + dx,
          y: initialPanY + dy
        }));
      }
    });

  }, [viewTransform.scale]); // Ensure dependency is correct

  const handleMouseUp = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const wasDragging = dragRef.current.moved;
    dragRef.current.isDragging = false;
    dragRef.current.wasDragging = wasDragging;
    dragRef.current.moved = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      const newScale = Math.min(Math.max(viewTransform.scale + delta, 0.1), 3);
      setViewTransform(prev => ({ ...prev, scale: newScale }));
    } else {
      setViewTransform(prev => ({
        ...prev,
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    const container = containerRef.current;
    if (container) container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (container) container.removeEventListener('wheel', handleWheel);
    };
  }, [handleMouseMove]);


  const renderConnections = () => {
    return connections.map((conn, i) => {
      const source = nodes.find(n => n.id === conn.source);
      const target = nodes.find(n => n.id === conn.target);
      if (!source || !target) return null;

      // Check if this connection is active
      const isActive = activeConnections.some(
        c => (c.source === conn.source && c.target === conn.target) ||
          (c.source === conn.target && c.target === conn.source) // Bidirectional check
      );

      const sX = source.position.x + 140;
      const sY = source.position.y + 160;
      const tX = target.position.x + 140;
      const tY = target.position.y;

      const c1x = sX;
      const c1y = sY + 80;
      const c2x = tX;
      const c2y = tY - 80;

      const d = `M ${sX} ${sY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tX} ${tY}`;
      const gradId = `grad-${i}`;

      return (
        <g key={i}>
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={isActive ? "#a855f7" : "#8b5cf6"} /> {/* Purple if active */}
              <stop offset="100%" stopColor={isActive ? "#06b6d4" : "#06b6d4"} />
            </linearGradient>
          </defs>

          {/* Base Path */}
          <path
            d={d}
            stroke={isActive ? "rgba(168, 85, 247, 0.4)" : "rgba(139, 92, 246, 0.4)"}
            strokeWidth={isActive ? "10" : "8"}
            fill="none"
            className={`transition-all duration-300 ${isActive ? "dark:opacity-100 opacity-80" : "dark:opacity-100 opacity-40"}`}
          />

          {/* Gradient Path */}
          <path
            d={d}
            stroke={`url(#${gradId})`}
            strokeWidth={isActive ? "3" : "2"}
            fill="none"
            className={`transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-80"}`}
          />

          {/* Active Data Particles - Show multiple if active */}
          {isActive && (
            <>
              {/* Main heavy particle */}
              <circle r="6" fill="#fff" filter="drop-shadow(0 0 4px #a855f7)">
                <animateMotion dur="1s" repeatCount="indefinite" path={d} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
              </circle>
              {/* Trailing particles */}
              <circle r="4" fill="#d8b4fe" opacity="0.7">
                <animateMotion dur="1s" begin="0.1s" repeatCount="indefinite" path={d} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
              </circle>
              <circle r="2" fill="#d8b4fe" opacity="0.5">
                <animateMotion dur="1s" begin="0.2s" repeatCount="indefinite" path={d} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
              </circle>
            </>
          )}

          <circle cx={tX} cy={tY} r="3" fill="#06b6d4" />
        </g>
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-gray-50 dark:bg-[#050506] overflow-hidden cursor-grab active:cursor-grabbing border-none transition-colors duration-200 text-gray-500/10 dark:text-white/5"
      onMouseDown={(e) => handleMouseDown(e)}
      onClick={(e) => {
        if (e.target === containerRef.current || e.target.tagName === 'svg') {
          handleBackgroundClick(e);
        }
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
                    linear-gradient(currentColor 1px, transparent 1px),
                    linear-gradient(90deg, currentColor 1px, transparent 1px)
                `,
          backgroundSize: '40px 40px',
          transform: `translate(${viewTransform.x % 40}px, ${viewTransform.y % 40}px) scale(${viewTransform.scale})`
        }}
      />

      <div
        className="absolute top-0 left-0 w-full h-full origin-top-left transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] will-change-transform"
        style={{ transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.scale})` }}
      >
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible z-0">
          {viewMode === 'neural' ? (
            /* Neural View Connections */
            connections.map((conn, i) => {
              const source = nodes.find(n => n.id === conn.source);
              const target = nodes.find(n => n.id === conn.target);
              if (!source || !target) return null;

              const isActive = activeConnections.some(
                c => (c.source === conn.source && c.target === conn.target) ||
                  (c.source === conn.target && c.target === conn.source)
              );

              // Calculate port positions (center bottom of source, center top of target)
              const sourcePos = {
                x: source.position.x + 120, // 240px / 2 for neural node
                y: source.position.y + 180 // approximate height
              };
              const targetPos = {
                x: target.position.x + 120,
                y: target.position.y
              };

              return (
                <SynapticConnection
                  key={i}
                  index={i}
                  sourcePos={sourcePos}
                  targetPos={targetPos}
                  isActive={isActive}
                />
              );
            })
          ) : (
            /* Classic View Connections */
            renderConnections()
          )}
        </svg>

        {viewMode === 'neural' ? (
          /* Neural View Nodes */
          nodes.map(node => (
            <NeuralAgentNode
              key={node.id}
              node={node}
              onMouseDown={handleMouseDown}
              isSelected={selectedNodeId === node.id}
              isActive={activeAgents.has(node.id)}
              onClick={(e) => onNodeClick && onNodeClick(e, node)}
              onMenuClick={onMenuClick}
              onContextMenu={(e, n) => {
                setContextMenu({
                  isOpen: true,
                  position: { x: e.clientX, y: e.clientY },
                  nodeId: n.id,
                  nodeName: n.data?.label || n.id
                });
              }}
              agentConfig={agentConfigs[node.id]}
              agentTools={agentToolsMap[node.id] || []}
              agentMCPs={agentMCPsMap[node.id] || []}
              onAddChild={handleAddChildClick} // Pass add child handler
              isArrangeMode={isArrangeMode}
            />
          ))
        ) : (
          /* Classic View Nodes */
          nodes.map(node => (
            <Node
              key={node.id}
              node={node}
              onMouseDown={handleMouseDown}
              isSelected={selectedNodeId === node.id}
              isActive={activeAgents.has(node.id)}
              onClick={(e) => onNodeClick && onNodeClick(e, node)}
              onMenuClick={onMenuClick}
              onContextMenu={(e, n) => {
                setContextMenu({
                  isOpen: true,
                  position: { x: e.clientX, y: e.clientY },
                  nodeId: n.id,
                  nodeName: n.data?.label || n.id
                });
              }}
              agentConfig={agentConfigs[node.id]}
              agentTools={agentToolsMap[node.id] || []}
              agentMCPs={agentMCPsMap[node.id] || []}
              onAddChild={handleAddChildClick}
              isArrangeMode={isArrangeMode}
            />
          ))
        )}
      </div>

      <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-white/80 dark:bg-[#1a1d21]/80 backdrop-blur border border-gray-200 dark:border-white/10 p-1.5 rounded-xl shadow-lg">
        {/* Zoom Slider */}
        <div className="flex items-center gap-2 px-2 border-r border-gray-200 dark:border-white/10">
          <span className="text-[10px] text-gray-400 font-medium">Zoom</span>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={viewTransform.scale}
            onChange={(e) => setViewTransform(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
            className="w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 dark:accent-blue-400"
          />
        </div>

        <button
          onClick={fitToScreen}
          className="text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white px-2 py-1 rounded-lg text-xs font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          Fit
        </button>
        <div className="text-gray-500 dark:text-white/50 px-2 text-xs tabular-nums font-mono min-w-[3rem] text-center">
          {Math.round(viewTransform.scale * 100)}%
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 pl-2 border-l border-gray-200 dark:border-white/10">
          <button
            onClick={() => setViewMode('classic')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all ${viewMode === 'classic'
              ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
          >
            <LayoutGrid className="w-3 h-3" />
            Classic
          </button>
          <button
            onClick={() => setViewMode('neural')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all ${viewMode === 'neural'
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
          >
            <Sparkles className="w-3 h-3" />
            Neural
          </button>
        </div>
      </div>

      {/* Add Node Menu */}
      <AddNodeMenu
        isOpen={addMenu.isOpen}
        position={addMenu.position}
        onClose={() => setAddMenu(prev => ({ ...prev, isOpen: false }))}
        onSelect={handleNodeTypeSelect}
      />

      {/* Agent Context Menu */}
      <AgentContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        agentId={contextMenu.nodeId}
        agentName={contextMenu.nodeName}
        currentTools={agentToolsMap[contextMenu.nodeId] || []}
        currentMCPs={agentMCPsMap[contextMenu.nodeId] || []}
        onClose={() => setContextMenu(prev => ({ ...prev, isOpen: false }))}
        onAddTool={(agentId, toolId) => {
          setAgentToolsMap(prev => ({
            ...prev,
            [agentId]: [...(prev[agentId] || []), toolId]
          }));
        }}
        onRemoveTool={(agentId, toolId) => {
          setAgentToolsMap(prev => ({
            ...prev,
            [agentId]: (prev[agentId] || []).filter(t => t !== toolId)
          }));
        }}
        onAddMCP={(agentId, mcpId) => {
          setAgentMCPsMap(prev => ({
            ...prev,
            [agentId]: [...(prev[agentId] || []), mcpId]
          }));
        }}
        onRemoveMCP={(agentId, mcpId) => {
          setAgentMCPsMap(prev => ({
            ...prev,
            [agentId]: (prev[agentId] || []).filter(m => m !== mcpId)
          }));
        }}
        onApply={(changes) => {
          onToolsChange?.(changes);
          console.log('[FlowCanvas] Tools/MCPs updated:', changes);
        }}
      />
    </div>
  );
};

export default FlowCanvas;
