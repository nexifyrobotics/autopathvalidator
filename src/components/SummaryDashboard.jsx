import React from 'react';
import { TrendingUp, Clock, Gauge, AlertCircle, CheckCircle, Zap, Route } from 'lucide-react';

export function SummaryDashboard({ trajectoryData, violations, constraints }) {
    if (!trajectoryData || trajectoryData.length === 0) {
        return null;
    }

    // Calculate statistics
    const totalTime = trajectoryData.length > 0 
        ? (trajectoryData[trajectoryData.length - 1].time || 0) - (trajectoryData[0].time || 0)
        : 0;
    
    let totalDistance = 0;
    let maxVelocity = 0;
    let maxAccel = 0;
    let avgVelocity = 0;
    
    trajectoryData.forEach((point, i) => {
        if (i > 0) {
            const dx = (point.x || 0) - (trajectoryData[i - 1].x || 0);
            const dy = (point.y || 0) - (trajectoryData[i - 1].y || 0);
            totalDistance += Math.hypot(dx, dy);
        }
        maxVelocity = Math.max(maxVelocity, Math.abs(point.velocity || 0));
        maxAccel = Math.max(maxAccel, Math.abs(point.calculatedAccel || point.acceleration || 0));
        avgVelocity += Math.abs(point.velocity || 0);
    });
    avgVelocity = trajectoryData.length > 0 ? avgVelocity / trajectoryData.length : 0;

    // Calculate performance score (0-100)
    // Only count actual violations, not success messages
    const actualViolations = violations.filter(v => v.severity !== 'success');
    const errorCount = actualViolations.filter(v => v.severity === 'error').length;
    const warningCount = actualViolations.filter(v => v.severity === 'warning').length;
    const hasSuccess = violations.some(v => v.severity === 'success' && actualViolations.length === 0);
    
    let score = 100;
    if (hasSuccess && actualViolations.length === 0) {
        // Perfect path - no violations
        score = 100;
    } else {
        score -= errorCount * 15; // Each error costs 15 points
        score -= warningCount * 5; // Each warning costs 5 points
    }
    score = Math.max(0, Math.min(100, score));

    // Calculate efficiency
    const startPoint = trajectoryData[0];
    const endPoint = trajectoryData[trajectoryData.length - 1];
    const straightLineDist = Math.hypot(
        (endPoint.x || 0) - (startPoint.x || 0),
        (endPoint.y || 0) - (startPoint.y || 0)
    );
    const efficiency = totalDistance > 0 ? (straightLineDist / totalDistance) * 100 : 0;

    // Energy estimate
    let energyEstimate = 0;
    trajectoryData.forEach((point, i) => {
        if (i > 0) {
            const dt = Math.max(0.001, (point.time || 0) - (trajectoryData[i - 1].time || 0));
            const v = Math.abs(point.velocity || 0);
            const a = Math.abs(point.calculatedAccel || point.acceleration || 0);
            energyEstimate += (v * v + a * a) * dt;
        }
    });

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-green-900/30 border-green-500';
        if (score >= 60) return 'bg-yellow-900/30 border-yellow-500';
        return 'bg-red-900/30 border-red-500';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Performance Score */}
            <div className={`bg-neutral-800 p-4 rounded-lg border-2 ${getScoreBg(score)}`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        <span className="text-gray-400 text-sm">Performance Score</span>
                    </div>
                    <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                        {score.toFixed(0)}
                    </span>
                </div>
                <div className="w-full bg-neutral-900 rounded-full h-2 mt-2">
                    <div 
                        className={`h-2 rounded-full transition-all ${
                            score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${score}%` }}
                    />
                </div>
            </div>

            {/* Path Statistics */}
            <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
                <div className="flex items-center gap-2 mb-3">
                    <Route className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-400 text-sm font-semibold">Path Stats</span>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Distance:</span>
                        <span className="text-white font-mono">{totalDistance.toFixed(2)} m</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Time:</span>
                        <span className="text-white font-mono">{totalTime.toFixed(2)} s</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Efficiency:</span>
                        <span className="text-white font-mono">{efficiency.toFixed(1)}%</span>
                    </div>
                </div>
            </div>

            {/* Velocity Stats */}
            <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
                <div className="flex items-center gap-2 mb-3">
                    <Gauge className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-400 text-sm font-semibold">Velocity</span>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Max:</span>
                        <span className={`font-mono ${maxVelocity > constraints.maxVelocity ? 'text-red-400' : 'text-white'}`}>
                            {maxVelocity.toFixed(2)} m/s
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Avg:</span>
                        <span className="text-white font-mono">{avgVelocity.toFixed(2)} m/s</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Limit:</span>
                        <span className="text-gray-400 font-mono">{constraints.maxVelocity} m/s</span>
                    </div>
                </div>
            </div>

            {/* Violations Summary */}
            <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
                <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-400 text-sm font-semibold">Issues</span>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <span className="text-gray-500">Errors:</span>
                        </div>
                        <span className="text-red-400 font-bold">{errorCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-400" />
                            <span className="text-gray-500">Warnings:</span>
                        </div>
                        <span className="text-yellow-400 font-bold">{warningCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-gray-500">Status:</span>
                        </div>
                        <span className={errorCount === 0 && warningCount === 0 ? 'text-green-400 font-bold' : 'text-gray-400'}>
                            {errorCount === 0 && warningCount === 0 ? 'Ready' : 'Needs Fix'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Energy Estimate */}
            <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700 md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-400 text-sm font-semibold">Energy Estimate</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-yellow-400">
                        {(energyEstimate / 1000).toFixed(2)}
                    </span>
                    <span className="text-gray-500 text-sm">kWh (estimated)</span>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                    Based on velocity² and acceleration² integration over time
                </p>
            </div>
        </div>
    );
}

