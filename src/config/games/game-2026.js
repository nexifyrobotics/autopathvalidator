export default {
  id: '2026',
  name: 'REBUILT',
  year: 2026,

  field: {
    width: 8.07,
    length: 16.54,
    name: '2026 REBUILT Arena',
    elements: {
      hubs: [
        {
          id: 'blue-hub',
          x: 2.0,
          y: 8.27,
          radius: 0.6,
          color: 'rgba(0, 100, 200, 0.3)',
          alliance: 'blue'
        },
        {
          id: 'red-hub',
          x: 6.07,
          y: 8.27,
          radius: 0.6,
          color: 'rgba(200, 50, 50, 0.3)',
          alliance: 'red'
        }
      ],
      tower: {
        x: 4.04,
        y: 8.27,
        radius: 0.8,
        heights: {
          LOW: 0.686,
          MID: 1.143,
          HIGH: 1.600
        },
        color: 'rgba(150, 150, 150, 0.3)'
      },
      trenches: [
        { x: 1.5, y: 2.0, width: 1.2, length: 3.0, id: 'trench-1' },
        { x: 6.5, y: 2.0, width: 1.2, length: 3.0, id: 'trench-2' },
        { x: 1.5, y: 14.5, width: 1.2, length: 3.0, id: 'trench-3' },
        { x: 6.5, y: 14.5, width: 1.2, length: 3.0, id: 'trench-4' }
      ],
      bumps: [
        { x: 1.0, y: 6.0, angle: 15, width: 1.8, id: 'bump-1' },
        { x: 7.0, y: 6.0, angle: -15, width: 1.8, id: 'bump-2' },
        { x: 1.0, y: 10.5, angle: 15, width: 1.8, id: 'bump-3' },
        { x: 7.0, y: 10.5, angle: -15, width: 1.8, id: 'bump-4' }
      ],
      depots: [
        {
          id: 'blue-depot',
          x: 0.5,
          y: 12.0,
          width: 0.8,
          length: 1.2,
          capacity: 50,
          alliance: 'blue'
        },
        {
          id: 'red-depot',
          x: 7.57,
          y: 12.0,
          width: 0.8,
          length: 1.2,
          capacity: 50,
          alliance: 'red'
        }
      ]
    }
  },

  constraints: {
    maxVelocity: 5.0,
    maxAcceleration: 3.0,
    maxJerk: 4.0,
    wheelDiameter: 0.1524,
    trackWidth: 0.5486,
    maxWheelSlip: 0.2
  },

  scoringMechanics: {
    fuel: {
      pointsPerBall: 1,
      maxPerHub: 50,
      ballDiameter: 0.15
    },
    towerClimb: {
      auto: 15,
      LOW: 10,
      MID: 20,
      HIGH: 30
    },
    hubActivation: {
      autonomous: 'both-active',
      teleop: 'alternating-25sec-phases',
      endgame: 'both-active-30sec'
    }
  },

  templates: [
    {
      id: 'tower-solo-high-auto',
      gameYear: 2026,
      name: 'Solo TOWER - HIGH (Auto)',
      description: 'Fast solo climb to HIGH level for 15 auto points during autonomous',
      difficulty: 'Hard',
      category: 'tower-climbing',
      tags: ['2026', 'tower', 'high', 'auto', '15pts', 'climbing'],
      waypoints: [
        { x: 2.0, y: 8.27 },
        { x: 3.0, y: 8.27 },
        { x: 3.5, y: 8.27 },
        { x: 4.04, y: 8.27 }
      ],
      strategy: {
        objective: 'TOWER_CLIMB',
        targetHeight: 'HIGH',
        estimatedPoints: 15,
        timingWindow: 'autonomous',
        robotCount: 1,
        complexity: 'hard'
      },
      starred: true
    },
    {
      id: 'depot-blue-hub-fuel',
      gameYear: 2026,
      name: 'Depot → Blue HUB (Fuel)',
      description: 'Collect FUEL from depot, score in Blue HUB during active phase',
      difficulty: 'Medium',
      category: 'fuel-scoring',
      tags: ['2026', 'fuel', 'hub', 'depot', 'teleop'],
      waypoints: [
        { x: 2.0, y: 8.27 },
        { x: 0.8, y: 12.0 },
        { x: 0.5, y: 12.0 },
        { x: 2.5, y: 8.27 }
      ],
      strategy: {
        objective: 'FUEL_SCORE',
        fuelCount: 3,
        estimatedPoints: 3,
        timingWindow: 'teleop-phase-1-3',
        complexity: 'medium'
      },
      starred: true
    },
    {
      id: 'tower-low-teleop',
      gameYear: 2026,
      name: 'TOWER - LOW (Teleop)',
      description: 'Teleop climb to LOW level for 10 points during driver control',
      difficulty: 'Easy',
      category: 'tower-climbing',
      tags: ['2026', 'tower', 'low', 'teleop', '10pts'],
      waypoints: [
        { x: 3.5, y: 8.27 },
        { x: 3.8, y: 8.27 },
        { x: 4.04, y: 8.27 }
      ],
      strategy: {
        objective: 'TOWER_CLIMB',
        targetHeight: 'LOW',
        estimatedPoints: 10,
        timingWindow: 'teleop',
        robotCount: 1,
        complexity: 'easy'
      },
      starred: false
    },
    {
      id: 'tower-mid-teleop',
      gameYear: 2026,
      name: 'TOWER - MID (Teleop)',
      description: 'Teleop climb to MID level for 20 points',
      difficulty: 'Medium',
      category: 'tower-climbing',
      tags: ['2026', 'tower', 'mid', 'teleop', '20pts'],
      waypoints: [
        { x: 3.5, y: 8.27 },
        { x: 3.8, y: 8.27 },
        { x: 4.04, y: 8.27 }
      ],
      strategy: {
        objective: 'TOWER_CLIMB',
        targetHeight: 'MID',
        estimatedPoints: 20,
        timingWindow: 'teleop',
        robotCount: 1,
        complexity: 'medium'
      },
      starred: false
    },
    {
      id: 'floor-fuel-red-hub',
      gameYear: 2026,
      name: 'Floor Pickup → Red HUB',
      description: 'Collect ground FUEL and score in Red HUB during phase 2',
      difficulty: 'Medium',
      category: 'fuel-scoring',
      tags: ['2026', 'fuel', 'hub', 'ground-pickup'],
      waypoints: [
        { x: 4.04, y: 8.27 },
        { x: 5.0, y: 8.27 },
        { x: 6.07, y: 8.27 }
      ],
      strategy: {
        objective: 'FUEL_SCORE',
        fuelCount: 2,
        estimatedPoints: 2,
        timingWindow: 'teleop-phase-2-4',
        complexity: 'medium'
      },
      starred: false
    },
    {
      id: 'trench-navigation',
      gameYear: 2026,
      name: 'Trench Navigation & Escape',
      description: 'Navigate under trench for strategic field positioning',
      difficulty: 'Medium',
      category: 'obstacle-navigation',
      tags: ['2026', 'trench', 'navigation', 'defense'],
      waypoints: [
        { x: 4.04, y: 3.5 },
        { x: 2.0, y: 2.5 },
        { x: 2.0, y: 0.5 },
        { x: 4.04, y: 0.5 }
      ],
      strategy: {
        objective: 'POSITIONING',
        estimatedPoints: 0,
        complexity: 'medium'
      },
      starred: false
    },
    {
      id: 'tower-high-teleop',
      gameYear: 2026,
      name: 'TOWER - HIGH (Teleop)',
      description: 'Teleop climb to HIGH level for 30 points (high risk/reward)',
      difficulty: 'Hard',
      category: 'tower-climbing',
      tags: ['2026', 'tower', 'high', 'teleop', '30pts'],
      waypoints: [
        { x: 3.5, y: 8.27 },
        { x: 3.8, y: 8.27 },
        { x: 4.04, y: 8.27 }
      ],
      strategy: {
        objective: 'TOWER_CLIMB',
        targetHeight: 'HIGH',
        estimatedPoints: 30,
        timingWindow: 'teleop',
        robotCount: 1,
        complexity: 'hard'
      },
      starred: false
    },
    {
      id: 'dual-tower-climb',
      gameYear: 2026,
      name: 'Dual TOWER Climb (Auto)',
      description: 'Coordinated two-robot climb during auto for 30 points combined',
      difficulty: 'Hard',
      category: 'tower-climbing',
      tags: ['2026', 'tower', 'dual', 'auto', '30pts'],
      waypoints: [
        { x: 2.0, y: 8.27 },
        { x: 3.0, y: 8.27 },
        { x: 4.04, y: 8.27 },
        { x: 6.07, y: 8.27 }
      ],
      strategy: {
        objective: 'TOWER_CLIMB',
        targetHeight: 'MID',
        estimatedPoints: 30,
        timingWindow: 'autonomous',
        robotCount: 2,
        complexity: 'hard'
      },
      starred: false
    },
    {
      id: 'ground-fuel-blue-hub-multi',
      gameYear: 2026,
      name: 'Multi-Cycle Fuel (Blue HUB)',
      description: 'Collect multiple FUEL balls from ground and score in active hub',
      difficulty: 'Medium',
      category: 'fuel-scoring',
      tags: ['2026', 'fuel', 'hub', 'multi-cycle'],
      waypoints: [
        { x: 2.0, y: 8.27 },
        { x: 2.5, y: 6.5 },
        { x: 2.0, y: 4.5 },
        { x: 2.0, y: 8.27 }
      ],
      strategy: {
        objective: 'FUEL_SCORE',
        fuelCount: 5,
        estimatedPoints: 5,
        timingWindow: 'teleop',
        complexity: 'medium'
      },
      starred: false
    },
    {
      id: 'block-red-hub-defense',
      gameYear: 2026,
      name: 'Block Red HUB (Defense)',
      description: 'Strategic defensive positioning to block opponent hub scoring',
      difficulty: 'Medium',
      category: 'defense',
      tags: ['2026', 'defense', 'hub-block'],
      waypoints: [
        { x: 4.04, y: 8.27 },
        { x: 5.0, y: 8.5 },
        { x: 6.07, y: 8.27 }
      ],
      strategy: {
        objective: 'DEFENSE',
        estimatedPoints: 0,
        complexity: 'medium'
      },
      starred: false
    },
    {
      id: 'tower-fuel-combo',
      gameYear: 2026,
      name: 'TOWER + Fuel Combo',
      description: 'Climb tower first, then collect and score FUEL',
      difficulty: 'Hard',
      category: 'combo',
      tags: ['2026', 'tower', 'fuel', 'combo'],
      waypoints: [
        { x: 2.0, y: 8.27 },
        { x: 3.5, y: 8.27 },
        { x: 4.04, y: 8.27 },
        { x: 3.0, y: 6.5 },
        { x: 2.0, y: 8.27 }
      ],
      strategy: {
        objective: 'COMBO_AUTO',
        estimatedPoints: 18,
        timingWindow: 'autonomous',
        complexity: 'hard'
      },
      starred: false
    },
    {
      id: 'endgame-positioning',
      gameYear: 2026,
      name: 'Endgame Tower Prep',
      description: 'Position for optimal endgame tower climb',
      difficulty: 'Medium',
      category: 'endgame',
      tags: ['2026', 'tower', 'endgame', 'positioning'],
      waypoints: [
        { x: 3.0, y: 10.0 },
        { x: 3.5, y: 9.0 },
        { x: 4.04, y: 8.27 }
      ],
      strategy: {
        objective: 'ENDGAME_PREP',
        estimatedPoints: 20,
        timingWindow: 'endgame',
        complexity: 'medium'
      },
      starred: false
    },
    {
      id: 'bump-navigation',
      gameYear: 2026,
      name: 'Bump Navigation',
      description: 'Navigate over bumps for quick field crossing',
      difficulty: 'Medium',
      category: 'obstacle-navigation',
      tags: ['2026', 'bump', 'navigation'],
      waypoints: [
        { x: 1.0, y: 6.0 },
        { x: 2.5, y: 5.5 },
        { x: 4.04, y: 5.0 }
      ],
      strategy: {
        objective: 'POSITIONING',
        estimatedPoints: 0,
        complexity: 'medium'
      },
      starred: false
    },
    {
      id: 'auto-hub-fuel-score',
      gameYear: 2026,
      name: 'Auto HUB Fuel Score',
      description: 'Quick autonomous routine to score initial FUEL in hub',
      difficulty: 'Easy',
      category: 'fuel-scoring',
      tags: ['2026', 'fuel', 'auto', 'scoring'],
      waypoints: [
        { x: 2.0, y: 8.27 },
        { x: 2.5, y: 8.27 }
      ],
      strategy: {
        objective: 'FUEL_SCORE',
        fuelCount: 1,
        estimatedPoints: 1,
        timingWindow: 'autonomous',
        complexity: 'easy'
      },
      starred: false
    },
    {
      id: 'mobility-path-2026',
      gameYear: 2026,
      name: 'Mobility Crossing Path',
      description: 'Fast path to cross field for mobility bonus',
      difficulty: 'Easy',
      category: 'mobility',
      tags: ['2026', 'mobility', 'crossing'],
      waypoints: [
        { x: 1.0, y: 8.27 },
        { x: 3.0, y: 8.27 },
        { x: 5.0, y: 8.27 },
        { x: 7.0, y: 8.27 }
      ],
      strategy: {
        objective: 'MOBILITY',
        estimatedPoints: 2,
        complexity: 'easy'
      },
      starred: false
    },
    {
      id: 'red-depot-hub-score',
      gameYear: 2026,
      name: 'Red Depot → HUB',
      description: 'Collect from red depot and score in red hub',
      difficulty: 'Medium',
      category: 'fuel-scoring',
      tags: ['2026', 'fuel', 'depot', 'red-alliance'],
      waypoints: [
        { x: 6.07, y: 8.27 },
        { x: 7.5, y: 12.0 },
        { x: 7.57, y: 12.0 },
        { x: 6.07, y: 8.27 }
      ],
      strategy: {
        objective: 'FUEL_SCORE',
        fuelCount: 3,
        estimatedPoints: 3,
        complexity: 'medium'
      },
      starred: false
    },
    {
      id: 'defense-evasion',
      gameYear: 2026,
      name: 'Defense Evasion Path',
      description: 'Evade defensive robots while scoring',
      difficulty: 'Hard',
      category: 'defense',
      tags: ['2026', 'defense', 'evasion'],
      waypoints: [
        { x: 2.0, y: 8.27 },
        { x: 1.5, y: 6.0 },
        { x: 2.5, y: 4.0 },
        { x: 4.04, y: 3.0 },
        { x: 5.5, y: 4.0 },
        { x: 6.07, y: 8.27 }
      ],
      strategy: {
        objective: 'DEFENSE_EVASION',
        estimatedPoints: 2,
        complexity: 'hard'
      },
      starred: false
    },
    {
      id: 'hub-switch-strategy',
      gameYear: 2026,
      name: 'Dynamic HUB Switch',
      description: 'Optimize scoring based on dynamic hub activation phases',
      difficulty: 'Hard',
      category: 'combo',
      tags: ['2026', 'hub-switching', 'dynamic', 'teleop'],
      waypoints: [
        { x: 2.0, y: 8.27 },
        { x: 2.5, y: 7.0 },
        { x: 4.04, y: 8.27 },
        { x: 5.5, y: 7.0 },
        { x: 6.07, y: 8.27 }
      ],
      strategy: {
        objective: 'HUB_SWITCHING',
        estimatedPoints: 8,
        complexity: 'hard'
      },
      starred: false
    },
    {
      id: 'rapid-fuel-collection',
      gameYear: 2026,
      name: 'Rapid Fuel Collection',
      description: 'Quick multi-ball collection from ground',
      difficulty: 'Medium',
      category: 'fuel-scoring',
      tags: ['2026', 'fuel', 'rapid', 'collection'],
      waypoints: [
        { x: 2.5, y: 8.27 },
        { x: 2.5, y: 6.5 },
        { x: 2.5, y: 4.5 },
        { x: 2.5, y: 8.27 }
      ],
      strategy: {
        objective: 'FUEL_SCORE',
        fuelCount: 7,
        estimatedPoints: 7,
        timingWindow: 'teleop',
        complexity: 'medium'
      },
      starred: false
    },
    {
      id: 'tower-dual-mid',
      gameYear: 2026,
      name: 'Dual TOWER - MID',
      description: 'Two robots reaching MID level for 40 points',
      difficulty: 'Hard',
      category: 'tower-climbing',
      tags: ['2026', 'tower', 'mid', 'dual'],
      waypoints: [
        { x: 2.0, y: 8.27 },
        { x: 3.5, y: 8.27 },
        { x: 4.04, y: 8.27 }
      ],
      strategy: {
        objective: 'TOWER_CLIMB',
        targetHeight: 'MID',
        estimatedPoints: 40,
        robotCount: 2,
        complexity: 'hard'
      },
      starred: false
    },
    {
      id: 'corner-hub-fuel',
      gameYear: 2026,
      name: 'Corner HUB Entry',
      description: 'Approach hub from corner angle',
      difficulty: 'Medium',
      category: 'fuel-scoring',
      tags: ['2026', 'fuel', 'hub', 'corner'],
      waypoints: [
        { x: 1.5, y: 8.27 },
        { x: 2.0, y: 8.0 },
        { x: 2.0, y: 8.27 }
      ],
      strategy: {
        objective: 'FUEL_SCORE',
        fuelCount: 2,
        estimatedPoints: 2,
        complexity: 'medium'
      },
      starred: false
    },
    {
      id: 'endgame-double-tower',
      gameYear: 2026,
      name: 'Endgame Double Climb',
      description: 'Two robots climbing during endgame phase',
      difficulty: 'Hard',
      category: 'endgame',
      tags: ['2026', 'tower', 'endgame', 'dual'],
      waypoints: [
        { x: 3.0, y: 8.27 },
        { x: 4.04, y: 8.27 },
        { x: 5.0, y: 8.27 }
      ],
      strategy: {
        objective: 'ENDGAME_CLIMB',
        estimatedPoints: 50,
        robotCount: 2,
        complexity: 'hard'
      },
      starred: false
    },
    {
      id: 'trench-to-hub',
      gameYear: 2026,
      name: 'Trench → HUB Path',
      description: 'Navigate trench then score in hub',
      difficulty: 'Hard',
      category: 'combo',
      tags: ['2026', 'trench', 'hub', 'fuel'],
      waypoints: [
        { x: 1.5, y: 2.0 },
        { x: 2.0, y: 4.0 },
        { x: 2.0, y: 8.27 }
      ],
      strategy: {
        objective: 'COMBO_SCORING',
        estimatedPoints: 4,
        complexity: 'hard'
      },
      starred: false
    },
    {
      id: 'quick-hub-score',
      gameYear: 2026,
      name: 'Quick HUB Score',
      description: 'Fastest path to score single fuel',
      difficulty: 'Easy',
      category: 'fuel-scoring',
      tags: ['2026', 'fuel', 'quick', 'auto'],
      waypoints: [
        { x: 1.5, y: 8.27 },
        { x: 2.0, y: 8.27 }
      ],
      strategy: {
        objective: 'FUEL_SCORE',
        fuelCount: 1,
        estimatedPoints: 1,
        complexity: 'easy'
      },
      starred: false
    },
    {
      id: 'red-alliance-depot',
      gameYear: 2026,
      name: 'Red Alliance Depot Run',
      description: 'Collect and score from red depot',
      difficulty: 'Medium',
      category: 'fuel-scoring',
      tags: ['2026', 'fuel', 'depot', 'red'],
      waypoints: [
        { x: 6.07, y: 8.27 },
        { x: 7.0, y: 12.0 },
        { x: 7.57, y: 12.0 }
      ],
      strategy: {
        objective: 'FUEL_SCORE',
        fuelCount: 4,
        estimatedPoints: 4,
        complexity: 'medium'
      },
      starred: false
    },
    {
      id: 'zigzag-fuel-collection',
      gameYear: 2026,
      name: 'Zigzag Collection Path',
      description: 'Serpentine path for multiple fuel pickups',
      difficulty: 'Hard',
      category: 'fuel-scoring',
      tags: ['2026', 'fuel', 'zigzag', 'multi'],
      waypoints: [
        { x: 2.0, y: 8.27 },
        { x: 2.5, y: 6.0 },
        { x: 2.0, y: 4.0 },
        { x: 3.0, y: 6.0 },
        { x: 2.0, y: 8.27 }
      ],
      strategy: {
        objective: 'FUEL_SCORE',
        fuelCount: 6,
        estimatedPoints: 6,
        timingWindow: 'teleop',
        complexity: 'hard'
      },
      starred: false
    },
    {
      id: 'bump-climb-tower',
      gameYear: 2026,
      name: 'Bump → TOWER Path',
      description: 'Navigate bump then climb tower',
      difficulty: 'Hard',
      category: 'combo',
      tags: ['2026', 'bump', 'tower', 'combo'],
      waypoints: [
        { x: 1.0, y: 6.0 },
        { x: 2.5, y: 5.0 },
        { x: 4.04, y: 8.27 }
      ],
      strategy: {
        objective: 'COMBO_AUTO',
        estimatedPoints: 18,
        complexity: 'hard'
      },
      starred: false
    },
    {
      id: 'center-hub-approach',
      gameYear: 2026,
      name: 'Center HUB Approach',
      description: 'Approach either hub from center position',
      difficulty: 'Easy',
      category: 'fuel-scoring',
      tags: ['2026', 'hub', 'center', 'flexible'],
      waypoints: [
        { x: 4.04, y: 8.27 },
        { x: 3.0, y: 8.27 }
      ],
      strategy: {
        objective: 'POSITIONING',
        estimatedPoints: 0,
        complexity: 'easy'
      },
      starred: false
    },
    {
      id: 'defense-positioning',
      gameYear: 2026,
      name: 'Defensive Center Position',
      description: 'Strategic center field defense',
      difficulty: 'Medium',
      category: 'defense',
      tags: ['2026', 'defense', 'center', 'positioning'],
      waypoints: [
        { x: 4.04, y: 8.27 },
        { x: 4.04, y: 6.0 },
        { x: 4.04, y: 8.27 }
      ],
      strategy: {
        objective: 'DEFENSE',
        estimatedPoints: 0,
        complexity: 'medium'
      },
      starred: false
    },
    {
      id: 'side-hub-rapid',
      gameYear: 2026,
      name: 'Side HUB Rapid Score',
      description: 'Quick scoring from alliance side',
      difficulty: 'Easy',
      category: 'fuel-scoring',
      tags: ['2026', 'fuel', 'side', 'rapid'],
      waypoints: [
        { x: 2.0, y: 8.27 },
        { x: 2.0, y: 7.0 },
        { x: 2.0, y: 8.27 }
      ],
      strategy: {
        objective: 'FUEL_SCORE',
        fuelCount: 2,
        estimatedPoints: 2,
        complexity: 'easy'
      },
      starred: false
    },
    {
      id: 'tower-high-endgame-high-risk',
      gameYear: 2026,
      name: 'HIGH Tower Endgame Push',
      description: 'High-risk HIGH level climb during final seconds',
      difficulty: 'Hard',
      category: 'endgame',
      tags: ['2026', 'tower', 'high', 'endgame', 'risky'],
      waypoints: [
        { x: 3.5, y: 8.27 },
        { x: 4.04, y: 8.27 }
      ],
      strategy: {
        objective: 'TOWER_CLIMB',
        targetHeight: 'HIGH',
        estimatedPoints: 30,
        timingWindow: 'endgame-final-seconds',
        complexity: 'hard'
      },
      starred: false
    },
    {
      id: 'three-ball-auto',
      gameYear: 2026,
      name: '3-Ball Auto Routine',
      description: 'Autonomous routine scoring 3 fuel balls',
      difficulty: 'Hard',
      category: 'combo',
      tags: ['2026', 'fuel', 'auto', '3-ball'],
      waypoints: [
        { x: 2.0, y: 8.27 },
        { x: 2.5, y: 6.0 },
        { x: 2.0, y: 4.0 },
        { x: 2.0, y: 8.27 }
      ],
      strategy: {
        objective: 'AUTO_SCORING',
        fuelCount: 3,
        estimatedPoints: 3,
        timingWindow: 'autonomous',
        complexity: 'hard'
      },
      starred: false
    },
    {
      id: 'cooperative-tower',
      gameYear: 2026,
      name: 'Cooperative Tower Setup',
      description: 'Set up for alliance partner to climb',
      difficulty: 'Medium',
      category: 'combo',
      tags: ['2026', 'tower', 'cooperative', 'alliance'],
      waypoints: [
        { x: 3.0, y: 8.27 },
        { x: 3.5, y: 8.27 },
        { x: 4.04, y: 8.27 }
      ],
      strategy: {
        objective: 'ALLIANCE_SUPPORT',
        estimatedPoints: 0,
        complexity: 'medium'
      },
      starred: false
    },
    {
      id: 'wide-field-traverse',
      gameYear: 2026,
      name: 'Wide Field Traverse',
      description: 'Cross full field width for maximum positioning',
      difficulty: 'Medium',
      category: 'mobility',
      tags: ['2026', 'mobility', 'traverse', 'width'],
      waypoints: [
        { x: 1.0, y: 8.27 },
        { x: 3.0, y: 8.27 },
        { x: 5.0, y: 8.27 },
        { x: 7.0, y: 8.27 }
      ],
      strategy: {
        objective: 'POSITIONING',
        estimatedPoints: 0,
        complexity: 'medium'
      },
      starred: false
    },
    {
      id: 'depot-hub-fuel-loop',
      gameYear: 2026,
      name: 'Depot → HUB Loop',
      description: 'Continuous loop between depot and hub',
      difficulty: 'Hard',
      category: 'fuel-scoring',
      tags: ['2026', 'fuel', 'depot', 'loop', 'continuous'],
      waypoints: [
        { x: 0.5, y: 12.0 },
        { x: 2.0, y: 8.27 },
        { x: 0.5, y: 12.0 }
      ],
      strategy: {
        objective: 'FUEL_SCORE',
        fuelCount: 4,
        estimatedPoints: 4,
        timingWindow: 'teleop',
        complexity: 'hard'
      },
      starred: false
    },
    {
      id: 'balanced-scoring',
      gameYear: 2026,
      name: 'Balanced Scoring Strategy',
      description: 'Mix tower climbing and fuel scoring',
      difficulty: 'Hard',
      category: 'combo',
      tags: ['2026', 'tower', 'fuel', 'balanced'],
      waypoints: [
        { x: 2.0, y: 8.27 },
        { x: 4.04, y: 8.27 },
        { x: 2.0, y: 8.27 }
      ],
      strategy: {
        objective: 'BALANCED_SCORING',
        estimatedPoints: 20,
        timingWindow: 'full-match',
        complexity: 'hard'
      },
      starred: false
    },
    {
      id: 'penalty-avoidance',
      gameYear: 2026,
      name: 'Penalty Avoidance Route',
      description: 'Safe path avoiding fouls',
      difficulty: 'Easy',
      category: 'defense',
      tags: ['2026', 'safety', 'fouls', 'avoidance'],
      waypoints: [
        { x: 4.04, y: 8.27 },
        { x: 4.04, y: 10.0 },
        { x: 4.04, y: 8.27 }
      ],
      strategy: {
        objective: 'SAFETY',
        estimatedPoints: 0,
        complexity: 'easy'
      },
      starred: false
    },
    {
      id: 'maximum-efficiency',
      gameYear: 2026,
      name: 'Maximum Efficiency Path',
      description: 'Optimize for lowest time, highest score',
      difficulty: 'Hard',
      category: 'combo',
      tags: ['2026', 'efficiency', 'optimization', 'speed'],
      waypoints: [
        { x: 2.0, y: 8.27 },
        { x: 2.5, y: 6.5 },
        { x: 2.0, y: 8.27 },
        { x: 4.04, y: 8.27 }
      ],
      strategy: {
        objective: 'EFFICIENCY',
        estimatedPoints: 18,
        timingWindow: 'auto-teleop',
        complexity: 'hard'
      },
      starred: false
    }
  ],

  rules: {
    velocityLimit: 5.0,
    accelerationLimit: 3.0,
    jerkLimit: 4.0,
    towerHeightValidation: [0.686, 1.143, 1.600],
    towerApproachMinDistance: 1.0,
    hubApproachMinDistance: 0.3,
    depotApproachMinDistance: 0.2,
    trenchClearanceHeight: 0.2,
    maxTrajectoryTime: 150,
    towerClimbWindow: 30
  }
};
