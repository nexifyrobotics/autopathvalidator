import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ScatterChart, Scatter } from 'recharts';
import { Filter, ZoomIn, ZoomOut } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-neutral-900 border border-gray-700 p-2 rounded shadow-lg opacity-90">
                <p className="text-gray-200 text-sm">Time: ${Number(label).toFixed(2)}s</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ color: entry.color }} className="text-sm">
                        {`${entry.name}: ${Number(entry.value).toFixed(2)}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export function EnhancedCharts({ data, constraints, violations }) {
    const [filterSeverity, setFilterSeverity] = useState('all');
    const [showViolations, setShowViolations] = useState(true);
    const [chartKey, setChartKey] = useState(0);

    // Force re-render when constraints change
    useEffect(() => {
        setChartKey(prev => prev + 1);
    }, [constraints]);

    const filteredViolations = violations.filter(v => {
        if (filterSeverity === 'all') return true;
        return v.severity === filterSeverity;
    });

    return (
        <div className="space-y-6">
            {/* Filter Controls */}
            <div className="flex items-center gap-4 p-3 bg-neutral-800 rounded-lg border border-neutral-700">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 text-sm">Filter:</span>
                </div>
                <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="bg-neutral-900 border border-gray-700 text-white rounded px-3 py-1 text-sm"
                >
                    <option value="all">All Issues</option>
                    <option value="error">Errors Only</option>
                    <option value="warning">Warnings Only</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-gray-400">
                    <input
                        type="checkbox"
                        checked={showViolations}
                        onChange={(e) => setShowViolations(e.target.checked)}
                        className="rounded"
                    />
                    Show violations on charts
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" key={chartKey}>
                {/* Velocity Chart */}
                <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
                    <h3 className="text-white mb-2 font-semibold">Velocity Profile</h3>
                    <div className="h-64 min-h-[256px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} key={chartKey}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="time" stroke="#888" />
                                <YAxis
                                    stroke="#888"
                                    label={{ value: `Vel (m/s)`, angle: -90, position: 'insideLeft' }}
                                    domain={[0, Math.max(5, constraints.maxVelocity + 0.5)]}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <ReferenceLine y={constraints.maxVelocity} stroke="red" strokeDasharray="3 3" label="Max Vel" />
                                <Line type="monotone" dataKey="velocity" stroke="#8884d8" name="Velocity" dot={false} strokeWidth={2} />
                                {showViolations && filteredViolations.map((v, i) => {
                                    const point = data.find(d => Math.abs(d.time - (v.time || 0)) < 0.02);
                                    if (point && v.severity === 'error') {
                                        return (
                                            <ReferenceLine
                                                key={i}
                                                x={point.time}
                                                stroke="red"
                                                strokeDasharray="2 2"
                                                strokeOpacity={0.5}
                                            />
                                        );
                                    }
                                    return null;
                                })}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Acceleration Chart */}
                <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
                    <h3 className="text-white mb-2 font-semibold">Acceleration Profile</h3>
                    <div className="h-64 min-h-[256px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} key={chartKey}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="time" stroke="#888" />
                                <YAxis
                                    stroke="#888"
                                    label={{ value: `m/s²`, angle: -90, position: 'insideLeft' }}
                                    domain={[-Math.max(4, constraints.maxAcceleration + 1), Math.max(4, constraints.maxAcceleration + 1)]}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <ReferenceLine y={constraints.maxAcceleration} stroke="red" strokeDasharray="3 3" label="Max Acc" />
                                <ReferenceLine y={-constraints.maxAcceleration} stroke="red" strokeDasharray="3 3" />
                                <Line type="monotone" dataKey="calculatedAccel" stroke="#82ca9d" name="Accel" dot={false} strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Jerk Chart */}
                <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
                    <h3 className="text-white mb-2 font-semibold">Jerk Profile</h3>
                    <div className="h-64 min-h-[256px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} key={chartKey}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="time" stroke="#888" />
                                <YAxis
                                    stroke="#888"
                                    label={{ value: `m/s³`, angle: -90, position: 'insideLeft' }}
                                    domain={[-Math.max(20, constraints.maxJerk + 5), Math.max(20, constraints.maxJerk + 5)]}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                {constraints.maxJerk > 0 && (
                                    <ReferenceLine y={constraints.maxJerk} stroke="red" strokeDasharray="3 3" label="Limit" />
                                )}
                                <Line type="monotone" dataKey="calculatedJerk" stroke="#ffc658" name="Jerk" dot={false} strokeWidth={1} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Spatial Path View */}
                <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
                    <h3 className="text-white mb-2 font-semibold">Path (X vs Y)</h3>
                    <div className="h-64 min-h-[256px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis
                                    type="number"
                                    dataKey="x"
                                    name="X"
                                    unit="m"
                                    stroke="#888"
                                    domain={['dataMin - 0.5', 'dataMax + 0.5']}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="y"
                                    name="Y"
                                    unit="m"
                                    stroke="#888"
                                    domain={['dataMin - 0.5', 'dataMax + 0.5']}
                                />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    content={<CustomTooltip />}
                                />
                                <Scatter
                                    name="Path"
                                    data={data}
                                    fill="#8884d8"
                                    line={{ stroke: '#8884d8', strokeWidth: 2 }}
                                    shape="circle"
                                    isAnimationActive={false}
                                />
                                {showViolations && filteredViolations.map((v, i) => {
                                    const p = data.find(d => Math.abs(d.time - (v.time || 0)) < 0.02);
                                    if (p) {
                                        return (
                                            <Scatter
                                                key={i}
                                                data={[p]}
                                                fill={v.severity === 'error' ? 'red' : 'orange'}
                                                shape="cross"
                                                isAnimationActive={false}
                                            />
                                        );
                                    }
                                    return null;
                                })}
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

