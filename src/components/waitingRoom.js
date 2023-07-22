// src/components/WaitingRoom.js

import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LobbyContext } from '../config/LobbyContext';

function WaitingRoom() {
  const { lobby, setLobby } = useContext(LobbyContext);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Checking lobby status...');

      // Check if lobby is not null before accessing lobby.createdAt
      if (lobby && Date.now() - lobby.createdAt > 5000) {
        clearInterval(interval);
        console.log('Another player has joined. Starting the game...');
        setLobby({ ...lobby, status: 'in-game' });
        navigate('/game');
      }
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [lobby, setLobby, navigate]);

  return (
    <div>
      <h1>Waiting Room</h1>
      <p>Waiting for another player to join...</p>
    </div>
  );
}

export default WaitingRoom;
