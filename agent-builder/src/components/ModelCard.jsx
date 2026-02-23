import { Check } from 'lucide-react';

const ModelCard = ({ model, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-600 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-blue-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${model.iconBg} rounded-lg flex items-center justify-center`}>
            <model.icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{model.name}</p>
            <p className="text-xs text-gray-600">{model.provider}</p>
          </div>
        </div>
        {isSelected && <Check className="w-5 h-5 text-blue-600" />}
      </div>
    </div>
  );
};

export default ModelCard;
