import { createContext, useContext, useEffect, useState } from 'react';

// AuthContext — Observer Pattern (GoF Behavioral)
//
// In the course warehouse lab you saw the Observer pattern where a subject
// notifies all registered observers when its state changes.
//
// React Context works the same way:
//   - AuthProvider is the "subject" — it holds the logged-in user state.
//   - Any component that calls useAuth() is an "observer" — it re-renders
//     automatically whenever the user logs in or out.
//
// This means CatalogPage, ProductDetailPage, and the navbar can all
// react to auth changes without prop-drilling through every component.

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = 'sixoutside_user';

export function AuthProvider({ children }) {
  // user shape: { customerId, firstName, email, isAdmin }  — or null when logged out
  // This is set from the server response after a successful login.
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!saved) return null;

    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  function login(userData) {
    setUser(userData);
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch {
      // Local state reset still signs out the UI when network call fails.
    }

    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth() — custom hook so any component can read/update auth state cleanly
// Usage: const { user, login, logout } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
