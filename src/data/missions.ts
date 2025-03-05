import { Server, NetworkAttack } from '../contexts/GameContext';

// New mission types and objective types
export type MissionType = 'story' | 'side' | 'daily' | 'event' | 'challenge' | 'chain' | 'special';
export type ObjectiveType = 
  | 'collect_data'
  | 'mine_crypto'
  | 'hack_server'
  | 'secure_network'
  | 'analyze_code'
  | 'decrypt_file'
  | 'run_command'
  | 'resolve_attack'
  | 'upgrade_purchase'
  | 'achieve_processing'
  | 'defend_network'
  | 'decrypt_data'
  | 'complete_minigame'
  | 'chain_attacks'
  | 'hack' 
  | 'collect' 
  | 'defend' 
  | 'analyze'
  | 'solve_puzzle'
  | 'maintain_uptime';

export type RewardType = 
  | 'data' 
  | 'crypto' 
  | 'processing_power' 
  | 'hacking_skill' 
  | 'special_upgrade' 
  | 'server_unlock'
  | 'unique_ability'
  | 'skill_tree_point'
  | 'rare_resource'
  | 'blueprint'
  | 'network_influence'
  | 'experience'
  | 'credits';

// Mission difficulty levels
export type DifficultyLevel = 'tutorial' | 'easy' | 'medium' | 'hard' | 'expert' | 'legendary';

// Enhanced Mission interface
export interface Mission {
  id: string;
  name: string;
  description: string;
  type: MissionType;
  difficulty: DifficultyLevel;
  status: 'available' | 'active' | 'in_progress' | 'completed' | 'failed';
  timeLimit?: number; // in seconds
  objectives: MissionObjective[];
  rewards: MissionReward[];
  requirements: MissionRequirement;
  story?: string[];
  unlockConditions?: any; // This should be properly typed based on the output of generateUnlockConditions
}

// Enhanced MissionObjective interface
export interface MissionObjective {
  id: string;
  description: string;
  type: ObjectiveType;
  target: number | string;
  progress: number;
  completed: boolean;
  optional?: boolean;
  bonusReward?: MissionReward;
  timeLimit?: number; // Time limit in milliseconds
}

// Enhanced MissionReward interface
export interface MissionReward {
  type: RewardType;
  amount: number;
  description: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  scaling?: {
    withDifficulty: boolean;
    withPerfection: boolean;
  };
}

// Enhanced MissionRequirement interface
export interface MissionRequirement {
  playerLevel?: number;
  hackingSkill?: number;
  requiredItems?: string[];
  // Add other requirements as needed
}

export const initialMissions: Mission[] = [
  {
    id: 'M001',
    name: 'Digital Footprints',
    description: 'Trace and collect scattered data packets from a compromised server.',
    type: 'story',
    difficulty: 'easy',
    status: 'available',
    timeLimit: 300,
    objectives: [
      {
        id: 'OBJ1',
        description: 'Collect 1000 data packets',
        type: 'collect',
        target: 1000,
        progress: 0,
        completed: false
      },
      {
        id: 'OBJ2',
        description: 'Hack into 2 security nodes',
        type: 'hack',
        target: 2,
        progress: 0,
        completed: false
      }
    ],
    rewards: [
      {
        type: 'data',
        amount: 2000,
        description: 'Data packets from the compromised server'
      },
      {
        type: 'experience',
        amount: 1000,
        description: 'Experience points from the mission'
      }
    ],
    requirements: {
      playerLevel: 1,
      hackingSkill: 5
    },
    story: [
      "ALERT: Unauthorized data breach detected in sector 7G",
      "Initial scan reveals scattered data packets of unknown origin",
      "Mission objective: Recover data before system purge",
      "WARNING: Security protocols active. Proceed with caution"
    ]
  },
  {
    id: 'M002',
    name: 'Firewall Breach',
    description: 'Infiltrate a corporate network by bypassing their advanced firewall system.',
    type: 'story',
    difficulty: 'medium',
    status: 'available',
    timeLimit: 600,
    objectives: [
      {
        id: 'OBJ1',
        description: 'Disable 3 firewall nodes',
        type: 'hack',
        target: 3,
        progress: 0,
        completed: false
      },
      {
        id: 'OBJ2',
        description: 'Defend against counter-measures',
        type: 'defend',
        target: 5,
        progress: 0,
        completed: false
      },
      {
        id: 'OBJ3',
        description: 'Analyze security patterns',
        type: 'analyze',
        target: 1,
        progress: 0,
        completed: false
      }
    ],
    rewards: [
      {
        type: 'credits',
        amount: 10000,
        description: 'Credits from the mission'
      },
      {
        type: 'data',
        amount: 5000,
        description: 'Data from the mission'
      },
      {
        type: 'experience',
        amount: 2500,
        description: 'Experience points from the mission'
      },
      {
        type: 'special_upgrade',
        amount: 1,
        description: 'Advanced Encryption Bypass',
        rarity: 'epic'
      }
    ],
    requirements: {
      playerLevel: 5,
      hackingSkill: 15,
      requiredItems: ['basic_decoder']
    },
    story: [
      "TARGET IDENTIFIED: MegaCorp Firewall System v7.1",
      "Intelligence suggests critical vulnerability in node configuration",
      "Caution: Advanced counter-measure systems detected",
      "Objective: Extract network access protocols",
      "Note: System will alert security after detection"
    ]
  },
  {
    id: 'M003',
    name: 'Corporate Mainframe Breach',
    description: 'Infiltrate the heavily guarded corporate mainframe while avoiding detection.',
    type: 'story',
    difficulty: 'hard',
    status: 'available',
    timeLimit: 1800,
    objectives: [
      {
        id: 'OBJ1',
        description: 'Bypass the advanced firewall system',
        type: 'hack',
        target: 5,
        progress: 0,
        completed: false
      },
      {
        id: 'OBJ2',
        description: 'Extract confidential data packages',
        type: 'collect',
        target: 50000,
        progress: 0,
        completed: false
      },
      {
        id: 'OBJ3',
        description: 'Defend against security systems',
        type: 'defend',
        target: 10,
        progress: 0,
        completed: false
      },
      {
        id: 'OBJ4',
        description: 'Analyze mainframe architecture',
        type: 'analyze',
        target: 3,
        progress: 0,
        completed: false
      }
    ],
    rewards: [
      {
        type: 'credits',
        amount: 20000,
        description: 'Credits from the mission'
      },
      {
        type: 'data',
        amount: 10000,
        description: 'Data from the mission'
      },
      {
        type: 'experience',
        amount: 5000,
        description: 'Experience points from the mission'
      },
      {
        type: 'special_upgrade',
        amount: 1,
        description: 'Corporate Mainframe Access',
        rarity: 'legendary'
      }
    ],
    requirements: {
      playerLevel: 10,
      hackingSkill: 20
    },
    story: [
      "TARGET IDENTIFIED: MegaCorp Mainframe System v9.2",
      "Intelligence suggests critical vulnerability in node configuration",
      "Caution: Advanced counter-measure systems detected",
      "Objective: Extract confidential data packages",
      "Note: System will alert security after detection"
    ]
  }
];

// Add a new challenging story mission
export const enhancedMissions: Mission[] = [
  ...initialMissions,
  {
    id: 'corporate_mainframe_breach',
    name: 'Corporate Mainframe Breach',
    description: 'Infiltrate the heavily guarded corporate mainframe while avoiding detection.',
    type: 'story',
    difficulty: 'hard',
    status: 'available',
    timeLimit: 1800, // 30 minutes in seconds
    objectives: [
      {
        id: 'bypass_firewall',
        description: 'Bypass the advanced firewall system',
        type: 'hack',
        target: 'corporate_firewall',
        progress: 0,
        completed: false
      },
      {
        id: 'solve_encryption',
        description: 'Solve the quantum encryption puzzle',
        type: 'solve_puzzle',
        target: 'quantum_puzzle',
        progress: 0,
        completed: false,
        optional: true,
        bonusReward: {
          type: 'rare_resource',
          amount: 1,
          description: 'Quantum Decryption Key',
          rarity: 'epic'
        }
      },
      {
        id: 'maintain_stealth',
        description: 'Maintain stealth level below 50%',
        type: 'maintain_uptime',
        target: 50,
        progress: 0,
        completed: false
      },
      {
        id: 'extract_data',
        description: 'Extract confidential data packages',
        type: 'collect',
        target: 50000,
        progress: 0,
        completed: false
      }
    ],
    rewards: [
      {
        type: 'credits',
        amount: 20000,
        description: 'Credits from the mission'
      },
      {
        type: 'data',
        amount: 10000,
        description: 'Data from the mission'
      },
      {
        type: 'experience',
        amount: 5000,
        description: 'Experience points from the mission'
      },
      {
        type: 'special_upgrade',
        amount: 1,
        description: 'Corporate Mainframe Access',
        rarity: 'legendary'
      }
    ],
    requirements: {
      playerLevel: 10,
      hackingSkill: 20
    },
    story: [
      "TARGET IDENTIFIED: MegaCorp Mainframe System v9.2",
      "Intelligence suggests critical vulnerability in node configuration",
      "Caution: Advanced counter-measure systems detected",
      "Objective: Extract confidential data packages",
      "Note: System will alert security after detection"
    ]
  }
]; 