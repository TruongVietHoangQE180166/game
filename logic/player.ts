
import { PlayerStats, FloatingText } from '../types';
import { getDistance } from '../utils';

interface PlayerRef {
  x: number;
  y: number;
  size: number;
}

interface ZoneState {
  active: boolean;
  radius: number;
  center: { x: number; y: number };
  lastTriggeredLevel: number;
}

export const updatePlayerMovement = (
  player: PlayerRef,
  keys: { [key: string]: boolean },
  stats: PlayerStats,
  zone: ZoneState,
  dt: number
) => {
  let dx = 0, dy = 0;
  if (keys['w'] || keys['arrowup']) dy -= 1;
  if (keys['s'] || keys['arrowdown']) dy += 1;
  if (keys['a'] || keys['arrowleft']) dx -= 1;
  if (keys['d'] || keys['arrowright']) dx += 1;

  let nextX = player.x;
  let nextY = player.y;

  if (dx !== 0 || dy !== 0) {
    const length = Math.sqrt(dx * dx + dy * dy);
    nextX += (dx / length) * stats.moveSpeed * dt;
    nextY += (dy / length) * stats.moveSpeed * dt;
  }

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
  stats: PlayerStats,
  zone: ZoneState,
  player: PlayerRef,
  floatingTexts: FloatingText[],
  dt: number
) => {
  // Trigger Zone every 10 levels
  if (stats.level % 10 === 0 && stats.level > zone.lastTriggeredLevel && !zone.active) {
    zone.active = true;
    zone.lastTriggeredLevel = stats.level;
    zone.radius = 1200;
    zone.center = { x: player.x, y: player.y };
    floatingTexts.push({
      id: 'zone_warning', x: player.x, y: player.y - 100,
      text: 'VÒNG BO ĐANG THU HẸP!', color: 'red', life: 3, vx: 0, vy: -1
    });
  }

  if (zone.active) {
    zone.radius -= 30 * dt; 
    if (zone.radius < 200) zone.active = false;
  }
};
