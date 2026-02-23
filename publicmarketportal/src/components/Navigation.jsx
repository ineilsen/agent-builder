import { Home, Building2, Shield, Wrench, Store, Activity } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Navigation = () => {
  const tabs = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'NHS Apps', icon: Activity, path: '/nhs-apps' },
    { name: 'MHCLG Apps', icon: Building2, path: '/mhclg-apps' },
    { name: 'Responsible AI', icon: Shield, path: '/responsible-ai' },
    { name: 'Agent Builder', icon: Wrench, path: '/agent-builder' },
    { name: 'MCP Marketplace', icon: Store, path: '/mcp-marketplace' }
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="w-full px-6">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <NavLink
              key={tab.name}
              to={tab.path}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-4 border-b-2 transition-colors ${isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`
              }
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{tab.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
