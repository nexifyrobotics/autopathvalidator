// Export to PathPlanner format

export function exportToPathPlanner(trajectoryData, constraints) {
    // PathPlanner expects waypoints with specific format
    // We'll extract key waypoints from the trajectory
    
    const waypoints = [];
    const totalPoints = trajectoryData.length;
    
    // Sample waypoints (every Nth point or significant direction changes)
    const sampleRate = Math.max(1, Math.floor(totalPoints / 20)); // ~20 waypoints max
    
    for (let i = 0; i < totalPoints; i += sampleRate) {
        const point = trajectoryData[i];
        waypoints.push({
            x: point.x || 0,
            y: point.y || 0,
            heading: (point.rotation || 0) * 180 / Math.PI, // Convert to degrees
            velocityOverride: point.velocity || 0
        });
    }
    
    // Add last point
    if (totalPoints > 0) {
        const lastPoint = trajectoryData[totalPoints - 1];
        waypoints.push({
            x: lastPoint.x || 0,
            y: lastPoint.y || 0,
            heading: (lastPoint.rotation || 0) * 180 / Math.PI,
            velocityOverride: lastPoint.velocity || 0
        });
    }
    
    const pathPlannerData = {
        waypoints: waypoints,
        constraints: {
            maxVelocity: constraints.maxVelocity,
            maxAcceleration: constraints.maxAcceleration,
            maxJerk: constraints.maxJerk
        },
        metadata: {
            exportedFrom: 'Auto Path Validator',
            exportDate: new Date().toISOString(),
            originalPointCount: totalPoints,
            waypointCount: waypoints.length
        }
    };
    
    const blob = new Blob([JSON.stringify(pathPlannerData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pathplanner-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

