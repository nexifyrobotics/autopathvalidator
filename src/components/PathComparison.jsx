import React, { useState } from 'react';
import { GitCompare, X } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { parseTrajectory } from '../utils/parser';
import { calculateKinematics } from '../utils/kinematics';
import { validateTrajectory } from '../utils/validator';

export function PathComparison({ constraints }) {
    const [path1, setPath1] = useState(null);
    const [path2, setPath2] = useState(null);
    const [violations1, setViolations1] = useState([]);
    const [violations2, setViolations2] = useState([]);

    const handlePath1Upload = (json, name) => {
        try {
            const rawTrajectory = parseTrajectory(json);
            const enrichedTrajectory = calculateKinematics(rawTrajectory);
            const v = validateTrajectory(enrichedTrajectory, constraints);
            setPath1({ data: enrichedTrajectory, name, violations: v });
            setViolations1(v);
        } catch (err) {
            alert("Error parsing path 1: " + err.message);
        }
    };

    const handlePath2Upload = (json, name) => {
        try {
            const rawTrajectory = parseTrajectory(json);
            const enrichedTrajectory = calculateKinematics(rawTrajectory);
            const v = validateTrajectory(enrichedTrajectory, constraints);
            setPath2({ data: enrichedTrajectory, name, violations: v });
            setViolations2(v);
        } catch (err) {
            alert("Error parsing path 2: " + err.message);
        }
    };

    const calculateStats = (path) => {
        if (!path || !path.data || path.data.length === 0) return null;
        
        const data = path.data;
        const totalTime = data.length > 0 
            ? (data[data.length - 1].time || 0) - (data[0].time || 0)
            : 0;
        
        let totalDistance = 0;
        let maxVelocity = 0;
        let maxAccel = 0;
        
        data.forEach((point, i) => {
            if (i > 0) {
                const dx = (point.x || 0) - (data[i - 1].x || 0);
                const dy = (point.y || 0) - (data[i - 1].y || 0);
                totalDistance += Math.hypot(dx, dy);
            }
            maxVelocity = Math.max(maxVelocity, Math.abs(point.velocity || 0));
            maxAccel = Math.max(maxAccel, Math.abs(point.calculatedAccel || point.acceleration || 0));
        });

        const errorCount = path.violations.filter(v => v.severity === 'error').length;
        const warningCount = path.violations.filter(v => v.severity === 'warning').length;
        
        let score = 100;
        score -= errorCount * 15;
        score -= warningCount * 5;
        score = Math.max(0, Math.min(100, score));

        return { totalTime, totalDistance, maxVelocity, maxAccel, errorCount, warningCount, score };
    };

    const stats1 = calculateStats(path1);
    const stats2 = calculateStats(path2);

    return (
        <div className="bg-neutral-800 p-6 rounded-lg border border-neutral-700">
            <div className="flex items-center gap-2 mb-4">
                <GitCompare className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-semibold text-lg">Path Comparison</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Path 1 */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-gray-300 font-medium">Path 1</h4>
                        {path1 && (
                            <button
                                onClick={() => { setPath1(null); setViolations1([]); }}
                                className="text-red-400 hover:text-red-300"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    {!path1 ? (
                        <FileUpload onFileUpload={handlePath1Upload} />
                    ) : (
                        <div className="p-3 bg-neutral-900 rounded border border-neutral-700">
                            <p className="text-green-400 text-sm mb-2">✓ {path1.name}</p>
                            {stats1 && (
                                <div className="text-xs text-gray-400 space-y-1">
                                    <div>Time: {stats1.totalTime.toFixed(2)}s</div>
                                    <div>Distance: {stats1.totalDistance.toFixed(2)}m</div>
                                    <div>Score: {stats1.score.toFixed(0)}/100</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Path 2 */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-gray-300 font-medium">Path 2</h4>
                        {path2 && (
                            <button
                                onClick={() => { setPath2(null); setViolations2([]); }}
                                className="text-red-400 hover:text-red-300"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    {!path2 ? (
                        <FileUpload onFileUpload={handlePath2Upload} />
                    ) : (
                        <div className="p-3 bg-neutral-900 rounded border border-neutral-700">
                            <p className="text-green-400 text-sm mb-2">✓ {path2.name}</p>
                            {stats2 && (
                                <div className="text-xs text-gray-400 space-y-1">
                                    <div>Time: {stats2.totalTime.toFixed(2)}s</div>
                                    <div>Distance: {stats2.totalDistance.toFixed(2)}m</div>
                                    <div>Score: {stats2.score.toFixed(0)}/100</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Comparison Table */}
            {stats1 && stats2 && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-700">
                                <th className="text-left py-2 px-3 text-gray-400">Metric</th>
                                <th className="text-center py-2 px-3 text-gray-400">Path 1</th>
                                <th className="text-center py-2 px-3 text-gray-400">Path 2</th>
                                <th className="text-center py-2 px-3 text-gray-400">Winner</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-neutral-700/50">
                                <td className="py-2 px-3 text-gray-300">Time (s)</td>
                                <td className="py-2 px-3 text-center text-white">{stats1.totalTime.toFixed(2)}</td>
                                <td className="py-2 px-3 text-center text-white">{stats2.totalTime.toFixed(2)}</td>
                                <td className="py-2 px-3 text-center">
                                    {stats1.totalTime < stats2.totalTime ? (
                                        <span className="text-green-400">Path 1</span>
                                    ) : (
                                        <span className="text-green-400">Path 2</span>
                                    )}
                                </td>
                            </tr>
                            <tr className="border-b border-neutral-700/50">
                                <td className="py-2 px-3 text-gray-300">Distance (m)</td>
                                <td className="py-2 px-3 text-center text-white">{stats1.totalDistance.toFixed(2)}</td>
                                <td className="py-2 px-3 text-center text-white">{stats2.totalDistance.toFixed(2)}</td>
                                <td className="py-2 px-3 text-center">
                                    {stats1.totalDistance < stats2.totalDistance ? (
                                        <span className="text-green-400">Path 1</span>
                                    ) : (
                                        <span className="text-green-400">Path 2</span>
                                    )}
                                </td>
                            </tr>
                            <tr className="border-b border-neutral-700/50">
                                <td className="py-2 px-3 text-gray-300">Max Velocity (m/s)</td>
                                <td className="py-2 px-3 text-center text-white">{stats1.maxVelocity.toFixed(2)}</td>
                                <td className="py-2 px-3 text-center text-white">{stats2.maxVelocity.toFixed(2)}</td>
                                <td className="py-2 px-3 text-center text-gray-400">-</td>
                            </tr>
                            <tr className="border-b border-neutral-700/50">
                                <td className="py-2 px-3 text-gray-300">Errors</td>
                                <td className="py-2 px-3 text-center">
                                    <span className={stats1.errorCount > 0 ? 'text-red-400' : 'text-green-400'}>
                                        {stats1.errorCount}
                                    </span>
                                </td>
                                <td className="py-2 px-3 text-center">
                                    <span className={stats2.errorCount > 0 ? 'text-red-400' : 'text-green-400'}>
                                        {stats2.errorCount}
                                    </span>
                                </td>
                                <td className="py-2 px-3 text-center">
                                    {stats1.errorCount < stats2.errorCount ? (
                                        <span className="text-green-400">Path 1</span>
                                    ) : stats2.errorCount < stats1.errorCount ? (
                                        <span className="text-green-400">Path 2</span>
                                    ) : (
                                        <span className="text-gray-400">Tie</span>
                                    )}
                                </td>
                            </tr>
                            <tr className="border-b border-neutral-700/50">
                                <td className="py-2 px-3 text-gray-300">Performance Score</td>
                                <td className="py-2 px-3 text-center text-white font-bold">{stats1.score.toFixed(0)}</td>
                                <td className="py-2 px-3 text-center text-white font-bold">{stats2.score.toFixed(0)}</td>
                                <td className="py-2 px-3 text-center">
                                    {stats1.score > stats2.score ? (
                                        <span className="text-green-400 font-bold">Path 1</span>
                                    ) : stats2.score > stats1.score ? (
                                        <span className="text-green-400 font-bold">Path 2</span>
                                    ) : (
                                        <span className="text-gray-400">Tie</span>
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

