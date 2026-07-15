import game2025 from './games/game-2025.js';
import game2026 from './games/game-2026.js';

export const GAMES = {
  '2025': game2025,
  '2026': game2026
};

export function getGameConfig(gameId = '2025') {
  if (!GAMES[gameId]) {
    console.warn(`Game ${gameId} not found, defaulting to 2025`);
    return GAMES['2025'];
  }
  return GAMES[gameId];
}

export function listGames() {
  return Object.entries(GAMES).map(([id, config]) => ({
    id,
    name: config.name,
    year: config.year,
    fullName: `${config.year} ${config.name}`
  }));
}

export function getGameYear(gameId) {
  return getGameConfig(gameId).year;
}
