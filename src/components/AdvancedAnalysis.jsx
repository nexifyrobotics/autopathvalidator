import React from 'react';
import { Battery, RotateCw, Target, TrendingDown } from 'lucide-react';

export function AdvancedAnalysis({ trajectoryData, violations, constraints }) {
    if (!trajectoryData || trajectoryData.length === 0) return null;

    // Calculate energy consumption
    let energyEstimate = 0;
    trajectoryData.forEach((point, i) => {
        if (i > 0) {
            const dt = Math.max(0.001, (point.time || 0) - (trajectoryData[i - 1].time || 0));
            const v = Math.abs(point.velocity || 0);
            const a = Math.abs(point.calculatedAccel || point.acceleration || 0);
            energyEstimate += (v * v + a * a) * dt;
        }
    });

    // Calculate rotation profile
    let rotationChanges = [];
    let maxRotationSpeed = 0;
    trajectoryData.forEach((point, i) => {
        if (i > 0) {
            const prevRot = trajectoryData[i - 1].rotation || 0;
            const currRot = point.rotation || 0;
            let dRot = currRot - prevRot;
            // Normalize to [-π, π]
            while (dRot > Math.PI) dRot -= 2 * Math.PI;
            while (dRot < -Math.PI) dRot += 2 * Math.PI;
            rotationChanges.push(Math.abs(dRot));
            
            const dt = Math.max(0.001, (point.time || 0) - (trajectoryData[i - 1].time || 0));
            const rotSpeed = Math.abs(dRot / dt);
            maxRotationSpeed = Math.max(maxRotationSpeed, rotSpeed);
        }
    });
    const avgRotationChange = rotationChanges.length > 0
        ? rotationChanges.reduce((a, b) => a + b, 0) / rotationChanges.length
        : 0;

    // Calculate optimization opportunities
    const errorCount = violations.filter(v => v.severity === 'error').length;
    const warningCount = violations.filter(v => v.severity === 'warning').length;
    const optimizationScore = 100 - (errorCount * 20) - (warningCount * 5);
    
    // Calculate path smoothness
    let velocityVariance = 0;
    let accelVariance = 0;
    if (trajectoryData.length > 1) {
        const velocities = trajectoryData.map(p => Math.abs(p.velocity || 0));
        const accels = trajectoryData.map(p => Math.abs(p.calculatedAccel || p.acceleration || 0));
        
        const avgVel = velocities.reduce((a, b) => a + b, 0) / velocities.length;
        const avgAccel = accels.reduce((a, b) => a + b, 0) / accels.length;
        
        velocityVariance = velocities.reduce((sum, v) => sum + Math.pow(v - avgVel, 2), 0) / velocities.length;
        accelVariance = accels.reduce((sum, a) => sum + Math.pow(a - avgAccel, 2), 0) / accels.length;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Energy Analysis */}
            <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
                <div className="flex items-center gap-2 mb-3">
                    <Battery className="w-5 h-5 text-yellow-400" />
                    <h4 className="text-white font-semibold">Energy Analysis</h4>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Estimated Consumption:</span>
                        <span className="text-yellow-400 font-mono">{(energyEstimate / 1000).toFixed(3)} kWh</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Energy Efficiency:</span>
                        <span className="text-white">
                            {energyEstimate < 1000 ? 'Excellent' : energyEstimate < 2000 ? 'Good' : 'Needs Optimization'}
                        </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-neutral-700">
                        <p className="text-xs text-gray-500">
                            Based on velocity² and acceleration² integration. Lower values indicate more efficient path.
                        </p>
                    </div>
                </div>
            </div>

            {/* Rotation Profile */}
            <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
                <div className="flex items-center gap-2 mb-3">
                    <RotateCw className="w-5 h-5 text-purple-400" />
                    <h4 className="text-white font-semibold">Rotation Profile</h4>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Max Rotation Speed:</span>
                        <span className="text-white font-mono">{(maxRotationSpeed * 180 / Math.PI).toFixed(1)}°/s</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Avg Rotation Change:</span>
                        <span className="text-white font-mono">{(avgRotationChange * 180 / Math.PI).toFixed(1)}°</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-neutral-700">
                        <p className="text-xs text-gray-500">
                            {maxRotationSpeed > 2 ? 'High rotation speeds detected. Consider smoothing rotation changes.' : 'Rotation profile looks smooth.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Optimization Score */}
            <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
                <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-green-400" />
                    <h4 className="text-white font-semibold">Optimization Score</h4>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-neutral-900 rounded-full h-3">
                            <div 
                                className={`h-3 rounded-full transition-all ${
                                    optimizationScore >= 80 ? 'bg-green-500' : 
                                    optimizationScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.max(0, Math.min(100, optimizationScore))}%` }}
                            />
                        </div>
                        <span className={`text-lg font-bold ${
                            optimizationScore >= 80 ? 'text-green-400' : 
                            optimizationScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                            {optimizationScore.toFixed(0)}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400">
                        {optimizationScore >= 80 
                            ? 'Path is well optimized!' 
                            : optimizationScore >= 60 
                            ? 'Some improvements possible' 
                            : 'Significant optimization needed'}
                    </p>
                </div>
            </div>

            {/* Smoothness Analysis */}
            <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="w-5 h-5 text-blue-400" />
                    <h4 className="text-white font-semibold">Smoothness Analysis</h4>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Velocity Variance:</span>
                        <span className={`font-mono ${
                            velocityVariance < 0.1 ? 'text-green-400' : 
                            velocityVariance < 0.3 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                            {velocityVariance.toFixed(3)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Acceleration Variance:</span>
                        <span className={`font-mono ${
                            accelVariance < 0.5 ? 'text-green-400' : 
                            accelVariance < 1.0 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                            {accelVariance.toFixed(3)}
                        </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-neutral-700">
                        <p className="text-xs text-gray-500">
                            Lower variance indicates smoother motion profiles. Consider enabling S-curve acceleration.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

