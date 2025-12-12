import React, { useState } from 'react';
import { Shield, Plus, Trash2, Move, RotateCw } from 'lucide-react';

const ObstaclePlacer = ({ obstacles, onObstaclesChange, fieldDimensions }) => {
  const [selectedObstacle, setSelectedObstacle] = useState(null);

  const obstacleTypes = [
    {
      id: 'rectangle',
      name: 'Rectangle',
      description: 'Rectangular obstacle',
      defaultSize: { width: 0.5, height: 0.5 },
      color: '#ef4444'
    },
    {
      id: 'circle',
      name: 'Circle',
      description: 'Circular obstacle',
      defaultSize: { radius: 0.25 },
      color: '#f97316'
    },
    {
      id: 'polygon',
      name: 'Polygon',
      description: 'Custom polygon',
      defaultSize: { points: 6 },
      color: '#eab308'
    }
  ];

  const addObstacle = (type) => {
    const newObstacle = {
      id: `obstacle-${obstacles.length + 1}`,
      type,
      x: fieldDimensions.width / 2,
      y: fieldDimensions.height / 2,
      rotation: 0,
      ...obstacleTypes.find(t => t.id === type).defaultSize,
      color: obstacleTypes.find(t => t.id === type).color
    };

    onObstaclesChange([...obstacles, newObstacle]);
  };

  const removeObstacle = (id) => {
    onObstaclesChange(obstacles.filter(obs => obs.id !== id));
    if (selectedObstacle === id) {
      setSelectedObstacle(null);
    }
  };

  const updateObstacle = (id, updates) => {
    onObstaclesChange(obstacles.map(obs =>
      obs.id === id ? { ...obs, ...updates } : obs
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-red-400" />
        <h3 className="text-lg font-semibold text-white">Obstacle Placement</h3>
      </div>

      {/* Add Obstacle Buttons */}
      <div className="flex flex-wrap gap-2">
        {obstacleTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => addObstacle(type.id)}
            className="flex items-center gap-2 px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {type.name}
          </button>
        ))}
      </div>

      {/* Obstacles List */}
      {obstacles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Obstacles ({obstacles.length})</h4>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {obstacles.map((obstacle) => (
              <div
                key={obstacle.id}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedObstacle === obstacle.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-neutral-600 hover:border-neutral-500 bg-neutral-800/50'
                }`}
                onClick={() => setSelectedObstacle(
                  selectedObstacle === obstacle.id ? null : obstacle.id
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: obstacle.color }}
                    />
                    <div>
                      <span className="text-white font-medium capitalize">
                        {obstacle.type}
                      </span>
                      <div className="text-xs text-gray-400">
                        ({obstacle.x.toFixed(2)}, {obstacle.y.toFixed(2)})
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeObstacle(obstacle.id);
                    }}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {selectedObstacle === obstacle.id && (
                  <div className="mt-3 pt-3 border-t border-neutral-600 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">X Position</label>
                        <input
                          type="number"
                          step="0.1"
                          value={obstacle.x}
                          onChange={(e) => updateObstacle(obstacle.id, { x: parseFloat(e.target.value) })}
                          className="w-full px-2 py-1 bg-neutral-700 border border-neutral-600 rounded text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Y Position</label>
                        <input
                          type="number"
                          step="0.1"
                          value={obstacle.y}
                          onChange={(e) => updateObstacle(obstacle.id, { y: parseFloat(e.target.value) })}
                          className="w-full px-2 py-1 bg-neutral-700 border border-neutral-600 rounded text-white text-sm"
                        />
                      </div>
                    </div>

                    {obstacle.type === 'rectangle' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Width</label>
                          <input
                            type="number"
                            step="0.1"
                            value={obstacle.width}
                            onChange={(e) => updateObstacle(obstacle.id, { width: parseFloat(e.target.value) })}
                            className="w-full px-2 py-1 bg-neutral-700 border border-neutral-600 rounded text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Height</label>
                          <input
                            type="number"
                            step="0.1"
                            value={obstacle.height}
                            onChange={(e) => updateObstacle(obstacle.id, { height: parseFloat(e.target.value) })}
                            className="w-full px-2 py-1 bg-neutral-700 border border-neutral-600 rounded text-white text-sm"
                          />
                        </div>
                      </div>
                    )}

                    {obstacle.type === 'circle' && (
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Radius</label>
                        <input
                          type="number"
                          step="0.1"
                          value={obstacle.radius}
                          onChange={(e) => updateObstacle(obstacle.id, { radius: parseFloat(e.target.value) })}
                          className="w-full px-2 py-1 bg-neutral-700 border border-neutral-600 rounded text-white text-sm"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Rotation (°)</label>
                      <input
                        type="number"
                        step="5"
                        value={obstacle.rotation}
                        onChange={(e) => updateObstacle(obstacle.id, { rotation: parseFloat(e.target.value) })}
                        className="w-full px-2 py-1 bg-neutral-700 border border-neutral-600 rounded text-white text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {obstacles.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No obstacles placed</p>
          <p className="text-xs mt-1">Add obstacles to test collision avoidance</p>
        </div>
      )}
    </div>
  );
};

export default ObstaclePlacer;
