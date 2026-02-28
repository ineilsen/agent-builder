import { ArrowRight, ExternalLink } from 'lucide-react';
import config from '../config';

const CTA = () => (
    <section className="py-16 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="w-full px-6 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Department?</h2>
            <p className="text-xl text-blue-100 mb-8">
                Join over 50 government teams already using our AI solutions to improve efficiency and citizen services.
            </p>
            <div className="flex items-center justify-center space-x-4">
                <button className="flex items-center space-x-2 bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                    <span>Browse AI Catalogue</span>
                    <ArrowRight className="w-5 h-5" />
                </button>
                <button
                    onClick={() => window.open(config.AGENT_BUILDER_URL, '_blank', 'noopener,noreferrer')}
                    className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold border-2 border-white/30 hover:bg-white/10 transition-colors"
                >
                    <span>Build Custom Agent</span>
                    <ExternalLink className="w-4 h-4 opacity-80" />
                </button>
            </div>
        </div>
    </section>
);

export default CTA;
