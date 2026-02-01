import React, { useEffect, useRef, useState } from 'react';

interface BlockBreakerGameProps {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  speed: number;
}

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  speed: number;
}

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  active: boolean;
  value: number;
}

import { ArrowLeft, ArrowRight } from 'lucide-react';

export const BlockBreakerGame: React.FC<BlockBreakerGameProps> = ({ onGameOver, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAME_OVER'>('START');
  
  // Game State Refs
  const ballRef = useRef<Ball>({ x: 0, y: 0, dx: 0, dy: 0, radius: 6, speed: 2.0 });
  const paddleRef = useRef<Paddle>({ x: 0, y: 0, width: 100, height: 15, color: '#00f3ff', speed: 5 });
  const blocksRef = useRef<Block[]>([]);
  const scoreRef = useRef<number>(0);
  const gameLoopRef = useRef<number | null>(null);
  const leftArrowPressed = useRef(false);
  const rightArrowPressed = useRef(false);
  
  // Config
  const ROW_COUNT = 5;
  const COL_COUNT = 8;
  const PADDLE_BOTTOM_MARGIN = 30;

  const handleTouchDirection = (direction: 'left' | 'right' | 'stop') => {
    if (direction === 'left') {
      leftArrowPressed.current = true;
      rightArrowPressed.current = false;
    } else if (direction === 'right') {
      rightArrowPressed.current = true;
      leftArrowPressed.current = false;
    } else {
      leftArrowPressed.current = false;
      rightArrowPressed.current = false;
    }
  };

  const initGame = (canvas: HTMLCanvasElement) => {
    scoreRef.current = 0;
    onScoreUpdate(0);

    // Init Paddle
    paddleRef.current.x = canvas.width / 2 - paddleRef.current.width / 2;
    paddleRef.current.y = canvas.height - PADDLE_BOTTOM_MARGIN;

    // Init Ball
    resetBall(canvas);

    // Init Blocks
    createBlocks(canvas);
  };

  const resetBall = (canvas: HTMLCanvasElement) => {
    ballRef.current.x = canvas.width / 2;
    ballRef.current.y = canvas.height - PADDLE_BOTTOM_MARGIN - 20;
    ballRef.current.speed = 2.0;
    ballRef.current.dx = 1.6 * (Math.random() > 0.5 ? 1 : -1);
    ballRef.current.dy = -ballRef.current.speed;
  };

  const createBlocks = (canvas: HTMLCanvasElement) => {
    const blocks: Block[] = [];
    const padding = 10;
    const offsetTop = 50;
    const offsetLeft = 35;
    
    // Calculate block width based on canvas width
    const blockWidth = (canvas.width - (offsetLeft * 2) - (padding * (COL_COUNT - 1))) / COL_COUNT;
    const blockHeight = 20;

    const colors = ['#ff003c', '#00f3ff', '#00ff00', '#ffff00', '#ff00ff'];

    for(let c = 0; c < COL_COUNT; c++) {
        for(let r = 0; r < ROW_COUNT; r++) {
            blocks.push({
                x: (c * (blockWidth + padding)) + offsetLeft,
                y: (r * (blockHeight + padding)) + offsetTop,
                width: blockWidth,
                height: blockHeight,
                color: colors[r % colors.length],
                active: true,
                value: (ROW_COUNT - r) * 5 // Higher blocks worth more
            });
        }
    }
    blocksRef.current = blocks;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 600;
    canvas.height = 500;
    
    // Handle resizing better if needed, but fixed size is easier for physics consistency
    const parent = canvas.parentElement;
    if (parent) {
       // responsive logic could go here
    }
    
    initGame(canvas);

    // Input handling
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') leftArrowPressed.current = true;
      if (e.key === 'ArrowRight') rightArrowPressed.current = true;
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') leftArrowPressed.current = false;
      if (e.key === 'ArrowRight') rightArrowPressed.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Game Loop
    const loop = () => {
      if (isPaused) {
        gameLoopRef.current = requestAnimationFrame(loop);
        return;
      }

      update();
      draw();
      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, []);

  const update = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Paddle Movement
    if (leftArrowPressed.current && paddleRef.current.x > 0) {
        paddleRef.current.x -= paddleRef.current.speed;
    }
    if (rightArrowPressed.current && paddleRef.current.x < canvas.width - paddleRef.current.width) {
        paddleRef.current.x += paddleRef.current.speed;
    }

    // Ball Movement
    const ball = ballRef.current;
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall Collision (Left/Right)
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }

    // Wall Collision (Top)
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    // Paddle Collision
    const paddle = paddleRef.current;
    if (
        ball.y + ball.radius > paddle.y &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width
    ) {
        // Hit paddle
        ball.dy = -ball.speed; // Bounce up
        
        // Add some "english" based on where it hit the paddle
        const hitPoint = ball.x - (paddle.x + paddle.width / 2);
        ball.dx = hitPoint * 0.15;
        
        // Increase speed slightly
        ball.speed = Math.min(ball.speed + 0.1, 8);
    }

    // Bottom Wall (Game Over)
    if (ball.y + ball.radius > canvas.height) {
        onGameOver(scoreRef.current);
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        return;
    }

    // Block Collision
    let activeBlocksCount = 0;
    blocksRef.current.forEach(block => {
        if (!block.active) return;
        activeBlocksCount++;

        if (
            ball.x > block.x &&
            ball.x < block.x + block.width &&
            ball.y - ball.radius < block.y + block.height &&
            ball.y + ball.radius > block.y
        ) {
            block.active = false;
            ball.dy = -ball.dy;
            scoreRef.current += block.value;
            onScoreUpdate(scoreRef.current);
        }
    });

    // Level Cleared -> Reset Blocks, Keep Score & Speed
    if (activeBlocksCount === 0) {
        createBlocks(canvas);
        resetBall(canvas);
        // Bonus for clearing
        scoreRef.current += 100;
        onScoreUpdate(scoreRef.current);
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Blocks
    blocksRef.current.forEach(block => {
        if (!block.active) return;
        ctx.fillStyle = block.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = block.color;
        ctx.fillRect(block.x, block.y, block.width, block.height);
        ctx.shadowBlur = 0;
    });

    // Draw Paddle
    ctx.fillStyle = paddleRef.current.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = paddleRef.current.color;
    ctx.fillRect(paddleRef.current.x, paddleRef.current.y, paddleRef.current.width, paddleRef.current.height);
    ctx.shadowBlur = 0;

    // Draw Ball
    ctx.beginPath();
    ctx.arc(ballRef.current.x, ballRef.current.y, ballRef.current.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.closePath();
  };

  const startGame = () => {
    setGameState('PLAYING');
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/90">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border-2 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)] max-w-full"
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
        Use Left/Right Arrows or Touch Controls to Move
      </div>
      
      {/* Mobile Controls */}
      <div className="flex gap-8 mt-6">
        <button 
          onMouseDown={() => handleTouchDirection('left')}
          onMouseUp={() => handleTouchDirection('stop')}
          onTouchStart={(e) => { e.preventDefault(); handleTouchDirection('left'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchDirection('stop'); }}
          className="p-6 bg-white/10 rounded-full active:bg-white/30 transition-colors"
        >
          <ArrowLeft size={32} className="text-white" />
        </button>
        <button 
          onMouseDown={() => handleTouchDirection('right')}
          onMouseUp={() => handleTouchDirection('stop')}
          onTouchStart={(e) => { e.preventDefault(); handleTouchDirection('right'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchDirection('stop'); }}
          className="p-6 bg-white/10 rounded-full active:bg-white/30 transition-colors"
        >
          <ArrowRight size={32} className="text-white" />
        </button>
      </div>
    </div>
  );
};
