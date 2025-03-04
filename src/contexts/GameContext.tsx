import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

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
  | { type: 'ACTIVATE_BONUS'; payload: { duration: number; multiplier: number } };

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
  ]
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

// Game reducer function
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'CLICK': {
      // Check if bonus is active
      const now = Date.now();
      const bonusActive = state.bonusUntil > now;
      let multiplier = bonusActive ? state.bonusMultiplier : 1;
      
      // Apply prestige multiplier
      multiplier *= state.prestigeMultiplier;
      
      // Check for critical click
      const isCritical = Math.random() < state.criticalChance;
      if (isCritical) {
        multiplier *= state.criticalMultiplier;
      }
      
      const newState = {
        ...state,
        data: state.data + (state.dataPerClick * multiplier),
        totalClicks: state.totalClicks + 1,
        lastTimestamp: now
      };
      
      // Check achievements
      return checkAchievements(newState);
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
      const secondsPassed = action.timePassed / 1000;
      const now = Date.now();
      
      // Reset bonus multiplier if expired
      const bonusMultiplier = state.bonusUntil > now ? state.bonusMultiplier : 1;
      
      const newState = {
        ...state,
        data: state.data + state.dataPerSecond * secondsPassed * state.prestigeMultiplier,
        crypto: state.crypto + state.cryptoPerSecond * secondsPassed * state.prestigeMultiplier,
        bonusMultiplier: bonusMultiplier,
        lastTimestamp: now
      };
      
      return checkAchievements(newState);
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