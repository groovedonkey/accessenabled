import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { user, signOutUser } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="topbar-brand" onClick={() => navigate('/')}>
          <ShieldCheck size={24} strokeWidth={2.2} />
          <span>AccessEnabled</span>
        </Link>
        <div className="topbar-right">
          {user && <span className="user-name">{user.email}</span>}
          <button className="btn btn-ghost" onClick={signOutUser} title="Sign out">
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
