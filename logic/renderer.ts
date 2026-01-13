
import { PlayerStats, Enemy, Projectile, Particle, FloatingText, ExpGem, HealthDrop, ArmorDrop } from '../types';
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
  armorDrops: ArmorDrop[];
  zone: { active: boolean, radius: number, center: { x: number, y: number } };
  gameTime: number;
  offsets: { x: number, y: number };
}

// --- ASSET MANAGEMENT ---
type SpriteStatus = 'LOADING' | 'LOADED' | 'ERROR';

interface SpriteData {
    img: HTMLImageElement;
    status: SpriteStatus;
    src: string;
}

// Map enemy types to sprite data
const SPRITES: Record<string, SpriteData> = {};

const loadSprite = (key: string, fileName: string) => {
    // UPDATED: Explicitly point to the public folder
    const src = `${fileName}`; 
    const img = new Image();
    
    SPRITES[key] = {
        img,
        status: 'LOADING',
        src
    };

    img.onload = () => {
        SPRITES[key].status = 'LOADED';
    };

    img.onerror = () => {
        SPRITES[key].status = 'ERROR';
        // Only warn if it fails after the first attempt
        console.warn(`[Renderer] Failed to load image: ${src}`);
    };

    // Add timestamp to bypass browser cache
    img.src = `${src}?t=${Date.now()}`;
};

// Initialize Sprites
const initSprites = () => {
    // Mapping internal types to filenames
    loadSprite('NORM_1', 'Monster1.png');
    loadSprite('NORM_2', 'Monster2.png');
    loadSprite('SHOOTER', 'Monster3.png');
    loadSprite('EXPLODER', 'Monster4.png');
    loadSprite('SPLITTER', 'Monster5.png');
    loadSprite('MINI', 'Monster6.png');
    loadSprite('ELITE', 'Monster7.png');
    loadSprite('ELITE_SHOOTER', 'Monster8.png'); // New Elite Shooter

    loadSprite('BOSS_1', 'Boss1.png');
    loadSprite('BOSS_2', 'Boss2.png');
    loadSprite('BOSS_3', 'Boss3.png');
};

// Run initialization once
initSprites();

export const renderGame = (ctx: CanvasRenderingContext2D, state: RenderState) => {
    const { 
        stats, player, enemies, projectiles, particles, floatingTexts, 
        gems, healthDrops, armorDrops, zone, gameTime, offsets 
    } = state;

    // 1. CLEAR CANVAS (Transparently)
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const camX = player.x - CANVAS_WIDTH / 2 + offsets.x;
    const camY = player.y - CANVAS_HEIGHT / 2 + offsets.y;

    ctx.save();
    ctx.translate(-camX, -camY);

    // --- ZONE RENDERING (FIXED: INFINITE COVERAGE) ---
    if (zone.active) {
        const { center, radius } = zone;
        
        // 1. Draw the Safety Line (Glowing Ring)
        ctx.save();
        ctx.beginPath(); 
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        ctx.lineWidth = 8; 
        ctx.strokeStyle = '#ef4444'; // Red-500
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 20;
        ctx.stroke();
        
        // Inner thin line
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        ctx.restore();
        
        // 2. Draw the Danger Zone (Inverse Fill)
        // BUG FIX: Added save/restore wrapper to prevent leaking context state or popping main camera transform
        ctx.save();
        const WORLD_COVERAGE = 20000; 
        
        ctx.beginPath(); 
        ctx.rect(player.x - WORLD_COVERAGE/2, player.y - WORLD_COVERAGE/2, WORLD_COVERAGE, WORLD_COVERAGE);
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2, true); 
        
        ctx.fillStyle = 'rgba(127, 29, 29, 0.4)'; // Dark Red Tint
        ctx.fill();
        ctx.restore();
    }

    // --- COLLECTIBLES: EXPERIENCE GEMS (CRYSTALS) ---
    gems.forEach(g => {
      const size = g.width; 
      // Floating animation
      const floatY = Math.sin(gameTime * 3 + parseFloat(g.id)) * 5;
      
      ctx.save();
      ctx.translate(g.x, g.y + floatY);
      
      // Rotate slowly for 3D feel
      ctx.rotate(Math.PI / 4); // 45 degrees for diamond shape
      
      // 1. Outer Glow
      ctx.shadowBlur = 15; 
      ctx.shadowColor = g.color;
      
      // 2. Main Body (Diamond)
      ctx.fillStyle = g.color; 
      ctx.fillRect(-size/2, -size/2, size, size);
      
      // 3. Inner Core (Bright)
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.8;
      ctx.fillRect(-size/4, -size/4, size/2, size/2);
      
      // 4. White Border
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-size/2, -size/2, size, size);
      
      ctx.restore();
    });

    // --- COLLECTIBLES: HEALTH DROPS (MEDKITS) ---
    healthDrops.forEach(h => {
        // Heartbeat animation
        const pulse = 1 + Math.sin(gameTime * 10) * 0.15; 
        const floatY = Math.sin(gameTime * 4) * 4;

        ctx.save();
        ctx.translate(h.x, h.y + floatY);
        ctx.scale(pulse, pulse);
        
        // 1. Glow
        ctx.shadowBlur = 20; 
        ctx.shadowColor = '#ef4444';
        
        // 2. Red Sphere Body
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        
        // 3. White Shine/Reflection
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(-4, -4, 5, 0, Math.PI * 2);
        ctx.fill();

        // 4. Medical Cross Symbol
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 0;
        ctx.fillRect(-8, -3, 16, 6); // Horizontal
        ctx.fillRect(-3, -8, 6, 16); // Vertical

        // 5. Border Ring
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    });

    // --- COLLECTIBLES: ARMOR DROPS (SHIELD BATTERIES) ---
    armorDrops.forEach(a => {
        const floatY = Math.cos(gameTime * 4) * 4;
        
        ctx.save();
        ctx.translate(a.x, a.y + floatY);
        
        // Spin the outer ring
        ctx.rotate(gameTime * 2); 
        
        // 1. Glow
        ctx.shadowBlur = 20; 
        ctx.shadowColor = '#3b82f6';
        
        // 2. Outer Rotating Ring segments
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 0.5); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 16, Math.PI, Math.PI * 1.5); ctx.stroke();

        // Counter-rotate for the inner icon so it stays upright
        ctx.rotate(-gameTime * 2); 

        // 3. Inner Orb
        ctx.fillStyle = '#1d4ed8'; // Darker blue fill
        ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI*2); ctx.fill();
        
        // 4. Shield Icon
        ctx.fillStyle = '#fff'; // White shield
        ctx.shadowBlur = 5; ctx.shadowColor = '#fff';
        ctx.beginPath();
        ctx.moveTo(0, 7);
        ctx.bezierCurveTo(7, 2, 7, -5, 0, -8);
        ctx.bezierCurveTo(-7, -5, -7, 2, 0, 7);
        ctx.fill();

        ctx.restore();
    });

    // --- ENEMY RENDERING (LAYER 1: ATTACK INDICATORS) ---
    enemies.forEach(e => {
      // 0. KAMIKAZE INDICATOR
      if (e.aiType === 'KAMIKAZE' && e.isCharging) {
          const BLAST_RADIUS = 150;
          const progress = Math.min(1, (e.attackTimer || 0) / 1.0); 
          ctx.save(); 
          ctx.translate(e.x, e.y);
          ctx.beginPath(); ctx.arc(0, 0, BLAST_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(239, 68, 68, 0.2)`; ctx.fill();
          ctx.strokeStyle = `rgba(239, 68, 68, 0.5)`; ctx.lineWidth = 2; ctx.stroke();
          const innerRadius = BLAST_RADIUS * (1 - progress);
          ctx.beginPath(); ctx.arc(0, 0, Math.max(0, innerRadius), 0, Math.PI * 2);
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
          ctx.restore();
      }

      // 1. DASHER TELEGRAPH
      if (e.aiType === 'DASHER' && e.attackState === 'WARN') {
         ctx.save();
         ctx.beginPath(); ctx.moveTo(e.x, e.y);
         const tx = e.dashTarget?.x || player.x; const ty = e.dashTarget?.y || player.y;
         const angle = Math.atan2(ty - e.y, tx - e.x);
         const dist = 400; 
         ctx.lineTo(e.x + Math.cos(angle) * dist, e.y + Math.sin(angle) * dist);
         ctx.strokeStyle = `rgba(134, 239, 172, ${0.3 + Math.random() * 0.5})`; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.stroke();
         ctx.restore();
      }

      // 2. BOSS 1: MISSILE RAIN TARGETS
      if (e.type === 'BOSS_1' && e.attackPattern === 'MISSILE' && e.attackState === 'WARN') {
          e.missileTargets?.forEach(t => {
              const pulse = 1 + Math.sin(gameTime * 15) * 0.2;
              ctx.save();
              ctx.translate(t.x, t.y);
              ctx.beginPath(); ctx.arc(0, 0, 80 * pulse, 0, Math.PI*2);
              ctx.strokeStyle = '#f97316'; ctx.lineWidth = 2; ctx.stroke();
              ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.moveTo(0, -10); ctx.lineTo(0, 10); ctx.stroke();
              ctx.restore();
          });
      }

      // 3. BOSS 1: SLAM TELEGRAPH
      if (e.type === 'BOSS_1' && e.attackPattern === 'SLAM' && e.attackState === 'WARN') {
          const SLAM_RADIUS = 300;
          const progress = Math.min(1, (e.stateTimer || 0) / 1.5);
          ctx.save(); ctx.translate(e.x, e.y);
          ctx.beginPath(); ctx.arc(0, 0, SLAM_RADIUS, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)'; ctx.lineWidth = 3; ctx.setLineDash([15, 10]); ctx.stroke();
          ctx.beginPath(); ctx.arc(0, 0, SLAM_RADIUS * progress, 0, Math.PI * 2); ctx.fillStyle = 'rgba(239, 68, 68, 0.3)'; ctx.fill();
          ctx.restore();
      }

      // 4. BOSS 2: BLACK HOLE
      if (e.type === 'BOSS_2' && e.attackPattern === 'BLACK_HOLE' && (e.attackState === 'WARN' || e.attackState === 'PULLING')) {
          const PULL_RADIUS = 550; 
          ctx.save(); ctx.translate(e.x, e.y);
          
          ctx.beginPath(); ctx.arc(0, 0, PULL_RADIUS, 0, Math.PI * 2);
          if (e.attackState === 'WARN') {
               ctx.fillStyle = 'rgba(76, 29, 149, 0.05)'; ctx.fill();
               ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)'; ctx.lineWidth = 2; ctx.setLineDash([20, 20]); ctx.stroke();
          } else {
               const pulse = 0.1 + Math.sin(gameTime * 5) * 0.05;
               ctx.fillStyle = `rgba(76, 29, 149, ${0.1 + pulse})`; ctx.fill();
               ctx.strokeStyle = 'rgba(139, 92, 246, 0.6)'; ctx.lineWidth = 4; ctx.setLineDash([]); ctx.stroke();
               
               const speed = 400; const offset = (gameTime * speed) % PULL_RADIUS; const rippleR = PULL_RADIUS - offset;
               if (rippleR > 0) { ctx.beginPath(); ctx.arc(0, 0, rippleR, 0, Math.PI * 2); ctx.strokeStyle = `rgba(167, 139, 250, ${rippleR/PULL_RADIUS * 0.5})`; ctx.lineWidth = 2; ctx.stroke(); }
          }

          ctx.rotate(gameTime * 2); const size = e.attackState === 'PULLING' ? 300 : 150;
          ctx.beginPath();
          for(let i=0; i<8; i++) { ctx.rotate(Math.PI/4); ctx.moveTo(size, 0); ctx.quadraticCurveTo(size/2, 50, 0, 0); }
          ctx.strokeStyle = `rgba(79, 70, 229, ${e.attackState === 'PULLING' ? 0.8 : 0.4})`; ctx.lineWidth = 2; ctx.stroke();
          ctx.beginPath(); ctx.arc(0, 0, 60, 0, Math.PI*2); ctx.fillStyle = '#000'; ctx.fill(); ctx.strokeStyle = '#818cf8'; ctx.lineWidth = 2; ctx.stroke();
          ctx.restore();
      }
      
      // BOSS 2: LASER
      if (e.attackPattern === 'LASER' && (e.attackState === 'WARN' || e.attackState === 'CHARGING' || e.attackState === 'FIRING')) {
          const laserLen = 1500; const baseAngle = e.laserAngle || 0; const beamOffsets = [0, -0.35, 0.35]; 
          ctx.save(); ctx.translate(e.x, e.y);
          for (const offset of beamOffsets) {
              const angle = baseAngle + offset;
              ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(angle) * laserLen, Math.sin(angle) * laserLen);
              if (e.attackState === 'WARN') {
                  ctx.strokeStyle = 'rgba(220, 38, 38, 0.5)'; ctx.lineWidth = 2; ctx.setLineDash([10, 10]); ctx.stroke();
              } else if (e.attackState === 'CHARGING') {
                   ctx.strokeStyle = 'rgba(220, 38, 38, 0.8)'; ctx.lineWidth = 4 * (1 + Math.sin(gameTime*30)*0.2); ctx.shadowBlur = 10; ctx.shadowColor = '#ef4444'; ctx.stroke();
              } else {
                  const flicker = Math.random() * 0.2 + 0.9;
                  ctx.lineCap = 'round'; ctx.shadowBlur = 30; ctx.shadowColor = '#a855f7'; 
                  ctx.lineWidth = 60 * flicker; ctx.strokeStyle = 'rgba(147, 51, 234, 0.5)'; ctx.stroke();
                  ctx.lineWidth = 20 * flicker; ctx.strokeStyle = '#fff'; ctx.stroke();
              }
              ctx.restore();
          }
          ctx.restore();
      }

      // BOSS 2: RAPID STREAM
      if (e.attackPattern === 'RAPID_STREAM' && e.attackState === 'WARN') {
          const angle = e.laserAngle || 0; const len = 800;
          ctx.save(); ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + Math.cos(angle) * len, e.y + Math.sin(angle) * len);
          ctx.strokeStyle = 'rgba(129, 140, 248, 0.5)'; ctx.lineWidth = 1; ctx.setLineDash([15, 5]); ctx.stroke();
          ctx.restore();
      }

      // BOSS 3: DASH
      if (e.type === 'BOSS_3' && e.attackPattern === 'DASH' && e.attackState === 'WARN') {
          const tx = e.dashTarget?.x || player.x; const ty = e.dashTarget?.y || player.y; const progress = Math.min(1, (e.stateTimer || 0) / 0.8);
          ctx.save();
          ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(tx, ty); ctx.strokeStyle = `rgba(220, 38, 38, ${0.2 + progress * 0.6})`; ctx.lineWidth = 2 + progress * 20; ctx.stroke();
          ctx.translate(tx, ty); ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(20, 0); ctx.moveTo(0, -20); ctx.lineTo(0, 20); ctx.stroke();
          ctx.beginPath(); ctx.arc(0, 0, 30 * (1-progress), 0, Math.PI*2); ctx.stroke();
          ctx.restore();
      }

      // BOSS 3: ROTATING LASERS
      if (e.type === 'BOSS_3' && e.attackPattern === 'ROTATING_LASERS' && (e.attackState === 'WARN' || e.attackState === 'FIRING')) {
          const laserLen = 1200; const numBeams = 4; const currentAngle = e.laserAngle || 0;
          ctx.save(); ctx.translate(e.x, e.y);
          for (let i = 0; i < numBeams; i++) {
              ctx.save(); ctx.rotate(currentAngle + (i * (Math.PI * 2 / numBeams)));
              if (e.attackState === 'WARN') {
                  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(laserLen, 0);
                  ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)'; ctx.lineWidth = 2; ctx.setLineDash([20, 10]); ctx.stroke();
              } else {
                  const flicker = Math.random() * 0.2 + 0.8;
                  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(laserLen, 0);
                  ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)'; ctx.lineWidth = 40 * flicker; ctx.lineCap = 'round'; ctx.stroke();
                  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(laserLen, 0);
                  ctx.strokeStyle = '#fff'; ctx.lineWidth = 10 * flicker; ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 20; ctx.stroke();
              }
              ctx.restore();
          }
          ctx.restore();
      }

      // 5. ELITE STOMP
      if (e.type === 'ELITE' && e.attackPattern === 'STOMP' && e.attackState === 'WARN') {
          const progress = Math.min(1, (e.stateTimer || 0) / 1.2);
          ctx.save(); ctx.translate(e.x, e.y);
          ctx.beginPath(); ctx.arc(0, 0, 250, 0, Math.PI*2); ctx.strokeStyle = 'rgba(220, 38, 38, 0.4)'; ctx.stroke();
          ctx.beginPath(); ctx.arc(0, 0, 250 * progress, 0, Math.PI*2); ctx.fillStyle = 'rgba(220, 38, 38, 0.2)'; ctx.fill();
          ctx.restore();
      }
    });

    // --- ENEMY RENDERING (LAYER 2: SPRITES & BODIES) ---
    enemies.forEach(e => {
      ctx.save();
      ctx.translate(e.x, e.y);

      // Facing
      if (player.x < e.x) ctx.scale(-1, 1);

      // Wobble for some types
      if (e.type === 'SPLITTER' || e.type === 'MINI') {
           const wobbleX = 1 + Math.sin(gameTime * 10) * 0.1;
           const wobbleY = 1 + Math.cos(gameTime * 10) * 0.1;
           ctx.scale(wobbleX, wobbleY);
      }
      if (e.aiType === 'KAMIKAZE' && e.isCharging) ctx.translate(getRandomRange(-5, 5), getRandomRange(-5, 5));

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath(); ctx.ellipse(0, e.height/2 - 5, e.width/2, e.height/6, 0, 0, Math.PI * 2); ctx.fill();

      const spriteData = SPRITES[e.type];
      
      if (spriteData && spriteData.status === 'LOADED') {
          // SPRITE RENDER
          if (e.flashTime > 0) {
              ctx.drawImage(spriteData.img, -e.width/2, -e.height/2, e.width, e.height);
              ctx.globalCompositeOperation = "source-atop"; ctx.fillStyle = "white"; ctx.globalAlpha = 0.7;
              ctx.fillRect(-e.width/2, -e.height/2, e.width, e.height);
              ctx.globalAlpha = 1.0; ctx.globalCompositeOperation = "source-over";
          } 
          else if (e.aiType === 'KAMIKAZE' && e.isCharging && Math.floor(gameTime * 20) % 2 === 0) {
              ctx.drawImage(spriteData.img, -e.width/2, -e.height/2, e.width, e.height);
              ctx.globalCompositeOperation = "source-atop"; ctx.fillStyle = "#ef4444"; ctx.globalAlpha = 0.6;
              ctx.fillRect(-e.width/2, -e.height/2, e.width, e.height);
              ctx.globalAlpha = 1.0; ctx.globalCompositeOperation = "source-over";
          }
          else {
              ctx.drawImage(spriteData.img, -e.width/2, -e.height/2, e.width, e.height);
          }
      } else {
          // FALLBACK SHAPE
          ctx.fillStyle = (e.flashTime > 0) ? '#fff' : e.color;
          if (e.aiType === 'KAMIKAZE' && e.isCharging && Math.floor(gameTime * 20) % 2 === 0) ctx.fillStyle = '#ef4444';
          ctx.strokeStyle = e.borderColor; ctx.lineWidth = e.aiType === 'BOSS' ? 8 : 4;
          ctx.fillRect(-e.width/2, -e.height/2, e.width, e.height);
          ctx.strokeRect(-e.width/2, -e.height/2, e.width, e.height);
          
          // Debug Fallback Eyes
          ctx.fillStyle = e.aiType === 'BOSS' ? '#ef4444' : '#000';
          const eyeSize = e.width * 0.15; const eyeOffset = e.width * 0.2;
          ctx.fillRect(-eyeOffset - eyeSize/2, -5, eyeSize, eyeSize); ctx.fillRect(eyeOffset - eyeSize/2, -5, eyeSize, eyeSize);
      }
      ctx.restore();

      // Health Bar
      if (e.hp < e.maxHP && e.aiType !== 'BOSS' && e.aiType !== 'MINI') { 
        const barW = e.width + 10; const barH = 6;
        const barX = e.x - barW/2; const barY = e.y - e.height/2 - 15;
        ctx.fillStyle = '#000'; ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = '#ef4444'; ctx.fillRect(barX, barY, (e.hp / e.maxHP) * barW, barH);
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeRect(barX, barY, barW, barH);
      }
    });

    // --- BOOKS ---
    const orbitalRadius = 160 * stats.bookArea;
    const rawBookSize = 24 * stats.bookArea * Math.max(1, stats.bookDamageMult * 0.7);
    const bookSize = Math.min(rawBookSize, 100);

    // Book Orbital Ring
    if (stats.bookAmount > 0) {
        ctx.save(); ctx.translate(player.x, player.y); 
        const pulse = 1 + Math.sin(gameTime * 4) * 0.05; ctx.scale(pulse, pulse);
        ctx.save(); ctx.rotate(gameTime * 0.5); 
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)'; ctx.lineWidth = 2; ctx.setLineDash([20, 10]);
        ctx.beginPath(); ctx.arc(0, 0, orbitalRadius, 0, Math.PI*2); ctx.stroke(); ctx.restore();
        ctx.restore();
    }
    // Draw Books
    for(let i=0; i < stats.bookAmount; i++) {
        const angle = (gameTime * 3.0 * stats.bookSpeed) + (i * (Math.PI * 2 / stats.bookAmount));
        const bx = player.x + Math.cos(angle) * orbitalRadius;
        
        ctx.save(); ctx.beginPath(); ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)'; ctx.lineWidth = bookSize / 2; ctx.lineCap = 'round';
        ctx.arc(player.x, player.y, orbitalRadius, angle - 0.5, angle); ctx.stroke(); ctx.restore();

        ctx.save(); ctx.translate(bx, player.y + Math.sin(angle) * orbitalRadius); ctx.rotate(angle + Math.PI/2);
        ctx.shadowColor = '#8b5cf6'; ctx.shadowBlur = 15;
        ctx.fillStyle = '#8b5cf6'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        ctx.fillRect(-bookSize/2, -bookSize/2, bookSize, bookSize); ctx.strokeRect(-bookSize/2, -bookSize/2, bookSize, bookSize);
        ctx.fillStyle = '#fff'; ctx.font = `bold ${bookSize/1.5}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('⚡', 0, 0);
        ctx.restore();
    }

    // --- PROJECTILES ---
    projectiles.forEach(p => {
        ctx.save();
        if (p.type === 'PLAYER_BULLET') {
            const tailLength = p.width * 4; 
            const tailX = p.x - Math.cos(p.rotation) * tailLength;
            const tailY = p.y - Math.sin(p.rotation) * tailLength;
            const grad = ctx.createLinearGradient(p.x, p.y, tailX, tailY);
            grad.addColorStop(0, '#fff'); grad.addColorStop(0.2, '#fbbf24'); grad.addColorStop(1, 'rgba(251, 191, 36, 0)');

            ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 15; ctx.strokeStyle = grad; ctx.lineWidth = p.width * 0.6; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(tailX, tailY); ctx.stroke();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, p.width * 0.4, 0, Math.PI * 2); ctx.fill();
        } else {
            const pulse = 1 + Math.sin(gameTime * 20) * 0.1;
            ctx.shadowColor = p.color; ctx.shadowBlur = 15;
            ctx.fillStyle = '#171717'; ctx.beginPath(); ctx.arc(p.x, p.y, (p.width/2) * pulse, 0, Math.PI*2); ctx.fill();
            ctx.lineWidth = 3; ctx.strokeStyle = p.color; ctx.stroke();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, (p.width/4), 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
    });

    // --- PLAYER ---
    const pSize = player.size; const px = player.x; const py = player.y;
    // Shield
    if (stats.currentArmor > 0) {
        ctx.save(); ctx.translate(px, py);
        const shieldPercent = stats.currentArmor / stats.maxArmor; const shieldRadius = pSize * 0.9;
        const pulse = Math.sin(gameTime * 8) * 0.05 + 1; ctx.scale(pulse, pulse);
        ctx.beginPath(); ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, ${0.1 + (shieldPercent * 0.2)})`; ctx.fill();
        ctx.strokeStyle = `rgba(34, 211, 238, ${0.4 + (shieldPercent * 0.4)})`; ctx.lineWidth = 2; ctx.setLineDash([15, 10]); ctx.stroke();
        ctx.restore();
    }
    // Body
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(px - pSize/2 + 6, py - pSize/2 + 6, pSize, pSize); // Shadow
    ctx.fillStyle = '#171717'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
    ctx.fillRect(px - pSize/2, py - pSize/2, pSize, pSize); ctx.strokeRect(px - pSize/2, py - pSize/2, pSize, pSize);
    ctx.fillStyle = '#fff'; ctx.fillRect(px - 10, py - 6, 6, 6); ctx.fillRect(px + 4, py - 6, 6, 6);

    // --- PARTICLES ---
    particles.forEach(p => { 
        const alpha = p.life / p.maxLife;
        ctx.save(); ctx.globalAlpha = alpha; ctx.translate(p.x, p.y);
        if (p.rotation) ctx.rotate(p.rotation);
        
        if (p.type === 'SHOCKWAVE') {
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(0, p.size));
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)'); grad.addColorStop(0.5, p.color); grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad; ctx.globalAlpha = alpha * 0.6; ctx.beginPath(); ctx.arc(0, 0, Math.max(0, p.size), 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = alpha; ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();
        } else if (p.type === 'MUZZLE') {
            ctx.rotate(p.rotation || 0); ctx.beginPath(); const spikes = 8; const outerRadius = p.size; const innerRadius = p.size * 0.4;
            for (let i = 0; i < spikes * 2; i++) { const r = (i % 2 === 0) ? outerRadius : innerRadius; const a = (Math.PI * i) / spikes; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
            ctx.closePath(); ctx.fillStyle = p.color; ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 10; ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, p.size * 0.3, 0, Math.PI*2); ctx.fill();
        } else if (p.type === 'STAR') {
            ctx.fillStyle = p.color; ctx.beginPath(); const r = p.size; ctx.moveTo(0, -r); ctx.quadraticCurveTo(r/4, -r/4, r, 0); ctx.quadraticCurveTo(r/4, r/4, 0, r); ctx.quadraticCurveTo(-r/4, r/4, -r, 0); ctx.quadraticCurveTo(-r/4, -r/4, 0, -r); ctx.fill();
        } else if (p.type === 'NOVA_BLAST') {
            ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.globalAlpha = alpha * 0.4; ctx.fill();
            ctx.beginPath(); ctx.arc(0, 0, p.size * (1 - alpha * 0.5), 0, Math.PI * 2); ctx.strokeStyle = p.color; ctx.lineWidth = 10 * alpha; ctx.globalAlpha = alpha; ctx.stroke();
        } else if (p.type === 'FLASH') {
            ctx.resetTransform(); const grad = ctx.createRadialGradient(p.x - (camX), p.y - (camY), 0, p.x - (camX), p.y - (camY), p.size * 2);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)'); grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad; ctx.globalCompositeOperation = 'screen'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); ctx.globalCompositeOperation = 'source-over';
        } else if (p.type === 'LIGHTNING' && p.path) {
             const drawPath = (pts: {x: number, y: number}[], width: number, alpha: number) => { ctx.beginPath(); if (pts.length > 0) ctx.moveTo(pts[0].x, pts[0].y); for(let i=1; i<pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y); ctx.lineWidth = width; ctx.stroke(); };
            const fade = alpha; ctx.shadowBlur = 30 * fade; ctx.shadowColor = p.color; ctx.strokeStyle = p.color; ctx.globalAlpha = fade * 0.6; drawPath(p.path, p.size * 2.5, fade); ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = p.color; ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size); 
        }
        ctx.restore();
    });

    floatingTexts.forEach(ft => {
        ctx.save(); ctx.globalAlpha = ft.life; ctx.fillStyle = ft.color; ctx.font = '900 24px "Space Mono"'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.strokeText(ft.text, ft.x, ft.y); ctx.fillText(ft.text, ft.x, ft.y); ctx.restore();
    });

    ctx.restore();
};
