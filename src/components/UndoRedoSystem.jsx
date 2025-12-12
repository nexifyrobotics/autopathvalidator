import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Undo2, Redo2, RotateCcw, Save } from 'lucide-react';

const UndoRedoSystem = ({ waypoints, onWaypointsChange }) => {
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const initializedRef = useRef(false);

  const saveCurrentState = useCallback(() => {
    if (waypoints.length === 0) return;

    const state = {
      waypoints: JSON.parse(JSON.stringify(waypoints)),
      timestamp: Date.now(),
      action: 'auto-save'
    };

    setHistory(prevHistory => {
      // Remove any states after current index
      const newHistory = prevHistory.slice(0, currentIndex + 1);
      newHistory.push(state);

      // Keep only last 50 states to prevent memory issues
      if (newHistory.length > 50) {
        newHistory.shift();
      }

      setCurrentIndex(newHistory.length - 1);
      setLastSaved(new Date().toLocaleTimeString());
      return newHistory;
    });
  }, [waypoints, currentIndex]);

  // Initialize history when waypoints change
  useEffect(() => {
    if (waypoints.length > 0 && !initializedRef.current) {
      initializedRef.current = true;
      const initialState = {
        waypoints: [...waypoints],
        timestamp: Date.now(),
        action: 'initial'
      };
      setHistory([initialState]);
      setCurrentIndex(0);
    }
  }, [waypoints]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || history.length === 0) return;

    const interval = setInterval(() => {
      saveCurrentState();
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [autoSaveEnabled, saveCurrentState]);

  const addToHistory = useCallback((newWaypoints, action = 'edit') => {
    if (newWaypoints.length === 0) return;

    const state = {
      waypoints: JSON.parse(JSON.stringify(newWaypoints)),
      timestamp: Date.now(),
      action
    };

    // Remove any states after current index
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(state);

    // Keep only last 50 states to prevent memory issues
    if (newHistory.length > 50) {
      newHistory.shift();
    }

    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [history, currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const previousState = history[currentIndex - 1];
      onWaypointsChange(previousState.waypoints);
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex, history, onWaypointsChange]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const nextState = history[currentIndex + 1];
      onWaypointsChange(nextState.waypoints);
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, history, onWaypointsChange]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
    setLastSaved(null);
  }, []);

  const exportHistory = useCallback(() => {
    const historyData = {
      timestamp: new Date().toISOString(),
      totalStates: history.length,
      currentIndex,
      states: history.map(state => ({
        ...state,
        waypoints: state.waypoints // Include full waypoint data
      }))
    };

    const blob = new Blob([JSON.stringify(historyData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `path-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [history, currentIndex]);

  // Expose functions to parent component
  useEffect(() => {
    if (window.pathEditorUndoRedo) {
      window.pathEditorUndoRedo.addToHistory = addToHistory;
      window.pathEditorUndoRedo.saveCurrentState = saveCurrentState;
      window.pathEditorUndoRedo.clearHistory = clearHistory;
    } else {
      window.pathEditorUndoRedo = {
        addToHistory,
        saveCurrentState,
        clearHistory
      };
    }
  }, [addToHistory, saveCurrentState, clearHistory]);

  return (
    <div className="flex items-center gap-4 p-3 bg-neutral-800 rounded-lg border border-neutral-700">
      <div className="flex items-center gap-2">
        <button
          onClick={undo}
          disabled={currentIndex <= 0}
          className="p-2 bg-neutral-700 hover:bg-neutral-600 disabled:bg-neutral-800 disabled:opacity-50 text-white rounded transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          onClick={redo}
          disabled={currentIndex >= history.length - 1}
          className="p-2 bg-neutral-700 hover:bg-neutral-600 disabled:bg-neutral-800 disabled:opacity-50 text-white rounded transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-neutral-600"></div>

        <button
          onClick={saveCurrentState}
          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
          title="Save Current State"
        >
          <Save className="w-4 h-4" />
        </button>

        <button
          onClick={clearHistory}
          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          title="Clear History"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex items-center gap-4 text-sm">
        <div className="text-gray-400">
          History: <span className="text-white font-medium">{history.length}</span> states
        </div>

        <div className="text-gray-400">
          Current: <span className="text-white font-medium">{currentIndex + 1}</span>
        </div>

        {lastSaved && (
          <div className="text-gray-400">
            Last saved: <span className="text-green-400">{lastSaved}</span>
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoSaveEnabled}
            onChange={(e) => setAutoSaveEnabled(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-neutral-700 border-neutral-600 rounded focus:ring-blue-500"
          />
          <span className="text-gray-300 text-xs">Auto-save</span>
        </label>
      </div>

      <button
        onClick={exportHistory}
        disabled={history.length === 0}
        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 text-white text-sm rounded transition-colors"
      >
        Export History
      </button>
    </div>
  );
};

export default UndoRedoSystem;
