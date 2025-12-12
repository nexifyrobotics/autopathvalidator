
/**
 * Normalizes the input JSON into a standard Trajectory array.
 * Standard format: Array of { time (s), x (m), y (m), rotation (rad), velocity (m/s), acceleration (m/s^2), curvature (rad/m) }
 */
export function parseTrajectory(jsonContent) {
    console.log('Parsing trajectory data:', jsonContent);
    let states = [];

    // Handle empty or invalid input
    if (!jsonContent || typeof jsonContent !== 'object') {
        throw new Error("Invalid input: Expected a JSON object or array");
    }

    try {
        // WPILib Trajectory JSON (Array of objects) or { states: [...] }
        if (Array.isArray(jsonContent)) {
            states = jsonContent;
        } else if (jsonContent.states && Array.isArray(jsonContent.states)) {
            // PathPlanner 2024+ format
            states = jsonContent.states;
        } else if (jsonContent.waypoints) {
            // PathPlanner .path file (Waypoints only)
            throw new Error("This looks like a raw PathPlanner .path file (waypoints only). Please upload a generated Trajectory JSON, or a WPILib path export.");
        } else if (jsonContent.length !== undefined) {
            // Handle case where jsonContent is array-like but not an array
            states = Array.from(jsonContent);
        } else {
            throw new Error("Unknown file format. Expected a Trajectory JSON with 'states' or an array of points.");
        }

        if (!states.length) {
            throw new Error("The trajectory file appears to be empty");
        }
    } catch (error) {
        console.error('Error parsing trajectory:', error);
        throw new Error(`Failed to parse trajectory: ${error.message}`);
    }

    // Map to normalized structure
    return states.map((state, index) => {
        try {
            if (!state || typeof state !== 'object') {
                throw new Error(`Invalid state at index ${index}: not an object`);
            }

            // WPILib keys: time, velocity, acceleration, pose { translation { x, y }, rotation { radians } }, curvature
            // PathPlanner might differ slightly.
            const time = state.time ?? state.t ?? 0;
            const velocity = state.velocity ?? state.vel ?? state.v ?? 0;
            const acceleration = state.acceleration ?? state.accel ?? state.a ?? 0;
            const curvature = state.curvature ?? state.c ?? 0;

            // Pose handling
            let x = 0, y = 0, rotation = 0;
            
            // Handle different pose formats
            if (state.pose) {
                // WPILib style with pose object
                if (state.pose.translation) {
                    x = state.pose.translation.x ?? state.pose.translation?.x ?? 0;
                    y = state.pose.translation.y ?? state.pose.translation?.y ?? 0;
                } else if (state.pose.x !== undefined && state.pose.y !== undefined) {
                    // Flat pose structure
                    x = state.pose.x;
                    y = state.pose.y;
                }

                // Handle rotation
                if (state.pose.rotation !== undefined) {
                    rotation = typeof state.pose.rotation === 'object' 
                        ? (state.pose.rotation.radians ?? state.pose.rotation.rotationRadians ?? 0) 
                        : state.pose.rotation;
                }
            } else if (state.x !== undefined && state.y !== undefined) {
                // Flat structure
                x = state.x;
                y = state.y;
                rotation = state.rotation ?? state.heading ?? state.h ?? 0;
            } else if (state.position) {
                // Alternative position format
                x = state.position.x ?? 0;
                y = state.position.y ?? 0;
                rotation = state.rotation ?? state.heading ?? state.h ?? 0;
            }

            // Validate required fields
            if (isNaN(x) || isNaN(y)) {
                throw new Error(`Invalid position at index ${index}: x=${x}, y=${y}`);
            }

            return {
                time: Number(time) || 0,
                x: Number(x) || 0,
                y: Number(y) || 0,
                rotation: Number(rotation) || 0,
                velocity: Number(velocity) || 0,
                acceleration: Number(acceleration) || 0,
                curvature: Number(curvature) || 0,
                // Include original state for debugging
                _original: state
            };
        } catch (error) {
            console.error(`Error processing state at index ${index}:`, state, error);
            throw new Error(`Failed to process state at index ${index}: ${error.message}`);
        }
    }).sort((a, b) => a.time - b.time);
}
