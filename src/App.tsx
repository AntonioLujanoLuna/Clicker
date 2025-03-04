import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { GameProvider, useGame } from './contexts/GameContext';
import DigitalRain from './components/DigitalRain';
import Terminal from './components/Terminal';
import ResourceDisplay from './components/ResourceDisplay';
import UpgradePanel from './components/UpgradePanel';

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

// Game info component that shows tips based on game state
const GameInfo: React.FC = () => {
  const { state } = useGame();
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  
  // Define tips outside of any effects to avoid dependency issues
  const tips = [
    "Use your keyboard to collect data faster - any key works!",
    "Type 'help' in the terminal to see available commands",
    "Critical hits give you bonus data - upgrade your critical chance!",
    "Watch for white characters in the digital rain - they give big bonuses!",
    "Use the 'hack' command in the terminal to attempt system intrusions",
    "Unlocking achievements provides permanent bonuses",
    "Type 'achievements' in the terminal to see your progress",
    "Prestige resets your progress but gives permanent multipliers",
    "Higher processing power makes all operations more efficient",
    "Use the 'mine' command in the terminal to mine crypto instantly"
  ];
  
  // Achievement notifications
  useEffect(() => {
    const unlockedAchievements = state.achievements.filter(a => a.unlocked);
    
    if (unlockedAchievements.length > 0) {
      // Check for newly unlocked achievements
      const newNotifications: string[] = [];
      
      for (const achievement of unlockedAchievements) {
        // Simple approach - just show notifications for all unlocked achievements
        // In a production app, you'd want to track which ones were already shown
        newNotifications.push(`Achievement unlocked: ${achievement.name}`);
      }
      
      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev].slice(0, 5));
        
        // Auto-remove notifications after a few seconds
        setTimeout(() => {
          setNotifications(prev => prev.slice(0, prev.length - newNotifications.length));
        }, 5000);
      }
    }
  }, [state.achievements]);
  
  // Show help after a delay for new players
  useEffect(() => {
    if (state.totalClicks < 10) {
      const timer = setTimeout(() => {
        setShowHelp(true);
      }, 10000);
      
      return () => clearTimeout(timer);
    } else {
      setShowHelp(false);
    }
  }, [state.totalClicks]);
  
  // Rotate through tips
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex(prev => (prev + 1) % tips.length);
    }, 15000);
    
    return () => clearInterval(timer);
  }, [tips.length]);
  
  return (
    <>
      <NotificationContainer>
        {notifications.map((text, index) => (
          <Notification key={index}>{text}</Notification>
        ))}
      </NotificationContainer>
      
      {showHelp && (
        <HelpTooltip>
          <strong>Welcome to Digital Matrix!</strong>
          <FeatureList>
            <FeatureItem>Click or press any key to collect data</FeatureItem>
            <FeatureItem>Buy upgrades to increase your production</FeatureItem>
            <FeatureItem>Use terminal commands to access special features</FeatureItem>
            <FeatureItem>Watch for special characters in the falling matrix</FeatureItem>
            <FeatureItem>Unlock achievements for permanent bonuses</FeatureItem>
          </FeatureList>
          <TipText>{tips[tipIndex]}</TipText>
        </HelpTooltip>
      )}
      
      <InfoBar>
        <span>Status: Connected</span>
        <span>
          {state.criticalChance > 0.01 && `Crit: ${(state.criticalChance * 100).toFixed(1)}% | `}
          {state.prestigeLevel > 0 && `Prestige: ${state.prestigeLevel} | `}
          Version: 1.1.0
        </span>
      </InfoBar>
    </>
  );
};

const AppContent: React.FC = () => {
  const [clickEffect, setClickEffect] = useState(false);
  const { state } = useGame();

  const handleClick = () => {
    setClickEffect(true);
    // Reset after animation completes
    setTimeout(() => {
      setClickEffect(false);
    }, 1000);
  };

  return (
    <>
      <GlobalStyle />
      <DigitalRain intensity={clickEffect ? 2 : 1} />
      
      <Layout>
        <MainContent>
          <Header>
            <Title>Digital Matrix</Title>
            <Subtitle>Hack the system, decode reality</Subtitle>
            
            <Terminal 
              title="TERMINAL"
              lines={[
                "Initialize system connection...",
                "Bypassing security protocols...",
                "Access granted.",
                "Welcome to the Matrix. Begin data extraction.",
                "Type 'help' for available commands."
              ]}
            />
          </Header>
          
          <GameContainer>
            <ResourceDisplay onClickTrigger={handleClick} />
          </GameContainer>
          
          <Footer>
            &copy; {new Date().getFullYear()} Digital Matrix - A Matrix-inspired Hacking Clicker Game
            {state.prestigeLevel > 0 && (
              <div style={{ marginTop: '5px' }}>
                Prestige Level: {state.prestigeLevel} | Multiplier: {state.prestigeMultiplier.toFixed(2)}x
              </div>
            )}
          </Footer>
        </MainContent>
        
        <SidePanel>
          <SidePanelHeader>Upgrades</SidePanelHeader>
          <UpgradePanel />
        </SidePanel>
      </Layout>
      
      <GameInfo />
    </>
  );
};

const App: React.FC = () => {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

export default App;
