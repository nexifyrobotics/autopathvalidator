import React, { useMemo } from 'react';
import { useGame } from '../contexts/GameContext.jsx';

export default function FieldRenderer({ trajectory, showCoordinates = false, width = 800, height = 400 }) {
  const gameConfig = useGame();
  const field = gameConfig.field;
  const elements = field.elements;

  // Calculate scaling factors
  const scaleX = (width - 40) / field.width;
  const scaleY = (height - 40) / field.length;
  const scale = Math.min(scaleX, scaleY);

  // Convert field coordinates to SVG coordinates
  const toSvgX = (x) => 20 + x * scaleX;
  const toSvgY = (y) => height - (20 + y * scaleY);

  const fieldSvg = useMemo(() => {
    return (
      <svg
        className="field-renderer"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ border: '1px solid #374151', borderRadius: '8px', background: '#e0e0e0' }}
      >
        {/* Define patterns and gradients */}
        <defs>
          <pattern id="grid" width={scaleX} height={scaleY} patternUnits="userSpaceOnUse">
            <path d={`M ${scaleX} 0 L 0 0 0 ${scaleY}`} fill="none" stroke="rgba(200,200,200,0.1)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Field background and grid */}
        <rect width={width} height={height} fill="#e0e0e0" />
        <rect width={width} height={height} fill="url(#grid)" />

        {/* Alliance zones */}
        <rect
          x={20}
          y={20}
          width={field.width * scaleX * 0.3}
          height={field.length * scaleY}
          fill="rgba(0, 100, 200, 0.05)"
        />
        <rect
          x={20 + field.width * scaleX * 0.7}
          y={20}
          width={field.width * scaleX * 0.3}
          height={field.length * scaleY}
          fill="rgba(200, 50, 50, 0.05)"
        />

        {/* Center line */}
        <line
          x1={toSvgX(field.width / 2)}
          y1={20}
          x2={toSvgX(field.width / 2)}
          y2={height - 20}
          stroke="#333"
          strokeWidth="1"
          strokeDasharray="4 2"
        />

        {/* Render game-specific field elements */}
        <g className="field-elements">
          {renderFieldElements(elements, gameConfig.year, toSvgX, toSvgY)}
        </g>

        {/* Render trajectory if provided */}
        {trajectory && trajectory.length > 0 && (
          <g className="trajectory-path">
            {renderTrajectory(trajectory, toSvgX, toSvgY)}
          </g>
        )}

        {/* Render coordinates if requested */}
        {showCoordinates && (
          <g className="coordinates" fontSize="12" fill="#666" textAnchor="start">
            <text x={25} y={35}>(0, 0)</text>
            <text x={width - 80} y={height - 15}>
              ({field.width.toFixed(1)}, {field.length.toFixed(1)})
            </text>
          </g>
        )}
      </svg>
    );
  }, [field, elements, gameConfig.year, trajectory, width, height, scaleX, scaleY]);

  return <div className="field-renderer-container">{fieldSvg}</div>;
}

// Helper function to render field elements based on game year
function renderFieldElements(elements, gameYear, toSvgX, toSvgY) {
  if (gameYear === 2025) {
    return (
      <>
        {/* Reef */}
        {elements.reef && (
          <circle
            cx={toSvgX(elements.reef.x)}
            cy={toSvgY(elements.reef.y)}
            r={elements.reef.radius * 40}
            fill={elements.reef.color}
            stroke="#666"
            strokeWidth="1"
          />
        )}

        {/* Barge */}
        {elements.barge && (
          <rect
            x={toSvgX(elements.barge.x - elements.barge.width / 2)}
            y={toSvgY(elements.barge.y + elements.barge.height / 2)}
            width={elements.barge.width * 40}
            height={elements.barge.height * 40}
            fill={elements.barge.color}
            stroke="#666"
            strokeWidth="1"
          />
        )}

        {/* Processor */}
        {elements.processor && (
          <rect
            x={toSvgX(elements.processor.x - elements.processor.width / 2)}
            y={toSvgY(elements.processor.y + elements.processor.height / 2)}
            width={elements.processor.width * 40}
            height={elements.processor.height * 40}
            fill={elements.processor.color}
            stroke="#666"
            strokeWidth="1"
          />
        )}

        {/* Net */}
        {elements.net && (
          <rect
            x={toSvgX(elements.net.x - elements.net.width / 2)}
            y={toSvgY(elements.net.y + elements.net.height / 2)}
            width={elements.net.width * 40}
            height={elements.net.height * 40}
            fill={elements.net.color}
            stroke="#666"
            strokeWidth="1"
          />
        )}
      </>
    );
  }

  if (gameYear === 2026) {
    return (
      <>
        {/* HUBs */}
        {elements.hubs?.map((hub, i) => (
          <circle
            key={`hub-${i}`}
            cx={toSvgX(hub.x)}
            cy={toSvgY(hub.y)}
            r={hub.radius * 40}
            fill={hub.color}
            stroke={hub.alliance === 'blue' ? '#0064c8' : '#c83232'}
            strokeWidth="2"
          />
        ))}

        {/* TOWER */}
        {elements.tower && (
          <>
            <circle
              cx={toSvgX(elements.tower.x)}
              cy={toSvgY(elements.tower.y)}
              r={elements.tower.radius * 40}
              fill={elements.tower.color}
              stroke="#666"
              strokeWidth="2"
            />
            {/* Tower height markers */}
            <circle
              cx={toSvgX(elements.tower.x)}
              cy={toSvgY(elements.tower.y)}
              r={8}
              fill="none"
              stroke="#999"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          </>
        )}

        {/* TRENches */}
        {elements.trenches?.map((trench, i) => (
          <rect
            key={`trench-${i}`}
            x={toSvgX(trench.x - trench.width / 2)}
            y={toSvgY(trench.y + trench.length / 2)}
            width={trench.width * 40}
            height={trench.length * 40}
            fill="rgba(100, 100, 100, 0.15)"
            stroke="#888"
            strokeWidth="1"
          />
        ))}

        {/* BUMPs */}
        {elements.bumps?.map((bump, i) => (
          <line
            key={`bump-${i}`}
            x1={toSvgX(bump.x - bump.width / 2)}
            y1={toSvgY(bump.y)}
            x2={toSvgX(bump.x + bump.width / 2)}
            y2={toSvgY(bump.y)}
            stroke="#999"
            strokeWidth="3"
            opacity="0.7"
          />
        ))}

        {/* DEPOTs */}
        {elements.depots?.map((depot, i) => (
          <rect
            key={`depot-${i}`}
            x={toSvgX(depot.x - depot.width / 2)}
            y={toSvgY(depot.y + depot.length / 2)}
            width={depot.width * 40}
            height={depot.length * 40}
            fill={depot.alliance === 'blue' ? 'rgba(0, 100, 200, 0.2)' : 'rgba(200, 50, 50, 0.2)'}
            stroke={depot.alliance === 'blue' ? '#0064c8' : '#c83232'}
            strokeWidth="1"
          />
        ))}
      </>
    );
  }

  return null;
}

// Helper function to render trajectory path
function renderTrajectory(trajectory, toSvgX, toSvgY) {
  if (trajectory.length < 2) return null;

  const points = trajectory
    .filter(state => state.x !== undefined && state.y !== undefined)
    .map(state => {
      const x = state.pose?.translation?.x || state.x;
      const y = state.pose?.translation?.y || state.y;
      return `${toSvgX(x)},${toSvgY(y)}`;
    })
    .join(' ');

  return (
    <polyline
      points={points}
      fill="none"
      stroke="#ff6b6b"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.8"
    />
  );
}
