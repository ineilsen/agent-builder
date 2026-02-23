import { Shield, Lock, MessageSquare } from 'lucide-react';
import { footerLinks } from '../data/mockData';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="w-full px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-5 gap-8 mb-8">
          {/* Company Info */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <span className="text-blue-900 font-bold text-sm">UK</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold">UK Public Sector</h3>
                <p className="text-xs text-cyan-400">AI Marketplace</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Trusted AI solutions for UK Government departments. Secure, compliant, and responsible.
            </p>
            <div className="text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <span>Version 1.0.0</span>
                <span>•</span>
                <span>Last updated: Jan 2025</span>
              </div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Departments */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Departments</h4>
            <ul className="space-y-2">
              {footerLinks.departments.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 flex items-center justify-between">
          <p className="text-sm text-gray-400">© 2026 Crown Copyright. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors">
              <Shield className="w-4 h-4" />
              <span>Accessibility</span>
            </button>
            <button className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors">
              <Lock className="w-4 h-4" />
              <span>Security</span>
            </button>
            <button className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors">
              <MessageSquare className="w-4 h-4" />
              <span>Feedback</span>
            </button>
          </div>
        </div>
      </div>

      {/* Emergent Badge */}
      <div className="border-t border-gray-800">
        <div className="w-full px-6 py-4 flex justify-center">
          <a
            href="https://app.emergent.sh/?utm_source=emergent-badge"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-xs">Made with Emergent</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
