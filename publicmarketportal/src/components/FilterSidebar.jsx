import { Filter } from 'lucide-react';

const FilterSidebar = ({ filters, selectedFilters, onFilterChange }) => {
  return (
    <aside className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Filter className="w-5 h-5 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
      </div>

      <div className="space-y-6">
        {filters.map((filterGroup) => (
          <div key={filterGroup.id}>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              {filterGroup.icon && <filterGroup.icon className="w-4 h-4" />}
              <span>{filterGroup.label}</span>
            </h4>
            <div className="space-y-2">
              {filterGroup.options.map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedFilters[filterGroup.id]?.includes(option.value) || false}
                    onChange={(e) => onFilterChange(filterGroup.id, option.value, e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                    {option.label}
                  </span>
                  {option.count !== undefined && (
                    <span className="text-xs text-gray-500">({option.count})</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default FilterSidebar;
