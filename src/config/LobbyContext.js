//LobbyContext.js: This context will hold the state of the current lobby. It will include the list of players in the lobby, the status of the lobby, and functions to handle lobby actions like joining a game, leaving a game, and starting a game.

// src/config/LobbyContext.js

import React, { createContext, useState, useEffect } from 'react';

export const LobbyContext = createContext();

export function LobbyProvider({ children }) {
  const [lobby, setLobby] = useState(null);
  const [players, setPlayers] = useState([]);
  const [status, setStatus] = useState('waiting');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the current lobby from the server and update state
    const fetchLobby = async () => {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/multiplayer`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setLobby(data.data.lobby);
      }
      setLoading(false);
    };
    fetchLobby();
  }, []);

  const joinGame = (gameId) => {
    // implement the joining game logic here
  };

  const leaveGame = (gameId) => {
    // implement the leaving game logic here
  };

  const startGame = () => {
    // implement the starting game logic here
  };

  const value = { lobby, setLobby, players, setPlayers, status, setStatus, joinGame, leaveGame, startGame, loading };

  return <LobbyContext.Provider value={value}>{children}</LobbyContext.Provider>;
}