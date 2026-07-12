import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AuditView from "./pages/AuditView.jsx";
import WizardStart from "./pages/WizardStart.jsx";
import Wizard from "./pages/Wizard.jsx";
import Layout from "./components/Layout.jsx";
import { firebaseReady, firebaseError } from "./firebase.js";
import "./landing.css";

// Internal scan-tool pages share the Layout (the "me"-facing app).
const tool = (Page) => (
  <Layout>
    <Page />
  </Layout>
);

// Each internal tool runs on its own hosting site so it gets a separate URL
// from the client-facing landing page. On each tool host the app lives at root;
// on the landing host the tool routes are hidden.
const SCANNER_HOSTS = [
  "accessenabled-audit.web.app",
  "accessenabled-audit.firebaseapp.com",
];
const WEBAUDIT_HOSTS = [
  "accessenabled-webaudit.web.app",
  "accessenabled-webaudit.firebaseapp.com",
];
const hostname = typeof window !== "undefined" ? window.location.hostname : "";
const isScannerHost = SCANNER_HOSTS.includes(hostname);
const isWebAuditHost = WEBAUDIT_HOSTS.includes(hostname);

function ScannerApp() {
  return (
    <Routes>
      <Route path="/" element={tool(Dashboard)} />
      <Route path="/audit/:id" element={tool(AuditView)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Guided manual audit wizard (accessenabled-webaudit.web.app).
function WebAuditApp() {
  return (
    <Routes>
      <Route path="/" element={tool(WizardStart)} />
      <Route path="/audit/:id" element={tool(Wizard)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function LandingApp() {
  return (
    <Routes>
      {/* Public-facing marketing landing page */}
      <Route path="/" element={<Landing />} />
      {/* Tools are served from their own hosts; keep these off the public site. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function ConfigErrorScreen() {
  return (
    <div className="centered-screen" style={{ padding: "24px" }}>
      <div className="login-card" role="alert" style={{ maxWidth: "720px" }}>
        <h1 style={{ marginTop: 0 }}>Configuration Error</h1>
        <p style={{ marginBottom: "8px" }}>
          The app could not start because Firebase is not configured correctly.
        </p>
        <p className="error-text" style={{ marginTop: 0 }}>
          {firebaseError || "Unknown Firebase initialization error."}
        </p>
        <p className="fineprint" style={{ marginBottom: 0 }}>
          Add the required VITE_FB_* values and redeploy/restart.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  if (isScannerHost) {
    if (!firebaseReady) return <ConfigErrorScreen />;
    return <ScannerApp />;
  }
  if (isWebAuditHost) {
    if (!firebaseReady) return <ConfigErrorScreen />;
    return <WebAuditApp />;
  }
  return <LandingApp />;
}
