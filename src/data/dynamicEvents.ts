import { GameState } from '../contexts/GameContext';

export interface DynamicEvent {
  id: string;
  name: string;
  description: string;
  reward?: {
    type: 'data' | 'crypto' | 'processing_power' | 'hacking_skill';
    amount: number;
    description: string;
  };
  resolved: boolean;
}

export const initialDynamicEvents: DynamicEvent[] = []; 