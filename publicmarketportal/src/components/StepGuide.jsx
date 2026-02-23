const StepGuide = ({ steps }) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {steps.map((step, index) => (
        <div key={index} className="text-center">
          <div className="bg-blue-100 rounded-lg p-4 mb-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
              {step.number}
            </div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">{step.title}</h4>
          </div>
          <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 block">
            {step.code}
          </code>
        </div>
      ))}
    </div>
  );
};

export default StepGuide;
