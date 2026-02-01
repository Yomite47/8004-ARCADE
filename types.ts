export enum AppStage {
  LANDING = 'LANDING',
  GAME = 'GAME',
  GAME_OVER = 'GAME_OVER',
  MINT_PROMPT = 'MINT_PROMPT',
  MINT_SUCCESS = 'MINT_SUCCESS',
}

export interface GameConfig {
  gravity: number;
  jumpStrength: number;
  groundY: number;
  gameSpeedStart: number;
  gameSpeedMax: number;
  acceleration: number;
}

export interface RunnerEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  originalHeight?: number; // Optional for ducking mechanics
  vy: number;
  isGrounded: boolean;
  isDucking?: boolean; // Optional state
  color: string;
}

export interface ObstacleEntity {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  passed: boolean;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}