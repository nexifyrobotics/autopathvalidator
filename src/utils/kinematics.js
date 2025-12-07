
/**
 * Calculates derivatives (velocity, acceleration, jerk) from the trajectory positions/time.
 * Uses finite difference method to compute missing kinematic values.
 */
export function calculateKinematics(trajectory) {
    if (!trajectory || trajectory.length < 2) return [];

    let enriched = [];

    // 1. First Pass: Calculate Raw Derivatives
    for (let i = 0; i < trajectory.length; i++) {
        const current = trajectory[i];

        let calcVel = current.velocity;
        let calcAccel = current.acceleration;
        let calcJerk = 0;
        let calcAngVel = 0;

        if (i > 0) {
            const prev = trajectory[i - 1];
            const dt = current.time - prev.time;

            if (dt > 0.0001) {
                // Velocity Calculation (if missing)
                if (calcVel === undefined || calcVel === null) {
                    const dx = current.x - prev.x;
                    const dy = current.y - prev.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    calcVel = dist / dt;
                }

                // Get previous velocity (use calculated if available)
                const prevVel = enriched[i - 1].calculatedVelocity !== undefined
                    ? enriched[i - 1].calculatedVelocity
                    : prev.velocity;

                // Acceleration
                const dv = calcVel - prevVel;
                const rawAccel = dv / dt;

                // If acceleration is provided in JSON, use it. Otherwise use raw.
                calcAccel = (current.acceleration !== undefined && current.acceleration !== 0)
                    ? current.acceleration
                    : rawAccel;

                // Jerk (derivative of acceleration)
                // Use the PREVIOUS calculated acceleration for continuity
                const prevAccel = enriched[i - 1].calculatedAccel;
                const da = calcAccel - prevAccel;
                calcJerk = da / dt;

                // Angular Velocity
                let dRot = current.rotation - prev.rotation;
                while (dRot > Math.PI) dRot -= 2 * Math.PI;
                while (dRot < -Math.PI) dRot += 2 * Math.PI;
                calcAngVel = dRot / dt;
            }
        }

        enriched.push({
            ...current,
            calculatedAccel: calcAccel || 0,
            calculatedJerk: calcJerk || 0,
            calculatedAngVel: calcAngVel,
            rawAccel: calcAccel || 0 // Keep raw for debug if needed
        });
    }

    // 2. Second Pass: Apply Smoothing (Moving Average)
    // Smoothing is crucial because finite difference derivatives are very noisy
    const smooth = (arr, key, windowSize) => {
        const result = [...arr];
        for (let i = 0; i < arr.length; i++) {
            let sum = 0;
            let count = 0;
            for (let j = -Math.floor(windowSize / 2); j <= Math.floor(windowSize / 2); j++) {
                if (i + j >= 0 && i + j < arr.length) {
                    sum += arr[i + j][key];
                    count++;
                }
            }
            result[i][key] = sum / count;
        }
        return result;
    };

    // Apply stronger smoothing to Accel (window 5) and aggressive to Jerk (window 11)
    // Only smooth if we calculated them ourselves (if source didn't provide good data)
    enriched = smooth(enriched, 'calculatedVelocity', 3);
    enriched = smooth(enriched, 'calculatedAccel', 5);
    enriched = smooth(enriched, 'calculatedJerk', 11);

    return enriched;
}
