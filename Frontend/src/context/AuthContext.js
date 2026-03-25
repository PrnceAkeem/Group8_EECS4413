import { createContext, useContext, useState } from 'react';

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

export function AuthProvider({ children }) {
  // user shape: { customerId, firstName, email, isAdmin }  — or null when logged out
  // This is set from the server response after a successful login.
  const [user, setUser] = useState(null);

  function login(userData) {
    setUser(userData);
  }

  function logout() {
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
