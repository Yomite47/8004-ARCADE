import React, { useEffect, useRef, useState } from 'react';

interface CyberFlapGameProps {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

interface Bird {
  y: number;
  velocity: number;
  radius: number;
}

interface Pipe {
  x: number;
  topHeight: number;
  passed: boolean;
}

export const CyberFlapGame: React.FC<CyberFlapGameProps> = ({ onGameOver, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<'START' | 'PLAYING' | 'GAME_OVER'>('START');
  
  // Game State
  const birdRef = useRef<Bird>({ y: 250, velocity: 0, radius: 10 });
  const pipesRef = useRef<Pipe[]>([]);
  const scoreRef = useRef(0);
  const gameLoopRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  
  // Config
  const GRAVITY = 0.12; 
  const JUMP_STRENGTH = -3.0; 
  const MAX_FALL_SPEED = 4; 
  const PIPE_SPEED = 1.5; 
  const PIPE_SPACING = 300; 
  const PIPE_GAP = 200; 
  const PIPE_WIDTH = 50;

  const initGame = () => {
    scoreRef.current = 0;
    onScoreUpdate(0);
    birdRef.current = { y: 250, velocity: 0, radius: 10 };
    pipesRef.current = [];
    frameCountRef.current = 0;
    gameStateRef.current = 'START';
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 600;
    canvas.height = 500;
    
    initGame();

    const handleInput = (e: KeyboardEvent | MouseEvent | TouchEvent) => {
        if (gameStateRef.current === 'GAME_OVER') return;

        if (gameStateRef.current === 'START') {
            gameStateRef.current = 'PLAYING';
            jump();
        } else {
            jump();
        }
        
        if (e instanceof KeyboardEvent) {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
            }
        }
    };

    window.addEventListener('keydown', handleInput);
    canvas.addEventListener('mousedown', handleInput);
    canvas.addEventListener('touchstart', handleInput, { passive: false });

    const loop = () => {
        if (gameStateRef.current !== 'GAME_OVER') {
            update();
            draw();
            gameLoopRef.current = requestAnimationFrame(loop);
        }
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
        window.removeEventListener('keydown', handleInput);
        canvas.removeEventListener('mousedown', handleInput);
        canvas.removeEventListener('touchstart', handleInput);
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, []);

  const jump = () => {
      birdRef.current.velocity = JUMP_STRENGTH;
  };

  const update = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (gameStateRef.current === 'START') {
        // Hover effect
        birdRef.current.y = 250 + Math.sin(frameCountRef.current * 0.05) * 10;
        frameCountRef.current++;
        return;
      }

      // Bird Physics
      birdRef.current.velocity += GRAVITY;
      // Cap max fall speed
      if (birdRef.current.velocity > MAX_FALL_SPEED) {
          birdRef.current.velocity = MAX_FALL_SPEED;
      }
      birdRef.current.y += birdRef.current.velocity;

      // Floor/Ceiling Collision
      if (birdRef.current.y + birdRef.current.radius > canvas.height || birdRef.current.y - birdRef.current.radius < 0) {
          gameStateRef.current = 'GAME_OVER';
          onGameOver(scoreRef.current);
          if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
          return;
      }

      // Pipe Spawning
      if (frameCountRef.current % 220 === 0) { // Much slower spawn rate
          const minHeight = 50;
          const maxHeight = canvas.height - PIPE_GAP - minHeight;
          const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
          
          pipesRef.current.push({
              x: canvas.width,
              topHeight,
              passed: false
          });
      }
      frameCountRef.current++;

      // Pipe Movement & Collision
      pipesRef.current.forEach(pipe => {
          pipe.x -= PIPE_SPEED;

          // Collision Check
          // Bird box approx
          const bx = canvas.width / 2; // Bird is fixed horizontally at center
          const by = birdRef.current.y;
          const br = birdRef.current.radius;

          // Pipe Box
          // Top Pipe
          if (
              bx + br > pipe.x && 
              bx - br < pipe.x + PIPE_WIDTH && 
              by - br < pipe.topHeight
          ) {
              gameStateRef.current = 'GAME_OVER';
              onGameOver(scoreRef.current);
              if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
          }

          // Bottom Pipe
          if (
              bx + br > pipe.x && 
              bx - br < pipe.x + PIPE_WIDTH && 
              by + br > pipe.topHeight + PIPE_GAP
          ) {
              gameStateRef.current = 'GAME_OVER';
              onGameOver(scoreRef.current);
              if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
          }

          // Score Update
          if (!pipe.passed && pipe.x + PIPE_WIDTH < bx - br) {
              pipe.passed = true;
              scoreRef.current += 1;
              onScoreUpdate(scoreRef.current);
          }
      });

      // Cleanup Pipes
      if (pipesRef.current.length > 0 && pipesRef.current[0].x < -PIPE_WIDTH) {
          pipesRef.current.shift();
      }
  };

  const draw = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      // Background
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Cyber Grid
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      const offset = (frameCountRef.current * 2) % 40;
      for (let i = 0; i < canvas.width; i += 40) {
          ctx.beginPath();
          ctx.moveTo(i - offset, 0);
          ctx.lineTo(i - offset, canvas.height);
          ctx.stroke();
      }

      // Draw Pipes
      ctx.fillStyle = '#00ff00';
      ctx.shadowColor = '#00ff00';
      ctx.shadowBlur = 10;
      
      pipesRef.current.forEach(pipe => {
          // Top Pipe
          ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
          // Bottom Pipe
          ctx.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, canvas.height - (pipe.topHeight + PIPE_GAP));
          
          // Pipe details (tech lines)
          ctx.fillStyle = '#003300';
          ctx.fillRect(pipe.x + 10, 0, 5, pipe.topHeight);
          ctx.fillRect(pipe.x + 10, pipe.topHeight + PIPE_GAP, 5, canvas.height);
          ctx.fillStyle = '#00ff00'; // Reset
      });
      ctx.shadowBlur = 0;

      // Draw Bird
      const bx = canvas.width / 2;
      const by = birdRef.current.y;
      
      ctx.fillStyle = '#00f3ff';
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 15;
      
      // Drone shape
      ctx.beginPath();
      ctx.arc(bx, by, birdRef.current.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Drone Wings/Rotors
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx - 15, by);
      ctx.lineTo(bx + 15, by);
      ctx.stroke();
      
      // Reset
      ctx.shadowBlur = 0;

      // Start Screen
      if (gameStateRef.current === 'START') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00f3ff';
        ctx.font = 'bold 30px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SYSTEM READY', canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.fillStyle = '#fff';
        ctx.font = '20px "Courier New", monospace';
        ctx.fillText('Tap or Space to Engage Thrusters', canvas.width / 2, canvas.height / 2 + 20);
      }
  };

  return (
    <div className="relative w-full">
      <canvas 
        ref={canvasRef} 
        className="block w-full bg-black border-2 border-cyan-500/50 rounded-lg shadow-[0_0_20px_rgba(0,243,255,0.2)] touch-none"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};
