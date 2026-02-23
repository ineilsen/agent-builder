import { useState } from 'react';
import { Shield, CheckCircle, Workflow, Search, Book, Code, FileCode } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import SearchBar from '../components/SearchBar';
import MCPCard from '../components/MCPCard';
import StepGuide from '../components/StepGuide';
import { mcpData, integrationSteps } from '../data/mcpData';

const MCPMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All MCPs', icon: Workflow },
    { id: 'data-connectors', label: 'Data Connectors', icon: Workflow },
    { id: 'security-compliance', label: 'Security & Compliance', icon: Shield },
    { id: 'workflow-integrations', label: 'Workflow Integrations', icon: Workflow },
    { id: 'custom-protocols', label: 'Custom Protocols', icon: Code }
  ];

  const filteredMCPs = mcpData.filter(mcp => {
    // Search filter
    if (searchTerm && !mcp.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !mcp.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Category filter
    if (activeCategory !== 'all') {
      const categoryMap = {
        'data-connectors': 'Data Connectors',
        'security-compliance': 'Security & Compliance',
        'workflow-integrations': 'Workflow Integrations',
        'custom-protocols': 'Custom Protocols'
      };
      if (mcp.category !== categoryMap[activeCategory]) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-blue-700 text-white py-12">
        <div className="w-full px-6">
          <Breadcrumb items={[{ label: 'MCP Marketplace' }]} />

          <div className="grid grid-cols-2 gap-8 items-start">
            <div>
              <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold mb-4 inline-block">
                Model Context Protocol
              </span>
              <h1 className="text-4xl font-bold mb-4">MCP Marketplace</h1>
              <p className="text-lg text-blue-50 mb-6">
                Extend your AI agents with secure, government-approved integrations. Connect to data sources,
                add compliance tools, and build custom protocols.
              </p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm">Security Tested</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">Gov Approved</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Workflow className="w-5 h-5" />
                  <span className="text-sm">Open Standards</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-3xl font-bold mb-1">9+</p>
                <p className="text-sm text-blue-100">Available MCPs</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-3xl font-bold mb-1">15K+</p>
                <p className="text-sm text-blue-100">Total Installs</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-3xl font-bold mb-1">4.7</p>
                <p className="text-sm text-blue-100">Average Rating</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-3xl font-bold mb-1">5</p>
                <p className="text-sm text-blue-100">Departments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-6 py-8">
        {/* Search */}
        <div className="mb-6">
          <SearchBar
            placeholder="Search MCPs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-2 mb-8 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${activeCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              <category.icon className="w-4 h-4" />
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        {/* MCP Grid */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {filteredMCPs.map(mcp => (
            <MCPCard key={mcp.id} mcp={mcp} />
          ))}
        </div>

        {filteredMCPs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No MCPs match your current search.</p>
          </div>
        )}

        {/* Integration Guide */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Book className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Integration Guide</h2>
          </div>
          <p className="text-gray-600 mb-6">Get started with MCP integrations in four simple steps</p>
          <StepGuide steps={integrationSteps} />
        </div>

        {/* Resource Cards */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileCode className="w-6 h-6 text-white" />
              </div>
              <button className="text-blue-600 font-semibold hover:text-blue-700">
                View Docs →
              </button>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">API Documentation</h3>
            <p className="text-sm text-gray-700">Comprehensive API reference for all MCP protocols</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <button className="text-purple-600 font-semibold hover:text-purple-700">
                Get SDKs →
              </button>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">SDK Downloads</h3>
            <p className="text-sm text-gray-700">Official SDKs for Python, Node.js, and .NET</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <FileCode className="w-6 h-6 text-white" />
              </div>
              <button className="text-green-600 font-semibold hover:text-green-700">
                Browse Examples →
              </button>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Sample Code</h3>
            <p className="text-sm text-gray-700">Ready-to-use code examples for common use cases</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCPMarketplace;
