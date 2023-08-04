import React, { useContext, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LobbyContext } from '../config/LobbyContext';

function WaitingRoom() {
  const { lobby, setLobby, leaveGame } = useContext(LobbyContext);
  const navigate = useNavigate();
  const location = useLocation();

  const firstRender = useRef(true);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Checking lobby status...');
      
      if (lobby && Date.now() - lobby.createdAt > 5000) {
        clearInterval(interval);
        console.log('Another player has joined. Starting the game...');
        setLobby({ ...lobby, status: 'in-game' });
        navigate('/game');
      }
    }, 5000);

    return () => {
      clearInterval(interval); 
    };
  }, [lobby, setLobby, navigate]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    let currentPath = location.pathname;
    return () => {
      if (currentPath === '/waiting-room') {
        leaveGame();
        console.log('Left the game due to change in URL'); // log a message for debugging
      }
    }
  }, [location, leaveGame]);

  return (
    <div>
      <h1>Waiting Room</h1>
      <p>Waiting for another player to join...</p>
      <button onClick={() => {
        leaveGame();
        navigate('/menu');
      }}>Leave Queue</button>
    </div>
  );  
}

export default WaitingRoom;
