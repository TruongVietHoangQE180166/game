
import { PlayerStats, Enemy, Projectile, Particle, FloatingText, ExpGem, HealthDrop } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import { getRandomRange } from '../utils';

interface RenderState {
  stats: PlayerStats;
  player: { x: number, y: number, size: number };
  enemies: Enemy[];
  projectiles: Projectile[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  gems: ExpGem[];
  healthDrops: HealthDrop[];
  zone: { active: boolean, radius: number, center: { x: number, y: number } };
  gameTime: number;
  offsets: { x: number, y: number };
}

export const renderGame = (ctx: CanvasRenderingContext2D, state: RenderState) => {
    const { 
        stats, player, enemies, projectiles, particles, floatingTexts, 
        gems, healthDrops, zone, gameTime, offsets 
    } = state;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const camX = player.x - CANVAS_WIDTH / 2 + offsets.x;
    const camY = player.y - CANVAS_HEIGHT / 2 + offsets.y;

    ctx.save();
    ctx.translate(-camX, -camY);

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(camX, camY, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    const gridSize = 120;
    const startX = Math.floor(camX / gridSize) * gridSize;
    const startY = Math.floor(camY / gridSize) * gridSize;
    for(let x = startX; x < camX + CANVAS_WIDTH + gridSize; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, camY); ctx.lineTo(x, camY + CANVAS_HEIGHT); ctx.stroke();
    }
    for(let y = startY; y < camY + CANVAS_HEIGHT + gridSize; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(camX, y); ctx.lineTo(camX + CANVAS_WIDTH, y); ctx.stroke();
    }

    if (zone.active) {
        const { center, radius } = zone;
        ctx.beginPath(); ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        ctx.lineWidth = 10; ctx.strokeStyle = `rgba(239, 68, 68, ${0.5 + Math.sin(gameTime * 10) * 0.2})`; ctx.stroke();
        ctx.beginPath(); ctx.rect(camX - 100, camY - 100, CANVAS_WIDTH + 200, CANVAS_HEIGHT + 200);
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2, true);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.1)'; ctx.fill();
    }

    gems.forEach(g => {
      const size = g.width; 
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(g.x+3, g.y+3, size/2, 0, Math.PI*2); ctx.fill(); 
      ctx.fillStyle = g.color; ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(g.x, g.y, size/2, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    });

    healthDrops.forEach(h => {
        const scale = 1 + Math.sin(gameTime * 8) * 0.1;
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.scale(scale, scale);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.arc(2, 4, 10, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('♥', 0, 0);
        ctx.restore();
    });

    enemies.forEach(e => {
      // --- BOSS 1: SLAM WARNING ---
      if (e.attackPattern === 'SLAM' && e.attackState === 'WARN') {
          const progress = (e.stateTimer || 0) / 1.5;
          ctx.save(); ctx.translate(e.x, e.y);
          ctx.beginPath(); ctx.arc(0, 0, 300, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(239, 68, 68, 0.2)`; ctx.fill();
          ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.stroke();
          ctx.beginPath(); ctx.arc(0, 0, 300 * progress, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(239, 68, 68, 0.4)`; ctx.fill();
          ctx.restore();
      }
      
      // --- BOSS 2: LASER DRAWING ---
      if (e.attackPattern === 'LASER') {
          const laserLen = 1500;
          if (e.attackState === 'WARN' || e.attackState === 'CHARGING') {
              ctx.save();
              ctx.beginPath();
              ctx.moveTo(e.x, e.y);
              ctx.lineTo(e.x + Math.cos(e.laserAngle || 0) * laserLen, e.y + Math.sin(e.laserAngle || 0) * laserLen);
              ctx.strokeStyle = `rgba(255, 0, 0, ${e.attackState === 'CHARGING' ? 0.8 : 0.2})`;
              ctx.lineWidth = e.attackState === 'CHARGING' ? 3 : 1;
              ctx.setLineDash([10, 10]);
              ctx.stroke();
              ctx.restore();
          } 
          else if (e.attackState === 'FIRING') {
              // Main Beam
              ctx.save();
              ctx.beginPath();
              ctx.moveTo(e.x, e.y);
              ctx.lineTo(e.x + Math.cos(e.laserAngle || 0) * laserLen, e.y + Math.sin(e.laserAngle || 0) * laserLen);
              
              // Glow
              ctx.shadowBlur = 20; ctx.shadowColor = '#818cf8';
              ctx.lineWidth = getRandomRange(40, 60);
              ctx.strokeStyle = 'rgba(67, 56, 202, 0.5)';
              ctx.stroke();
              
              // Core
              ctx.shadowBlur = 0;
              ctx.lineWidth = getRandomRange(10, 20);
              ctx.strokeStyle = '#e0e7ff';
              ctx.stroke();
              ctx.restore();
          }
      }

      if (e.aiType === 'KAMIKAZE') {
          ctx.beginPath(); ctx.arc(e.x, e.y, 80, 0, Math.PI*2);
          ctx.strokeStyle = `rgba(239, 68, 68, ${e.isCharging ? 0.8 : 0.1})`;
          ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]);
      }
      
      ctx.save();
      ctx.translate(e.x, e.y);
      if (e.flashTime > 0) {
          ctx.translate((Math.random()-0.5)*4, (Math.random()-0.5)*4);
          ctx.scale(0.95, 0.95);
      }

      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(-e.width/2 + 6, -e.height/2 + 6, e.width, e.height);
      ctx.fillStyle = e.flashTime > 0 ? '#fff' : e.color;
      ctx.strokeStyle = e.borderColor;
      ctx.lineWidth = e.aiType === 'BOSS' ? 8 : (e.type === 'ELITE' ? 6 : 4);
      ctx.fillRect(-e.width/2, -e.height/2, e.width, e.height);
      ctx.strokeRect(-e.width/2, -e.height/2, e.width, e.height);
      ctx.fillStyle = e.aiType === 'BOSS' ? '#ef4444' : '#000';
      const eyeSize = e.width * 0.15; const eyeOffset = e.width * 0.2;
      ctx.fillRect(-eyeOffset - eyeSize/2, -5, eyeSize, eyeSize);
      ctx.fillRect(eyeOffset - eyeSize/2, -5, eyeSize, eyeSize);
      
      ctx.restore();

      if (e.hp < e.maxHP && e.aiType !== 'BOSS') { 
        const barW = e.width + 10; const barH = 6;
        const barX = e.x - barW/2; const barY = e.y - e.height/2 - 15;
        ctx.fillStyle = '#000'; ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = '#ef4444'; ctx.fillRect(barX, barY, (e.hp / e.maxHP) * barW, barH);
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeRect(barX, barY, barW, barH);
      }
    });

    const bookSize = 24 * stats.bookArea * Math.max(1, stats.bookDamageMult * 0.7);
    const orbitalRadius = 160 * stats.bookArea;
    
    // MAGIC CIRCLE
    if (stats.bookAmount > 0) {
        ctx.save(); 
        ctx.translate(player.x, player.y); 
        
        const pulse = 1 + Math.sin(gameTime * 4) * 0.05;
        ctx.scale(pulse, pulse);

        ctx.save(); ctx.rotate(gameTime * 0.5); 
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)'; 
        ctx.lineWidth = 2; ctx.setLineDash([20, 10]);
        ctx.beginPath(); ctx.arc(0, 0, orbitalRadius, 0, Math.PI*2); ctx.stroke();
        ctx.restore();

        ctx.save(); ctx.rotate(-gameTime * 0.3);
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
        ctx.lineWidth = 1; ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.arc(0, 0, orbitalRadius * 0.8, 0, Math.PI*2); ctx.stroke();
        ctx.restore();
        
        ctx.rotate(gameTime * 0.1);
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
        ctx.lineWidth = 1;
        for(let k=0; k<5; k++) {
            const a = k * (Math.PI * 2 / 5);
            ctx.lineTo(Math.cos(a)*orbitalRadius*0.8, Math.sin(a)*orbitalRadius*0.8);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    for(let i=0; i < stats.bookAmount; i++) {
        const angle = (gameTime * 3.0 * stats.bookSpeed) + (i * (Math.PI * 2 / stats.bookAmount));
        const bx = player.x + Math.cos(angle) * orbitalRadius;
        
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
        ctx.lineWidth = bookSize / 2;
        ctx.lineCap = 'round';
        const trailLen = 0.5;
        ctx.arc(player.x, player.y, orbitalRadius, angle - trailLen, angle);
        ctx.stroke();
        ctx.restore();

        ctx.save(); 
        ctx.translate(bx, player.y + Math.sin(angle) * orbitalRadius); 
        ctx.rotate(angle + Math.PI/2);
        ctx.shadowColor = '#8b5cf6';
        ctx.shadowBlur = 15;
        for(let j=1; j<=3; j++) { 
            ctx.fillStyle = `rgba(139, 92, 246, ${0.3 / j})`; 
            ctx.fillRect((-bookSize/2) - (j*4), -bookSize/2, bookSize, bookSize); 
        }
        ctx.fillStyle = '#8b5cf6'; 
        ctx.strokeStyle = '#fff'; 
        ctx.lineWidth = 2;
        ctx.fillRect(-bookSize/2, -bookSize/2, bookSize, bookSize); 
        ctx.strokeRect(-bookSize/2, -bookSize/2, bookSize, bookSize);
        ctx.fillStyle = '#fff'; 
        ctx.font = `bold ${bookSize/1.5}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡', 0, 0);
        ctx.restore();
    }

    projectiles.forEach(p => {
        const tailLength = p.width * 2.5;
        ctx.save();
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = p.color; 
        ctx.lineWidth = p.width / 2; 
        ctx.lineCap = 'round';
        
        if (p.type === 'ENEMY_BULLET') ctx.globalCompositeOperation = 'lighter';
        
        ctx.globalAlpha = 0.8;
        ctx.beginPath(); 
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - Math.cos(p.rotation) * tailLength, p.y - Math.sin(p.rotation) * tailLength);
        ctx.stroke(); 
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = p.type === 'ENEMY_BULLET' ? '#fff' : '#fff'; 
        ctx.beginPath(); ctx.arc(p.x, p.y, p.width/3, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    });

    const pSize = player.size;
    const px = player.x; const py = player.y;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(px - pSize/2 + 6, py - pSize/2 + 6, pSize, pSize);
    ctx.fillStyle = stats.currentArmor > 0 ? '#3b82f6' : '#171717'; 
    ctx.strokeStyle = '#000'; ctx.lineWidth = 5;
    ctx.fillRect(px - pSize/2, py - pSize/2, pSize, pSize); ctx.strokeRect(px - pSize/2, py - pSize/2, pSize, pSize);
    ctx.fillStyle = '#fff'; ctx.fillRect(px - 10, py - 6, 6, 6); ctx.fillRect(px + 4, py - 6, 6, 6);

    particles.forEach(p => { 
        const alpha = p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        
        if (p.rotation) ctx.rotate(p.rotation);

        if (p.type === 'SHOCKWAVE') {
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(0, p.size), 0, Math.PI * 2);
            ctx.lineWidth = 4;
            ctx.strokeStyle = p.color;
            ctx.stroke();
        } else if (p.type === 'MUZZLE') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        } else if (p.type === 'STAR') {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            const r = p.size;
            ctx.moveTo(0, -r); ctx.quadraticCurveTo(r/4, -r/4, r, 0); ctx.quadraticCurveTo(r/4, r/4, 0, r); ctx.quadraticCurveTo(-r/4, r/4, -r, 0); ctx.quadraticCurveTo(-r/4, -r/4, 0, -r);
            ctx.fill();
        } else if (p.type === 'FLASH') {
            ctx.resetTransform(); 
            const grad = ctx.createRadialGradient(p.x - (camX), p.y - (camY), 0, p.x - (camX), p.y - (camY), p.size * 2);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad;
            ctx.globalCompositeOperation = 'screen';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.globalCompositeOperation = 'source-over';
        } else if (p.type === 'LIGHTNING' && p.path) {
            ctx.globalCompositeOperation = 'lighter';
            const drawPath = (pts: {x: number, y: number}[], width: number, alpha: number) => {
                ctx.beginPath();
                if (pts.length > 0) {
                    ctx.moveTo(pts[0].x + getRandomRange(-2, 2), pts[0].y + getRandomRange(-2, 2));
                }
                for(let i=1; i<pts.length; i++) {
                    ctx.lineTo(pts[i].x + getRandomRange(-2, 2), pts[i].y + getRandomRange(-2, 2));
                }
                ctx.lineWidth = width;
                ctx.stroke();
            };

            const flicker = Math.random() * 0.3 + 0.7; 
            const fade = alpha; 
            
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.shadowBlur = 40 * fade;
            ctx.shadowColor = p.color;
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = fade * 0.5 * flicker;
            drawPath(p.path, p.size * 3, fade);
            
            ctx.shadowBlur = 20 * fade;
            ctx.globalAlpha = fade * 0.9 * flicker;
            drawPath(p.path, p.size * 1.2, fade);
            if (p.branches) {
                p.branches.forEach(b => drawPath(b, p.size * 0.6, fade));
            }

            ctx.shadowBlur = 10;
            ctx.strokeStyle = '#fff';
            ctx.globalAlpha = fade * flicker;
            drawPath(p.path, p.size * 0.4, fade);
             if (p.branches) {
                p.branches.forEach(b => drawPath(b, p.size * 0.2, fade));
            }
            
            ctx.shadowBlur = 0;
            ctx.globalCompositeOperation = 'source-over';
        } else {
            ctx.fillStyle = p.color; 
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size); 
        }
        
        ctx.restore();
    });

    floatingTexts.forEach(ft => {
        ctx.save(); ctx.globalAlpha = ft.life; ctx.fillStyle = ft.color; ctx.font = '900 24px "Space Mono"';
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.strokeText(ft.text, ft.x, ft.y); ctx.fillText(ft.text, ft.x, ft.y); ctx.restore();
    });

    ctx.restore();
    const grad = ctx.createRadialGradient(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, CANVAS_WIDTH/3, CANVAS_WIDTH/2, CANVAS_HEIGHT/2, CANVAS_WIDTH);
    grad.addColorStop(0, 'transparent'); grad.addColorStop(1, 'rgba(0,0,0,0.1)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
};
