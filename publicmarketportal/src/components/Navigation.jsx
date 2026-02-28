import { Home, Building2, Shield, Wrench, Store, Activity, ExternalLink } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import config from '../config';

const internalTabs = [
    { name: 'Home',           icon: Home,       path: '/' },
    { name: 'NHS Apps',       icon: Activity,   path: '/nhs-apps' },
    { name: 'MHCLG Apps',     icon: Building2,  path: '/mhclg-apps' },
    { name: 'Responsible AI', icon: Shield,     path: '/responsible-ai' },
    { name: 'MCP Marketplace',icon: Store,      path: '/mcp-marketplace' },
];

const tabClass = (isActive) =>
    `flex items-center space-x-2 px-4 py-4 border-b-2 transition-colors ${
        isActive
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
    }`;

const Navigation = () => (
    <nav className="bg-white border-b border-gray-200">
        <div className="w-full px-6">
            <div className="flex space-x-8">
                {internalTabs.map((tab) => (
                    <NavLink
                        key={tab.name}
                        to={tab.path}
                        className={({ isActive }) => tabClass(isActive)}
                    >
                        <tab.icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{tab.name}</span>
                    </NavLink>
                ))}

                {/* Agent Builder — opens the standalone app in a new tab */}
                <button
                    onClick={() => window.open(config.AGENT_BUILDER_URL, '_blank', 'noopener,noreferrer')}
                    className={tabClass(false)}
                >
                    <Wrench className="w-5 h-5" />
                    <span className="text-sm font-medium">Agent Builder</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                </button>
            </div>
        </div>
    </nav>
);

export default Navigation;
