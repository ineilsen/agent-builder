import React from 'react';

/**
 * Cognizant Neuro AI Branded Logo Component
 * State-of-the-art animated logo with neural network visualization
 */
const NeuroAILogo = ({ size = 32, className = '' }) => {
    const iconSize = size;
    const strokeWidth = size > 24 ? 1.5 : 1.2;

    return (
        <div className={`relative ${className}`} style={{ width: iconSize, height: iconSize }}>
            {/* Animated background pulse */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg animate-pulse opacity-20" />

            {/* Main SVG Logo */}
            <svg
                width={iconSize}
                height={iconSize}
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-10"
            >
                {/* Neural Network Nodes */}
                <g className="animate-pulse" style={{ animationDuration: '3s' }}>
                    {/* Center node (brain core) */}
                    <circle cx="16" cy="16" r="4" fill="url(#gradient1)" opacity="0.9" />

                    {/* Surrounding nodes */}
                    <circle cx="8" cy="8" r="2.5" fill="url(#gradient2)" opacity="0.8" />
                    <circle cx="24" cy="8" r="2.5" fill="url(#gradient2)" opacity="0.8" />
                    <circle cx="8" cy="24" r="2.5" fill="url(#gradient2)" opacity="0.8" />
                    <circle cx="24" cy="24" r="2.5" fill="url(#gradient2)" opacity="0.8" />

                    {/* Mid nodes */}
                    <circle cx="16" cy="6" r="2" fill="url(#gradient3)" opacity="0.7" />
                    <circle cx="26" cy="16" r="2" fill="url(#gradient3)" opacity="0.7" />
                    <circle cx="16" cy="26" r="2" fill="url(#gradient3)" opacity="0.7" />
                    <circle cx="6" cy="16" r="2" fill="url(#gradient3)" opacity="0.7" />
                </g>

                {/* Neural connections (animated) */}
                <g className="neural-connections" opacity="0.6">
                    {/* From center to corners */}
                    <line x1="16" y1="16" x2="8" y2="8" stroke="url(#lineGradient)" strokeWidth={strokeWidth} strokeLinecap="round" className="animate-pulse" style={{ animationDelay: '0s', animationDuration: '2s' }} />
                    <line x1="16" y1="16" x2="24" y2="8" stroke="url(#lineGradient)" strokeWidth={strokeWidth} strokeLinecap="round" className="animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '2s' }} />
                    <line x1="16" y1="16" x2="8" y2="24" stroke="url(#lineGradient)" strokeWidth={strokeWidth} strokeLinecap="round" className="animate-pulse" style={{ animationDelay: '1s', animationDuration: '2s' }} />
                    <line x1="16" y1="16" x2="24" y2="24" stroke="url(#lineGradient)" strokeWidth={strokeWidth} strokeLinecap="round" className="animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '2s' }} />

                    {/* From center to mid points */}
                    <line x1="16" y1="16" x2="16" y2="6" stroke="url(#lineGradient)" strokeWidth={strokeWidth} strokeLinecap="round" opacity="0.5" />
                    <line x1="16" y1="16" x2="26" y2="16" stroke="url(#lineGradient)" strokeWidth={strokeWidth} strokeLinecap="round" opacity="0.5" />
                    <line x1="16" y1="16" x2="16" y2="26" stroke="url(#lineGradient)" strokeWidth={strokeWidth} strokeLinecap="round" opacity="0.5" />
                    <line x1="16" y1="16" x2="6" y2="16" stroke="url(#lineGradient)" strokeWidth={strokeWidth} strokeLinecap="round" opacity="0.5" />
                </g>

                {/* AI spark/energy particles */}
                <g className="energy-particles">
                    <circle cx="20" cy="12" r="0.8" fill="#fff" opacity="0.9" className="animate-ping" style={{ animationDuration: '1.5s' }} />
                    <circle cx="12" cy="20" r="0.8" fill="#fff" opacity="0.9" className="animate-ping" style={{ animationDuration: '1.8s', animationDelay: '0.3s' }} />
                    <circle cx="20" cy="20" r="0.8" fill="#fff" opacity="0.9" className="animate-ping" style={{ animationDuration: '2s', animationDelay: '0.6s' }} />
                </g>

                {/* Gradients */}
                <defs>
                    <radialGradient id="gradient1">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#3b82f6" />
                    </radialGradient>
                    <radialGradient id="gradient2">
                        <stop offset="0%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#60a5fa" />
                    </radialGradient>
                    <radialGradient id="gradient3">
                        <stop offset="0%" stopColor="#c4b5fd" />
                        <stop offset="100%" stopColor="#93c5fd" />
                    </radialGradient>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg blur-sm opacity-20 -z-10" />
        </div>
    );
};

/**
 * Simplified version for smaller contexts
 */
export const NeuroAILogoSimple = ({ size = 16, className = '' }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Simplified neural network */}
            <circle cx="16" cy="16" r="4" fill="url(#simpleGradient)" />
            <circle cx="8" cy="8" r="2" fill="url(#simpleGradient)" opacity="0.7" />
            <circle cx="24" cy="8" r="2" fill="url(#simpleGradient)" opacity="0.7" />
            <circle cx="8" cy="24" r="2" fill="url(#simpleGradient)" opacity="0.7" />
            <circle cx="24" cy="24" r="2" fill="url(#simpleGradient)" opacity="0.7" />

            <line x1="16" y1="16" x2="8" y2="8" stroke="url(#simpleLineGradient)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            <line x1="16" y1="16" x2="24" y2="8" stroke="url(#simpleLineGradient)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            <line x1="16" y1="16" x2="8" y2="24" stroke="url(#simpleLineGradient)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            <line x1="16" y1="16" x2="24" y2="24" stroke="url(#simpleLineGradient)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

            <defs>
                <radialGradient id="simpleGradient">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                </radialGradient>
                <linearGradient id="simpleLineGradient">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
                </linearGradient>
            </defs>
        </svg>
    );
};

/**
 * Branded header logo with text
 */
export const NeuroAIBrandedHeader = ({ showText = true, size = 'md' }) => {
    const logoSize = size === 'sm' ? 24 : size === 'md' ? 32 : 40;
    const textSize = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';

    return (
        <div className="flex items-center gap-3">
            <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 rounded-lg flex items-center justify-center shadow-xl relative overflow-hidden">
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer" />

                    <NeuroAILogoSimple size={20} className="text-white relative z-10" />
                </div>

                {/* Pulsing ring */}
                <div className="absolute inset-0 border-2 border-purple-400 rounded-lg animate-ping opacity-20" />
            </div>

            {showText && (
                <div className="flex flex-col">
                    <div className={`font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent ${textSize}`}>
                        Neuro AI
                    </div>
                    <div className="text-[8px] text-gray-500 dark:text-gray-400 font-medium tracking-wider uppercase">
                        Cognizant
                    </div>
                </div>
            )}
        </div>
    );
};

export default NeuroAILogo;
