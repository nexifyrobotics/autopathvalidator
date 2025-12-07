/**
 * Image-based Path Analyzer
 * Extracts path data from PathPlanner screenshots using Canvas API
 */

export class ImagePathAnalyzer {
    constructor(imageElement) {
        this.image = imageElement;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    }

    async analyze() {
        // Draw image to canvas
        this.canvas.width = this.image.width;
        this.canvas.height = this.image.height;
        this.ctx.drawImage(this.image, 0, 0);

        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

        // Extract path lines
        // 1. Blue Alliance Path (Blueish)
        const bluePath = this.extractPathByColorRange(imageData,
            { r: [30, 120], g: [80, 180], b: [180, 255] }
        );
        // 2. Red Alliance Path (Redish)
        const redPath = this.extractPathByColorRange(imageData,
            { r: [180, 255], g: [30, 120], b: [30, 120] }
        );
        // 3. White/Light Gray Path (Common in PathPlanner screenshots)
        // RGB > 200, 200, 200
        const whitePath = this.extractPathByColorRange(imageData,
            { r: [180, 255], g: [180, 255], b: [180, 255] }
        );

        // Combine paths and sort by position (remove duplicates ideally, but simple merge for now)
        let allPaths = [...bluePath, ...redPath, ...whitePath];

        // Remove noise/scattered pixels by density or simple outlier removal could go here
        // For now, just sort by X
        allPaths.sort((a, b) => a.x - b.x);

        if (allPaths.length === 0) {
            throw new Error("No path detected. Please ensure the path line (white, blue, or red) is clearly visible.");
        }

        // Convert pixel coordinates to trajectory
        return this.pixelsToTrajectory(allPaths);
    }

    extractPathByColorRange(imageData, colorRange) {
        const pixels = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const pathPixels = [];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const r = pixels[index];
                const g = pixels[index + 1];
                const b = pixels[index + 2];

                if (
                    r >= colorRange.r[0] && r <= colorRange.r[1] &&
                    g >= colorRange.g[0] && g <= colorRange.g[1] &&
                    b >= colorRange.b[0] && b <= colorRange.b[1]
                ) {
                    pathPixels.push({ x, y });
                }
            }
        }
        return pathPixels;
    }

    pixelsToTrajectory(pathPixels) {
        if (pathPixels.length < 2) return [];

        const FIELD_WIDTH_M = 16.54;
        const FIELD_HEIGHT_M = 8.21;

        const minX = Math.min(...pathPixels.map(p => p.x));
        const maxX = Math.max(...pathPixels.map(p => p.x));
        const minY = Math.min(...pathPixels.map(p => p.y));
        const maxY = Math.max(...pathPixels.map(p => p.y));

        const pixelWidth = maxX - minX;
        const pixelHeight = maxY - minY;

        // Prevent division by zero if path is vertical/horizontal line
        const scaleX = pixelWidth > 0 ? FIELD_WIDTH_M / pixelWidth : 1;
        const scaleY = pixelHeight > 0 ? FIELD_HEIGHT_M / pixelHeight : 1;

        // Sample points to reduce count
        const sampledPoints = this.samplePoints(pathPixels, 100);

        // Convert pixels to meters
        let trajectory = sampledPoints.map((point) => ({
            x: (point.x - minX) * scaleX,
            y: (maxY - point.y) * scaleY, // Flip Y
            time: 0,
            velocity: 0,
            acceleration: 0,
            rotation: 0
        }));

        // Apply Spatial Smoothing (Moving Average on Position)
        // This is critical for image-derived paths
        const smoothSpatial = (arr, key, windowSize) => {
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
                result[i] = { ...result[i], [key]: sum / count };
            }
            return result;
        };

        // Aggressive smoothing for coordinates (Window 7)
        trajectory = smoothSpatial(trajectory, 'x', 7);
        trajectory = smoothSpatial(trajectory, 'y', 7);

        // Estimate Time based on smoothed distance using a Target Velocity
        // Using KitBot conservative max speed as target avg speed
        const targetVel = 2.0;
        let currentTime = 0;

        trajectory[0].time = 0;
        for (let i = 1; i < trajectory.length; i++) {
            const dx = trajectory[i].x - trajectory[i - 1].x;
            const dy = trajectory[i].y - trajectory[i - 1].y;
            const dist = Math.hypot(dx, dy);

            // Avoid zero-time steps
            let dt = dist / targetVel;
            if (dt < 0.02) dt = 0.02; // Minimum 20ms step

            currentTime += dt;
            trajectory[i].time = currentTime;
        }

        return trajectory;
    }

    samplePoints(points, maxSamples) {
        if (points.length <= maxSamples) return points;

        const step = Math.floor(points.length / maxSamples);
        const sampled = [];

        for (let i = 0; i < points.length; i += step) {
            sampled.push(points[i]);
        }

        return sampled;
    }
}

/**
 * Parse image file and return trajectory
 */
export async function parseImagePath(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.onload = async () => {
                try {
                    const analyzer = new ImagePathAnalyzer(img);
                    const trajectory = await analyzer.analyze();
                    resolve(trajectory);
                } catch (err) {
                    reject(err);
                }
            };
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = e.target.result;
        };

        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
}
