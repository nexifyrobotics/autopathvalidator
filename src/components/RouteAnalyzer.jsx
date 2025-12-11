import React, { useMemo } from 'react';
import { AlertTriangle, Info, Lightbulb, Move3D, Gauge, RotateCcw, ArrowDownToLine } from 'lucide-react';

// Map violation types to their corresponding constraint names
const VIOLATION_TYPE_MAP = {
    'Velocity Constraint': 'maxVelocity',
    'Acceleration Constraint': 'maxAcceleration',
    'Jerk Constraint': 'maxJerk',
    'Centripetal Force Constraint': 'maxCentripetal'
};

// Helper function to calculate path length
function calculatePathLength(points) {
    if (!points || points.length < 2) return 0;

    let length = 0;
    for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i-1].x;
        const dy = points[i].y - points[i-1].y;
        length += Math.hypot(dx, dy);
    }
    return length;
}

// Helper component for displaying stats
function StatCard({ title, value, icon, status }) {
    return (
        <div className="bg-neutral-700/30 p-3 rounded">
            <p className="text-xs text-gray-400">{title}</p>
            <div className="flex items-center mt-1">
                {icon && <span className="mr-1">{icon}</span>}
                <span className={`text-lg font-medium ${
                    status === 'error' ? 'text-red-400' :
                    status === 'success' ? 'text-green-400' : 'text-white'
                }`}>
                    {value}
                </span>
            </div>
        </div>
    );
}

export function RouteAnalyzer({ trajectory = [], violations = [], constraints = {} }) {
    // Group violations by type for better organization
    const groupedViolations = useMemo(() => {
        const groups = {};
        
        violations.forEach(violation => {
            if (!groups[violation.type]) {
                groups[violation.type] = [];
            }
            groups[violation.type].push(violation);
        });
        
        return groups;
    }, [violations]);

    // Analyze path for optimization opportunities and best practices
    const pathAnalysis = useMemo(() => {
        if (!trajectory || trajectory.length < 2) return { issues: [], stats: {}, optimizations: [] };

        const stats = {
            totalDistance: 0,
            maxSpeed: 0,
            maxAcceleration: 0,
            maxJerk: 0,
            maxCentripetal: 0,
            averageSpeed: 0,
            averageCurvature: 0,
            straightSections: 0,
            turnSections: 0,
            efficiencyScore: 100,
            speedUtilization: 0,
            smoothnessScore: 100
        };

        // Track critical points (only the worst cases)
        const criticalPoints = {
            highestLateralForce: null,
            lowestStabilityFactor: null,
            highestSpeedInTurn: null
        };

        // FRC Robot parameters (typical values)
        const ROBOT_WIDTH = 0.75; // meters - typical FRC robot width
        const CENTER_OF_GRAVITY_HEIGHT = 0.4; // meters - typical CG height for FRC
        const TRACK_WIDTH = 0.6; // meters - typical wheel track width
        const MAX_SAFE_CENTRIPETAL = 2.0; // m/s² - safe lateral acceleration
        const G = 9.81; // m/s²

        let totalSpeed = 0;
        let totalCurvature = 0;
        let straightCount = 0;
        let turnCount = 0;
        let totalAccelVariance = 0;
        let accelCount = 0;

        for (let i = 1; i < trajectory.length; i++) {
            const prev = trajectory[i-1];
            const curr = trajectory[i];

            // Calculate distance and speed stats
            const dx = curr.x - prev.x;
            const dy = curr.y - prev.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            stats.totalDistance += distance;

            const velocity = curr.velocity || 0;
            const accel = Math.abs(curr.calculatedAccel || 0);
            const jerk = Math.abs(curr.calculatedJerk || 0);

            if (velocity > stats.maxSpeed) stats.maxSpeed = velocity;
            if (accel > stats.maxAcceleration) stats.maxAcceleration = accel;
            if (jerk > stats.maxJerk) stats.maxJerk = jerk;

            totalSpeed += velocity;

            // Track acceleration variance for smoothness
            if (accel > 0.01) {
                totalAccelVariance += accel * accel;
                accelCount++;
            }

            // Analyze curvature and turning
            const curvature = Math.abs(curr.curvature || 0);
            totalCurvature += curvature;

            if (curvature > 0.01) {
                // Turning section
                turnCount++;
                const radius = Math.abs(1 / curvature); // curvature = 1/radius
                const centripetalAcc = (velocity * velocity) / radius;

                if (centripetalAcc > stats.maxCentripetal) {
                    stats.maxCentripetal = centripetalAcc;
                }

                // Track only the most critical issues
                if (!criticalPoints.highestLateralForce ||
                    centripetalAcc > criticalPoints.highestLateralForce.value) {
                    criticalPoints.highestLateralForce = {
                        value: centripetalAcc,
                        x: curr.x,
                        y: curr.y,
                        time: curr.time || 0
                    };
                }

                // Check for tipping risk
                const tippingFactor = (TRACK_WIDTH * 0.5 * G) / (CENTER_OF_GRAVITY_HEIGHT * centripetalAcc);
                if (!criticalPoints.lowestStabilityFactor ||
                    tippingFactor < criticalPoints.lowestStabilityFactor.value) {
                    criticalPoints.lowestStabilityFactor = {
                        value: tippingFactor,
                        x: curr.x,
                        y: curr.y,
                        time: curr.time || 0
                    };
                }

                // Track highest speed in sharp turns
                if (curvature > 0.3 && (!criticalPoints.highestSpeedInTurn ||
                    velocity > criticalPoints.highestSpeedInTurn.value)) {
                    criticalPoints.highestSpeedInTurn = {
                        value: velocity,
                        x: curr.x,
                        y: curr.y,
                        time: curr.time || 0,
                        curvature: curvature
                    };
                }

            } else {
                // Straight section
                straightCount++;
            }
        }

        // Calculate averages and final stats
        stats.averageSpeed = totalSpeed / trajectory.length;
        stats.averageCurvature = totalCurvature / trajectory.length;
        stats.straightSections = straightCount;
        stats.turnSections = turnCount;
        stats.speedUtilization = (stats.averageSpeed / constraints.maxVelocity) * 100;

        // Calculate smoothness score based on acceleration variance
        if (accelCount > 0) {
            const avgAccelVariance = totalAccelVariance / accelCount;
            const smoothnessFactor = Math.min(avgAccelVariance / (constraints.maxAcceleration * constraints.maxAcceleration), 1);
            stats.smoothnessScore = Math.max(0, 100 - (smoothnessFactor * 50));
        }

        // Generate optimization recommendations (not issues)
        const optimizations = [];

        // Speed utilization optimization
        if (stats.speedUtilization < 70) {
            const potentialGain = Math.min(85 - stats.speedUtilization, 25);
            optimizations.push({
                type: 'speed_optimization',
                title: 'Increase Speed Utilization',
                description: `Current: ${stats.speedUtilization.toFixed(1)}% of max speed`,
                suggestion: `Can potentially increase average speed by ${potentialGain.toFixed(1)}% by optimizing acceleration/deceleration phases`,
                impact: 'high',
                icon: <Gauge className="w-4 h-4 text-blue-400" />
            });
        }

        // Smoothness optimization
        if (stats.smoothnessScore < 80) {
            optimizations.push({
                type: 'smoothness_optimization',
                title: 'Improve Motion Smoothness',
                description: `Smoothness score: ${stats.smoothnessScore.toFixed(1)}/100`,
                suggestion: 'Consider adjusting acceleration limits or adding more waypoints for smoother transitions',
                impact: 'medium',
                icon: <Move3D className="w-4 h-4 text-green-400" />
            });
        }

        // Critical safety issues (only show the worst one)
        if (criticalPoints.highestLateralForce && criticalPoints.highestLateralForce.value > MAX_SAFE_CENTRIPETAL * 1.2) {
            optimizations.push({
                type: 'safety_critical',
                title: 'Reduce Lateral Forces',
                description: `Max lateral acceleration: ${criticalPoints.highestLateralForce.value.toFixed(2)} m/s²`,
                suggestion: 'Reduce speed in turns or increase turn radius to prevent traction loss',
                impact: 'critical',
                icon: <AlertTriangle className="w-4 h-4 text-red-500" />
            });
        }

        // Calculate efficiency score (higher is better)
        let efficiencyScore = 100;

        // Reward high speed utilization
        efficiencyScore += Math.min(stats.speedUtilization - 50, 20);

        // Reward smoothness
        efficiencyScore += (stats.smoothnessScore - 50) * 0.3;

        // Penalize for critical safety issues
        if (criticalPoints.highestLateralForce && criticalPoints.highestLateralForce.value > MAX_SAFE_CENTRIPETAL * 1.5) {
            efficiencyScore -= 30;
        }

        // Penalize for constraint violations
        const hasVelocityViolations = Object.keys(groupedViolations).includes('Velocity Constraint');
        const hasAccelViolations = Object.keys(groupedViolations).includes('Acceleration Constraint');

        if (hasVelocityViolations) efficiencyScore -= 15;
        if (hasAccelViolations) efficiencyScore -= 10;

        stats.efficiencyScore = Math.max(0, Math.min(100, efficiencyScore));

        return { issues: [], stats, optimizations, criticalPoints };
    }, [trajectory, constraints, groupedViolations]);

    // Find the first critical point (either path issue or constraint violation)
    const firstCriticalPoint = useMemo(() => {
        // Check path analysis issues first
        if (pathAnalysis.issues.length > 0) {
            const criticalIssue = pathAnalysis.issues.find(issue => issue.severity === 'high');
            if (criticalIssue) return criticalIssue;
            return pathAnalysis.issues[0];
        }

        // Fall back to constraint violations
        if (violations && violations.length > 0) {
            return violations.reduce((earliest, current) => {
                return (!earliest || (current.time < earliest.time)) ? current : earliest;
            });
        }

        return null;
    }, [violations, pathAnalysis.issues]);



    if (!trajectory || trajectory.length === 0) {
        return (
            <div className="p-4 bg-neutral-800 rounded-lg text-center">
                <Info className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-300">Upload a route to analyze it for potential issues and optimizations.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Summary Card */}
            <div className="bg-neutral-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">Route Analysis</h3>
                
                {firstCriticalPoint && (
                    <div className={`mb-4 p-3 rounded-r border-l-4 ${
                        firstCriticalPoint.severity === 'high' ? 'bg-red-900/30 border-red-500' : 'bg-yellow-900/30 border-yellow-500'
                    }`}>
                        <div className="flex items-start">
                            <AlertTriangle className={`w-5 h-5 mt-0.5 mr-2 flex-shrink-0 ${
                                firstCriticalPoint.severity === 'high' ? 'text-red-400' : 'text-yellow-400'
                            }`} />
                            <div>
                                <p className={`font-medium ${
                                    firstCriticalPoint.severity === 'high' ? 'text-red-300' : 'text-yellow-300'
                                }`}>
                                    {firstCriticalPoint.severity === 'high' ? 'Critical ' : ''}
                                    Issue Detected at t={firstCriticalPoint.time?.toFixed(2) || 'N/A'}s
                                </p>
                                <p className="text-gray-100 text-sm">
                                    {firstCriticalPoint.message || firstCriticalPoint.type}
                                </p>
                                {firstCriticalPoint.suggestion && (
                                    <p className="text-gray-300 text-xs mt-1 italic">
                                        Suggestion: {firstCriticalPoint.suggestion}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <StatCard
                        title="Total Waypoints"
                        value={trajectory.length}
                        icon={<span className="text-blue-400">#</span>}
                    />
                    <StatCard
                        title="Max Velocity"
                        value={`${Math.max(...trajectory.map(p => Math.abs(p.velocity || 0))).toFixed(2)} m/s`}
                        status={groupedViolations['Velocity Constraint'] ? 'error' : 'success'}
                    />
                    <StatCard
                        title="Max Acceleration"
                        value={`${Math.max(...trajectory.map(p => Math.abs(p.calculatedAccel || 0))).toFixed(2)} m/s²`}
                        status={groupedViolations['Acceleration Constraint'] ? 'error' : 'success'}
                    />
                    <StatCard
                        title="Path Length"
                        value={`${calculatePathLength(trajectory).toFixed(2)} m`}
                        icon={<span className="text-green-400">↝</span>}
                    />
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-neutral-600">
                    <StatCard
                        title="Efficiency Score"
                        value={`${pathAnalysis.stats.efficiencyScore}/100`}
                        status={pathAnalysis.stats.efficiencyScore > 80 ? 'success' : pathAnalysis.stats.efficiencyScore > 60 ? 'warning' : 'error'}
                    />
                    <StatCard
                        title="Max Lateral Force"
                        value={`${pathAnalysis.stats.maxCentripetal.toFixed(2)} m/s²`}
                        status={pathAnalysis.stats.maxCentripetal > 3.0 ? 'error' : pathAnalysis.stats.maxCentripetal > 2.0 ? 'warning' : 'success'}
                    />
                    <StatCard
                        title="Straight/Turn Ratio"
                        value={`${pathAnalysis.stats.straightSections}/${pathAnalysis.stats.turnSections}`}
                        icon={<span className="text-purple-400">∿</span>}
                    />
                    <StatCard
                        title="Average Speed"
                        value={`${pathAnalysis.stats.averageSpeed.toFixed(2)} m/s`}
                        status={pathAnalysis.stats.averageSpeed > constraints.maxVelocity * 0.8 ? 'success' : 'warning'}
                    />
                </div>
            </div>
            
            {/* Optimization Recommendations */}
            {pathAnalysis.optimizations.length > 0 && (
                <div className="bg-neutral-800 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-3">Optimization Opportunities</h3>
                    <div className="space-y-3">
                        {pathAnalysis.optimizations.map((opt, index) => {
                            const bgColor = {
                                'critical': 'bg-red-900/20 border-red-500',
                                'high': 'bg-blue-900/20 border-blue-500',
                                'medium': 'bg-green-900/20 border-green-500',
                                'low': 'bg-gray-800/50 border-gray-500'
                            }[opt.impact] || 'bg-neutral-800/50 border-neutral-500';

                            const impactColor = {
                                'critical': 'text-red-400',
                                'high': 'text-blue-400',
                                'medium': 'text-green-400',
                                'low': 'text-gray-400'
                            }[opt.impact] || 'text-gray-400';

                            return (
                                <div key={index} className={`p-4 rounded border-l-4 ${bgColor}`}>
                                    <div className="flex items-start">
                                        <div className="mr-3 mt-0.5">
                                            {opt.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-medium text-gray-200">{opt.title}</h4>
                                                <span className={`text-xs px-2 py-1 rounded ${impactColor} bg-current bg-opacity-20`}>
                                                    {opt.impact.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-300 mb-2">{opt.description}</p>
                                            <p className="text-sm text-gray-400 italic">{opt.suggestion}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            
            {/* Path Analysis Issues */}
            {pathAnalysis.issues.length > 0 && (
                <div className="bg-neutral-800 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-3">Path Analysis Issues</h3>
                    <div className="space-y-3">
                        {pathAnalysis.issues.map((issue, index) => (
                            <div key={index} className={`p-3 rounded border-l-4 ${
                                issue.severity === 'high' ? 'bg-red-900/20 border-red-500' :
                                issue.severity === 'medium' ? 'bg-yellow-900/20 border-yellow-500' :
                                'bg-blue-900/20 border-blue-500'
                            }`}>
                                <div className="flex items-start">
                                    <AlertTriangle className={`w-4 h-4 mt-0.5 mr-2 flex-shrink-0 ${
                                        issue.severity === 'high' ? 'text-red-400' :
                                        issue.severity === 'medium' ? 'text-yellow-400' :
                                        'text-blue-400'
                                    }`} />
                                    <div>
                                        <p className="font-medium text-gray-200">{issue.message}</p>
                                        <p className="text-sm text-gray-400">
                                            Location: ({issue.x?.toFixed(1)}, {issue.y?.toFixed(1)}) at t={issue.time?.toFixed(2)}s
                                        </p>
                                        {issue.suggestion && (
                                            <p className="text-sm text-gray-300 mt-1 italic">
                                                Suggestion: {issue.suggestion}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Constraint Violation Details */}
            {Object.keys(groupedViolations).length > 0 && (
                <div className="bg-neutral-800 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-3">Constraint Violations</h3>
                    <div className="space-y-3">
                        {Object.entries(groupedViolations).map(([type, typeViolations]) => {
                            const first = typeViolations[0] || {};
                            const firstTime = typeof first.time === 'number' ? first.time.toFixed(2) : 'N/A';
                            const numericValues = typeViolations
                                .map(v => (typeof v.value === 'number' ? v.value : null))
                                .filter(v => v !== null);
                            const maxValue = numericValues.length > 0
                                ? Math.max(...numericValues).toFixed(2)
                                : 'N/A';

                            return (
                                <div key={type} className="bg-neutral-700/30 p-3 rounded">
                                    <h4 className="font-medium text-red-400">{type}</h4>
                                    <p className="text-sm text-gray-300">
                                        {typeViolations.length} {typeViolations.length > 1 ? 'occurrences' : 'occurrence'} ·
                                        {' '}First at t={firstTime}s ·
                                        {' '}Max value: {maxValue}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
