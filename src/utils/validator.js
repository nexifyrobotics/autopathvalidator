
export function validateTrajectory(trajectory, constraints) {
    const violations = [];

    // Track statistics for summary
    const stats = {
        maxVelocityReached: 0,
        maxAccelReached: 0,
        maxJerkReached: 0,
        maxCentripetalReached: 0,
        velocityViolations: [],
        accelViolations: [],
        jerkViolations: [],
        centripetalViolations: []
    };

    trajectory.forEach((point, index) => {
        const t = point.time;

        // Track max values
        stats.maxVelocityReached = Math.max(stats.maxVelocityReached, Math.abs(point.velocity));
        const acc = Math.abs(point.calculatedAccel || point.acceleration);
        stats.maxAccelReached = Math.max(stats.maxAccelReached, acc);
        const jerk = Math.abs(point.calculatedJerk || 0);
        stats.maxJerkReached = Math.max(stats.maxJerkReached, jerk);

        // Velocity Check
        if (Math.abs(point.velocity) > constraints.maxVelocity) {
            stats.velocityViolations.push({ time: t, value: point.velocity, x: point.x, y: point.y });
        }

        // Acceleration Check
        if (acc > constraints.maxAcceleration) {
            stats.accelViolations.push({ time: t, value: acc, x: point.x, y: point.y });
        }

        // Jerk Check
        if (constraints.maxJerk > 0 && jerk > constraints.maxJerk) {
            stats.jerkViolations.push({ time: t, value: jerk, x: point.x, y: point.y });
        }

        // Centripetal Acceleration Check
        if (constraints.maxCentripetal > 0 && Math.abs(point.curvature) > 0.001) {
            const v = point.velocity;
            const centripetal = v * v * Math.abs(point.curvature);
            stats.maxCentripetalReached = Math.max(stats.maxCentripetalReached, centripetal);

            if (centripetal > constraints.maxCentripetal) {
                stats.centripetalViolations.push({ time: t, value: centripetal, x: point.x, y: point.y });
            }
        }
    });

    // Helper function to describe path location
    const describeLocation = (x, y) => {
        // Assume FRC field: 0-16.54m (X), 0-8.21m (Y)
        const xDesc = x < 5.5 ? "start zone" : x > 11 ? "target zone" : "mid-field";
        const yDesc = y < 2.7 ? "bottom" : y > 5.5 ? "top" : "center";
        return `${xDesc} (${yDesc})`;
    };

    // Generate detailed violations
    if (stats.velocityViolations.length > 0) {
        const first = stats.velocityViolations[0];
        const location = describeLocation(first.x, first.y);

        violations.push({
            time: first.time,
            type: "Velocity Limit Exceeded",
            severity: "error",
            count: stats.velocityViolations.length,
            message: `${stats.velocityViolations.length} points exceed velocity limit. Peak: ${stats.maxVelocityReached.toFixed(2)} m/s (limit: ${constraints.maxVelocity} m/s)`,
            location: location,
            suggestion: `Add velocity constraint in PathPlanner for ${location} or increase max velocity to ${Math.ceil(stats.maxVelocityReached * 10) / 10} m/s. Alternative: Create a "velocity override" zone in this region.`
        });
    }

    if (stats.accelViolations.length > 0) {
        const first = stats.accelViolations[0];
        const location = describeLocation(first.x, first.y);

        violations.push({
            time: first.time,
            type: "Acceleration Limit Exceeded",
            severity: "error",
            count: stats.accelViolations.length,
            message: `${stats.accelViolations.length} points exceed acceleration limit. Peak: ${stats.maxAccelReached.toFixed(2)} m/s² (limit: ${constraints.maxAcceleration} m/s²)`,
            location: location,
            suggestion: `Increase path duration for ${location} or add more waypoints. Recommended min acceleration limit: ${Math.ceil(stats.maxAccelReached * 10) / 10} m/s². Use "Rotation Override" in PathPlanner to slow down in this area.`
        });
    }

    if (stats.jerkViolations.length > 0) {
        const first = stats.jerkViolations[0];
        const location = describeLocation(first.x, first.y);

        violations.push({
            time: first.time,
            type: "High Jerk Warning",
            severity: "warning",
            count: stats.jerkViolations.length,
            message: `${stats.jerkViolations.length} points have high jerk. Peak: ${stats.maxJerkReached.toFixed(2)} m/s³ (limit: ${constraints.maxJerk} m/s³)`,
            location: location,
            suggestion: `Sudden acceleration changes detected near ${location}. Enable S-curve acceleration profile in PathPlanner or smooth rotation changes at waypoints. This reduces mechanical stress and slip risk.`
        });
    }

    if (stats.centripetalViolations.length > 0) {
        const first = stats.centripetalViolations[0];
        const location = describeLocation(first.x, first.y);

        violations.push({
            time: first.time,
            type: "Turn Speed Too High (Slip Risk)",
            severity: "error",
            count: stats.centripetalViolations.length,
            message: `${stats.centripetalViolations.length} points exceed lateral acceleration (friction limit). Peak: ${stats.maxCentripetalReached.toFixed(2)} m/s² (limit: ${constraints.maxCentripetal} m/s²)`,
            location: location,
            suggestion: `Widen turn radius at ${location} (space waypoints further apart) or reduce speed to below ${Math.sqrt(constraints.maxCentripetal / Math.max(...stats.centripetalViolations.map(v => Math.abs(trajectory.find(p => p.time === v.time)?.curvature || 0.1)))).toFixed(1)} m/s in this area. Alternative: Check wheel friction coefficient.`
        });
    }

    // Add summary if everything is good
    if (violations.length === 0) {
        violations.push({
            time: 0,
            type: "Path Optimal ✓",
            severity: "success",
            message: `All checks passed! Peak velocity: ${stats.maxVelocityReached.toFixed(2)} m/s, Peak acceleration: ${stats.maxAccelReached.toFixed(2)} m/s²`,
            suggestion: `This path is within robot constraints and ready for deployment. Verify performance in field testing.`
        });
    }

    return violations;
}
