import React from 'react';
import { listGames } from '../config/gameConfig.js';

export default function GameSelector({ value, onChange }) {
  const games = listGames();

  return (
    <div className="game-selector-container">
      <label htmlFor="game-select" className="game-selector-label">
        Game Season:
      </label>
      <select
        id="game-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="game-selector-select"
      >
        {games.map(game => (
          <option key={game.id} value={game.id}>
            {game.year} {game.name}
          </option>
        ))}
      </select>
    </div>
  );
}
