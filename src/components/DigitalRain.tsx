import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useGame } from '../contexts/GameContext';

const Canvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background-color: #000;
  cursor: default;
`;

interface Particle {
  x: number;
  y: number;
  char: string;
  speed: number;
  color: string;
  opacity: number;
  isBonus: boolean;
  value: number;
}

interface DigitalRainProps {
  speed?: number;
  fontSize?: number;
  color?: string;
  intensity?: number;
}

const DigitalRain: React.FC<DigitalRainProps> = ({
  speed = 1.2,
  fontSize = 16,
  color = '#0F0', // Matrix green
  intensity = 1
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const [, forceUpdate] = useState<{}>({}); // Used only to force re-renders
  const prevClicksRef = useRef<number>(0);
  const { state, dispatch } = useGame();
  
  // Get a random matrix-style character
  const getRandomChar = useCallback(() => {
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
    return chars.charAt(Math.floor(Math.random() * chars.length));
  }, []);
  
  // Create new particle
  const createParticle = useCallback((x: number, y: number, isBonus: boolean = false): Particle => {
    return {
      x,
      y,
      char: getRandomChar(),
      speed: 1 + Math.random() * 3,
      color: isBonus ? '#FFF' : `rgba(0, ${Math.floor(Math.random() * 155) + 100}, 0, 0.8)`,
      opacity: 1,
      isBonus,
      value: isBonus ? Math.floor(Math.random() * 10) + 5 : 0
    };
  }, [getRandomChar]);
  
  // Trigger burst of particles at coordinates
  const createBurst = useCallback((x: number, y: number, count: number) => {
    const newParticles: Particle[] = [];
    const bonusCount = Math.floor(Math.random() * 3); // 0-2 bonus particles per burst
    
    for (let i = 0; i < count; i++) {
      const isBonus = i < bonusCount;
      newParticles.push({
        x: x + (Math.random() * 100 - 50),
        y: y + (Math.random() * 50 - 75), // Start above click
        char: getRandomChar(),
        speed: 2 + Math.random() * 5,
        color: isBonus ? '#FFF' : `rgba(0, ${Math.floor(Math.random() * 155) + 100}, 0, 0.8)`,
        opacity: 1,
        isBonus,
        value: isBonus ? Math.floor(Math.random() * 10) + 5 : 0
      });
    }
    
    particlesRef.current = [...particlesRef.current, ...newParticles];
    forceUpdate({});
  }, [getRandomChar]);
  
  // Handle clicking on particles
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicked on a bonus particle
    let bonusValue = 0;
    let clickedAny = false;
    
    const updatedParticles = particlesRef.current.filter(p => {
      const distance = Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2));
      
      if (distance < fontSize && p.isBonus) {
        bonusValue += p.value;
        clickedAny = true;
        return false; // Remove this particle
      }
      return true;
    });
    
    particlesRef.current = updatedParticles;
    
    if (bonusValue > 0) {
      // Dispatch bonus click with multiplier
      dispatch({ type: 'CLICK_BONUS', payload: { multiplier: bonusValue } });
      
      // Create a burst effect at the click position
      createBurst(x, y, 10);
    } else {
      // Normal click - create a resource and a smaller burst
      dispatch({ type: 'CLICK' });
      
      // Create a smaller burst effect for normal clicks
      createBurst(x, y, 5);
    }
    
    forceUpdate({});
  }, [createBurst, dispatch, fontSize]);
  
  // Check for new clicks and add particles
  useEffect(() => {
    // Track clicks for generating particles
    const handleClickTracking = () => {
      if (state.totalClicks > prevClicksRef.current) {
        const clicksAdded = state.totalClicks - prevClicksRef.current;
        prevClicksRef.current = state.totalClicks;
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Generate new particles based on how many new clicks and fallingBitsPerClick
        const particlesToAdd = Math.min(Math.max(3, state.fallingBitsPerClick) * clicksAdded, 30); // Cap at 30 per batch
        const newParticles: Particle[] = [];
        
        for (let i = 0; i < particlesToAdd; i++) {
          const x = Math.random() * canvas.width;
          const startY = -20 - Math.random() * 100; // Start above screen
          const isBonus = Math.random() < 0.08; // 8% chance for bonus particle
          
          newParticles.push(createParticle(x, startY, isBonus));
        }
        
        // Add new particles without clearing existing ones
        if (newParticles.length > 0) {
          particlesRef.current = [...particlesRef.current, ...newParticles];
          forceUpdate({});
        }
      }
    };
    
    // Call immediately and set up interval for checking
    handleClickTracking();
    
    // Also generate particles periodically (passive resource generation)
    const passiveInterval = setInterval(() => {
      if (state.dataPerSecond > 0 || state.cryptoPerSecond > 0) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Add some particles based on passive generation
        const passiveCount = Math.max(1, Math.min(5, Math.floor((state.dataPerSecond + state.cryptoPerSecond) / 10)));
        
        const newParticles: Particle[] = [];
        for (let i = 0; i < passiveCount; i++) {
          const x = Math.random() * canvas.width;
          const startY = -20 - Math.random() * 100;
          const isBonus = Math.random() < 0.05;
          
          newParticles.push(createParticle(x, startY, isBonus));
        }
        
        particlesRef.current = [...particlesRef.current, ...newParticles];
        forceUpdate({});
      }
    }, 3000); // Every 3 seconds
    
    return () => {
      clearInterval(passiveInterval);
    };
  }, [state.totalClicks, state.fallingBitsPerClick, state.dataPerSecond, state.cryptoPerSecond, createParticle]);
  
  // Main animation loop (independent of clicks)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    
    // Draw function that continuously animates particles
    const draw = () => {
      // Clear canvas with semi-transparent black for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw and update particles
      const particles = particlesRef.current;
      if (particles.length > 0) {
        const updatedParticles = particles.map(p => {
          // Draw the particle
          ctx.font = `${fontSize}px monospace`;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.fillText(p.char, p.x, p.y);
          ctx.globalAlpha = 1;
          
          // Update the particle position and opacity
          return {
            ...p,
            y: p.y + p.speed,
            opacity: Math.max(0, p.opacity - 0.002), // Slower fade for longer trails
            // Randomly change character for matrix effect
            char: Math.random() < 0.05 ? getRandomChar() : p.char
          };
        }).filter(p => p.opacity > 0.1 && p.y < canvas.height + 50);
        
        particlesRef.current = updatedParticles;
      }
      
      // Continue animation loop
      animationRef.current = requestAnimationFrame(draw);
    };
    
    // Start animation loop
    animationRef.current = requestAnimationFrame(draw);
    
    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
    
    // Cleanup on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [fontSize, getRandomChar]);
  
  return <Canvas ref={canvasRef} onClick={handleCanvasClick} />;
};

export default DigitalRain; 