import { createContext, useContext } from 'react';

// Single-user mode: no sign-in required. The whole app runs as one fixed
// local auditor. Swap this back to Firebase Auth later if multi-user is needed.
const LOCAL_USER = {
  uid: 'local-auditor',
  displayName: 'Auditor',
  email: null,
  photoURL: null
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const value = {
    user: LOCAL_USER,
    loading: false,
    signIn: async () => {},
    signOutUser: async () => {}
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
