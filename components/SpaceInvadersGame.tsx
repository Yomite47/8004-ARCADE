import React, { useEffect, useRef, useState } from 'react';

interface SpaceInvadersGameProps {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  speed: number;
}

interface Bullet extends GameObject {
  active: boolean;
  isPlayerBullet: boolean;
}

interface Enemy extends GameObject {
  active: boolean;
  row: number;
  col: number;
  value: number;
}

export const SpaceInvadersGame: React.FC<SpaceInvadersGameProps> = ({ onGameOver, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  // Game State Refs
  const playerRef = useRef<GameObject>({ x: 0, y: 0, width: 30, height: 20, color: '#00ff00', speed: 5 });
  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const enemyDirectionRef = useRef<number>(1); // 1 for right, -1 for left
  const enemyMoveTimerRef = useRef<number>(0);
  const enemyMoveIntervalRef = useRef<number>(50); // Frames between enemy moves (decreases as they get faster)
  
  const scoreRef = useRef<number>(0);
  const gameLoopRef = useRef<number | null>(null);
  const leftArrowPressed = useRef(false);
  const rightArrowPressed = useRef(false);
  const spacePressed = useRef(false);
  const lastShotTimeRef = useRef(0);
  
  // Config
  const SHOOT_COOLDOWN = 400; // ms
  const ENEMY_ROWS = 4;
  const ENEMY_COLS = 8;
  const ENEMY_WIDTH = 30;
  const ENEMY_HEIGHT = 20;
  const ENEMY_PADDING = 15;

  const initGame = (canvas: HTMLCanvasElement) => {
    scoreRef.current = 0;
    onScoreUpdate(0);
    bulletsRef.current = [];
    enemyDirectionRef.current = 1;
    enemyMoveIntervalRef.current = 60; // Start slower

    // Init Player
    playerRef.current.x = canvas.width / 2 - playerRef.current.width / 2;
    playerRef.current.y = canvas.height - 40;

    // Init Enemies
    createEnemies(canvas);
  };

  const createEnemies = (canvas: HTMLCanvasElement) => {
    const enemies: Enemy[] = [];
    const startX = 50;
    const startY = 50;

    for (let r = 0; r < ENEMY_ROWS; r++) {
      for (let c = 0; c < ENEMY_COLS; c++) {
        enemies.push({
          x: startX + c * (ENEMY_WIDTH + ENEMY_PADDING),
          y: startY + r * (ENEMY_HEIGHT + ENEMY_PADDING),
          width: ENEMY_WIDTH,
          height: ENEMY_HEIGHT,
          color: r === 0 ? '#ff00ff' : r === 1 ? '#ffff00' : '#00ffff', // Cyber colors
          speed: 10, // Jump distance
          active: true,
          row: r,
          col: c,
          value: (ENEMY_ROWS - r) * 100
        });
      }
    }
    enemiesRef.current = enemies;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 600;
    canvas.height = 500;
    
    initGame(canvas);

    // Input handling
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') leftArrowPressed.current = true;
      if (e.key === 'ArrowRight') rightArrowPressed.current = true;
      if (e.key === ' ') {
          spacePressed.current = true;
          // Prevent scrolling
          e.preventDefault();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') leftArrowPressed.current = false;
      if (e.key === 'ArrowRight') rightArrowPressed.current = false;
      if (e.key === ' ') spacePressed.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Game Loop
    const loop = (timestamp: number) => {
      if (isPaused) {
        gameLoopRef.current = requestAnimationFrame(loop);
        return;
      }

      update(timestamp);
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

  const shoot = (timestamp: number) => {
    if (timestamp - lastShotTimeRef.current > SHOOT_COOLDOWN) {
        bulletsRef.current.push({
            x: playerRef.current.x + playerRef.current.width / 2 - 2,
            y: playerRef.current.y,
            width: 4,
            height: 10,
            color: '#ffffff',
            speed: 7,
            active: true,
            isPlayerBullet: true
        });
        lastShotTimeRef.current = timestamp;
    }
  };

  const update = (timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Player Movement
    if (leftArrowPressed.current && playerRef.current.x > 0) {
        playerRef.current.x -= playerRef.current.speed;
    }
    if (rightArrowPressed.current && playerRef.current.x < canvas.width - playerRef.current.width) {
        playerRef.current.x += playerRef.current.speed;
    }

    // Shooting
    if (spacePressed.current) {
        shoot(timestamp);
    }

    // Enemy Shooting Logic
    // Chance to shoot based on enemy count (fewer enemies = more aggressive)
    const activeEnemies = enemiesRef.current.filter(e => e.active);
    if (activeEnemies.length > 0 && Math.random() < 0.02) {
        const shooter = activeEnemies[Math.floor(Math.random() * activeEnemies.length)];
        bulletsRef.current.push({
            x: shooter.x + shooter.width / 2 - 2,
            y: shooter.y + shooter.height,
            width: 4,
            height: 10,
            color: '#ff003c', // Enemy laser color
            speed: -5, // Negative speed indicates enemy bullet (or handle logic below)
            active: true,
            isPlayerBullet: false
        });
    }

    // Bullets
    bulletsRef.current.forEach(b => {
        if (!b.active) return;
        
        if (b.isPlayerBullet) {
             b.y -= b.speed;
             if (b.y < 0) b.active = false;
        } else {
             b.y -= b.speed; // Enemy bullets have negative speed, so -(-5) = +5 down
             if (b.y > canvas.height) b.active = false;
        }
    });

    // Enemy Movement
    enemyMoveTimerRef.current++;
    if (enemyMoveTimerRef.current > enemyMoveIntervalRef.current) {
        enemyMoveTimerRef.current = 0;
        moveEnemies(canvas);
    }

    // Collision Detection
    bulletsRef.current.forEach(bullet => {
        if (!bullet.active) return;

        if (bullet.isPlayerBullet) {
            // Player hitting enemies
            enemiesRef.current.forEach(enemy => {
                if (!enemy.active) return;

                if (
                    bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y
                ) {
                    // Hit!
                    enemy.active = false;
                    bullet.active = false;
                    scoreRef.current += enemy.value;
                    onScoreUpdate(scoreRef.current);
                    
                    // Increase speed slightly when enemies die
                    enemyMoveIntervalRef.current = Math.max(5, enemyMoveIntervalRef.current - 1);
                }
            });
        } else {
            // Enemy hitting player
            const p = playerRef.current;
            if (
                bullet.x < p.x + p.width &&
                bullet.x + bullet.width > p.x &&
                bullet.y < p.y + p.height &&
                bullet.y + bullet.height > p.y
            ) {
                 onGameOver(scoreRef.current);
                 if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
            }
        }
    });

    // Clean up bullets
    bulletsRef.current = bulletsRef.current.filter(b => b.active);
    
    // Check Win/Level Up (Respawn enemies if all dead)
    if (enemiesRef.current.every(e => !e.active)) {
        createEnemies(canvas);
        enemyMoveIntervalRef.current = Math.max(10, enemyMoveIntervalRef.current - 5);
    }

    // Game Over Check (Enemies reached bottom)
    const lowestEnemy = enemiesRef.current.filter(e => e.active).reduce((max, e) => Math.max(max, e.y + e.height), 0);
    if (lowestEnemy >= playerRef.current.y) {
        onGameOver(scoreRef.current);
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    }
  };

  const moveEnemies = (canvas: HTMLCanvasElement) => {
    let hitWall = false;
    const enemies = enemiesRef.current;
    
    // Check walls
    enemies.forEach(e => {
        if (!e.active) return;
        if (enemyDirectionRef.current === 1 && e.x + e.width + e.speed > canvas.width) hitWall = true;
        if (enemyDirectionRef.current === -1 && e.x - e.speed < 0) hitWall = true;
    });

    if (hitWall) {
        enemyDirectionRef.current *= -1;
        enemies.forEach(e => {
            e.y += e.height; // Drop down
        });
    } else {
        enemies.forEach(e => {
            e.x += e.speed * enemyDirectionRef.current;
        });
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Grid (Cyber aesthetic)
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    // Draw Player
    ctx.fillStyle = playerRef.current.color;
    // Simple ship shape
    const p = playerRef.current;
    ctx.beginPath();
    ctx.moveTo(p.x + p.width/2, p.y);
    ctx.lineTo(p.x + p.width, p.y + p.height);
    ctx.lineTo(p.x, p.y + p.height);
    ctx.fill();
    
    // Draw Bullets
    bulletsRef.current.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.width, b.height);
    });

    // Draw Enemies
    enemiesRef.current.forEach(e => {
        if (!e.active) return;
        ctx.fillStyle = e.color;
        
        // Alien shape (simple rect for now, maybe invader pixel art later)
        // ctx.fillRect(e.x, e.y, e.width, e.height);
        
        // Simple Invader shape
        const x = e.x;
        const y = e.y;
        const w = e.width;
        const h = e.height;
        
        ctx.beginPath();
        ctx.moveTo(x + w * 0.2, y);
        ctx.lineTo(x + w * 0.8, y);
        ctx.lineTo(x + w, y + h * 0.3);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x + w * 0.8, y + h);
        ctx.lineTo(x + w * 0.8, y + h * 0.8); // legs
        ctx.lineTo(x + w * 0.2, y + h * 0.8);
        ctx.lineTo(x + w * 0.2, y + h);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x, y + h * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(x + w * 0.3, y + h * 0.3, w * 0.15, h * 0.15);
        ctx.fillRect(x + w * 0.55, y + h * 0.3, w * 0.15, h * 0.15);
    });
  };

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        className="block bg-black border-2 border-green-500/50 rounded-lg shadow-[0_0_20px_rgba(0,255,0,0.3)]"
      />
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-mono text-2xl">
          PAUSED
        </div>
      )}
    </div>
  );
};
