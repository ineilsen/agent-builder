import { Download, ExternalLink, Clock, FileText } from 'lucide-react';

const ResourceCard = ({ resource }) => {
  const typeColors = {
    'PDF': 'bg-red-100 text-red-700',
    'Video': 'bg-purple-100 text-purple-700',
    'Article': 'bg-blue-100 text-blue-700',
    'Tool': 'bg-green-100 text-green-700'
  };

  return (
    <div className={`bg-white border-2 rounded-xl p-6 hover:shadow-xl transition-all ${
      resource.featured ? 'border-blue-500' : 'border-gray-200'
    }`}>
      {resource.featured && (
        <span className="inline-block bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold mb-3">
          Featured
        </span>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${typeColors[resource.type].replace('text-', 'bg-').replace('-700', '-500')} rounded-lg flex items-center justify-center`}>
          <resource.icon className="w-6 h-6 text-white" />
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeColors[resource.type]}`}>
          {resource.type}
        </span>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2">{resource.title}</h3>
      <p className="text-sm text-gray-600 mb-4">{resource.description}</p>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        {resource.size && (
          <div className="flex items-center space-x-1">
            <FileText className="w-3 h-3" />
            <span>{resource.size}</span>
          </div>
        )}
        {resource.duration && (
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{resource.duration}</span>
          </div>
        )}
        {resource.readTime && (
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{resource.readTime} read</span>
          </div>
        )}
        <span>{resource.downloads} downloads</span>
      </div>

      <div className="flex items-center space-x-2">
        <button className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>
        <button className="px-3 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <ExternalLink className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Updated: {resource.lastUpdated}
      </div>
    </div>
  );
};

export default ResourceCard;
