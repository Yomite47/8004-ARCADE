import React, { useEffect, useRef, useState } from 'react';

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
  const SPEED = 10; // Snake moves per second
  
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
    
    initGame();

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

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/90">
      <canvas
        ref={canvasRef}
        className="border-2 border-white/20 shadow-[0_0_20px_rgba(0,243,255,0.2)]"
      />
      <div className="mt-4 text-gray-500 text-sm">
        Use Arrow Keys to Move
      </div>
    </div>
  );
};
