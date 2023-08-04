import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const LobbyContext = createContext();

export function LobbyProvider({ children }) {
  const [lobby, setLobby] = useState(null);
  const [players, setPlayers] = useState([]);
  const [status, setStatus] = useState('waiting');
  const [loading, setLoading] = useState(true);
  const [gameId, setGameId] = useState(null);
  const navigate = useNavigate();

  const fetchLobby = async () => {
    if (!lobby) {
      return;
    }
  
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/lobby/${lobby._id}`, {
      credentials: 'include',
    });
    const data = await response.json();
    if (data.success) {
      const updatedLobby = { ...data.data.lobby };
      setLobby(updatedLobby);
      setPlayers(updatedLobby.players);
      setStatus(updatedLobby.status);

      console.log(`Fetched lobby with ID: ${updatedLobby._id}, status: ${updatedLobby.status}`);
      
      if (updatedLobby.status === 'in-game') {
        console.log(`Navigating to /game/${updatedLobby._id}`);
        navigate(`/game/${updatedLobby._id}`);
      }

      return updatedLobby;
    }
  };

  useEffect(() => {
    if (lobby) {
      fetchLobby(lobby._id);
    }
  }, [lobby]);

  const joinGame = async (gameId) => {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/multiplayer/:lobbyId`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId }),
      credentials: 'include',
    });
    const data = await response.json();
    if (data.success) {
      const updatedLobby = { ...data.data.lobby };
      setLobby(updatedLobby);
      setPlayers(updatedLobby.players);
      setStatus(updatedLobby.status);
      return updatedLobby;
    }
  };

  const leaveGame = async (userId) => {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/leave-waiting-room`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const data = await response.json();
    if (!data.success) {
      console.error(data.error);
    }
  };

  const value = { lobby, setLobby, players, setPlayers, status, setStatus, joinGame, leaveGame, loading, fetchLobby, gameId, setGameId };

  return <LobbyContext.Provider value={value}>{children}</LobbyContext.Provider>;
}
