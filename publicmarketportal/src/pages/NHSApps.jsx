import { useState } from 'react';
import { Activity, ChevronDown, Grid, List } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import SearchBar from '../components/SearchBar';
import FilterSidebar from '../components/FilterSidebar';
import AppCard from '../components/AppCard';
import { nhsApps, filterConfig } from '../data/nhsAppsData';

const NHSApps = () => {
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

    const filteredApps = nhsApps.filter(app => {
        // Search filter
        if (searchTerm && !app.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !app.description.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        // Category filter
        if (selectedFilters.categories?.length > 0) {
            // Simple slugify for matching
            const appCatSlug = app.category.toLowerCase().replace(/\s+/g, '-');
            if (!selectedFilters.categories.includes(appCatSlug)) {
                return false;
            }
        }

        // AI Model filter
        if (selectedFilters.aiModel?.length > 0) {
            // Match provider name slug (simple check)
            const providerSlug = app.provider.toLowerCase().replace(/\s+/g, '-');
            if (!selectedFilters.aiModel.includes(providerSlug)) {
                return false;
            }
        }

        // AI Score filter
        if (selectedFilters.aiScore?.length > 0) {
            const score = app.responsibleAIScore;
            const matchesFilter = selectedFilters.aiScore.some(filter => {
                if (filter === '95+') return score >= 95;
                if (filter === '90-94') return score >= 90 && score < 95;
                if (filter === '80-89') return score >= 80 && score < 89;
                return false;
            });
            if (!matchesFilter) return false;
        }

        return true;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white py-12">
                <div className="w-full px-6">
                    <Breadcrumb items={[{ label: 'Departments' }, { label: 'NHS England' }]} />

                    <div className="flex items-start space-x-6">
                        <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Activity className="w-10 h-10 text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold mb-3">NHS England</h1>
                            <p className="text-lg text-blue-50 mb-4">
                                Clinical and operational AI solutions for the National Health Service.
                                Focusing on patient care optimization, workforce management, and diagnostic support.
                            </p>
                            <div className="flex items-center space-x-4">
                                <span className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                                    {nhsApps.length} Apps Available
                                </span>
                                <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold">
                                    clinical Safety Certified
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
                                    placeholder="Search NHS apps..."
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
                            <p className="text-sm text-gray-600">Showing {filteredApps.length} of {nhsApps.length} apps</p>
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

export default NHSApps;
