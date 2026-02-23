import { Download, Star, Info, ArrowRight, Shield, CheckCircle } from 'lucide-react';

const MCPCard = ({ mcp }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 ${mcp.iconBg} rounded-lg flex items-center justify-center`}>
            <mcp.icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{mcp.name}</h3>
            <p className="text-sm text-gray-600">{mcp.organization}</p>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {mcp.govApproved && (
          <span className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
            <CheckCircle className="w-3 h-3" />
            <span>Gov Approved</span>
          </span>
        )}
        {mcp.securityTested && (
          <span className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
            <Shield className="w-3 h-3" />
            <span>Security Tested</span>
          </span>
        )}
        {mcp.openSource && (
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">
            Open Source
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 mb-4">{mcp.description}</p>

      {/* Compatible Models */}
      <div className="mb-4">
        <p className="text-xs text-gray-600 mb-2">Compatible with:</p>
        <div className="flex flex-wrap gap-2">
          {mcp.compatibleModels.map((model, index) => (
            <span key={index} className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">
              {model}
            </span>
          ))}
        </div>
      </div>

      {/* Stats and Category */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Download className="w-4 h-4" />
            <span>{mcp.downloads}</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span>{mcp.rating}</span>
          </div>
        </div>
        <span className="text-xs font-semibold text-blue-600">{mcp.category}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        <button className="flex-1 flex items-center justify-center space-x-2 border-2 border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
          <Info className="w-4 h-4" />
          <span>Learn More</span>
        </button>
        <button className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          <span>Install</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MCPCard;
