import { Mission, MissionType, DifficultyLevel, ObjectiveType, RewardType } from '../data/missions';
import { GameState } from '../contexts/GameContext';

interface MissionTemplate {
  type: MissionType;
  difficulty: DifficultyLevel;
  objectiveCount: { min: number; max: number };
  rewardCount: { min: number; max: number };
  timeLimit?: { min: number; max: number };
}

const missionTemplates: Record<MissionType, MissionTemplate[]> = {
  story: [
    {
      type: 'story',
      difficulty: 'medium',
      objectiveCount: { min: 2, max: 4 },
      rewardCount: { min: 2, max: 3 }
    }
  ],
  challenge: [
    {
      type: 'challenge',
      difficulty: 'hard',
      objectiveCount: { min: 3, max: 5 },
      rewardCount: { min: 2, max: 4 },
      timeLimit: { min: 300000, max: 900000 } // 5-15 minutes
    }
  ],
  daily: [
    {
      type: 'daily',
      difficulty: 'easy',
      objectiveCount: { min: 1, max: 2 },
      rewardCount: { min: 1, max: 2 },
      timeLimit: { min: 43200000, max: 86400000 } // 12-24 hours
    }
  ],
  side: [
    {
      type: 'side',
      difficulty: 'easy',
      objectiveCount: { min: 1, max: 3 },
      rewardCount: { min: 1, max: 2 }
    }
  ],
  event: [
    {
      type: 'event',
      difficulty: 'medium',
      objectiveCount: { min: 1, max: 2 },
      rewardCount: { min: 1, max: 2 }
    }
  ],
  chain: [
    {
      type: 'chain',
      difficulty: 'hard',
      objectiveCount: { min: 2, max: 4 },
      rewardCount: { min: 2, max: 3 },
      timeLimit: { min: 300000, max: 900000 }
    }
  ],
  special: [
    {
      type: 'special',
      difficulty: 'legendary',
      objectiveCount: { min: 3, max: 5 },
      rewardCount: { min: 3, max: 5 },
      timeLimit: { min: 600000, max: 1200000 }
    }
  ]
};

const objectiveTemplates: Record<ObjectiveType, (state: GameState) => { target: number; description: string }> = {
  collect_data: (state) => ({
    target: Math.floor((state.dataPerSecond * 3600) * (1 + Math.random())),
    description: 'Collect {target} bytes of data'
  }),
  mine_crypto: (state) => ({
    target: Math.floor((state.cryptoPerSecond * 1800) * (1 + Math.random())),
    description: 'Mine {target} cryptocurrency'
  }),
  hack_server: () => ({
    target: 1,
    description: 'Successfully hack a server with minimum security level {target}'
  }),
  secure_network: (state) => ({
    target: 1,
    description: 'Secure the network with encryption level {target}'
  }),
  decrypt_file: (state) => ({
    target: 1,
    description: 'Decrypt secured file of level {target}'
  }),
  run_command: (state) => ({
    target: 1,
    description: 'Execute command with parameter {target}'
  }),
  resolve_attack: (state) => ({
    target: 1,
    description: 'Resolve the network attack with threshold {target}'
  }),
  upgrade_purchase: (state) => ({
    target: 1,
    description: 'Purchase an upgrade when condition {target} is met'
  }),
  achieve_processing: (state) => ({
    target: 1,
    description: 'Achieve processing power milestone of {target}'
  }),
  defend_network: (state) => ({
    target: 1,
    description: 'Defend the network against threats requiring {target} defense'
  }),
  decrypt_data: (state) => ({
    target: 1,
    description: 'Decrypt secured data of level {target}'
  }),
  solve_puzzle: (state) => ({
    target: 1,
    description: 'Solve a challenging puzzle with difficulty {target}'
  }),
  complete_minigame: (state) => ({
    target: 1,
    description: 'Complete the minigame challenge with target score {target}'
  }),
  maintain_uptime: (state) => ({
    target: 1,
    description: 'Maintain system uptime above {target}%'
  }),
  chain_attacks: (state) => ({
    target: 1,
    description: 'Chain multiple attacks successfully with target count {target}'
  }),
  analyze_code: (state) => ({
    target: 1,
    description: 'Analyze code segments to find vulnerabilities with threshold {target}'
  }),
  // Add aliases for compatibility with mission data
  hack: () => ({
    target: 1,
    description: 'Hack into a system with difficulty level {target}'
  }),
  collect: (state) => ({
    target: Math.floor((state.dataPerSecond * 1800) * (1 + Math.random())),
    description: 'Collect {target} resources'
  }),
  defend: (state) => ({
    target: 1, 
    description: 'Defend against {target} security threats'
  }),
  analyze: (state) => ({
    target: 1,
    description: 'Analyze {target} data samples'
  })
};

const rewardScaling: Record<DifficultyLevel, number> = {
  tutorial: 1,
  easy: 1.5,
  medium: 2.5,
  hard: 4,
  expert: 6,
  legendary: 10
};

export function generateMission(
  state: GameState,
  type: MissionType = 'challenge',
  forcedDifficulty?: DifficultyLevel
): Mission {
  // Select template
  const templates = missionTemplates[type];
  const template = templates[Math.floor(Math.random() * templates.length)];
  const difficulty = forcedDifficulty || template.difficulty;

  // Generate unique ID
  const id = `generated_${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  // Generate objectives
  const objectiveCount = Math.floor(
    Math.random() * (template.objectiveCount.max - template.objectiveCount.min + 1)
  ) + template.objectiveCount.min;

  const objectives = generateObjectives(state, objectiveCount, difficulty);

  // Generate rewards
  const rewardCount = Math.floor(
    Math.random() * (template.rewardCount.max - template.rewardCount.min + 1)
  ) + template.rewardCount.min;

  const rewards = generateRewards(state, rewardCount, difficulty);

  // Generate mission name and description
  const { name, description } = generateMissionNameAndDescription(type, difficulty, objectives);

  // Get numeric value for difficulty
  const difficultyValue = rewardScaling[difficulty];

  return {
    id,
    name,
    description,
    type,
    difficulty,
    status: 'available',
    objectives,
    rewards,
    timeLimit: template.timeLimit
      ? Math.floor(
          Math.random() * (template.timeLimit.max - template.timeLimit.min + 1)
        ) + template.timeLimit.min
      : undefined,
    unlockConditions: generateUnlockConditions(state, difficulty),
    requirements: {
      playerLevel: Math.max(1, Math.floor(difficultyValue / 2)),
      hackingSkill: Math.max(5, difficultyValue * 5)
    }
  };
}

function generateObjectives(
  state: GameState,
  count: number,
  difficulty: DifficultyLevel
): Mission['objectives'] {
  const objectives: Mission['objectives'] = [];
  const availableTypes = Object.keys(objectiveTemplates) as ObjectiveType[];

  for (let i = 0; i < count; i++) {
    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    const template = objectiveTemplates[type];
    const { target, description } = template(state);

    // Scale target based on difficulty
    const scaledTarget = typeof target === 'number'
      ? Math.floor(target * rewardScaling[difficulty])
      : target;

    objectives.push({
      id: `obj_${i}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type,
      description: description.replace('{target}', scaledTarget.toString()),
      target: scaledTarget,
      progress: 0,
      completed: false,
      optional: Math.random() > 0.8, // 20% chance of optional objective
      timeLimit: Math.random() > 0.7 ? 300000 : undefined // 30% chance of time limit
    });
  }

  return objectives;
}

function generateRewards(
  state: GameState,
  count: number,
  difficulty: DifficultyLevel
): Mission['rewards'] {
  const rewards: Mission['rewards'] = [];
  const availableTypes: RewardType[] = [
    'data',
    'crypto',
    'processing_power',
    'hacking_skill',
    'special_upgrade',
    'skill_tree_point'
  ];

  for (let i = 0; i < count; i++) {
    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    let amount = 0;
    let description = '';

    switch (type) {
      case 'data':
        amount = Math.floor(state.dataPerSecond * 7200 * rewardScaling[difficulty]); // 2 hours worth
        description = 'Bonus Data';
        break;
      case 'crypto':
        amount = Math.floor(state.cryptoPerSecond * 3600 * rewardScaling[difficulty]); // 1 hour worth
        description = 'Cryptocurrency Reward';
        break;
      case 'processing_power':
        amount = Math.floor(1 + (Math.random() * 2 * rewardScaling[difficulty]));
        description = 'Processing Power Boost';
        break;
      case 'hacking_skill':
        amount = Math.floor(1 + (Math.random() * rewardScaling[difficulty]));
        description = 'Hacking Skill Increase';
        break;
      default:
        amount = 1;
        description = 'Special Reward';
    }

    rewards.push({
      type,
      amount,
      description,
      rarity: calculateRarity(difficulty),
      scaling: {
        withDifficulty: true,
        withPerfection: Math.random() > 0.7 // 30% chance of perfect completion bonus
      }
    });
  }

  return rewards;
}

function calculateRarity(difficulty: DifficultyLevel): Mission['rewards'][0]['rarity'] {
  const rarityChances = {
    tutorial: { common: 1 },
    easy: { common: 0.8, uncommon: 0.2 },
    medium: { common: 0.6, uncommon: 0.3, rare: 0.1 },
    hard: { uncommon: 0.5, rare: 0.4, epic: 0.1 },
    expert: { rare: 0.6, epic: 0.3, legendary: 0.1 },
    legendary: { epic: 0.7, legendary: 0.3 }
  };

  const roll = Math.random();
  const chances = rarityChances[difficulty];
  let cumulative = 0;

  for (const [rarity, chance] of Object.entries(chances)) {
    cumulative += chance;
    if (roll <= cumulative) {
      return rarity as Mission['rewards'][0]['rarity'];
    }
  }

  return 'common';
}

function generateMissionNameAndDescription(
  type: MissionType,
  difficulty: DifficultyLevel,
  objectives: Mission['objectives']
): { name: string; description: string } {
  const prefixes: Record<MissionType, string[]> = {
    story: ['Operation', 'Mission', 'Project'],
    challenge: ['Critical', 'Urgent', 'High-Priority', 'Classified'],
    daily: ['Daily', 'Routine', 'Standard'],
    side: ['Side', 'Optional', 'Supplementary'],
    event: ['Event', 'Special', 'Occasion'],
    chain: ['Chain', 'Sequence', 'Series'],
    special: ['Special', 'Exclusive', 'Unique']
  };

  const suffixes = {
    collect_data: ['Data Harvest', 'Information Gathering', 'Data Mining'],
    hack_server: ['Server Breach', 'System Infiltration', 'Network Penetration'],
    mine_crypto: ['Crypto Operation', 'Blockchain Initiative', 'Mining Operation']
  };

  const prefixArray = prefixes[type] || ['Mission'];
  const prefix = prefixArray[Math.floor(Math.random() * prefixArray.length)];
  const mainObjective = objectives[0];
  const suffixArray = suffixes[mainObjective.type as keyof typeof suffixes] || ['Operation'];
  const suffix = suffixArray[Math.floor(Math.random() * suffixArray.length)];

  const name = `${prefix} ${suffix}`;
  const description = `A ${difficulty} difficulty mission requiring ${objectives.length} objectives. ${
    mainObjective.description
  }${objectives.length > 1 ? ' and more.' : '.'}`;

  return { name, description };
}

function generateUnlockConditions(
  state: GameState,
  difficulty: DifficultyLevel
): Mission['unlockConditions'] {
  const conditions: Mission['unlockConditions'] = {};

  switch (difficulty) {
    case 'tutorial':
      break;
    case 'easy':
      conditions.minHackingSkill = 2;
      break;
    case 'medium':
      conditions.minHackingSkill = 5;
      conditions.minProcessingPower = 10;
      break;
    case 'hard':
      conditions.minHackingSkill = 10;
      conditions.minProcessingPower = 20;
      conditions.minData = state.dataPerSecond * 7200; // 2 hours worth
      break;
    case 'expert':
      conditions.minHackingSkill = 15;
      conditions.minProcessingPower = 30;
      conditions.minData = state.dataPerSecond * 14400; // 4 hours worth
      conditions.minCrypto = state.cryptoPerSecond * 3600; // 1 hour worth
      break;
    case 'legendary':
      conditions.minHackingSkill = 25;
      conditions.minProcessingPower = 50;
      conditions.minData = state.dataPerSecond * 28800; // 8 hours worth
      conditions.minCrypto = state.cryptoPerSecond * 7200; // 2 hours worth
      break;
  }

  return conditions;
} 