
import { Enemy, Projectile, Particle } from '../types';
import { getDistance, getRandomRange, checkCircleCollision, ScreenShake } from '../utils';
import { createSimpleParticles } from './particles';

interface PlayerRef {
  x: number;
  y: number;
  size: number;
}

export const handleEnemySpawning = (
  gameTime: number,
  player: { x: number, y: number },
  bossFlags: { boss1: boolean, boss2: boolean, boss3: boolean },
  enemies: Enemy[],
  setActiveBoss: (e: Enemy | null) => void
) => {
  let bossType: Enemy['type'] | null = null;
  
  // Boss Spawning Times: 3m, 6m, 9m
  if (gameTime > 180 && !bossFlags.boss1) { 
      bossFlags.boss1 = true; bossType = 'BOSS_1';
  } 
  else if (gameTime > 360 && !bossFlags.boss2) { 
      bossFlags.boss2 = true; bossType = 'BOSS_2';
  }
  else if (gameTime > 540 && !bossFlags.boss3) { 
      bossFlags.boss3 = true; bossType = 'BOSS_3';
  }

  // Calculate difficulty multiplier
  const scale = 1 + (gameTime / 60) * 0.8; 
  
  // Spawn Boss Logic
  if (bossType) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 1100;
      const x = player.x + Math.cos(angle) * dist;
      const y = player.y + Math.sin(angle) * dist;

      let type: Enemy['type'] = bossType;
      let hp = 8000 * scale; 
      let size = 120; 
      let color = '#000'; 
      let borderColor = '#ef4444';
      let dmg = 80 * scale; 
      let speed = 90;
      let attackPattern: Enemy['attackPattern'] = 'SLAM';
      
      if (bossType === 'BOSS_1') { 
        attackPattern = 'SLAM'; 
      } else if (bossType === 'BOSS_2') {
        attackPattern = 'LASER';
        color = '#1e1b4b'; 
        borderColor = '#818cf8';
      } else {
        attackPattern = 'SPIRAL';
        color = '#450a0a';
        borderColor = '#facc15';
      }

      const newBoss: Enemy = {
        id: Math.random().toString(),
        x, y, width: size, height: size,
        type, aiType: 'BOSS', hp, maxHP: hp, speed, damage: dmg, color, borderColor,
        flashTime: 0,
        attackRange: 0, attackPattern, attackState: 'IDLE', stateTimer: 0,
        burstCount: 0,
        isCharging: false,
        rotationSpeed: 0,
        laserAngle: 0
      };
      enemies.push(newBoss);
      setActiveBoss(newBoss);
      return; // Boss spawned, skip normal wave for this frame
  }

  // === SPAWN CLUSTERS (Normal Enemies) ===
  // Instead of spawning 1, we spawn a group based on gameTime
  // Base spawn count increases with time
  const baseCount = 1 + Math.floor(gameTime / 45); 
  const spawnCount = Math.min(10, baseCount); // Cap cluster size to 10
  
  // Determine spawn location (Random point around player)
  const angle = Math.random() * Math.PI * 2;
  const dist = 1000; // Just off screen
  const clusterCenterX = player.x + Math.cos(angle) * dist;
  const clusterCenterY = player.y + Math.sin(angle) * dist;

  for (let i = 0; i < spawnCount; i++) {
      const offsetX = getRandomRange(-150, 150);
      const offsetY = getRandomRange(-150, 150);
      const x = clusterCenterX + offsetX;
      const y = clusterCenterY + offsetY;

      let type: Enemy['type'] = 'NORM_1';
      let aiType: Enemy['aiType'] = 'MELEE';
      let hp = 30 * scale; 
      let speed = 140; 
      let dmg = 15 * scale; 
      let size = 30;
      let color = '#d1d5db'; 
      let borderColor = '#374151';
      let attackRange = 0;
      let attackPattern: Enemy['attackPattern'] = 'BASIC';
      
      const r = Math.random();

      if (gameTime < 60) {
          if (r < 0.7) { type = 'NORM_1'; hp=40*scale; speed=130; } 
          else { 
            // NORM_2 is now a DASHER
            type = 'NORM_2'; aiType = 'DASHER'; hp=50*scale; speed=100; color='#86efac'; size=28; 
            attackPattern = 'DASH';
          }
      } else if (gameTime < 180) {
          if (r < 0.4) { type = 'NORM_2'; aiType = 'DASHER'; hp=70*scale; speed=120; color='#86efac'; attackPattern = 'DASH'; }
          else if (r < 0.8) { 
              type = 'SHOOTER'; aiType = 'RANGED'; hp=60*scale; speed=100; color='#a855f7'; size=35; 
              attackRange = 450; attackPattern = 'BURST'; 
          }
          else { type = 'EXPLODER'; aiType = 'KAMIKAZE'; hp=40*scale; speed=320; color='#f97316'; size=28; dmg=80*scale; }
      } else {
          // Harder enemies later
          if (r < 0.3) { type = 'NORM_2'; aiType = 'DASHER'; hp=100*scale; speed=130; color='#86efac'; attackPattern = 'DASH'; }
          else if (r < 0.6) { 
            type = 'SHOOTER'; aiType = 'RANGED'; hp=120*scale; speed=110; color='#a855f7'; size=35; 
            attackRange = 500; attackPattern = 'BURST'; // Shooters act as shotguns now
          }
          else if (r < 0.8) { type = 'EXPLODER'; aiType = 'KAMIKAZE'; hp=90*scale; speed=380; color='#f97316'; size=28; dmg=120*scale; }
          else { 
            type = 'ELITE'; aiType = 'MELEE'; hp=600*scale; speed=100; size=60; color='#dc2626'; borderColor='#fff'; dmg=50*scale; 
            attackPattern = 'STOMP'; // Elite has Stomp
          }
      }

      enemies.push({
        id: Math.random().toString(),
        x, y, width: size, height: size,
        type, aiType, hp, maxHP: hp, speed, damage: dmg, color, borderColor,
        flashTime: 0,
        attackRange, attackPattern, attackState: 'IDLE', stateTimer: 0,
        burstCount: 0,
        isCharging: false,
        rotationSpeed: 0,
        laserAngle: 0
      });
  }
};

export const updateEnemies = (
  dt: number,
  gameTime: number,
  player: PlayerRef,
  enemies: Enemy[],
  projectiles: Projectile[],
  particles: Particle[],
  shakeManager: ScreenShake,
  takeDamage: (amount: number) => void,
  iFrameTime: number
) => {
  enemies.forEach(e => {
    const dist = getDistance(player.x, player.y, e.x, e.y);
    let moveSpeed = e.speed;
    let shouldMove = true;
    
    e.stateTimer = (e.stateTimer || 0) + dt;

    // === NEW AI TYPES ===

    // 1. DASHER AI (Lurks then Dashes)
    if (e.aiType === 'DASHER') {
        if (e.attackState === 'IDLE') {
            if (dist < 400 && e.stateTimer > 2.0) {
                e.attackState = 'WARN';
                e.stateTimer = 0;
                // Aim at player
                e.dashTarget = { x: player.x, y: player.y };
            }
        } 
        else if (e.attackState === 'WARN') {
            shouldMove = false;
            // Telegraphing (handled in renderer)
            if (e.stateTimer > 0.6) {
                e.attackState = 'DASHING';
                e.stateTimer = 0;
                // Calculate dash velocity
                const angle = Math.atan2((e.dashTarget?.y || player.y) - e.y, (e.dashTarget?.x || player.x) - e.x);
                e.vx = Math.cos(angle) * (e.speed * 4); // 4x Speed Dash
                e.vy = Math.sin(angle) * (e.speed * 4);
                
                // Dust particles
                createSimpleParticles(particles, e.x, e.y, '#fff', 5);
            }
        }
        else if (e.attackState === 'DASHING') {
            shouldMove = false;
            // Apply velocity
            e.x += (e.vx || 0) * dt;
            e.y += (e.vy || 0) * dt;
            
            // Trail effect
            if (Math.random() > 0.5) {
                particles.push({
                    id: Math.random().toString(), x: e.x, y: e.y, width: e.width, height: e.height,
                    vx: 0, vy: 0, life: 0.2, maxLife: 0.2, color: 'rgba(134, 239, 172, 0.5)', size: e.width, type: 'SQUARE', drag: 0, growth: -5, rotation: e.rotation
                });
            }

            // Stop after duration or if hit player
            if (e.stateTimer > 0.4) {
                e.attackState = 'COOLDOWN';
                e.stateTimer = 0;
            }
        }
        else if (e.attackState === 'COOLDOWN') {
            moveSpeed *= 0.5; // Slow after dash
            if (e.stateTimer > 1.5) {
                e.attackState = 'IDLE';
                e.stateTimer = 0;
            }
        }
    }

    // 2. ELITE STOMP AI
    else if (e.type === 'ELITE' && e.attackPattern === 'STOMP') {
        if (e.attackState === 'IDLE') {
            if (dist < 200 && e.stateTimer > 3.0) {
                e.attackState = 'WARN';
                e.stateTimer = 0;
            }
        }
        else if (e.attackState === 'WARN') {
            shouldMove = false;
            if (e.stateTimer > 1.0) {
                e.attackState = 'FIRING';
                e.stateTimer = 0;
                // STOMP
                shakeManager.shake(5);
                particles.push({
                    id: Math.random().toString(), x: e.x, y: e.y, width:0, height:0,
                    vx:0, vy:0, life:0.4, maxLife:0.4, color: '#dc2626', size: 150, type: 'SHOCKWAVE', drag:0, growth: 100
                });
                if (dist < 150) {
                    takeDamage(e.damage);
                    // Push player slightly (simplified as we don't have player velocity access directly here, 
                    // but visual shake implies it)
                }
            }
        }
        else if (e.attackState === 'FIRING') {
            shouldMove = false;
            if (e.stateTimer > 0.5) {
                e.attackState = 'IDLE';
                e.stateTimer = 0;
            }
        }
    }
    
    // === BOSS & RANGED LOGIC ===

    // BOSS 1: SLAM
    else if (e.attackPattern === 'SLAM') {
        if (e.attackState === 'IDLE' || !e.attackState) {
            if (e.stateTimer > 4) { 
                e.attackState = 'WARN'; e.stateTimer = 0;
            }
        } 
        else if (e.attackState === 'WARN') {
            shouldMove = false;
            if (e.stateTimer > 1.5) { 
                e.attackState = 'FIRING'; e.stateTimer = 0;
            }
        }
        else if (e.attackState === 'FIRING') {
            shouldMove = false;
            shakeManager.shake(20);
            createSimpleParticles(particles, e.x, e.y, '#ef4444', 50);
            particles.push({
               id: Math.random().toString(), x: e.x, y: e.y, width:0, height:0,
               vx:0, vy:0, life:0.5, maxLife:0.5, color: '#ef4444', size: 300, type: 'SHOCKWAVE', drag:0, growth: 1000
            });
            if (dist < 300) takeDamage(40);
            e.attackState = 'COOLDOWN'; e.stateTimer = 0;
        }
        else if (e.attackState === 'COOLDOWN') {
            if (e.stateTimer > 1.0) { e.attackState = 'IDLE'; e.stateTimer = 0; }
        }
    }
    
    // BOSS 2: LASER (UNCHANGED)
    else if (e.attackPattern === 'LASER') {
        // IDLE -> WARN (Tracking) -> CHARGING (Lock) -> FIRING -> COOLDOWN
        if (e.attackState === 'IDLE' || !e.attackState) {
            if (e.stateTimer > 3) {
                e.attackState = 'WARN';
                e.stateTimer = 0;
                e.secondaryTimer = 0; 
            }
        }
        else if (e.attackState === 'WARN') {
           const angle = Math.atan2(player.y - e.y, player.x - e.x);
           e.laserAngle = angle;
           shouldMove = false;
           if (e.stateTimer > 1.5) {
               e.attackState = 'CHARGING';
               e.stateTimer = 0;
           }
        }
        else if (e.attackState === 'CHARGING') {
            shouldMove = false;
            if (Math.random() > 0.5) {
               const lx = e.x + Math.cos(e.laserAngle || 0) * getRandomRange(0, 800);
               const ly = e.y + Math.sin(e.laserAngle || 0) * getRandomRange(0, 800);
               particles.push({
                   id: Math.random().toString(), x: lx, y: ly, width:0, height:0,
                   vx: (e.x - lx) * 2, vy: (e.y - ly) * 2,
                   life: 0.5, maxLife: 0.5, color: '#818cf8', size: 4, type: 'DOT', drag: 0, growth: 0
               });
            }
            if (e.stateTimer > 0.8) {
                e.attackState = 'FIRING';
                e.stateTimer = 0;
                shakeManager.shake(10);
            }
        }
        else if (e.attackState === 'FIRING') {
            shouldMove = false;
            const beamLen = 1500;
            const x2 = e.x + Math.cos(e.laserAngle || 0) * beamLen;
            const y2 = e.y + Math.sin(e.laserAngle || 0) * beamLen;
            
            const A = player.x - e.x;
            const B = player.y - e.y;
            const C = x2 - e.x;
            const D = y2 - e.y;
            
            const dot = A * C + B * D;
            const len_sq = C * C + D * D;
            let param = -1;
            if (len_sq !== 0) param = dot / len_sq;
            
            let xx, yy;
            if (param < 0) { xx = e.x; yy = e.y; }
            else if (param > 1) { xx = x2; yy = y2; }
            else { xx = e.x + param * C; yy = e.y + param * D; }
            
            const distToLine = Math.sqrt(Math.pow(player.x - xx, 2) + Math.pow(player.y - yy, 2));
            
            if (distToLine < 40) { takeDamage(2); }

            if (e.stateTimer > 2.0) {
                e.attackState = 'COOLDOWN';
                e.stateTimer = 0;
            }
        }
        else if (e.attackState === 'COOLDOWN') {
            if (e.stateTimer > 2.0) { e.attackState = 'IDLE'; e.stateTimer = 0; }
        }
    }

    // BOSS 3: SPIRAL (UNCHANGED)
    else if (e.attackPattern === 'SPIRAL') {
        shouldMove = false;
        e.rotationSpeed = (e.rotationSpeed || 0) + dt * 0.1; 
        e.laserAngle = (e.laserAngle || 0) + 1.5 * dt; 
        
        e.secondaryTimer = (e.secondaryTimer || 0) + dt;
        if (e.secondaryTimer > 0.1) { 
            const arms = 4;
            for(let i=0; i<arms; i++) {
               const angle = (e.laserAngle || 0) + (Math.PI * 2 / arms) * i;
               projectiles.push({
                    id: Math.random().toString(), x: e.x, y: e.y, width: 20, height: 20,
                    vx: Math.cos(angle) * 300, vy: Math.sin(angle) * 300,
                    damage: e.damage, life: 5, rotation: angle, type: 'ENEMY_BULLET', pierce: 0,
                    color: '#facc15'
                });
            }
            e.secondaryTimer = 0;
        }
    }

    // SHOOTER / SPREAD LOGIC (Updated to Spread)
    if (e.attackPattern === 'BURST' && dist < (e.attackRange || 500)) {
        if (e.attackState !== 'FIRING') {
            if (e.stateTimer > 2.0) {
                e.attackState = 'FIRING';
                e.burstCount = 1; // 1 burst of spread shots
                e.stateTimer = 0;
                e.secondaryTimer = 0;
            }
        } else {
            e.secondaryTimer = (e.secondaryTimer || 0) + dt;
            if (e.secondaryTimer > 0.1) { 
                 const baseAngle = Math.atan2(player.y - e.y, player.x - e.x);
                 // Fire 3 spread bullets
                 for(let i=-1; i<=1; i++) {
                    const finalAngle = baseAngle + (i * 0.2); // 0.2 radians spread
                    projectiles.push({
                        id: Math.random().toString(), x: e.x, y: e.y, width: 16, height: 16,
                        vx: Math.cos(finalAngle) * 400, vy: Math.sin(finalAngle) * 400,
                        damage: e.damage, life: 3, rotation: finalAngle, type: 'ENEMY_BULLET', pierce: 0,
                        color: '#a855f7'
                    });
                 }
                 
                 e.burstCount = (e.burstCount || 0) - 1;
                 e.secondaryTimer = 0;
                 if (e.burstCount <= 0) {
                     e.attackState = 'IDLE';
                     e.stateTimer = 0;
                 }
            }
        }
    }

    // --- MOVEMENT ---
    if (shouldMove) {
        if (e.aiType === 'RANGED' || (e.aiType === 'BOSS' && e.type === 'BOSS_2')) {
             if (dist > (e.attackRange || 300)) {
                 const angle = Math.atan2(player.y - e.y, player.x - e.x);
                 e.x += Math.cos(angle) * moveSpeed * dt;
                 e.y += Math.sin(angle) * moveSpeed * dt;
             } else if (dist < 200) { // Kite away if too close
                 const angle = Math.atan2(player.y - e.y, player.x - e.x);
                 e.x -= Math.cos(angle) * moveSpeed * dt;
                 e.y -= Math.sin(angle) * moveSpeed * dt;
             }
        } 
        else if (e.aiType === 'KAMIKAZE') {
            if (dist < 100 && !e.isCharging) {
               e.isCharging = true;
               e.attackTimer = 0;
            }
            if (e.isCharging) {
               e.attackTimer = (e.attackTimer || 0) + dt;
               e.color = Math.floor(gameTime * 20) % 2 === 0 ? '#fff' : '#ef4444';
               if ((e.attackTimer || 0) > 1.0) {
                   createSimpleParticles(particles, e.x, e.y, '#ef4444', 30);
                   shakeManager.shake(10);
                   if (dist < 150) takeDamage(e.damage);
                   e.hp = 0; 
               }
            } else {
               const angle = Math.atan2(player.y - e.y, player.x - e.x);
               e.x += Math.cos(angle) * moveSpeed * dt;
               e.y += Math.sin(angle) * moveSpeed * dt;
            }
        }
        else {
            const angle = Math.atan2(player.y - e.y, player.x - e.x);
            e.x += Math.cos(angle) * moveSpeed * dt;
            e.y += Math.sin(angle) * moveSpeed * dt;
        }
    }

    // Basic Collision
    if (e.flashTime > 0) e.flashTime -= dt;
    if (e.aiType !== 'KAMIKAZE' && iFrameTime <= 0 && checkCircleCollision(player.x, player.y, player.size/2, e.x, e.y, e.width/2)) {
       takeDamage(e.damage);
    }
  });
};
