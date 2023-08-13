import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the current user from the server and update state
    const fetchUser = async () => {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.data.user);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const value = { user, setUser, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}