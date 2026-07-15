import React, { createContext } from 'react';

export const GameContext = createContext(null);

export function useGame() {
  const context = React.useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
