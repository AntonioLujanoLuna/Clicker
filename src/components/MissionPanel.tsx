import React from 'react';
import styled from 'styled-components';
import { useMission } from '../contexts/MissionContext';
import { useGame } from '../contexts/GameContext';

const PanelContainer = styled.div`
  background-color: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 4px;
  padding: 1rem;
  margin: 1rem 0;
  color: #00ff00;
  font-family: 'Courier New', monospace;
`;

const MissionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MissionCard = styled.div<{ isActive?: boolean }>`
  background-color: ${props => props.isActive ? '#1a1a1a' : '#0f0f0f'};
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #00ff00;
  }
`;

const MissionTitle = styled.h3`
  color: #00ff00;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
`;

const MissionDescription = styled.p`
  color: #00cc00;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
`;

const MissionDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #008800;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: #1a1a1a;
  border-radius: 2px;
  margin-top: 0.5rem;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number }>`
  width: ${props => props.progress}%;
  height: 100%;
  background-color: #00ff00;
  transition: width 0.3s ease;
`;

const ObjectiveList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
`;

const Objective = styled.li<{ completed: boolean }>`
  color: ${props => props.completed ? '#00ff00' : '#008800'};
  margin: 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: ${props => props.completed ? '"✓"' : '"○"'};
  }
`;

const RequirementText = styled.span<{ isMet: boolean }>`
  color: ${props => props.isMet ? '#00ff00' : '#ff0000'};
  font-size: 0.8rem;
`;

export function MissionPanel() {
  const { state: missionState, startMission } = useMission();
  const { state: gameState } = useGame();

  const handleStartMission = (missionId: string) => {
    startMission(missionId);
  };

  const checkRequirements = (mission: any) => {
    return {
      playerLevel: gameState.prestigeLevel >= mission.requirements.playerLevel,
      hackingSkill: gameState.hackingSkill >= mission.requirements.hackingSkill,
    };
  };

  return (
    <PanelContainer>
      <h2>Missions</h2>
      <MissionList>
        {missionState.missions.map(mission => {
          const requirements = checkRequirements(mission);
          const progress = missionState.missionProgress[mission.id] || 0;
          const isActive = missionState.activeMission?.id === mission.id;

          return (
            <MissionCard
              key={mission.id}
              isActive={isActive}
              onClick={() => handleStartMission(mission.id)}
            >
              <MissionTitle>{mission.title}</MissionTitle>
              <MissionDescription>{mission.description}</MissionDescription>
              
              <MissionDetails>
                <div>
                  <RequirementText isMet={requirements.playerLevel}>
                    Level {mission.requirements.playerLevel}
                  </RequirementText>
                  {' | '}
                  <RequirementText isMet={requirements.hackingSkill}>
                    Hacking {mission.requirements.hackingSkill}
                  </RequirementText>
                </div>
                <div>
                  Rewards: {mission.rewards.data} data | {mission.rewards.experience} XP
                </div>
              </MissionDetails>

              {isActive && (
                <ObjectiveList>
                  {mission.objectives.map(objective => (
                    <Objective key={objective.id} completed={objective.completed || false}>
                      {objective.description} ({objective.progress || 0}/{objective.target})
                    </Objective>
                  ))}
                </ObjectiveList>
              )}

              <ProgressBar>
                <ProgressFill progress={progress} />
              </ProgressBar>
            </MissionCard>
          );
        })}
      </MissionList>
    </PanelContainer>
  );
} 