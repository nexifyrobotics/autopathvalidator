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

        // Extract path lines with more accurate color ranges for PathPlanner
        // Blue alliance path: RGB around (50-100, 100-200, 200-255)
        // Red alliance path: RGB around (200-255, 50-100, 50-100)
        const bluePath = this.extractPathByColorRange(imageData,
            { r: [30, 120], g: [80, 180], b: [180, 255] }
        );
        const redPath = this.extractPathByColorRange(imageData,
            { r: [180, 255], g: [30, 120], b: [30, 120] }
        );

        // Combine paths and sort by position
        let allPaths = [...bluePath, ...redPath];
        allPaths.sort((a, b) => a.x - b.x); // Sort combined path by x-coordinate

        if (allPaths.length === 0) {
            throw new Error("No path detected in image. Make sure the path lines are clearly visible (blue or red).");
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

                // Check if pixel is within color range
                if (
                    r >= colorRange.r[0] && r <= colorRange.r[1] &&
                    g >= colorRange.g[0] && g <= colorRange.g[1] &&
                    b >= colorRange.b[0] && b <= colorRange.b[1]
                ) {
                    pathPixels.push({ x, y });
                }
            }
        }

        // Sort by x coordinate to get path order
        return pathPixels.sort((a, b) => a.x - b.x);
    }

    pixelsToTrajectory(pathPixels) {
        if (pathPixels.length < 2) return [];

        // Assume standard FRC field: 16.54m x 8.21m (54'2" x 26'11")
        const FIELD_WIDTH_M = 16.54;
        const FIELD_HEIGHT_M = 8.21;

        // Find image bounds (assuming field fills most of image)
        const minX = Math.min(...pathPixels.map(p => p.x));
        const maxX = Math.max(...pathPixels.map(p => p.x));
        const minY = Math.min(...pathPixels.map(p => p.y));
        const maxY = Math.max(...pathPixels.map(p => p.y));

        const pixelWidth = maxX - minX;
        const pixelHeight = maxY - minY;

        const scaleX = FIELD_WIDTH_M / pixelWidth;
        const scaleY = FIELD_HEIGHT_M / pixelHeight;

        // Sample points (reduce density for performance)
        const sampledPoints = this.samplePoints(pathPixels, 100);

        // Convert to trajectory states
        const trajectory = sampledPoints.map((point, i) => {
            // Convert pixel to meters
            const x = (point.x - minX) * scaleX;
            const y = (maxY - point.y) * scaleY; // Flip Y (image coords are top-down)

            // Estimate velocity and acceleration from spacing
            let velocity = 0;
            let acceleration = 0;
            let rotation = 0;

            if (i > 0) {
                const prev = sampledPoints[i - 1];
                const prevX = (prev.x - minX) * scaleX;
                const prevY = (maxY - prev.y) * scaleY;

                const dx = x - prevX;
                const dy = y - prevY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Assume constant time step (0.02s = 50Hz typical)
                const dt = 0.02;
                velocity = dist / dt;

                // Calculate heading
                rotation = Math.atan2(dy, dx);
            }

            return {
                time: i * 0.02,
                x,
                y,
                rotation,
                velocity,
                acceleration,
                curvature: 0 // Will be calculated later
            };
        });

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
