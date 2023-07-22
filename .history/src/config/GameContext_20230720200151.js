// GameContext.js: This context will hold the state of the current game for a player. It will include the game state, the player's hand, the current turn, and functions to handle game actions like drawing a card, discarding a card, and ending a turn.

// src/config/GameContext.js

import React, { createContext, useState, useEffect } from 'react';

export const GameContext = createContext();

export function GameProvider({ children }) {
  const [game, setGame] = useState(null);
  const [hand, setHand] = useState([]);
  const [turn, setTurn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the current game from the server and update state
    const fetchGame = async () => {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/game`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setGame(data.data.game);
      }
      setLoading(false);
    };
    fetchGame();
  }, []);

  const drawCard = () => {
    // implement the drawing card logic here
  };

  const discardCard = (card) => {
    // implement the discarding card logic here
  };

  const endTurn = () => {
    // implement the ending turn logic here
  };

  const value = { game, setGame, hand, setHand, turn, setTurn, drawCard, discardCard, endTurn, loading };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}