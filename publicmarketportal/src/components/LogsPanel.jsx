import React, { useRef, useEffect } from 'react';
import { Terminal, Download } from 'lucide-react';

const LogsPanel = ({ logs = [], networkName = '' }) => {
    const logsEndRef = useRef(null);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const downloadLogs = () => {
        const logText = logs
            .map(log => `[${log.timestamp}] ${log.agent} (${log.source}): ${log.message}`)
            .join('\n');

        const blob = new Blob([logText], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${networkName || 'agent'}_logs.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const getSourceColor = (source) => {
        switch (source?.toLowerCase()) {
            case 'neurosan':
            case 'neuro-san':
                return 'text-yellow-400';
            case 'frontend':
                return 'text-blue-400';
            case 'backend':
                return 'text-green-400';
            default:
                return 'text-purple-400';
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-white">Agent Logs</span>
                </div>
                <button
                    onClick={downloadLogs}
                    disabled={logs.length === 0}
                    className="p-1 hover:bg-gray-800 rounded disabled:opacity-50 transition-colors"
                    title="Download Logs"
                >
                    <Download className="w-4 h-4 text-gray-400" />
                </button>
            </div>

            {/* Logs */}
            <div className="flex-grow overflow-y-auto p-3 font-mono text-xs custom-scrollbar">
                {logs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-600">
                        <p>No logs yet. Start a chat to see agent interactions.</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {logs.map((log, idx) => (
                            <div key={idx} className="leading-relaxed">
                                <span className="text-gray-600">[{log.timestamp}]</span>
                                <span className="text-green-400 ml-1">{log.agent}</span>
                                <span className={`ml-1 font-semibold ${getSourceColor(log.source)}`}>
                                    ({log.source})
                                </span>
                                <span className="text-gray-300 ml-1">: {log.message}</span>
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogsPanel;
