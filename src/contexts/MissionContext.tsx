import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Mission, initialMissions } from '../data/missions';
import { useGame } from './GameContext';

interface MissionState {
  missions: Mission[];
  activeMission: Mission | null;
  completedMissions: string[];
  missionProgress: { [key: string]: number };
}

type MissionAction =
  | { type: 'START_MISSION'; payload: string }
  | { type: 'UPDATE_PROGRESS'; payload: { missionId: string; objectiveId: string; progress: number } }
  | { type: 'COMPLETE_MISSION'; payload: string }
  | { type: 'FAIL_MISSION'; payload: string }
  | { type: 'CLAIM_REWARDS'; payload: string };

const initialState: MissionState = {
  missions: initialMissions,
  activeMission: null,
  completedMissions: [],
  missionProgress: {},
};

const MissionContext = createContext<{
  state: MissionState;
  startMission: (missionId: string) => void;
  updateProgress: (missionId: string, objectiveId: string, progress: number) => void;
  completeMission: (missionId: string) => void;
  failMission: (missionId: string) => void;
  claimRewards: (missionId: string) => void;
} | null>(null);

function missionReducer(state: MissionState, action: MissionAction): MissionState {
  switch (action.type) {
    case 'START_MISSION':
      const mission = state.missions.find(m => m.id === action.payload);
      if (!mission) return state;
      return {
        ...state,
        activeMission: mission,
        missionProgress: {
          ...state.missionProgress,
          [action.payload]: 0,
        },
      };

    case 'UPDATE_PROGRESS':
      if (!state.activeMission) return state;
      const objective = state.activeMission.objectives.find(
        obj => obj.id === action.payload.objectiveId
      );
      if (!objective) return state;

      const updatedMission = {
        ...state.activeMission,
        objectives: state.activeMission.objectives.map(obj =>
          obj.id === action.payload.objectiveId
            ? { ...obj, progress: action.payload.progress, completed: action.payload.progress >= obj.target }
            : obj
        ),
      };

      return {
        ...state,
        activeMission: updatedMission,
        missionProgress: {
          ...state.missionProgress,
          [action.payload.missionId]: Math.min(
            100,
            (updatedMission.objectives.filter(obj => obj.completed).length /
              updatedMission.objectives.length) *
              100
          ),
        },
      };

    case 'COMPLETE_MISSION':
      return {
        ...state,
        activeMission: null,
        completedMissions: [...state.completedMissions, action.payload],
      };

    case 'FAIL_MISSION':
      return {
        ...state,
        activeMission: null,
      };

    case 'CLAIM_REWARDS':
      return state;

    default:
      return state;
  }
}

export function MissionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(missionReducer, initialState);
  const { state: gameState, dispatch: gameDispatch } = useGame();

  const startMission = (missionId: string) => {
    const mission = state.missions.find(m => m.id === missionId);
    if (!mission) return;

    // Check requirements
    if (
      gameState.prestigeLevel < mission.requirements.playerLevel ||
      gameState.hackingSkill < mission.requirements.hackingSkill
    ) {
      console.log('Requirements not met');
      return;
    }

    dispatch({ type: 'START_MISSION', payload: missionId });
  };

  const updateProgress = (missionId: string, objectiveId: string, progress: number) => {
    dispatch({
      type: 'UPDATE_PROGRESS',
      payload: { missionId, objectiveId, progress },
    });
  };

  const completeMission = (missionId: string) => {
    const mission = state.missions.find(m => m.id === missionId);
    if (!mission) return;

    // Award mission rewards through game dispatch
    gameDispatch({ 
      type: 'CLAIM_MISSION_REWARDS',
      missionId: missionId 
    });

    dispatch({ type: 'COMPLETE_MISSION', payload: missionId });
  };

  const failMission = (missionId: string) => {
    dispatch({ type: 'FAIL_MISSION', payload: missionId });
  };

  const claimRewards = (missionId: string) => {
    dispatch({ type: 'CLAIM_REWARDS', payload: missionId });
  };

  // Check mission completion
  useEffect(() => {
    if (state.activeMission) {
      const allObjectivesComplete = state.activeMission.objectives.every(
        obj => obj.completed
      );
      if (allObjectivesComplete) {
        completeMission(state.activeMission.id);
      }
    }
  }, [state.activeMission]);

  return (
    <MissionContext.Provider
      value={{
        state,
        startMission,
        updateProgress,
        completeMission,
        failMission,
        claimRewards,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
}

export function useMission() {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMission must be used within a MissionProvider');
  }
  return context;
} 