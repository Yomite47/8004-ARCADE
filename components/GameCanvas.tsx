import React, { useEffect, useRef } from 'react';
import { GameConfig, RunnerEntity, ObstacleEntity, Particle } from '../types';

interface GameCanvasProps {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onGameOver, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const scoreRef = useRef<number>(0);
  
  // Game State Refs (using refs to avoid closure staleness in loop)
  const runnerRef = useRef<RunnerEntity>({
    x: 50,
    y: 0, // Set in init
    width: 30,
    height: 50,
    originalHeight: 50, // Store original height for uncrouching
    vy: 0,
    isGrounded: true,
    isDucking: false,
    color: '#ffffff'
  });
  
  const obstaclesRef = useRef<ObstacleEntity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const speedRef = useRef<number>(2);
  const framesRef = useRef<number>(0);

  const config: GameConfig = {
    gravity: 0.6, // Reduced from 0.8 for floatier jumps
    jumpStrength: -15, // Adjusted from -16
    groundY: 300,
    gameSpeedStart: 2,
    gameSpeedMax: 15,
    acceleration: 0.001,
  };

  const spawnObstacle = (canvasWidth: number) => {
    const minHeight = 20;
    const maxHeight = 50;
    const height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
    const width = 20 + Math.random() * 20;
    
    // 15% chance for a "glitch" obstacle (floating) - Increased from 10%
    const isGlitch = Math.random() > 0.85;
    
    // Ensure flying obstacles are high enough to duck under
    // Gap needs to be > ducked height (25px) but < standing height (50px)
    // Gap of 40px: ObsBottom = Ground-40. Standing Head = Ground-50. 
    // Standing: Head(G-50) < Bottom(G-40) -> TRUE (Collision)
    // Ducking: Head(G-25) < Bottom(G-40) -> FALSE (No Collision)
    const y = isGlitch ? config.groundY - height - 40 : config.groundY - height;

    obstaclesRef.current.push({
      id: Date.now(),
      x: canvasWidth,
      y: y,
      width: width,
      height: height,
      color: isGlitch ? '#ff003c' : '#a0a0a0',
      passed: false
    });
  };

  const createParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        id: Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1.0,
        color
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize dimensions
    const handleResize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = 400; // Fixed height for gameplay consistency
        config.groundY = canvas.height - 50;
        
        // Reset runner position if needed
        if (runnerRef.current.y === 0) {
            runnerRef.current.y = config.groundY - runnerRef.current.height;
        }
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);

    // Input Handling
    const jump = () => {
      const runner = runnerRef.current;
      if (runner.isGrounded && !runner.isDucking) {
        runner.vy = config.jumpStrength;
        runner.isGrounded = false;
        createParticles(runner.x + runner.width / 2, runner.y + runner.height, '#ffffff', 5);
      }
    };

    const duck = (isDown: boolean) => {
        const runner = runnerRef.current;
        if (isDown) {
            if (!runner.isDucking) {
                runner.isDucking = true;
                runner.height = runner.originalHeight ? runner.originalHeight / 2 : 25;
                runner.y += runner.height; // Push down instantly so we don't float
            }
        } else {
            if (runner.isDucking) {
                runner.isDucking = false;
                runner.y -= runner.height; // Pop up
                runner.height = runner.originalHeight || 50;
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        duck(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.code === 'ArrowDown' || e.code === 'KeyS') {
            e.preventDefault();
            duck(false);
        }
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault(); 
      // Simple touch logic: Top half jump, bottom half duck? 
      // For now, just jump on tap as before, maybe add swipe later or buttons
      jump();
    };
    
    const handleMouse = (e: MouseEvent) => {
        e.preventDefault();
        jump();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('mousedown', handleMouse);

    // Main Game Loop
    const update = () => {
      framesRef.current++;
      
      // Clear canvas
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid Background (The "Digital" feel)
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      const gridSize = 40;
      const offset = (framesRef.current * (speedRef.current * 0.5)) % gridSize;
      
      ctx.beginPath();
      for (let x = -offset; x < canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      ctx.stroke();

      // Update Runner Physics
      const runner = runnerRef.current;
      runner.vy += config.gravity;
      runner.y += runner.vy;

      // Ground Collision
      if (runner.y + runner.height >= config.groundY) {
        runner.y = config.groundY - runner.height;
        runner.vy = 0;
        runner.isGrounded = true;
      } else {
        runner.isGrounded = false;
      }

      // Speed Acceleration
      if (speedRef.current < config.gameSpeedMax) {
        speedRef.current += config.acceleration;
      }

      // Update & Draw Obstacles
      const obstacles = obstaclesRef.current;
      
      // Spawning Logic
      const lastObstacle = obstacles[obstacles.length - 1];
      if (!lastObstacle || (canvas.width - lastObstacle.x > 300 + Math.random() * 300)) {
        spawnObstacle(canvas.width);
      }

      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= speedRef.current;

        // Draw Obstacle
        ctx.fillStyle = obs.color;
        // Glitch effect drawing
        if (Math.random() > 0.95) {
            ctx.fillRect(obs.x - 2, obs.y, obs.width + 4, obs.height);
        } else {
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }
        
        // Scanline on obstacle
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(obs.x, obs.y + obs.height/2, obs.width, 2);


        // Collision Detection (Forgiving Hitbox)
        // Shrink runner hitbox slightly to make it fair
        const hitX = runner.x + 5;
        const hitY = runner.y + 5;
        const hitW = runner.width - 10;
        const hitH = runner.height - 10;

        if (
          hitX < obs.x + obs.width &&
          hitX + hitW > obs.x &&
          hitY < obs.y + obs.height &&
          hitY + hitH > obs.y
        ) {
          // Collision!
          createParticles(runner.x + runner.width/2, runner.y + runner.height/2, '#ff0000', 20);
          onGameOver(Math.floor(scoreRef.current));
          return; // Stop loop
        }

        // Scoring (1 point per obstacle passed)
      if (obs.x + obs.width < runner.x && !obs.passed) {
          obs.passed = true;
          scoreRef.current += 1;
          onScoreUpdate(Math.floor(scoreRef.current));
      }

      if (obs.x + obs.width < 0) {
        obstacles.splice(i, 1);
      }
    }

      // Draw Ground Line
      ctx.beginPath();
      ctx.moveTo(0, config.groundY);
      ctx.lineTo(canvas.width, config.groundY);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw Digital artifacts on ground
      ctx.fillStyle = '#222';
      ctx.fillRect(0, config.groundY, canvas.width, 50);

      // Draw Runner
      ctx.fillStyle = runner.color;
      ctx.shadowColor = runner.color;
      ctx.shadowBlur = 10;
      ctx.fillRect(runner.x, runner.y, runner.width, runner.height);
      ctx.shadowBlur = 0;
      
      // Runner trailing effect
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(runner.x - 10, runner.y + 5, runner.width, runner.height - 10);

      // Draw Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        
        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
        } else {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.fillRect(p.x, p.y, 4, 4);
          ctx.globalAlpha = 1.0;
        }
      }

      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('mousedown', handleMouse);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [onGameOver, onScoreUpdate]);

  return (
    <div className="relative w-full h-[400px] bg-black border-y border-gray-800 overflow-hidden">
        <canvas ref={canvasRef} className="block w-full h-full cursor-pointer" />
        <div className="absolute top-4 right-4 text-xs text-gray-500 uppercase tracking-widest pointer-events-none text-right">
            <div>System Status: Active</div>
            <div className="mt-1 text-[10px] opacity-70">JUMP [SPACE] • DUCK [DOWN]</div>
        </div>
    </div>
  );
};