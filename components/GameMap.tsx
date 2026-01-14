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
      className="fixed inset-0 overflow-hidden z-0 bg-[#0a0e1a]"
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
      {/* Simple Grid */}
      <div 
        className="layer-1 absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(56, 189, 248, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      <style>{`
        .layer-1 {
          will-change: background-position;
          transform: translate3d(0, 0, 0);
          background-position: 
            calc(-1 * var(--player-x) + var(--center-x) + var(--shake-x)) 
            calc(-1 * var(--player-y) + var(--center-y) + var(--shake-y));
        }
      `}</style>
    </div>
  );
};

export default GameMap;