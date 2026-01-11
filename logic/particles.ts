
import { Particle, FloatingText } from '../types';
import { getRandomRange } from '../utils';

export const createHitEffect = (
  particles: Particle[],
  floatingTexts: FloatingText[],
  x: number, 
  y: number, 
  color: string, 
  damage: number, 
  isCrit = false
) => {
  particles.push({
    id: Math.random().toString(),
    x, y, width: 0, height: 0,
    vx: 0, vy: 0,
    life: 0.25, maxLife: 0.25,
    color: isCrit ? '#fcd34d' : '#fff',
    size: isCrit ? 20 : 10,
    type: 'SHOCKWAVE',
    drag: 0,
    growth: isCrit ? 300 : 200
  });

  const particleCount = 5 + Math.floor(damage / 10);
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = getRandomRange(100, 400);
    particles.push({
      id: Math.random().toString(),
      x, y, width: 0, height: 0,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life: getRandomRange(0.3, 0.6), maxLife: 0.6,
      color: Math.random() > 0.5 ? color : (isCrit ? '#fcd34d' : '#fff'),
      size: getRandomRange(3, 7),
      type: 'SQUARE',
      drag: 0.85, 
      growth: -8,
      rotation: Math.random() * Math.PI,
      vRot: getRandomRange(-10, 10)
    });
  }

  floatingTexts.push({
    id: Math.random().toString(),
    x, y: y - 25, 
    text: Math.ceil(damage).toString(), 
    color: color === '#000' ? '#000' : (isCrit ? '#f59e0b' : '#fff'), 
    life: 0.8, vx: getRandomRange(-2, 2), vy: -5
  });
};

export const createShellCasing = (particles: Particle[], x: number, y: number, angle: number) => {
  const perp = angle + Math.PI/2 + getRandomRange(-0.2, 0.2);
  const speed = getRandomRange(150, 250);
  particles.push({
      id: Math.random().toString(),
      x, y, width: 6, height: 3,
      vx: Math.cos(perp) * speed, vy: Math.sin(perp) * speed,
      life: 0.6, maxLife: 0.6,
      color: '#fbbf24',
      size: 4, type: 'SHELL',
      drag: 0.9, growth: 0,
      rotation: angle, vRot: getRandomRange(-15, 15)
  });
};

export const createMuzzleFlash = (particles: Particle[], x: number, y: number, angle: number) => {
  particles.push({
      id: Math.random().toString(),
      x: x + Math.cos(angle) * 20, y: y + Math.sin(angle) * 20,
      width: 0, height: 0,
      vx: Math.cos(angle) * 50, vy: Math.sin(angle) * 50,
      life: 0.1, maxLife: 0.1,
      color: '#fef3c7',
      size: 25, type: 'MUZZLE',
      drag: 0, growth: 100,
      rotation: angle
  });
};

export const createMagicSparkle = (particles: Particle[], x: number, y: number) => {
   if (Math.random() > 0.3) return;
   particles.push({
      id: Math.random().toString(),
      x: x + getRandomRange(-10, 10), y: y + getRandomRange(-10, 10),
      width: 0, height: 0,
      vx: getRandomRange(-10, 10), vy: getRandomRange(-10, 10),
      life: 0.6, maxLife: 0.6,
      color: '#c084fc',
      size: getRandomRange(3, 6), type: 'STAR',
      drag: 0.95, growth: -3,
      rotation: Math.random() * Math.PI, vRot: getRandomRange(-2, 2)
   });
};

export const createSimpleParticles = (particles: Particle[], x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = getRandomRange(50, 250);
        particles.push({
            id: Math.random().toString(),
            x, y, width: 0, height: 0,
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            life: getRandomRange(0.3, 0.6), maxLife: 0.6,
            color: color,
            size: getRandomRange(3, 6),
            type: 'SQUARE',
            drag: 0.85, growth: -5,
            rotation: Math.random() * Math.PI, vRot: getRandomRange(-10, 10)
        });
    }
};

export const updateParticles = (particles: Particle[], dt: number) => {
  particles.forEach(p => { 
      p.x += p.vx * dt; 
      p.y += p.vy * dt; 
      p.vx *= p.drag; 
      p.vy *= p.drag;
      p.size += p.growth * dt;
      p.life -= dt; 
      if (p.vRot) p.rotation = (p.rotation || 0) + p.vRot * dt; 
  });
  return particles.filter(p => p.life > 0 && p.size > 0);
};

export const updateFloatingTexts = (texts: FloatingText[], dt: number) => {
  texts.forEach(ft => { ft.x += ft.vx; ft.y += ft.vy; ft.life -= dt; });
  return texts.filter(ft => ft.life > 0);
};
