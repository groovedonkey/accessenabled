import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AuditView from './pages/AuditView.jsx';
import Login from './pages/Login.jsx';
import Layout from './components/Layout.jsx';
import { useAuth } from './AuthContext.jsx';
import './landing.css';

// Internal scan-tool pages share the Layout (the "me"-facing app).
const tool = (Page) => (
  <Layout>
    <Page />
  </Layout>
);

// The scanner runs on its own hosting site (accessenabled-audit.web.app) so it
// has a separate URL from the client-facing landing page. On that host the tool
// lives at the root; on the landing host the tool routes are hidden.
const SCANNER_HOSTS = ['accessenabled-audit.web.app', 'accessenabled-audit.firebaseapp.com'];
const isScannerHost = typeof window !== 'undefined' && SCANNER_HOSTS.includes(window.location.hostname);

function ScannerApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="centered-screen"><div className="spinner" aria-label="Loading" /></div>;
  }
  if (!user) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={tool(Dashboard)} />
      <Route path="/audit/:id" element={tool(AuditView)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function LandingApp() {
  return (
    <Routes>
      {/* Public-facing marketing landing page */}
      <Route path="/" element={<Landing />} />
      {/* Scan tool is served from its own host; keep these off the public site. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return isScannerHost ? <ScannerApp /> : <LandingApp />;
}
