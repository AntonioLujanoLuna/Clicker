import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useGame } from '../contexts/GameContext';

const pulse = keyframes`
  0% { box-shadow: 0 0 5px #0F0; }
  50% { box-shadow: 0 0 10px #0F0; }
  100% { box-shadow: 0 0 5px #0F0; }
`;

const ServerPanelContainer = styled.div`
  background-color: rgba(0, 10, 0, 0.85);
  border: 1px solid #0F0;
  box-shadow: 0 0 10px #0F0;
  color: #0F0;
  font-family: 'Courier New', monospace;
  padding: 1rem;
  border-radius: 5px;
  width: 100%;
  margin-bottom: 1.5rem;
`;

const PanelTitle = styled.h2`
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-align: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 255, 0, 0.3);
  padding-bottom: 0.5rem;
`;

const ServerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

interface ServerCardProps {
  isActive: boolean;
  isUnlocked: boolean;
}

const ServerCard = styled.div<ServerCardProps>`
  background-color: rgba(0, 20, 0, 0.7);
  border: 1px solid ${props => props.isActive ? '#0F0' : props.isUnlocked ? '#0A0' : '#020'};
  border-radius: 5px;
  padding: 0.8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: ${props => props.isUnlocked ? '1' : '0.5'};
  cursor: ${props => props.isUnlocked ? 'pointer' : 'default'};
  transition: all 0.3s ease;
  position: relative;
  
  ${props => props.isActive && css`
    animation: ${pulse} 1.5s infinite;
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
  `}
  
  ${props => props.isUnlocked && !props.isActive && css`
    &:hover {
      background-color: rgba(0, 40, 0, 0.7);
      transform: translateY(-2px);
    }
  `}
`;

const ServerIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const ServerName = styled.div`
  font-size: 0.9rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 0.3rem;
`;

const ServerDifficulty = styled.div`
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
`;

const SecurityBar = styled.div`
  width: 100%;
  height: 5px;
  background-color: rgba(0, 50, 0, 0.5);
  border-radius: 2px;
  margin-top: 0.5rem;
  position: relative;
  overflow: hidden;
`;

interface SecurityFillProps {
  percentage: number;
}

const SecurityFill = styled.div<SecurityFillProps>`
  height: 100%;
  width: ${props => `${props.percentage}%`};
  background-color: ${props => {
    if (props.percentage < 30) return '#0F0';
    if (props.percentage < 70) return '#FF0';
    return '#F00';
  }};
  border-radius: 2px;
  transition: width 0.3s ease, background-color 0.3s ease;
`;

const ServerDescription = styled.div`
  font-size: 0.8rem;
  opacity: 0.8;
  text-align: center;
  margin-top: 0.5rem;
`;

const ServerDetails = styled.div`
  background-color: rgba(0, 20, 0, 0.7);
  border: 1px solid #0F0;
  border-radius: 5px;
  padding: 1rem;
  margin-top: 1rem;
`;

const DetailTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid rgba(0, 255, 0, 0.3);
  padding-bottom: 0.3rem;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
`;

const DetailItem = styled.div`
  font-size: 0.85rem;
  display: flex;
  justify-content: space-between;
  padding: 0.3rem 0;
  border-bottom: 1px dashed rgba(0, 255, 0, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  opacity: 0.8;
`;

const DetailValue = styled.span`
  font-weight: bold;
`;

const ServerPanel: React.FC = () => {
  const { state, dispatch } = useGame();
  const { servers, currentServerId } = state;
  
  const currentServer = servers.find(server => server.id === currentServerId) || servers[0];
  
  const handleServerClick = (serverId: string) => {
    const server = servers.find(s => s.id === serverId);
    if (server && server.isUnlocked) {
      dispatch({ type: 'SWITCH_SERVER', payload: { serverId } });
    }
  };
  
  const renderDifficultyStars = (difficulty: number) => {
    const maxStars = 5;
    const filledStars = Math.min(difficulty, maxStars);
    
    return (
      <>
        {'★'.repeat(filledStars)}
        {'☆'.repeat(Math.max(0, maxStars - filledStars))}
      </>
    );
  };
  
  return (
    <ServerPanelContainer>
      <PanelTitle>Network Servers</PanelTitle>
      
      <ServerGrid>
        {servers.map(server => (
          <ServerCard 
            key={server.id}
            isActive={server.id === currentServerId}
            isUnlocked={server.isUnlocked}
            onClick={() => handleServerClick(server.id)}
          >
            <ServerIcon>{server.icon}</ServerIcon>
            <ServerName>{server.name}</ServerName>
            <ServerDifficulty>
              {renderDifficultyStars(server.difficulty)}
            </ServerDifficulty>
            
            {server.isUnlocked && (
              <SecurityBar>
                <SecurityFill 
                  percentage={(server.securityLevel / server.maxSecurityLevel) * 100} 
                />
              </SecurityBar>
            )}
          </ServerCard>
        ))}
      </ServerGrid>
      
      <ServerDetails>
        <DetailTitle>{currentServer.name}</DetailTitle>
        <ServerDescription>{currentServer.description}</ServerDescription>
        
        <DetailGrid>
          <DetailItem>
            <DetailLabel>Security Level:</DetailLabel>
            <DetailValue>{Math.floor(currentServer.securityLevel)}/{currentServer.maxSecurityLevel}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>Data Multiplier:</DetailLabel>
            <DetailValue>x{currentServer.resourceMultipliers.data.toFixed(1)}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>Crypto Multiplier:</DetailLabel>
            <DetailValue>x{currentServer.resourceMultipliers.crypto.toFixed(1)}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>Processing Multiplier:</DetailLabel>
            <DetailValue>x{currentServer.resourceMultipliers.processingPower.toFixed(1)}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>Efficiency:</DetailLabel>
            <DetailValue>
              {Math.round(Math.max(0.5, 1 - (currentServer.securityLevel / currentServer.maxSecurityLevel) * 0.5) * 100)}%
            </DetailValue>
          </DetailItem>
        </DetailGrid>
      </ServerDetails>
    </ServerPanelContainer>
  );
};

export default ServerPanel; 