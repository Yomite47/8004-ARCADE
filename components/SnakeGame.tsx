import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface SnakeGameProps {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

interface Point {
  x: number;
  y: number;
}

export const SnakeGame: React.FC<SnakeGameProps> = ({ onGameOver, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAME_OVER'>('START');
  const gameStateRef = useRef<'START' | 'PLAYING' | 'GAME_OVER'>('START');
  
  // Game State Refs
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const foodRef = useRef<Point>({ x: 15, y: 15 });
  const directionRef = useRef<Point>({ x: 0, y: 0 }); // Start stationary
  const nextDirectionRef = useRef<Point>({ x: 0, y: 0 });
  const scoreRef = useRef<number>(0);
  const gameLoopRef = useRef<number | null>(null);
  const lastRenderTimeRef = useRef<number>(0);
  
  // Config
  const GRID_SIZE = 20;
  const TILE_COUNT = 20; // Will be calculated based on canvas size
  const SPEED = 7; // Snake moves per second
  
  const initGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }];
    scoreRef.current = 0;
    directionRef.current = { x: 1, y: 0 }; // Start moving right
    nextDirectionRef.current = { x: 1, y: 0 };
    spawnFood();
    onScoreUpdate(0);
  };

  const spawnFood = () => {
    // Simple random spawn, ideally check if not on snake
    const newFood = {
      x: Math.floor(Math.random() * (canvasRef.current?.width || 400) / GRID_SIZE),
      y: Math.floor(Math.random() * (canvasRef.current?.height || 400) / GRID_SIZE)
    };
    foodRef.current = newFood;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        // Make sure width is multiple of GRID_SIZE
        const w = Math.floor(parent.clientWidth / GRID_SIZE) * GRID_SIZE;
        const h = Math.floor(600 / GRID_SIZE) * GRID_SIZE; // Fixed height for now or relative
        canvas.width = w > 0 ? w : 400;
        canvas.height = 400; // Fixed height
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Only init game logic if playing, otherwise just draw start state
    if (gameState === 'PLAYING') {
      initGame();
    } else {
       spawnFood(); // Spawn once so we have something to draw
       const ctx = canvas.getContext('2d');
       if (ctx) {
           // Draw initial black screen or static game state
           ctx.fillStyle = '#000000';
           ctx.fillRect(0, 0, canvas.width, canvas.height);
       }
    }

    // Input handling
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current.y === 0) nextDirectionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          if (directionRef.current.y === 0) nextDirectionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          if (directionRef.current.x === 0) nextDirectionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          if (directionRef.current.x === 0) nextDirectionRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Game Loop
    const loop = (currentTime: number) => {
      if (gameStateRef.current !== 'PLAYING') {
        // Just keep the loop running to catch state changes, but don't update/draw game
        gameLoopRef.current = requestAnimationFrame(loop);
        return;
      }

      if (isPaused) {
        gameLoopRef.current = requestAnimationFrame(loop);
        return;
      }

      gameLoopRef.current = requestAnimationFrame(loop);

      const secondsSinceLastRender = (currentTime - lastRenderTimeRef.current) / 1000;
      if (secondsSinceLastRender < 1 / SPEED) return;

      lastRenderTimeRef.current = currentTime;
      update();
      draw();
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, []);

  const update = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    directionRef.current = nextDirectionRef.current;
    const head = { ...snakeRef.current[0] };
    head.x += directionRef.current.x;
    head.y += directionRef.current.y;

    // Wall Collision
    const cols = canvas.width / GRID_SIZE;
    const rows = canvas.height / GRID_SIZE;

    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
      onGameOver(scoreRef.current);
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      return;
    }

    // Self Collision
    for (let i = 0; i < snakeRef.current.length; i++) {
      if (head.x === snakeRef.current[i].x && head.y === snakeRef.current[i].y) {
        onGameOver(scoreRef.current);
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        return;
      }
    }

    snakeRef.current.unshift(head);

    // Eat Food
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      scoreRef.current += 20;
      onScoreUpdate(scoreRef.current);
      spawnFood();
    } else {
      snakeRef.current.pop();
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid (optional, makes it look retro)
    ctx.strokeStyle = '#111';
    for (let i = 0; i < canvas.width; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw Food
    ctx.fillStyle = '#ff003c'; // Glitch red color from main theme
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff003c';
    ctx.fillRect(
      foodRef.current.x * GRID_SIZE, 
      foodRef.current.y * GRID_SIZE, 
      GRID_SIZE - 2, 
      GRID_SIZE - 2
    );
    ctx.shadowBlur = 0;

    // Draw Snake
    ctx.fillStyle = '#00f3ff'; // Cyan from main theme
    snakeRef.current.forEach((part, index) => {
      // Head is slightly different
      if (index === 0) {
          ctx.fillStyle = '#ffffff';
      } else {
          ctx.fillStyle = '#00f3ff';
      }
      
      ctx.fillRect(
        part.x * GRID_SIZE, 
        part.y * GRID_SIZE, 
        GRID_SIZE - 2, 
        GRID_SIZE - 2
      );
    });
  };

  const startGame = () => {
    setGameState('PLAYING');
    gameStateRef.current = 'PLAYING';
    initGame();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/90">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border-2 border-white/20 shadow-[0_0_20px_rgba(0,243,255,0.2)] max-w-full"
          onClick={gameState === 'START' ? startGame : undefined}
        />
        {gameState === 'START' && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/60 cursor-pointer"
            onClick={startGame}
            onTouchEnd={(e) => { e.preventDefault(); startGame(); }}
          >
            <div className="text-[#00f3ff] font-mono text-2xl animate-pulse">TAP TO START</div>
          </div>
        )}
      </div>
      <div className="mt-4 text-gray-500 text-sm">
        Use Arrow Keys or Touch Controls to Move
      </div>

      {/* Mobile Controls */}
      <div className="flex flex-col items-center gap-4 mt-6">
        <button 
          onClick={() => handleTouchDirection({ x: 0, y: -1 })} 
          className="p-6 bg-white/10 rounded-full active:bg-white/30 transition-colors"
        >
          <ArrowUp size={32} className="text-white" />
        </button>
        <div className="flex gap-8">
          <button 
            onClick={() => handleTouchDirection({ x: -1, y: 0 })} 
            className="p-6 bg-white/10 rounded-full active:bg-white/30 transition-colors"
          >
            <ArrowLeft size={32} className="text-white" />
          </button>
          <button 
            onClick={() => handleTouchDirection({ x: 1, y: 0 })} 
            className="p-6 bg-white/10 rounded-full active:bg-white/30 transition-colors"
          >
            <ArrowRight size={32} className="text-white" />
          </button>
        </div>
        <button 
          onClick={() => handleTouchDirection({ x: 0, y: 1 })} 
          className="p-6 bg-white/10 rounded-full active:bg-white/30 transition-colors"
        >
          <ArrowDown size={32} className="text-white" />
        </button>
      </div>
    </div>
  );
};
