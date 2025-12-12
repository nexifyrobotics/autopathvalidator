import React, { useState } from 'react';
import { Zap, TrendingUp, Battery, Clock, Target } from 'lucide-react';

const PathOptimizer = ({ trajectory, constraints, onOptimizedPath }) => {
  const [optimizationType, setOptimizationType] = useState('smooth');
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Calculate path metrics
  const calculateMetrics = (path) => {
    if (!path || path.length === 0) return null;

    const totalDistance = path.reduce((sum, point, index) => {
      if (index === 0) return 0;
      const prev = path[index - 1];
      const dx = point.pose.translation.x - prev.pose.translation.x;
      const dy = point.pose.translation.y - prev.pose.translation.y;
      return sum + Math.sqrt(dx * dx + dy * dy);
    }, 0);

    const totalTime = path[path.length - 1]?.time || 0;
    const maxVelocity = Math.max(...path.map(p => p.velocity));
    const maxAcceleration = Math.max(...path.map(p => Math.abs(p.acceleration)));
    const avgVelocity = totalDistance / totalTime;

    // Energy estimation (simplified)
    const energyConsumption = path.reduce((sum, point, index) => {
      if (index === 0) return 0;
      const prev = path[index - 1];
      const dt = point.time - prev.time;
      const avgVel = (point.velocity + prev.velocity) / 2;
      const avgAccel = (point.acceleration + prev.acceleration) / 2;
      // Power = force * velocity, simplified
      const power = Math.abs(avgAccel) * avgVel * 0.1; // Rough estimation
      return sum + power * dt;
    }, 0);

    return {
      totalDistance,
      totalTime,
      maxVelocity,
      maxAcceleration,
      avgVelocity,
      energyConsumption,
      efficiency: totalDistance / (totalTime * maxVelocity) // Path efficiency score
    };
  };

  // Smooth path using moving average filter
  const smoothPath = (path) => {
    const smoothed = [...path];
    const windowSize = 5;

    for (let i = windowSize; i < path.length - windowSize; i++) {
      let sumX = 0, sumY = 0;
      for (let j = -windowSize; j <= windowSize; j++) {
        sumX += path[i + j].pose.translation.x;
        sumY += path[i + j].pose.translation.y;
      }
      smoothed[i].pose.translation.x = sumX / (windowSize * 2 + 1);
      smoothed[i].pose.translation.y = sumY / (windowSize * 2 + 1);
    }

    return smoothed;
  };

  // Optimize for minimum jerk
  const optimizeForMinimumJerk = (path) => {
    // Simplified minimum jerk optimization
    const optimized = [...path];

    for (let i = 2; i < path.length - 2; i++) {
      const p1 = path[i - 1];
      const p2 = path[i];
      const p3 = path[i + 1];

      // Smooth acceleration profile
      const avgAccel = (p1.acceleration + p2.acceleration + p3.acceleration) / 3;
      optimized[i].acceleration = avgAccel * 0.9; // Slightly reduce for smoothness

      // Adjust velocity accordingly
      const dt = p2.time - p1.time;
      optimized[i].velocity = Math.min(
        p1.velocity + optimized[i].acceleration * dt,
        constraints.maxVelocity
      );
    }

    return optimized;
  };

  // Optimize for energy efficiency
  const optimizeForEnergy = (path) => {
    const optimized = [...path];

    // Reduce acceleration in non-critical sections
    for (let i = 1; i < path.length - 1; i++) {
      const current = path[i];

      // If we're accelerating too aggressively, reduce it
      if (Math.abs(current.acceleration) > constraints.maxAcceleration * 0.8) {
        optimized[i].acceleration *= 0.85;

        // Adjust subsequent velocities
        for (let j = i; j < path.length; j++) {
          const dt = optimized[j].time - (optimized[j - 1]?.time || 0);
          optimized[j].velocity = Math.min(
            optimized[j - 1].velocity + optimized[j].acceleration * dt,
            constraints.maxVelocity
          );
        }
        break; // Only optimize first aggressive acceleration
      }
    }

    return optimized;
  };

  const runOptimization = async () => {
    if (!trajectory || trajectory.length === 0) return;

    setIsOptimizing(true);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    let optimizedPath = [...trajectory];

    switch (optimizationType) {
      case 'smooth':
        optimizedPath = smoothPath(trajectory);
        break;
      case 'minJerk':
        optimizedPath = optimizeForMinimumJerk(trajectory);
        break;
      case 'energy':
        optimizedPath = optimizeForEnergy(trajectory);
        break;
      case 'balanced':
        optimizedPath = smoothPath(trajectory);
        optimizedPath = optimizeForMinimumJerk(optimizedPath);
        optimizedPath = optimizeForEnergy(optimizedPath);
        break;
      default:
        break;
    }

    // Recalculate kinematics for optimized path
    const enrichedPath = optimizedPath.map((point, index) => {
      if (index === 0) return point;

      const prev = optimizedPath[index - 1];
      const dt = point.time - prev.time;

      let velocity = prev.velocity;
      let acceleration = 0;

      if (index < optimizedPath.length - 1) {
        const next = optimizedPath[index + 1];
        const dx = next.pose.translation.x - prev.pose.translation.x;
        const dy = next.pose.translation.y - prev.pose.translation.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        velocity = Math.min(distance / (2 * dt), constraints.maxVelocity);
        acceleration = (velocity - prev.velocity) / dt;
        acceleration = Math.max(-constraints.maxAcceleration,
                               Math.min(constraints.maxAcceleration, acceleration));
      }

      return {
        ...point,
        velocity,
        acceleration
      };
    });

    onOptimizedPath && onOptimizedPath(enrichedPath);
    setIsOptimizing(false);
  };

  const metrics = calculateMetrics(trajectory);

  const optimizationTypes = [
    {
      id: 'smooth',
      name: 'Smooth Path',
      description: 'Reduce path roughness and sharp turns',
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'bg-blue-600'
    },
    {
      id: 'minJerk',
      name: 'Minimum Jerk',
      description: 'Optimize for mechanical stress reduction',
      icon: <Zap className="w-4 h-4" />,
      color: 'bg-purple-600'
    },
    {
      id: 'energy',
      name: 'Energy Efficient',
      description: 'Minimize power consumption',
      icon: <Battery className="w-4 h-4" />,
      color: 'bg-green-600'
    },
    {
      id: 'balanced',
      name: 'Balanced',
      description: 'Combine all optimizations',
      icon: <Target className="w-4 h-4" />,
      color: 'bg-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">Path Optimizer</h3>
      </div>

      {/* Current Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-neutral-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              Distance
            </div>
            <div className="text-white font-semibold">{metrics.totalDistance.toFixed(2)}m</div>
          </div>

          <div className="bg-neutral-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Clock className="w-4 h-4" />
              Time
            </div>
            <div className="text-white font-semibold">{metrics.totalTime.toFixed(1)}s</div>
          </div>

          <div className="bg-neutral-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Target className="w-4 h-4" />
              Max Velocity
            </div>
            <div className="text-white font-semibold">{metrics.maxVelocity.toFixed(2)}m/s</div>
          </div>

          <div className="bg-neutral-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Battery className="w-4 h-4" />
              Energy
            </div>
            <div className="text-white font-semibold">{metrics.energyConsumption.toFixed(1)}J</div>
          </div>
        </div>
      )}

      {/* Optimization Types */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300">Optimization Method</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {optimizationTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setOptimizationType(type.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                optimizationType === type.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-neutral-600 hover:border-neutral-500 bg-neutral-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${type.color} text-white`}>
                  {type.icon}
                </div>
                <div>
                  <h5 className="font-medium text-white">{type.name}</h5>
                  <p className="text-sm text-gray-400">{type.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Optimize Button */}
      <div className="flex justify-center">
        <button
          onClick={runOptimization}
          disabled={isOptimizing || !trajectory || trajectory.length === 0}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:cursor-not-allowed"
        >
          {isOptimizing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Optimizing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Optimize Path
            </>
          )}
        </button>
      </div>

      {metrics && (
        <div className="text-xs text-gray-500 text-center">
          Efficiency Score: {(metrics.efficiency * 100).toFixed(1)}%
        </div>
      )}
    </div>
  );
};

export default PathOptimizer;
