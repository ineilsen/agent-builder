const RiskMatrixGrid = ({ matrixData }) => {
  const impactLevels = ['Critical', 'High', 'Medium', 'Low'];
  const likelihoodLevels = ['Low', 'Medium', 'High'];

  const getCellColor = (count) => {
    if (count === 0) return 'bg-gray-100';
    if (count <= 2) return 'bg-yellow-200';
    if (count <= 5) return 'bg-orange-200';
    if (count <= 10) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const getCellData = (likelihood, impact) => {
    return matrixData.find(d => d.likelihood === likelihood && d.impact === impact) || { count: 0, systems: [] };
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Matrix</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 p-3 bg-gray-50 text-left text-sm font-semibold">
                Likelihood / Impact
              </th>
              {impactLevels.map(impact => (
                <th key={impact} className="border border-gray-300 p-3 bg-gray-50 text-center text-sm font-semibold">
                  {impact}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {likelihoodLevels.map(likelihood => (
              <tr key={likelihood}>
                <td className="border border-gray-300 p-3 bg-gray-50 font-semibold text-sm">
                  {likelihood}
                </td>
                {impactLevels.map(impact => {
                  const cellData = getCellData(likelihood, impact);
                  return (
                    <td
                      key={`${likelihood}-${impact}`}
                      className={`border border-gray-300 p-4 text-center ${getCellColor(cellData.count)} transition-colors hover:opacity-80 cursor-pointer`}
                      title={cellData.systems.join(', ')}
                    >
                      <div className="text-2xl font-bold text-gray-900">{cellData.count}</div>
                      {cellData.count > 0 && (
                        <div className="text-xs text-gray-700 mt-1">systems</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
          <span className="text-gray-600">None</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-200 border border-gray-300 rounded"></div>
          <span className="text-gray-600">Low (1-2)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-orange-200 border border-gray-300 rounded"></div>
          <span className="text-gray-600">Medium (3-5)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-orange-400 border border-gray-300 rounded"></div>
          <span className="text-gray-600">High (6-10)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-400 border border-gray-300 rounded"></div>
          <span className="text-gray-600">Critical (10+)</span>
        </div>
      </div>
    </div>
  );
};

export default RiskMatrixGrid;
