
export enum GameState {
  MENU = 'MENU',
  LOADING = 'LOADING', // Màn hình chờ
  PLAYING = 'PLAYING',
  LEVEL_UP = 'LEVEL_UP',
  QUIZ = 'QUIZ',
  GAMEOVER = 'GAMEOVER',
  WIN = 'WIN'
}

export enum Rarity {
  COMMON = 'COMMON',       // Trắng
  UNCOMMON = 'UNCOMMON',   // Xanh lá
  RARE = 'RARE',           // Xanh dương
  EPIC = 'EPIC',           // Vàng
  LEGENDARY = 'LEGENDARY', // Tím
  MYTHIC = 'MYTHIC',       // Cam
  GODLY = 'GODLY'          // Đỏ
}

export interface GameHistory {
  id: string;
  date: string;
  kills: number;
  level: number;
  timeSurvived: string;
}

export interface Buff {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  effect: (stats: PlayerStats) => PlayerStats;
  type: 'GUN_BUFF' | 'BOOK_BUFF' | 'LIGHTNING_BUFF' | 'NOVA_BUFF' | 'STAT_BUFF';
}

export interface PlayerStats {
  // Core Stats
  maxHP: number;
  hp: number;
  maxArmor: number;
  currentArmor: number;
  armor: number;
  moveSpeed: number;

  // Gun Specific Stats
  gunDamageMult: number;
  gunCooldownMult: number;
  gunAmount: number;
  gunPierce: number;
  gunSpeed: number;

  // Book Specific Stats
  bookDamageMult: number;
  bookCooldownMult: number;
  bookAmount: number;
  bookArea: number;
  bookSpeed: number;
  
  // Lightning Specific Stats
  lightningDamageMult: number;
  lightningCooldownMult: number;
  lightningAmount: number;
  lightningArea: number;

  // Nova Blast Stats (REPLACED LOTUS)
  novaUnlocked: boolean; // Có mở khóa chưa
  novaDamageMult: number;
  novaCooldownMult: number;
  novaArea: number;
  
  // Progression
  level: number;
  exp: number;
  expToNext: number;
  kills: number;
  magnetRange: number;
}

export interface Question {
  id: number;
  topic: string;
  difficulty: number;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
}

export interface Enemy extends Entity {
  type: 'NORM_1' | 'NORM_2' | 'SHOOTER' | 'EXPLODER' | 'ELITE' | 'SPLITTER' | 'MINI' | 'BOSS_1' | 'BOSS_2' | 'BOSS_3';
  aiType: 'MELEE' | 'RANGED' | 'KAMIKAZE' | 'DASHER' | 'BOSS' | 'SLIME' | 'MINI'; 
  hp: number;
  maxHP: number;
  speed: number;
  damage: number;
  color: string;
  borderColor: string;
  flashTime: number;
  
  // Physics (Optional)
  vx?: number;
  vy?: number;
  rotation?: number;

  // Advanced Attack Logic
  attackRange?: number;
  attackPattern?: 'BASIC' | 'BURST' | 'NOVA' | 'SLAM' | 'HOMING' | 'LASER' | 'SPIRAL' | 'DASH' | 'STOMP' | 'MISSILE' | 'BLACK_HOLE' | 'GRID';
  attackState?: 'IDLE' | 'WARN' | 'FIRING' | 'COOLDOWN' | 'CHARGING' | 'DASHING' | 'PULLING'; 
  stateTimer?: number;
  burstCount?: number;
  secondaryTimer?: number;
  
  // Special State Flags
  isCharging?: boolean; 
  attackTimer?: number;
  
  // Laser/Dash/Missile Specifics
  laserAngle?: number;
  dashTarget?: { x: number, y: number };
  missileTargets?: { x: number, y: number }[]; // For Missile Rain
  rotationSpeed?: number;
}

export interface Projectile extends Entity {
  vx: number;
  vy: number;
  damage: number;
  life: number;
  rotation: number;
  type: 'PLAYER_BULLET' | 'ENEMY_BULLET';
  pierce: number;
  color: string;
  
  // Advanced Behaviors
  isHoming?: boolean;
  homingForce?: number;
}

export interface Particle extends Entity {
  vx: number;
  vy: number;
  life: number;
  maxLife: number; // For fading alpha
  color: string;
  size: number;
  type: 'DOT' | 'SHOCKWAVE' | 'SQUARE' | 'SHELL' | 'STAR' | 'MUZZLE' | 'BEAM_CORE' | 'LIGHTNING' | 'FLASH' | 'NOVA_BLAST';
  drag: number;   // Friction (0-1)
  growth: number; // Size change over time
  rotation?: number; 
  vRot?: number;
  
  // Lightning specific
  path?: {x: number, y: number}[];
  branches?: {x: number, y: number}[][];
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  vx: number;
  vy: number;
}

export interface ExpGem extends Entity {
  amount: number;
  color: string;
}

export interface HealthDrop extends Entity {
  healAmount: number;
  life: number;
}