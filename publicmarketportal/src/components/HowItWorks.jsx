import { Search, ClipboardCheck, Rocket } from 'lucide-react';
import { howItWorksSteps } from '../data/mockData';

const HowItWorks = () => {
  const icons = [Search, ClipboardCheck, Rocket];

  return (
    <section className="py-16 bg-gray-50">
      <div className="w-full px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
            How It Works
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Get Started in Minutes</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our streamlined process ensures you can deploy AI solutions quickly while maintaining full compliance.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-3 gap-8">
          {howItWorksSteps.map((step, index) => {
            const Icon = icons[index];
            return (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center transform rotate-3 hover:rotate-6 transition-transform">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -left-2 w-16 h-16 bg-blue-100 rounded-2xl -z-10"></div>
                  <span className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full border-4 border-blue-600 flex items-center justify-center text-xl font-bold text-blue-600">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
