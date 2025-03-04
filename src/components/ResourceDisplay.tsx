import React, { useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useGame } from '../contexts/GameContext';
import { formatCompactNumber, formatDataSize } from '../utils/formatters';

const pulse = keyframes`
  0% { box-shadow: 0 0 5px #0F0; }
  50% { box-shadow: 0 0 15px #0F0; }
  100% { box-shadow: 0 0 5px #0F0; }
`;

const ResourcePanel = styled.div`
  background-color: rgba(0, 10, 0, 0.85);
  border: 1px solid #0F0;
  box-shadow: 0 0 10px #0F0;
  color: #0F0;
  font-family: 'Courier New', monospace;
  padding: 1rem;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 800px;
  margin: 0 auto;
`;

const ResourceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid rgba(0, 255, 0, 0.2);
  
  &:last-child {
    border-bottom: none;
  }
`;

const ResourceLabel = styled.span`
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.9rem;
`;

const ResourceValue = styled.span`
  font-family: 'Courier New', monospace;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  border: 1px solid rgba(0, 255, 0, 0.3);
  min-width: 100px;
  text-align: right;
`;

const ResourceRate = styled.span`
  font-size: 0.8rem;
  opacity: 0.7;
  margin-left: 0.5rem;
`;

const DataButton = styled.button`
  background: none;
  border: 2px solid #0F0;
  color: #0F0;
  font-family: 'Courier New', monospace;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 5px;
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background-color: rgba(0, 255, 0, 0.1);
    animation: ${pulse} 1.5s infinite;
  }
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 0 20px #0F0;
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(0, 255, 0, 0.2),
      transparent
    );
    transition: all 0.6s;
  }
  
  &:hover:before {
    left: 100%;
  }
`;

const BonusIndicator = styled.div<{ active: boolean }>`
  position: absolute;
  top: -10px;
  right: -10px;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background-color: #FFF;
  color: #000;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  opacity: ${props => props.active ? 1 : 0};
  transition: opacity 0.3s ease;
  box-shadow: 0 0 10px #FFF;
`;

const ButtonWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

interface ResourceDisplayProps {
  onClickTrigger?: () => void;
}

const ResourceDisplay: React.FC<ResourceDisplayProps> = ({ onClickTrigger }) => {
  const { state, dispatch } = useGame();
  
  const handleClick = useCallback(() => {
    dispatch({ type: 'CLICK' });
    if (onClickTrigger) {
      onClickTrigger();
    }
  }, [dispatch, onClickTrigger]);
  
  // Handle keyboard input for clicks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent clicks when typing in input fields
      if (e.target instanceof HTMLInputElement) return;
      
      // Allow spacebar, Enter, and most keys to trigger clicks
      handleClick();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClick]);
  
  // Check if bonus is active
  const isBonusActive = state.bonusUntil > Date.now();
  
  return (
    <>
      <ResourcePanel>
        <ResourceRow>
          <ResourceLabel>Data</ResourceLabel>
          <div>
            <ResourceValue>{formatDataSize(state.data)}</ResourceValue>
            {state.dataPerSecond > 0 && (
              <ResourceRate>+{formatDataSize(state.dataPerSecond)}/s</ResourceRate>
            )}
          </div>
        </ResourceRow>
        
        {state.crypto > 0 || state.cryptoPerSecond > 0 ? (
          <ResourceRow>
            <ResourceLabel>Crypto</ResourceLabel>
            <div>
              <ResourceValue>₿ {formatCompactNumber(state.crypto)}</ResourceValue>
              {state.cryptoPerSecond > 0 && (
                <ResourceRate>+{formatCompactNumber(state.cryptoPerSecond)}/s</ResourceRate>
              )}
            </div>
          </ResourceRow>
        ) : null}
        
        {state.processingPower > 0 ? (
          <ResourceRow>
            <ResourceLabel>Processing Power</ResourceLabel>
            <ResourceValue>{formatCompactNumber(state.processingPower)} GHz</ResourceValue>
          </ResourceRow>
        ) : null}
        
        {state.networkNodes > 0 ? (
          <ResourceRow>
            <ResourceLabel>Network Nodes</ResourceLabel>
            <ResourceValue>{state.networkNodes}</ResourceValue>
          </ResourceRow>
        ) : null}
        
        {state.reputation !== 0 ? (
          <ResourceRow>
            <ResourceLabel>Reputation</ResourceLabel>
            <ResourceValue>{state.reputation > 0 ? '+' : ''}{state.reputation}</ResourceValue>
          </ResourceRow>
        ) : null}
        
        {state.totalClicks > 0 && (
          <ResourceRow>
            <ResourceLabel>Total Clicks</ResourceLabel>
            <ResourceValue>{formatCompactNumber(state.totalClicks)}</ResourceValue>
          </ResourceRow>
        )}
      </ResourcePanel>
      
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <ButtonWrapper>
          <DataButton onClick={handleClick}>
            Collect Data
          </DataButton>
          {isBonusActive && (
            <BonusIndicator active={isBonusActive}>
              {Math.round(state.bonusMultiplier)}x
            </BonusIndicator>
          )}
        </ButtonWrapper>
        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.8 }}>
          Press any key to collect
        </div>
      </div>
    </>
  );
};

export default ResourceDisplay; 