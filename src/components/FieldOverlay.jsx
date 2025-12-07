import React, { useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';

// FRC Field dimensions in meters
const FIELD_WIDTH = 16.54;
const FIELD_HEIGHT = 8.21;

export function FieldOverlay({ trajectoryData, violations }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!trajectoryData || trajectoryData.length === 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

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
            const x1 = offsetX + (firstPoint.x || 0) * scaleX;
            const y1 = offsetY + (FIELD_HEIGHT - (firstPoint.y || 0)) * scaleY; // Flip Y
            ctx.moveTo(x1, y1);

            for (let i = 1; i < trajectoryData.length; i++) {
                const point = trajectoryData[i];
                const x = offsetX + (point.x || 0) * scaleX;
                const y = offsetY + (FIELD_HEIGHT - (point.y || 0)) * scaleY; // Flip Y
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
                    const x = offsetX + (point.x || 0) * scaleX;
                    const y = offsetY + (FIELD_HEIGHT - (point.y || 0)) * scaleY;
                    
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
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>End</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span>Issues</span>
                    </div>
                </div>
            </div>
            <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className="w-full h-auto rounded border border-neutral-700 bg-neutral-900"
            />
        </div>
    );
}

