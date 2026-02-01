import React, { useEffect, useRef, useState } from 'react';

interface VirusWhackGameProps {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

interface Virus {
  id: number;
  row: number;
  col: number;
  appearTime: number;
  duration: number;
  type: 'VIRUS' | 'glitch';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export const VirusWhackGame: React.FC<VirusWhackGameProps> = ({ onGameOver, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAME_OVER'>('START');
  const gameStateRef = useRef<'START' | 'PLAYING' | 'GAME_OVER'>('START');
  
  // Game State
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const virusesRef = useRef<Virus[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const gameLoopRef = useRef<number | null>(null);
  const lastSpawnTimeRef = useRef(0);
  const spawnIntervalRef = useRef(1500); // ms
  const gameStartTimeRef = useRef(0);
  
  // Grid Config
  const GRID_SIZE = 3; // 3x3 grid
  const CELL_PADDING = 10;
  
  const initGame = () => {
    scoreRef.current = 0;
    livesRef.current = 3;
    setLives(3);
    onScoreUpdate(0);
    virusesRef.current = [];
    particlesRef.current = [];
    spawnIntervalRef.current = 1500;
    gameStartTimeRef.current = performance.now();
    lastSpawnTimeRef.current = 0; // Spawn immediately
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 600;
    canvas.height = 500;
    
    initGame();

    // Input Handling (Pointer Events for Mouse + Touch)
    const handleInput = (e: PointerEvent) => {
        // Only handle primary clicks/touches
        if (!e.isPrimary) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;
        
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        checkHit(x, y, canvas.width, canvas.height);
    };

    canvas.addEventListener('pointerdown', handleInput);
    // Prevent default touch actions to stop zooming/scrolling while playing
    canvas.style.touchAction = 'none';

    // Game Loop
    const loop = (timestamp: number) => {
      if (gameStateRef.current !== 'PLAYING') {
         draw();
         gameLoopRef.current = requestAnimationFrame(loop);
         return;
      }

      update(timestamp);
      draw();
      
      if (livesRef.current > 0) {
          gameLoopRef.current = requestAnimationFrame(loop);
      }
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      canvas.removeEventListener('pointerdown', handleInput);
      canvas.style.touchAction = 'auto';
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, []);

  const spawnVirus = (timestamp: number) => {
    // Determine Grid Position
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);
    
    // Check if occupied
    const existing = virusesRef.current.find(v => v.row === row && v.col === col);
    if (existing) return;

    virusesRef.current.push({
        id: Math.random(),
        row,
        col,
        appearTime: timestamp,
        duration: Math.max(600, 1500 - Math.floor(scoreRef.current / 50) * 100), // Get faster
        type: 'VIRUS'
    });
  };

  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const speed = 2 + Math.random() * 2;
        particlesRef.current.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            color
        });
    }
  };

  const update = (timestamp: number) => {
    // Update Particles
    particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    // Spawning
    if (timestamp - lastSpawnTimeRef.current > spawnIntervalRef.current) {
        spawnVirus(timestamp);
        lastSpawnTimeRef.current = timestamp;
        
        // Speed up spawning slightly over time
        spawnIntervalRef.current = Math.max(400, 1000 - Math.floor(scoreRef.current / 100) * 50);
    }

    // Despawning (Missed Viruses)
    virusesRef.current = virusesRef.current.filter(v => {
        const age = timestamp - v.appearTime;
        if (age > v.duration) {
            // Missed a virus!
            livesRef.current--;
            setLives(livesRef.current);
            if (livesRef.current <= 0) {
                onGameOver(scoreRef.current);
            }
            return false;
        }
        return true;
    });
  };

  const checkHit = (x: number, y: number, width: number, height: number) => {
      const cellWidth = (width - (CELL_PADDING * (GRID_SIZE + 1))) / GRID_SIZE;
      const cellHeight = (height - (CELL_PADDING * (GRID_SIZE + 1))) / GRID_SIZE;

      // Find which cell was clicked
      // x = padding + col * (width + padding)
      // col approx = (x - padding) / (width + padding)
      
      // Simple collision check against all active viruses
      const hitIndex = virusesRef.current.findIndex(v => {
          const vx = CELL_PADDING + v.col * (cellWidth + CELL_PADDING);
          const vy = CELL_PADDING + v.row * (cellHeight + CELL_PADDING);
          
          return x >= vx && x <= vx + cellWidth &&
                 y >= vy && y <= vy + cellHeight;
      });

      if (hitIndex !== -1) {
          // Hit!
          const virus = virusesRef.current[hitIndex];
          const vx = CELL_PADDING + virus.col * (cellWidth + CELL_PADDING) + cellWidth/2;
          const vy = CELL_PADDING + virus.row * (cellHeight + CELL_PADDING) + cellHeight/2;
          
          createExplosion(vx, vy, '#ff003c');
          
          virusesRef.current.splice(hitIndex, 1);
          scoreRef.current += 1;
          onScoreUpdate(scoreRef.current);
      }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cellWidth = (canvas.width - (CELL_PADDING * (GRID_SIZE + 1))) / GRID_SIZE;
    const cellHeight = (canvas.height - (CELL_PADDING * (GRID_SIZE + 1))) / GRID_SIZE;

    // Draw Grid Slots
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const x = CELL_PADDING + c * (cellWidth + CELL_PADDING);
            const y = CELL_PADDING + r * (cellHeight + CELL_PADDING);
            
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, cellWidth, cellHeight);
            
            // Inner holographic glow
            ctx.fillStyle = 'rgba(0, 255, 0, 0.02)';
            ctx.fillRect(x, y, cellWidth, cellHeight);
        }
    }

    // Draw Viruses
    virusesRef.current.forEach(v => {
        const x = CELL_PADDING + v.col * (cellWidth + CELL_PADDING);
        const y = CELL_PADDING + v.row * (cellHeight + CELL_PADDING);
        
        // Virus Body
        ctx.fillStyle = '#ff003c';
        ctx.shadowColor = '#ff003c';
        ctx.shadowBlur = 15;
        
        // Draw a glitchy skull/bug shape
        const cx = x + cellWidth / 2;
        const cy = y + cellHeight / 2;
        const size = Math.min(cellWidth, cellHeight) * 0.35;
        
        ctx.beginPath();
        ctx.arc(cx, cy, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(cx - size * 0.3, cy - size * 0.1, size * 0.15, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.3, cy - size * 0.1, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // Glitch lines
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 10, y + cellHeight / 2);
        ctx.lineTo(x + cellWidth - 10, y + cellHeight / 2);
        ctx.stroke();
    });
    
    // Draw Particles
    particlesRef.current.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    });
    
    // Reset shadow
    ctx.shadowBlur = 0;
  };

  const startGame = () => {
    setGameState('PLAYING');
    gameStateRef.current = 'PLAYING';
    initGame();
  };

  return (
    <div className="relative">
      <div className="relative">
        <canvas 
            ref={canvasRef} 
            className="block bg-black border-2 border-red-500/50 rounded-lg shadow-[0_0_20px_rgba(255,0,0,0.2)] cursor-crosshair max-w-full"
            onClick={gameState === 'START' ? startGame : undefined}
        />
        {gameState === 'START' && (
            <div 
                className="absolute inset-0 flex items-center justify-center bg-black/60 cursor-pointer rounded-lg"
                onClick={startGame}
                onTouchEnd={(e) => { e.preventDefault(); startGame(); }}
            >
                <div className="text-[#ff003c] font-mono text-2xl animate-pulse">TAP TO START</div>
            </div>
        )}
      </div>
      <div className="absolute top-4 right-4 flex gap-2">
        <div className="text-[#ff003c] font-mono text-lg font-bold mr-4 animate-pulse">
            GOAL: 20
        </div>
        {[...Array(3)].map((_, i) => (
            <div key={i} className={`w-4 h-4 rounded-full ${i < lives ? 'bg-green-500 shadow-[0_0_10px_#00ff00]' : 'bg-gray-800'}`} />
        ))}
      </div>
      <div className="absolute bottom-2 right-4 text-xs text-gray-500 font-mono">
        SYSTEM INTEGRITY: {Math.floor((lives / 3) * 100)}%
      </div>
    </div>
  );
};
