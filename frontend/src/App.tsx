import { Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import AgentDetail from './pages/AgentDetail';
import Explainability from './pages/Explainability';
import Metrics from './pages/Metrics';
import Costs from './pages/Costs';
import Conversations from './pages/Conversations';
import Governance from './pages/Governance';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/agents/:id" element={<AgentDetail />} />
        <Route path="/explainability" element={<Explainability />} />
        <Route path="/metrics" element={<Metrics />} />
        <Route path="/costs" element={<Costs />} />
        <Route path="/conversations" element={<Conversations />} />
        <Route path="/governance" element={<Governance />} />
      </Routes>
    </Layout>
  );
}

export default App;
