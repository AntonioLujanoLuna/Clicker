import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useGame } from '../contexts/GameContext';

const pulse = keyframes`
  0% { box-shadow: 0 0 5px #F00; }
  50% { box-shadow: 0 0 15px #F00; }
  100% { box-shadow: 0 0 5px #F00; }
`;

const glitch = keyframes`
  0% { transform: translate(0) }
  20% { transform: translate(-2px, 2px) }
  40% { transform: translate(-1px, -1px) }
  60% { transform: translate(1px, 1px) }
  80% { transform: translate(2px, -2px) }
  100% { transform: translate(0) }
`;

const Container = styled.div`
  background-color: rgba(0, 10, 0, 0.85);
  border: 1px solid #0F0;
  box-shadow: 0 0 10px #0F0;
  color: #0F0;
  font-family: 'Courier New', monospace;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Title = styled.h2`
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-align: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 255, 0, 0.3);
  padding-bottom: 0.5rem;
`;

const NoAttacksMessage = styled.div`
  text-align: center;
  padding: 1rem;
  opacity: 0.8;
  font-style: italic;
`;

const AttackGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;
  
  &::-webkit-scrollbar {
    width: 5px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 20, 0, 0.5);
  }
  
  &::-webkit-scrollbar-thumb {
    background: #0F0;
    border-radius: 2px;
  }
`;

interface AttackCardProps {
  severity: string;
}

const getSeverityColor = (severity: string) => {
  switch(severity) {
    case 'low': return '#0F0';
    case 'medium': return '#FF0';
    case 'high': return '#F90';
    case 'critical': return '#F00';
    default: return '#0F0';
  }
};

const AttackCard = styled.div<AttackCardProps>`
  background-color: rgba(20, 0, 0, 0.7);
  border: 1px solid ${props => getSeverityColor(props.severity)};
  border-radius: 5px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  position: relative;
  animation: ${glitch} 0.5s infinite alternate;
  box-shadow: 0 0 10px ${props => getSeverityColor(props.severity)};
`;

const AttackHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const AttackName = styled.h3`
  font-size: 1.1rem;
  margin: 0;
  color: #F00;
`;

const AttackBadge = styled.span<AttackCardProps>`
  background-color: ${props => getSeverityColor(props.severity)};
  color: #000;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  text-transform: uppercase;
  font-weight: bold;
`;

const AttackDescription = styled.p`
  font-size: 0.9rem;
  margin-bottom: 1rem;
  color: #FFF;
`;

const AttackInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  font-size: 0.8rem;
  margin-bottom: 1rem;
`;

const AttackDetail = styled.div`
  display: flex;
  justify-content: space-between;
`;

const DetailLabel = styled.span`
  opacity: 0.8;
`;

const DetailValue = styled.span`
  font-weight: bold;
`;

const TimeRemaining = styled.div`
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  padding: 0.5rem;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 5px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 2px;
  margin-bottom: 1rem;
  overflow: hidden;
`;

interface ProgressFillProps {
  percentage: number;
  severity: string;
}

const ProgressFill = styled.div<ProgressFillProps>`
  height: 100%;
  width: ${props => `${props.percentage}%`};
  background-color: ${props => getSeverityColor(props.severity)};
  border-radius: 2px;
`;

const DefendButton = styled.button<{ isDisabled: boolean }>`
  background-color: ${props => props.isDisabled ? 'rgba(50, 50, 50, 0.5)' : 'rgba(0, 50, 0, 0.7)'};
  border: 1px solid ${props => props.isDisabled ? '#555' : '#0F0'};
  color: ${props => props.isDisabled ? '#888' : '#0F0'};
  font-family: 'Courier New', monospace;
  padding: 0.8rem;
  cursor: ${props => props.isDisabled ? 'not-allowed' : 'pointer'};
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: bold;
  transition: all 0.2s;
  border-radius: 3px;
  
  ${props => !props.isDisabled && css`
    &:hover {
      background-color: rgba(0, 80, 0, 0.7);
    }
    
    &:active {
      transform: scale(0.98);
    }
  `}
`;

const DefenseRequirements = styled.div`
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  padding: 0.5rem;
  margin-top: 1rem;
  font-size: 0.8rem;
`;

const RequirementList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0.5rem 0 0;
`;

interface RequirementProps {
  isMet: boolean;
}

const Requirement = styled.li<RequirementProps>`
  display: flex;
  justify-content: space-between;
  padding: 0.2rem 0;
  color: ${props => props.isMet ? '#0F0' : '#F00'};
`;

const NetworkAttackPanel: React.FC = () => {
  const { state, dispatch } = useGame();
  const { activeAttacks, data, processingPower, hackingSkill, servers } = state;
  
  // Filter to only show unresolved attacks
  const unresolvedAttacks = activeAttacks.filter(attack => !attack.resolved);
  
  if (unresolvedAttacks.length === 0) {
    return null; // Don't render the panel if there are no active attacks
  }
  
  const formatTimeRemaining = (attack: any) => {
    const now = Date.now();
    const endTime = attack.timeStarted + attack.duration;
    const remainingMs = Math.max(0, endTime - now);
    
    const minutes = Math.floor(remainingMs / (60 * 1000));
    const seconds = Math.floor((remainingMs % (60 * 1000)) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const calculateProgress = (attack: any) => {
    const now = Date.now();
    const elapsed = now - attack.timeStarted;
    const percentage = Math.min(100, (elapsed / attack.duration) * 100);
    return percentage;
  };
  
  const canDefend = (attack: any) => {
    return (
      data >= attack.defense.requiredData &&
      processingPower >= attack.defense.requiredProcessingPower &&
      hackingSkill >= attack.defense.requiredHackingSkill
    );
  };
  
  const handleDefend = (attackId: string) => {
    dispatch({ type: 'RESOLVE_ATTACK', payload: { attackId } });
  };
  
  const getServerName = (serverId: string) => {
    const server = servers.find(s => s.id === serverId);
    return server ? server.name : 'Unknown';
  };
  
  return (
    <Container>
      <Title>Network Attacks</Title>
      
      <AttackGrid>
        {unresolvedAttacks.map(attack => (
          <AttackCard key={attack.id} severity={attack.severity}>
            <AttackHeader>
              <AttackName>{attack.name}</AttackName>
              <AttackBadge severity={attack.severity}>{attack.severity}</AttackBadge>
            </AttackHeader>
            
            <AttackDescription>{attack.description}</AttackDescription>
            
            <AttackInfo>
              <AttackDetail>
                <DetailLabel>Target:</DetailLabel>
                <DetailValue>{getServerName(attack.serverId)}</DetailValue>
              </AttackDetail>
              <AttackDetail>
                <DetailLabel>Security Impact:</DetailLabel>
                <DetailValue>+{attack.securityImpact.toFixed(1)}/min</DetailValue>
              </AttackDetail>
              <AttackDetail>
                <DetailLabel>Data Drain:</DetailLabel>
                <DetailValue>{attack.resourceDrain.data.toFixed(2)}/s</DetailValue>
              </AttackDetail>
              <AttackDetail>
                <DetailLabel>Crypto Drain:</DetailLabel>
                <DetailValue>{attack.resourceDrain.crypto.toFixed(2)}/s</DetailValue>
              </AttackDetail>
            </AttackInfo>
            
            <TimeRemaining>
              Time Remaining: {formatTimeRemaining(attack)}
            </TimeRemaining>
            
            <ProgressBar>
              <ProgressFill 
                percentage={calculateProgress(attack)} 
                severity={attack.severity} 
              />
            </ProgressBar>
            
            <DefendButton 
              isDisabled={!canDefend(attack)}
              onClick={() => canDefend(attack) && handleDefend(attack.id)}
            >
              Defend System
            </DefendButton>
            
            <DefenseRequirements>
              <DetailLabel>Defense Requirements:</DetailLabel>
              <RequirementList>
                <Requirement isMet={data >= attack.defense.requiredData}>
                  <span>Data:</span>
                  <span>{Math.floor(data)}/{Math.floor(attack.defense.requiredData)}</span>
                </Requirement>
                <Requirement isMet={processingPower >= attack.defense.requiredProcessingPower}>
                  <span>Processing Power:</span>
                  <span>{processingPower.toFixed(1)}/{attack.defense.requiredProcessingPower.toFixed(1)}</span>
                </Requirement>
                <Requirement isMet={hackingSkill >= attack.defense.requiredHackingSkill}>
                  <span>Hacking Skill:</span>
                  <span>{hackingSkill}/{attack.defense.requiredHackingSkill}</span>
                </Requirement>
              </RequirementList>
            </DefenseRequirements>
          </AttackCard>
        ))}
      </AttackGrid>
    </Container>
  );
};

export default NetworkAttackPanel; 