import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import AssetMap from '@/pages/AssetMap';
import AssetDetail from '@/pages/AssetDetail';
import LineageView from '@/pages/LineageView';
import Ranking from '@/pages/Ranking';
import Applications from '@/pages/Applications';
import ComparePanel from '@/components/ComparePanel';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<AssetMap />} />
          <Route path="/assets/:id" element={<AssetDetail />} />
          <Route path="/lineage/:id" element={<LineageView />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="*" element={<AssetMap />} />
        </Routes>
      </Layout>
      <ComparePanel />
    </Router>
  );
}
