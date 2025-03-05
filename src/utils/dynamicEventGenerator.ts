import { DynamicEvent } from '../data/dynamicEvents';
import { GameState } from '../contexts/GameContext';

// Define the types for our dynamic events if needed
// We already have DynamicEvent in ../data/dynamicEvents

export function generateDynamicEvent(state: GameState): DynamicEvent {
  // Randomly choose an event type
  const rand = Math.random();
  if (rand < 0.5) {
    // Insider Info Event: provides bonus resource generation if resolved
    return {
      id: `insider-${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: 'Insider Info',
      description: 'An insider leaks confidential data. Resolve this event to gain a temporary boost in resource generation.',
      reward: { type: 'data', amount: Math.floor(state.dataPerSecond * 500), description: 'Insider Bonus Data' } as { type: 'data' | 'crypto' | 'processing_power' | 'hacking_skill'; amount: number; description: string },
      resolved: false
    };
  } else {
    // Security Breach Event: poses a threat that if resolved grants extra hacking skill or bonus rewards
    return {
      id: `security-${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: 'Security Breach',
      description: 'A security breach is detected in your system. Quickly resolve the threat to prevent major losses and gain a hacking skill boost.',
      reward: { type: 'hacking_skill', amount: 1, description: 'Hacking Skill Boost from Security Breach' } as { type: 'data' | 'crypto' | 'processing_power' | 'hacking_skill'; amount: number; description: string },
      resolved: false
    };
  }
} 