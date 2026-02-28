import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AgentBuilder from './pages/AgentBuilder';
import AgentBuilderV2 from './pages/AgentBuilderV2';

function App() {
    return (
        <Router>
            <div className="h-screen w-screen overflow-hidden bg-gray-50">
                <Routes>
                    <Route path="/studio" element={<AgentBuilder />} />
                    <Route path="/builder" element={<AgentBuilderV2 />} />
                    <Route path="/" element={<AgentBuilder />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
