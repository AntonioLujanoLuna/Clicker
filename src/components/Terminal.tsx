import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useGame } from '../contexts/GameContext';
import { formatDataSize, formatCompactNumber } from '../utils/formatters';

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const glitch = keyframes`
  0% { transform: translate(0) }
  20% { transform: translate(-3px, 3px) }
  40% { transform: translate(-3px, -3px) }
  60% { transform: translate(3px, 3px) }
  80% { transform: translate(3px, -3px) }
  100% { transform: translate(0) }
`;

const TerminalWrapper = styled.div`
  background-color: rgba(0, 10, 0, 0.85);
  border: 1px solid #0F0;
  box-shadow: 0 0 10px #0F0, inset 0 0 10px #0F0;
  color: #0F0;
  font-family: 'Courier New', monospace;
  padding: 1rem;
  border-radius: 5px;
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: repeating-linear-gradient(
      90deg,
      rgba(0, 255, 0, 0),
      rgba(0, 255, 0, 0.5) 50%,
      rgba(0, 255, 0, 0) 100%
    );
    background-size: 200% 100%;
    animation: ${glitch} 1s infinite linear;
  }
`;

const TerminalHeader = styled.div`
  border-bottom: 1px solid #0F0;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TerminalTitle = styled.span`
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const TerminalControls = styled.div`
  display: flex;
  gap: 5px;
`;

const TerminalButton = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #0F0;
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
  }
`;

const TerminalContent = styled.div`
  height: 250px;
  overflow-y: auto;
  margin-bottom: 10px;
  padding-right: 5px;
  
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

const TerminalLine = styled.div`
  line-height: 1.5;
  margin-bottom: 0.3rem;
  text-shadow: 0 0 5px #0F0;
`;

const TerminalCursor = styled.span`
  content: '▋';
  margin-left: 2px;
  animation: ${blink} 1s infinite;
`;

const TerminalPrompt = styled.span`
  color: #0F0;
  font-weight: bold;
  margin-right: 0.5rem;
`;

const TerminalInput = styled.input`
  background: transparent;
  border: none;
  color: #0F0;
  font-family: 'Courier New', monospace;
  outline: none;
  width: calc(100% - 30px);

  &:focus {
    outline: none;
  }
`;

const TerminalForm = styled.form`
  display: flex;
  align-items: center;
  border-top: 1px dashed rgba(0, 255, 0, 0.3);
  padding-top: 10px;
`;

interface TerminalProps {
  title?: string;
  lines?: string[];
  typingSpeed?: number;
  prompt?: string;
  children?: React.ReactNode;
}

const Terminal: React.FC<TerminalProps> = ({
  title = 'TERMINAL',
  lines = [],
  typingSpeed = 30,
  prompt = '> ',
  children
}) => {
  const { state, dispatch } = useGame();
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Initial lines + game status lines
  const allLines = [
    ...lines,
    ...(state.dataPerSecond > 0 ? [`Auto-data collection running at ${formatDataSize(state.dataPerSecond)}/s`] : []),
    ...(state.cryptoPerSecond > 0 ? [`Crypto mining operational at ₿${formatCompactNumber(state.cryptoPerSecond)}/s`] : []),
    ...(state.processingPower > 0 ? [`System processing power: ${formatCompactNumber(state.processingPower)} GHz`] : [])
  ];
  
  // Typing effect
  useEffect(() => {
    if (currentLine < allLines.length) {
      if (currentChar < allLines[currentLine].length) {
        const timer = setTimeout(() => {
          setCurrentChar(currentChar + 1);
        }, typingSpeed);
        
        return () => clearTimeout(timer);
      } else {
        // Line complete, move to next line
        setDisplayedLines([...displayedLines, allLines[currentLine]]);
        setCurrentLine(currentLine + 1);
        setCurrentChar(0);
      }
    }
  }, [currentLine, currentChar, allLines, displayedLines, typingSpeed]);
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [displayedLines]);
  
  // Add dynamic terminal logs based on game events
  useEffect(() => {
    const interval = setInterval(() => {
      // Occasionally add a "hacking" message
      if (Math.random() < 0.2 && state.data > 50) {
        const messages = [
          "Scanning network for vulnerabilities...",
          "Access point detected...",
          "Bypassing firewall...",
          "Remote connection established...",
          "Encrypting communication channel...",
          "Deploying counter-measures against detection...",
          `Extracted ${Math.floor(Math.random() * 100)}kb of encrypted data...`,
          "Compiling system information...",
          "Analyzing security protocols...",
          "Injection vector identified..."
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        setDisplayedLines(prev => [...prev, randomMessage]);
      }
    }, 10000); // every 10 seconds
    
    return () => clearInterval(interval);
  }, [state.data]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (command.trim()) {
      // Add command to history
      setCommandHistory(prev => [command, ...prev.slice(0, 19)]); // Keep last 20 commands
      setHistoryIndex(-1);
      
      // Process command
      processCommand(command);
      
      // Clear input
      setCommand("");
    }
  };
  
  const processCommand = (cmd: string) => {
    const normalizedCmd = cmd.trim().toLowerCase();
    const cmdParts = normalizedCmd.split(' ');
    const mainCommand = cmdParts[0];
    const args = cmdParts.slice(1);
    
    // Display the command
    setDisplayedLines(prev => [...prev, `${prompt}${cmd}`]);
    
    // Process command
    switch(mainCommand) {
      case 'help':
        displayHelp(args[0]);
        break;
      case 'status':
        displayStatus();
        break;
      case 'clear':
        setDisplayedLines([]);
        break;
      case 'upgrades':
        displayUpgrades();
        break;
      case 'resources':
        displayResources();
        break;
      case 'buy':
        buyUpgrade(args[0]);
        break;
      case 'hack':
        executeHack(args[0]);
        break;
      case 'bonus':
        activateBonus();
        break;
      case 'mine':
        mineCrypto();
        break;
      case 'system':
        displaySystemInfo();
        break;
      case 'stats':
        displayPlayerStats();
        break;
      case 'achievements':
        displayAchievements();
        break;
      case 'claim':
        claimAchievement(args[0]);
        break;
      case 'prestige':
        confirmPrestige();
        break;
      case 'critical':
        displayCriticalStats();
        break;
      case 'server':
      case 'servers':
        if (args.length === 0) {
          return {
            type: 'info',
            message: [
              'Server Management Commands:',
              '-------------------------',
              'servers list - Show available servers',
              'servers status - Show current server status',
              'servers connect [server_id] - Connect to server',
              'servers scan - Scan for new servers',
              'servers secure - Reduce security level of current server'
            ]
          };
        }
        
        switch (args[0]) {
          case 'list':
            const serversList = state.servers
              .filter(server => server.isUnlocked)
              .map(server => `${server.id === state.currentServerId ? '>' : ' '} ${server.name} (${server.icon}) - Security: ${Math.floor(server.securityLevel)}/${server.maxSecurityLevel}`);
            
            const hiddenServers = state.servers.filter(server => !server.isUnlocked).length;
            
            return {
              type: 'info',
              message: [
                'Available Servers:',
                '----------------',
                ...serversList,
                hiddenServers > 0 ? `\n${hiddenServers} undiscovered servers remaining` : '\nAll servers discovered'
              ]
            };
            
          case 'status':
            const currentServer = state.servers.find(server => server.id === state.currentServerId);
            if (!currentServer) return { type: 'error', message: ['Server not found'] };
            
            const efficiency = Math.round(Math.max(0.5, 1 - (currentServer.securityLevel / currentServer.maxSecurityLevel) * 0.5) * 100);
            
            return {
              type: 'info',
              message: [
                `Current Server: ${currentServer.name} (${currentServer.icon})`,
                `Description: ${currentServer.description}`,
                `Security Level: ${Math.floor(currentServer.securityLevel)}/${currentServer.maxSecurityLevel}`,
                `Efficiency: ${efficiency}%`,
                `Resource Multipliers:`,
                ` - Data: x${currentServer.resourceMultipliers.data.toFixed(1)}`,
                ` - Crypto: x${currentServer.resourceMultipliers.crypto.toFixed(1)}`,
                ` - Processing: x${currentServer.resourceMultipliers.processingPower.toFixed(1)}`
              ]
            };
            
          case 'connect':
            if (args.length < 2) {
              return { type: 'error', message: ['Please specify a server ID'] };
            }
            
            const targetServer = state.servers.find(server => server.id === args[1]);
            
            if (!targetServer) {
              return { type: 'error', message: [`Server '${args[1]}' not found`] };
            }
            
            if (!targetServer.isUnlocked) {
              return { type: 'error', message: [`Server '${targetServer.name}' not accessible. Discover it first.`] };
            }
            
            if (targetServer.id === state.currentServerId) {
              return { type: 'info', message: [`Already connected to ${targetServer.name}`] };
            }
            
            dispatch({ type: 'SWITCH_SERVER', payload: { serverId: targetServer.id } });
            
            return {
              type: 'success',
              message: [
                `Connected to ${targetServer.name}`,
                `Security Level: ${Math.floor(targetServer.securityLevel)}/${targetServer.maxSecurityLevel}`,
                `Resource multipliers activated: Data x${targetServer.resourceMultipliers.data.toFixed(1)}, Crypto x${targetServer.resourceMultipliers.crypto.toFixed(1)}`
              ]
            };
            
          case 'scan':
            // Check if scan is on cooldown
            if (Date.now() < state.lastHackTime + state.hackCooldown) {
              const remainingCooldown = Math.ceil((state.lastHackTime + state.hackCooldown - Date.now()) / 1000);
              return { type: 'error', message: [`Scanner cooling down. Try again in ${remainingCooldown} seconds.`] };
            }
            
            // Find potential servers that meet requirements but aren't discovered yet
            const discoverableServers = state.servers.filter(server => 
              !server.isUnlocked && 
              (!server.unlocksAt.hackingSkill || state.hackingSkill >= server.unlocksAt.hackingSkill) &&
              (!server.unlocksAt.data || state.data >= server.unlocksAt.data) &&
              (!server.unlocksAt.crypto || state.crypto >= server.unlocksAt.crypto)
            );
            
            if (discoverableServers.length === 0) {
              return { type: 'info', message: ['No new servers detected with current capabilities.'] };
            }
            
            // Calculate discovery chance based on hacking skill and server discovery chance
            const scanPower = state.hackingSkill + 5; // Base scan power
            const discoveryChances = discoverableServers.map(server => ({
              server,
              chance: Math.min(server.discoveryChance * (1 + scanPower / 20), 80) // Cap at 80%
            }));
            
            // Try to discover a server
            let discovered = false;
            let discoveredServer = null;
            
            for (const { server, chance } of discoveryChances) {
              if (Math.random() * 100 < chance) {
                discovered = true;
                discoveredServer = server;
                dispatch({ type: 'DISCOVER_SERVER', payload: { serverId: server.id } });
                break;
              }
            }
            
            // Update hack cooldown
            dispatch({ 
              type: 'MANUAL_HACK', 
              payload: { target: 'scan' } 
            });
            
            if (discovered && discoveredServer) {
              return {
                type: 'success',
                message: [
                  `New server discovered: ${discoveredServer.name} (${discoveredServer.icon})`,
                  `Description: ${discoveredServer.description}`,
                  `Use 'servers connect ${discoveredServer.id}' to connect.`
                ]
              };
            } else {
              return {
                type: 'info',
                message: [
                  'Scan completed. No new servers found.',
                  `Detected ${discoverableServers.length} potential servers.`,
                  'Try increasing your hacking skill or resources.'
                ]
              };
            }
            
          case 'secure':
            const server = state.servers.find(s => s.id === state.currentServerId);
            
            if (!server) {
              return { type: 'error', message: ['Current server not found'] };
            }
            
            if (server.securityLevel <= 0) {
              return { type: 'info', message: [`${server.name} is already fully secured.`] };
            }
            
            // Cost is based on server difficulty and current security level
            const dataCost = 100 * server.difficulty * Math.ceil(server.securityLevel);
            const processingCost = 10 * server.difficulty;
            
            if (state.data < dataCost || state.processingPower < processingCost) {
              return { 
                type: 'error', 
                message: [
                  `Not enough resources to secure this server.`,
                  `Required: ${dataCost} data and ${processingCost} processing power.`
                ] 
              };
            }
            
            // Update server security
            const securityReduction = 1 + (state.hackingSkill / 20); // Base 1 plus bonus from hacking skill
            
            dispatch({ 
              type: 'UPDATE_SERVER_SECURITY', 
              payload: { 
                serverId: server.id, 
                amount: -securityReduction 
              } 
            });
            
            // Deduct costs
            dispatch({
              type: 'MANUAL_HACK',
              payload: { target: 'secure' }
            });
            
            return {
              type: 'success',
              message: [
                `Security measures implemented on ${server.name}.`,
                `Security level reduced by ${securityReduction.toFixed(1)} points.`,
                `New security level: ${Math.max(0, server.securityLevel - securityReduction).toFixed(1)}/${server.maxSecurityLevel}`,
                `Resources used: ${dataCost} data, ${processingCost} processing power.`
              ]
            };
            
          default:
            return { type: 'error', message: [`Unknown server command: ${args[0]}`] };
        }
      default:
        setDisplayedLines(prev => [...prev, `Command not recognized. Type 'help' for available commands.`]);
    }
  };
  
  const displayHelp = (category?: string) => {
    if (!category) {
      setDisplayedLines(prev => [...prev, 
        "Available commands:",
        "- help: Shows this help message",
        "- status: Shows overall game status",
        "- clear: Clears the terminal",
        "- resources: Shows detailed resource information",
        "- upgrades: Lists available upgrades",
        "- buy [id]: Purchase an upgrade by ID",
        "- hack [target]: Attempt to hack a target",
        "- bonus: Activates a temporary bonus (if available)",
        "- mine: Manually mine some crypto",
        "- system: Display system information",
        "- stats: Display player statistics",
        "- achievements: List your achievements",
        "- claim [id]: Claim an achievement reward",
        "- prestige: Reset for permanent bonuses",
        "- critical: Show critical hit stats",
        "- server: Manage servers",
        "",
        "Type 'help [command]' for more information on a specific command."
      ]);
    } else {
      // Help for specific commands
      switch(category) {
        case 'buy':
          setDisplayedLines(prev => [...prev, 
            "Usage: buy [upgrade_id]",
            "Purchase an upgrade with the specified ID.",
            "Example: buy click1",
            "",
            "Use 'upgrades' command to see available upgrade IDs."
          ]);
          break;
        case 'hack':
          setDisplayedLines(prev => [...prev, 
            "Usage: hack [target]",
            "Attempt to hack a specified target to gain resources.",
            "Targets: network, database, server, mainframe",
            "",
            "Success depends on your processing power and reputation."
          ]);
          break;
        case 'achievements':
          setDisplayedLines(prev => [...prev, 
            "Usage: achievements",
            "Lists all achievements, both unlocked and locked.",
            "Achievements provide permanent bonuses when unlocked."
          ]);
          break;
        case 'claim':
          setDisplayedLines(prev => [...prev, 
            "Usage: claim [achievement_id]",
            "Claims the reward for an unlocked achievement.",
            "Example: claim first_clicks",
            "",
            "Use 'achievements' command to see available achievement IDs."
          ]);
          break;
        case 'prestige':
          setDisplayedLines(prev => [...prev, 
            "Usage: prestige",
            "Resets your progress but gives a permanent multiplier to all resource gains.",
            "The multiplier is based on your current resources.",
            "",
            "WARNING: This will reset most of your progress!"
          ]);
          break;
        default:
          setDisplayedLines(prev => [...prev, `No detailed help available for '${category}'.`]);
      }
    }
  };
  
  const displayStatus = () => {
    setDisplayedLines(prev => [...prev, 
      "=== SYSTEM STATUS ===",
      `Data: ${formatDataSize(state.data)} (${formatDataSize(state.dataPerSecond)}/s)`,
      `Crypto: ₿${formatCompactNumber(state.crypto)} (${formatCompactNumber(state.cryptoPerSecond)}/s)`,
      `Processing Power: ${formatCompactNumber(state.processingPower)} GHz`,
      `Total Clicks: ${formatCompactNumber(state.totalClicks)}`,
      state.bonusMultiplier > 1 ? `Active Bonus: ${state.bonusMultiplier}x (expires in ${Math.round((state.bonusUntil - Date.now()) / 1000)}s)` : "No active bonuses",
      "===================="
    ]);
  };
  
  const displayUpgrades = () => {
    const availableUpgrades = state.upgrades.filter(u => u.isUnlocked);
    
    if (availableUpgrades.length === 0) {
      setDisplayedLines(prev => [...prev, "No upgrades available yet. Keep collecting data!"]);
      return;
    }
    
    setDisplayedLines(prev => [
      ...prev,
      "=== AVAILABLE UPGRADES ===",
      ...availableUpgrades.map(u => 
        `[${u.id}] ${u.name} (Lvl ${u.level}/${u.maxLevel}) - ${u.description} - Cost: ${formatDataSize(Math.floor(u.baseCost * Math.pow(u.costMultiplier, u.level)))}`
      ),
      "",
      "Use 'buy [id]' to purchase an upgrade."
    ]);
  };
  
  const displayResources = () => {
    setDisplayedLines(prev => [...prev, 
      "=== RESOURCES ===",
      `Data: ${formatDataSize(state.data)}`,
      `Data per Click: ${formatDataSize(state.dataPerClick)}`,
      `Data per Second: ${formatDataSize(state.dataPerSecond)}`,
      "",
      `Crypto: ₿${formatCompactNumber(state.crypto)}`,
      `Crypto per Second: ₿${formatCompactNumber(state.cryptoPerSecond)}`,
      "",
      `Processing Power: ${formatCompactNumber(state.processingPower)} GHz`,
      state.networkNodes > 0 ? `Network Nodes: ${state.networkNodes}` : "",
      state.reputation !== 0 ? `Reputation: ${state.reputation > 0 ? '+' : ''}${state.reputation}` : "",
      "================="
    ]);
  };
  
  const buyUpgrade = (upgradeId?: string) => {
    if (!upgradeId) {
      setDisplayedLines(prev => [...prev, "Usage: buy [upgrade_id]"]);
      return;
    }
    
    const upgrade = state.upgrades.find(u => u.id === upgradeId && u.isUnlocked);
    
    if (!upgrade) {
      setDisplayedLines(prev => [...prev, `Upgrade '${upgradeId}' not found or not unlocked yet.`]);
      return;
    }
    
    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
    
    if (state.data < cost) {
      setDisplayedLines(prev => [...prev, `Not enough data to purchase this upgrade. Need ${formatDataSize(cost)}.`]);
      return;
    }
    
    // Purchase the upgrade
    dispatch({ type: 'BUY_UPGRADE', payload: { upgradeId } });
    setDisplayedLines(prev => [...prev, `Upgrade '${upgrade.name}' purchased successfully!`]);
  };
  
  const executeHack = (target?: string) => {
    const validTargets = ["network", "database", "server", "mainframe"];
    
    if (!target || !validTargets.includes(target)) {
      setDisplayedLines(prev => [...prev, 
        "Invalid target. Available targets:",
        ...validTargets.map(t => `- ${t}`)
      ]);
      return;
    }
    
    const now = Date.now();
    const cooldownRemaining = state.lastHackTime + state.hackCooldown - now;
    
    if (cooldownRemaining > 0) {
      setDisplayedLines(prev => [...prev, 
        `Hack is on cooldown. Please wait ${Math.ceil(cooldownRemaining / 1000)} seconds.`
      ]);
      return;
    }
    
    // Base success chance and rewards
    const targetRequirements: Record<string, number> = {
      network: 10,
      database: 50,
      server: 200,
      mainframe: 1000
    };
    
    const minProcessingRequired = targetRequirements[target] || 10;
    
    if (state.processingPower < minProcessingRequired) {
      setDisplayedLines(prev => [...prev, 
        `Hack failed! Insufficient processing power.`,
        `Target '${target}' requires at least ${minProcessingRequired} GHz.`,
        `Current processing power: ${state.processingPower} GHz.`
      ]);
      return;
    }
    
    // Simulate hacking process with delay and progress messages
    setDisplayedLines(prev => [...prev, `Initiating hack against ${target}...`]);
    
    setTimeout(() => {
      setDisplayedLines(prev => [...prev, `Bypassing security protocols...`]);
      
      setTimeout(() => {
        setDisplayedLines(prev => [...prev, `Access gained! Extracting data...`]);
        
        setTimeout(() => {
          // Actually execute the hack now
          dispatch({ type: 'MANUAL_HACK', payload: { target } });
          
          // Base success chance depends on hacking skill
          const baseRewards: Record<string, number> = {
            network: 10,
            database: 50,
            server: 200,
            mainframe: 1000
          };
          
          const reward = baseRewards[target] || 10;
          
          // Calculate reward based on hacking skill and processing power
          const hackMultiplier = 1 + (state.hackingSkill * 0.1) + (state.processingPower * 0.05);
          const dataGained = reward * state.dataPerClick * hackMultiplier;
          
          setDisplayedLines(prev => [...prev, 
            `Hack successful! Extracted ${formatDataSize(dataGained)} of data.`,
            `Disconnecting to avoid detection...`
          ]);
        }, 1000);
      }, 1000);
    }, 1000);
  };
  
  const activateBonus = () => {
    const now = Date.now();
    if (state.bonusUntil > now) {
      const timeLeft = Math.round((state.bonusUntil - now) / 1000);
      setDisplayedLines(prev => [...prev, `A bonus is already active for ${timeLeft} more seconds.`]);
      return;
    }
    
    if (state.processingPower < 50) {
      setDisplayedLines(prev => [...prev, `Insufficient processing power. Need at least 50 GHz.`]);
      return;
    }
    
    // Activate a random bonus
    const bonusMultiplier = 1 + (Math.floor(Math.random() * 5) + 2); // 3x to 7x
    const duration = 30000; // 30 seconds
    
    // Apply the bonus
    const bonusUntil = now + duration;
    
    // This would require adding a new action type to the game reducer
    // For now, we'll just show a message
    setDisplayedLines(prev => [...prev, 
      `Bonus activated! ${bonusMultiplier}x multiplier for 30 seconds.`,
      `(Note: This is just a message, actual implementation requires adding this action to the game reducer)`
    ]);
  };
  
  const mineCrypto = () => {
    if (state.cryptoPerSecond <= 0) {
      setDisplayedLines(prev => [...prev, `No crypto mining capability yet. Buy mining upgrades first.`]);
      return;
    }
    
    // Mine 10 seconds worth of crypto instantly
    dispatch({ type: 'MANUAL_MINE' });
    
    const cryptoGained = state.cryptoPerSecond * 10;
    setDisplayedLines(prev => [...prev, `Manual mining complete! Gained ₿${formatCompactNumber(cryptoGained)}.`]);
  };
  
  const displaySystemInfo = () => {
    setDisplayedLines(prev => [...prev, 
      "=== SYSTEM INFORMATION ===",
      "OS: Matrix OS v3.14.15",
      "Kernel: cybr-1337",
      "CPU: Neural Core i9",
      "Memory: 64 TB Quantum RAM",
      "Uptime: " + Math.floor((Date.now() - state.lastTimestamp) / 1000) + " seconds",
      "Connection: Secured through " + (state.networkNodes > 0 ? state.networkNodes : 1) + " nodes",
      "Security Level: " + (state.processingPower > 500 ? "Maximum" : state.processingPower > 100 ? "Enhanced" : "Basic"),
      "==========================="
    ]);
  };
  
  const displayPlayerStats = () => {
    setDisplayedLines(prev => [...prev, 
      "=== PLAYER STATISTICS ===",
      `Total Clicks: ${formatCompactNumber(state.totalClicks)}`,
      `Total Data Collected: ${formatDataSize(state.data + (state.totalClicks * state.dataPerClick))}`,
      `Upgrade Level: ${state.upgrades.reduce((sum, u) => sum + u.level, 0)}`,
      `Efficiency Rating: ${Math.min(100, Math.floor((state.dataPerSecond / Math.max(1, state.dataPerClick)) * 100))}%`,
      "=========================="
    ]);
  };
  
  const displayAchievements = () => {
    const { achievements } = state;
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    
    setDisplayedLines(prev => [
      ...prev,
      "=== ACHIEVEMENTS ===",
      `Progress: ${unlockedCount}/${achievements.length} unlocked`,
      "",
      "UNLOCKED:",
      ...achievements
        .filter(a => a.unlocked)
        .map(a => `[${a.id}] ${a.name}: ${a.description} - Reward: ${formatAchievementReward(a.reward)}`),
      "",
      "LOCKED:",
      ...achievements
        .filter(a => !a.unlocked)
        .map(a => `${a.name}: ${a.description} (${formatAchievementCondition(a)})`),
      "",
      "Use 'claim [id]' to claim rewards from unlocked achievements."
    ]);
  };
  
  const formatAchievementReward = (reward: { type: string; value: number }) => {
    switch(reward.type) {
      case 'dataMultiplier':
        return `${reward.value}x data production`;
      case 'cryptoMultiplier':
        return `${reward.value}x crypto production`;
      case 'processingMultiplier':
        return `${reward.value}x processing power`;
      case 'criticalChance':
        return `+${reward.value * 100}% critical chance`;
      default:
        return `${reward.value}x bonus`;
    }
  };
  
  const formatAchievementCondition = (achievement: any) => {
    switch(achievement.condition) {
      case 'clicks':
        return `${achievement.threshold} clicks needed`;
      case 'data':
        return `${formatDataSize(achievement.threshold)} data needed`;
      case 'crypto':
        return `${achievement.threshold} crypto needed`;
      case 'processingPower':
        return `${achievement.threshold} processing power needed`;
      case 'upgrades':
        return `${achievement.threshold} upgrades needed`;
      default:
        return 'Unknown condition';
    }
  };
  
  const claimAchievement = (achievementId?: string) => {
    if (!achievementId) {
      setDisplayedLines(prev => [...prev, "Usage: claim [achievement_id]"]);
      return;
    }
    
    const achievement = state.achievements.find(a => a.id === achievementId);
    
    if (!achievement) {
      setDisplayedLines(prev => [...prev, `Achievement '${achievementId}' not found.`]);
      return;
    }
    
    if (!achievement.unlocked) {
      setDisplayedLines(prev => [...prev, `Achievement '${achievement.name}' is not unlocked yet.`]);
      return;
    }
    
    // Claim the achievement
    dispatch({ type: 'CLAIM_ACHIEVEMENT', payload: { achievementId } });
    
    setDisplayedLines(prev => [...prev, 
      `Achievement '${achievement.name}' claimed!`,
      `Reward: ${formatAchievementReward(achievement.reward)}`
    ]);
  };
  
  const confirmPrestige = () => {
    const prestigeBonus = Math.log10(state.data + 1) * 0.1; // Match the bonus calculation in reducer
    const newMultiplier = state.prestigeMultiplier + prestigeBonus;
    
    setDisplayedLines(prev => [...prev, 
      "=== PRESTIGE CONFIRMATION ===",
      "WARNING: This will reset most of your progress!",
      "",
      `Current prestige level: ${state.prestigeLevel}`,
      `Current multiplier: ${state.prestigeMultiplier.toFixed(2)}x`,
      `New multiplier: ${newMultiplier.toFixed(2)}x (${(prestigeBonus * 100).toFixed(1)}% increase)`,
      "",
      "Type 'prestige confirm' to proceed or anything else to cancel."
    ]);
    
    // Set up a one-time command handler for confirmation
    setCommand("prestige confirm");
  };
  
  const executePrestige = () => {
    dispatch({ type: 'PRESTIGE' });
    
    setDisplayedLines(prev => [...prev, 
      "Prestige complete! Your progress has been reset with a permanent multiplier to all resources.",
      `New prestige level: ${state.prestigeLevel + 1}`,
      "Good luck on your next run!"
    ]);
  };
  
  const displayCriticalStats = () => {
    setDisplayedLines(prev => [...prev, 
      "=== CRITICAL HIT STATS ===",
      `Critical chance: ${(state.criticalChance * 100).toFixed(1)}%`,
      `Critical multiplier: ${state.criticalMultiplier.toFixed(1)}x`,
      "",
      "When a critical hit occurs, your click value is multiplied by the critical multiplier.",
      "You can increase your critical chance and multiplier through upgrades."
    ]);
  };
  
  // Handle keyboard navigation for command history
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      // Simple tab completion for commands
      const commands = ["help", "status", "clear", "upgrades", "resources", "buy", "hack", "bonus", "mine", "system", "stats", "achievements", "claim", "prestige", "critical", "server", "servers"];
      const partial = command.toLowerCase();
      
      const matches = commands.filter(cmd => cmd.startsWith(partial));
      if (matches.length === 1) {
        setCommand(matches[0] + (matches[0] === "buy" || matches[0] === "hack" ? " " : ""));
      } else if (matches.length > 1) {
        setDisplayedLines(prev => [...prev, `Possible commands: ${matches.join(", ")}`]);
      }
    }
    
    // Special case for prestige confirmation
    if (command === "prestige confirm" && e.key === "Enter") {
      e.preventDefault();
      setCommand("");
      executePrestige();
    }
  };
  
  return (
    <TerminalWrapper>
      <TerminalHeader>
        <TerminalTitle>{title}</TerminalTitle>
        <TerminalControls>
          <TerminalButton />
          <TerminalButton />
          <TerminalButton />
        </TerminalControls>
      </TerminalHeader>
      
      <TerminalContent ref={contentRef}>
        {displayedLines.map((line, index) => (
          <TerminalLine key={index}>{line}</TerminalLine>
        ))}
        
        {currentLine < allLines.length && (
          <TerminalLine>
            {allLines[currentLine].substring(0, currentChar)}
            <TerminalCursor>▋</TerminalCursor>
          </TerminalLine>
        )}
        
        {children}
      </TerminalContent>
      
      <TerminalForm onSubmit={handleSubmit}>
        <TerminalPrompt>{prompt}</TerminalPrompt>
        <TerminalInput 
          type="text" 
          value={command} 
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </TerminalForm>
    </TerminalWrapper>
  );
};

export default Terminal; 