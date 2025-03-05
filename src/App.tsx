import React, { useState, useEffect, useContext } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { GameProvider, useGame, GameState } from './contexts/GameContext';
import { MissionProvider } from './contexts/MissionContext';
import DigitalRain from './components/DigitalRain';
import Terminal from './components/Terminal';
import ResourceDisplay from './components/ResourceDisplay';
import UpgradePanel from './components/UpgradePanel';
import ServerPanel from './components/ServerPanel';
import NetworkAttackPanel from './components/NetworkAttackPanel';
import { MissionPanel } from './components/MissionPanel';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body, html {
    height: 100%;
    font-family: 'Courier New', monospace;
    background-color: #000;
    color: #0F0;
    overflow-x: hidden;
  }

  #root {
    min-height: 100vh;
    position: relative;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #000;
  }

  ::-webkit-scrollbar-thumb {
    background: #0F0;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #0F9;
  }
`;

const Layout = styled.div`
  display: flex;
  min-height: 100vh;
  position: relative;
  z-index: 1;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-y: auto;
  max-height: 100vh;
`;

const SidePanel = styled.div`
  width: 350px;
  background-color: rgba(0, 10, 0, 0.9);
  border-left: 1px solid #0F0;
  padding: 1rem;
  overflow-y: auto;
  max-height: 100vh;
  box-shadow: -5px 0 15px rgba(0, 255, 0, 0.2);
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  text-transform: uppercase;
  letter-spacing: 3px;
  text-shadow: 0 0 10px #0F0;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  opacity: 0.8;
  margin-bottom: 1rem;
`;

const GameContainer = styled.main`
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Footer = styled.footer`
  margin-top: 3rem;
  text-align: center;
  font-size: 0.8rem;
  opacity: 0.7;
  width: 100%;
`;

const InfoBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  background-color: rgba(0, 10, 0, 0.8);
  border-top: 1px solid #0F0;
  font-size: 0.8rem;
  display: flex;
  justify-content: space-between;
  z-index: 10;
`;

const SidePanelHeader = styled.h2`
  font-size: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 5px #0F0;
  text-align: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #0F0;
  padding-bottom: 0.5rem;
`;

const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 300px;
`;

const Notification = styled.div`
  background-color: rgba(0, 20, 0, 0.9);
  border: 1px solid #0F0;
  border-radius: 5px;
  padding: 10px 15px;
  color: #0F0;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
  animation: ${fadeIn} 0.3s ease-out;
  font-size: 0.9rem;
`;

const HelpTooltip = styled.div`
  position: fixed;
  bottom: 50px;
  left: 20px;
  background-color: rgba(0, 20, 0, 0.9);
  border: 1px solid #0F0;
  border-radius: 5px;
  padding: 10px 15px;
  color: #0F0;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
  font-size: 0.9rem;
  max-width: 300px;
  z-index: 100;
  animation: ${fadeIn} 0.3s ease-out;
`;

const FeatureList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 10px 0;
`;

const FeatureItem = styled.li`
  padding: 4px 0;
  border-bottom: 1px dashed rgba(0, 255, 0, 0.2);
  
  &:last-child {
    border-bottom: none;
  }
`;

const TipText = styled.p`
  font-style: italic;
  font-size: 0.85rem;
  margin-top: 10px;
  opacity: 0.8;
`;

const ToggleButton = styled.button`
  background-color: rgba(0, 30, 0, 0.8);
  border: 1px solid #0F0;
  color: #0F0;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  padding: 0.5rem 1.5rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(0, 50, 0, 0.8);
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

// Game info component that shows tips based on game state
const GameInfo: React.FC = () => {
  const gameContext = useGame();
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [notifiedAchievementIds, setNotifiedAchievementIds] = useState<string[]>([]);

  // Tips array
  const tips = [
    "Press any key or click to collect data",
    "Buy upgrades to increase your production",
    "Complete missions to earn rewards",
    "Manage your servers for optimal resource generation",
    "Watch for network attacks and defend your systems"
  ];

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setShowHelp(prev => !prev);
        setTipIndex(prev => (prev + 1) % tips.length);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <>
      <InfoBar>
        <span>Status: Connected</span>
        <span>
          {gameContext.state.criticalChance > 0.01 && `Crit: ${(gameContext.state.criticalChance * 100).toFixed(1)}% | `}
          {gameContext.state.prestigeLevel > 0 && `Prestige: ${gameContext.state.prestigeLevel} | `}
          Version: 1.1.0
        </span>
      </InfoBar>

      {showHelp && (
        <HelpTooltip>
          <h3>Game Tips</h3>
          <p>{tips[tipIndex]}</p>
          <TipText>Press H to toggle help</TipText>
        </HelpTooltip>
      )}

      <NotificationContainer>
        {notifications.map((text, index) => (
          <Notification key={index}>{text}</Notification>
        ))}
      </NotificationContainer>
    </>
  );
};

function App() {
  return (
    <GameProvider>
      <MissionProvider>
        <GlobalStyle />
        <DigitalRain />
        <Layout>
          <MainContent>
            <Header>
              <Title>Cyber Clicker</Title>
              <Subtitle>Hack the System, Collect the Data</Subtitle>
            </Header>
            <GameContainer>
              <Terminal />
              <ResourceDisplay />
              <NetworkAttackPanel />
            </GameContainer>
            <Footer>
              <p>&copy; 2024 Cyber Clicker - All rights reserved</p>
            </Footer>
          </MainContent>
          <SidePanel>
            <SidePanelHeader>Control Panel</SidePanelHeader>
            <UpgradePanel />
            <ServerPanel />
            <MissionPanel />
          </SidePanel>
        </Layout>
        <GameInfo />
      </MissionProvider>
    </GameProvider>
  );
}

export default App;
