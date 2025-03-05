import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Mission, initialMissions } from '../data/missions';
// @ts-ignore: Suppress error if type declarations for dynamicEvents are not found
import { DynamicEvent, initialDynamicEvents } from '../data/dynamicEvents';
import { generateMission } from '../utils/missionGenerator';
import { generateDynamicEvent } from '../utils/dynamicEventGenerator';

// Define types for our game state
export interface GameState {
  data: number;
  dataPerClick: number;
  dataPerSecond: number;
  crypto: number;
  cryptoPerSecond: number;
  processingPower: number;
  networkNodes: number;
  reputation: number;
  lastTimestamp: number;
  upgrades: Upgrade[];
  bonusMultiplier: number;
  bonusUntil: number;
  totalClicks: number;
  fallingBitsPerClick: number;
  achievements: Achievement[];
  prestigeLevel: number;
  prestigeMultiplier: number;
  criticalChance: number;
  criticalMultiplier: number;
  hackingSkill: number;
  lastHackTime: number;
  hackCooldown: number;
  servers: Server[];
  currentServerId: string;
  activeAttacks: NetworkAttack[];
  lastAttackTime: number;
  attackCooldown: number;
  missions: Mission[];
  activeMissionId: string | null;
  dynamicEvents: DynamicEvent[];
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  effect: 'dataPerClick' | 'dataPerSecond' | 'cryptoPerSecond' | 'processingMultiplier' | 'criticalChance' | 'criticalMultiplier' | 'hackingSkill';
  effectValue: number;
  level: number;
  maxLevel: number;
  isUnlocked: boolean;
  visibleAtData?: number;
  visibleAtCrypto?: number;
  visibleAtProcessingPower?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  condition: 'clicks' | 'data' | 'crypto' | 'processingPower' | 'upgrades';
  threshold: number;
  reward: {
    type: 'dataMultiplier' | 'cryptoMultiplier' | 'processingMultiplier' | 'criticalChance';
    value: number;
  };
}

export interface Server {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: number;
  securityLevel: number;
  maxSecurityLevel: number;
  isUnlocked: boolean;
  resourceMultipliers: {
    data: number;
    crypto: number;
    processingPower: number;
  };
  unlocksAt: {
    hackingSkill?: number;
    data?: number;
    crypto?: number;
  };
  discoveryChance: number; // % chance to discover when hacking
}

export interface NetworkAttack {
  id: string;
  serverId: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timeStarted: number;
  duration: number; // in ms
  securityImpact: number;
  dataTheft: number; // data per second stolen
  resourceDrain: {
    data: number;
    crypto: number;
    processingPower: number;
  };
  resolved: boolean;
  defense: {
    requiredData: number;
    requiredProcessingPower: number;
    requiredHackingSkill: number;
  };
}

// Action types for our reducer
type GameAction =
  | { type: 'CLICK' }
  | { type: 'CLICK_BONUS'; payload: { multiplier: number } }
  | { type: 'BUY_UPGRADE'; payload: { upgradeId: string } }
  | { type: 'UPDATE_IDLE_PROGRESS'; timePassed: number }
  | { type: 'RESET_GAME' }
  | { type: 'MANUAL_HACK'; payload: { target: string } }
  | { type: 'PRESTIGE' }
  | { type: 'CLAIM_ACHIEVEMENT'; payload: { achievementId: string } }
  | { type: 'MANUAL_MINE' }
  | { type: 'ACTIVATE_BONUS'; payload: { duration: number; multiplier: number } }
  | { type: 'SWITCH_SERVER'; payload: { serverId: string } }
  | { type: 'DISCOVER_SERVER'; payload: { serverId: string } }
  | { type: 'UPDATE_SERVER_SECURITY'; payload: { serverId: string; amount: number } }
  | { type: 'TRIGGER_ATTACK'; payload: { serverId: string } }
  | { type: 'RESOLVE_ATTACK'; payload: { attackId: string } }
  | { type: 'EXPIRE_ATTACK'; payload: { attackId: string } }
  | { type: 'START_MISSION'; missionId: string }
  | { type: 'UPDATE_MISSION_PROGRESS'; missionId: string; objectiveId: string; progress: number }
  | { type: 'COMPLETE_MISSION'; missionId: string }
  | { type: 'CLAIM_MISSION_REWARDS'; missionId: string }
  | { type: 'UPDATE_HACKING_SKILL'; amount: number }
  | { type: 'TRIGGER_DYNAMIC_EVENT'; event: DynamicEvent }
  | { type: 'RESOLVE_DYNAMIC_EVENT'; eventId: string }
  | { type: 'GENERATE_MISSION' }
  | { type: 'BACKGROUND_CLICK' };

// Initialize achievements
const initialAchievements: Achievement[] = [
  {
    id: 'first_clicks',
    name: 'First Steps',
    description: 'Click 10 times',
    unlocked: false,
    condition: 'clicks',
    threshold: 10,
    reward: { type: 'dataMultiplier', value: 1.1 }
  },
  {
    id: 'click_master',
    name: 'Click Master',
    description: 'Click 100 times',
    unlocked: false,
    condition: 'clicks',
    threshold: 100,
    reward: { type: 'dataMultiplier', value: 1.2 }
  },
  {
    id: 'click_grandmaster',
    name: 'Click Grandmaster',
    description: 'Click 1,000 times',
    unlocked: false,
    condition: 'clicks',
    threshold: 1000,
    reward: { type: 'dataMultiplier', value: 1.5 }
  },
  {
    id: 'data_collector',
    name: 'Data Collector',
    description: 'Collect 1,000 bytes of data',
    unlocked: false,
    condition: 'data',
    threshold: 1000,
    reward: { type: 'processingMultiplier', value: 1.1 }
  },
  {
    id: 'data_hoarder',
    name: 'Data Hoarder',
    description: 'Collect 1,000,000 bytes of data',
    unlocked: false,
    condition: 'data',
    threshold: 1000000,
    reward: { type: 'processingMultiplier', value: 1.5 }
  },
  {
    id: 'crypto_miner',
    name: 'Crypto Miner',
    description: 'Mine 1 crypto',
    unlocked: false,
    condition: 'crypto',
    threshold: 1,
    reward: { type: 'cryptoMultiplier', value: 1.1 }
  },
  {
    id: 'upgrade_enthusiast',
    name: 'Upgrade Enthusiast',
    description: 'Purchase 5 upgrades',
    unlocked: false,
    condition: 'upgrades',
    threshold: 5,
    reward: { type: 'criticalChance', value: 0.05 }
  }
];

// Initial servers
const initialServers: Server[] = [
  {
    id: 'home_pc',
    name: 'Home PC',
    description: 'Your personal computer. A safe starting point.',
    icon: '💻',
    difficulty: 1,
    securityLevel: 0,
    maxSecurityLevel: 5,
    isUnlocked: true,
    resourceMultipliers: {
      data: 1,
      crypto: 1,
      processingPower: 1
    },
    unlocksAt: {},
    discoveryChance: 0
  },
  {
    id: 'local_network',
    name: 'Local Network',
    description: 'The network in your building. More resources but some security.',
    icon: '🌐',
    difficulty: 2,
    securityLevel: 1,
    maxSecurityLevel: 10,
    isUnlocked: false,
    resourceMultipliers: {
      data: 2,
      crypto: 1.5,
      processingPower: 1.2
    },
    unlocksAt: {
      hackingSkill: 5,
      data: 5000
    },
    discoveryChance: 10
  },
  {
    id: 'corporate_server',
    name: 'Corporate Server',
    description: 'A small business server with valuable data.',
    icon: '🏢',
    difficulty: 3,
    securityLevel: 3,
    maxSecurityLevel: 15,
    isUnlocked: false,
    resourceMultipliers: {
      data: 5,
      crypto: 3,
      processingPower: 2
    },
    unlocksAt: {
      hackingSkill: 15,
      data: 50000
    },
    discoveryChance: 20
  },
  {
    id: 'government_database',
    name: 'Government Database',
    description: 'Highly secured government systems with valuable information.',
    icon: '🏛️',
    difficulty: 5,
    securityLevel: 7,
    maxSecurityLevel: 25,
    isUnlocked: false,
    resourceMultipliers: {
      data: 10,
      crypto: 7,
      processingPower: 5
    },
    unlocksAt: {
      hackingSkill: 30,
      data: 500000
    },
    discoveryChance: 15
  },
  {
    id: 'quantum_mainframe',
    name: 'Quantum Mainframe',
    description: 'State-of-the-art quantum computing facility. The ultimate challenge.',
    icon: '⚛️',
    difficulty: 10,
    securityLevel: 15,
    maxSecurityLevel: 50,
    isUnlocked: false,
    resourceMultipliers: {
      data: 25,
      crypto: 20,
      processingPower: 15
    },
    unlocksAt: {
      hackingSkill: 50,
      data: 10000000,
      crypto: 1000
    },
    discoveryChance: 5
  }
];

// Initial game state
const initialState: GameState = {
  data: 0,
  dataPerClick: 1,
  dataPerSecond: 0,
  crypto: 0,
  cryptoPerSecond: 0,
  processingPower: 0,
  networkNodes: 0,
  reputation: 0,
  lastTimestamp: Date.now(),
  bonusMultiplier: 1,
  bonusUntil: 0,
  totalClicks: 0,
  fallingBitsPerClick: 3, // Base number of falling bits per click
  achievements: initialAchievements,
  prestigeLevel: 0,
  prestigeMultiplier: 1,
  criticalChance: 0.01, // 1% base chance for critical clicks
  criticalMultiplier: 2.0, // 2x base critical multiplier
  hackingSkill: 0,
  lastHackTime: 0,
  hackCooldown: 30000, // 30 seconds cooldown for hacking
  servers: initialServers,
  currentServerId: 'home_pc',
  activeAttacks: [],
  lastAttackTime: 0,
  attackCooldown: 60000, // 1 minute minimum between attacks
  upgrades: [
    // Original upgrades
    {
      id: 'basic_script',
      name: 'Basic Data Scraper',
      description: 'Automatically collects data from public sources.',
      baseCost: 10,
      costMultiplier: 1.15,
      effect: 'dataPerSecond',
      effectValue: 0.1,
      level: 0,
      maxLevel: 0,
      isUnlocked: true,
      visibleAtData: 0
    },
    {
      id: 'advanced_script',
      name: 'Advanced Algorithm',
      description: 'An improved script that collects data more efficiently.',
      baseCost: 50,
      costMultiplier: 1.15,
      effect: 'dataPerSecond',
      effectValue: 0.5,
      level: 0,
      maxLevel: 0,
      isUnlocked: false,
      visibleAtData: 30
    },
    {
      id: 'cpu_upgrade',
      name: 'CPU Upgrade',
      description: 'Increases the amount of data collected per click.',
      baseCost: 30,
      costMultiplier: 1.2,
      effect: 'dataPerClick',
      effectValue: 1,
      level: 0,
      maxLevel: 10,
      isUnlocked: true,
      visibleAtData: 0
    },
    {
      id: 'mining_software',
      name: 'Crypto Mining Software',
      description: 'Begin mining cryptocurrency on your system.',
      baseCost: 100,
      costMultiplier: 1.3,
      effect: 'cryptoPerSecond',
      effectValue: 0.01,
      level: 0,
      maxLevel: 0,
      isUnlocked: false,
      visibleAtData: 75
    },
    {
      id: 'optimization_tools',
      name: 'System Optimization',
      description: 'Optimize your system to process data more efficiently.',
      baseCost: 200,
      costMultiplier: 1.5,
      effect: 'processingMultiplier',
      effectValue: 0.1,
      level: 0,
      maxLevel: 5,
      isUnlocked: false,
      visibleAtData: 150
    },
    // New upgrades
    {
      id: 'critical_chance',
      name: 'Critical Analysis',
      description: 'Increases chance for critical clicks that give 2x data.',
      baseCost: 500,
      costMultiplier: 2.0,
      effect: 'criticalChance',
      effectValue: 0.05, // +5% critical chance per level
      level: 0,
      maxLevel: 5,
      isUnlocked: false,
      visibleAtData: 300
    },
    {
      id: 'critical_power',
      name: 'Critical Power',
      description: 'Increases the multiplier for critical clicks.',
      baseCost: 1000,
      costMultiplier: 2.5,
      effect: 'criticalMultiplier',
      effectValue: 0.5, // +0.5x critical multiplier per level
      level: 0,
      maxLevel: 5,
      isUnlocked: false,
      visibleAtData: 800
    },
    {
      id: 'hacking_skills',
      name: 'Hacking Skills',
      description: 'Improves your ability to hack systems for bonus data.',
      baseCost: 2000,
      costMultiplier: 2.0,
      effect: 'hackingSkill',
      effectValue: 1, // +1 hacking skill per level
      level: 0,
      maxLevel: 10,
      isUnlocked: false,
      visibleAtData: 1500
    }
  ],
  missions: initialMissions,
  activeMissionId: null,
  dynamicEvents: initialDynamicEvents
};

// Helper function to check achievements
const checkAchievements = (state: GameState): GameState => {
  const newAchievements = state.achievements.map(achievement => {
    if (achievement.unlocked) return achievement;
    
    let thresholdMet = false;
    
    switch (achievement.condition) {
      case 'clicks':
        thresholdMet = state.totalClicks >= achievement.threshold;
        break;
      case 'data':
        thresholdMet = state.data >= achievement.threshold;
        break;
      case 'crypto':
        thresholdMet = state.crypto >= achievement.threshold;
        break;
      case 'processingPower':
        thresholdMet = state.processingPower >= achievement.threshold;
        break;
      case 'upgrades':
        thresholdMet = state.upgrades.filter(u => u.level > 0).length >= achievement.threshold;
        break;
    }
    
    if (thresholdMet) {
      // Achievement unlocked!
      return { ...achievement, unlocked: true };
    }
    
    return achievement;
  });
  
  return { ...state, achievements: newAchievements };
};

// Generate a random network attack based on server and player stats
const generateNetworkAttack = (serverId: string, state: GameState): NetworkAttack => {
  const server = state.servers.find(s => s.id === serverId);
  const baseAttackTypes = [
    {
      name: 'Brute Force Attack',
      description: 'Someone is attempting to crack your passwords using brute force methods.',
      securityImpact: 2,
      dataTheft: 0.1,
      resourceDrain: { data: 0.01, crypto: 0, processingPower: 0.05 },
      defense: { requiredData: 100, requiredProcessingPower: 10, requiredHackingSkill: 5 }
    },
    {
      name: 'DDoS Attack',
      description: 'A distributed denial of service attack is overwhelming your network.',
      securityImpact: 3,
      dataTheft: 0,
      resourceDrain: { data: 0, crypto: 0, processingPower: 0.2 },
      defense: { requiredData: 200, requiredProcessingPower: 20, requiredHackingSkill: 8 }
    },
    {
      name: 'Data Siphon',
      description: 'Your data is being slowly extracted by an unknown entity.',
      securityImpact: 1,
      dataTheft: 0.5,
      resourceDrain: { data: 0.05, crypto: 0.01, processingPower: 0 },
      defense: { requiredData: 300, requiredProcessingPower: 5, requiredHackingSkill: 10 }
    },
    {
      name: 'Crypto Miner',
      description: 'Unauthorized crypto mining detected on your system.',
      securityImpact: 1,
      dataTheft: 0,
      resourceDrain: { data: 0, crypto: 0.1, processingPower: 0.1 },
      defense: { requiredData: 150, requiredProcessingPower: 15, requiredHackingSkill: 7 }
    },
    {
      name: 'Rootkit Installation',
      description: 'Something is trying to install a rootkit on your system.',
      securityImpact: 5,
      dataTheft: 0.2,
      resourceDrain: { data: 0.02, crypto: 0.02, processingPower: 0.02 },
      defense: { requiredData: 500, requiredProcessingPower: 30, requiredHackingSkill: 15 }
    },
    {
      name: 'Phishing Scam',
      description: 'A deceptive phishing scam attempts to trick you out of valuable resources.',
      securityImpact: 2,
      dataTheft: 0.2,
      resourceDrain: { data: 0.02, crypto: 0.05, processingPower: 0.02 },
      defense: { requiredData: 120, requiredProcessingPower: 12, requiredHackingSkill: 6 }
    }
  ];
  
  // Choose a random attack type
  const attackType = baseAttackTypes[Math.floor(Math.random() * baseAttackTypes.length)];
  
  // Scale the attack based on server difficulty
  const difficulty = server ? server.difficulty : 1;
  const securityImpact = attackType.securityImpact * difficulty * 0.5;
  const dataTheft = attackType.dataTheft * difficulty;
  const resourceDrain = {
    data: attackType.resourceDrain.data * difficulty,
    crypto: attackType.resourceDrain.crypto * difficulty,
    processingPower: attackType.resourceDrain.processingPower * difficulty
  };
  
  // Scale defense requirements based on server and player progress
  const defense = {
    requiredData: attackType.defense.requiredData * difficulty * (1 + state.prestigeLevel * 0.5),
    requiredProcessingPower: attackType.defense.requiredProcessingPower * difficulty * (1 + state.prestigeLevel * 0.2),
    requiredHackingSkill: attackType.defense.requiredHackingSkill + (difficulty * 2)
  };
  
  // Determine severity based on impact
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  const impactScore = securityImpact + (dataTheft * 2) + 
    ((resourceDrain.data + resourceDrain.crypto + resourceDrain.processingPower) * 10);
    
  if (impactScore > 20) severity = 'critical';
  else if (impactScore > 10) severity = 'high';
  else if (impactScore > 5) severity = 'medium';
  
  // Attack duration based on severity (2-10 minutes)
  const durationMinutes = severity === 'low' ? 2 :
    severity === 'medium' ? 4 :
    severity === 'high' ? 7 : 10;
    
  return {
    id: `attack_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    serverId,
    name: attackType.name,
    description: attackType.description,
    severity,
    timeStarted: Date.now(),
    duration: durationMinutes * 60 * 1000,
    securityImpact,
    dataTheft,
    resourceDrain,
    resolved: false,
    defense
  };
};

// Game reducer function
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'CLICK': {
      // Get current server multiplier
      const currentServer = state.servers.find(server => server.id === state.currentServerId) || state.servers[0];
      const serverMultiplier = currentServer.resourceMultipliers.data;
      
      // Calculate if this click is critical
      const isCritical = Math.random() < state.criticalChance;
      const criticalMultiplier = isCritical ? state.criticalMultiplier : 1;
      
      // Calculate total data from this click
      const dataGained = state.dataPerClick * state.bonusMultiplier * state.prestigeMultiplier * serverMultiplier * criticalMultiplier;
      
      // Check for server security increase (more difficult servers increase security faster)
      let updatedServers = [...state.servers];
      if (currentServer.id !== 'home_pc') {
        const securityIncrease = 0.01 * currentServer.difficulty;
        updatedServers = updatedServers.map(server => {
          if (server.id === currentServer.id) {
            const newSecurity = Math.min(server.maxSecurityLevel, server.securityLevel + securityIncrease);
            return { ...server, securityLevel: newSecurity };
          }
          return server;
        });
      }
      
      // Check for server discovery if hacking skill is high enough
      const randomDiscovery = Math.random() * 100;
      const potentialNewServers = state.servers.filter(server => 
        !server.isUnlocked && 
        server.discoveryChance > 0 && 
        (!server.unlocksAt.hackingSkill || state.hackingSkill >= server.unlocksAt.hackingSkill) &&
        (!server.unlocksAt.data || state.data >= server.unlocksAt.data) &&
        (!server.unlocksAt.crypto || state.crypto >= server.unlocksAt.crypto)
      );
      
      let discoveredServer = null;
      for (const server of potentialNewServers) {
        if (randomDiscovery <= server.discoveryChance) {
          discoveredServer = server.id;
          updatedServers = updatedServers.map(s => 
            s.id === server.id ? { ...s, isUnlocked: true } : s
          );
          break;
        }
      }
      
      return {
        ...state,
        data: state.data + dataGained,
        totalClicks: state.totalClicks + 1,
        servers: updatedServers
      };
    }
    
    case 'CLICK_BONUS': {
      const now = Date.now();
      const { multiplier } = action.payload;
      
      // Apply immediate bonus
      const bonusData = state.dataPerClick * multiplier * state.prestigeMultiplier;
      
      // Set a temporary multiplier for 10 seconds
      const newState = {
        ...state,
        data: state.data + bonusData,
        bonusMultiplier: Math.max(state.bonusMultiplier, multiplier / 2),
        bonusUntil: now + 10000, // 10 seconds
        totalClicks: state.totalClicks + 1,
        lastTimestamp: now
      };
      
      return checkAchievements(newState);
    }
    
    case 'ACTIVATE_BONUS': {
      const now = Date.now();
      const { duration, multiplier } = action.payload;
      
      return {
        ...state,
        bonusMultiplier: Math.max(state.bonusMultiplier, multiplier),
        bonusUntil: now + duration
      };
    }
    
    case 'BUY_UPGRADE': {
      const upgradeIndex = state.upgrades.findIndex(u => u.id === action.payload.upgradeId);
      
      if (upgradeIndex === -1) return state;
      
      const upgrade = state.upgrades[upgradeIndex];
      
      // Calculate the cost of the next level
      const cost = upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level);
      
      // Check if player can afford the upgrade
      if (state.data < cost) return state;
      
      // Check if already at max level
      if (upgrade.maxLevel > 0 && upgrade.level >= upgrade.maxLevel) return state;
      
      // Create new upgrades array with the updated upgrade
      const newUpgrades = [...state.upgrades];
      newUpgrades[upgradeIndex] = {
        ...upgrade,
        level: upgrade.level + 1
      };
      
      // Update visibility of other upgrades based on data amounts
      const updatedUpgrades = newUpgrades.map(u => {
        if (!u.isUnlocked && u.visibleAtData && state.data >= u.visibleAtData) {
          return { ...u, isUnlocked: true };
        }
        return u;
      });
      
      // Calculate the new state based on the upgrade effect
      let newState = {
        ...state,
        data: state.data - cost,
        upgrades: updatedUpgrades,
        lastTimestamp: Date.now()
      };
      
      // Apply the specific effect of the upgrade
      switch (upgrade.effect) {
        case 'dataPerClick':
          newState.dataPerClick = state.dataPerClick + upgrade.effectValue;
          // Each data per click upgrade increases falling bits by 1
          newState.fallingBitsPerClick = state.fallingBitsPerClick + 1;
          break;
        case 'dataPerSecond':
          newState.dataPerSecond = state.dataPerSecond + upgrade.effectValue;
          break;
        case 'cryptoPerSecond':
          // Fix: Apply the crypto rate properly
          newState.cryptoPerSecond = state.cryptoPerSecond + upgrade.effectValue;
          break;
        case 'processingMultiplier':
          // Apply processing power multiplier effect
          newState.processingPower = state.processingPower + upgrade.effectValue;
          // This might also affect other rates
          // Adjust falling bits for processing power upgrades
          newState.fallingBitsPerClick = state.fallingBitsPerClick + (upgrade.effectValue * 2);
          
          // Processing power boosts all resource generation
          newState.dataPerSecond = state.dataPerSecond * (1 + upgrade.effectValue);
          newState.cryptoPerSecond = state.cryptoPerSecond * (1 + upgrade.effectValue);
          break;
        case 'criticalChance':
          newState.criticalChance = state.criticalChance + upgrade.effectValue;
          break;
        case 'criticalMultiplier':
          newState.criticalMultiplier = state.criticalMultiplier + upgrade.effectValue;
          break;
        case 'hackingSkill':
          newState.hackingSkill = state.hackingSkill + upgrade.effectValue;
          break;
      }
      
      return checkAchievements(newState);
    }
    
    case 'UPDATE_IDLE_PROGRESS': {
      const { timePassed } = action;
      const secondsPassed = timePassed / 1000;
      
      // Get current server multiplier
      const currentServer = state.servers.find(server => server.id === state.currentServerId) || state.servers[0];
      const dataMultiplier = currentServer.resourceMultipliers.data;
      const cryptoMultiplier = currentServer.resourceMultipliers.crypto;
      const processingMultiplier = currentServer.resourceMultipliers.processingPower;
      
      // Apply security level penalty (higher security = lower efficiency)
      const securityPenalty = Math.max(0.5, 1 - (currentServer.securityLevel / currentServer.maxSecurityLevel) * 0.5);
      
      // Calculate resource gains
      const dataGained = state.dataPerSecond * secondsPassed * state.bonusMultiplier * state.prestigeMultiplier * dataMultiplier * securityPenalty;
      const cryptoGained = state.cryptoPerSecond * secondsPassed * cryptoMultiplier * securityPenalty;
      const processingGained = (state.upgrades
        .filter(upgrade => upgrade.effect === 'processingMultiplier' && upgrade.level > 0)
        .reduce((total, upgrade) => total + upgrade.effectValue * upgrade.level, 0)) * processingMultiplier * secondsPassed * securityPenalty;
      
      // Gradually reduce security over time (except for home PC which stays at 0)
      let updatedServers = [...state.servers];
      if (currentServer.id !== 'home_pc') {
        updatedServers = updatedServers.map(server => {
          if (server.id === currentServer.id && server.securityLevel > 0) {
            // Security slowly decreases over time
            const newSecurity = Math.max(0, server.securityLevel - 0.005 * secondsPassed);
            return { ...server, securityLevel: newSecurity };
          }
          return server;
        });
      }
      
      // Process active attacks
      let updatedAttacks = [...state.activeAttacks];
      let resourceLoss = { data: 0, crypto: 0, processingPower: 0 };
      let securityImpact: { [serverId: string]: number } = {};
      
      updatedAttacks = updatedAttacks.map(attack => {
        // Skip resolved attacks
        if (attack.resolved) return attack;
        
        // Check if attack has expired
        if (Date.now() > attack.timeStarted + attack.duration) {
          return { ...attack, resolved: true };
        }
        
        // Calculate resource drain from this attack
        resourceLoss.data += attack.resourceDrain.data * secondsPassed;
        resourceLoss.crypto += attack.resourceDrain.crypto * secondsPassed;
        resourceLoss.processingPower += attack.resourceDrain.processingPower * secondsPassed;
        
        // Apply security impact to affected server
        if (!securityImpact[attack.serverId]) {
          securityImpact[attack.serverId] = 0;
        }
        securityImpact[attack.serverId] += attack.securityImpact * (secondsPassed / 60); // Scale by minute
        
        return attack;
      });
      
      // Update servers with security impact from attacks
      for (const serverId in securityImpact) {
        updatedServers = updatedServers.map(server => {
          if (server.id === serverId) {
            const newSecurity = Math.min(server.maxSecurityLevel, server.securityLevel + securityImpact[serverId]);
            return { ...server, securityLevel: newSecurity };
          }
          return server;
        });
      }
      
      // Randomly trigger new attacks (but not too frequently)
      const now = Date.now();
      let newAttack = null;
      
      if (
        now > state.lastAttackTime + state.attackCooldown && 
        updatedAttacks.filter(a => !a.resolved).length < 3 && // Max 3 active attacks
        Math.random() < 0.2 * Math.min(1, secondsPassed / 5) // 4% chance per second up to 20% per 5 seconds
      ) {
        // Choose a random unlocked server that isn't home_pc
        const targetServers = state.servers.filter(server => 
          server.isUnlocked && server.id !== 'home_pc'
        );
        
        if (targetServers.length > 0) {
          const targetServer = targetServers[Math.floor(Math.random() * targetServers.length)];
          newAttack = generateNetworkAttack(targetServer.id, state);
          updatedAttacks.push(newAttack);
        }
      }
      
      return {
        ...state,
        data: Math.max(0, state.data + dataGained - resourceLoss.data),
        crypto: Math.max(0, state.crypto + cryptoGained - resourceLoss.crypto),
        processingPower: Math.max(0, state.processingPower + processingGained - resourceLoss.processingPower),
        lastTimestamp: Date.now(),
        servers: updatedServers,
        activeAttacks: updatedAttacks,
        lastAttackTime: newAttack ? now : state.lastAttackTime
      };
    }
    
    case 'MANUAL_HACK': {
      const now = Date.now();
      const target = action.payload.target;
      
      // Check cooldown
      if (now - state.lastHackTime < state.hackCooldown) {
        return state; // Still on cooldown
      }
      
      // Base success chance depends on hacking skill
      const baseRewards: Record<string, number> = {
        network: 10,
        database: 50,
        server: 200,
        mainframe: 1000
      };
      
      const reward = baseRewards[target] || 10;
      
      // Calculate reward based on hacking skill and processing power
      const hackMultiplier = 1 + (state.hackingSkill * 0.1) + (state.processingPower * 0.05);
      const dataGained = reward * state.dataPerClick * hackMultiplier;
      
      return checkAchievements({
        ...state,
        data: state.data + dataGained,
        lastHackTime: now
      });
    }
    
    case 'MANUAL_MINE': {
      // Manual mining gives you 10 seconds worth of crypto instantly
      if (state.cryptoPerSecond <= 0) return state;
      
      const cryptoGained = state.cryptoPerSecond * 10;
      
      return checkAchievements({
        ...state,
        crypto: state.crypto + cryptoGained
      });
    }
    
    case 'CLAIM_ACHIEVEMENT': {
      const achievementId = action.payload.achievementId;
      const achievement = state.achievements.find(a => a.id === achievementId);
      
      if (!achievement || !achievement.unlocked) return state;
      
      // Apply achievement reward
      let newState = { ...state };
      
      switch (achievement.reward.type) {
        case 'dataMultiplier':
          newState.dataPerClick *= achievement.reward.value;
          newState.dataPerSecond *= achievement.reward.value;
          break;
        case 'cryptoMultiplier':
          newState.cryptoPerSecond *= achievement.reward.value;
          break;
        case 'processingMultiplier':
          newState.processingPower *= achievement.reward.value;
          break;
        case 'criticalChance':
          newState.criticalChance += achievement.reward.value;
          break;
      }
      
      return newState;
    }
    
    case 'PRESTIGE': {
      // Prestige resets most progress but gives a permanent multiplier
      // The multiplier is based on the amount of data and crypto collected
      const prestigeBonus = Math.log10(state.data + 1) * 0.1; // Logarithmic scaling
      
      return {
        ...initialState,
        prestigeLevel: state.prestigeLevel + 1,
        prestigeMultiplier: state.prestigeMultiplier + prestigeBonus,
        achievements: state.achievements, // Keep achievements
        lastTimestamp: Date.now()
      };
    }
    
    case 'RESET_GAME':
      return {
        ...initialState,
        lastTimestamp: Date.now()
      };
    
    case 'SWITCH_SERVER': {
      const { serverId } = action.payload;
      const targetServer = state.servers.find(server => server.id === serverId);
      
      if (!targetServer || !targetServer.isUnlocked) {
        return state;
      }
      
      return {
        ...state,
        currentServerId: serverId
      };
    }
    
    case 'DISCOVER_SERVER': {
      const { serverId } = action.payload;
      const updatedServers = state.servers.map(server => 
        server.id === serverId ? { ...server, isUnlocked: true } : server
      );
      
      return {
        ...state,
        servers: updatedServers
      };
    }
    
    case 'UPDATE_SERVER_SECURITY': {
      const { serverId, amount } = action.payload;
      const updatedServers = state.servers.map(server => {
        if (server.id === serverId) {
          const newSecurity = Math.max(0, Math.min(server.maxSecurityLevel, server.securityLevel + amount));
          return { ...server, securityLevel: newSecurity };
        }
        return server;
      });
      
      return {
        ...state,
        servers: updatedServers
      };
    }
    
    case 'TRIGGER_ATTACK': {
      const { serverId } = action.payload;
      const server = state.servers.find(s => s.id === serverId);
      
      if (!server || !server.isUnlocked) {
        return state;
      }
      
      const newAttack = generateNetworkAttack(serverId, state);
      
      return {
        ...state,
        activeAttacks: [...state.activeAttacks, newAttack],
        lastAttackTime: Date.now()
      };
    }
    
    case 'RESOLVE_ATTACK': {
      const { attackId } = action.payload;
      const attack = state.activeAttacks.find(a => a.id === attackId);
      
      if (!attack || attack.resolved) {
        return state;
      }
      
      // Check if player has resources to defend
      if (
        state.data < attack.defense.requiredData ||
        state.processingPower < attack.defense.requiredProcessingPower ||
        state.hackingSkill < attack.defense.requiredHackingSkill
      ) {
        return state;
      }
      
      // Consume resources
      const updatedAttacks = state.activeAttacks.map(a => 
        a.id === attackId ? { ...a, resolved: true } : a
      );
      
      return {
        ...state,
        data: state.data - attack.defense.requiredData,
        processingPower: state.processingPower - attack.defense.requiredProcessingPower,
        activeAttacks: updatedAttacks
      };
    }
    
    case 'EXPIRE_ATTACK': {
      const { attackId } = action.payload;
      
      const updatedAttacks = state.activeAttacks.map(a => 
        a.id === attackId ? { ...a, resolved: true } : a
      );
      
      return {
        ...state,
        activeAttacks: updatedAttacks
      };
    }
    
    case 'START_MISSION': {
      return {
        ...state,
        missions: state.missions.map(mission =>
          mission.id === action.missionId
            ? { ...mission, status: 'active' }
            : mission
        ),
        activeMissionId: action.missionId
      };
    }
    
    case 'UPDATE_MISSION_PROGRESS': {
      return {
        ...state,
        missions: state.missions.map(mission =>
          mission.id === action.missionId
            ? {
                ...mission,
                objectives: mission.objectives.map(objective =>
                  objective.id === action.objectiveId
                    ? {
                        ...objective,
                        progress: action.progress,
                        completed: action.progress >= (typeof objective.target === 'number' ? objective.target : 1)
                      }
                    : objective
                )
              }
            : mission
        )
      };
    }
    
    case 'COMPLETE_MISSION': {
      return {
        ...state,
        missions: state.missions.map(mission =>
          mission.id === action.missionId
            ? { ...mission, status: 'completed' }
            : mission
        ),
        activeMissionId: null
      };
    }
    
    case 'CLAIM_MISSION_REWARDS': {
      const mission = state.missions.find(m => m.id === action.missionId);
      if (!mission) return state;

      let newState = { ...state };
      
      mission.rewards.forEach(reward => {
        switch (reward.type) {
          case 'data':
            newState.data += reward.amount;
            break;
          case 'crypto':
            newState.crypto += reward.amount;
            break;
          case 'processing_power':
            newState.processingPower += reward.amount;
            break;
          case 'hacking_skill':
            newState.hackingSkill += reward.amount;
            break;
          // Handle other reward types as needed
        }
      });

      return newState;
    }
    
    case 'UPDATE_HACKING_SKILL': {
      return {
        ...state,
        hackingSkill: state.hackingSkill + action.amount
      };
    }
    
    case 'TRIGGER_DYNAMIC_EVENT': {
      return {
        ...state,
        dynamicEvents: [...state.dynamicEvents, action.event]
      };
    }
    
    case 'RESOLVE_DYNAMIC_EVENT': {
      const eventToResolve = state.dynamicEvents.find(e => e.id === action.eventId);
      if (!eventToResolve || eventToResolve.resolved) return state;

      let newState = { ...state };

      // Apply reward if defined
      if (eventToResolve.reward) {
        switch (eventToResolve.reward.type) {
          case 'data':
            newState.data += eventToResolve.reward.amount;
            break;
          case 'crypto':
            newState.crypto += eventToResolve.reward.amount;
            break;
          case 'processing_power':
            newState.processingPower += eventToResolve.reward.amount;
            break;
          case 'hacking_skill':
            newState.hackingSkill += eventToResolve.reward.amount;
            break;
          // Add more cases if needed
        }
      }
      
      return {
        ...newState,
        dynamicEvents: state.dynamicEvents.map(event =>
          event.id === action.eventId ? { ...event, resolved: true } : event
        )
      };
    }
    
    case 'GENERATE_MISSION': {
      const newMission = generateMission(state);
      return {
        ...state,
        missions: [...state.missions, newMission]
      };
    }
    
    case 'BACKGROUND_CLICK': {
      // Get current server multiplier
      const currentServer = state.servers.find(server => server.id === state.currentServerId) || state.servers[0];
      const serverMultiplier = currentServer.resourceMultipliers.data;

      // Background clicks yield 50% of a normal click's data
      const rewardFactor = 0.5;
      const dataGained = state.dataPerClick * rewardFactor * state.bonusMultiplier * state.prestigeMultiplier * serverMultiplier;

      // Optionally, you could add visual effects or additional bonuses here
      return {
        ...state,
        data: state.data + dataGained,
        totalClicks: state.totalClicks + 1,
        lastTimestamp: Date.now()
      };
    }
    
    default:
      return state;
  }
};

// Create the context
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  // Game loop - update resources based on per-second rates
  useEffect(() => {
    const gameLoopInterval = setInterval(() => {
      const now = Date.now();
      const timePassed = now - state.lastTimestamp;
      
      dispatch({ type: 'UPDATE_IDLE_PROGRESS', timePassed });
    }, 100); // Update 10 times per second for smoother animation
    
    return () => clearInterval(gameLoopInterval);
  }, [state.lastTimestamp]);
  
  // Save game state to localStorage
  useEffect(() => {
    const saveInterval = setInterval(() => {
      localStorage.setItem('hackerClickerGameState', JSON.stringify(state));
    }, 60000); // Save every minute
    
    return () => clearInterval(saveInterval);
  }, [state]);
  
  // Load saved game on initial render
  useEffect(() => {
    const savedState = localStorage.getItem('hackerClickerGameState');
    
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState) as GameState;
        const now = Date.now();
        const timePassed = now - parsedState.lastTimestamp;
        
        // Apply idle progress since last save
        dispatch({ type: 'UPDATE_IDLE_PROGRESS', timePassed });
      } catch (error) {
        console.error('Failed to load saved game state', error);
      }
    }
  }, []);
  
  // Trigger random dynamic events
  useEffect(() => {
    const eventInterval = setInterval(() => {
      // If there are no unresolved dynamic events, and with a 1% chance per second, trigger a new dynamic event
      if (state.dynamicEvents.filter(e => !e.resolved).length < 1 && Math.random() < 0.01) {
        const newEvent = generateDynamicEvent(state);
        dispatch({ type: 'TRIGGER_DYNAMIC_EVENT', event: newEvent });
      }
    }, 1000);
    return () => clearInterval(eventInterval);
  }, [state.dynamicEvents, dispatch]);
  
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = () => {
  const context = useContext(GameContext);
  
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  return context;
}; 