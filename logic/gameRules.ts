
import { PlayerStats, Buff, Particle, FloatingText } from '../types';
import { BUFFS } from '../constants';
import { createHitEffect, createShieldHitEffect } from './particles';

// Calculates new stats after taking damage and spawns visual effects
export const calculatePlayerDamage = (
    currentStats: PlayerStats, 
    rawDamage: number, 
    screenShake: { shake: (amt: number) => void },
    playerPos: { x: number, y: number },
    particles: Particle[],
    floatingTexts: FloatingText[]
): PlayerStats => {
    const newStats = { ...currentStats };
    let dmg = rawDamage;
    let absorbed = 0;
    
    // 1. Armor absorption (Energy Shield logic)
    if (newStats.currentArmor > 0) {
        absorbed = Math.min(newStats.currentArmor, dmg);
        newStats.currentArmor -= absorbed;
        dmg -= absorbed;
        
        // Shield Hit Visuals
        createShieldHitEffect(particles, floatingTexts, playerPos.x, playerPos.y, absorbed);
    }

    // 2. Health damage
    if (dmg > 0) {
        // Flat damage reduction from 'armor' stat
        const actualDmg = Math.max(1, dmg - newStats.armor);
        newStats.hp -= actualDmg;
        
        // Visual Effects
        screenShake.shake(actualDmg * 0.5);
        createHitEffect(particles, floatingTexts, playerPos.x, playerPos.y, '#ef4444', actualDmg, true);
    }
    
    return newStats;
};

// Generates 3 unique random buff options
export const generateLevelUpOptions = (): Buff[] => {
    const distinctOptions: Buff[] = [];
    const usedIndices = new Set<number>();
    
    // Safety break to prevent infinite loops if BUFFS is small
    let attempts = 0;
    while (distinctOptions.length < 3 && usedIndices.size < BUFFS.length && attempts < 100) {
       const idx = Math.floor(Math.random() * BUFFS.length);
       if (!usedIndices.has(idx)) {
         usedIndices.add(idx);
         distinctOptions.push(BUFFS[idx]);
       }
       attempts++;
    }
    return distinctOptions;
};

// Applies the selected buff (if correct) or a small heal (if wrong)
export const applyQuizResult = (stats: PlayerStats, buff: Buff | null, isCorrect: boolean): PlayerStats => {
     if (isCorrect && buff) {
       return buff.effect(stats);
     } else {
       // Penalty / Consolation: Heal 10% max HP instead of getting the buff
       return { 
           ...stats, 
           hp: Math.min(stats.maxHP, stats.hp + (stats.maxHP * 0.1)) 
       };
     }
};
