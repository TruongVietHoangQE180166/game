
import { Enemy, Projectile, Particle } from '../types';
import { getDistance, getRandomRange, checkCircleCollision, ScreenShake } from '../utils';
import { createSimpleParticles } from './particles';

interface PlayerRef {
  x: number;
  y: number;
  size: number;
}

interface BossTracker {
    boss1Spawned: boolean;
    boss1DeathTime: number | null;
    boss2Spawned: boolean;
    boss2DeathTime: number | null;
    boss3Spawned: boolean;
    boss3DeathTime: number | null;
    tripleBossSpawned: boolean;
}

const createBoss = (
    type: Enemy['type'], 
    player: {x: number, y: number}, 
    scale: number, 
    angleOffset: number = 0
): Enemy => {
      const angle = Math.random() * Math.PI * 2 + angleOffset;
      const dist = 1100;
      const x = player.x + Math.cos(angle) * dist;
      const y = player.y + Math.sin(angle) * dist;

      // BOSS CONFIGURATION
      let hp = 50000; 
      let size = 120; 
      let color = '#000'; 
      let borderColor = '#ef4444';
      
      // Damage still scales with time to remain threatening, but HP is fixed
      let dmg = 50 * scale; 
      
      let speed = 160; 
      let attackPattern: Enemy['attackPattern'] = 'SLAM';
      
      if (type === 'BOSS_1') { 
        attackPattern = 'MISSILE'; 
        color = '#1f2937';
        hp = 80000; // BUFFED previous turn
        speed = 220; 
      } else if (type === 'BOSS_2') {
        attackPattern = 'BLACK_HOLE';
        color = '#1e1b4b'; 
        borderColor = '#818cf8';
        hp = 150000; // BUFFED previous turn
        speed = 240; 
      } else {
        // BOSS 3 - TANKY BUT SLOW
        attackPattern = 'SPIRAL';
        color = '#450a0a'; 
        borderColor = '#facc15'; 
        hp = 180000; // HP: 180k as requested
        speed = 180; // Slow movement
      }

      return {
        id: Math.random().toString(),
        x, y, width: size, height: size,
        type, aiType: 'BOSS', hp, maxHP: hp, speed, damage: dmg, color, borderColor,
        flashTime: 0,
        attackRange: 0, attackPattern, attackState: 'IDLE', stateTimer: 0,
        burstCount: 0,
        isCharging: false,
        rotationSpeed: 0,
        laserAngle: 0,
        missileTargets: []
      };
}

export const handleEnemySpawning = (
  gameTime: number,
  player: { x: number, y: number },
  bossTracker: BossTracker,
  enemies: Enemy[],
  setActiveBosses: (e: Enemy[]) => void 
) => {
  const newBosses: Enemy[] = [];
  const BOSS_DELAY = 60; // Reduced from 120s to 60s (1 minute)

  // Calculate difficulty multiplier based on time
  const scale = 1 + (gameTime / 60) * 0.6; 

  // === TRIPLE BOSS SPAWN LOGIC ===
  if (
      bossTracker.boss3DeathTime !== null &&
      (gameTime - bossTracker.boss3DeathTime >= BOSS_DELAY) &&
      !bossTracker.tripleBossSpawned
  ) {
      bossTracker.tripleBossSpawned = true;
      
      newBosses.push(createBoss('BOSS_1', player, scale * 1.5, 0));
      newBosses.push(createBoss('BOSS_2', player, scale * 1.5, (Math.PI * 2) / 3));
      newBosses.push(createBoss('BOSS_3', player, scale * 1.5, (Math.PI * 4) / 3));
      
      enemies.push(...newBosses);
      setActiveBosses(newBosses);
      return;
  }

  // === SEQUENTIAL BOSS SPAWN LOGIC ===
  if (gameTime >= 120 && !bossTracker.boss1Spawned) {
      bossTracker.boss1Spawned = true; 
      const b = createBoss('BOSS_1', player, scale);
      enemies.push(b); newBosses.push(b);
  } 
  else if (
      bossTracker.boss1DeathTime !== null && 
      (gameTime - bossTracker.boss1DeathTime >= BOSS_DELAY) && 
      !bossTracker.boss2Spawned
  ) {
      bossTracker.boss2Spawned = true; 
      const b = createBoss('BOSS_2', player, scale);
      enemies.push(b); newBosses.push(b);
  }
  else if (
      bossTracker.boss2DeathTime !== null && 
      (gameTime - bossTracker.boss2DeathTime >= BOSS_DELAY) && 
      !bossTracker.boss3Spawned
  ) {
      bossTracker.boss3Spawned = true; 
      const b = createBoss('BOSS_3', player, scale);
      enemies.push(b); newBosses.push(b);
  }
  
  if (newBosses.length > 0) {
      setActiveBosses(newBosses);
      return; 
  }
  
  // === SPAWN CLUSTERS ===
  // Tăng nhẹ số lượng quái spawn mỗi đợt
  const baseCount = 4 + Math.floor(gameTime / 40); 
  const spawnCount = Math.min(18, baseCount); 
  
  const angle = Math.random() * Math.PI * 2;
  const dist = 1000; 
  const clusterCenterX = player.x + Math.cos(angle) * dist;
  const clusterCenterY = player.y + Math.sin(angle) * dist;

  for (let i = 0; i < spawnCount; i++) {
      const offsetX = getRandomRange(-200, 200);
      const offsetY = getRandomRange(-200, 200);
      const x = clusterCenterX + offsetX;
      const y = clusterCenterY + offsetY;

      let type: Enemy['type'] = 'NORM_1';
      let aiType: Enemy['aiType'] = 'MELEE';
      let hp = 100 * scale; 
      let speed = 140; 
      let dmg = 25 * scale;
      let size = 30;
      let color = '#d1d5db'; 
      let borderColor = '#374151';
      let attackRange = 0;
      let attackPattern: Enemy['attackPattern'] = 'BASIC';
      
      const r = Math.random();

      // PHASE LOGIC (HP NERFED FURTHER)
      if (gameTime < 60) {
          if (r < 0.9) { type = 'NORM_1'; hp = 15 * scale; speed = 120; } 
          else { type = 'NORM_2'; aiType = 'DASHER'; hp = 25 * scale; speed = 100; color='#86efac'; size=28; attackPattern = 'DASH';} 
      } 
      else if (gameTime < 120) {
          if (r < 0.7) { type = 'NORM_1'; hp = 25 * scale; speed=130; } 
          else if (r < 0.9) { type = 'NORM_2'; aiType = 'DASHER'; hp = 40 * scale; speed=120; color='#86efac'; attackPattern = 'DASH'; } 
          else { type = 'EXPLODER'; aiType = 'KAMIKAZE'; hp = 15 * scale; speed = 350; color='#f97316'; size=28; dmg=80*scale; } 
      } 
      else if (gameTime < 180) {
          if (r < 0.5) { type = 'NORM_2'; aiType = 'DASHER'; hp = 50 * scale; speed=130; color='#86efac'; attackPattern = 'DASH'; } 
          else if (r < 0.7) { type = 'EXPLODER'; aiType = 'KAMIKAZE'; hp = 25 * scale; speed=380; color='#f97316'; size=28; dmg=100*scale;} 
          else if (r < 0.9) { type = 'SHOOTER'; aiType = 'RANGED'; hp = 35 * scale; speed = 100; color='#c084fc'; size=35; attackRange = 400; attackPattern = 'SINGLE'; } 
          else { type = 'NORM_1'; hp = 30 * scale; speed=140; } 
      } 
      else if (gameTime < 240) {
          if (r < 0.2) { type = 'EXPLODER'; aiType = 'KAMIKAZE'; hp = 30 * scale; speed=400; color='#f97316'; size=28; dmg=120*scale; } 
          else if (r < 0.4) { type = 'SHOOTER'; aiType = 'RANGED'; hp = 50 * scale; speed=100; color='#c084fc'; size=35; attackRange = 400; attackPattern = 'SINGLE'; } 
          else if (r < 0.6) { type = 'SHOOTER'; aiType = 'RANGED'; hp = 65 * scale; speed = 115; color='#a855f7'; size=38; attackRange = 500; attackPattern = 'BURST'; borderColor = '#f0abfc';} 
          else if (r < 0.8) { type = 'SPLITTER'; aiType = 'SLIME'; hp = 120 * scale; speed = 90; color='#10b981'; size=45; borderColor='#064e3b'; dmg = 30*scale;} 
          else { type = 'NORM_2'; aiType = 'DASHER'; hp = 80 * scale; speed=140; color='#86efac'; attackPattern = 'DASH'; } 
      }
      else {
          if (r < 0.2) { type = 'SPLITTER'; aiType = 'SLIME'; hp = 160 * scale; speed=90; color='#10b981'; size=50; borderColor='#064e3b'; dmg=40*scale; } 
          else if (r < 0.45) { type = 'SHOOTER'; aiType = 'RANGED'; hp = 100 * scale; speed=120; color='#a855f7'; size=38; attackRange = 500; attackPattern = 'BURST'; borderColor = '#f0abfc';} 
          else if (r < 0.65) { type = 'EXPLODER'; aiType = 'KAMIKAZE'; hp = 50 * scale; speed=420; color='#f97316'; size=28; dmg=150*scale; } 
          else if (r < 0.85) { type = 'NORM_2'; aiType = 'DASHER'; hp = 100 * scale; speed=150; color='#86efac'; attackPattern = 'DASH'; } 
          else { type = 'ELITE'; aiType = 'MELEE'; hp = 700 * scale; speed = 115; size=70; color='#dc2626'; borderColor='#fff'; dmg=100*scale; attackPattern = 'STOMP'; } 
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

    // === NORMAL AI TYPES (DASHER, ELITE STOMP) REMAIN SAME ===
    if (e.aiType === 'DASHER') {
        if (e.attackState === 'IDLE') {
            if (dist < 400 && e.stateTimer > 2.0) {
                e.attackState = 'WARN'; e.stateTimer = 0; e.dashTarget = { x: player.x, y: player.y };
            }
        } 
        else if (e.attackState === 'WARN') {
            shouldMove = false;
            if (e.stateTimer > 0.6) {
                e.attackState = 'DASHING'; e.stateTimer = 0;
                const angle = Math.atan2((e.dashTarget?.y || player.y) - e.y, (e.dashTarget?.x || player.x) - e.x);
                e.vx = Math.cos(angle) * (e.speed * 4); e.vy = Math.sin(angle) * (e.speed * 4);
                createSimpleParticles(particles, e.x, e.y, '#fff', 5);
            }
        }
        else if (e.attackState === 'DASHING') {
            shouldMove = false; e.x += (e.vx || 0) * dt; e.y += (e.vy || 0) * dt;
            if (Math.random() > 0.5) particles.push({ id: Math.random().toString(), x: e.x, y: e.y, width: e.width, height: e.height, vx: 0, vy: 0, life: 0.2, maxLife: 0.2, color: 'rgba(134, 239, 172, 0.5)', size: e.width, type: 'SQUARE', drag: 0, growth: -5 });
            if (e.stateTimer > 0.4) { e.attackState = 'COOLDOWN'; e.stateTimer = 0; }
        }
        else if (e.attackState === 'COOLDOWN') {
            moveSpeed *= 0.5; if (e.stateTimer > 1.5) { e.attackState = 'IDLE'; e.stateTimer = 0; }
        }
    }
    else if (e.type === 'ELITE' && e.attackPattern === 'STOMP') {
        if (e.attackState === 'IDLE') {
            if (dist < 200 && e.stateTimer > 3.0) { e.attackState = 'WARN'; e.stateTimer = 0; }
        }
        else if (e.attackState === 'WARN') {
            shouldMove = false;
            if (e.stateTimer > 1.2) { 
                e.attackState = 'FIRING'; e.stateTimer = 0; shakeManager.shake(5);
                particles.push({ id: Math.random().toString(), x: e.x, y: e.y, width:0, height:0, vx:0, vy:0, life:0.4, maxLife:0.4, color: '#dc2626', size: 150, type: 'SHOCKWAVE', drag:0, growth: 100 });
                if (dist < 150) takeDamage(e.damage);
            }
        }
        else if (e.attackState === 'FIRING') {
            shouldMove = false; if (e.stateTimer > 0.5) { e.attackState = 'IDLE'; e.stateTimer = 0; }
        }
    }

    // === BOSS 1: MISSILE RAIN & SLAM (HARD) ===
    if (e.type === 'BOSS_1') {
        if (e.attackState === 'IDLE') {
            // Aggressive: Only 0.6s idle
            if (e.stateTimer > 0.6) {
                e.attackPattern = Math.random() > 0.5 ? 'SLAM' : 'MISSILE';
                e.attackState = 'WARN'; e.stateTimer = 0;
                
                if (e.attackPattern === 'MISSILE') {
                    e.missileTargets = [];
                    // BUFF: Increased missiles from 20 to 30
                    for(let i=0; i<30; i++) {
                        e.missileTargets.push({
                            x: player.x + getRandomRange(-500, 500),
                            y: player.y + getRandomRange(-500, 500)
                        });
                    }
                }
            }
        }
        else if (e.attackState === 'WARN') {
            shouldMove = false;
            // Hyper fast warning: Missile 0.5s, Slam 0.4s
            const warnTime = e.attackPattern === 'MISSILE' ? 0.5 : 0.4; 
            if (e.stateTimer > warnTime) { e.attackState = 'FIRING'; e.stateTimer = 0; }
        }
        else if (e.attackState === 'FIRING') {
            shouldMove = false;
            if (e.attackPattern === 'SLAM') {
                 shakeManager.shake(30); // More shake
                 createSimpleParticles(particles, e.x, e.y, '#ef4444', 60);
                 particles.push({ id: Math.random().toString(), x: e.x, y: e.y, width:0, height:0, vx:0, vy:0, life:0.5, maxLife:0.5, color: '#ef4444', size: 300, type: 'SHOCKWAVE', drag:0, growth: 1200 });
                 if (dist < 350) takeDamage(70); // Increased damage and range
            } 
            else if (e.attackPattern === 'MISSILE') {
                shakeManager.shake(20);
                e.missileTargets?.forEach(t => {
                    createSimpleParticles(particles, t.x, t.y, '#f97316', 20);
                    particles.push({ id: Math.random().toString(), x: t.x, y: t.y, width:0, height:0, vx:0, vy:0, life:0.4, maxLife:0.4, color: '#f97316', size: 80, type: 'SHOCKWAVE', drag:0, growth: 200 });
                    if (getDistance(player.x, player.y, t.x, t.y) < 100) takeDamage(50); // Increased damage
                });
            }
            e.attackState = 'COOLDOWN'; e.stateTimer = 0;
        }
        else if (e.attackState === 'COOLDOWN') {
             // Minimal cooldown: 0.3s
             if (e.stateTimer > 0.3) { e.attackState = 'IDLE'; e.stateTimer = 0; }
        }
    }

    // === BOSS 2: BLACK HOLE & LASER (HARD) ===
    else if (e.type === 'BOSS_2') {
         if (e.attackState === 'IDLE') {
             // Very Aggressive: 0.5s idle
             if (e.stateTimer > 0.5) {
                 e.attackPattern = Math.random() > 0.4 ? 'LASER' : 'BLACK_HOLE';
                 e.attackState = 'WARN'; e.stateTimer = 0;
                 e.secondaryTimer = 0;
             }
         }
         else if (e.attackPattern === 'LASER' && e.attackState === 'WARN') {
            const angle = Math.atan2(player.y - e.y, player.x - e.x);
            e.laserAngle = angle;
            shouldMove = false;
            // Snappy Warning: 0.4s
            if (e.stateTimer > 0.4) { e.attackState = 'CHARGING'; e.stateTimer = 0; }
         }
         else if (e.attackPattern === 'LASER' && e.attackState === 'CHARGING') {
             shouldMove = false;
             // Rapid Charge: 0.25s
             if (e.stateTimer > 0.25) { e.attackState = 'FIRING'; e.stateTimer = 0; shakeManager.shake(10); }
         }
         else if (e.attackPattern === 'LASER' && e.attackState === 'FIRING') {
             const beamLen = 1500;
             const x2 = e.x + Math.cos(e.laserAngle || 0) * beamLen;
             const y2 = e.y + Math.sin(e.laserAngle || 0) * beamLen;
             const A = player.x - e.x; const B = player.y - e.y; const C = x2 - e.x; const D = y2 - e.y;
             const dot = A * C + B * D; const len_sq = C * C + D * D;
             let param = -1; if (len_sq !== 0) param = dot / len_sq;
             let xx, yy; if (param < 0) { xx = e.x; yy = e.y; } else if (param > 1) { xx = x2; yy = y2; } else { xx = e.x + param * C; yy = e.y + param * D; }
             const distToLine = Math.sqrt(Math.pow(player.x - xx, 2) + Math.pow(player.y - yy, 2));
             if (distToLine < 50) { takeDamage(5); } // Increased DPS

             shouldMove = false;
             // Laser duration 1.5s
             if (e.stateTimer > 1.5) { e.attackState = 'COOLDOWN'; e.stateTimer = 0; }
         }
         else if (e.attackPattern === 'BLACK_HOLE' && e.attackState === 'WARN') {
             shouldMove = false;
             // Snappy Warning: 0.4s
             if (e.stateTimer > 0.4) { e.attackState = 'PULLING'; e.stateTimer = 0; }
         }
         else if (e.attackPattern === 'BLACK_HOLE' && e.attackState === 'PULLING') {
             shouldMove = false;
             if (Math.random() > 0.5) {
                 particles.push({
                     id: Math.random().toString(), x: player.x + getRandomRange(-50, 50), y: player.y + getRandomRange(-50, 50),
                     width:0, height:0, vx: (e.x - player.x) * 2, vy: (e.y - player.y) * 2,
                     life: 0.5, maxLife: 0.5, color: '#4f46e5', size: 3, type: 'DOT', drag: 0, growth: 0
                 });
             }
             if (e.stateTimer > 3.5) { e.attackState = 'COOLDOWN'; e.stateTimer = 0; }
         }
         else if (e.attackState === 'COOLDOWN') {
             // Quick cooldown 0.4s
             if (e.stateTimer > 0.4) { e.attackState = 'IDLE'; e.stateTimer = 0; }
         }
    }

    // === BOSS 3: HIGH HP, EASY SKILLS ===
    else if (e.type === 'BOSS_3') {
        // High HP Sponge, but moves attacks slower
        if (e.attackState === 'IDLE' && e.stateTimer > 1.2) { // Relaxed Idle
             const r = Math.random();
             if (r < 0.33) e.attackPattern = 'SPIRAL';
             else if (r < 0.66) e.attackPattern = 'GRID';
             else e.attackPattern = 'DASH'; 
             
             e.attackState = 'WARN'; e.stateTimer = 0;
             e.secondaryTimer = 0;
             e.burstCount = 3; 
        }

        // 1. SPIRAL NOVA (EASY DODGE)
        if (e.attackPattern === 'SPIRAL') {
            shouldMove = false;
            if (e.attackState === 'WARN') {
                 // Long Warning: 1.0s
                 if (e.stateTimer > 1.0) { e.attackState = 'FIRING'; e.stateTimer = 0; }
            }
            else if (e.attackState === 'FIRING') {
                e.rotationSpeed = (e.rotationSpeed || 0) + dt * 0.15; // Slower spin up
                e.laserAngle = (e.laserAngle || 0) + 2.0 * dt; // Slower rotation
                e.secondaryTimer = (e.secondaryTimer || 0) + dt;
                
                // Very Slow Fire Rate: 0.08s
                if (e.secondaryTimer > 0.08) { 
                    const arms = 6; 
                    for(let i=0; i<arms; i++) {
                       const angle = (e.laserAngle || 0) + (Math.PI * 2 / arms) * i;
                       projectiles.push({
                            id: Math.random().toString(), x: e.x, y: e.y, width: 20, height: 20,
                            vx: Math.cos(angle) * 400, vy: Math.sin(angle) * 400, // Very Slow Bullets (400)
                            damage: e.damage, life: 6, rotation: angle, type: 'ENEMY_BULLET', pierce: 0, color: '#facc15'
                        });
                    }
                    e.secondaryTimer = 0;
                }
                if (e.stateTimer > 3.0) { e.attackState = 'COOLDOWN'; e.stateTimer = 0; }
            }
        }
        
        // 2. DEATH GRID (EASY MODE)
        else if (e.attackPattern === 'GRID') {
            shouldMove = false;
            if (e.attackState === 'WARN') {
                 // Very Long Warning: 1.2s
                 if (e.stateTimer > 1.2) { e.attackState = 'FIRING'; e.stateTimer = 0; }
            }
            else if (e.attackState === 'FIRING') {
                e.secondaryTimer = (e.secondaryTimer || 0) + dt;
                // Slow Grid Spawn: 0.5s
                if (e.secondaryTimer > 0.5) { 
                    const isHorizontal = Math.random() > 0.5;
                    const offset = getRandomRange(-500, 500);
                    const px = isHorizontal ? player.x + offset : player.x;
                    const py = isHorizontal ? player.y : player.y + offset;
                    
                    particles.push({
                         id: Math.random().toString(), x: px, y: py, width:0, height:0,
                         vx:0, vy:0, life:1.5, maxLife:1.5, color: 'rgba(239, 68, 68, 0.5)', size: isHorizontal ? 4 : 2000, 
                         type: 'DOT', drag:0, growth:0 
                    });
                    
                    const count = 14; // Reduced Density (14 bullets)
                    for(let k=0; k<count; k++) {
                         projectiles.push({
                            id: Math.random().toString(), 
                            x: isHorizontal ? player.x - 700 + k*100 : px, // Wide gaps
                            y: isHorizontal ? py : player.y - 700 + k*100,
                            width: 25, height: 25,
                            vx: isHorizontal ? 0 : (Math.random() > 0.5 ? 280 : -280), // Slow speed 280
                            vy: isHorizontal ? (Math.random() > 0.5 ? 280 : -280) : 0,
                            damage: e.damage, life: 6, rotation: 0, type: 'ENEMY_BULLET', pierce: 0, color: '#ef4444'
                         });
                    }
                    e.secondaryTimer = 0;
                }
                if (e.stateTimer > 3.0) { e.attackState = 'COOLDOWN'; e.stateTimer = 0; }
            }
        }

        // 3. EXECUTION DASH (TELEGRAPHED)
        else if (e.attackPattern === 'DASH') {
             shouldMove = false;
             
             if (e.attackState === 'WARN') {
                  if (e.stateTimer === 0 || !e.dashTarget) {
                      e.dashTarget = { x: player.x, y: player.y };
                  }
                  // Long Telegraph: 1.0s
                  if (e.stateTimer > 1.0) { 
                      e.attackState = 'DASHING'; e.stateTimer = 0; 
                      shakeManager.shake(15);
                      const angle = Math.atan2(e.dashTarget.y - e.y, e.dashTarget.x - e.x);
                      e.vx = Math.cos(angle) * 900; // Slower Dash (900)
                      e.vy = Math.sin(angle) * 900;
                  }
             }
             else if (e.attackState === 'DASHING') {
                 e.x += (e.vx || 0) * dt;
                 e.y += (e.vy || 0) * dt;
                 
                 if (Math.random() > 0.2) {
                     particles.push({ id: Math.random().toString(), x: e.x, y: e.y, width: e.width, height: e.height, vx: 0, vy: 0, life: 0.3, maxLife: 0.3, color: 'rgba(220, 38, 38, 0.4)', size: e.width, type: 'SQUARE', drag: 0, growth: -5 });
                 }
                 
                 if (e.stateTimer > 0.3) { 
                     e.burstCount = (e.burstCount || 1) - 1;
                     e.vx = 0; e.vy = 0;
                     if (e.burstCount > 0) {
                         e.attackState = 'WARN'; e.stateTimer = 0; e.dashTarget = undefined; 
                     } else {
                         e.attackState = 'COOLDOWN'; e.stateTimer = 0;
                     }
                 }
             }
        }

        if (e.attackState === 'COOLDOWN') {
            // Generous Cooldown: 1.0s
            if (e.stateTimer > 1.0) { e.attackState = 'IDLE'; e.stateTimer = 0; }
        }
    }


    // === SHOOTER LOGIC (SINGLE & BURST) ===
    // NORMAL SHOOTER (Single Shot)
    if (e.attackPattern === 'SINGLE' && dist < (e.attackRange || 400)) {
        if (e.attackState !== 'FIRING') {
            if (e.stateTimer > 2.0) {
                e.attackState = 'FIRING'; e.stateTimer = 0;
                // Fire one bullet
                const angle = Math.atan2(player.y - e.y, player.x - e.x);
                projectiles.push({
                    id: Math.random().toString(), x: e.x, y: e.y, width: 16, height: 16,
                    vx: Math.cos(angle) * 350, vy: Math.sin(angle) * 350,
                    damage: e.damage, life: 3, rotation: angle, type: 'ENEMY_BULLET', pierce: 0, color: '#c084fc'
                });
            }
        } else {
            // Quick cooldown for visual consistency
            if (e.stateTimer > 0.3) { e.attackState = 'IDLE'; e.stateTimer = 0; }
        }
    }

    // ELITE SHOOTER (Burst 3 shots)
    if (e.attackPattern === 'BURST' && dist < (e.attackRange || 500)) {
        if (e.attackState !== 'FIRING') {
            if (e.stateTimer > 2.0) {
                e.attackState = 'FIRING'; e.burstCount = 1; e.stateTimer = 0; e.secondaryTimer = 0;
            }
        } else {
            e.secondaryTimer = (e.secondaryTimer || 0) + dt;
            if (e.secondaryTimer > 0.1) { 
                 const baseAngle = Math.atan2(player.y - e.y, player.x - e.x);
                 for(let i=-1; i<=1; i++) {
                    const finalAngle = baseAngle + (i * 0.2); 
                    projectiles.push({
                        id: Math.random().toString(), x: e.x, y: e.y, width: 16, height: 16,
                        vx: Math.cos(finalAngle) * 400, vy: Math.sin(finalAngle) * 400,
                        damage: e.damage, life: 3, rotation: finalAngle, type: 'ENEMY_BULLET', pierce: 0, color: '#a855f7'
                    });
                 }
                 e.burstCount = (e.burstCount || 0) - 1; e.secondaryTimer = 0;
                 if (e.burstCount <= 0) { e.attackState = 'IDLE'; e.stateTimer = 0; }
            }
        }
    }

    // --- MOVEMENT ---
    if (shouldMove) {
        if (e.aiType === 'RANGED' || (e.aiType === 'BOSS' && e.type === 'BOSS_2')) {
             if (dist > (e.attackRange || 300)) {
                 const angle = Math.atan2(player.y - e.y, player.x - e.x);
                 e.x += Math.cos(angle) * moveSpeed * dt; e.y += Math.sin(angle) * moveSpeed * dt;
             } else if (dist < 200) { 
                 const angle = Math.atan2(player.y - e.y, player.x - e.x);
                 e.x -= Math.cos(angle) * moveSpeed * dt; e.y -= Math.sin(angle) * moveSpeed * dt;
             }
        } 
        else if (e.aiType === 'KAMIKAZE') {
            if (dist < 100 && !e.isCharging) { e.isCharging = true; e.attackTimer = 0; }
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
               e.x += Math.cos(angle) * moveSpeed * dt; e.y += Math.sin(angle) * moveSpeed * dt;
            }
        }
        else {
            const angle = Math.atan2(player.y - e.y, player.x - e.x);
            e.x += Math.cos(angle) * moveSpeed * dt; e.y += Math.sin(angle) * moveSpeed * dt;
        }
    }

    // Basic Collision
    if (e.flashTime > 0) e.flashTime -= dt;
    if (e.aiType !== 'KAMIKAZE' && iFrameTime <= 0 && checkCircleCollision(player.x, player.y, player.size/2, e.x, e.y, e.width/2)) {
       takeDamage(e.damage);
    }
  });
};
