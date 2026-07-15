import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Save, Grid3x3, MapPin, Target, AlertTriangle } from 'lucide-react';
import { useGame } from '../contexts/GameContext.jsx';
import PathTemplates from './PathTemplates';

const PathEditor = ({ onPathCreated, constraints }) => {
  const gameConfig = useGame();
  const [waypoints, setWaypoints] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);

  const fieldBounds = useMemo(() => ({
    width: gameConfig.field.width,
    length: gameConfig.field.length,
    minX: 0,
    minY: 0,
    maxX: gameConfig.field.width,
    maxY: gameConfig.field.length
  }), [gameConfig]);

  const addWaypoint = () => {
    const newWaypoint = {
      x: parseFloat((fieldBounds.maxX / 2).toFixed(1)),
      y: parseFloat((fieldBounds.maxY / 2).toFixed(1)),
      id: Date.now()
    };
    setWaypoints([...waypoints, newWaypoint]);
  };

  const removeWaypoint = (index) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
  };

  const updateWaypoint = (index, field, value) => {
    const parsedValue = parseFloat(value) || 0;
    const clampedValue = field === 'x'
      ? Math.max(fieldBounds.minX, Math.min(fieldBounds.maxX, parsedValue))
      : Math.max(fieldBounds.minY, Math.min(fieldBounds.maxY, parsedValue));

    const updatedWaypoints = waypoints.map((wp, i) =>
      i === index ? { ...wp, [field]: parseFloat(clampedValue.toFixed(1)) } : wp
    );
    setWaypoints(updatedWaypoints);
  };

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

  const clearWaypoints = () => {
    setWaypoints([]);
  };

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
    <div className="path-editor-container">
      {/* Header */}
      <div className="pe-header">
        <div className="pe-header-left">
          <h2 className="pe-title">Path Editor</h2>
          <p className="pe-subtitle">{gameConfig.year} {gameConfig.name}</p>
        </div>
        <div className="pe-header-right">
          <span className="pe-field-info">Field: {fieldBounds.maxX.toFixed(1)}m × {fieldBounds.maxY.toFixed(1)}m</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="pe-main">
        {/* Left Panel - Waypoints */}
        <div className="pe-panel pe-panel-waypoints">
          {/* Controls */}
          <div className="pe-controls">
            <button onClick={addWaypoint} className="pe-btn pe-btn-add">
              <Plus size={16} />
              Add
            </button>
            <button onClick={clearWaypoints} disabled={waypoints.length === 0} className="pe-btn pe-btn-clear">
              <Trash2 size={16} />
              Clear
            </button>
            <button onClick={generateTrajectory} disabled={waypoints.length < 2} className="pe-btn pe-btn-generate">
              <Save size={16} />
              Generate
            </button>
            <button onClick={() => setShowTemplates(!showTemplates)} className="pe-btn pe-btn-templates">
              <Grid3x3 size={16} />
              Templates
            </button>
          </div>

          {/* Waypoints List */}
          <div className="pe-waypoints">
            <h3 className="pe-section-title">
              <MapPin size={16} />
              Waypoints ({waypoints.length})
            </h3>

            {waypoints.length === 0 ? (
              <div className="pe-empty">
                <Target size={32} />
                <p>No waypoints added</p>
                <span className="pe-empty-hint">Click "Add" to create</span>
              </div>
            ) : (
              <div className="pe-waypoints-list">
                {waypoints.map((waypoint, index) => (
                  <div key={waypoint.id} className="pe-waypoint-card">
                    <div className="pe-waypoint-header">
                      <span className="pe-waypoint-index">#{index + 1}</span>
                      <button
                        onClick={() => removeWaypoint(index)}
                        className="pe-waypoint-remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="pe-waypoint-coords">
                      <div className="pe-coord">
                        <label>X</label>
                        <input
                          type="number"
                          step="0.1"
                          min={fieldBounds.minX}
                          max={fieldBounds.maxX}
                          value={waypoint.x}
                          onChange={(e) => updateWaypoint(index, 'x', e.target.value)}
                          className="pe-input"
                        />
                        <span className="pe-unit">m</span>
                      </div>
                      <div className="pe-coord">
                        <label>Y</label>
                        <input
                          type="number"
                          step="0.1"
                          min={fieldBounds.minY}
                          max={fieldBounds.maxY}
                          value={waypoint.y}
                          onChange={(e) => updateWaypoint(index, 'y', e.target.value)}
                          className="pe-input"
                        />
                        <span className="pe-unit">m</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Templates Section */}
          {showTemplates && (
            <div className="pe-templates">
              <PathTemplates
                onLoadTemplate={(templateWaypoints) => {
                  setWaypoints(templateWaypoints.map((wp, i) => ({ ...wp, id: Date.now() + i })));
                  setShowTemplates(false);
                }}
              />
            </div>
          )}
        </div>

        {/* Right Panel - Preview & Info */}
        <div className="pe-panel pe-panel-preview">
          {/* Path Summary */}
          <div className="pe-card">
            <h3 className="pe-section-title">
              <Target size={16} />
              Summary
            </h3>
            {waypoints.length > 0 ? (
              <div className="pe-summary">
                <div className="pe-stat">
                  <span className="pe-stat-label">Distance:</span>
                  <span className="pe-stat-value">{totalDistance}m</span>
                </div>
                <div className="pe-stat">
                  <span className="pe-stat-label">Waypoints:</span>
                  <span className="pe-stat-value">{waypoints.length}</span>
                </div>
                {waypoints.length > 1 && (
                  <>
                    <div className="pe-stat">
                      <span className="pe-stat-label">Start:</span>
                      <span className="pe-stat-value">({waypoints[0].x}, {waypoints[0].y})</span>
                    </div>
                    <div className="pe-stat">
                      <span className="pe-stat-label">End:</span>
                      <span className="pe-stat-value">
                        ({waypoints[waypoints.length - 1].x}, {waypoints[waypoints.length - 1].y})
                      </span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="pe-no-data">Add waypoints to see summary</p>
            )}
          </div>

          {/* Path Sequence */}
          {waypoints.length > 0 && (
            <div className="pe-card">
              <h4 className="pe-card-title">Path Sequence</h4>
              <div className="pe-sequence">
                {waypoints.map((wp, i) => (
                  <div key={wp.id} className="pe-seq-item">
                    <span className="pe-seq-num">{i + 1}</span>
                    <span className="pe-seq-coords">({wp.x}, {wp.y})</span>
                    {i < waypoints.length - 1 && <span className="pe-seq-arrow">→</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Game Info */}
          <div className="pe-card pe-card-game">
            <h4 className="pe-card-title">Game Configuration</h4>
            <div className="pe-game-info">
              <div className="pe-info-row">
                <span className="pe-info-label">Year:</span>
                <span className="pe-info-value">{gameConfig.year}</span>
              </div>
              <div className="pe-info-row">
                <span className="pe-info-label">Game:</span>
                <span className="pe-info-value">{gameConfig.name}</span>
              </div>
              <div className="pe-info-row">
                <span className="pe-info-label">Field Size:</span>
                <span className="pe-info-value">{fieldBounds.maxX}m × {fieldBounds.maxY}m</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="pe-tips">
        <AlertTriangle size={16} />
        <div>
          <strong>Tips:</strong>
          <ul>
            <li>Click "Add" to create waypoints</li>
            <li>Edit coordinates or load from templates</li>
            <li>Coordinates auto-clamp to field bounds</li>
            <li>Generate path to validate and analyze</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PathEditor;
