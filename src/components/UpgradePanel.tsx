import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useGame } from '../contexts/GameContext';
import { formatDataSize, formatCompactNumber } from '../utils/formatters';

const glow = keyframes`
  0% { box-shadow: 0 0 5px #0F0; }
  50% { box-shadow: 0 0 10px #0F0; }
  100% { box-shadow: 0 0 5px #0F0; }
`;

const UpgradeContainer = styled.div`
  background-color: transparent;
  color: #0F0;
  font-family: 'Courier New', monospace;
  width: 100%;
`;

const UpgradeGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

interface UpgradeCardProps {
  isAffordable: boolean;
  isMaxed: boolean;
}

const UpgradeCard = styled.div<UpgradeCardProps>`
  background-color: rgba(0, 20, 0, 0.7);
  border: 1px solid ${props => props.isAffordable ? '#0F0' : '#090'};
  border-radius: 5px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  opacity: ${props => props.isMaxed ? '0.6' : props.isAffordable ? '1' : '0.8'};
  position: relative;
  overflow: hidden;
  
  ${props => props.isAffordable && !props.isMaxed && css`
    cursor: pointer;
    
    &:hover {
      background-color: rgba(0, 40, 0, 0.7);
      animation: ${glow} 1.5s infinite;
      transform: translateY(-2px);
    }
    
    &:active {
      transform: translateY(0);
    }
  `}
  
  ${props => props.isMaxed && css`
    &:after {
      content: 'MAXED';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 2rem;
      font-weight: bold;
      color: rgba(0, 255, 0, 0.3);
      border: 3px solid rgba(0, 255, 0, 0.3);
      padding: 0.5rem 1rem;
      border-radius: 5px;
      pointer-events: none;
    }
  `}
`;

const UpgradeName = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  letter-spacing: 1px;
`;

const UpgradeDescription = styled.p`
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  opacity: 0.9;
  flex-grow: 1;
`;

const UpgradeEffect = styled.div`
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: #0F9;
`;

const UpgradeCost = styled.div<{ isAffordable: boolean }>`
  font-size: 0.9rem;
  text-align: right;
  color: ${props => props.isAffordable ? '#0F0' : '#F00'};
  margin-top: 0.5rem;
`;

const UpgradeMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px dashed rgba(0, 255, 0, 0.3);
`;

const UpgradeLevel = styled.div`
  background-color: rgba(0, 0, 0, 0.3);
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  border: 1px solid rgba(0, 255, 0, 0.2);
  font-size: 0.8rem;
`;

const NoUpgrades = styled.div`
  text-align: center;
  padding: 2rem;
  opacity: 0.7;
`;

const UpgradePanel: React.FC = () => {
  const { state, dispatch } = useGame();
  
  const handleBuyUpgrade = (upgradeId: string) => {
    dispatch({ type: 'BUY_UPGRADE', payload: { upgradeId } });
  };
  
  // Filter upgrades based on visibility conditions
  const visibleUpgrades = state.upgrades.filter(upgrade => {
    // Show all purchased upgrades
    if (upgrade.level > 0) return true;
    
    // Show all unlocked upgrades
    if (upgrade.isUnlocked) return true;
    
    // For upgrades with data requirements, show if we have enough data
    if (upgrade.visibleAtData && state.data >= upgrade.visibleAtData) return true;
    
    // For upgrades with crypto requirements, show if we have enough crypto
    if (upgrade.visibleAtCrypto && state.crypto >= upgrade.visibleAtCrypto) return true;
    
    // For upgrades with processing power requirements, show if we have enough
    if (upgrade.visibleAtProcessingPower && state.processingPower >= upgrade.visibleAtProcessingPower) return true;
    
    // Don't show the upgrade if no conditions are met
    return false;
  });
  
  if (visibleUpgrades.length === 0) {
    return (
      <UpgradeContainer>
        <NoUpgrades>Collect more data to unlock upgrades</NoUpgrades>
      </UpgradeContainer>
    );
  }
  
  return (
    <UpgradeContainer>
      <UpgradeGrid>
        {visibleUpgrades.map(upgrade => {
          const nextCost = upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level);
          const isAffordable = state.data >= nextCost;
          const isMaxed = upgrade.maxLevel > 0 && upgrade.level >= upgrade.maxLevel;
          
          return (
            <UpgradeCard 
              key={upgrade.id}
              isAffordable={isAffordable}
              isMaxed={isMaxed}
              onClick={() => !isMaxed && isAffordable && handleBuyUpgrade(upgrade.id)}
            >
              <UpgradeName>{upgrade.name}</UpgradeName>
              <UpgradeDescription>{upgrade.description}</UpgradeDescription>
              
              <UpgradeEffect>
                {upgrade.effect === 'dataPerClick' && `+${formatCompactNumber(upgrade.effectValue * (upgrade.level + 1))} data per click`}
                {upgrade.effect === 'dataPerSecond' && `+${formatCompactNumber(upgrade.effectValue * (upgrade.level + 1))} data per second`}
                {upgrade.effect === 'cryptoPerSecond' && `+${formatCompactNumber(upgrade.effectValue * (upgrade.level + 1))} crypto per second`}
                {upgrade.effect === 'processingMultiplier' && `${formatCompactNumber(upgrade.effectValue * 100 * (upgrade.level + 1))}% processing efficiency`}
              </UpgradeEffect>
              
              <UpgradeMeta>
                <UpgradeLevel>
                  {isMaxed 
                    ? 'MAX LEVEL' 
                    : `Level ${upgrade.level}${upgrade.maxLevel > 0 ? `/${upgrade.maxLevel}` : ''}`}
                </UpgradeLevel>
                {!isMaxed && (
                  <UpgradeCost isAffordable={isAffordable}>
                    {formatDataSize(nextCost)}
                  </UpgradeCost>
                )}
              </UpgradeMeta>
            </UpgradeCard>
          );
        })}
      </UpgradeGrid>
    </UpgradeContainer>
  );
};

export default UpgradePanel; 