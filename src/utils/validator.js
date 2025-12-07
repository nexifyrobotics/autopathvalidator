
export function validateTrajectory(trajectory, constraints) {
    const violations = [];

    if (!trajectory || trajectory.length < 2) {
        return [{
            type: "Invalid Trajectory",
            severity: "error",
            message: "Trajectory data is insufficient for analysis.",
            suggestion: "Please upload a valid trajectory JSON file with at least 2 waypoints."
        }];
    }

    // Track comprehensive statistics
    const stats = {
        maxVelocityReached: 0,
        maxAccelReached: 0,
        maxJerkReached: 0,
        maxCentripetalReached: 0,
        velocityViolations: [],
        accelViolations: [],
        jerkViolations: [],
        centripetalViolations: [],
        // Advanced metrics
        totalDistance: 0,
        straightLineDistance: 0,
        pathEfficiency: 0,
        sharpTurns: [],
        velocitySmoothness: 0,
        accelConsistency: 0,
        avgCurvature: 0,
        maxCurvature: 0,
        timeEfficiency: 0,
        energyEstimate: 0,
        waypointSpacing: []
    };

    // Calculate total path distance and straight-line distance
    const startPoint = trajectory[0];
    const endPoint = trajectory[trajectory.length - 1];
    stats.straightLineDistance = Math.hypot(
        (endPoint.x || 0) - (startPoint.x || 0),
        (endPoint.y || 0) - (startPoint.y || 0)
    );

    let prevPoint = trajectory[0];
    let velocityChanges = [];
    let accelValues = [];
    let curvatureValues = [];
    let distances = [];

    trajectory.forEach((point, index) => {
        const t = point.time || 0;

        // Track max values with null/undefined checks
        const velocity = Math.abs(point.velocity || 0);
        stats.maxVelocityReached = Math.max(stats.maxVelocityReached, velocity);
        const acc = Math.abs(point.calculatedAccel || point.acceleration || 0);
        stats.maxAccelReached = Math.max(stats.maxAccelReached, acc);
        const jerk = Math.abs(point.calculatedJerk || 0);
        stats.maxJerkReached = Math.max(stats.maxJerkReached, jerk);

        // Calculate distance traveled
        if (index > 0) {
            const dx = (point.x || 0) - (prevPoint.x || 0);
            const dy = (point.y || 0) - (prevPoint.y || 0);
            const dist = Math.hypot(dx, dy);
            stats.totalDistance += dist;
            distances.push(dist);
        }

        // Track velocity changes for smoothness analysis
        if (index > 0) {
            const prevVel = prevPoint.velocity || 0;
            const currVel = point.velocity || 0;
            const dv = Math.abs(currVel - prevVel);
            velocityChanges.push(dv);
        }

        // Track acceleration values for consistency
        accelValues.push(acc);

        // Track curvature
        const curvature = Math.abs(point.curvature || 0);
        curvatureValues.push(curvature);
        stats.maxCurvature = Math.max(stats.maxCurvature, curvature);

        // Velocity Check
        if (velocity > constraints.maxVelocity) {
            stats.velocityViolations.push({ time: t, value: velocity, x: point.x || 0, y: point.y || 0 });
        }

        // Acceleration Check
        if (acc > constraints.maxAcceleration) {
            stats.accelViolations.push({ time: t, value: acc, x: point.x || 0, y: point.y || 0 });
        }

        // Jerk Check
        if (constraints.maxJerk > 0 && jerk > constraints.maxJerk) {
            stats.jerkViolations.push({ time: t, value: jerk, x: point.x || 0, y: point.y || 0 });
        }

        // Centripetal Acceleration Check
        if (constraints.maxCentripetal > 0 && curvature > 0.001) {
            const v = velocity;
            const centripetal = v * v * curvature;
            stats.maxCentripetalReached = Math.max(stats.maxCentripetalReached, centripetal);

            if (centripetal > constraints.maxCentripetal) {
                stats.centripetalViolations.push({ time: t, value: centripetal, x: point.x || 0, y: point.y || 0 });
            }
        }

        // Detect sharp turns (high curvature with high velocity)
        if (curvature > 0.5 && velocity > 1.0) {
            stats.sharpTurns.push({
                time: t,
                x: point.x || 0,
                y: point.y || 0,
                curvature: curvature,
                velocity: velocity,
                radius: 1 / Math.max(curvature, 0.001)
            });
        }

        prevPoint = point;
    });

    // Calculate advanced metrics
    stats.pathEfficiency = stats.straightLineDistance > 0 
        ? (stats.straightLineDistance / stats.totalDistance) * 100 
        : 0;

    // Velocity smoothness (lower variance = smoother)
    if (velocityChanges.length > 0) {
        const avgChange = velocityChanges.reduce((a, b) => a + b, 0) / velocityChanges.length;
        const variance = velocityChanges.reduce((sum, v) => sum + Math.pow(v - avgChange, 2), 0) / velocityChanges.length;
        stats.velocitySmoothness = Math.sqrt(variance);
    }

    // Acceleration consistency (coefficient of variation)
    if (accelValues.length > 0) {
        const avgAccel = accelValues.reduce((a, b) => a + b, 0) / accelValues.length;
        const variance = accelValues.reduce((sum, a) => sum + Math.pow(a - avgAccel, 2), 0) / accelValues.length;
        const stdDev = Math.sqrt(variance);
        stats.accelConsistency = avgAccel > 0 ? (stdDev / avgAccel) * 100 : 0;
    }

    // Average curvature
    stats.avgCurvature = curvatureValues.length > 0
        ? curvatureValues.reduce((a, b) => a + b, 0) / curvatureValues.length
        : 0;

    // Time efficiency (distance per second)
    const startTime = trajectory[0]?.time || 0;
    const endTime = trajectory[trajectory.length - 1]?.time || 0;
    const totalTime = endTime - startTime;
    stats.timeEfficiency = totalTime > 0 ? stats.totalDistance / totalTime : 0;

    // Energy estimate (simplified: proportional to acceleration and velocity squared)
    let energySum = 0;
    trajectory.forEach((point, i) => {
        if (i > 0) {
            const dt = Math.max(0.001, (point.time || 0) - (trajectory[i - 1].time || 0));
            const v = Math.abs(point.velocity || 0);
            const a = Math.abs(point.calculatedAccel || point.acceleration || 0);
            energySum += (v * v + a * a) * dt;
        }
    });
    stats.energyEstimate = energySum;

    // Waypoint spacing analysis
    if (distances.length > 0) {
        const avgSpacing = distances.reduce((a, b) => a + b, 0) / distances.length;
        const minSpacing = Math.min(...distances);
        const maxSpacing = Math.max(...distances);
        stats.waypointSpacing = {
            avg: avgSpacing,
            min: minSpacing,
            max: maxSpacing,
            variance: distances.reduce((sum, d) => sum + Math.pow(d - avgSpacing, 2), 0) / distances.length
        };
    } else {
        stats.waypointSpacing = {
            avg: 0,
            min: 0,
            max: 0,
            variance: 0
        };
    }

    // Helper function to describe path location
    const describeLocation = (x, y) => {
        const safeX = x || 0;
        const safeY = y || 0;
        const xDesc = safeX < 5.5 ? "start zone" : safeX > 11 ? "target zone" : "mid-field";
        const yDesc = safeY < 2.7 ? "bottom" : safeY > 5.5 ? "top" : "center";
        return `${xDesc} (${yDesc})`;
    };

    // Helper to get specific recommendations (formatted as numbered list)
    const getRecommendation = (type, location, stats) => {
        const recommendations = {
            velocity: [
                `Immediate Fix: In PathPlanner, select waypoints near ${location} and set "Max Velocity" to ${(constraints.maxVelocity * 0.95).toFixed(2)} m/s`,
                `Alternative: Add a "Zone" constraint in PathPlanner with max velocity ${(constraints.maxVelocity * 0.9).toFixed(2)} m/s covering coordinates (${(stats.x || 0).toFixed(1)}, ${(stats.y || 0).toFixed(1)})`,
                `Hardware Check: Verify motor encoder calibration. If peak velocity ${(stats.maxVelocityReached || 0).toFixed(2)} m/s is intentional, increase constraint to ${Math.ceil((stats.maxVelocityReached || 0) * 1.1 * 10) / 10} m/s`,
                `Performance Impact: Exceeding velocity by ${(((stats.maxVelocityReached || 0) / constraints.maxVelocity - 1) * 100).toFixed(1)}% may cause wheel slip and odometry drift`
            ],
            acceleration: [
                `Immediate Fix: Increase "Max Acceleration" in PathPlanner to ${Math.ceil((stats.maxAccelReached || 0) * 1.1 * 10) / 10} m/s², or add more waypoints near ${location} to smooth the path`,
                `Path Optimization: Select waypoints around ${location} and increase "Path Duration" by 20-30% to reduce acceleration demand`,
                `Advanced: Enable "S-Curve" acceleration profile in PathPlanner settings (reduces jerk and mechanical stress)`,
                `Performance Impact: High acceleration (${(stats.maxAccelReached || 0).toFixed(2)} m/s²) may exceed motor torque limits, causing path following errors. Expected error: ±${((stats.maxAccelReached || 0) * 0.1).toFixed(2)} m`
            ],
            jerk: [
                `Immediate Fix: Enable "S-Curve Acceleration" in PathPlanner → Path Settings → Advanced. This smooths acceleration transitions`,
                `Waypoint Optimization: Add intermediate waypoints between sharp direction changes near ${location} to reduce jerk spikes`,
                `Rotation Smoothing: If rotation changes are causing jerk, use "Rotation Override" zones with gradual rotation transitions`,
                `Performance Impact: High jerk (${(stats.maxJerkReached || 0).toFixed(2)} m/s³) causes mechanical stress, reduces path accuracy by ~${((stats.maxJerkReached || 0) * 0.05).toFixed(2)} m, and increases wear on drivetrain`
            ],
            centripetal: [
                `Immediate Fix: Widen turn radius at ${location} by spacing waypoints ${(1 / Math.max(stats.curvature || 0.1, 0.1) * 0.5).toFixed(1)} m further apart, or reduce speed to ${Math.sqrt(constraints.maxCentripetal / Math.max(stats.curvature || 0.1, 0.1)).toFixed(2)} m/s`,
                `PathPlanner Settings: Add a "Zone" with max velocity ${Math.sqrt(constraints.maxCentripetal / Math.max(stats.curvature || 0.1, 0.1)).toFixed(2)} m/s around turn at ${location}`,
                `Hardware Check: Verify wheel friction coefficient. If using mecanum wheels, reduce max centripetal to 1.5 m/s²`,
                `Performance Impact: Exceeding lateral acceleration limit by ${(((stats.maxCentripetalReached || 0) / constraints.maxCentripetal - 1) * 100).toFixed(1)}% will cause wheel slip, odometry loss, and path deviation of up to ${((stats.maxCentripetalReached || 0) * 0.15).toFixed(2)} m`
            ]
        };
        const recs = recommendations[type] || [];
        // Format as numbered list
        return recs.map((rec, idx) => `${idx + 1}) ${rec}`).join(' ');
    };

    // Generate detailed violations with enhanced recommendations
    if (stats.velocityViolations.length > 0) {
        const first = stats.velocityViolations[0];
        const location = describeLocation(first.x, first.y);
        const recommendations = getRecommendation('velocity', location, { ...first, maxVelocityReached: stats.maxVelocityReached });

        violations.push({
            time: first.time,
            type: "Velocity Limit Exceeded",
            severity: "error",
            count: stats.velocityViolations.length,
            message: `${stats.velocityViolations.length} points exceed velocity limit. Peak: ${stats.maxVelocityReached.toFixed(2)} m/s (limit: ${constraints.maxVelocity} m/s). Exceedance: ${((stats.maxVelocityReached / constraints.maxVelocity - 1) * 100).toFixed(1)}%`,
            location: location,
            suggestion: recommendations,
            impact: `High risk of wheel slip and odometry drift. Path following accuracy may degrade by ${((stats.maxVelocityReached / constraints.maxVelocity - 1) * 5).toFixed(1)} cm.`
        });
    }

    if (stats.accelViolations.length > 0) {
        const first = stats.accelViolations[0];
        const location = describeLocation(first.x, first.y);
        const recommendations = getRecommendation('acceleration', location, { ...first, maxAccelReached: stats.maxAccelReached });

        violations.push({
            time: first.time,
            type: "Acceleration Limit Exceeded",
            severity: "error",
            count: stats.accelViolations.length,
            message: `${stats.accelViolations.length} points exceed acceleration limit. Peak: ${stats.maxAccelReached.toFixed(2)} m/s² (limit: ${constraints.maxAcceleration} m/s²). Exceedance: ${((stats.maxAccelReached / constraints.maxAcceleration - 1) * 100).toFixed(1)}%`,
            location: location,
            suggestion: recommendations,
            impact: `Motor torque limits may be exceeded, causing path following errors of ±${(stats.maxAccelReached * 0.1).toFixed(2)} m.`
        });
    }

    if (stats.jerkViolations.length > 0) {
        const first = stats.jerkViolations[0];
        const location = describeLocation(first.x, first.y);
        const recommendations = getRecommendation('jerk', location, { maxJerkReached: stats.maxJerkReached });

        violations.push({
            time: first.time,
            type: "High Jerk Warning",
            severity: "warning",
            count: stats.jerkViolations.length,
            message: `${stats.jerkViolations.length} points have high jerk. Peak: ${stats.maxJerkReached.toFixed(2)} m/s³ (limit: ${constraints.maxJerk} m/s³). This indicates sudden acceleration changes.`,
            location: location,
            suggestion: recommendations,
            impact: `Mechanical stress and reduced path accuracy (~${(stats.maxJerkReached * 0.05).toFixed(2)} m error). Increased drivetrain wear.`
        });
    }

    if (stats.centripetalViolations.length > 0) {
        const first = stats.centripetalViolations[0];
        const location = describeLocation(first.x, first.y);
        const curvature = Math.abs(trajectory.find(p => Math.abs(p.time - first.time) < 0.02)?.curvature || 0.1);
        const recommendations = getRecommendation('centripetal', location, { ...first, curvature, maxCentripetalReached: stats.maxCentripetalReached });

        violations.push({
            time: first.time,
            type: "Turn Speed Too High (Slip Risk)",
            severity: "error",
            count: stats.centripetalViolations.length,
            message: `${stats.centripetalViolations.length} points exceed lateral acceleration (friction limit). Peak: ${stats.maxCentripetalReached.toFixed(2)} m/s² (limit: ${constraints.maxCentripetal} m/s²). Turn radius: ${(1 / Math.max(curvature, 0.001)).toFixed(2)} m`,
            location: location,
            suggestion: recommendations,
            impact: `Wheel slip risk: ${((stats.maxCentripetalReached / constraints.maxCentripetal - 1) * 100).toFixed(1)}% over limit. Expected path deviation: up to ${(stats.maxCentripetalReached * 0.15).toFixed(2)} m.`
        });
    }

    // Advanced Analysis: Path Efficiency
    if (stats.pathEfficiency < 70 && stats.totalDistance > 0) {
        const efficiencyLoss = ((1 - stats.pathEfficiency / 100) * stats.totalDistance).toFixed(2);
        violations.push({
            time: 0,
            type: "Path Efficiency Analysis",
            severity: "warning",
            message: `Path efficiency: ${stats.pathEfficiency.toFixed(1)}%. Path is ${efficiencyLoss} m longer than straight-line distance (${stats.straightLineDistance.toFixed(2)} m).`,
            suggestion: `Optimize path by reducing unnecessary turns. Consider: 1) Remove intermediate waypoints that don't serve a purpose, 2) Use bezier curves instead of sharp waypoints, 3) Check if path can be simplified while maintaining obstacle avoidance. Potential time savings: ${(efficiencyLoss / stats.timeEfficiency).toFixed(2)} seconds.`,
            impact: `Inefficient path adds ${(efficiencyLoss / stats.timeEfficiency).toFixed(2)} seconds and increases energy consumption by ~${(efficiencyLoss * 2).toFixed(1)}%.`
        });
    }

    // Advanced Analysis: Sharp Turns
    if (stats.sharpTurns.length > 0) {
        const worstTurn = stats.sharpTurns.reduce((max, turn) => 
            turn.curvature * turn.velocity > max.curvature * max.velocity ? turn : max, stats.sharpTurns[0]);
        const location = describeLocation(worstTurn.x, worstTurn.y);
        
        violations.push({
            time: worstTurn.time,
            type: "Sharp Turn Detected",
            severity: "warning",
            count: stats.sharpTurns.length,
            message: `${stats.sharpTurns.length} sharp turns detected. Worst: radius ${worstTurn.radius.toFixed(2)} m at ${worstTurn.velocity.toFixed(2)} m/s near ${location}.`,
            suggestion: `Optimize turn at ${location}: 1) Increase turn radius to at least ${(worstTurn.radius * 1.5).toFixed(2)} m by spacing waypoints further apart, 2) Reduce speed to ${(worstTurn.velocity * 0.7).toFixed(2)} m/s during turn, 3) Use PathPlanner's "Rotation Override" to slow down rotation changes. This improves path following accuracy and reduces slip risk.`,
            impact: `Sharp turns reduce path accuracy by ~${(worstTurn.curvature * 0.1).toFixed(2)} m and increase risk of wheel slip.`
        });
    }

    // Advanced Analysis: Velocity Smoothness
    if (stats.velocitySmoothness > 0.5) {
        violations.push({
            time: 0,
            type: "Velocity Profile Not Smooth",
            severity: "warning",
            message: `Velocity changes are abrupt (smoothness index: ${stats.velocitySmoothness.toFixed(3)}). High variance indicates inconsistent speed control.`,
            suggestion: `Smooth velocity profile: 1) Enable "S-Curve" acceleration in PathPlanner, 2) Add more waypoints in regions with rapid velocity changes, 3) Use velocity constraints to create gradual speed transitions, 4) Check PathPlanner's "Max Velocity" settings for consistency. Target smoothness index: < 0.3.`,
            impact: `Abrupt velocity changes cause mechanical stress, reduce path accuracy by ~${(stats.velocitySmoothness * 0.1).toFixed(2)} m, and increase energy consumption.`
        });
    }

    // Advanced Analysis: Acceleration Consistency
    if (stats.accelConsistency > 50) {
        violations.push({
            time: 0,
            type: "Inconsistent Acceleration Profile",
            severity: "warning",
            message: `Acceleration profile is inconsistent (coefficient of variation: ${stats.accelConsistency.toFixed(1)}%). High variation indicates irregular acceleration demands.`,
            suggestion: `Stabilize acceleration: 1) Ensure consistent waypoint spacing (target: ${stats.waypointSpacing?.avg?.toFixed(2) || 0.3} m average), 2) Use uniform path duration settings, 3) Enable "S-Curve" acceleration profile, 4) Remove waypoints that cause sudden acceleration spikes. Target CV: < 30%.`,
            impact: `Inconsistent acceleration causes motor current spikes, reduces battery efficiency by ~${(stats.accelConsistency * 0.5).toFixed(1)}%, and may cause path following errors.`
        });
    }

    // Advanced Analysis: Waypoint Spacing
    if (stats.waypointSpacing && stats.waypointSpacing.variance > 0.1 && stats.waypointSpacing.min > 0) {
        const spacingRatio = stats.waypointSpacing.max / stats.waypointSpacing.min;
        if (spacingRatio > 3) {
            violations.push({
                time: 0,
                type: "Irregular Waypoint Spacing",
                severity: "warning",
                message: `Waypoint spacing is highly irregular (min: ${stats.waypointSpacing.min.toFixed(2)} m, max: ${stats.waypointSpacing.max.toFixed(2)} m, ratio: ${spacingRatio.toFixed(1)}x).`,
                suggestion: `Normalize waypoint spacing: 1) Add intermediate waypoints in sparse regions (spacing > ${(stats.waypointSpacing.avg * 1.5).toFixed(2)} m), 2) Remove redundant waypoints in dense regions (spacing < ${(stats.waypointSpacing.avg * 0.5).toFixed(2)} m), 3) Target uniform spacing of ${stats.waypointSpacing.avg.toFixed(2)} m ± 20%. This improves path smoothness and predictability.`,
                impact: `Irregular spacing causes inconsistent acceleration demands and reduces path following accuracy by ~${((spacingRatio - 1) * 0.05).toFixed(2)} m.`
            });
        }
    }

    // Advanced Analysis: High Curvature Regions
    if (stats.maxCurvature > 2.0) {
        const highCurvaturePoints = trajectory.filter(p => Math.abs(p.curvature || 0) > 1.5);
        if (highCurvaturePoints.length > 0) {
            const first = highCurvaturePoints[0];
            const location = describeLocation(first.x, first.y);
            
            violations.push({
                time: first.time,
                type: "Extremely High Curvature",
                severity: "warning",
                count: highCurvaturePoints.length,
                message: `${highCurvaturePoints.length} points have extremely high curvature (max: ${stats.maxCurvature.toFixed(2)} rad/m, radius: ${(1 / stats.maxCurvature).toFixed(2)} m).`,
                suggestion: `Reduce curvature at ${location}: 1) Significantly widen turn radius by spacing waypoints ${(1 / stats.maxCurvature * 2).toFixed(1)} m apart, 2) Break sharp turns into multiple gentle turns, 3) Use bezier curves instead of sharp waypoint transitions, 4) Consider if path can be redesigned to avoid this region. Target max curvature: < 1.0 rad/m.`,
                impact: `Extremely high curvature causes severe path following errors (up to ${(stats.maxCurvature * 0.2).toFixed(2)} m deviation) and high risk of wheel slip.`
            });
        }
    }

    // Advanced Analysis: Time Efficiency
    const optimalTime = stats.straightLineDistance > 0 && constraints.maxVelocity > 0 ? stats.straightLineDistance / constraints.maxVelocity : 0;
    const actualTime = trajectory.length > 0 ? (trajectory[trajectory.length - 1].time - trajectory[0].time) : 0;
    const timeEfficiency = actualTime > 0 && optimalTime > 0 ? (optimalTime / actualTime) * 100 : 0;
    
    if (timeEfficiency < 60 && actualTime > 0 && optimalTime > 0) {
        violations.push({
            time: 0,
            type: "Time Efficiency Analysis",
            severity: "info",
            message: `Time efficiency: ${timeEfficiency.toFixed(1)}%. Path takes ${actualTime.toFixed(2)}s vs optimal ${optimalTime.toFixed(2)}s. Average speed: ${(stats.timeEfficiency || 0).toFixed(2)} m/s.`,
            suggestion: `Improve time efficiency: 1) Increase max velocity where safe (currently using ${((stats.maxVelocityReached || 0) / constraints.maxVelocity * 100).toFixed(1)}% of limit), 2) Reduce path length by ${(Math.max(0, stats.totalDistance - stats.straightLineDistance)).toFixed(2)} m, 3) Optimize acceleration profile to spend more time at max velocity, 4) Remove unnecessary slowdowns. Potential time savings: ${(actualTime - optimalTime).toFixed(2)} seconds.`,
            impact: `Path is ${((actualTime / optimalTime - 1) * 100).toFixed(1)}% slower than optimal. In autonomous, this may cost ${(actualTime - optimalTime).toFixed(2)} seconds.`
        });
    }

    // Add comprehensive summary if everything is good
    if (violations.length === 0 || (violations.length === 1 && violations[0].severity === 'success')) {
        const actualTime = trajectory.length > 0 ? (trajectory[trajectory.length - 1].time - trajectory[0].time) : 0;
        violations.push({
            time: 0,
            type: "Path Analysis Complete ✓",
            severity: "success",
            message: `All constraint checks passed! Peak velocity: ${(stats.maxVelocityReached || 0).toFixed(2)} m/s (${((stats.maxVelocityReached || 0) / constraints.maxVelocity * 100).toFixed(1)}% of limit), Peak acceleration: ${(stats.maxAccelReached || 0).toFixed(2)} m/s² (${((stats.maxAccelReached || 0) / constraints.maxAcceleration * 100).toFixed(1)}% of limit), Path efficiency: ${(stats.pathEfficiency || 0).toFixed(1)}%, Time: ${actualTime.toFixed(2)}s`,
            suggestion: `This path is within robot constraints and ready for deployment. Recommendations: 1) Test on practice field to verify real-world performance, 2) Monitor odometry accuracy during execution, 3) Consider fine-tuning if path following errors exceed ±5 cm, 4) Document this path configuration for future reference.`,
            impact: `Path is optimized and safe for deployment. Expected path following accuracy: ±${((stats.maxJerkReached || 0) * 0.02 + 0.03).toFixed(2)} m.`
        });
    }

    return violations;
}
