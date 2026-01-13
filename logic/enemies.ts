
import { Enemy, Projectile, Particle } from '../types';
import { getDistance, getRandomRange, checkCircleCollision, ScreenShake } from '../utils';
import { createSimpleParticles, createExplosionParticles } from './particles';

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
      // UPDATED: Damage is now fixed per Tier, NOT scaled by time to prevent one-shots
      let hp = 55000; 
      let size = 300; 
      let color = '#000'; 
      let borderColor = '#ef4444';
      
      let dmg = 50; // Default base
      
      let speed = 160; 
      let attackPattern: Enemy['attackPattern'] = 'SLAM';
      let attackRange = 0; // Default fallback for movement logic

      if (type === 'BOSS_1') { 
        attackPattern = 'MISSILE'; 
        color = '#1f2937';
        hp = 100000; // Increased from 55000
        speed = 280;
        dmg = 80; // Fixed Damage Tier 1
        attackRange = 400;
      } else if (type === 'BOSS_2') {
        attackPattern = 'BLACK_HOLE';
        color = '#1e1b4b'; 
        borderColor = '#818cf8';
        hp = 200000; // Increased from 125000
        speed = 280; // Slightly reduced base speed as it moves while attacking now
        dmg = 110; // Fixed Damage Tier 2
        attackRange = 100; // Aggressive chase
      } else {
        // BOSS 3
        attackPattern = 'SPIRAL';
        color = '#450a0a'; 
        borderColor = '#facc15'; 
        hp = 350000; // Increased from 220000
        speed = 260;
        dmg = 140; // Fixed Damage Tier 3
        attackRange = 500;
      }

      // Slightly increase damage only for the Triple Boss phase (Endless challenge)
      if (scale > 5.0) {
          dmg *= 1.2;
      }

      return {
        id: Math.random().toString(),
        x, y, width: size, height: size,
        type, aiType: 'BOSS', hp, maxHP: hp, speed, damage: dmg, color, borderColor,
        flashTime: 0,
        attackRange, attackPattern, attackState: 'IDLE', stateTimer: 0,
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
  const BOSS_DELAY = 60; 

  // Calculate difficulty multiplier based on time
  const scale = 1 + (gameTime / 60) * 0.7; 

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

  // === STOP SPAWNING IF BOSS IS ALIVE ===
  if (enemies.some(e => e.aiType === 'BOSS')) {
      return;
  }
  
  // === SPAWN CLUSTERS (REDUCED COUNT) ===
  const baseCount = 3 + Math.floor(gameTime / 20); 
  const spawnCount = Math.min(12, baseCount); 
  
  const angle = Math.random() * Math.PI * 2;
  const dist = 1000; 
  const clusterCenterX = player.x + Math.cos(angle) * dist;
  const clusterCenterY = player.y + Math.sin(angle) * dist;

  for (let i = 0; i < spawnCount; i++) {
      const offsetX = getRandomRange(-300, 300); 
      const offsetY = getRandomRange(-300, 300);
      const x = clusterCenterX + offsetX;
      const y = clusterCenterY + offsetY;

      let type: Enemy['type'] = 'NORM_1';
      let aiType: Enemy['aiType'] = 'MELEE';
      
      // HP Buffed ~3.5x - 4.0x for Normal Mobs -> Increased base to 400
      let hp = 400 * scale; 
      let speed = 140; 
      let dmg = 25 * scale;
      let size = 72; 
      let color = '#d1d5db'; 
      let borderColor = '#374151';
      let attackRange = 0;
      let attackPattern: Enemy['attackPattern'] = 'BASIC';
      
      const r = Math.random();

      // PHASE LOGIC (HP Values increased by ~15-20% compared to previous version)
      if (gameTime < 60) {
          if (r < 0.9) { type = 'NORM_1'; hp = 120 * scale; speed = 120; size = 72; } 
          else { type = 'NORM_2'; aiType = 'DASHER'; hp = 180 * scale; speed = 110; color='#86efac'; size=68; attackPattern = 'DASH';} 
      } 
      else if (gameTime < 120) {
          if (r < 0.7) { type = 'NORM_1'; hp = 180 * scale; speed=135; size = 72; } 
          else if (r < 0.9) { type = 'NORM_2'; aiType = 'DASHER'; hp = 260 * scale; speed=125; color='#86efac'; size=68; attackPattern = 'DASH'; } 
          else { type = 'EXPLODER'; aiType = 'KAMIKAZE'; hp = 110 * scale; speed = 360; color='#f97316'; size=62; dmg=80*scale; } 
      } 
      else if (gameTime < 180) {
          if (r < 0.5) { type = 'NORM_2'; aiType = 'DASHER'; hp = 350 * scale; speed=135; color='#86efac'; size=68; attackPattern = 'DASH'; } 
          else if (r < 0.7) { type = 'EXPLODER'; aiType = 'KAMIKAZE'; hp = 180 * scale; speed=390; color='#f97316'; size=62; dmg=100*scale;} 
          else if (r < 0.9) { type = 'SHOOTER'; aiType = 'RANGED'; hp = 240 * scale; speed = 110; color='#c084fc'; size=78; attackRange = 400; attackPattern = 'SINGLE'; } 
          else { type = 'NORM_1'; hp = 220 * scale; speed=145; size=72; } 
      } 
      else if (gameTime < 240) {
          if (r < 0.2) { type = 'EXPLODER'; aiType = 'KAMIKAZE'; hp = 220 * scale; speed=410; color='#f97316'; size=62; dmg=120*scale; } 
          else if (r < 0.4) { type = 'SHOOTER'; aiType = 'RANGED'; hp = 300 * scale; speed=110; color='#c084fc'; size=78; attackRange = 400; attackPattern = 'SINGLE'; } 
          // UPDATED: Elite Shooter instead of normal shooter
          else if (r < 0.6) { type = 'ELITE_SHOOTER'; aiType = 'RANGED'; hp = 450 * scale; speed = 125; color='#f97316'; size=82; attackRange = 550; attackPattern = 'BURST'; borderColor = '#ea580c';} 
          else if (r < 0.8) { type = 'SPLITTER'; aiType = 'SLIME'; hp = 700 * scale; speed = 95; color='#10b981'; size=115; borderColor='#064e3b'; dmg = 30*scale;} 
          else { type = 'NORM_2'; aiType = 'DASHER'; hp = 450 * scale; speed=145; color='#86efac'; size=68; attackPattern = 'DASH'; } 
      }
      else {
          if (r < 0.2) { type = 'SPLITTER'; aiType = 'SLIME'; hp = 950 * scale; speed=95; color='#10b981'; size=120; borderColor='#064e3b'; dmg=40*scale; } 
          // UPDATED: Elite Shooter
          else if (r < 0.45) { type = 'ELITE_SHOOTER'; aiType = 'RANGED'; hp = 650 * scale; speed=125; color='#f97316'; size=85; attackRange = 550; attackPattern = 'BURST'; borderColor = '#ea580c';} 
          else if (r < 0.65) { type = 'EXPLODER'; aiType = 'KAMIKAZE'; hp = 300 * scale; speed=430; color='#f97316'; size=62; dmg=150*scale; } 
          else if (r < 0.85) { type = 'NORM_2'; aiType = 'DASHER'; hp = 550 * scale; speed=155; color='#86efac'; size=68; attackPattern = 'DASH'; } 
          else { type = 'ELITE'; aiType = 'MELEE'; hp = 4200 * scale; speed = 120; size=240; color='#dc2626'; borderColor='#fff'; dmg=100*scale; attackPattern = 'STOMP'; } 
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

    // === NORMAL AI TYPES ===
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
            if (dist < 250 && e.stateTimer > 3.0) { e.attackState = 'WARN'; e.stateTimer = 0; }
        }
        else if (e.attackState === 'WARN') {
            shouldMove = false;
            if (e.stateTimer > 1.2) { 
                e.attackState = 'FIRING'; e.stateTimer = 0; shakeManager.shake(5);
                particles.push({ id: Math.random().toString(), x: e.x, y: e.y, width:0, height:0, vx:0, vy:0, life:0.4, maxLife:0.4, color: '#dc2626', size: 250, type: 'SHOCKWAVE', drag:0, growth: 100 });
                if (dist < 250) takeDamage(e.damage);
            }
        }
        else if (e.attackState === 'FIRING') {
            shouldMove = false; if (e.stateTimer > 0.5) { e.attackState = 'IDLE'; e.stateTimer = 0; }
        }
    }

    // === BOSS 1: MISSILE RAIN & SLAM ===
    if (e.type === 'BOSS_1') {
        if (e.attackState === 'IDLE') {
            if (e.stateTimer > 0.3) {
                e.attackPattern = Math.random() > 0.5 ? 'SLAM' : 'MISSILE';
                e.attackState = 'WARN'; e.stateTimer = 0;
                
                if (e.attackPattern === 'MISSILE') {
                    e.missileTargets = [];
                    for(let i=0; i<50; i++) {
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
            const warnTime = e.attackPattern === 'MISSILE' ? 0.45 : 0.35; 
            if (e.stateTimer > warnTime) { e.attackState = 'FIRING'; e.stateTimer = 0; }
        }
        else if (e.attackState === 'FIRING') {
            shouldMove = false;
            if (e.attackPattern === 'SLAM') {
                 shakeManager.shake(30); 
                 createSimpleParticles(particles, e.x, e.y, '#ef4444', 60);
                 particles.push({ id: Math.random().toString(), x: e.x, y: e.y, width:0, height:0, vx:0, vy:0, life:0.5, maxLife:0.5, color: '#ef4444', size: 400, type: 'SHOCKWAVE', drag:0, growth: 1200 });
                 if (dist < 450) takeDamage(90); 
            } 
            else if (e.attackPattern === 'MISSILE') {
                shakeManager.shake(20);
                e.missileTargets?.forEach(t => {
                    createSimpleParticles(particles, t.x, t.y, '#f97316', 20);
                    particles.push({ id: Math.random().toString(), x: t.x, y: t.y, width:0, height:0, vx:0, vy:0, life:0.4, maxLife:0.4, color: '#f97316', size: 80, type: 'SHOCKWAVE', drag:0, growth: 200 });
                    if (getDistance(player.x, player.y, t.x, t.y) < 100) takeDamage(65); 
                });
            }
            e.attackState = 'COOLDOWN'; e.stateTimer = 0;
        }
        else if (e.attackState === 'COOLDOWN') {
             if (e.stateTimer > 0.2) { e.attackState = 'IDLE'; e.stateTimer = 0; }
        }
    }

    // === BOSS 2: BLACK HOLE, LASER, & RAPID STREAM ===
    else if (e.type === 'BOSS_2') {
         if (e.attackState === 'IDLE') {
             // Aggressive: Always try to attack regardless of range if cooldown is ready
             if (e.stateTimer > 0.2) {
                 const r = Math.random();
                 if (r < 0.33) e.attackPattern = 'BLACK_HOLE';
                 else if (r < 0.66) e.attackPattern = 'LASER';
                 else e.attackPattern = 'RAPID_STREAM';

                 e.attackState = 'WARN'; e.stateTimer = 0;
                 e.secondaryTimer = 0;
             }
         }
         else if (e.attackPattern === 'LASER' && (e.attackState === 'WARN' || e.attackState === 'CHARGING' || e.attackState === 'FIRING')) {
            // MOVEMENT ALLOWED - RUN & GUN
            moveSpeed *= 0.4; // Slow down while focusing

            if (e.attackState === 'WARN') {
                // Track player during warning
                e.laserAngle = Math.atan2(player.y - e.y, player.x - e.x);
                if (e.stateTimer > 0.25) { e.attackState = 'CHARGING'; e.stateTimer = 0; }
            }
            else if (e.attackState === 'CHARGING') {
                // Track player during charging too
                e.laserAngle = Math.atan2(player.y - e.y, player.x - e.x);
                if (e.stateTimer > 0.15) { e.attackState = 'FIRING'; e.stateTimer = 0; shakeManager.shake(10); }
            }
            else if (e.attackState === 'FIRING') {
                // DO NOT Track during firing (player can dodge), but boss moves, so beam translates
                const beamLen = 1500;
                const x2 = e.x + Math.cos(e.laserAngle || 0) * beamLen;
                const y2 = e.y + Math.sin(e.laserAngle || 0) * beamLen;
                const A = player.x - e.x; const B = player.y - e.y; const C = x2 - e.x; const D = y2 - e.y;
                const dot = A * C + B * D; const len_sq = C * C + D * D;
                let param = -1; if (len_sq !== 0) param = dot / len_sq;
                let xx, yy; if (param < 0) { xx = e.x; yy = e.y; } else if (param > 1) { xx = x2; yy = y2; } else { xx = e.x + param * C; yy = e.y + param * D; }
                const distToLine = Math.sqrt(Math.pow(player.x - xx, 2) + Math.pow(player.y - yy, 2));
                if (distToLine < 80) { takeDamage(12); } 

                if (e.stateTimer > 1.5) { e.attackState = 'COOLDOWN'; e.stateTimer = 0; }
            }
         }
         else if (e.attackPattern === 'BLACK_HOLE' && e.attackState === 'WARN') {
             // MOVEMENT ALLOWED DURING WARN
             if (e.stateTimer > 0.4) { e.attackState = 'PULLING'; e.stateTimer = 0; }
         }
         else if (e.attackPattern === 'BLACK_HOLE' && e.attackState === 'PULLING') {
             shouldMove = false; // MUST STOP TO ANCHOR BLACK HOLE
             if (Math.random() > 0.5) {
                 particles.push({
                     id: Math.random().toString(), x: player.x + getRandomRange(-50, 50), y: player.y + getRandomRange(-50, 50),
                     width:0, height:0, vx: (e.x - player.x) * 2, vy: (e.y - player.y) * 2,
                     life: 0.5, maxLife: 0.5, color: '#4f46e5', size: 3, type: 'DOT', drag: 0, growth: 0
                 });
             }
             if (e.stateTimer > 3.5) { e.attackState = 'COOLDOWN'; e.stateTimer = 0; }
         }
         else if (e.attackPattern === 'RAPID_STREAM' && (e.attackState === 'WARN' || e.attackState === 'FIRING')) {
             // MOVEMENT ALLOWED - RUN & GUN
             moveSpeed *= 0.7; // Fast movement while shooting

             if (e.attackState === 'WARN') {
                 e.laserAngle = Math.atan2(player.y - e.y, player.x - e.x);
                 if (e.stateTimer > 0.6) { e.attackState = 'FIRING'; e.stateTimer = 0; e.secondaryTimer = 0; }
             }
             else if (e.attackState === 'FIRING') {
                 e.secondaryTimer = (e.secondaryTimer || 0) + dt;
                 if (e.secondaryTimer > 0.08) {
                     const spread = getRandomRange(-0.15, 0.15);
                     // Recalculate aim every shot to make it deadly if they just run
                     const aimAngle = Math.atan2(player.y - e.y, player.x - e.x);
                     const fireAngle = aimAngle + spread;
                     e.laserAngle = aimAngle; // Update visual indicator angle

                     projectiles.push({
                        id: Math.random().toString(), x: e.x, y: e.y, width: 20, height: 20,
                        vx: Math.cos(fireAngle) * 550, vy: Math.sin(fireAngle) * 550,
                        damage: e.damage, life: 3, rotation: fireAngle, type: 'ENEMY_BULLET', pierce: 0, color: '#818cf8'
                     });
                     e.secondaryTimer = 0;
                 }
                 if (e.stateTimer > 2.5) { e.attackState = 'COOLDOWN'; e.stateTimer = 0; }
             }
         }
         else if (e.attackState === 'COOLDOWN') {
             if (e.stateTimer > 0.3) { e.attackState = 'IDLE'; e.stateTimer = 0; }
         }
    }

    // === BOSS 3: THE ENDURANCE TEST ===
    else if (e.type === 'BOSS_3') {
        if (e.attackState === 'IDLE' && e.stateTimer > 0.5) { 
             const r = Math.random();
             // Adjust probabilities to include ROTATING_LASERS
             if (r < 0.25) e.attackPattern = 'SPIRAL';
             else if (r < 0.5) e.attackPattern = 'GRID';
             else if (r < 0.75) e.attackPattern = 'DASH';
             else e.attackPattern = 'ROTATING_LASERS'; 
             
             e.attackState = 'WARN'; e.stateTimer = 0;
             e.secondaryTimer = 0;
             e.burstCount = 3; 
        }

        // BOSS 3 now MOVES SLOWLY towards player during these attacks instead of stopping
        if (e.attackPattern === 'ROTATING_LASERS' && (e.attackState === 'WARN' || e.attackState === 'FIRING')) {
            moveSpeed *= 0.2; // Creep towards player
            if (e.attackState === 'WARN') {
                if (e.stateTimer > 1.5) { 
                    e.attackState = 'FIRING'; 
                    e.stateTimer = 0; 
                    e.rotationSpeed = 0.5; // rads per second
                    // Set initial angle (or keep existing)
                    if (e.laserAngle === undefined) e.laserAngle = 0;
                }
            }
            else if (e.attackState === 'FIRING') {
                // Rotate
                e.laserAngle = (e.laserAngle || 0) + (e.rotationSpeed || 0.5) * dt;
                
                // Check Collision for 4 beams
                const beamLen = 1200;
                const numBeams = 4;
                const hitWidth = 40; // Wide beam

                for (let i = 0; i < numBeams; i++) {
                    const angle = (e.laserAngle || 0) + (i * (Math.PI * 2 / numBeams));
                    
                    // Line segment from Boss Center to Beam End
                    const x2 = e.x + Math.cos(angle) * beamLen;
                    const y2 = e.y + Math.sin(angle) * beamLen;
                    
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
                    const distToSource = getDistance(player.x, player.y, e.x, e.y);

                    // Don't hit if inside the boss (too cheap) or too far
                    if (distToLine < hitWidth && distToSource > 50 && distToSource < beamLen) { 
                        takeDamage(15); // Continuous damage
                    }
                }

                shakeManager.shake(2);
                if (e.stateTimer > 6.0) { e.attackState = 'COOLDOWN'; e.stateTimer = 0; }
            }
        }
        else if (e.attackPattern === 'SPIRAL' && (e.attackState === 'WARN' || e.attackState === 'FIRING')) {
            moveSpeed *= 0.2; // Creep towards player
            if (e.attackState === 'WARN') {
                 if (e.stateTimer > 0.8) { e.attackState = 'FIRING'; e.stateTimer = 0; }
            }
            else if (e.attackState === 'FIRING') {
                e.rotationSpeed = (e.rotationSpeed || 0) + dt * 0.35; 
                e.laserAngle = (e.laserAngle || 0) + 2.5 * dt; 
                e.secondaryTimer = (e.secondaryTimer || 0) + dt;
                
                if (e.secondaryTimer > 0.04) { 
                    const arms = 6; 
                    for(let i=0; i<arms; i++) {
                       const angle = (e.laserAngle || 0) + (Math.PI * 2 / arms) * i;
                       projectiles.push({
                            id: Math.random().toString(), x: e.x, y: e.y, width: 22, height: 22,
                            vx: Math.cos(angle) * 450, vy: Math.sin(angle) * 450, 
                            damage: e.damage, life: 8, rotation: angle, type: 'ENEMY_BULLET', pierce: 0, color: '#facc15'
                        });
                    }
                    e.secondaryTimer = 0;
                }
                if (e.stateTimer > 4.5) { e.attackState = 'COOLDOWN'; e.stateTimer = 0; } 
            }
        }
        else if (e.attackPattern === 'GRID' && (e.attackState === 'WARN' || e.attackState === 'FIRING')) {
            moveSpeed *= 0.2; // Creep towards player
            if (e.attackState === 'WARN') {
                 if (e.stateTimer > 0.8) { e.attackState = 'FIRING'; e.stateTimer = 0; }
            }
            else if (e.attackState === 'FIRING') {
                e.secondaryTimer = (e.secondaryTimer || 0) + dt;
                if (e.secondaryTimer > 0.2) { 
                    const isHorizontal = Math.random() > 0.5;
                    const offset = getRandomRange(-500, 500);
                    const px = isHorizontal ? player.x + offset : player.x;
                    const py = isHorizontal ? player.y : player.y + offset;
                    
                    particles.push({
                         id: Math.random().toString(), x: px, y: py, width:0, height:0,
                         vx:0, vy:0, life:1.5, maxLife:1.5, color: 'rgba(239, 68, 68, 0.5)', size: isHorizontal ? 4 : 2000, 
                         type: 'DOT', drag:0, growth:0 
                    });
                    
                    // MODIFIED: SPARSER GRID
                    const count = 9; // Reduced from 16 to 9 to make it sparser
                    const spacing = 240; // Increased spacing from 90 to 240
                    const startOffset = (count * spacing) / 2;

                    for(let k=0; k<count; k++) {
                         projectiles.push({
                            id: Math.random().toString(), 
                            x: isHorizontal ? player.x - startOffset + k*spacing : px, 
                            y: isHorizontal ? py : player.y - startOffset + k*spacing,
                            width: 25, height: 25,
                            vx: isHorizontal ? 0 : (Math.random() > 0.5 ? 320 : -320), // Slower speed (350 -> 320)
                            vy: isHorizontal ? (Math.random() > 0.5 ? 320 : -320) : 0,
                            damage: e.damage, life: 7, rotation: 0, type: 'ENEMY_BULLET', pierce: 0, color: '#ef4444'
                         });
                    }
                    e.secondaryTimer = 0;
                }
                if (e.stateTimer > 3.5) { e.attackState = 'COOLDOWN'; e.stateTimer = 0; }
            }
        }
        else if (e.attackPattern === 'DASH' && (e.attackState === 'WARN' || e.attackState === 'DASHING')) {
             shouldMove = false;
             
             if (e.attackState === 'WARN') {
                  if (e.stateTimer === 0 || !e.dashTarget) {
                      e.dashTarget = { x: player.x, y: player.y };
                  }
                  if (e.stateTimer > 0.6) { 
                      e.attackState = 'DASHING'; e.stateTimer = 0; 
                      shakeManager.shake(15);
                      const angle = Math.atan2(e.dashTarget.y - e.y, e.dashTarget.x - e.x);
                      e.vx = Math.cos(angle) * 1300; 
                      e.vy = Math.sin(angle) * 1300;
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
            if (e.stateTimer > 0.4) { e.attackState = 'IDLE'; e.stateTimer = 0; }
        }
    }


    // === SHOOTER LOGIC ===
    if (e.attackPattern === 'SINGLE' && dist < (e.attackRange || 400)) {
        if (e.attackState !== 'FIRING') {
            if (e.stateTimer > 2.0) {
                e.attackState = 'FIRING'; e.stateTimer = 0;
                const angle = Math.atan2(player.y - e.y, player.x - e.x);
                projectiles.push({
                    id: Math.random().toString(), x: e.x, y: e.y, width: 16, height: 16,
                    vx: Math.cos(angle) * 350, vy: Math.sin(angle) * 350,
                    damage: e.damage, life: 3, rotation: angle, type: 'ENEMY_BULLET', pierce: 0, color: '#c084fc'
                });
            }
        } else {
            if (e.stateTimer > 0.3) { e.attackState = 'IDLE'; e.stateTimer = 0; }
        }
    }

    if (e.attackPattern === 'BURST' && dist < (e.attackRange || 500)) {
        if (e.attackState !== 'FIRING') {
            if (e.stateTimer > 2.0) {
                e.attackState = 'FIRING'; e.burstCount = 1; e.stateTimer = 0; e.secondaryTimer = 0;
            }
        } else {
            e.secondaryTimer = (e.secondaryTimer || 0) + dt;
            if (e.secondaryTimer > 0.1) { 
                 const baseAngle = Math.atan2(player.y - e.y, player.x - e.x);
                 // 3 Shots: -1, 0, 1
                 for(let i=-1; i<=1; i++) {
                    const finalAngle = baseAngle + (i * 0.2); 
                    
                    // Determine color based on type
                    const bulletColor = e.type === 'ELITE_SHOOTER' ? '#f97316' : '#a855f7'; // Orange vs Purple
                    
                    projectiles.push({
                        id: Math.random().toString(), x: e.x, y: e.y, width: 16, height: 16,
                        vx: Math.cos(finalAngle) * 400, vy: Math.sin(finalAngle) * 400,
                        damage: e.damage, life: 3, rotation: finalAngle, type: 'ENEMY_BULLET', pierce: 0, 
                        color: bulletColor
                    });
                 }
                 e.burstCount = (e.burstCount || 0) - 1; e.secondaryTimer = 0;
                 if (e.burstCount <= 0) { e.attackState = 'IDLE'; e.stateTimer = 0; }
            }
        }
    }

    // --- MOVEMENT ---
    if (shouldMove) {
        if (e.type === 'BOSS_2') {
             // BOSS 2 SPECIAL AI: AGGRESSIVE CHASER (RUN & GUN)
             // REMOVED "dist > 150" check. It now always chases unless dead.
             const angle = Math.atan2(player.y - e.y, player.x - e.x);
             e.x += Math.cos(angle) * moveSpeed * dt; 
             e.y += Math.sin(angle) * moveSpeed * dt;
        }
        else if (e.aiType === 'RANGED') {
             if (dist > (e.attackRange || 300)) {
                 const angle = Math.atan2(player.y - e.y, player.x - e.x);
                 e.x += Math.cos(angle) * moveSpeed * dt; e.y += Math.sin(angle) * moveSpeed * dt;
             } else if (dist < 200) { 
                 const angle = Math.atan2(player.y - e.y, player.x - e.x);
                 e.x -= Math.cos(angle) * moveSpeed * dt; e.y -= Math.sin(angle) * moveSpeed * dt;
             }
        } 
        else if (e.aiType === 'KAMIKAZE') {
            // Trigger charge earlier (dist < 200) - Increased range for larger enemy
            if (dist < 200 && !e.isCharging) { e.isCharging = true; e.attackTimer = 0; }
            
            if (e.isCharging) {
               e.attackTimer = (e.attackTimer || 0) + dt;
               e.color = Math.floor(gameTime * 20) % 2 === 0 ? '#fff' : '#ef4444';
               
               // Detonate after 1.0s
               if ((e.attackTimer || 0) > 1.0) {
                   // BIG EXPLOSION VISUAL
                   createExplosionParticles(particles, e.x, e.y, '#ef4444');
                   shakeManager.shake(15);
                   
                   // Damage in area (200 range) - Increased from 150
                   if (dist < 200) takeDamage(e.damage);
                   
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
