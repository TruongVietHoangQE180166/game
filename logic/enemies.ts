
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

  const angle = Math.random() * Math.PI * 2;
  const dist = 1100;
  const x = player.x + Math.cos(angle) * dist;
  const y = player.y + Math.sin(angle) * dist;
  
  let type: Enemy['type'] = 'NORM_1';
  let aiType: Enemy['aiType'] = 'MELEE';
  let hp = 30, speed = 140, dmg = 15, size = 30;
  let color = '#d1d5db'; 
  let borderColor = '#374151';
  let attackRange = 0;
  
  let attackPattern: Enemy['attackPattern'] = 'BASIC';
  let attackState: Enemy['attackState'] = 'IDLE';
  
  const scale = 1 + (gameTime / 60) * 0.8; 
  const r = Math.random();

  if (bossType) {
      hp = 8000 * scale; size = 120; color = '#000'; borderColor = '#ef4444';
      dmg = 80 * scale; speed = 90; type = bossType; aiType = 'BOSS';
      
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
  } else {
      if (gameTime < 60) {
          if (r < 0.8) { type = 'NORM_1'; hp=40; speed=130; } 
          else { type = 'NORM_2'; hp=60; speed=150; color='#86efac'; size=25; }
      } else if (gameTime < 180) {
          if (r < 0.6) { type = 'NORM_2'; hp=80; speed=160; color='#86efac'; }
          else if (r < 0.85) { type = 'EXPLODER'; aiType = 'KAMIKAZE'; hp=50; speed=300; color='#f97316'; size=28; dmg=80; }
          else { type = 'ELITE'; hp=400; speed=110; size=45; color='#16a34a'; borderColor='#fff'; dmg=30; }
      } else {
          if (r < 0.4) { type = 'NORM_2'; hp=120; speed=180; color='#86efac'; }
          else if (r < 0.6) { 
            type = 'SHOOTER'; aiType = 'RANGED'; hp=90; speed=120; color='#a855f7'; size=35; 
            attackRange = 450; attackPattern = 'BURST'; 
          }
          else if (r < 0.8) { type = 'EXPLODER'; aiType = 'KAMIKAZE'; hp=80; speed=350; color='#f97316'; size=28; dmg=100; }
          else { type = 'ELITE'; hp=800; speed=120; size=55; color='#dc2626'; borderColor='#fff'; dmg=50; }
      }
  }

  hp *= scale; dmg *= scale;

  const newEnemy: Enemy = {
    id: Math.random().toString(),
    x, y, width: size, height: size,
    type, aiType, hp, maxHP: hp, speed, damage: dmg, color, borderColor,
    flashTime: 0,
    attackRange, attackPattern, attackState, stateTimer: 0,
    burstCount: 0,
    isCharging: false,
    rotationSpeed: 0,
    laserAngle: 0
  };

  enemies.push(newEnemy);
  if (bossType) setActiveBoss(newEnemy);
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

    // === BOSS AI LOGIC ===

    // 1. BOSS 1: GROUND SLAM
    if (e.attackPattern === 'SLAM') {
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
    
    // 2. BOSS 2: LASER
    else if (e.attackPattern === 'LASER') {
        // IDLE -> WARN (Tracking) -> CHARGING (Lock) -> FIRING -> COOLDOWN
        if (e.attackState === 'IDLE' || !e.attackState) {
            if (e.stateTimer > 3) {
                e.attackState = 'WARN';
                e.stateTimer = 0;
                e.secondaryTimer = 0; // Use for pulsing sound or visual
            }
        }
        else if (e.attackState === 'WARN') {
           // Track player
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
            // Laser locked, gathering energy
            if (Math.random() > 0.5) {
               const lx = e.x + Math.cos(e.laserAngle || 0) * getRandomRange(0, 800);
               const ly = e.y + Math.sin(e.laserAngle || 0) * getRandomRange(0, 800);
               particles.push({
                   id: Math.random().toString(), x: lx, y: ly, width:0, height:0,
                   vx: (e.x - lx) * 2, vy: (e.y - ly) * 2, // Suck in
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
            // Collision Logic: Point to Line Segment
            const beamLen = 1500;
            const x2 = e.x + Math.cos(e.laserAngle || 0) * beamLen;
            const y2 = e.y + Math.sin(e.laserAngle || 0) * beamLen;
            
            // Math for dist from player to line (e.x,e.y) -> (x2,y2)
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
            
            if (distToLine < 40) { // Beam width approx
                takeDamage(2); // Rapid low damage
            }

            if (e.stateTimer > 2.0) {
                e.attackState = 'COOLDOWN';
                e.stateTimer = 0;
            }
        }
        else if (e.attackState === 'COOLDOWN') {
            if (e.stateTimer > 2.0) { e.attackState = 'IDLE'; e.stateTimer = 0; }
        }
    }

    // 3. BOSS 3: SPIRAL
    else if (e.attackPattern === 'SPIRAL') {
        // Continuous firing while rotating
        shouldMove = false;
        e.rotationSpeed = (e.rotationSpeed || 0) + dt * 0.1; // Accelerate spin
        e.laserAngle = (e.laserAngle || 0) + 1.5 * dt; // Using laserAngle as generic rotation var
        
        e.secondaryTimer = (e.secondaryTimer || 0) + dt;
        if (e.secondaryTimer > 0.1) { // Fire rate
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

    // --- OTHER PATTERNS (NOVA, BURST) ---
    else if (e.attackPattern === 'NOVA') {
        if (e.stateTimer > 3.0) {
            const bulletCount = 12;
            for(let i=0; i<bulletCount; i++) {
                const angle = (Math.PI * 2 / bulletCount) * i;
                projectiles.push({
                    id: Math.random().toString(), x: e.x, y: e.y, width: 25, height: 25,
                    vx: Math.cos(angle) * 350, vy: Math.sin(angle) * 350,
                    damage: e.damage, life: 5, rotation: angle, type: 'ENEMY_BULLET', pierce: 0,
                    color: '#a855f7', isHoming: false
                });
            }
            e.stateTimer = 0;
        }
    }

    // Burst Logic
    if (e.attackPattern === 'BURST' && dist < (e.attackRange || 500)) {
        if (e.attackState !== 'FIRING') {
            if (e.stateTimer > 2.0) {
                e.attackState = 'FIRING';
                e.burstCount = 3;
                e.stateTimer = 0;
                e.secondaryTimer = 0;
            }
        } else {
            e.secondaryTimer = (e.secondaryTimer || 0) + dt;
            if (e.secondaryTimer > 0.15) { 
                 const angle = Math.atan2(player.y - e.y, player.x - e.x);
                 projectiles.push({
                    id: Math.random().toString(), x: e.x, y: e.y, width: 20, height: 20,
                    vx: Math.cos(angle) * 450, vy: Math.sin(angle) * 450,
                    damage: e.damage, life: 3, rotation: angle, type: 'ENEMY_BULLET', pierce: 0,
                    color: '#ef4444'
                 });
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
             if (dist > (e.attackRange || 400)) {
                 const angle = Math.atan2(player.y - e.y, player.x - e.x);
                 e.x += Math.cos(angle) * moveSpeed * dt;
                 e.y += Math.sin(angle) * moveSpeed * dt;
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
