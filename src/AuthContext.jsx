import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged, signInWithPopup, signOut, setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

// The scanner is a private, single-auditor tool. Only this Google account may
// use it; everyone else is rejected at sign-in (and again by the Firestore
// rules and the scan Cloud Function).
export const ALLOWED_EMAIL = 'littlepete1976@gmail.com';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && fbUser.email !== ALLOWED_EMAIL) {
        // Signed in with the wrong account — reject and sign back out.
        setAuthError(`Access denied for ${fbUser.email}. This tool is restricted to ${ALLOWED_EMAIL}.`);
        await signOut(auth);
        setUser(null);
      } else {
        setUser(fbUser);
        if (fbUser) setAuthError('');
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn = async () => {
    setAuthError('');
    await setPersistence(auth, browserLocalPersistence);
    googleProvider.setCustomParameters({ prompt: 'select_account', login_hint: ALLOWED_EMAIL });
    const cred = await signInWithPopup(auth, googleProvider);
    if (cred.user.email !== ALLOWED_EMAIL) {
      await signOut(auth);
      throw new Error(`Access denied for ${cred.user.email}. This tool is restricted to ${ALLOWED_EMAIL}.`);
    }
    return cred.user;
  };

  const signOutUser = async () => {
    await signOut(auth);
    setUser(null);
  };

  const value = { user, loading, authError, signIn, signOutUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
