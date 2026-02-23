import { useState } from 'react';
import { Building2, ChevronDown, Grid, List } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import SearchBar from '../components/SearchBar';
import FilterSidebar from '../components/FilterSidebar';
import AppCard from '../components/AppCard';
import { mhclgApps, filterConfig } from '../data/mhclgAppsData';

const MHCLGApps = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});
  const [viewMode, setViewMode] = useState('grid');

  const handleFilterChange = (filterGroupId, value, checked) => {
    setSelectedFilters(prev => {
      const groupFilters = prev[filterGroupId] || [];
      if (checked) {
        return { ...prev, [filterGroupId]: [...groupFilters, value] };
      } else {
        return { ...prev, [filterGroupId]: groupFilters.filter(v => v !== value) };
      }
    });
  };

  const filteredApps = mhclgApps.filter(app => {
    // Search filter
    if (searchTerm && !app.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !app.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Category filter
    if (selectedFilters.categories?.length > 0) {
      if (!selectedFilters.categories.includes(app.category.toLowerCase().replace(' ', '-'))) {
        return false;
      }
    }

    // AI Model filter
    if (selectedFilters.aiModel?.length > 0) {
      if (!selectedFilters.aiModel.includes(app.provider.toLowerCase())) {
        return false;
      }
    }

    // AI Score filter
    if (selectedFilters.aiScore?.length > 0) {
      const score = app.responsibleAIScore;
      const matchesFilter = selectedFilters.aiScore.some(filter => {
        if (filter === '90+') return score >= 90;
        if (filter === '80-89') return score >= 80 && score < 90;
        if (filter === '70-79') return score >= 70 && score < 80;
        return false;
      });
      if (!matchesFilter) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white py-12">
        <div className="w-full px-6">
          <Breadcrumb items={[{ label: 'Departments' }, { label: 'MHCLG' }]} />

          <div className="flex items-start space-x-6">
            <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-3">Ministry of Housing, Communities & Local Government</h1>
              <p className="text-lg text-cyan-50 mb-4">
                AI solutions for planning applications, housing allocation, local government operations, and community services.
                All apps are vetted for compliance with UK public sector standards.
              </p>
              <div className="flex items-center space-x-4">
                <span className="bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold">
                  8 Apps Available
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold">
                  GDS Compliant
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-6 py-8">
        <div className="grid grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="col-span-1">
            <FilterSidebar
              filters={filterConfig}
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Apps Grid */}
          <div className="col-span-3">
            {/* Search and Controls */}
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <SearchBar
                  placeholder="Search AI apps..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <div className="flex items-center space-x-2">
                  <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Relevance</option>
                    <option>Most Popular</option>
                    <option>Highest Rated</option>
                    <option>Newest</option>
                  </select>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600">Showing {filteredApps.length} of {mhclgApps.length} apps</p>
            </div>

            {/* Apps Grid */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-6' : 'space-y-4'}>
              {filteredApps.map(app => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>

            {filteredApps.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">No apps match your current filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MHCLGApps;
