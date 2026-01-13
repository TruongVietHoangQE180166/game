import React, { useRef, useEffect, useCallback } from 'react';
import { ScreenShake } from '../utils';

interface GameMapProps {
  playerRef: React.MutableRefObject<{ x: number; y: number }>;
  shakeManager: React.MutableRefObject<ScreenShake>;
  canvasWidth: number;
  canvasHeight: number;
}

const GameMap: React.FC<GameMapProps> = ({ playerRef, shakeManager, canvasWidth, canvasHeight }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number>(0);
  const lastUpdateRef = useRef({ x: 0, y: 0, time: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const interpolatedPosRef = useRef({ x: 0, y: 0 });

  // Pre-calculate constants
  const centerX = useRef(canvasWidth / 2);
  const centerY = useRef(canvasHeight / 2);

  // Smooth interpolation function
  const lerp = useCallback((start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  }, []);

  useEffect(() => {
    centerX.current = canvasWidth / 2;
    centerY.current = canvasHeight / 2;
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    let lastTime = performance.now();
    let lastCSSUpdate = 0;
    const INTERPOLATION_SPEED = 0.18; // Increased for more responsiveness
    const MIN_DELTA = 0.1; // Increased threshold to reduce unnecessary updates
    const CSS_UPDATE_INTERVAL = 8; // Update CSS every ~8ms (120fps cap)
    const VELOCITY_SMOOTHING = 0.2;
    
    // Cache for avoiding repeated calculations
    const cache = {
      lastRoundedX: 0,
      lastRoundedY: 0,
      lastShakeX: 0,
      lastShakeY: 0
    };

    const updateMapPosition = (currentTime: number) => {
      if (!playerRef.current || !containerRef.current) {
        animationFrameId.current = requestAnimationFrame(updateMapPosition);
        return;
      }

      const deltaTime = Math.min((currentTime - lastTime) / 16.67, 2);
      lastTime = currentTime;

      const { x: targetX, y: targetY } = playerRef.current;
      
      // Smooth velocity calculation with exponential moving average
      const timeDelta = currentTime - lastUpdateRef.current.time;
      if (timeDelta > 0 && timeDelta < 100) { // Ignore large gaps
        const newVelX = (targetX - lastUpdateRef.current.x) / timeDelta;
        const newVelY = (targetY - lastUpdateRef.current.y) / timeDelta;
        
        velocityRef.current.x = velocityRef.current.x * (1 - VELOCITY_SMOOTHING) + newVelX * VELOCITY_SMOOTHING;
        velocityRef.current.y = velocityRef.current.y * (1 - VELOCITY_SMOOTHING) + newVelY * VELOCITY_SMOOTHING;
      }

      // Adaptive interpolation based on velocity
      const speed = Math.sqrt(velocityRef.current.x ** 2 + velocityRef.current.y ** 2);
      const adaptiveSpeed = Math.min(INTERPOLATION_SPEED * (1 + speed * 0.5), 0.35);

      // Smooth interpolation with velocity prediction
      const predictedX = targetX + velocityRef.current.x * 16;
      const predictedY = targetY + velocityRef.current.y * 16;
      
      interpolatedPosRef.current.x = lerp(
        interpolatedPosRef.current.x,
        predictedX,
        adaptiveSpeed * deltaTime
      );
      interpolatedPosRef.current.y = lerp(
        interpolatedPosRef.current.y,
        predictedY,
        adaptiveSpeed * deltaTime
      );

      // Throttle CSS updates for better performance
      const timeSinceLastUpdate = currentTime - lastCSSUpdate;
      
      if (timeSinceLastUpdate >= CSS_UPDATE_INTERVAL) {
        const deltaX = Math.abs(interpolatedPosRef.current.x - lastUpdateRef.current.x);
        const deltaY = Math.abs(interpolatedPosRef.current.y - lastUpdateRef.current.y);
        
        if (deltaX > MIN_DELTA || deltaY > MIN_DELTA) {
          lastUpdateRef.current = {
            x: interpolatedPosRef.current.x,
            y: interpolatedPosRef.current.y,
            time: currentTime
          };

          const offsets = shakeManager.current.getOffsets();
          
          // Round to reduce sub-pixel rendering artifacts
          const roundedX = Math.round(interpolatedPosRef.current.x * 10) / 10;
          const roundedY = Math.round(interpolatedPosRef.current.y * 10) / 10;
          const roundedShakeX = Math.round(offsets.x * 10) / 10;
          const roundedShakeY = Math.round(offsets.y * 10) / 10;

          // Only update if values actually changed
          if (roundedX !== cache.lastRoundedX || roundedY !== cache.lastRoundedY ||
              roundedShakeX !== cache.lastShakeX || roundedShakeY !== cache.lastShakeY) {
            
            const container = containerRef.current;
            const style = container.style;
            
            // Batch DOM writes
            style.setProperty('--player-x', `${roundedX}px`);
            style.setProperty('--player-y', `${roundedY}px`);
            style.setProperty('--shake-x', `${roundedShakeX}px`);
            style.setProperty('--shake-y', `${roundedShakeY}px`);
            
            cache.lastRoundedX = roundedX;
            cache.lastRoundedY = roundedY;
            cache.lastShakeX = roundedShakeX;
            cache.lastShakeY = roundedShakeY;
          }
          
          lastCSSUpdate = currentTime;
        }
      }

      animationFrameId.current = requestAnimationFrame(updateMapPosition);
    };

    // Initialize
    if (playerRef.current) {
      interpolatedPosRef.current = {
        x: playerRef.current.x,
        y: playerRef.current.y
      };
      lastUpdateRef.current = {
        x: playerRef.current.x,
        y: playerRef.current.y,
        time: performance.now()
      };
    }

    animationFrameId.current = requestAnimationFrame(updateMapPosition);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [lerp, shakeManager, playerRef]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden z-0 bg-gradient-to-br from-[#05080f] via-[#0a0e1a] via-[#0d1220] to-[#060812]"
      style={{
        '--player-x': '0px',
        '--player-y': '0px',
        '--center-x': `${centerX.current}px`,
        '--center-y': `${centerY.current}px`,
        '--shake-x': '0px',
        '--shake-y': '0px',
        contain: 'layout style paint',
        contentVisibility: 'auto'
      } as React.CSSProperties}
    >
      
      {/* LAYER 1: Enhanced Base Floor with Animated Noise */}
      <div 
        className="layer-1 absolute inset-0 w-full h-full opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='5' stitchTiles='stitch' seed='2'/%3E%3CfeColorMatrix values='0 0 0 0 0.2 0 0 0 0 0.4 0 0 0 0 0.8 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
          mixBlendMode: 'soft-light',
          animation: 'noiseShift 20s linear infinite'
        }}
      />

      {/* LAYER 2: Advanced Multi-Grid System with Glow */}
      <div 
        className="layer-1 absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(56, 189, 248, 0.015) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.015) 1px, transparent 1px),
            linear-gradient(to right, rgba(96, 165, 250, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(96, 165, 250, 0.05) 1px, transparent 1px),
            linear-gradient(to right, rgba(56, 189, 248, 0.12) 2px, transparent 2px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.12) 2px, transparent 2px),
            linear-gradient(to right, rgba(14, 165, 233, 0.2) 3px, transparent 3px),
            linear-gradient(to bottom, rgba(14, 165, 233, 0.2) 3px, transparent 3px),
            radial-gradient(circle, rgba(56, 189, 248, 0.8) 2px, transparent 3px),
            radial-gradient(circle, rgba(14, 165, 233, 0.6) 1px, transparent 2px)
          `,
          backgroundSize: `15px 15px, 15px 15px, 45px 45px, 45px 45px, 180px 180px, 180px 180px, 540px 540px, 540px 540px, 540px 540px, 180px 180px`,
          filter: 'drop-shadow(0 0 3px rgba(56, 189, 248, 0.4))'
        }}
      />

      {/* LAYER 3: Complex Hexagon Tech Pattern */}
      <div 
        className="layer-0-6 absolute inset-0 w-full h-full opacity-12"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='hex' width='100' height='87' patternUnits='userSpaceOnUse'%3E%3Cpath d='M50 0 L75 14.4 L75 43.3 L50 57.7 L25 43.3 L25 14.4 Z' fill='none' stroke='rgba(96, 165, 250, 0.4)' stroke-width='0.8'/%3E%3Cpath d='M50 0 L75 14.4 L75 43.3 L50 57.7 L25 43.3 L25 14.4 Z' fill='none' stroke='rgba(139, 92, 246, 0.2)' stroke-width='1.5' stroke-dasharray='3 3'/%3E%3Ccircle cx='50' cy='28.85' r='3' fill='rgba(56, 189, 248, 0.5)'/%3E%3Ccircle cx='75' cy='14.4' r='1.5' fill='rgba(139, 92, 246, 0.6)'/%3E%3Ccircle cx='25' cy='14.4' r='1.5' fill='rgba(139, 92, 246, 0.6)'/%3E%3Cline x1='50' y1='28.85' x2='75' y2='14.4' stroke='rgba(56, 189, 248, 0.2)' stroke-width='0.5'/%3E%3Cline x1='50' y1='28.85' x2='25' y2='14.4' stroke='rgba(56, 189, 248, 0.2)' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23hex)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
          animation: 'hexPulse 6s ease-in-out infinite'
        }}
      />

      {/* LAYER 4: Circuit Board with Data Flow */}
      <div 
        className="layer-0-4 absolute inset-0 w-full h-full opacity-8"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30 L120 30 L120 120 M180 30 L270 30 L270 120 M30 180 L120 180 L120 270 M180 180 L270 180 L270 270 M150 30 L150 120 M30 150 L120 150 M180 150 L270 150 M150 180 L150 270' stroke='rgba(139, 92, 246, 0.3)' stroke-width='1.5' fill='none'/%3E%3Cpath d='M120 30 L120 50 M30 150 L50 150 M270 120 L250 120' stroke='rgba(56, 189, 248, 0.5)' stroke-width='2' stroke-linecap='round'/%3E%3Ccircle cx='120' cy='30' r='4' fill='rgba(139, 92, 246, 0.6)'/%3E%3Ccircle cx='30' cy='180' r='4' fill='rgba(139, 92, 246, 0.6)'/%3E%3Ccircle cx='270' cy='120' r='4' fill='rgba(56, 189, 248, 0.7)'/%3E%3Ccircle cx='180' cy='270' r='4' fill='rgba(56, 189, 248, 0.7)'/%3E%3Crect x='145' y='145' width='10' height='10' fill='rgba(236, 72, 153, 0.4)' stroke='rgba(236, 72, 153, 0.6)' stroke-width='1'/%3E%3Crect x='25' y='25' width='10' height='10' fill='rgba(56, 189, 248, 0.3)' stroke='rgba(56, 189, 248, 0.5)' stroke-width='1'/%3E%3Crect x='265' y='265' width='10' height='10' fill='rgba(139, 92, 246, 0.3)' stroke='rgba(139, 92, 246, 0.5)' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '300px 300px'
        }}
      />

      {/* LAYER 5: Data Stream Lines */}
      <div 
        className="layer-0-35 absolute inset-0 w-full h-full opacity-6"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100 Q100 80 200 100 T400 100 M0 200 Q100 220 200 200 T400 200 M0 300 Q100 280 200 300 T400 300' stroke='rgba(56, 189, 248, 0.15)' stroke-width='1' fill='none' stroke-dasharray='10 5'/%3E%3Cpath d='M100 0 Q80 100 100 200 T100 400 M200 0 Q220 100 200 200 T200 400 M300 0 Q280 100 300 200 T300 400' stroke='rgba(139, 92, 246, 0.15)' stroke-width='1' fill='none' stroke-dasharray='8 4'/%3E%3C/svg%3E")`,
          backgroundSize: '400px 400px',
          animation: 'dataFlow 15s linear infinite'
        }}
      />

      {/* LAYER 6: Geometric Shapes */}
      <div 
        className="layer-0-5 absolute inset-0 w-full h-full opacity-8"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='250' height='250' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='125,30 170,90 150,150 100,150 80,90' fill='none' stroke='rgba(56, 189, 248, 0.2)' stroke-width='1'/%3E%3Ccircle cx='125' cy='125' r='40' fill='none' stroke='rgba(139, 92, 246, 0.2)' stroke-width='1' stroke-dasharray='5 5'/%3E%3Crect x='90' y='90' width='70' height='70' fill='none' stroke='rgba(236, 72, 153, 0.15)' stroke-width='1' transform='rotate(45 125 125)'/%3E%3Cline x1='125' y1='85' x2='125' y2='65' stroke='rgba(56, 189, 248, 0.3)' stroke-width='1.5'/%3E%3Cline x1='165' y1='125' x2='185' y2='125' stroke='rgba(56, 189, 248, 0.3)' stroke-width='1.5'/%3E%3Cline x1='125' y1='165' x2='125' y2='185' stroke='rgba(56, 189, 248, 0.3)' stroke-width='1.5'/%3E%3Cline x1='85' y1='125' x2='65' y2='125' stroke='rgba(56, 189, 248, 0.3)' stroke-width='1.5'/%3E%3C/svg%3E")`,
          backgroundSize: '250px 250px',
          animation: 'geometryRotate 30s linear infinite'
        }}
      />

      {/* LAYER 7: Glitch Scanlines */}
      <div 
        className="layer-0-8 absolute inset-0 w-full h-full opacity-4 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(56, 189, 248, 0.02) 0px, transparent 1px, transparent 2px, rgba(56, 189, 248, 0.02) 3px)',
          animation: 'glitchScan 12s linear infinite'
        }}
      />

      {/* LAYER 8: Animated Scanlines */}
      <div 
        className="absolute inset-0 w-full h-full opacity-6 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(56, 189, 248, 0.04) 0px, transparent 2px, transparent 4px, rgba(56, 189, 248, 0.04) 6px)',
          animation: 'scanline 10s linear infinite'
        }}
      />

      {/* LAYER 9: Particle Field */}
      <div 
        className="layer-0-25 absolute inset-0 w-full h-full opacity-25"
        style={{
          backgroundImage: `
            radial-gradient(circle, rgba(255, 255, 255, 0.9) 2px, transparent 3px),
            radial-gradient(circle, rgba(255, 255, 255, 0.6) 1px, transparent 2px),
            radial-gradient(circle, rgba(255, 255, 255, 0.3) 0.5px, transparent 1px),
            radial-gradient(circle, rgba(56, 189, 248, 0.4) 1.5px, transparent 2.5px),
            radial-gradient(circle, rgba(139, 92, 246, 0.4) 1px, transparent 2px)
          `,
          backgroundSize: '1200px 1200px, 600px 600px, 300px 300px, 800px 800px, 500px 500px',
          backgroundPosition: '0 0, 100px 100px, 200px 200px, 50px 50px, 150px 150px'
        }}
      />

      {/* LAYER 10: Hologram Grid */}
      <div 
        className="layer-0-7 absolute inset-0 w-full h-full opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='150' height='150' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 75 L150 75 M75 0 L75 150' stroke='rgba(56, 189, 248, 0.3)' stroke-width='0.5'/%3E%3Ccircle cx='75' cy='75' r='20' fill='none' stroke='rgba(139, 92, 246, 0.3)' stroke-width='0.5'/%3E%3Ccircle cx='75' cy='75' r='35' fill='none' stroke='rgba(56, 189, 248, 0.2)' stroke-width='0.5' stroke-dasharray='2 2'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px',
          animation: 'hologramPulse 8s ease-in-out infinite'
        }}
      />

      {/* LAYER 11: Nebula Dust Clouds */}
      <div 
        className="layer-0-12 absolute inset-0 w-full h-full opacity-25"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 15% 40%, rgba(139, 92, 246, 0.08) 0%, transparent 40%),
            radial-gradient(ellipse at 85% 20%, rgba(56, 189, 248, 0.08) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 80%, rgba(236, 72, 153, 0.06) 0%, transparent 40%),
            radial-gradient(ellipse at 70% 60%, rgba(14, 165, 233, 0.06) 0%, transparent 35%)
          `,
          backgroundSize: '100% 100%',
          filter: 'blur(40px)',
          animation: 'nebulaDrift 40s ease-in-out infinite'
        }}
      />

      {/* STATIC LAYERS (No parallax) */}
      
      {/* LAYER 12: Dynamic Vignette */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[rgba(5,9,20,0.95)] pointer-events-none"></div>
      
      {/* LAYER 13-16: Corner Accent Lights */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-[rgba(56,189,248,0.12)] via-[rgba(56,189,248,0.04)] to-transparent blur-3xl"></div>
        <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-radial from-[rgba(14,165,233,0.2)] to-transparent blur-2xl animate-pulse"></div>
      </div>
      
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-[rgba(139,92,246,0.12)] via-[rgba(139,92,246,0.04)] to-transparent blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-radial from-[rgba(168,85,247,0.2)] to-transparent blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-radial from-[rgba(236,72,153,0.08)] to-transparent pointer-events-none blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-[rgba(59,130,246,0.08)] to-transparent pointer-events-none blur-3xl"></div>
      
      {/* LAYER 17: Central Ambient Glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.15) 0%, transparent 50%)',
          animation: 'centralPulse 5s ease-in-out infinite'
        }}
      />

      {/* LAYER 18: Energy Rings */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-cyan-400/20 animate-ping" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full border border-purple-400/20 animate-ping" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
      </div>

      {/* LAYER 19: Floating UI Elements */}
      <div className="absolute top-10 left-10 opacity-20 pointer-events-none">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="w-20 h-0.5 bg-gradient-to-r from-cyan-400/50 to-transparent mt-1"></div>
      </div>
      <div className="absolute bottom-10 right-10 opacity-20 pointer-events-none">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="w-20 h-0.5 bg-gradient-to-l from-purple-400/50 to-transparent mb-1"></div>
      </div>

      {/* LAYER 20: Edge Glow Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent"></div>
        <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent"></div>
        <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-purple-400/20 to-transparent"></div>
      </div>

      <style>{`
        /* Hardware acceleration and performance optimization */
        .layer-1,
        .layer-0-8,
        .layer-0-7,
        .layer-0-6,
        .layer-0-5,
        .layer-0-4,
        .layer-0-35,
        .layer-0-25,
        .layer-0-12 {
          will-change: background-position;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          perspective: 1000px;
          contain: layout style paint;
        }
        
        /* Optimized parallax with hardware acceleration */
        .layer-1 {
          background-position: 
            calc(-1 * var(--player-x) + var(--center-x) + var(--shake-x)) 
            calc(-1 * var(--player-y) + var(--center-y) + var(--shake-y));
          transform: translateZ(0) scale(1.001);
        }
        
        .layer-0-8 {
          background-position: 
            calc(-0.8 * var(--player-x) + var(--center-x)) 
            calc(-0.8 * var(--player-y) + var(--center-y));
          transform: translateZ(0);
        }
        
        .layer-0-7 {
          background-position: 
            calc(-0.7 * var(--player-x) + var(--center-x)) 
            calc(-0.7 * var(--player-y) + var(--center-y));
          transform: translateZ(0);
        }
        
        .layer-0-6 {
          background-position: 
            calc(-0.6 * var(--player-x) + var(--center-x)) 
            calc(-0.6 * var(--player-y) + var(--center-y));
          transform: translateZ(0);
        }
        
        .layer-0-5 {
          background-position: 
            calc(-0.5 * var(--player-x) + var(--center-x)) 
            calc(-0.5 * var(--player-y) + var(--center-y));
          transform: translateZ(0);
        }
        
        .layer-0-4 {
          background-position: 
            calc(-0.4 * var(--player-x) + var(--center-x)) 
            calc(-0.4 * var(--player-y) + var(--center-y));
          transform: translateZ(0);
        }
        
        .layer-0-35 {
          background-position: 
            calc(-0.35 * var(--player-x) + var(--center-x)) 
            calc(-0.35 * var(--player-y) + var(--center-y));
          transform: translateZ(0);
        }
        
        .layer-0-25 {
          background-position: 
            calc(-0.25 * var(--player-x) + var(--center-x)) 
            calc(-0.25 * var(--player-y) + var(--center-y));
          transform: translateZ(0);
        }
        
        .layer-0-12 {
          background-position: 
            calc(-0.12 * var(--player-x) + var(--center-x)) 
            calc(-0.12 * var(--player-y) + var(--center-y));
          transform: translateZ(0);
        }
        
        /* Optimized animations with transform instead of position */
        @keyframes noiseShift {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(5%, 5%, 0); }
        }
        
        @keyframes scanline {
          0% { transform: translate3d(0, -100%, 0); }
          100% { transform: translate3d(0, 100%, 0); }
        }
        
        @keyframes glitchScan {
          0% { transform: translate3d(0, 0, 0) scaleY(1); }
          50% { transform: translate3d(0, 50vh, 0) scaleY(1.5); }
          100% { transform: translate3d(0, 100vh, 0) scaleY(1); }
        }
        
        @keyframes dataFlow {
          0% { background-position: 0 0; }
          100% { background-position: 400px 400px; }
        }
        
        @keyframes hexPulse {
          0%, 100% { opacity: 0.12; transform: scale3d(1, 1, 1); }
          50% { opacity: 0.18; transform: scale3d(1.02, 1.02, 1); }
        }
        
        @keyframes hologramPulse {
          0%, 100% { opacity: 0.10; filter: blur(0px); }
          50% { opacity: 0.15; filter: blur(1px); }
        }
        
        @keyframes geometryRotate {
          0% { transform: rotate3d(0, 0, 1, 0deg); }
          100% { transform: rotate3d(0, 0, 1, 360deg); }
        }
        
        @keyframes nebulaDrift {
          0%, 100% { transform: translate3d(0, 0, 0); }
          33% { transform: translate3d(-2%, 2%, 0); }
          66% { transform: translate3d(2%, -2%, 0); }
        }
        
        @keyframes centralPulse {
          0%, 100% { opacity: 0.15; transform: scale3d(1, 1, 1); }
          50% { opacity: 0.25; transform: scale3d(1.05, 1.05, 1); }
        }
      `}</style>
    </div>
  );
};

export default GameMap;