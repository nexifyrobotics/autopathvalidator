import React, { useRef, useEffect, useCallback } from 'react';
import { MapPin, Circle } from 'lucide-react';

// FRC Field dimensions in meters
const FIELD_WIDTH = 16.54;
const FIELD_HEIGHT = 8.21;

export function FieldOverlay({ trajectoryData, violations, isRealtime = false, currentPoint = null }) {
    const canvasRef = useRef(null);
    const animationRef = useRef();

    const drawField = useCallback((ctx, width, height) => {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw field background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);

        // Draw field border
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, width - 20, height - 20);

        // Calculate scale
        const scaleX = (width - 40) / FIELD_WIDTH;
        const scaleY = (height - 40) / FIELD_HEIGHT;
        const offsetX = 20;
        const offsetY = 20;

        // Draw grid lines
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const x = offsetX + (i * FIELD_WIDTH / 5) * scaleX;
            ctx.beginPath();
            ctx.moveTo(x, offsetY);
            ctx.lineTo(x, offsetY + FIELD_HEIGHT * scaleY);
            ctx.stroke();
        }
        for (let i = 0; i <= 3; i++) {
            const y = offsetY + (i * FIELD_HEIGHT / 3) * scaleY;
            ctx.beginPath();
            ctx.moveTo(offsetX, y);
            ctx.lineTo(offsetX + FIELD_WIDTH * scaleX, y);
            ctx.stroke();
        }

        // Draw path
        if (trajectoryData.length > 1) {
            ctx.strokeStyle = '#8884d8';
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            const firstPoint = trajectoryData[0];
            const fieldX1 = (firstPoint.x || 0) + (FIELD_WIDTH / 2);
            const fieldY1 = (firstPoint.y || 0) + (FIELD_HEIGHT / 2);
            const x1 = offsetX + fieldX1 * scaleX;
            const y1 = offsetY + (FIELD_HEIGHT - fieldY1) * scaleY;
            ctx.moveTo(x1, y1);

            for (let i = 1; i < trajectoryData.length; i++) {
                const point = trajectoryData[i];
                const fieldX = (point.x || 0) + (FIELD_WIDTH / 2);
                const fieldY = (point.y || 0) + (FIELD_HEIGHT / 2);
                const x = offsetX + fieldX * scaleX;
                const y = offsetY + (FIELD_HEIGHT - fieldY) * scaleY;
                ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Draw start point
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(x1, y1, 6, 0, 2 * Math.PI);
            ctx.fill();

            // Draw end point
            const lastPoint = trajectoryData[trajectoryData.length - 1];
            const x2 = offsetX + (lastPoint.x || 0) * scaleX;
            const y2 = offsetY + (FIELD_HEIGHT - (lastPoint.y || 0)) * scaleY;
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(x2, y2, 6, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Draw violation points
        violations.forEach((violation) => {
            if (violation.time !== undefined && violation.time >= 0) {
                const point = trajectoryData.find(p => Math.abs((p.time || 0) - violation.time) < 0.1);
                if (point) {
                    const fieldX = (point.x || 0) + (FIELD_WIDTH / 2);
                    const fieldY = (point.y || 0) + (FIELD_HEIGHT / 2);
                    const x = offsetX + fieldX * scaleX;
                    const y = offsetY + (FIELD_HEIGHT - fieldY) * scaleY;
                    
                    ctx.fillStyle = violation.severity === 'error' ? '#ef4444' : '#f59e0b';
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
        });

        // Draw labels
        ctx.fillStyle = '#888';
        ctx.font = '12px monospace';
        ctx.fillText('0,0', offsetX + 5, offsetY + 15);
        ctx.fillText(`${FIELD_WIDTH.toFixed(1)}m`, offsetX + FIELD_WIDTH * scaleX - 40, offsetY + 15);
        ctx.fillText(`${FIELD_HEIGHT.toFixed(1)}m`, offsetX - 50, offsetY + FIELD_HEIGHT * scaleY);

    }, [trajectoryData, violations]);

    useEffect(() => {
        if (!trajectoryData || trajectoryData.length === 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        const draw = () => {
            drawField(ctx, width, height);
            
            if (isRealtime && currentPoint) {
                // Draw current position
                const scaleX = (width - 40) / FIELD_WIDTH;
                const scaleY = (height - 40) / FIELD_HEIGHT;
                const offsetX = 20;
                const offsetY = 20;
                
                // Convert from field coordinates to canvas coordinates
                // FRC field coordinates: (0,0) is center, +x is forward, +y is left
                // Canvas coordinates: (0,0) is top-left, +x is right, +y is down
                const fieldX = (currentPoint.x || 0) + (FIELD_WIDTH / 2);
                const fieldY = (currentPoint.y || 0) + (FIELD_HEIGHT / 2);
                const x = offsetX + fieldX * scaleX;
                const y = offsetY + (FIELD_HEIGHT - fieldY) * scaleY;
                
                // Draw robot position
                ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
                ctx.beginPath();
                ctx.arc(x, y, 10, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw heading indicator
                const heading = currentPoint.heading || 0;
                const headX = x + Math.cos(heading) * 20;
                const headY = y - Math.sin(heading) * 20;
                
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(headX, headY);
                ctx.stroke();
            }
            
            if (isRealtime) {
                animationRef.current = requestAnimationFrame(draw);
            }
        };
        
        if (isRealtime) {
            animationRef.current = requestAnimationFrame(draw);
        } else {
            draw();
        }
        
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [trajectoryData, violations, isRealtime, currentPoint, drawField]);

    if (!trajectoryData || trajectoryData.length === 0) {
        return (
            <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
                <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    <h3 className="text-white font-semibold">Field View</h3>
                </div>
                <p className="text-gray-500 text-sm">Upload a path to see field visualization</p>
            </div>
        );
    }

    return (
        <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-semibold">Field View</h3>
                <div className="ml-auto flex gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Start</span>
                    </div>
                </div>
            </div>
            <div className="relative w-full" style={{ paddingBottom: '75%' }}>
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full"
                    width={800}
                    height={600}
                />
                {isRealtime && currentPoint && (
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white p-3 rounded text-sm space-y-1">
                        <div>X: {currentPoint.x?.toFixed(2)}m</div>
                        <div>Y: {currentPoint.y?.toFixed(2)}m</div>
                        <div>Heading: {((currentPoint.heading || 0) * 180 / Math.PI).toFixed(1)}°</div>
                        <div>Velocity: {(currentPoint.velocity || 0).toFixed(2)} m/s</div>
                    </div>
                )}
            </div>
        </div>
    );
}
