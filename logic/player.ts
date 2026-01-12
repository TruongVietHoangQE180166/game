
import { PlayerStats, FloatingText, Enemy } from '../types';
import { getDistance } from '../utils';

interface PlayerRef {
  x: number;
  y: number;
  size: number;
}

export interface ZoneState {
  active: boolean;
  radius: number;
  center: { x: number; y: number };
  lastBossId: string | null;
}

export const updatePlayerMovement = (
  player: PlayerRef,
  keys: { [key: string]: boolean },
  stats: PlayerStats,
  zone: ZoneState,
  dt: number,
  activeBosses: Enemy[]
) => {
  let dx = 0, dy = 0;
  if (keys['w'] || keys['arrowup']) dy -= 1;
  if (keys['s'] || keys['arrowdown']) dy += 1;
  if (keys['a'] || keys['arrowleft']) dx -= 1;
  if (keys['d'] || keys['arrowright']) dx += 1;

  let nextX = player.x;
  let nextY = player.y;

  // Normal Movement
  if (dx !== 0 || dy !== 0) {
    const length = Math.sqrt(dx * dx + dy * dy);
    nextX += (dx / length) * stats.moveSpeed * dt;
    nextY += (dy / length) * stats.moveSpeed * dt;
  }

  // Boss 2: Black Hole Pull (Check all active bosses)
  activeBosses.forEach(boss => {
      if (boss.type === 'BOSS_2' && boss.attackPattern === 'BLACK_HOLE' && boss.attackState === 'PULLING') {
          const dist = getDistance(player.x, player.y, boss.x, boss.y);
          if (dist < 1000) { // Range matches visual
              // Stronger Pull: Increased base strength significantly for harder difficulty (800 base)
              const pullStrength = 800 * (1 - dist / 1000) + 200; 
              const angle = Math.atan2(boss.y - player.y, boss.x - player.x);
              nextX += Math.cos(angle) * pullStrength * dt;
              nextY += Math.sin(angle) * pullStrength * dt;
          }
      }
  });

  // Zone Constraint
  if (zone.active) {
    const distToCenter = getDistance(nextX, nextY, zone.center.x, zone.center.y);
    if (distToCenter > zone.radius) {
      const angle = Math.atan2(nextY - zone.center.y, nextX - zone.center.x);
      nextX = zone.center.x + Math.cos(angle) * zone.radius;
      nextY = zone.center.y + Math.sin(angle) * zone.radius;
    }
  }
  
  player.x = nextX;
  player.y = nextY;
};

export const updateZoneLogic = (
  zone: ZoneState,
  player: PlayerRef,
  floatingTexts: FloatingText[],
  dt: number,
  activeBosses: Enemy[]
) => {
  // Trigger Zone if there are active bosses AND we haven't triggered for the first boss ID yet
  if (activeBosses.length > 0 && zone.lastBossId !== activeBosses[0].id && !zone.active) {
    zone.active = true;
    zone.lastBossId = activeBosses[0].id;
    zone.radius = 1500; // Start wider
    zone.center = { x: player.x, y: player.y };
    floatingTexts.push({
      id: 'zone_warning', x: player.x, y: player.y - 150,
      text: '⚠️ VÒNG BO ĐANG THU HẸP! ⚠️', color: '#ef4444', life: 4, vx: 0, vy: -0.5
    });
  }

  if (zone.active) {
    const MIN_RADIUS = 600; // Bán kính tối thiểu của đấu trường (Đường kính 1200px)

    // Shrink logic
    if (zone.radius > MIN_RADIUS) {
        zone.radius -= 60 * dt; // Shrink speed
    } else {
        zone.radius = MIN_RADIUS; // Clamp at minimum size
    }
    
    // Deactivate ONLY when all bosses are dead
    if (activeBosses.length === 0) {
        zone.active = false;
        floatingTexts.push({
            id: 'zone_safe', x: player.x, y: player.y - 100,
            text: 'BOSS ĐÃ DIỆT - VÒNG BO TAN BIẾN', color: '#22c55e', life: 3, vx: 0, vy: -1
        });
    }
  }
};
