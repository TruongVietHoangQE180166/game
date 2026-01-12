
import { PlayerStats, Buff, Particle, FloatingText, Rarity } from '../types';
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

// --- WEIGHTED RARITY LOGIC (UPDATED) ---
const RARITY_WEIGHTS: Record<Rarity, number> = {
    [Rarity.COMMON]: 40,      // Dễ kiếm, nền tảng
    [Rarity.UNCOMMON]: 28,    // Khá phổ biến
    [Rarity.RARE]: 18,        // Hiếm vừa phải
    [Rarity.EPIC]: 10,        // Khá hiếm
    [Rarity.LEGENDARY]: 3,    // Rất hiếm
    [Rarity.MYTHIC]: 0.8,     // Cực hiếm
    [Rarity.GODLY]: 0.2       // Siêu hiếm (1 trong 500)
};

const getRandomRarity = (): Rarity => {
    const totalWeight = Object.values(RARITY_WEIGHTS).reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;
    
    for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
        random -= weight;
        if (random <= 0) {
            return rarity as Rarity;
        }
    }
    return Rarity.COMMON; // Fallback
};

// Generates 3 unique random buff options with Weighted Probabilities
export const generateLevelUpOptions = (): Buff[] => {
    const distinctOptions: Buff[] = [];
    const usedIds = new Set<string>();
    
    let attempts = 0;
    while (distinctOptions.length < 3 && attempts < 50) {
       attempts++;
       
       // 1. Pick a target rarity based on weights
       const targetRarity = getRandomRarity();
       
       // 2. Filter available buffs by this rarity
       const pool = BUFFS.filter(b => b.rarity === targetRarity && !usedIds.has(b.id));
       
       // 3. If pool is empty (e.g. rolled GODLY but all GODLYs taken), try to pick ANY available buff
       if (pool.length === 0) {
           const backupPool = BUFFS.filter(b => !usedIds.has(b.id));
           if (backupPool.length > 0) {
               const randomBuff = backupPool[Math.floor(Math.random() * backupPool.length)];
               distinctOptions.push(randomBuff);
               usedIds.add(randomBuff.id);
           }
           continue;
       }

       // 4. Pick random from the rarity pool
       const selected = pool[Math.floor(Math.random() * pool.length)];
       distinctOptions.push(selected);
       usedIds.add(selected.id);
    }
    
    // Fallback: If we still don't have 3 options (extremely rare edge case), fill with duplicates allowed or randoms
    while(distinctOptions.length < 3) {
         const randomBuff = BUFFS[Math.floor(Math.random() * BUFFS.length)];
         // Allow duplicates only if necessary to prevent crash, but UI handles distinct mapping usually.
         // Better to just push unique if possible, but for safety:
         if (!usedIds.has(randomBuff.id)) {
            distinctOptions.push(randomBuff);
            usedIds.add(randomBuff.id);
         } else {
             // If we really ran out of unique buffs, break to avoid infinite loop
             break; 
         }
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
