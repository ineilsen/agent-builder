import { Building2, ArrowRight } from 'lucide-react';
import { departments } from '../data/mockData';

const DepartmentGrid = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="w-full px-6">
        {/* Section Header */}
        <div className="mb-12">
          <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
            Department Hub
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore by Department</h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Each department has curated AI solutions tailored to their specific needs and compliance requirements.
          </p>
        </div>

        {/* Department Cards Grid */}
        <div className="grid grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              onClick={() => {
                if (dept.externalUrl) {
                  window.open(dept.externalUrl, '_blank', 'noopener,noreferrer');
                }
              }}
              className={`${dept.bgColor} border ${dept.borderColor} rounded-xl p-6 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer`}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${dept.iconBg} rounded-lg flex items-center justify-center`}>
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <span className="bg-white px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
                    {dept.appCount} {dept.appCount === 1 ? 'App' : 'Apps'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{dept.name}</h3>
                  <p className="text-sm text-gray-700 mb-4">{dept.description}</p>
                </div>
                <button className="flex items-center space-x-2 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors mt-auto">
                  <span>{dept.externalUrl ? 'Launch Demo' : 'Explore Apps'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DepartmentGrid;
