import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Settings,
  Zap,
  TrendingUp,
  Clock,
  MapPin,
  BarChart3,
  Target,
  Timer,
  Download,
  AlertTriangle,
  Gauge,
  Table,
  Activity,
  BarChart
} from 'lucide-react';
import { getFieldDimensions } from '../utils/fieldDimensions';

// Animation frame callback function
function animateFrame(callback) {
  let lastTime = 0;
  let frameId;
  let isRunning = false;

  const loop = (timestamp) => {
    if (!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime;
    lastTime = timestamp;

    callback(delta);

    if (isRunning) {
      frameId = requestAnimationFrame(loop);
    }
  };

  const start = () => {
    if (!isRunning) {
      isRunning = true;
      lastTime = 0;
      frameId = requestAnimationFrame(loop);
    }
  };

  const stop = () => {
    isRunning = false;
    if (frameId) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  };

  const reset = () => {
    stop();
    lastTime = 0;
  };

  return { start, stop, reset };
}

// Field rendering component
const FieldCanvas = ({ trajectoryData, currentIndex, fieldDimensions, showTrail = true, showVelocity = true }) => {
  const canvasRef = useRef(null);

  const drawField = useCallback((ctx, width, height) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw field background
    ctx.fillStyle = '#1a4d3a';
    ctx.fillRect(0, 0, width, height);

    // Draw field border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Draw grid
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.3;

    // Vertical lines
    for (let x = 0; x <= fieldDimensions.width; x += 1) {
      const screenX = ((x / fieldDimensions.width) * (width - 40)) + 20;
      ctx.beginPath();
      ctx.moveTo(screenX, 20);
      ctx.lineTo(screenX, height - 20);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= fieldDimensions.height; y += 1) {
      const screenY = ((y / fieldDimensions.height) * (height - 40)) + 20;
      ctx.beginPath();
      ctx.moveTo(20, screenY);
      ctx.lineTo(width - 20, screenY);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }, [fieldDimensions]);

  const drawTrajectory = useCallback((ctx, width, height) => {
    if (!trajectoryData.length) return;

    // Draw path trail
    if (showTrail) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.7;

      ctx.beginPath();
      trajectoryData.forEach((point, index) => {
        const screenX = ((point.x / fieldDimensions.width) * (width - 40)) + 20;
        const screenY = height - (((point.y / fieldDimensions.height) * (height - 40)) + 20);

        if (index === 0) {
          ctx.moveTo(screenX, screenY);
        } else {
          ctx.lineTo(screenX, screenY);
        }
      });
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Draw current position trail (past points)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.8;

    ctx.beginPath();
    for (let i = 0; i <= currentIndex && i < trajectoryData.length; i++) {
      const point = trajectoryData[i];
      const screenX = ((point.x / fieldDimensions.width) * (width - 40)) + 20;
      const screenY = height - (((point.y / fieldDimensions.height) * (height - 40)) + 20);

      if (i === 0) {
        ctx.moveTo(screenX, screenY);
      } else {
        ctx.lineTo(screenX, screenY);
      }
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }, [trajectoryData, currentIndex, fieldDimensions, showTrail]);

  const drawRobot = useCallback((ctx, width, height) => {
    if (!trajectoryData.length || currentIndex >= trajectoryData.length) return;

    const currentPoint = trajectoryData[currentIndex];
    const screenX = ((currentPoint.x / fieldDimensions.width) * (width - 40)) + 20;
    const screenY = height - (((currentPoint.y / fieldDimensions.height) * (height - 40)) + 20);

    // Robot body (rectangle)
    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(currentPoint.rotation || 0);

    // Robot shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(-18, -12, 36, 24);

    // Robot body
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-16, -10, 32, 20);

    // Robot outline
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-16, -10, 32, 20);

    // Direction indicator
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(24, 0);
    ctx.lineTo(20, -4);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();

    // Velocity vector
    if (showVelocity && currentPoint.velocity > 0.1) {
      const velocityScale = 50;
      const velocityX = Math.cos(currentPoint.rotation || 0) * currentPoint.velocity * velocityScale;
      const velocityY = -Math.sin(currentPoint.rotation || 0) * currentPoint.velocity * velocityScale;

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(screenX, screenY);
      ctx.lineTo(screenX + velocityX, screenY + velocityY);
      ctx.stroke();

      // Arrow head
      const angle = Math.atan2(velocityY, velocityX);
      ctx.save();
      ctx.translate(screenX + velocityX, screenY + velocityY);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-8, -4);
      ctx.lineTo(-8, 4);
      ctx.closePath();
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
      ctx.restore();
    }
  }, [trajectoryData, currentIndex, fieldDimensions, showVelocity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    drawField(ctx, width, height);
    drawTrajectory(ctx, width, height);
    drawRobot(ctx, width, height);
  }, [drawField, drawTrajectory, drawRobot]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={300}
      className="border border-gray-600 rounded-lg bg-gray-900"
      style={{ width: '100%', height: '300px' }}
    />
  );
};

const RealTimeVisualization = ({ trajectoryData = [] }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [showTrail, setShowTrail] = useState(true);
  const [showVelocity, setShowVelocity] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [fps, setFps] = useState(0);

  const animationRef = useRef(null);
  const accumulatedTime = useRef(0);
  const frameCount = useRef(0);
  const lastFpsUpdate = useRef(Date.now());

  const fieldDimensions = useMemo(() => getFieldDimensions('2024'), []);
  const lastIndex = Math.max(0, trajectoryData.length - 1);

  // Calculate constraint violations
  const constraintViolations = useMemo(() => {
    if (!trajectoryData.length) return { velocity: 0, acceleration: 0, total: 0 };

    let velocityViolations = 0;
    let accelerationViolations = 0;

    trajectoryData.forEach(point => {
      if (point.velocity > 3.8) velocityViolations++;
      if (Math.abs(point.acceleration || 0) > 2.5) accelerationViolations++;
    });

    return {
      velocity: velocityViolations,
      acceleration: accelerationViolations,
      total: velocityViolations + accelerationViolations
    };
  }, [trajectoryData]);

  // Export current frame as image
  const exportCurrentFrame = useCallback(() => {
    if (!trajectoryData.length) return;

    const currentPoint = trajectoryData[currentIndex] || {};
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    // Draw field background
    ctx.fillStyle = '#1a4d3a';
    ctx.fillRect(0, 0, 800, 600);

    // Draw field border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, 760, 560);

    // Draw grid
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;

    for (let x = 0; x <= fieldDimensions.width; x += 1) {
      const screenX = ((x / fieldDimensions.width) * 720) + 40;
      ctx.beginPath();
      ctx.moveTo(screenX, 40);
      ctx.lineTo(screenX, 560);
      ctx.stroke();
    }

    for (let y = 0; y <= fieldDimensions.height; y += 1) {
      const screenY = ((y / fieldDimensions.height) * 520) + 40;
      ctx.beginPath();
      ctx.moveTo(40, screenY);
      ctx.lineTo(760, screenY);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;

    // Draw trajectory
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;

    ctx.beginPath();
    trajectoryData.forEach((point, index) => {
      const screenX = ((point.x / fieldDimensions.width) * 720) + 40;
      const screenY = 580 - (((point.y / fieldDimensions.height) * 520) + 40);

      if (index === 0) {
        ctx.moveTo(screenX, screenY);
      } else {
        ctx.lineTo(screenX, screenY);
      }
    });
    ctx.stroke();

    // Draw current position trail
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 6;

    ctx.beginPath();
    for (let i = 0; i <= currentIndex && i < trajectoryData.length; i++) {
      const point = trajectoryData[i];
      const screenX = ((point.x / fieldDimensions.width) * 720) + 40;
      const screenY = 580 - (((point.y / fieldDimensions.height) * 520) + 40);

      if (i === 0) {
        ctx.moveTo(screenX, screenY);
      } else {
        ctx.lineTo(screenX, screenY);
      }
    }
    ctx.stroke();

    // Draw robot
    const screenX = ((currentPoint.x / fieldDimensions.width) * 720) + 40;
    const screenY = 580 - (((currentPoint.y / fieldDimensions.height) * 520) + 40);

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(currentPoint.rotation || 0);

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-20, -12, 40, 24);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(-20, -12, 40, 24);

    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(30, 0);
    ctx.lineTo(25, -5);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();

    // Add text overlay
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    ctx.fillText(`Frame: ${currentIndex}/${lastIndex} | Time: ${(currentPoint.time || 0).toFixed(2)}s`, 40, 30);
    ctx.fillText(`Position: (${(currentPoint.x || 0).toFixed(2)}, ${(currentPoint.y || 0).toFixed(2)})`, 40, 50);

    // Download the image
    const link = document.createElement('a');
    link.download = `trajectory_frame_${currentIndex}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }, [trajectoryData, currentIndex, fieldDimensions, lastIndex]);

  // Handle seek
  const handleSeek = useCallback((index) => {
    const newIndex = Math.min(Math.max(0, index), lastIndex);
    setCurrentIndex(newIndex);
    accumulatedTime.current = 0;
  }, [lastIndex]);

  // Handle play/pause
  const togglePlayPause = useCallback(() => {
    console.log('togglePlayPause called, isPlaying:', isPlaying, 'trajectoryData.length:', trajectoryData.length);
    if (!trajectoryData.length) {
      console.log('No trajectory data, cannot play');
      return;
    }

    if (!isPlaying) {
      console.log('Starting playback');
      accumulatedTime.current = 0;
      animationRef.current?.start();
      setIsPlaying(true);
    } else {
      console.log('Stopping playback');
      animationRef.current?.stop();
      setIsPlaying(false);
    }
  }, [isPlaying, trajectoryData.length]);

  // Step controls
  const stepForward = useCallback(() => {
    handleSeek(currentIndex + 1);
  }, [currentIndex, handleSeek]);

  const stepBackward = useCallback(() => {
    handleSeek(currentIndex - 1);
  }, [currentIndex, handleSeek]);

  // Reset to start
  const reset = useCallback(() => {
    setCurrentIndex(0);
    accumulatedTime.current = 0;
    if (animationRef.current) {
      animationRef.current.reset();
    }
    setIsPlaying(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Only handle shortcuts when component is focused and has data
      if (!trajectoryData.length) return;

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          stepBackward();
          break;
        case 'ArrowRight':
          event.preventDefault();
          stepForward();
          break;
        case 'KeyR':
          event.preventDefault();
          reset();
          break;
        case 'KeyL':
          event.preventDefault();
          setIsLooping(!isLooping);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [trajectoryData.length, togglePlayPause, stepBackward, stepForward, reset, isLooping]);

  // Initialize animation system
  useEffect(() => {
    console.log('Initializing animation system');
    if (!animationRef.current) {
      console.log('Creating new animation frame');
      animationRef.current = animateFrame((delta) => {
        if (!isPlaying) return;

        const frameTime = 1000 / (30 * speed); // Target 30 FPS adjusted by speed
        accumulatedTime.current += delta;

        if (accumulatedTime.current >= frameTime) {
          setCurrentIndex(prev => {
            let nextIndex = prev + 1;

            if (nextIndex > lastIndex) {
              if (isLooping) {
                nextIndex = 0;
              } else {
                nextIndex = lastIndex;
                setIsPlaying(false);
                animationRef.current?.stop();
              }
            }

            return nextIndex;
          });

          accumulatedTime.current = 0;
        }
      });
    }

    return () => {
      if (animationRef.current) {
        console.log('Stopping animation on cleanup');
        animationRef.current.stop();
      }
    };
  }, [isPlaying, speed, lastIndex, isLooping]);

  const currentPoint = trajectoryData[currentIndex] || {};
  const progress = trajectoryData.length > 1 ? (currentIndex / (trajectoryData.length - 1)) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Field Visualization */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <MapPin size={20} />
            Field View
          </h3>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={showTrail}
                onChange={(e) => setShowTrail(e.target.checked)}
                className="rounded"
              />
              Path Trail
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={showVelocity}
                onChange={(e) => setShowVelocity(e.target.checked)}
                className="rounded"
              />
              Velocity Vector
            </label>
          </div>
        </div>

        <FieldCanvas
          trajectoryData={trajectoryData}
          currentIndex={currentIndex}
          fieldDimensions={fieldDimensions}
          showTrail={showTrail}
          showVelocity={showVelocity}
        />
      </div>

      {/* Frame Navigation Controls */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Navigation Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={reset}
              className="p-2 rounded hover:bg-gray-700 text-gray-300"
              title="Reset to start (R)"
              disabled={!trajectoryData.length}
            >
              <SkipBack size={20} />
            </button>

            <button
              onClick={stepBackward}
              className="p-2 rounded hover:bg-gray-700 text-gray-300"
              title="Step backward (←)"
              disabled={!trajectoryData.length || currentIndex === 0}
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={stepForward}
              className="p-2 rounded hover:bg-gray-700 text-gray-300"
              title="Step forward (→)"
              disabled={!trajectoryData.length || currentIndex === lastIndex}
            >
              <ChevronRight size={20} />
            </button>

            <button
              onClick={() => handleSeek(lastIndex)}
              className="p-2 rounded hover:bg-gray-700 text-gray-300"
              title="Go to end"
              disabled={!trajectoryData.length}
            >
              <SkipForward size={20} />
            </button>
          </div>

          {/* Frame/Time Inputs */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-300">Frame:</span>
              <input
                type="number"
                min="0"
                max={lastIndex}
                value={currentIndex}
                onChange={(e) => handleSeek(Math.min(Math.max(0, parseInt(e.target.value) || 0), lastIndex))}
                className="w-16 px-2 py-1 bg-gray-700 text-white rounded text-sm text-center"
                disabled={!trajectoryData.length}
              />
              <span className="text-sm text-gray-400">/ {lastIndex}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-300">Time:</span>
              <input
                type="number"
                min="0"
                max={trajectoryData.length ? trajectoryData[trajectoryData.length - 1].time : 0}
                step="0.1"
                value={(currentPoint.time || 0).toFixed(1)}
                onChange={(e) => {
                  const targetTime = parseFloat(e.target.value) || 0;
                  const closestIndex = trajectoryData.reduce((closest, point, index) => {
                    return Math.abs(point.time - targetTime) < Math.abs(trajectoryData[closest].time - targetTime) ? index : closest;
                  }, 0);
                  handleSeek(closestIndex);
                }}
                className="w-16 px-2 py-1 bg-gray-700 text-white rounded text-sm text-center"
                disabled={!trajectoryData.length}
              />
              <span className="text-sm text-gray-400">s</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="relative w-full">
            <input
              type="range"
              min="0"
              max={lastIndex}
              value={currentIndex}
              onChange={(e) => handleSeek(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              disabled={!trajectoryData.length}
            />
            <div
              className="absolute top-0 left-0 h-3 bg-blue-500 rounded-l-lg pointer-events-none"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-400 mt-1">
            <span>Frame: {currentIndex} / {lastIndex}</span>
            <span>Progress: {progress.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Information Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Basic Info */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
            <Clock size={16} />
            Current State
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Time:</span>
                <span className="text-white font-mono">{(currentPoint.time || 0).toFixed(2)}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Position:</span>
                <span className="text-white font-mono">
                  ({(currentPoint.x || 0).toFixed(2)}, {(currentPoint.y || 0).toFixed(2)})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Heading:</span>
                <span className="text-white font-mono">
                  {((currentPoint.rotation || 0) * 180 / Math.PI).toFixed(1)}°
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 flex items-center gap-1">
                  <Zap size={14} />
                  Velocity:
                </span>
                <span className="text-green-400 font-mono">{(currentPoint.velocity || 0).toFixed(2)} m/s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 flex items-center gap-1">
                  <TrendingUp size={14} />
                  Acceleration:
                </span>
                <span className={`font-mono ${(currentPoint.acceleration || 0) >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                  {(currentPoint.acceleration || 0).toFixed(2)} m/s²
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Curvature:</span>
                <span className="text-purple-400 font-mono">{(currentPoint.curvature || 0).toFixed(4)} m⁻¹</span>
              </div>
            </div>
          </div>

          {/* Mini Field Preview */}
          <div className="mt-4 pt-4 border-t border-gray-600">
            <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
              <MapPin size={14} />
              Mini Field Preview
            </div>
            <div className="relative w-full h-32 bg-gray-900 rounded border border-gray-600 overflow-hidden">
              {/* Mini field representation */}
              <div className="absolute inset-1 bg-green-900 rounded-sm">
                {/* Field grid */}
                <div className="absolute inset-0 opacity-20">
                  {[...Array(5)].map((_, i) => (
                    <div key={`v-${i}`} className="absolute h-full w-px bg-white"
                         style={{ left: `${(i + 1) * 20}%` }} />
                  ))}
                  {[...Array(3)].map((_, i) => (
                    <div key={`h-${i}`} className="absolute w-full h-px bg-white"
                         style={{ top: `${(i + 1) * 25}%` }} />
                  ))}
                </div>

                {/* Trajectory path */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path
                    d={trajectoryData.slice(0, 50).map((point, index) => {
                      const x = ((point.x / fieldDimensions.width) * 100);
                      const y = 100 - ((point.y / fieldDimensions.height) * 100);
                      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    stroke="#3b82f6"
                    strokeWidth="1"
                    fill="none"
                  />
                </svg>

                {/* Current robot position */}
                <div
                  className="absolute w-3 h-3 bg-red-500 rounded-full border border-white"
                  style={{
                    left: `${((currentPoint.x || 0) / fieldDimensions.width) * 100}%`,
                    top: `${(1 - (currentPoint.y || 0) / fieldDimensions.height) * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  title={`Robot at (${(currentPoint.x || 0).toFixed(2)}, ${(currentPoint.y || 0).toFixed(2)})`}
                />
              </div>
            </div>
          </div>

          {/* Robot Specifications */}
          <div className="mt-4 pt-4 border-t border-gray-600">
            <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
              <Activity size={14} />
              Robot Specifications
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Max Velocity:</span>
                <span className="text-green-400">3.8 m/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Max Acceleration:</span>
                <span className="text-blue-400">±2.5 m/s²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Max Jerk:</span>
                <span className="text-purple-400">10.0 m/s³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Wheel Base:</span>
                <span className="text-orange-400">0.6 m</span>
              </div>
            </div>
          </div>

          {/* Path Analysis */}
          <div className="mt-4 pt-4 border-t border-gray-600">
            <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
              <BarChart size={14} />
              Path Analysis
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Smoothness:</span>
                <span className={`font-mono ${
                  trajectoryData.length ?
                    (trajectoryData.reduce((sum, p, i) =>
                      i > 0 ? sum + Math.abs(p.acceleration - trajectoryData[i-1].acceleration) : sum, 0) / trajectoryData.length < 1 ?
                      'text-green-400' : 'text-yellow-400') : 'text-gray-500'
                }`}>
                  {trajectoryData.length ?
                    (trajectoryData.reduce((sum, p, i) =>
                      i > 0 ? sum + Math.abs(p.acceleration - trajectoryData[i-1].acceleration) : sum, 0) / trajectoryData.length).toFixed(2) :
                    'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Avg Curvature:</span>
                <span className="text-purple-400 font-mono">
                  {trajectoryData.length ?
                    (trajectoryData.reduce((sum, p) => sum + Math.abs(p.curvature || 0), 0) / trajectoryData.length).toFixed(4) :
                    '0.0000'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Path Length:</span>
                <span className="text-blue-400 font-mono">
                  {trajectoryData.length > 1 ?
                    trajectoryData.slice(1).reduce((length, point, i) => {
                      const prev = trajectoryData[i];
                      const dx = point.x - prev.x;
                      const dy = point.y - prev.y;
                      return length + Math.sqrt(dx * dx + dy * dy);
                    }, 0).toFixed(2) : '0.00'} m
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Efficiency:</span>
                <span className={`font-mono ${
                  trajectoryData.length && constraintViolations.total === 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {trajectoryData.length ?
                    Math.max(0, 100 - (constraintViolations.total / trajectoryData.length * 100)).toFixed(1) : '0.0'}%
                </span>
              </div>
            </div>
          </div>

          {/* Control Summary */}
          <div className="mt-4 pt-4 border-t border-gray-600">
            <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
              <Target size={14} />
              Control Summary
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Navigation:</span>
                <span className="text-white">Frame/Time Input</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Quick Jump:</span>
                <span className="text-white">⟪ ⟪10 10⟫ ⟫</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Keyboard:</span>
                <span className="text-white">← → R L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Export:</span>
                <span className="text-white">Frame Images</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation Controls */}
          <div className="mt-4 pt-4 border-t border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Quick Navigation</span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleSeek(0)}
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs text-white rounded"
                  disabled={!trajectoryData.length}
                  title="First Frame"
                >
                  ⟪
                </button>
                <button
                  onClick={() => handleSeek(Math.max(0, currentIndex - 10))}
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs text-white rounded"
                  disabled={!trajectoryData.length || currentIndex < 10}
                  title="Back 10 Frames"
                >
                  ⟪ 10
                </button>
                <button
                  onClick={() => handleSeek(Math.min(lastIndex, currentIndex + 10))}
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs text-white rounded"
                  disabled={!trajectoryData.length || currentIndex > lastIndex - 10}
                  title="Forward 10 Frames"
                >
                  10 ⟫
                </button>
                <button
                  onClick={() => handleSeek(lastIndex)}
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs text-white rounded"
                  disabled={!trajectoryData.length}
                  title="Last Frame"
                >
                  ⟫
                </button>
              </div>
            </div>

            {/* Time Markers */}
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <span className="text-gray-500">Key Times:</span>
                {trajectoryData.length > 0 && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSeek(Math.floor(lastIndex * 0.25))}
                      className="text-blue-400 hover:text-blue-300 underline"
                      title="25% through trajectory"
                    >
                      25%
                    </button>
                    <button
                      onClick={() => handleSeek(Math.floor(lastIndex * 0.5))}
                      className="text-blue-400 hover:text-blue-300 underline"
                      title="50% through trajectory"
                    >
                      50%
                    </button>
                    <button
                      onClick={() => handleSeek(Math.floor(lastIndex * 0.75))}
                      className="text-blue-400 hover:text-blue-300 underline"
                      title="75% through trajectory"
                    >
                      75%
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Stats */}
            <div className="mt-3 pt-3 border-t border-gray-600">
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="text-center">
                  <div className="text-gray-500">Frame Rate</div>
                  <div className="text-green-400 font-mono">30 FPS</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500">Data Points</div>
                  <div className="text-blue-400 font-mono">{trajectoryData.length}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500">Status</div>
                  <div className={`font-mono ${trajectoryData.length ? 'text-green-400' : 'text-red-400'}`}>
                    {trajectoryData.length ? 'Ready' : 'No Data'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Metrics */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-md font-semibold text-white mb-3 flex items-center gap-2 hover:text-blue-400"
          >
            <Settings size={16} />
            Advanced Metrics
            <span className={`transform transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>▶</span>
          </button>

          {showAdvanced && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Angular Velocity:</div>
                  <div className="text-white font-mono">
                    {currentPoint.calculatedAngVel ? (currentPoint.calculatedAngVel * 180 / Math.PI).toFixed(2) : 'N/A'} °/s
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Centripetal Accel:</div>
                  <div className="text-orange-400 font-mono">
                    {currentPoint.centripetalAccel ? currentPoint.centripetalAccel.toFixed(2) : 'N/A'} m/s²
                  </div>
                </div>
              </div>

              {/* Mini Charts */}
              <div className="mt-4 space-y-4">
                {/* Velocity Chart */}
                <div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <BarChart3 size={14} />
                    Velocity Profile
                  </div>
                  <div className="h-12 bg-gray-700 rounded p-2">
                    <div className="flex items-end h-full space-x-px">
                      {trajectoryData.slice(0, 50).map((point, index) => {
                        const height = Math.min(100, Math.max(0, (point.velocity || 0) / 4 * 100));
                        const isCurrent = index === currentIndex;
                        const violatesVelocity = point.velocity > 3.8; // Max velocity constraint
                        return (
                          <div
                            key={index}
                            className={`flex-1 rounded-sm transition-all duration-150 ${
                              violatesVelocity ? 'bg-red-500' :
                              isCurrent ? 'bg-green-400' : 'bg-blue-500'
                            }`}
                            style={{ height: `${height}%`, minHeight: '2px' }}
                            title={`Frame ${index}: ${(point.velocity || 0).toFixed(2)} m/s ${violatesVelocity ? '(VIOLATION!)' : ''}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Acceleration Chart */}
                <div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <TrendingUp size={14} />
                    Acceleration Profile
                  </div>
                  <div className="h-16 bg-gray-700 rounded p-2">
                    <div className="flex items-center justify-center h-full space-x-px relative">
                      {/* Center line */}
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-600"></div>
                      {trajectoryData.slice(0, 50).map((point, index) => {
                        const accel = point.acceleration || 0;
                        // Scale acceleration for better visibility (multiply by 10 for display)
                        const scaledAccel = accel * 10;
                        const barHeight = Math.min(60, Math.max(4, Math.abs(scaledAccel)));
                        const isCurrent = index === currentIndex;
                        const violatesAccel = Math.abs(accel) > 2.5;
                        return (
                          <div
                            key={index}
                            className={`flex-1 rounded-sm transition-all duration-150 ${
                              violatesAccel ? 'bg-red-500' :
                              isCurrent ? 'bg-green-400' : accel >= 0 ? 'bg-blue-500' : 'bg-orange-500'
                            }`}
                            style={{
                              height: `${barHeight}px`,
                              marginTop: accel >= 0 ? `${30 - barHeight/2}px` : `${30 + barHeight/2}px`,
                              position: 'relative'
                            }}
                            title={`Frame ${index}: ${accel.toFixed(3)} m/s² ${violatesAccel ? '(VIOLATION!)' : ''}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>-2.5 m/s²</span>
                    <span>0</span>
                    <span>+2.5 m/s²</span>
                  </div>
                </div>

                {/* Keyboard Shortcuts Info */}
                <div className="mt-4 p-3 bg-gray-700 rounded">
                  <div className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                    <Target size={14} />
                    Keyboard Shortcuts
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Space:</span>
                      <span className="text-white">Play/Pause</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">← →:</span>
                      <span className="text-white">Step</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">R:</span>
                      <span className="text-white">Reset</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">L:</span>
                      <span className="text-white">Loop</span>
                    </div>
                  </div>
                </div>

                {/* Trajectory Stats */}
                <div className="p-3 bg-gray-700 rounded">
                  <div className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                    <Timer size={14} />
                    Trajectory Stats
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-gray-500">Total Points</div>
                      <div className="text-white font-mono">{trajectoryData.length}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Avg Velocity</div>
                      <div className="text-green-400 font-mono">
                        {trajectoryData.length ?
                          (trajectoryData.reduce((sum, p) => sum + (p.velocity || 0), 0) / trajectoryData.length).toFixed(2) :
                          '0.00'} m/s
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Max Velocity</div>
                      <div className="text-green-400 font-mono">
                        {trajectoryData.length ?
                          Math.max(...trajectoryData.map(p => p.velocity || 0)).toFixed(2) :
                          '0.00'} m/s
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Duration</div>
                      <div className="text-blue-400 font-mono">
                        {trajectoryData.length ?
                          trajectoryData[trajectoryData.length - 1].time.toFixed(2) :
                          '0.00'} s
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Table */}
                <div className="p-3 bg-gray-700 rounded max-h-64 overflow-y-auto">
                  <div className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                    <Table size={14} />
                    Trajectory Data Table
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-gray-700">
                        <tr className="text-gray-300 border-b border-gray-600">
                          <th className="px-2 py-1 text-left">#</th>
                          <th className="px-2 py-1 text-left">Time</th>
                          <th className="px-2 py-1 text-left">X</th>
                          <th className="px-2 py-1 text-left">Y</th>
                          <th className="px-2 py-1 text-left">Vel</th>
                          <th className="px-2 py-1 text-left">Accel</th>
                          <th className="px-2 py-1 text-left">Heading</th>
                          <th className="px-2 py-1 text-left">Curv</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trajectoryData.slice(0, 100).map((point, index) => {
                          const violatesVelocity = point.velocity > 3.8;
                          const violatesAccel = Math.abs(point.acceleration || 0) > 2.5;
                          const isCurrent = index === currentIndex;
                          return (
                            <tr
                              key={index}
                              className={`border-b border-gray-600 hover:bg-gray-600 cursor-pointer ${
                                isCurrent ? 'bg-blue-900' : ''
                              }`}
                              onClick={() => handleSeek(index)}
                            >
                              <td className="px-2 py-1 text-gray-400">{index}</td>
                              <td className="px-2 py-1 text-white font-mono">{point.time?.toFixed(2) || '0.00'}</td>
                              <td className="px-2 py-1 text-white font-mono">{point.x?.toFixed(2) || '0.00'}</td>
                              <td className="px-2 py-1 text-white font-mono">{point.y?.toFixed(2) || '0.00'}</td>
                              <td className={`px-2 py-1 font-mono ${violatesVelocity ? 'text-red-400' : 'text-green-400'}`}>
                                {point.velocity?.toFixed(2) || '0.00'}
                              </td>
                              <td className={`px-2 py-1 font-mono ${violatesAccel ? 'text-red-400' : point.acceleration >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                                {point.acceleration?.toFixed(2) || '0.00'}
                              </td>
                              <td className="px-2 py-1 text-white font-mono">
                                {((point.rotation || 0) * 180 / Math.PI).toFixed(1)}°
                              </td>
                              <td className="px-2 py-1 text-purple-400 font-mono">
                                {point.curvature?.toFixed(4) || '0.0000'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {trajectoryData.length > 100 && (
                    <div className="text-xs text-gray-500 mt-2 text-center">
                      Showing first 100 of {trajectoryData.length} points
                    </div>
                  )}
                </div>

                {/* Additional Features */}
                <div className="space-y-3 pt-3 border-t border-gray-600">
                  {/* Frame/Time Counter */}
                  <div className="p-3 bg-gray-700 rounded">
                    <div className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                      <Gauge size={14} />
                      Frame Counter & Performance
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Current Frame</div>
                        <div className="text-white font-mono text-lg">{currentIndex} / {lastIndex}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Current Time</div>
                        <div className="text-blue-400 font-mono text-lg">{(currentPoint.time || 0).toFixed(3)}s</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Playback Speed</div>
                        <div className="text-green-400 font-mono">{speed}x</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Loop Mode</div>
                        <div className={`font-mono ${isLooping ? 'text-green-400' : 'text-gray-500'}`}>
                          {isLooping ? 'ON' : 'OFF'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Constraint Violations Summary */}
                  <div className="p-3 bg-gray-700 rounded">
                    <div className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                      <AlertTriangle size={14} />
                      Constraint Violations
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-red-400 font-mono text-xl">{constraintViolations.velocity}</div>
                        <div className="text-gray-500 text-xs">Velocity</div>
                        <div className="text-gray-600 text-xs">> 3.8 m/s</div>
                      </div>
                      <div className="text-center">
                        <div className="text-orange-400 font-mono text-xl">{constraintViolations.acceleration}</div>
                        <div className="text-gray-500 text-xs">Acceleration</div>
                        <div className="text-gray-600 text-xs">> ±2.5 m/s²</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-mono text-xl ${constraintViolations.total > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {constraintViolations.total}
                        </div>
                        <div className="text-gray-500 text-xs">Total</div>
                        <div className="text-gray-600 text-xs">Violations</div>
                      </div>
                    </div>
                  </div>

                  {/* Export & Tools */}
                  <div className="flex gap-2">
                    <button
                      onClick={exportCurrentFrame}
                      disabled={!trajectoryData.length}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                      title="Export current frame as PNG image"
                    >
                      <Download size={16} />
                      Export Frame
                    </button>
                    <button
                      onClick={() => {
                        const timestamp = new Date().toLocaleTimeString();
                        navigator.clipboard.writeText(
                          `Frame: ${currentIndex}/${lastIndex}\n` +
                          `Time: ${(currentPoint.time || 0).toFixed(3)}s\n` +
                          `Position: (${(currentPoint.x || 0).toFixed(2)}, ${(currentPoint.y || 0).toFixed(2)})\n` +
                          `Velocity: ${(currentPoint.velocity || 0).toFixed(2)} m/s\n` +
                          `Acceleration: ${(currentPoint.acceleration || 0).toFixed(2)} m/s²\n` +
                          `Heading: ${((currentPoint.rotation || 0) * 180 / Math.PI).toFixed(1)}°`
                        );
                        // Simple notification
                        alert('Current frame data copied to clipboard!');
                      }}
                      disabled={!trajectoryData.length}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                      title="Copy current frame data to clipboard"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!trajectoryData.length && (
        <div className="bg-yellow-900/20 border border-yellow-600 text-yellow-200 p-4 rounded-lg text-center">
          <MapPin size={24} className="mx-auto mb-2" />
          <div className="font-semibold">No trajectory data available</div>
          <div className="text-sm text-yellow-300 mt-1">Please load a trajectory file to visualize the path</div>
        </div>
      )}
    </div>
  );
};

export default RealTimeVisualization;
