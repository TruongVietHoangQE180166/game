
import { PlayerStats, Enemy, Projectile, Particle, FloatingText } from '../types';
import { getDistance, checkCircleCollision, getRandomRange, ScreenShake } from '../utils';
import { createMuzzleFlash, createShellCasing, createHitEffect, createSimpleParticles, createMagicSparkle } from './particles';

interface PlayerRef {
  x: number;
  y: number;
  size: number;
}

export const updateGun = (
  dt: number,
  weaponTimers: { gun: number },
  stats: PlayerStats,
  player: PlayerRef,
  enemies: Enemy[],
  projectiles: Projectile[],
  particles: Particle[]
) => {
  weaponTimers.gun += dt;
  if (weaponTimers.gun >= (0.6 * stats.gunCooldownMult)) {
    let nearest: Enemy | null = null;
    let minDist = 800;
    enemies.forEach(e => {
      const d = getDistance(player.x, player.y, e.x, e.y);
      if (d < minDist) { minDist = d; nearest = e; }
    });

    if (nearest) {
      const baseAngle = Math.atan2((nearest as Enemy).y - player.y, (nearest as Enemy).x - player.x);
      const bulletCount = Math.max(1, stats.gunAmount);
      const bulletSize = 14 * Math.max(1, stats.gunDamageMult * 0.8);

      createMuzzleFlash(particles, player.x, player.y, baseAngle);

      for(let i=0; i<bulletCount; i++) {
          const spread = (i - (bulletCount-1)/2) * 0.15; 
          const finalAngle = baseAngle + spread;
          projectiles.push({
              id: Math.random().toString(),
              x: player.x, y: player.y,
              width: bulletSize, height: bulletSize,
              vx: Math.cos(finalAngle) * 900, vy: Math.sin(finalAngle) * 900,
              damage: 20 * stats.gunDamageMult,
              life: 1.5, rotation: finalAngle, type: 'PLAYER_BULLET',
              pierce: stats.gunPierce,
              color: '#fbbf24'
          });
          createShellCasing(particles, player.x, player.y, finalAngle);
      }
      weaponTimers.gun = 0;
    }
  }
};

export const updateLightning = (
  dt: number,
  weaponTimers: { lightning: number },
  stats: PlayerStats,
  player: PlayerRef,
  enemies: Enemy[],
  particles: Particle[],
  floatingTexts: FloatingText[],
  shakeManager: ScreenShake
) => {
  weaponTimers.lightning += dt;
  if (stats.lightningAmount > 0 && weaponTimers.lightning >= (2.0 * stats.lightningCooldownMult)) {
     const visibleEnemies = enemies.filter(e => 
        getDistance(player.x, player.y, e.x, e.y) < 900
     );
     
     if (visibleEnemies.length > 0) {
        const targets: Enemy[] = [];
        const count = stats.lightningAmount;
        const pool = [...visibleEnemies];
        for(let i=0; i<count; i++) {
           if (pool.length === 0) break;
           const idx = Math.floor(Math.random() * pool.length);
           targets.push(pool.splice(idx, 1)[0]);
        }

        targets.forEach(e => {
           const dmg = 40 * stats.lightningDamageMult;
           e.hp -= dmg;
           e.flashTime = 0.2;
           
           // --- Enhanced Path Generation ---
           const startX = e.x + getRandomRange(-150, 150);
           const startY = e.y - 700;
           const path = [{x: startX, y: startY}];
           const branches: {x: number, y: number}[][] = [];
           
           const segments = 12;
           const dy = (e.y - startY) / segments;
           const dxTotal = e.x - startX;
           
           for(let k=1; k<=segments; k++) {
              const progress = k / segments;
              const targetX = startX + dxTotal * progress;
              const targetY = startY + dy * k;
              const jitter = k === segments ? 0 : getRandomRange(-40, 40);
              const pt = { x: targetX + jitter, y: targetY };
              path.push(pt);

              // Spawn a branch (30% chance)
              if (k < segments - 2 && Math.random() < 0.3) {
                  const branchLength = getRandomRange(3, 6);
                  const branchPath = [{...pt}];
                  let bx = pt.x;
                  let by = pt.y;
                  const bDx = getRandomRange(-30, 30);
                  for(let b=0; b<branchLength; b++) {
                      bx += bDx + getRandomRange(-10, 10);
                      by += dy * 0.7;
                      branchPath.push({x: bx, y: by});
                  }
                  branches.push(branchPath);
              }
           }

           // FLASH PARTICLE
           particles.push({
               id: Math.random().toString(), x: e.x, y: e.y, width:0, height:0,
               vx:0, vy:0, life:0.1, maxLife:0.1, color: '#fff', size: 300,
               type: 'FLASH', drag:0, growth:0
           });

           particles.push({
               id: Math.random().toString(), x: e.x, y: e.y, width:0, height:0,
               vx:0, vy:0, life: 0.35, maxLife: 0.35, 
               color: '#67e8f9', // Bright Cyan
               size: 10 * stats.lightningArea,
               type: 'LIGHTNING', drag: 0, growth: 0, 
               path: path,
               branches: branches
           });

           // Enhanced Explosion
           particles.push({
               id: Math.random().toString(), x: e.x, y: e.y, width:0, height:0,
               vx:0, vy:0, life:0.4, maxLife:0.4, color: '#67e8f9', size: 80 * stats.lightningArea,
               type: 'SHOCKWAVE', drag:0, growth: 150
           });
           // Sparks
           createSimpleParticles(particles, e.x, e.y, '#bae6fd', 15);

           createHitEffect(particles, floatingTexts, e.x, e.y, '#22d3ee', dmg, true);
        });
        
        if (targets.length > 0) shakeManager.shake(5 * targets.length);
        weaponTimers.lightning = 0;
     }
  }
};

export const updateBook = (
  dt: number,
  gameTime: number,
  stats: PlayerStats,
  player: PlayerRef,
  enemies: Enemy[],
  particles: Particle[],
  floatingTexts: FloatingText[]
) => {
  const orbitalSpeed = 3.0 * stats.bookSpeed;
  const orbitalRadius = 160 * stats.bookArea;
  const bookCount = stats.bookAmount;
  const bookDamage = 15 * stats.bookDamageMult * dt * 8; 
  const bookSize = 24 * stats.bookArea * Math.max(1, stats.bookDamageMult * 0.7);

  for(let i=0; i < bookCount; i++) {
      const angle = (gameTime * orbitalSpeed) + (i * (Math.PI * 2 / bookCount));
      const bx = player.x + Math.cos(angle) * orbitalRadius;
      const by = player.y + Math.sin(angle) * orbitalRadius;
      
      createMagicSparkle(particles, bx, by);

      enemies.forEach(e => {
           if (checkCircleCollision(bx, by, bookSize, e.x, e.y, e.width/2)) {
               e.hp -= bookDamage;
               if (e.aiType !== 'BOSS') {
                   const pushAngle = Math.atan2(e.y - player.y, e.x - player.x);
                   e.x += Math.cos(pushAngle) * 2; 
                   e.y += Math.sin(pushAngle) * 2;
               }
               if (Math.random() > 0.85) {
                   e.flashTime = 0.15;
                   createHitEffect(particles, floatingTexts, e.x, e.y, '#a78bfa', bookDamage * 5, true); 
               }
           }
      });
  }
};
