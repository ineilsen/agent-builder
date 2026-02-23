import React from 'react';

/**
 * SynapticConnection - Neural Flow connection visualization
 * 
 * Features:
 * - Idle: Ultra-thin breathing line with gradient fade
 * - Active: Plasma stream with wave-form animation and data packets
 * - Phosphorescent glow effects
 */
const SynapticConnection = ({
    sourcePos,
    targetPos,
    isActive = false,
    index = 0
}) => {
    // Calculate control points for smooth bezier curve
    const sX = sourcePos.x;
    const sY = sourcePos.y;
    const tX = targetPos.x;
    const tY = targetPos.y;

    // Dynamic control points for organic curve
    const distance = Math.abs(tY - sY);
    const curveStrength = Math.min(distance * 0.5, 100);

    const c1x = sX;
    const c1y = sY + curveStrength;
    const c2x = tX;
    const c2y = tY - curveStrength;

    const pathD = `M ${sX} ${sY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tX} ${tY}`;

    // Unique IDs for this connection's gradients and filters
    const gradientId = `synapse-grad-${index}`;
    const glowFilterId = `synapse-glow-${index}`;
    const plasmaGradientId = `plasma-grad-${index}`;

    return (
        <g className={`synapse-connection ${isActive ? 'active' : ''}`}>
            {/* Definitions for gradients and filters */}
            <defs>
                {/* Idle gradient with fade at ends */}
                <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={sX} y1={sY} x2={tX} y2={tY}>
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.1" />
                    <stop offset="20%" stopColor="#8B5CF6" stopOpacity="0.4" />
                    <stop offset="80%" stopColor="#06B6D4" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.1" />
                </linearGradient>

                {/* Active plasma gradient */}
                <linearGradient id={plasmaGradientId} gradientUnits="userSpaceOnUse" x1={sX} y1={sY} x2={tX} y2={tY}>
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="50%" stopColor="#818CF8" />
                    <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>

                {/* Glow filter */}
                <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {isActive ? (
                /* Active State: Plasma Stream */
                <>
                    {/* Phosphorescent background glow */}
                    <path
                        d={pathD}
                        fill="none"
                        stroke="#A855F7"
                        strokeWidth="16"
                        strokeLinecap="round"
                        opacity="0.1"
                        style={{ filter: 'blur(8px)' }}
                    />

                    {/* Main plasma path */}
                    <path
                        d={pathD}
                        fill="none"
                        stroke={`url(#${plasmaGradientId})`}
                        strokeWidth="3"
                        strokeLinecap="round"
                        filter={`url(#${glowFilterId})`}
                    />

                    {/* Plasma wave overlays - animated via CSS */}
                    <path
                        d={pathD}
                        fill="none"
                        stroke="#A855F7"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="8 16"
                        opacity="0.6"
                    >
                        <animate
                            attributeName="stroke-dashoffset"
                            values="0;-48"
                            dur="0.8s"
                            repeatCount="indefinite"
                        />
                    </path>

                    <path
                        d={pathD}
                        fill="none"
                        stroke="#818CF8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeDasharray="4 20"
                        opacity="0.4"
                    >
                        <animate
                            attributeName="stroke-dashoffset"
                            values="0;-48"
                            dur="1.2s"
                            repeatCount="indefinite"
                        />
                    </path>

                    {/* Data packets - Main */}
                    <circle r="7" fill="#fff" filter={`url(#${glowFilterId})`}>
                        <animateMotion
                            dur="1.2s"
                            repeatCount="indefinite"
                            path={pathD}
                            keyPoints="0;1"
                            keyTimes="0;1"
                            calcMode="spline"
                            keySplines="0.4 0 0.2 1"
                        />
                    </circle>

                    {/* Data packets - Trailing */}
                    <circle r="5" fill="#D8B4FE" opacity="0.7">
                        <animateMotion
                            dur="1.2s"
                            repeatCount="indefinite"
                            path={pathD}
                            keyPoints="0;1"
                            keyTimes="0;1"
                            calcMode="spline"
                            keySplines="0.4 0 0.2 1"
                            begin="0.08s"
                        />
                    </circle>

                    <circle r="3" fill="#C4B5FD" opacity="0.5">
                        <animateMotion
                            dur="1.2s"
                            repeatCount="indefinite"
                            path={pathD}
                            keyPoints="0;1"
                            keyTimes="0;1"
                            calcMode="spline"
                            keySplines="0.4 0 0.2 1"
                            begin="0.16s"
                        />
                    </circle>

                    <circle r="2" fill="#A78BFA" opacity="0.3">
                        <animateMotion
                            dur="1.2s"
                            repeatCount="indefinite"
                            path={pathD}
                            keyPoints="0;1"
                            keyTimes="0;1"
                            calcMode="spline"
                            keySplines="0.4 0 0.2 1"
                            begin="0.24s"
                        />
                    </circle>

                    {/* Source spark effect */}
                    <g transform={`translate(${sX}, ${sY})`}>
                        <circle r="4" fill="#A855F7" opacity="0.8">
                            <animate
                                attributeName="r"
                                values="4;8;4"
                                dur="1s"
                                repeatCount="indefinite"
                            />
                            <animate
                                attributeName="opacity"
                                values="0.8;0.3;0.8"
                                dur="1s"
                                repeatCount="indefinite"
                            />
                        </circle>
                    </g>

                    {/* Target spark effect */}
                    <g transform={`translate(${tX}, ${tY})`}>
                        <circle r="4" fill="#06B6D4" opacity="0.8">
                            <animate
                                attributeName="r"
                                values="4;8;4"
                                dur="1s"
                                repeatCount="indefinite"
                                begin="0.5s"
                            />
                            <animate
                                attributeName="opacity"
                                values="0.8;0.3;0.8"
                                dur="1s"
                                repeatCount="indefinite"
                                begin="0.5s"
                            />
                        </circle>
                    </g>
                </>
            ) : (
                /* Idle State: Subtle breathing line */
                <>
                    {/* Soft glow background */}
                    <path
                        d={pathD}
                        fill="none"
                        stroke="#8B5CF6"
                        strokeWidth="6"
                        strokeLinecap="round"
                        opacity="0.05"
                        className="dark:opacity-[0.08]"
                    />

                    {/* Main idle line with breathing animation */}
                    <path
                        d={pathD}
                        fill="none"
                        stroke={`url(#${gradientId})`}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    >
                        <animate
                            attributeName="stroke-width"
                            values="1.5;2;1.5"
                            dur="4s"
                            repeatCount="indefinite"
                        />
                        <animate
                            attributeName="opacity"
                            values="0.4;0.7;0.4"
                            dur="4s"
                            repeatCount="indefinite"
                        />
                    </path>

                    {/* End point indicators */}
                    <circle cx={sX} cy={sY} r="3" fill="#8B5CF6" opacity="0.4" />
                    <circle cx={tX} cy={tY} r="3" fill="#06B6D4" opacity="0.4" />
                </>
            )}
        </g>
    );
};

export default SynapticConnection;
