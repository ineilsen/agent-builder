import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import MHCLGApps from './pages/MHCLGApps';
import NHSApps from './pages/NHSApps';
import JMLOrchestration from './pages/apps/JMLOrchestration';
import ResponsibleAI from './pages/ResponsibleAI';
import AgentBuilder from './pages/AgentBuilder';
import MCPMarketplace from './pages/MCPMarketplace';

// Standard layout with footer
const StandardLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Header />
    <Navigation />
    <main>{children}</main>
    <Footer />
  </div>
);

// App-like layout (header + nav, no footer, full height content)
const AppLayout = ({ children }) => (
  <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
    <Header />
    <Navigation />
    <div className="flex-1 overflow-hidden">{children}</div>
  </div>
);

const AppContent = () => {
  const location = useLocation();

  // Agent Builder uses app-like layout (with header, no footer)
  if (location.pathname === '/agent-builder') {
    return (
      <AppLayout>
        <AgentBuilder />
      </AppLayout>
    );
  }

  // All other routes use standard layout
  return (
    <StandardLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nhs-apps" element={<NHSApps />} />
        <Route path="/apps/jml-orchestration" element={<JMLOrchestration />} />
        <Route path="/mhclg-apps" element={<MHCLGApps />} />
        <Route path="/responsible-ai" element={<ResponsibleAI />} />
        <Route path="/mcp-marketplace" element={<MCPMarketplace />} />
      </Routes>
    </StandardLayout>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
