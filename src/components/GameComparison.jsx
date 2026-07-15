import React, { useMemo } from 'react';
import { getGameConfig } from '../config/gameConfig.js';
import { BarChart3, TrendingUp, Target } from 'lucide-react';

export default function GameComparison({ trajectory2025, trajectory2026 }) {
  const gameConfig2025 = useMemo(() => getGameConfig('2025'), []);
  const gameConfig2026 = useMemo(() => getGameConfig('2026'), []);

  // Calculate metrics for 2025 path
  const metrics2025 = useMemo(() => {
    if (!trajectory2025 || trajectory2025.length === 0) {
      return { distance: 0, time: 0, avgVelocity: 0, maxVelocity: 0 };
    }

    let totalDistance = 0;
    let maxVel = 0;
    let sumVel = 0;

    for (let i = 1; i < trajectory2025.length; i++) {
      const curr = trajectory2025[i];
      const prev = trajectory2025[i - 1];
      const dx = (curr.x || 0) - (prev.x || 0);
      const dy = (curr.y || 0) - (prev.y || 0);
      totalDistance += Math.hypot(dx, dy);

      const vel = curr.velocity || 0;
      maxVel = Math.max(maxVel, vel);
      sumVel += vel;
    }

    const avgVel = sumVel / trajectory2025.length;
    const time = trajectory2025[trajectory2025.length - 1]?.time || trajectory2025.length / 50;

    return {
      distance: totalDistance.toFixed(2),
      time: time.toFixed(2),
      avgVelocity: avgVel.toFixed(2),
      maxVelocity: maxVel.toFixed(2),
      pointCount: trajectory2025.length
    };
  }, [trajectory2025]);

  // Calculate metrics for 2026 path
  const metrics2026 = useMemo(() => {
    if (!trajectory2026 || trajectory2026.length === 0) {
      return { distance: 0, time: 0, avgVelocity: 0, maxVelocity: 0 };
    }

    let totalDistance = 0;
    let maxVel = 0;
    let sumVel = 0;

    for (let i = 1; i < trajectory2026.length; i++) {
      const curr = trajectory2026[i];
      const prev = trajectory2026[i - 1];
      const dx = (curr.x || 0) - (prev.x || 0);
      const dy = (curr.y || 0) - (prev.y || 0);
      totalDistance += Math.hypot(dx, dy);

      const vel = curr.velocity || 0;
      maxVel = Math.max(maxVel, vel);
      sumVel += vel;
    }

    const avgVel = sumVel / trajectory2026.length;
    const time = trajectory2026[trajectory2026.length - 1]?.time || trajectory2026.length / 50;

    return {
      distance: totalDistance.toFixed(2),
      time: time.toFixed(2),
      avgVelocity: avgVel.toFixed(2),
      maxVelocity: maxVel.toFixed(2),
      pointCount: trajectory2026.length
    };
  }, [trajectory2026]);

  return (
    <div className="game-comparison">
      <div className="comparison-header">
        <h2 className="text-2xl font-bold">Strategy Comparison</h2>
        <p className="text-gray-400 text-sm">Compare 2025 vs 2026 path strategies</p>
      </div>

      <div className="comparison-grid">
        {/* 2025 Game Column */}
        <div className="comparison-column">
          <div className="game-header-card">
            <div className="game-title-section">
              <h3 className="game-title">2025 Reefscape</h3>
              <p className="game-subtitle">Coral • Algae • Barge</p>
            </div>
          </div>

          {trajectory2025 && trajectory2025.length > 0 ? (
            <>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon">
                    <TrendingUp size={20} />
                  </div>
                  <div className="metric-content">
                    <span className="metric-label">Distance</span>
                    <span className="metric-value">{metrics2025.distance}m</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">
                    <BarChart3 size={20} />
                  </div>
                  <div className="metric-content">
                    <span className="metric-label">Time</span>
                    <span className="metric-value">{metrics2025.time}s</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">
                    <Target size={20} />
                  </div>
                  <div className="metric-content">
                    <span className="metric-label">Max Velocity</span>
                    <span className="metric-value">{metrics2025.maxVelocity} m/s</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">
                    <BarChart3 size={20} />
                  </div>
                  <div className="metric-content">
                    <span className="metric-label">Avg Velocity</span>
                    <span className="metric-value">{metrics2025.avgVelocity} m/s</span>
                  </div>
                </div>
              </div>

              <div className="strategy-info">
                <h4 className="info-title">Game Elements</h4>
                <div className="elements-list">
                  <div className="element-badge">Reef Scoring</div>
                  <div className="element-badge">Algae Collection</div>
                  <div className="element-badge">Barge Climb</div>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>No 2025 trajectory loaded</p>
              <p className="text-xs text-gray-400">Upload a trajectory to compare</p>
            </div>
          )}
        </div>

        {/* 2026 Game Column */}
        <div className="comparison-column">
          <div className="game-header-card rebuilt">
            <div className="game-title-section">
              <h3 className="game-title">2026 REBUILT</h3>
              <p className="game-subtitle">FUEL • TOWER • Strategy</p>
            </div>
          </div>

          {trajectory2026 && trajectory2026.length > 0 ? (
            <>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon">
                    <TrendingUp size={20} />
                  </div>
                  <div className="metric-content">
                    <span className="metric-label">Distance</span>
                    <span className="metric-value">{metrics2026.distance}m</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">
                    <BarChart3 size={20} />
                  </div>
                  <div className="metric-content">
                    <span className="metric-label">Time</span>
                    <span className="metric-value">{metrics2026.time}s</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">
                    <Target size={20} />
                  </div>
                  <div className="metric-content">
                    <span className="metric-label">Max Velocity</span>
                    <span className="metric-value">{metrics2026.maxVelocity} m/s</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">
                    <BarChart3 size={20} />
                  </div>
                  <div className="metric-content">
                    <span className="metric-label">Avg Velocity</span>
                    <span className="metric-value">{metrics2026.avgVelocity} m/s</span>
                  </div>
                </div>
              </div>

              <div className="strategy-info">
                <h4 className="info-title">Game Elements</h4>
                <div className="elements-list">
                  <div className="element-badge">FUEL Scoring</div>
                  <div className="element-badge">TOWER Climb</div>
                  <div className="element-badge">Hub Switch</div>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>No 2026 trajectory loaded</p>
              <p className="text-xs text-gray-400">Upload a trajectory to compare</p>
            </div>
          )}
        </div>
      </div>

      {trajectory2025 && trajectory2026 && trajectory2025.length > 0 && trajectory2026.length > 0 && (
        <div className="comparison-summary">
          <h4 className="summary-title">Summary</h4>
          <div className="summary-content">
            <div className="summary-item">
              <span className="summary-label">2025 Path Length:</span>
              <span className="summary-value">{metrics2025.distance}m in {metrics2025.time}s</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">2026 Path Length:</span>
              <span className="summary-value">{metrics2026.distance}m in {metrics2026.time}s</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Time Difference:</span>
              <span className="summary-value">
                {Math.abs(parseFloat(metrics2026.time) - parseFloat(metrics2025.time)).toFixed(2)}s
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
