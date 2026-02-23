import { ArrowRight, CheckCircle, TrendingUp, Users } from 'lucide-react';

const Hero = () => {
  return (
    <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-16">
      <div className="w-full px-6">
        <div className="grid grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            {/* Trust Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-800/50 px-4 py-2 rounded-full mb-6">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm">Trusted by UK Government Departments</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl font-bold mb-4 leading-tight">
              UK Public Sector
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                AI Marketplace
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg text-blue-100 mb-8 leading-relaxed">
              Discover, deploy, and manage trusted AI solutions designed specifically for UK government
              departments. Secure, compliant, and responsible by design.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4 mb-10">
              <button className="flex items-center space-x-2 bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                <span>Explore AI Apps</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-6 py-3 rounded-lg font-semibold border-2 border-white/30 hover:bg-white/10 transition-colors">
                Learn About Responsible AI
              </button>
            </div>

            {/* Compliance Badges */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm">GDS Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm">WCAG 2.1 AA</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm">UK AI Regulation</span>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            {/* Placeholder for AI Visualization */}
            <div className="bg-gradient-to-br from-orange-200 via-amber-100 to-pink-200 rounded-2xl aspect-square relative overflow-hidden">
              {/* Abstract pattern overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-300/30 to-transparent"></div>

              {/* Compliance Score Card */}
              <div className="absolute top-6 right-6 bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Compliance Score</p>
                    <p className="text-2xl font-bold text-gray-900">98.5%</p>
                  </div>
                </div>
              </div>

              {/* Active Deployments Card */}
              <div className="absolute bottom-6 left-6 bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Active Deployments</p>
                    <p className="text-2xl font-bold text-gray-900">1,247</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
