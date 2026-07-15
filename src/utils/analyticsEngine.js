// Game-aware analytics and insights engine

export function analyzeTrajectory(trajectory, gameConfig) {
  if (!trajectory || !gameConfig || trajectory.length === 0) {
    return { score: 0, insights: [], gameYear: '2025' };
  }

  const gameYear = gameConfig.year;
  const insights = [];

  if (gameYear === 2025) {
    insights.push(...analyze2025Trajectory(trajectory, gameConfig));
  } else if (gameYear === 2026) {
    insights.push(...analyze2026Trajectory(trajectory, gameConfig));
  }

  const score = calculateAnalyticsScore(insights);

  return {
    score,
    insights,
    gameYear,
    passedAnalysis: insights.filter(i => i.severity === 'error').length === 0
  };
}

function analyze2025Trajectory(trajectory, gameConfig) {
  const insights = [];
  const field = gameConfig.field;

  // Extract trajectory coordinates
  const trajectoryPoints = trajectory.map(state => ({
    x: state.pose?.translation?.x || state.x || 0,
    y: state.pose?.translation?.y || state.y || 0,
    velocity: state.velocity || 0
  }));

  // Analyze reef approach
  if (field.elements.reef) {
    const reefDist = getMinDistanceToPoint(trajectoryPoints, field.elements.reef);
    if (reefDist < field.elements.reef.radius + 0.5) {
      insights.push({
        type: 'reef-approach',
        severity: 'good',
        message: `Strong reef approach (${reefDist.toFixed(2)}m away)`,
        value: reefDist,
        estimatedPoints: 2
      });
    }
  }

  // Analyze barge approach
  if (field.elements.barge) {
    const bargeDist = getMinDistanceToBox(trajectoryPoints, field.elements.barge);
    if (bargeDist < 1.0) {
      insights.push({
        type: 'barge-approach',
        severity: 'good',
        message: `Barge climb setup detected (${bargeDist.toFixed(2)}m away)`,
        value: bargeDist,
        estimatedPoints: 6
      });
    }
  }

  // Check velocity smoothness
  const velocitySmoothness = calculateVelocitySmoothness(trajectoryPoints);
  if (velocitySmoothness > 0.8) {
    insights.push({
      type: 'smooth-motion',
      severity: 'good',
      message: `Excellent motion smoothness (${(velocitySmoothness * 100).toFixed(0)}%)`,
      value: velocitySmoothness
    });
  } else if (velocitySmoothness < 0.5) {
    insights.push({
      type: 'jerky-motion',
      severity: 'warning',
      message: `Path has jerky motions (${(velocitySmoothness * 100).toFixed(0)}% smoothness)`,
      value: velocitySmoothness
    });
  }

  // Check trajectory efficiency
  const efficiency = calculatePathEfficiency(trajectoryPoints);
  if (efficiency > 0.8) {
    insights.push({
      type: 'efficient-path',
      severity: 'good',
      message: `Path is efficient (${(efficiency * 100).toFixed(0)}% efficiency)`,
      value: efficiency
    });
  }

  return insights;
}

function analyze2026Trajectory(trajectory, gameConfig) {
  const insights = [];
  const field = gameConfig.field;

  // Extract trajectory coordinates
  const trajectoryPoints = trajectory.map(state => ({
    x: state.pose?.translation?.x || state.x || 0,
    y: state.pose?.translation?.y || state.y || 0,
    velocity: state.velocity || 0
  }));

  // Analyze tower reachability
  if (field.elements.tower) {
    const towerDist = getMinDistanceToPoint(trajectoryPoints, field.elements.tower);
    const canReachTower = towerDist < field.elements.tower.radius + 1.0;

    if (canReachTower) {
      insights.push({
        type: 'tower-reachable',
        severity: 'good',
        message: `Path reaches TOWER (${towerDist.toFixed(2)}m away)`,
        value: towerDist,
        estimatedPoints: 15,
        detail: 'Autonomous climb possible'
      });
    } else {
      insights.push({
        type: 'tower-unreachable',
        severity: 'warning',
        message: `Path does not reach TOWER (${towerDist.toFixed(2)}m away)`,
        value: towerDist,
        detail: 'Consider adjusting waypoints'
      });
    }
  }

  // Analyze hub approaches
  if (field.elements.hubs && field.elements.hubs.length > 0) {
    field.elements.hubs.forEach(hub => {
      const hubDist = getMinDistanceToPoint(trajectoryPoints, hub);

      if (hubDist < hub.radius + 0.5) {
        insights.push({
          type: 'hub-approach',
          severity: 'good',
          message: `Good ${hub.alliance} HUB approach (${hubDist.toFixed(2)}m away)`,
          value: hubDist,
          alliance: hub.alliance,
          estimatedPoints: 3,
          detail: `${hub.alliance === 'blue' ? 'Blue' : 'Red'} hub in range for fuel scoring`
        });
      }
    });
  }

  // Analyze depot accessibility
  if (field.elements.depots && field.elements.depots.length > 0) {
    field.elements.depots.forEach(depot => {
      const depotDist = getMinDistanceToBox(trajectoryPoints, depot);

      if (depotDist < depot.width + 0.5) {
        insights.push({
          type: 'depot-accessible',
          severity: 'good',
          message: `${depot.alliance} depot accessible (${depotDist.toFixed(2)}m away)`,
          value: depotDist,
          estimatedPoints: 3,
          detail: 'Fuel collection possible'
        });
      }
    });
  }

  // Analyze trench navigation
  if (field.elements.trenches && field.elements.trenches.length > 0) {
    field.elements.trenches.forEach((trench, i) => {
      const trenchProximity = getMinDistanceToBox(trajectoryPoints, trench);
      if (trenchProximity < 0.5) {
        insights.push({
          type: 'trench-navigation',
          severity: 'good',
          message: `Successfully navigated trench ${i + 1}`,
          value: trenchProximity
        });
      }
    });
  }

  // Check for smooth motion
  const velocitySmoothness = calculateVelocitySmoothness(trajectoryPoints);
  if (velocitySmoothness > 0.85) {
    insights.push({
      type: 'excellent-smoothness',
      severity: 'good',
      message: `Excellent motion smoothness (${(velocitySmoothness * 100).toFixed(0)}%)`,
      value: velocitySmoothness
    });
  }

  // Check trajectory time efficiency
  const timeEfficiency = calculateTimeEfficiency(trajectory);
  if (timeEfficiency > 0.9) {
    insights.push({
      type: 'time-efficient',
      severity: 'good',
      message: `Path is time-efficient (${(timeEfficiency * 100).toFixed(0)}% of theoretical minimum)`,
      value: timeEfficiency
    });
  }

  // Estimate total match strategy score
  const estimatedAutoPoints = insights
    .filter(i => i.type.includes('tower') || i.type.includes('hub'))
    .reduce((sum, i) => sum + (i.estimatedPoints || 0), 0);

  if (estimatedAutoPoints > 15) {
    insights.push({
      type: 'high-scoring-potential',
      severity: 'good',
      message: `High-scoring autonomous potential (~${estimatedAutoPoints} auto points estimated)`,
      value: estimatedAutoPoints
    });
  }

  return insights;
}

// Utility functions

function getMinDistanceToPoint(points, centerPoint) {
  let minDist = Infinity;
  points.forEach(p => {
    const dist = Math.hypot(p.x - centerPoint.x, p.y - centerPoint.y);
    minDist = Math.min(minDist, dist);
  });
  return minDist === Infinity ? 999 : minDist;
}

function getMinDistanceToBox(points, box) {
  let minDist = Infinity;
  const boxLeft = box.x - box.width / 2;
  const boxRight = box.x + box.width / 2;
  const boxTop = box.y - box.length / 2;
  const boxBottom = box.y + box.length / 2;

  points.forEach(p => {
    let dx = 0;
    let dy = 0;

    if (p.x < boxLeft) dx = boxLeft - p.x;
    else if (p.x > boxRight) dx = p.x - boxRight;

    if (p.y < boxTop) dy = boxTop - p.y;
    else if (p.y > boxBottom) dy = p.y - boxBottom;

    const dist = Math.hypot(dx, dy);
    minDist = Math.min(minDist, dist);
  });

  return minDist;
}

function calculateVelocitySmoothness(points) {
  if (points.length < 3) return 1.0;

  let velocityVariance = 0;
  for (let i = 1; i < points.length; i++) {
    const velChange = Math.abs(points[i].velocity - points[i - 1].velocity);
    velocityVariance += velChange;
  }

  velocityVariance /= points.length;
  // Normalize to 0-1 (lower variance = higher smoothness)
  return Math.max(0, 1 - velocityVariance / 2);
}

function calculatePathEfficiency(points) {
  if (points.length < 2) return 1.0;

  // Calculate total path distance
  let totalDistance = 0;
  for (let i = 1; i < points.length; i++) {
    totalDistance += Math.hypot(
      points[i].x - points[i - 1].x,
      points[i].y - points[i - 1].y
    );
  }

  // Calculate straight-line distance
  const straightLine = Math.hypot(
    points[points.length - 1].x - points[0].x,
    points[points.length - 1].y - points[0].y
  );

  // Efficiency = straight-line / actual (capped at 1.0)
  return Math.min(1.0, straightLine / (totalDistance + 0.001));
}

function calculateTimeEfficiency(trajectory) {
  if (trajectory.length < 2) return 1.0;

  const firstTime = trajectory[0].time || 0;
  const lastTime = trajectory[trajectory.length - 1].time || trajectory.length;
  const actualTime = lastTime - firstTime;

  // Theoretical minimum is based on distance / max velocity
  const lastState = trajectory[trajectory.length - 1];
  const firstState = trajectory[0];
  const distance = Math.hypot(
    (lastState.pose?.translation?.x || lastState.x || 0) - (firstState.pose?.translation?.x || firstState.x || 0),
    (lastState.pose?.translation?.y || lastState.y || 0) - (firstState.pose?.translation?.y || firstState.y || 0)
  );

  const maxVelocity = Math.max(...trajectory.map(t => t.velocity || 0), 1);
  const theoreticalMinTime = distance / maxVelocity;

  return Math.min(1.0, theoreticalMinTime / (actualTime + 0.001));
}

function calculateAnalyticsScore(insights) {
  let score = 50; // Base score

  insights.forEach(insight => {
    if (insight.severity === 'good') {
      score += 10;
    } else if (insight.severity === 'warning') {
      score -= 5;
    } else if (insight.severity === 'error') {
      score -= 15;
    }
  });

  return Math.max(0, Math.min(100, score));
}
