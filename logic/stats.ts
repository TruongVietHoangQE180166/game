
import { PlayerStats } from '../types';

export const INITIAL_STATS: PlayerStats = {
  maxHP: 500, 
  hp: 500,
  hpRegen: 25,

  maxArmor: 50, 
  currentArmor: 50,
  armor: 1, 
  armorRegen: 1,

  moveSpeed: 300,

  // --- GUN STATS ---
  gunDamageMult: 1.0, 
  gunCooldownMult: 1.0, 
  gunAmount: 1,
  gunPierce: 0,
  gunSpeed: 1.0,

  // --- BOOK STATS ---
  bookDamageMult: 1.0, 
  bookCooldownMult: 1.0, 
  bookAmount: 1, 
  bookArea: 1.0, 
  bookSpeed: 1.0, 
  
  // --- LIGHTNING STATS ---
  lightningDamageMult: 1.0, 
  lightningCooldownMult: 1.0, 
  lightningAmount: 1, // Cần nâng cấp để mở khóa
  lightningArea: 1.0,

  // --- NOVA BLAST STATS ---
  novaUnlocked: true,
  novaDamageMult: 1.0,
  novaCooldownMult: 1.0,
  novaArea: 1.0,

  magnetRange: 200,
  level: 1, exp: 0, expToNext: 100, kills: 0
};
