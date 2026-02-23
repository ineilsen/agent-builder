import { Search, Bell, Settings, ChevronDown } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-blue-900 text-white py-4 px-6">
      <div className="w-full flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <span className="text-blue-900 font-bold text-sm">UK</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">UK Public Sector</h1>
              <p className="text-xs text-cyan-400">AI Marketplace</p>
            </div>
          </div>
          <span className="bg-cyan-500 text-white text-xs px-2 py-0.5 rounded font-semibold">
            BETA
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search AI apps, MCPs, or documentation..."
              className="w-full py-2 pl-10 pr-4 rounded-lg bg-blue-800 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-blue-800 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-blue-800 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 hover:bg-blue-800 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-sm font-semibold">
              JD
            </div>
            <span className="text-sm font-medium">Jane Doe</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
