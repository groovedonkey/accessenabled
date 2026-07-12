import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

// Match the public landing site's blue aesthetic on the guided-audit host.
const WEBAUDIT_HOSTS = [
  "accessenabled-webaudit.web.app",
  "accessenabled-webaudit.firebaseapp.com",
];
const isWebAuditHost =
  typeof window !== "undefined" &&
  WEBAUDIT_HOSTS.includes(window.location.hostname);

export default function Layout({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isWebAuditHost) return;
    document.documentElement.classList.add("theme-blue");
    return () => document.documentElement.classList.remove("theme-blue");
  }, []);

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="topbar-brand" onClick={() => navigate("/")}>
          <ShieldCheck size={24} strokeWidth={2.2} />
          <span>AccessEnabled</span>
        </Link>
        <div className="topbar-right">
          <span className="tagline-mini">Accessibility Audits</span>
        </div>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
