// Path optimization suggestions

export function generateOptimizationSuggestions(trajectory, violations, constraints) {
    const suggestions = [];
    
    // Check for velocity violations
    const velocityViolations = violations.filter(v => v.type === 'Velocity Limit Exceeded');
    if (velocityViolations.length > 0) {
        suggestions.push({
            type: 'velocity',
            priority: 'high',
            title: 'Reduce Velocity in Critical Zones',
            description: `${velocityViolations.length} points exceed velocity limit. Consider adding velocity constraints in PathPlanner.`,
            action: 'Add velocity zones in PathPlanner settings'
        });
    }
    
    // Check for acceleration violations
    const accelViolations = violations.filter(v => v.type === 'Acceleration Limit Exceeded');
    if (accelViolations.length > 0) {
        suggestions.push({
            type: 'acceleration',
            priority: 'high',
            title: 'Smooth Acceleration Profile',
            description: `High acceleration detected. Enable S-curve acceleration or add more waypoints.`,
            action: 'Enable S-curve acceleration in PathPlanner'
        });
    }
    
    // Check for path efficiency
    let totalDistance = 0;
    const startPoint = trajectory[0];
    const endPoint = trajectory[trajectory.length - 1];
    const straightLineDist = Math.hypot(
        (endPoint.x || 0) - (startPoint.x || 0),
        (endPoint.y || 0) - (startPoint.y || 0)
    );
    
    trajectory.forEach((point, i) => {
        if (i > 0) {
            const dx = (point.x || 0) - (trajectory[i - 1].x || 0);
            const dy = (point.y || 0) - (trajectory[i - 1].y || 0);
            totalDistance += Math.hypot(dx, dy);
        }
    });
    
    const efficiency = totalDistance > 0 ? (straightLineDist / totalDistance) * 100 : 0;
    if (efficiency < 70) {
        suggestions.push({
            type: 'efficiency',
            priority: 'medium',
            title: 'Optimize Path Length',
            description: `Path is ${((1 - efficiency / 100) * totalDistance).toFixed(2)}m longer than necessary.`,
            action: 'Remove unnecessary waypoints or simplify path'
        });
    }
    
    // Check for sharp turns
    const sharpTurns = violations.filter(v => v.type === 'Sharp Turn Detected');
    if (sharpTurns.length > 0) {
        suggestions.push({
            type: 'turns',
            priority: 'medium',
            title: 'Widen Turn Radius',
            description: `${sharpTurns.length} sharp turns detected. Consider spacing waypoints further apart.`,
            action: 'Increase waypoint spacing in turn areas'
        });
    }
    
    // Check for jerk
    const jerkViolations = violations.filter(v => v.type === 'High Jerk Warning');
    if (jerkViolations.length > 0) {
        suggestions.push({
            type: 'jerk',
            priority: 'medium',
            title: 'Reduce Jerk',
            description: 'High jerk detected. Add intermediate waypoints or enable S-curve acceleration.',
            action: 'Add waypoints between sharp direction changes'
        });
    }
    
    return suggestions;
}

