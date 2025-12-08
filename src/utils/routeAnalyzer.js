/**
 * Route Analyzer Utility
 * Analyzes uploaded robot routes to detect problems/anomalies and provide suggestions
 */

/**
 * Analyzes a route to detect problems and returns starting point with suggestions
 * @param {Array} trajectoryData - The trajectory waypoints
 * @param {Object} constraints - The movement constraints
 * @returns {Object} - { problemStartIndex, problemStartPoint, severity, issues, suggestions }
 */
export function analyzeRouteForProblems(trajectoryData, constraints) {
    if (!trajectoryData || trajectoryData.length < 2) {
        return {
            problemStartIndex: -1,
            problemStartPoint: null,
            severity: 'none',
            issues: [],
            suggestions: []
        };
    }

    const issues = [];
    const problematicPoints = [];

    // Check each point for potential problems
    trajectoryData.forEach((point, index) => {
        const pointIssues = detectPointProblems(point, index, trajectoryData, constraints);
        if (pointIssues.length > 0) {
            problematicPoints.push({
                index,
                point,
                issues: pointIssues
            });
            issues.push(...pointIssues);
        }
    });

    // Find the first problem point
    if (problematicPoints.length === 0) {
        return {
            problemStartIndex: -1,
            problemStartPoint: null,
            severity: 'none',
            issues: [],
            suggestions: generateGeneralSuggestions(trajectoryData, constraints)
        };
    }

    const firstProblem = problematicPoints[0];
    const suggestions = generateSuggestions(
        firstProblem.point,
        firstProblem.index,
        trajectoryData,
        firstProblem.issues
    );

    return {
        problemStartIndex: firstProblem.index,
        problemStartPoint: firstProblem.point,
        severity: calculateSeverity(firstProblem.issues),
        issues: firstProblem.issues,
        suggestions
    };
}

/**
 * Detects specific problems at a trajectory point
 */
function detectPointProblems(point, index, trajectoryData, constraints) {
    const issues = [];

    // Check velocity constraints
    if (point.velocity !== undefined && point.velocity > constraints.maxVelocity * 1.05) {
        issues.push({
            type: 'velocity_violation',
            name: 'Excessive Velocity',
            value: point.velocity,
            limit: constraints.maxVelocity,
            severity: 'error'
        });
    }

    // Check acceleration constraints
    const accel = Math.abs(point.calculatedAccel || point.acceleration || 0);
    if (accel > constraints.maxAcceleration * 1.05) {
        issues.push({
            type: 'acceleration_violation',
            name: 'Excessive Acceleration',
            value: accel,
            limit: constraints.maxAcceleration,
            severity: 'error'
        });
    }

    // Check jerk constraints
    const jerk = Math.abs(point.calculatedJerk || 0);
    if (jerk > constraints.maxJerk * 1.05) {
        issues.push({
            type: 'jerk_violation',
            name: 'Excessive Jerk',
            value: jerk,
            limit: constraints.maxJerk,
            severity: 'warning'
        });
    }

    // Check for centripetal acceleration (turn sharpness)
    if (point.curvature !== undefined && point.velocity !== undefined) {
        const centripetalAccel = point.velocity * point.velocity * Math.abs(point.curvature);
        if (centripetalAccel > constraints.maxCentripetal * 1.05) {
            issues.push({
                type: 'sharp_turn',
                name: 'Sharp Turn Detected',
                value: centripetalAccel,
                limit: constraints.maxCentripetal,
                curvature: point.curvature,
                severity: 'warning'
            });
        }
    }

    // Check for sudden velocity changes (jerky movement)
    if (index > 0) {
        const prevVelocity = trajectoryData[index - 1].velocity || 0;
        const currVelocity = point.velocity || 0;
        const velocityChange = Math.abs(currVelocity - prevVelocity);
        const timeDelta = (point.time || 0) - (trajectoryData[index - 1].time || 0);
        
        if (timeDelta > 0 && velocityChange / timeDelta > 2.0) {
            issues.push({
                type: 'jerky_movement',
                name: 'Jerky Movement Pattern',
                severity: 'warning',
                velocityChange
            });
        }
    }

    // Check for unrealistic position jumps
    if (index > 0) {
        const dx = (point.x || 0) - (trajectoryData[index - 1].x || 0);
        const dy = (point.y || 0) - (trajectoryData[index - 1].y || 0);
        const distance = Math.hypot(dx, dy);
        const timeDelta = (point.time || 0) - (trajectoryData[index - 1].time || 0);
        
        if (timeDelta > 0 && distance / timeDelta > 10) { // Unrealistic speed
            issues.push({
                type: 'unrealistic_movement',
                name: 'Unrealistic Position Jump',
                severity: 'error',
                distance,
                timeDelta
            });
        }
    }

    // Check for path efficiency issues
    if (index > 1) {
        const p1 = trajectoryData[index - 2];
        const p2 = trajectoryData[index - 1];
        const p3 = point;

        const dx1 = (p2.x || 0) - (p1.x || 0);
        const dy1 = (p2.y || 0) - (p1.y || 0);
        const dx2 = (p3.x || 0) - (p2.x || 0);
        const dy2 = (p3.y || 0) - (p2.y || 0);

        const angle = calculateAngleBetweenVectors(dx1, dy1, dx2, dy2);
        if (Math.abs(angle) > 120) { // Sharp angle change
            issues.push({
                type: 'sharp_direction_change',
                name: 'Sharp Direction Change',
                severity: 'warning',
                angle: Math.abs(angle)
            });
        }
    }

    return issues;
}

/**
 * Generates suggestions based on detected issues
 */
function generateSuggestions(point, index, trajectoryData, issues) {
    const suggestions = [];

    issues.forEach(issue => {
        switch (issue.type) {
            case 'velocity_violation':
                suggestions.push({
                    title: 'Reduce Velocity',
                    description: `The velocity at this point (${issue.value.toFixed(2)} m/s) exceeds the maximum (${issue.limit.toFixed(2)} m/s).`,
                    actions: [
                        `Reduce the target velocity to ${(issue.limit * 0.95).toFixed(2)} m/s or less`,
                        'Extend the trajectory over a longer distance to allow for smoother acceleration',
                        'Check if the path waypoints are too close together'
                    ]
                });
                break;

            case 'acceleration_violation':
                suggestions.push({
                    title: 'Reduce Acceleration',
                    description: `The acceleration (${issue.value.toFixed(2)} m/s²) exceeds the maximum (${issue.limit.toFixed(2)} m/s²).`,
                    actions: [
                        `Reduce the target acceleration to ${(issue.limit * 0.95).toFixed(2)} m/s² or less`,
                        'Extend the time interval for acceleration changes',
                        'Use a more gradual ramp profile for speed changes'
                    ]
                });
                break;

            case 'jerk_violation':
                suggestions.push({
                    title: 'Smooth Acceleration Changes',
                    description: `The jerk (${issue.value.toFixed(2)} m/s³) exceeds the maximum (${issue.limit.toFixed(2)} m/s³).`,
                    actions: [
                        'Add more intermediate waypoints to smooth out acceleration transitions',
                        'Increase the time interval between trajectory points',
                        'Use a smoother trajectory generation algorithm'
                    ]
                });
                break;

            case 'sharp_turn':
                suggestions.push({
                    title: 'Adjust Turn Sharpness',
                    description: `The centripetal acceleration at this turn (${issue.value.toFixed(2)} m/s²) exceeds the limit (${issue.limit.toFixed(2)} m/s²).`,
                    actions: [
                        'Reduce the velocity through the turn',
                        'Increase the turning radius in your path planning',
                        `Reduce the curvature from ${issue.curvature.toFixed(3)} to a smaller value`,
                        'Add more waypoints around the turn for a gentler curve'
                    ]
                });
                break;

            case 'jerky_movement':
                suggestions.push({
                    title: 'Smooth Out Velocity Changes',
                    description: 'The velocity is changing too abruptly at this point.',
                    actions: [
                        'Add more intermediate waypoints to gradual velocity transitions',
                        'Reduce the acceleration limits',
                        'Ensure the trajectory generator uses proper ramping'
                    ]
                });
                break;

            case 'unrealistic_movement':
                suggestions.push({
                    title: 'Fix Position Discontinuity',
                    description: 'There is an unrealistic jump in the robot position.',
                    actions: [
                        'Check the input trajectory file for data corruption',
                        're-generate the path with your path planning tool',
                        'Verify the coordinate system matches your field setup'
                    ]
                });
                break;

            case 'sharp_direction_change':
                suggestions.push({
                    title: 'Soften Direction Change',
                    description: `The path direction changes sharply (${issue.angle.toFixed(1)}°) at this point.`,
                    actions: [
                        'Create a smoother curve in the path planning',
                        'Add more waypoints to transition more gradually',
                        'Reduce the robot speed through this section',
                        'Review the waypoint placement to avoid sharp angles'
                    ]
                });
                break;
        }
    });

    return suggestions;
}

/**
 * Generates general improvement suggestions when no problems are found
 */
function generateGeneralSuggestions(trajectoryData, constraints) {
    const suggestions = [];

    // Analyze path efficiency
    const stats = calculatePathStatistics(trajectoryData);
    
    if (stats.pathEfficiency < 0.7) {
        suggestions.push({
            title: 'Optimize Path Efficiency',
            description: `Your path takes a rather indirect route (${(stats.pathEfficiency * 100).toFixed(1)}% efficiency).`,
            actions: [
                'Consider placing waypoints more directly toward your target',
                'Minimize unnecessary detours',
                'Review if obstacles are causing the inefficient path'
            ]
        });
    }

    if (stats.avgVelocity < constraints.maxVelocity * 0.5) {
        suggestions.push({
            title: 'Consider Increasing Speed',
            description: 'The average velocity is well below the maximum constraint.',
            actions: [
                'If the path allows, increase target velocity for faster execution',
                'Check if velocity constraints are set appropriately for your robot'
            ]
        });
    }

    if (stats.maxCurvature > 0.5) {
        suggestions.push({
            title: 'Smooth Out Curves',
            description: 'The path contains several curved sections.',
            actions: [
                'Use a spline-based path generator for smoother curves',
                'Add more waypoints to transitions to reduce required curvature',
                'Consider the turning radius of your robot'
            ]
        });
    }

    if (stats.maxAcceleration > constraints.maxAcceleration * 0.8) {
        suggestions.push({
            title: 'Consider Smoother Acceleration Profile',
            description: 'The path uses acceleration at high percentages of the limit.',
            actions: [
                'Add more time for acceleration transitions',
                'Check if smoother ramping could work for your use case',
                'Review constraint settings'
            ]
        });
    }

    return suggestions;
}

/**
 * Calculate angle between two vectors
 */
function calculateAngleBetweenVectors(dx1, dy1, dx2, dy2) {
    const dot = dx1 * dx2 + dy1 * dy2;
    const cross = dx1 * dy2 - dy1 * dx2;
    const angle = Math.atan2(cross, dot) * (180 / Math.PI);
    return angle;
}

/**
 * Calculate overall path statistics
 */
function calculatePathStatistics(trajectoryData) {
    const stats = {
        totalDistance: 0,
        straightLineDistance: 0,
        pathEfficiency: 1,
        avgVelocity: 0,
        maxVelocity: 0,
        maxAcceleration: 0,
        maxCurvature: 0
    };

    if (trajectoryData.length < 2) return stats;

    // Calculate total distance and straight line distance
    const start = trajectoryData[0];
    const end = trajectoryData[trajectoryData.length - 1];
    stats.straightLineDistance = Math.hypot(
        (end.x || 0) - (start.x || 0),
        (end.y || 0) - (start.y || 0)
    );

    let totalVelocity = 0;
    for (let i = 1; i < trajectoryData.length; i++) {
        const dx = (trajectoryData[i].x || 0) - (trajectoryData[i - 1].x || 0);
        const dy = (trajectoryData[i].y || 0) - (trajectoryData[i - 1].y || 0);
        const dist = Math.hypot(dx, dy);
        stats.totalDistance += dist;

        const vel = trajectoryData[i].velocity || 0;
        stats.maxVelocity = Math.max(stats.maxVelocity, vel);
        totalVelocity += vel;

        const accel = Math.abs(trajectoryData[i].calculatedAccel || trajectoryData[i].acceleration || 0);
        stats.maxAcceleration = Math.max(stats.maxAcceleration, accel);

        const curv = Math.abs(trajectoryData[i].curvature || 0);
        stats.maxCurvature = Math.max(stats.maxCurvature, curv);
    }

    stats.avgVelocity = totalVelocity / trajectoryData.length;
    stats.pathEfficiency = stats.straightLineDistance > 0 
        ? stats.straightLineDistance / stats.totalDistance 
        : 1;

    return stats;
}

/**
 * Calculate severity level based on issues
 */
function calculateSeverity(issues) {
    if (issues.some(i => i.severity === 'error')) return 'critical';
    if (issues.some(i => i.severity === 'warning')) return 'warning';
    return 'info';
}

/**
 * Prepare analysis data for visualization
 */
export function prepareAnalysisVisualization(analysis, trajectoryData) {
    return {
        problemStartIndex: analysis.problemStartIndex,
        problemStartPoint: analysis.problemStartPoint,
        severity: analysis.severity,
        highlightRange: {
            start: Math.max(0, analysis.problemStartIndex - 5),
            end: Math.min(trajectoryData.length - 1, analysis.problemStartIndex + 10)
        },
        issues: analysis.issues,
        suggestions: analysis.suggestions
    };
}
