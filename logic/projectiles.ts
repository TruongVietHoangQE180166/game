
import { Projectile, Enemy, Particle, FloatingText } from '../types';
import { checkCircleCollision } from '../utils';
import { createHitEffect } from './particles';

export const updateProjectiles = (
  dt: number,
  projectiles: Projectile[],
  enemies: Enemy[],
  player: { x: number, y: number, size: number },
  particles: Particle[],
  floatingTexts: FloatingText[],
  takeDamage: (amount: number) => void
) => {
  projectiles.forEach(p => {
    // Homing Logic
    if (p.isHoming) {
        let targetX = player.x;
        let targetY = player.y;
        
        const angleToTarget = Math.atan2(targetY - p.y, targetX - p.x);
        const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const steer = 0.05 * (p.homingForce || 1);
        const targetVx = Math.cos(angleToTarget) * currentSpeed;
        const targetVy = Math.sin(angleToTarget) * currentSpeed;
        
        p.vx += (targetVx - p.vx) * steer; 
        p.vy += (targetVy - p.vy) * steer;
        p.rotation = Math.atan2(p.vy, p.vx);
    }

    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;

    // Trail
    if (p.type === 'PLAYER_BULLET' && Math.random() > 0.6) {
         particles.push({
             id: Math.random().toString(),
             x: p.x, y: p.y, width: 0, height: 0,
             vx: 0, vy: 0, life: 0.2, maxLife: 0.2,
             color: 'rgba(251, 191, 36, 0.5)', size: p.width/2,
             type: 'DOT', drag: 0, growth: -5
         });
    }

    if (p.type === 'PLAYER_BULLET') {
        enemies.forEach(e => {
          if (checkCircleCollision(p.x, p.y, p.width/2, e.x, e.y, e.width/2)) {
             e.hp -= p.damage;
             e.flashTime = 0.15;
             if (e.aiType !== 'BOSS') {
                 const knockbackAmt = 15;
                 e.x += Math.cos(p.rotation) * knockbackAmt;
                 e.y += Math.sin(p.rotation) * knockbackAmt;
             }
             createHitEffect(particles, floatingTexts, p.x, p.y, '#fbbf24', p.damage, false);
             if (p.pierce > 0) p.pierce -= 1; else p.life = 0;
          }
        });
    } else if (p.type === 'ENEMY_BULLET') {
        if (checkCircleCollision(p.x, p.y, p.width/2, player.x, player.y, player.size/2)) {
             takeDamage(p.damage);
             p.life = 0;
             createHitEffect(particles, floatingTexts, player.x, player.y, '#ef4444', 0, true);
        }
    }
  });

  return projectiles.filter(p => p.life > 0);
};
