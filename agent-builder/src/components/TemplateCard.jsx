import { ArrowRight } from 'lucide-react';

const TemplateCard = ({ template }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900 mb-1">{template.name}</h4>
          <p className="text-xs text-gray-600 mb-2">{template.description}</p>
          <div className="flex items-center space-x-2">
            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-semibold">
              {template.platform}
            </span>
            <span className="text-xs text-gray-500">{template.uses} uses</span>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
      </div>
    </div>
  );
};

export default TemplateCard;
