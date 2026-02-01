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

export const VirusWhackGame: React.FC<VirusWhackGameProps> = ({ onGameOver, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lives, setLives] = useState(3);
  
  // Game State
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const virusesRef = useRef<Virus[]>([]);
  const gameLoopRef = useRef<number | null>(null);
  const lastSpawnTimeRef = useRef(0);
  const spawnIntervalRef = useRef(1000); // ms
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
    spawnIntervalRef.current = 1000;
    gameStartTimeRef.current = performance.now();
    lastSpawnTimeRef.current = performance.now();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 600;
    canvas.height = 500;
    
    initGame();

    // Input Handling (Mouse/Touch)
    const handleInput = (e: MouseEvent | TouchEvent) => {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if (e instanceof MouseEvent) {
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
            e.preventDefault(); // Prevent scrolling
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        checkHit(x, y, canvas.width, canvas.height);
    };

    canvas.addEventListener('mousedown', handleInput);
    canvas.addEventListener('touchstart', handleInput, { passive: false });

    // Game Loop
    const loop = (timestamp: number) => {
      update(timestamp);
      draw();
      
      if (livesRef.current > 0) {
          gameLoopRef.current = requestAnimationFrame(loop);
      }
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      canvas.removeEventListener('mousedown', handleInput);
      canvas.removeEventListener('touchstart', handleInput);
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

  const update = (timestamp: number) => {
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
          virusesRef.current.splice(hitIndex, 1);
          scoreRef.current += 5;
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
    
    // Reset shadow
    ctx.shadowBlur = 0;
  };

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        className="block bg-black border-2 border-red-500/50 rounded-lg shadow-[0_0_20px_rgba(255,0,0,0.2)] cursor-crosshair max-w-full"
      />
      <div className="absolute top-4 right-4 flex gap-2">
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
