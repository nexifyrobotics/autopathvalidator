
/**
 * Normalizes the input JSON into a standard Trajectory array.
 * Standard format: Array of { time (s), x (m), y (m), rotation (rad), velocity (m/s), acceleration (m/s^2), curvature (rad/m) }
 */
export function parseTrajectory(jsonContent) {
    let states = [];

    // WPILib Trajectory JSON (Array of objects) or { states: [...] }
    if (Array.isArray(jsonContent)) {
        states = jsonContent;
    } else if (jsonContent.states && Array.isArray(jsonContent.states)) {
        // PathPlanner 2024+ often puts the trajectory in a top-level object or similar structure if it's the deploy file
        // OR checks for WPILib's "states" key.
        states = jsonContent.states;
    } else if (jsonContent.waypoints) {
        // PathPlanner .path file (Waypoints only)
        // We cannot calculate physics from just waypoints without a generator.
        throw new Error("This looks like a raw PathPlanner .path file (waypoints only). Please upload a generated Trajectory JSON, or a WPILib path export.");
    } else {
        throw new Error("Unknown file format. Expected a Trajectory JSON with 'states' or an array of points.");
    }

    // Map to normalized structure
    return states.map(state => {
        // WPILib keys: time, velocity, acceleration, pose { translation { x, y }, rotation { radians } }, curvature
        // PathPlanner might differ slightly.
        const time = state.time ?? state.t;
        const velocity = state.velocity ?? state.vel ?? state.v;
        const acceleration = state.acceleration ?? state.accel ?? state.a;
        const curvature = state.curvature ?? state.c ?? 0;

        // Pose handling
        let x = 0, y = 0, rotation = 0;
        if (state.pose) {
            // WPILib style
            if (state.pose.translation) {
                x = state.pose.translation.x;
                y = state.pose.translation.y;
            } else {
                x = state.pose.x;
                y = state.pose.y;
            }

            if (state.pose.rotation) {
                // Check if it's an object with radians or just a number
                rotation = typeof state.pose.rotation === 'object' ? (state.pose.rotation.radians ?? 0) : state.pose.rotation;
            }
        } else {
            // Flat structure maybe?
            x = state.x ?? 0;
            y = state.y ?? 0;
            rotation = state.rotation ?? state.rot ?? state.heading ?? 0;
        }

        return {
            time: Number(time),
            x: Number(x),
            y: Number(y),
            rotation: Number(rotation),
            velocity: Number(velocity),
            acceleration: Number(acceleration),
            curvature: Number(curvature)
        };
    }).sort((a, b) => a.time - b.time);
}
