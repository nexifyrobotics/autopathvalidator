import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Activity, Zap, Clock, Target, AlertTriangle, CheckCircle, Gauge } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const AdvancedAnalytics = ({ trajectory, violations, constraints }) => {
  // Calculate comprehensive metrics
  const metrics = useMemo(() => {
    if (!trajectory || trajectory.length === 0) return null;

    const totalDistance = trajectory.reduce((sum, point, index) => {
      if (index === 0) return 0;
      const prev = trajectory[index - 1];
      const dx = point.pose.translation.x - prev.pose.translation.x;
      const dy = point.pose.translation.y - prev.pose.translation.y;
      return sum + Math.sqrt(dx * dx + dy * dy);
    }, 0);

    const totalTime = trajectory[trajectory.length - 1]?.time || 0;
    const avgVelocity = totalDistance / totalTime;

    const velocities = trajectory.map(p => p.velocity);
    const accelerations = trajectory.map(p => Math.abs(p.acceleration));

    const maxVelocity = Math.max(...velocities);
    const maxAcceleration = Math.max(...accelerations);
    const avgAcceleration = accelerations.reduce((a, b) => a + b, 0) / accelerations.length;

    // Jerk calculation (rate of change of acceleration)
    const jerks = [];
    for (let i = 1; i < trajectory.length; i++) {
      const dt = trajectory[i].time - trajectory[i - 1].time;
      if (dt > 0) {
        const jerk = (trajectory[i].acceleration - trajectory[i - 1].acceleration) / dt;
        jerks.push(Math.abs(jerk));
      }
    }
    const maxJerk = Math.max(...jerks);
    const avgJerk = jerks.reduce((a, b) => a + b, 0) / jerks.length;

    // Curvature analysis
    const curvatures = trajectory.map(p => Math.abs(p.curvature || 0));
    const maxCurvature = Math.max(...curvatures);
    const avgCurvature = curvatures.reduce((a, b) => a + b, 0) / curvatures.length;

    // Efficiency metrics
    const velocityEfficiency = maxVelocity > 0 ? (avgVelocity / constraints.maxVelocity) * 100 : 0;
    const accelerationEfficiency = constraints.maxAcceleration > 0 ? (avgAcceleration / constraints.maxAcceleration) * 100 : 0;
    const jerkEfficiency = constraints.maxJerk > 0 ? (avgJerk / constraints.maxJerk) * 100 : 0;

    // Path smoothness score (lower jerk = smoother path)
    const smoothnessScore = Math.max(0, 100 - (avgJerk / constraints.maxJerk) * 50);

    // Constraint compliance
    const velocityViolations = velocities.filter(v => v > constraints.maxVelocity).length;
    const accelerationViolations = accelerations.filter(a => a > constraints.maxAcceleration).length;
    const jerkViolations = jerks.filter(j => j > constraints.maxJerk).length;

    return {
      totalDistance,
      totalTime,
      avgVelocity,
      maxVelocity,
      maxAcceleration,
      avgAcceleration,
      maxJerk,
      avgJerk,
      maxCurvature,
      avgCurvature,
      velocityEfficiency,
      accelerationEfficiency,
      jerkEfficiency,
      smoothnessScore,
      velocityViolations,
      accelerationViolations,
      jerkViolations,
      totalViolations: violations.length
    };
  }, [trajectory, violations, constraints]);

  // Chart data preparation
  const velocityData = useMemo(() => {
    if (!trajectory) return [];
    return trajectory.map((point, index) => ({
      time: point.time.toFixed(1),
      velocity: point.velocity,
      maxVelocity: constraints.maxVelocity,
      index
    }));
  }, [trajectory, constraints.maxVelocity]);

  const accelerationData = useMemo(() => {
    if (!trajectory) return [];
    return trajectory.map((point, index) => ({
      time: point.time.toFixed(1),
      acceleration: point.acceleration,
      maxAcceleration: constraints.maxAcceleration,
      index
    }));
  }, [trajectory, constraints.maxAcceleration]);

  const efficiencyData = useMemo(() => {
    if (!metrics) return [];
    return [
      { name: 'Velocity', value: metrics.velocityEfficiency, color: '#3b82f6' },
      { name: 'Acceleration', value: metrics.accelerationEfficiency, color: '#10b981' },
      { name: 'Jerk', value: metrics.jerkEfficiency, color: '#f59e0b' }
    ];
  }, [metrics]);

  const violationsData = useMemo(() => {
    if (!metrics) return [];
    return [
      { name: 'Velocity', value: metrics.velocityViolations, color: '#ef4444' },
      { name: 'Acceleration', value: metrics.accelerationViolations, color: '#f97316' },
      { name: 'Jerk', value: metrics.jerkViolations, color: '#eab308' }
    ];
  }, [metrics]);

  if (!metrics) {
    return (
      <div className="text-center py-12 text-gray-400">
        <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No trajectory data available</p>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (score >= 60) return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    return <AlertTriangle className="w-4 h-4 text-red-400" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Advanced Analytics</h3>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <TrendingUp className="w-4 h-4" />
            Distance
          </div>
          <div className="text-white font-semibold text-lg">{metrics.totalDistance.toFixed(2)}m</div>
          <div className="text-gray-400 text-xs">Total path length</div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Clock className="w-4 h-4" />
            Duration
          </div>
          <div className="text-white font-semibold text-lg">{metrics.totalTime.toFixed(1)}s</div>
          <div className="text-gray-400 text-xs">Total time</div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Target className="w-4 h-4" />
            Max Velocity
          </div>
          <div className="text-white font-semibold text-lg">{metrics.maxVelocity.toFixed(2)}m/s</div>
          <div className="text-gray-400 text-xs">Peak speed</div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Gauge className="w-4 h-4" />
            Smoothness
          </div>
          <div className={`font-semibold text-lg ${getScoreColor(metrics.smoothnessScore)}`}>
            {metrics.smoothnessScore.toFixed(0)}%
          </div>
          <div className="flex items-center gap-1 mt-1">
            {getScoreIcon(metrics.smoothnessScore)}
            <span className="text-gray-400 text-xs">Path smoothness</span>
          </div>
        </div>
      </div>

      {/* Efficiency Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-neutral-800 p-4 rounded-lg">
          <h4 className="text-white font-semibold mb-4">Efficiency Metrics</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Velocity Efficiency</span>
              <span className={`font-semibold ${getScoreColor(metrics.velocityEfficiency)}`}>
                {metrics.velocityEfficiency.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Acceleration Efficiency</span>
              <span className={`font-semibold ${getScoreColor(metrics.accelerationEfficiency)}`}>
                {metrics.accelerationEfficiency.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Jerk Efficiency</span>
              <span className={`font-semibold ${getScoreColor(metrics.jerkEfficiency)}`}>
                {metrics.jerkEfficiency.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg">
          <h4 className="text-white font-semibold mb-4">Constraint Violations</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Velocity Violations</span>
              <span className={`font-semibold ${metrics.velocityViolations > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {metrics.velocityViolations}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Acceleration Violations</span>
              <span className={`font-semibold ${metrics.accelerationViolations > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {metrics.accelerationViolations}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Jerk Violations</span>
              <span className={`font-semibold ${metrics.jerkViolations > 0 ? 'text-red-400' : 'text-red-400'}`}>
                {metrics.jerkViolations}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-700 pt-2">
              <span className="text-gray-400 font-medium">Total Violations</span>
              <span className={`font-semibold ${metrics.totalViolations > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {metrics.totalViolations}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Velocity Profile */}
        <div className="bg-neutral-800 p-4 rounded-lg">
          <h4 className="text-white font-semibold mb-4">Velocity Profile</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={velocityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Line
                type="monotone"
                dataKey="velocity"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="maxVelocity"
                stroke="#ef4444"
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Acceleration Profile */}
        <div className="bg-neutral-800 p-4 rounded-lg">
          <h4 className="text-white font-semibold mb-4">Acceleration Profile</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={accelerationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Line
                type="monotone"
                dataKey="acceleration"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="maxAcceleration"
                stroke="#ef4444"
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Efficiency Pie Chart */}
        <div className="bg-neutral-800 p-4 rounded-lg">
          <h4 className="text-white font-semibold mb-4">Efficiency Breakdown</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={efficiencyData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {efficiencyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                formatter={(value) => [`${value.toFixed(1)}%`, 'Efficiency']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Violations Bar Chart */}
        <div className="bg-neutral-800 p-4 rounded-lg">
          <h4 className="text-white font-semibold mb-4">Constraint Violations</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={violationsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Bar dataKey="value" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-neutral-800 p-4 rounded-lg">
        <h4 className="text-white font-semibold mb-4">Performance Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {((metrics.velocityEfficiency + metrics.accelerationEfficiency + metrics.jerkEfficiency) / 3).toFixed(1)}%
            </div>
            <div className="text-gray-400 text-sm">Overall Efficiency</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {metrics.smoothnessScore.toFixed(0)}%
            </div>
            <div className="text-gray-400 text-sm">Path Smoothness</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold mb-1 ${
              metrics.totalViolations === 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {metrics.totalViolations === 0 ? 'PASS' : 'FAIL'}
            </div>
            <div className="text-gray-400 text-sm">Constraint Check</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
