export default {
  id: '2025',
  name: 'Reefscape',
  year: 2025,

  field: {
    width: 16.54,
    length: 8.23,
    name: '2025 Reefscape Arena',
    elements: {
      reef: {
        x: 8.27,
        y: 4.115,
        radius: 1.2,
        color: 'rgba(100, 150, 200, 0.2)'
      },
      barge: {
        x: 2.0,
        y: 0.5,
        width: 3.0,
        height: 1.2,
        color: 'rgba(200, 100, 100, 0.2)'
      },
      processor: {
        x: 14.54,
        y: 4.115,
        width: 0.8,
        height: 0.6,
        color: 'rgba(200, 200, 100, 0.2)'
      },
      net: {
        x: 12.0,
        y: 0.5,
        width: 0.8,
        height: 1.2,
        color: 'rgba(150, 200, 100, 0.2)'
      }
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
    coral: {
      levels: { L2: 2, L3: 3, L4: 4 },
      coralPerRobotMax: 3
    },
    algae: { pointsPerAlgae: 2 },
    barge: { pointsForClimb: 6 },
    endgame: { maxTime: 30 }
  },

  templates: [
    {
      id: 'reef-approach-l4',
      gameYear: 2025,
      name: 'Reef L4 Approach',
      description: 'Optimal approach path to Reef Level 4 for coral scoring',
      difficulty: 'Medium',
      category: 'coral-scoring',
      tags: ['reefscape', 'coral', 'l4', 'scoring'],
      waypoints: [
        { x: 1.5, y: 4 },
        { x: 3.2, y: 4.2 },
        { x: 4.8, y: 4.5 },
        { x: 6.2, y: 4.8 },
        { x: 7.5, y: 5.2 }
      ],
      strategy: {
        objective: 'CORAL_L4',
        estimatedPoints: 4,
        complexity: 'medium'
      },
      starred: true
    },
    {
      id: 'processor-shot',
      gameYear: 2025,
      name: 'Processor Algae Shot',
      description: 'Efficient path to Processor for algae scoring',
      difficulty: 'Easy',
      category: 'algae-scoring',
      tags: ['reefscape', 'algae', 'processor', 'scoring'],
      waypoints: [
        { x: 2, y: 4 },
        { x: 3.5, y: 3.8 },
        { x: 5, y: 3.2 },
        { x: 6.5, y: 2.8 },
        { x: 8, y: 2.5 }
      ],
      strategy: {
        objective: 'ALGAE_PROCESSOR',
        estimatedPoints: 2,
        complexity: 'easy'
      },
      starred: true
    },
    {
      id: 'barge-climb',
      gameYear: 2025,
      name: 'Barge Climb Path',
      description: 'Strategic path for climbing the Chain/Barge',
      difficulty: 'Hard',
      category: 'endgame',
      tags: ['reefscape', 'climb', 'barge', 'endgame'],
      waypoints: [
        { x: 2, y: 4 },
        { x: 4, y: 3.5 },
        { x: 6, y: 3 },
        { x: 8, y: 2.5 },
        { x: 10, y: 2 },
        { x: 12, y: 1.5 },
        { x: 14, y: 1 }
      ],
      strategy: {
        objective: 'BARGE_CLIMB',
        estimatedPoints: 6,
        complexity: 'hard'
      },
      starred: true
    },
    {
      id: 'algae-collection',
      gameYear: 2025,
      name: 'Ground Algae Collection',
      description: 'Path optimized for collecting ground algae',
      difficulty: 'Medium',
      category: 'algae-scoring',
      tags: ['reefscape', 'algae', 'collection', 'ground'],
      waypoints: [
        { x: 2, y: 4 },
        { x: 3.5, y: 3.2 },
        { x: 5, y: 2.5 },
        { x: 6.5, y: 2 },
        { x: 8, y: 2.5 },
        { x: 9.5, y: 3 },
        { x: 11, y: 3.5 }
      ],
      strategy: {
        objective: 'ALGAE_GROUND',
        estimatedPoints: 2,
        complexity: 'medium'
      },
      starred: false
    },
    {
      id: 'reef-defense',
      gameYear: 2025,
      name: 'Reef Defense Route',
      description: 'Defensive positioning around the Reef',
      difficulty: 'Medium',
      category: 'defense',
      tags: ['reefscape', 'defense', 'positioning'],
      waypoints: [
        { x: 2, y: 4 },
        { x: 4, y: 4.5 },
        { x: 6, y: 4.8 },
        { x: 8, y: 4.5 },
        { x: 10, y: 4 }
      ],
      strategy: {
        objective: 'DEFENSE',
        estimatedPoints: 0,
        complexity: 'medium'
      },
      starred: false
    },
    {
      id: 'mobility-bonus',
      gameYear: 2025,
      name: 'Mobility Bonus Path',
      description: 'Path designed to maximize mobility bonus points',
      difficulty: 'Easy',
      category: 'mobility',
      tags: ['reefscape', 'mobility', 'bonus', 'auto'],
      waypoints: [
        { x: 1.5, y: 4 },
        { x: 4, y: 3.8 },
        { x: 6.5, y: 3.5 },
        { x: 9, y: 3.2 },
        { x: 11.5, y: 3 }
      ],
      strategy: {
        objective: 'MOBILITY',
        estimatedPoints: 3,
        complexity: 'easy'
      },
      starred: true
    },
    {
      id: 'coral-l2-approach',
      gameYear: 2025,
      name: 'Reef L2 Approach',
      description: 'Path to Reef Level 2 for quick coral scoring',
      difficulty: 'Easy',
      category: 'coral-scoring',
      tags: ['reefscape', 'coral', 'l2', 'scoring'],
      waypoints: [
        { x: 2, y: 4 },
        { x: 4, y: 4.2 },
        { x: 6, y: 4.4 },
        { x: 8, y: 4.6 }
      ],
      strategy: {
        objective: 'CORAL_L2',
        estimatedPoints: 2,
        complexity: 'easy'
      },
      starred: false
    },
    {
      id: 'coral-l3-approach',
      gameYear: 2025,
      name: 'Reef L3 Approach',
      description: 'Path to Reef Level 3 for balanced scoring',
      difficulty: 'Medium',
      category: 'coral-scoring',
      tags: ['reefscape', 'coral', 'l3', 'scoring'],
      waypoints: [
        { x: 2, y: 4 },
        { x: 4, y: 4.2 },
        { x: 6, y: 4.4 },
        { x: 7.5, y: 4.8 }
      ],
      strategy: {
        objective: 'CORAL_L3',
        estimatedPoints: 3,
        complexity: 'medium'
      },
      starred: false
    },
    {
      id: 'net-algae-shot',
      gameYear: 2025,
      name: 'Net Algae Shot',
      description: 'Precise path for shooting algae into the net',
      difficulty: 'Hard',
      category: 'algae-scoring',
      tags: ['reefscape', 'algae', 'net', 'shooting'],
      waypoints: [
        { x: 8, y: 4 },
        { x: 10, y: 2.5 },
        { x: 12, y: 1 }
      ],
      strategy: {
        objective: 'ALGAE_NET',
        estimatedPoints: 2,
        complexity: 'hard'
      },
      starred: false
    },
    {
      id: 'triple-threat-auto',
      gameYear: 2025,
      name: 'Triple Threat Auto',
      description: 'Combines coral + algae + mobility in one autonomous routine',
      difficulty: 'Hard',
      category: 'combo',
      tags: ['reefscape', 'combo', 'auto', 'triple'],
      waypoints: [
        { x: 1.5, y: 4 },
        { x: 3.5, y: 4.2 },
        { x: 6, y: 4.5 },
        { x: 8, y: 3.5 },
        { x: 10, y: 3 },
        { x: 12, y: 2.5 }
      ],
      strategy: {
        objective: 'COMBO_AUTO',
        estimatedPoints: 9,
        complexity: 'hard'
      },
      starred: true
    },
    {
      id: 'dual-coral-l4',
      gameYear: 2025,
      name: 'Dual Coral L4 Strategy',
      description: 'Two-robot coordinated L4 scoring',
      difficulty: 'Hard',
      category: 'coral-scoring',
      tags: ['reefscape', 'coral', 'l4', 'dual'],
      waypoints: [
        { x: 1.5, y: 4 },
        { x: 3.2, y: 4.2 },
        { x: 4.8, y: 4.5 },
        { x: 6.2, y: 4.8 },
        { x: 7.5, y: 5.2 },
        { x: 9, y: 5 },
        { x: 10.5, y: 4.8 }
      ],
      strategy: {
        objective: 'DUAL_CORAL_L4',
        estimatedPoints: 8,
        complexity: 'hard'
      },
      starred: false
    }
  ],

  rules: {
    velocityLimit: 5.0,
    accelerationLimit: 3.0,
    jerkLimit: 4.0,
    coralHeightValidation: [2, 3, 4],
    reefApproachMinDistance: 0.5,
    bargeApproachMinDistance: 0.3,
    maxTrajectoryTime: 150
  }
};
