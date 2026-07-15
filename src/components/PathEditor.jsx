import React, { useState, useMemo } from 'react';
import { Plus, Minus, Save, Trash2, Edit3, MapPin, Target, AlertTriangle, Grid3x3 } from 'lucide-react';
import { useGame } from '../contexts/GameContext.jsx';
import PathTemplates from './PathTemplates';

const PathEditor = ({ onPathCreated, constraints }) => {
  const gameConfig = useGame();
  const [waypoints, setWaypoints] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);

  // Get field boundaries from game config
  const fieldBounds = useMemo(() => ({
    width: gameConfig.field.width,
    length: gameConfig.field.length,
    minX: 0,
    minY: 0,
    maxX: gameConfig.field.width,
    maxY: gameConfig.field.length
  }), [gameConfig]);

  // Add a new waypoint
  const addWaypoint = () => {
    const newWaypoint = {
      x: fieldBounds.maxX / 2,
      y: fieldBounds.maxY / 2,
      id: Date.now()
    };
    setWaypoints([...waypoints, newWaypoint]);
  };

  // Remove a waypoint
  const removeWaypoint = (index) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
  };

  // Update waypoint coordinates
  const updateWaypoint = (index, field, value) => {
    const parsedValue = parseFloat(value) || 0;
    const clampedValue = field === 'x'
      ? Math.max(fieldBounds.minX, Math.min(fieldBounds.maxX, parsedValue))
      : Math.max(fieldBounds.minY, Math.min(fieldBounds.maxY, parsedValue));

    const updatedWaypoints = waypoints.map((wp, i) =>
      i === index ? { ...wp, [field]: clampedValue } : wp
    );
    setWaypoints(updatedWaypoints);
  };

  // Generate trajectory from waypoints
  const generateTrajectory = () => {
    if (waypoints.length < 2) {
      alert('Please add at least 2 waypoints');
      return;
    }

    const totalTime = 10;
    const timeStep = totalTime / waypoints.length;

    const trajectory = waypoints.map((point, index) => {
      const time = index * timeStep;
      let velocity = 0;
      let acceleration = 0;

      if (index > 0) {
        const prev = waypoints[index - 1];
        const dx = point.x - prev.x;
        const dy = point.y - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        velocity = distance / timeStep;
        acceleration = index === 1 ? velocity / timeStep : 0;
      }

      return {
        time,
        velocity: Math.min(velocity, constraints.maxVelocity),
        acceleration: Math.min(acceleration, constraints.maxAcceleration),
        pose: {
          translation: { x: point.x, y: point.y },
          rotation: { radians: 0 }
        },
        curvature: 0
      };
    });

    onPathCreated && onPathCreated(trajectory);
  };

  // Clear all waypoints
  const clearWaypoints = () => {
    setWaypoints([]);
  };

  // Calculate total path distance
  const totalDistance = useMemo(() => {
    let distance = 0;
    for (let i = 1; i < waypoints.length; i++) {
      const dx = waypoints[i].x - waypoints[i - 1].x;
      const dy = waypoints[i].y - waypoints[i - 1].y;
      distance += Math.sqrt(dx * dx + dy * dy);
    }
    return distance.toFixed(2);
  }, [waypoints]);

  return (
    <div className="path-editor">
      {/* Header with Game Info */}
      <div className="editor-header">
        <div className="header-left">
          <h2 className="editor-title">Path Editor</h2>
          <p className="game-info">{gameConfig.year} {gameConfig.name}</p>
        </div>
        <div className="header-right">
          <div className="field-bounds">
            <span className="bound-label">Field: {fieldBounds.maxX.toFixed(1)}m × {fieldBounds.maxY.toFixed(1)}m</span>
          </div>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="editor-grid">
        {/* Left Column: Waypoints Editor */}
        <div className="editor-column waypoints-column">
          {/* Toolbar */}
          <div className="editor-toolbar">
            <button
              onClick={addWaypoint}
              className="btn btn-primary"
              title="Add a new waypoint to the path"
            >
              <Plus size={16} />
              <span>Add</span>
            </button>

            <button
              onClick={clearWaypoints}
              disabled={waypoints.length === 0}
              className="btn btn-danger"
              title="Clear all waypoints"
            >
              <Trash2 size={16} />
              <span>Clear</span>
            </button>

            <button
              onClick={generateTrajectory}
              disabled={waypoints.length < 2}
              className="btn btn-success"
              title="Generate and validate the path"
            >
              <Save size={16} />
              <span>Generate</span>
            </button>

            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="btn btn-secondary"
              title="Load from templates"
            >
              <Grid3x3 size={16} />
              <span>Templates</span>
            </button>
          </div>

          {/* Waypoints List */}
          <div className="waypoints-section">
            <h3 className="section-title">
              <MapPin size={18} />
              Waypoints ({waypoints.length})
            </h3>

            {waypoints.length === 0 ? (
              <div className="empty-state">
                <Target size={32} />
                <p>No waypoints added</p>
                <p className="text-xs">Click "Add" to create waypoints</p>
              </div>
            ) : (
              <div className="waypoints-list">
                {waypoints.map((waypoint, index) => (
                  <div key={waypoint.id} className="waypoint-item">
                    <div className="waypoint-header">
                      <span className="waypoint-number">#{index + 1}</span>
                      <button
                        onClick={() => removeWaypoint(index)}
                        className="btn-remove"
                        title="Remove this waypoint"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="waypoint-inputs">
                      <div className="coord-input">
                        <label>X</label>
                        <input
                          type="number"
                          step="0.1"
                          min={fieldBounds.minX}
                          max={fieldBounds.maxX}
                          value={waypoint.x.toFixed(1)}
                          onChange={(e) => updateWaypoint(index, 'x', e.target.value)}
                          className="input-field"
                        />
                      </div>
                      <div className="coord-input">
                        <label>Y</label>
                        <input
                          type="number"
                          step="0.1"
                          min={fieldBounds.minY}
                          max={fieldBounds.maxY}
                          value={waypoint.y.toFixed(1)}
                          onChange={(e) => updateWaypoint(index, 'y', e.target.value)}
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Preview & Info */}
        <div className="editor-column preview-column">
          {/* Path Summary */}
          <div className="info-card">
            <h3 className="section-title">
              <Target size={18} />
              Path Summary
            </h3>
            {waypoints.length > 0 ? (
              <div className="summary-info">
                <div className="info-item">
                  <span className="label">Total Distance:</span>
                  <span className="value">{totalDistance}m</span>
                </div>
                {waypoints.length > 1 && (
                  <>
                    <div className="info-item">
                      <span className="label">Start:</span>
                      <span className="value">({waypoints[0].x.toFixed(2)}, {waypoints[0].y.toFixed(2)})</span>
                    </div>
                    <div className="info-item">
                      <span className="label">End:</span>
                      <span className="value">
                        ({waypoints[waypoints.length - 1].x.toFixed(2)}, {waypoints[waypoints.length - 1].y.toFixed(2)})
                      </span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="empty-text">Add waypoints to see summary</p>
            )}
          </div>

          {/* Path Visualization */}
          {waypoints.length > 0 && (
            <div className="info-card">
              <h4 className="section-subtitle">Path Visualization</h4>
              <div className="path-viz">
                <pre className="viz-text">
                  {waypoints.map((wp, i) =>
                    `${i + 1}. (${wp.x.toFixed(1)}, ${wp.y.toFixed(1)})${i < waypoints.length - 1 ? ' →' : ''}`
                  ).join('\n')}
                </pre>
              </div>
            </div>
          )}

          {/* Game Info */}
          <div className="info-card game-info-card">
            <h4 className="section-subtitle">Game Info</h4>
            <div className="game-details">
              <p><strong>Year:</strong> {gameConfig.year}</p>
              <p><strong>Game:</strong> {gameConfig.name}</p>
              <p><strong>Field:</strong> {fieldBounds.maxX.toFixed(1)}m × {fieldBounds.maxY.toFixed(1)}m</p>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Section (Collapsed) */}
      {showTemplates && (
        <div className="templates-section">
          <PathTemplates
            onLoadTemplate={(templateWaypoints) => {
              setWaypoints(templateWaypoints.map((wp, index) => ({ ...wp, id: Date.now() + index })));
              setShowTemplates(false);
            }}
          />
        </div>
      )}

      {/* Instructions */}
      <div className="instructions-card">
        <div className="instructions-header">
          <AlertTriangle size={18} />
          <h3>Tips</h3>
        </div>
        <ul className="instructions-list">
          <li>Add waypoints and edit their coordinates</li>
          <li>Load pre-built strategies from Templates</li>
          <li>Coordinates are auto-clamped to field bounds</li>
          <li>Click "Generate" to create and validate the path</li>
        </ul>
      </div>
    </div>
  );
};

export default PathEditor;
