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

// Game-aware export with full metadata
export function exportToPathPlannerWithGameContext(trajectoryData, gameConfig, constraints) {
    const waypoints = [];
    const totalPoints = trajectoryData.length;

    // Sample waypoints (every Nth point or significant direction changes)
    const sampleRate = Math.max(1, Math.floor(totalPoints / 20)); // ~20 waypoints max

    for (let i = 0; i < totalPoints; i += sampleRate) {
        const point = trajectoryData[i];
        waypoints.push({
            x: point.x || 0,
            y: point.y || 0,
            heading: (point.rotation || 0) * 180 / Math.PI,
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
        version: gameConfig.year === 2026 ? 2.0 : 1.0,
        gameYear: gameConfig.year,
        gameName: gameConfig.name,
        waypoints: waypoints,
        constraints: {
            maxVelocity: constraints.maxVelocity || gameConfig.constraints.maxVelocity,
            maxAcceleration: constraints.maxAcceleration || gameConfig.constraints.maxAcceleration,
            maxJerk: constraints.maxJerk || gameConfig.constraints.maxJerk
        },
        field: {
            width: gameConfig.field.width,
            length: gameConfig.field.length,
            name: gameConfig.field.name
        },
        metadata: {
            exportedFrom: 'Auto Path Validator v2.0.0',
            exportDate: new Date().toISOString(),
            originalPointCount: totalPoints,
            waypointCount: waypoints.length,
            gameSpecific: {
              gameYear: gameConfig.year,
              gameName: gameConfig.name,
              scoringMechanics: gameConfig.scoringMechanics
            }
        }
    };

    const blob = new Blob([JSON.stringify(pathPlannerData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const gameTag = gameConfig.year === 2026 ? 'rebuilt' : 'reefscape';
    a.download = `pathplanner-${gameTag}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

