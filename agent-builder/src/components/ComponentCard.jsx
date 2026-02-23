import { Layers, Box } from 'lucide-react';

const ComponentCard = ({ component }) => {
  return (
    <div className="bg-white dark:bg-[#1a1c20] border border-gray-200 dark:border-white/5 rounded-md p-2 hover:bg-gray-50 dark:hover:bg-white/5 hover:border-blue-500/30 transition-all cursor-pointer group flex items-center gap-2">
      <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/10`}>
        <component.icon className={`w-3 h-3 ${component.iconColor || 'text-gray-500 dark:text-gray-400'} group-hover:text-blue-600 dark:group-hover:text-blue-400`} />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-[11px] font-semibold text-gray-900 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">{component.name}</h4>
        <p className="text-[9px] text-gray-500 truncate">{component.description}</p>
      </div>
    </div>
  );
};

export default ComponentCard;
