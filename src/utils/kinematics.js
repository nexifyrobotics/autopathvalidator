
/**
 * Calculates derivatives (velocity, acceleration, jerk) from the trajectory positions/time.
 * Uses finite difference method to compute missing kinematic values.
 */
export function calculateKinematics(trajectory) {
    if (!trajectory || trajectory.length < 2) return [];

    const enriched = [];

    for (let i = 0; i < trajectory.length; i++) {
        const current = trajectory[i];

        let calcVel = current.velocity;
        let calcAccel = current.acceleration;
        let calcJerk = 0;
        let calcAngVel = 0;

        if (i > 0) {
            const prev = trajectory[i - 1];
            const dt = current.time - prev.time;

            if (dt > 0.0001) { // Avoid divide by zero
                // Calculate Acceleration (change in velocity)
                const dv = current.velocity - prev.velocity;
                calcAccel = dv / dt;

                // Calculate Jerk (change in acceleration)
                const prevAccel = prev.acceleration || 0;
                const currAccel = current.acceleration || calcAccel;
                const da = currAccel - prevAccel;
                calcJerk = da / dt;

                // Angular Velocity
                let dRot = current.rotation - prev.rotation;
                // Normalize angle diff to -PI to PI
                while (dRot > Math.PI) dRot -= 2 * Math.PI;
                while (dRot < -Math.PI) dRot += 2 * Math.PI;

                calcAngVel = dRot / dt;
            }
        }

        enriched.push({
            ...current,
            calculatedVelocity: calcVel,
            calculatedAccel: calcAccel,
            calculatedJerk: calcJerk,
            calculatedAngVel: calcAngVel
        });
    }

    return enriched;
}
