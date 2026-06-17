import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function Layout({ children }) {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="topbar-brand" onClick={() => navigate('/')}>
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
