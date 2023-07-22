// UserContext.js: This context will hold the state of the current user. It will include the user's information and functions to handle user actions like logging in, logging out, and updating user information.

// src/config/UserContext.js

import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the current user from the server and update state
    const fetchUser = async () => {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/user`, {
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

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
