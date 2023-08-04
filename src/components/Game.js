import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../config/axiosConfig'; // I assume you're using axios for HTTP requests

function Game() {
  const { gameId } = useParams(); // Extract gameId from URL
  const [game, setGame] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch game data when component mounts
    const fetchGame = async () => {
      try {
        const response = await axios.get(`/api/game/${gameId}`); // Your actual API endpoint might be different
        setGame(response.data.game);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchGame();
  }, [gameId]);

  return (
    <div>
      <h1>Game</h1>
      {/* Add your game logic and components here */}
      {game && <div>{`Playing game id: ${game._id}`}</div>}
      {error && <div>Error: {error}</div>}
    </div>
  );
}

export default Game;
