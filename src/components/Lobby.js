import React, { useContext, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LobbyContext } from '../config/LobbyContext';

function Lobby() {
  const {setLobby, leaveGame, fetchLobby, gameId } = useContext(LobbyContext);  // Add gameId
  const navigate = useNavigate();
  const location = useLocation();

  const firstRender = useRef(true);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Checking lobby status...');
      
      // Fetch the updated lobby data from the server
      fetchLobby().then((updatedLobby) => {  
        // Check the updated lobby state
        if (updatedLobby && updatedLobby.status === 'in-game') {  // Check if the lobby status is 'in-game'
          clearInterval(interval);
          console.log('Another player has joined. Starting the game...');
          navigate(`/game/${gameId}`);  // Use gameId for navigation
        }
      });
    }, 5000);
  
    return () => {
      clearInterval(interval); 
    };
  }, [setLobby, navigate, fetchLobby, gameId]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
  
    let currentPath = location.pathname;
    return () => {
      // Exclude '/game' path from triggering leaveGame
      if (currentPath === '/lobby' && !location.pathname.startsWith('/game')) {
        leaveGame();
        console.log('Left the game due to change in URL');
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

export default Lobby;
