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

export function RouteAnalyzer({ trajectory = [], violations = [] }) {
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

    // Analyze path for stability issues
    const stabilityIssues = useMemo(() => {
        if (!trajectory || trajectory.length < 2) return [];
        
        const issues = [];
        const _ROBOT_WIDTH = 0.8; // meters - adjust based on your robot dimensions
        const _CENTER_OF_GRAVITY_HEIGHT = 0.3; // meters - adjust based on your robot
        const _TRACK_WIDTH = 0.7; // meters - distance between left and right wheels
        const _G = 9.81; // m/s²
        
        for (let i = 1; i < trajectory.length - 1; i++) {
            const prev = trajectory[i-1];
            const curr = trajectory[i];
            const next = trajectory[i+1];
            
            // Calculate turning radius (simplified)
            const dx1 = curr.x - prev.x;
            const dy1 = curr.y - prev.y;
            const dx2 = next.x - curr.x;
            const dy2 = next.y - curr.y;
            
            const angle1 = Math.atan2(dy1, dx1);
            const angle2 = Math.atan2(dy2, dx2);
            let angleDiff = angle2 - angle1;
            
            // Normalize angle difference to [-π, π]
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            
            // Skip if going straight
            if (Math.abs(angleDiff) < 0.01) continue;
            
            // Calculate centripetal acceleration
            const velocity = curr.velocity || 0.1; // Avoid division by zero
            const radius = Math.abs(velocity / angleDiff);
            const centripetalAcc = (velocity * velocity) / Math.max(radius, 0.1);
            
            // Calculate stability factor (simplified)
            const stabilityFactor = (_TRACK_WIDTH * 0.5 * _G) / (_CENTER_OF_GRAVITY_HEIGHT * centripetalAcc);
            
            if (stabilityFactor < 1.5) { // Threshold for stability warning
                issues.push({
                    x: curr.x,
                    y: curr.y,
                    time: curr.time || 0,
                    severity: stabilityFactor < 1.0 ? 'high' : 'medium',
                    message: `Stability risk (factor: ${stabilityFactor.toFixed(2)})`,
                    suggestion: stabilityFactor < 1.0 ? 
                        'High tip risk! Reduce speed or widen turn radius.' :
                        'Moderate tip risk. Consider reducing speed in this turn.'
                });
            }
        }
        
        return issues;
    }, [trajectory]);

    // Find the first critical point (either violation or stability issue)
    const firstCriticalPoint = useMemo(() => {
        // Check stability issues first
        if (stabilityIssues.length > 0) {
            const criticalStabilityIssue = stabilityIssues.find(issue => issue.severity === 'high');
            if (criticalStabilityIssue) return criticalStabilityIssue;
            return stabilityIssues[0];
        }
        
        // Fall back to constraint violations
        if (violations && violations.length > 0) {
            return violations.reduce((earliest, current) => {
                return (!earliest || (current.time < earliest.time)) ? current : earliest;
            });
        }
        
        return null;
    }, [violations, stabilityIssues]);

    // Generate suggestions based on the violations and stability analysis
    const suggestions = useMemo(() => {
        const suggestionsList = [];
        
        // Add stability issues first (top 3 high severity)
        stabilityIssues.slice(0, 3).forEach((issue) => {
            if (issue.severity === 'high') {
                suggestionsList.push({
                    icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
                    text: issue.suggestion,
                    severity: "high",
                    location: `Near (${issue.x?.toFixed(1) || '?'}, ${issue.y?.toFixed(1) || '?'})`
                });
            }
        });
        
        // Add constraint violations if we don't have too many suggestions yet
        if (suggestionsList.length < 3) {
            if (groupedViolations['Velocity Constraint']) {
                suggestionsList.push({
                    icon: <Gauge className="w-4 h-4 text-yellow-500" />,
                    text: "Velocity exceeds maximum limit. Consider reducing speed in turns.",
                    severity: "high"
                });
            }
            
            if (groupedViolations['Acceleration Constraint']) {
                suggestionsList.push({
                    icon: <Move3D className="w-4 h-4 text-yellow-500" />,
                    text: "High acceleration detected. Smooth out speed changes to prevent wheel slip.",
                    severity: "high"
                });
            }
            
            if (groupedViolations['Jerk Constraint']) {
                suggestionsList.push({
                    icon: <RotateCcw className="w-4 h-4 text-yellow-500" />,
                    text: "High jerk detected. This can cause mechanical stress and instability.",
                    severity: "medium"
                });
            }
            
            if (groupedViolations['Centripetal Force Constraint']) {
                suggestionsList.push({
                    icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
                    text: "High lateral forces in turns. Consider a wider turning radius.",
                    severity: "high"
                });
            }
        }
        
        // Add general optimization suggestions if no critical issues
        if (suggestionsList.length === 0 && trajectory && trajectory.length > 0) {
            suggestionsList.push(
                {
                    icon: <Lightbulb className="w-4 h-4 text-blue-400" />,
                    text: "Route looks stable! Consider optimizing for time by increasing speed in straight sections.",
                    severity: "low"
                },
                {
                    icon: <ArrowDownToLine className="w-4 h-4 text-blue-400" />,
                    text: "For better stability, ensure weight is distributed low in the robot's chassis.",
                    severity: "info"
                }
            );
        }
        
        return suggestionsList;
    }, [groupedViolations, trajectory, stabilityIssues]);

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
            </div>
            
            {/* Suggestions */}
            {suggestions.length > 0 && (
                <div className="bg-neutral-800 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-3">Suggestions</h3>
                    <div className="space-y-2">
                        {suggestions.map((suggestion, index) => {
                            const bgColor = {
                                'high': 'bg-red-900/20 hover:bg-red-900/30',
                                'medium': 'bg-yellow-900/20 hover:bg-yellow-900/30',
                                'low': 'bg-blue-900/20 hover:bg-blue-900/30',
                                'info': 'bg-gray-800/50 hover:bg-gray-700/50'
                            }[suggestion.severity] || 'bg-neutral-800/50';
                            
                            return (
                                <div 
                                    key={index} 
                                    className={`flex items-start p-3 rounded transition-colors ${bgColor}`}
                                >
                                    <div className="mr-3 mt-0.5">
                                        {suggestion.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-200">{suggestion.text}</p>
                                        {suggestion.location && (
                                            <p className="text-xs text-gray-400 mt-1">Location: {suggestion.location}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            
            {/* Violation Details */}
            {Object.keys(groupedViolations).length > 0 && (
                <div className="bg-neutral-800 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-3">Issues Detected</h3>
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
                                        {typeViolations.length} occurrence{typeViolations.length > 1 ? 's' : ''} ·
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

