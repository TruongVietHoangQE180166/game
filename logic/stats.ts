
import { PlayerStats } from '../types';

export const INITIAL_STATS: PlayerStats = {
  maxHP: 80, 
  hp: 80,
  maxArmor: 20, 
  currentArmor: 20,
  armor: 0,
  moveSpeed: 220, 
  gunDamageMult: 0.8, 
  gunCooldownMult: 1.0, gunAmount: 1, gunPierce: 0, gunSpeed: 1.0,
  bookDamageMult: 0.8, 
  bookCooldownMult: 1.0, bookAmount: 1, bookArea: 0.8, bookSpeed: 1.0,
  
  // Lightning Stats
  lightningDamageMult: 1.0, 
  lightningCooldownMult: 1.0, 
  lightningAmount: 1, 
  lightningArea: 1.0,

  magnetRange: 150, 
  level: 1, exp: 0, expToNext: 100, kills: 0
};
