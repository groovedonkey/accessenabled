import { useState } from 'react';
import { LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';

export default function Login() {
  const { signIn, authError } = useAuth();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSignIn = async () => {
    setError('');
    setBusy(true);
    try {
      await signIn();
    } catch (e) {
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
        setError('');
      } else {
        setError(e.message || 'Sign-in failed.');
      }
    } finally {
      setBusy(false);
    }
  };

  const shownError = error || authError;

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="brand">
          <ShieldCheck size={40} strokeWidth={2.2} />
          <h1>AccessEnabled</h1>
        </div>
        <p className="tagline">Website &amp; physical-location accessibility audits.</p>
        <button className="btn btn-google" onClick={handleSignIn} disabled={busy}>
          <LogIn size={18} />
          {busy ? 'Signing in…' : 'Sign in with Google'}
        </button>
        {shownError && <p className="error-text">{shownError}</p>}
        <p className="fineprint">Private auditor access only.</p>
      </div>
    </div>
  );
}
