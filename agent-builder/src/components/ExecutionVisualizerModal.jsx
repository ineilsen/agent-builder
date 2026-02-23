
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    X, Check, AlertCircle, Play, Pause, ChevronRight, ChevronDown,
    Bot, Wrench, Brain, Activity, ArrowRight, Zap, Code, Terminal, FileText,
    Clock, Layers, Users
} from 'lucide-react';

const ExecutionVisualizerModal = ({ isOpen, onClose, executionData }) => {
    const [steps, setSteps] = useState([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms per step
    const [expandedSteps, setExpandedSteps] = useState(new Set());

    const scrollContainerRef = useRef(null);
    const stepRefs = useRef({});
    const animationRef = useRef(null);

    // Filter Logic & Stats
    const { filteredSteps, stats } = useMemo(() => {
        if (!executionData?.steps) return { filteredSteps: [], stats: { duration: 0, count: 0, agents: 0 } };

        // Filter out noise (metrics, thoughts)
        const visible = executionData.steps.filter(s =>
            !['metric', 'thought'].includes(s.type)
        );

        // Calculate Stats
        const startTime = executionData.steps[0]?.timestamp || Date.now();
        const endTime = executionData.steps[executionData.steps.length - 1]?.timestamp || Date.now();
        const durationMs = endTime - startTime;

        const uniqueAgents = new Set(visible.map(s => s.agent)).size;

        return {
            filteredSteps: visible,
            stats: {
                duration: durationMs > 1000 ? `${(durationMs / 1000).toFixed(2)}s` : `${durationMs}ms`,
                count: visible.length,
                agents: uniqueAgents
            }
        };
    }, [executionData]);

    // Initialize Steps from Execution Data
    useEffect(() => {
        if (isOpen && filteredSteps.length > 0) {
            setSteps(filteredSteps);
            setCurrentStepIndex(-1);
            setExpandedSteps(new Set()); // Reset toggle state

            // Auto-start animation after brief delay
            setTimeout(() => {
                setIsPlaying(true);
            }, 500);
        } else {
            setIsPlaying(false);
            setCurrentStepIndex(-1);
        }
    }, [isOpen, filteredSteps]);

    // Animation Loop
    useEffect(() => {
        if (isPlaying) {
            animationRef.current = setInterval(() => {
                setCurrentStepIndex(prev => {
                    const next = prev + 1;
                    if (next >= steps.length) {
                        setIsPlaying(false);
                        return steps.length - 1; // Stay at end
                    }
                    scrollToStep(next);
                    return next;
                });
            }, playbackSpeed);
        } else {
            clearInterval(animationRef.current);
        }

        return () => clearInterval(animationRef.current);
    }, [isPlaying, steps.length, playbackSpeed]);

    // Auto-scroll helper
    const scrollToStep = (index) => {
        if (stepRefs.current[index] && scrollContainerRef.current) {
            stepRefs.current[index].scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    };

    const toggleStepExpand = (id) => {
        setExpandedSteps(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    if (!isOpen || !executionData) return null;

    // --- Render Helpers ---

    const getStepIcon = (type) => {
        switch (type) {
            case 'trigger': return <Zap className="w-5 h-5 text-yellow-500" />;
            case 'delegation': return <ArrowRight className="w-5 h-5 text-blue-500" />;
            case 'tool': return <Wrench className="w-5 h-5 text-cyan-500" />;
            case 'thought': return <Brain className="w-5 h-5 text-purple-500" />;
            case 'metric': return <Activity className="w-5 h-5 text-green-500" />;
            case 'finish': return <Check className="w-5 h-5 text-green-600" />;
            case 'error': return <AlertCircle className="w-5 h-5 text-red-600" />;
            case 'response': return <Terminal className="w-5 h-5 text-indigo-500" />;
            default: return <Bot className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status, isActive) => {
        if (isActive) return 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-50/50 dark:bg-blue-900/20';
        if (status === 'error') return 'border-red-500 bg-red-50/50 dark:bg-red-900/10';
        if (status === 'warning') return 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/10';
        return 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-white dark:bg-[#1a1b1e]';
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#111214] w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-white/10 ring-1 ring-black/5">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-white dark:bg-[#111214] z-10">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/10">
                                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                                    Execution Flow
                                </h2>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-mono">
                                    <span className="bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded">ID: {executionData.id.slice(-6)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Divider */}
                        <div className="h-8 w-px bg-gray-200 dark:bg-white/10 hidden sm:block" />

                        {/* Execution Stats */}
                        <div className="hidden sm:flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Duration</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">{stats.duration}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Steps</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">{stats.count}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Agents</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">{stats.agents}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/5">
                            <button
                                onClick={() => {
                                    if (currentStepIndex >= steps.length - 1) setCurrentStepIndex(-1);
                                    setIsPlaying(!isPlaying);
                                }}
                                className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                {isPlaying ? (
                                    <>
                                        <Pause className="w-3.5 h-3.5 fill-current" />
                                        <span>Pause</span>
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-3.5 h-3.5 fill-current" />
                                        <span>{currentStepIndex >= steps.length - 1 ? 'Replay' : 'Play'}</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-2" />

                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Timeline Content */}
                <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar bg-gray-50/50 dark:bg-[#0a0b0d] scroll-smooth"
                >
                    <div className="max-w-3xl mx-auto relative pb-12">
                        {/* Continuous Vertical Line */}
                        <div className="absolute left-8 top-4 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 via-gray-200 to-transparent dark:from-white/10 dark:via-white/5" />

                        {/* Active Progress Line */}
                        <div
                            className="absolute left-8 top-4 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                            style={{
                                height: `${Math.max(0, (currentStepIndex + 1) / steps.length * 100)}%`,
                                opacity: isPlaying || currentStepIndex > 0 ? 1 : 0
                            }}
                        />

                        {steps.length === 0 ? (
                            <div className="text-center py-20 text-gray-400 italic">
                                No visible steps to display.
                            </div>
                        ) : (
                            steps.map((step, idx) => {
                                const isActive = idx === currentStepIndex;
                                const isPast = idx < currentStepIndex;
                                const isExpanded = expandedSteps.has(step.id);
                                const hasDetails = step.details && Object.keys(step.details).length > 0;

                                return (
                                    <div
                                        key={step.id}
                                        ref={el => stepRefs.current[idx] = el}
                                        className={`relative pl-20 group mb-6 last:mb-0 transition-opacity duration-300 ${isPast || isActive ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
                                    >
                                        {/* Timeline Marker */}
                                        <div className={`absolute left-0 top-0 w-16 flex justify-end pr-4 pt-1 transition-all duration-300`}>
                                            <span className={`text-[10px] font-mono font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                                                {new Date(step.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 }).split(' ')[0]}
                                            </span>
                                        </div>

                                        {/* Node Icon Circle */}
                                        <div
                                            className={`absolute left-[26px] top-0 w-8 h-8 -ml-3 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 ease-out bg-white dark:bg-[#111214]
                                                ${isActive
                                                    ? 'border-blue-500 scale-110 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                                                    : isPast ? 'border-gray-300 dark:border-white/20' : 'border-gray-200 dark:border-white/10'
                                                }
                                            `}
                                        >
                                            {getStepIcon(step.type)}
                                        </div>

                                        {/* Content Card */}
                                        <div
                                            onClick={() => {
                                                setCurrentStepIndex(idx);
                                                setIsPlaying(false);
                                                if (hasDetails) toggleStepExpand(step.id);
                                            }}
                                            className={`
                                                relative rounded-xl border p-4 transition-all duration-300 cursor-pointer
                                                ${getStatusColor(step.status, isActive)}
                                                ${isActive ? 'shadow-lg translate-x-1' : 'shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-white/20'}
                                            `}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded
                                                            ${step.type === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300'}
                                                        `}>
                                                            {step.type}
                                                        </span>
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                            {step.agent}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                                        {step.description}
                                                    </p>
                                                </div>

                                                {hasDetails && (
                                                    <div className={`mt-1 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Expandable Details */}
                                            <div
                                                className={`grid transition-[grid-template-rows] duration-300 ease-out ${isExpanded || isActive ? 'grid-rows-[1fr] mt-3' : 'grid-rows-[0fr]'}`}
                                            >
                                                <div className="overflow-hidden">
                                                    <div className="pt-3 border-t border-gray-100 dark:border-white/5">
                                                        {step.type === 'tool' && step.details.arguments && (
                                                            <div className="mb-2">
                                                                <div className="text-[10px] uppercase text-gray-400 font-bold mb-1">Arguments</div>
                                                                <div className="bg-gray-50 dark:bg-black/30 rounded p-2 border border-gray-100 dark:border-white/5 font-mono text-xs text-blue-600 dark:text-blue-400 break-all">
                                                                    {JSON.stringify(step.details.arguments)}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {step.details.text && (
                                                            <div className="mb-2">
                                                                <div className="text-[10px] uppercase text-gray-400 font-bold mb-1">Content</div>
                                                                <div className="text-xs text-gray-600 dark:text-gray-400 italic">
                                                                    "{step.details.text.slice(0, 300)}{step.details.text.length > 300 ? '...' : ''}"
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="bg-gray-50 dark:bg-black/20 rounded-lg p-3 border border-gray-100 dark:border-white/5">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                                                    <FileText className="w-3 h-3" /> Raw Payload
                                                                </span>
                                                            </div>
                                                            <pre className="text-[10px] font-mono text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap max-h-40 custom-scrollbar">
                                                                {JSON.stringify(step.details, null, 2)}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        {/* End Marker */}
                        <div className="pl-20 pt-2 opacity-50">
                            <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-white/20 ml-[5px]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ExecutionVisualizerModal;
