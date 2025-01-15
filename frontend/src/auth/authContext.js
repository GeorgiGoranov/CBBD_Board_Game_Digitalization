import React, { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated } from './authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({ isAuthenticated: false, user: null, loading: true });

  const login = async () => {
    const authStatus = await isAuthenticated();
    setAuthState({ ...authStatus, loading: false });
  };

  const logout = () => {
    setAuthState({ isAuthenticated: false, user: null, loading: false });
  };

  useEffect(() => {
    // Only check authentication on initial load, not after explicit login
    if (!authState.isAuthenticated) {
      login();
    }
  }, [authState.isAuthenticated]);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}