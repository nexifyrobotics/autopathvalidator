import React, { useState } from 'react';
import { Plus, Minus, Save, Trash2, Edit3, MapPin, Target, AlertTriangle } from 'lucide-react';
import PathTemplates from './PathTemplates';

const PathEditor = ({ onPathCreated, constraints, selectedField }) => {
  const [waypoints, setWaypoints] = useState([]);

  // Add a new waypoint
  const addWaypoint = () => {
    const newWaypoint = {
      x: Math.random() * 8 + 4, // Random X between 4-12
      y: Math.random() * 4 + 3, // Random Y between 3-7
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
    const updatedWaypoints = waypoints.map((wp, i) =>
      i === index ? { ...wp, [field]: parseFloat(value) || 0 } : wp
    );
    setWaypoints(updatedWaypoints);
  };

  // Generate trajectory from waypoints
  const generateTrajectory = () => {
    if (waypoints.length < 2) {
      alert('Please add at least 2 waypoints');
      return;
    }

    // Simple straight-line trajectory generation
    const totalTime = 10; // 10 seconds
    const timeStep = totalTime / waypoints.length;

    const trajectory = waypoints.map((point, index) => {
      const time = index * timeStep;
      let velocity = 0;
      let acceleration = 0;

      // Calculate velocity and acceleration between points
      if (index > 0) {
        const prev = waypoints[index - 1];
        const dx = point.x - prev.x;
        const dy = point.y - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        velocity = distance / timeStep;
        acceleration = index === 1 ? velocity / timeStep : 0; // Simplified
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

  return (
    <div className="space-y-6">
      {/* Path Templates */}
      <PathTemplates
        onLoadTemplate={(templateWaypoints) => {
          setWaypoints(templateWaypoints.map((wp, index) => ({ ...wp, id: Date.now() + index })));
        }}
        onSaveTemplate={(template) => {
          console.log('Save template:', template);
        }}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-4 bg-neutral-800 rounded-lg">
        <button
          onClick={addWaypoint}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Waypoint</span>
        </button>

        <button
          onClick={clearWaypoints}
          disabled={waypoints.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear All</span>
        </button>

        <button
          onClick={generateTrajectory}
          disabled={waypoints.length < 2}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          <span>Generate Path</span>
        </button>
      </div>

      {/* Waypoints List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-400" />
          Waypoints ({waypoints.length})
        </h3>

        {waypoints.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-neutral-800 rounded-lg">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No waypoints added yet</p>
            <p className="text-xs mt-1">Click "Add Waypoint" to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {waypoints.map((waypoint, index) => (
              <div key={waypoint.id} className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    Waypoint {index + 1}
                  </h4>
                  <button
                    onClick={() => removeWaypoint(index)}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Remove waypoint"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      X Coordinate (meters)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={waypoint.x.toFixed(1)}
                      onChange={(e) => updateWaypoint(index, 'x', e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Y Coordinate (meters)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={waypoint.y.toFixed(1)}
                      onChange={(e) => updateWaypoint(index, 'y', e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Path Preview */}
      {waypoints.length > 0 && (
        <div className="bg-neutral-800 p-4 rounded-lg">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-green-400" />
            Path Preview
          </h4>
          <div className="text-sm text-gray-300">
            <p><strong>Total Waypoints:</strong> {waypoints.length}</p>
            {waypoints.length > 1 && (
              <>
                <p><strong>Start:</strong> ({waypoints[0].x.toFixed(1)}, {waypoints[0].y.toFixed(1)})</p>
                <p><strong>End:</strong> ({waypoints[waypoints.length - 1].x.toFixed(1)}, {waypoints[waypoints.length - 1].y.toFixed(1)})</p>
              </>
            )}
          </div>

          {/* Simple ASCII visualization */}
          <div className="mt-4 p-4 bg-neutral-900 rounded font-mono text-green-400 text-sm overflow-x-auto">
            <pre>
{waypoints.map((wp, i) => `Waypoint ${i + 1}: (${wp.x.toFixed(1)}, ${wp.y.toFixed(1)}) ${i < waypoints.length - 1 ? '→' : ''}`).join('\n')}
            </pre>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-300 mb-1">Path Editor Instructions</h3>
            <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
              <li>Select a field from the dropdown above</li>
              <li>Use "Add Waypoint" to create path points</li>
              <li>Edit coordinates manually or use templates</li>
              <li>Review the path preview above</li>
              <li>Click "Generate Path" to create and validate</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathEditor;
