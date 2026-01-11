
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  GameState, PlayerStats, Enemy, Projectile, Particle, ExpGem, HealthDrop,
  Buff, Question, FloatingText, GameHistory 
} from './types';
import { QUESTIONS, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import { getRandomRange, ScreenShake } from './utils';

// Components
import HUD from './components/HUD';
import LevelUpModal from './components/LevelUpModal';
import QuizModal from './components/QuizModal';
import LoadingScreen from './components/LoadingScreen';
import MainMenu from './components/MainMenu';
import GameOverScreen from './components/GameOverScreen';
import HistoryModal from './components/HistoryModal';
import TutorialModal from './components/TutorialModal';
import PolicyModal from './components/PolicyModal';

// Hooks & Logic
import { useInput } from './hooks/useInput';
import { loadGameHistory, saveGameHistory } from './logic/storage';
import { calculatePlayerDamage, generateLevelUpOptions, applyQuizResult } from './logic/gameRules';
import { INITIAL_STATS } from './logic/stats';
import { createHitEffect, updateParticles, updateFloatingTexts } from './logic/particles';
import { updatePlayerMovement, updateZoneLogic } from './logic/player';
import { updateGun, updateLightning, updateBook, updateNova } from './logic/weapons';
import { handleEnemySpawning, updateEnemies } from './logic/enemies';
import { updateProjectiles } from './logic/projectiles';
import { updateCollectibles } from './logic/collectibles';
import { renderGame } from './logic/renderer';

const App: React.FC = () => {
  // --- STATE ---
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [timer, setTimer] = useState(0);
  const [stats, setStats] = useState<PlayerStats>(INITIAL_STATS);
  const [activeBoss, setActiveBoss] = useState<Enemy | null>(null);
  
  // Menu UI States
  const [showHistory, setShowHistory] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Gameplay UI States
  const [levelUpOptions, setLevelUpOptions] = useState<Buff[]>([]);
  const [selectedBuff, setSelectedBuff] = useState<Buff | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  // --- REFS ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  
  const playerRef = useRef({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, size: 40 });
  
  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const gemsRef = useRef<ExpGem[]>([]);
  const healthDropsRef = useRef<HealthDrop[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  
  const shakeManager = useRef(new ScreenShake());
  const gameTimeRef = useRef(0);
  const spawnTimerRef = useRef(0);
  // Weapon timers
  const weaponTimersRef = useRef({ gun: 0, book: 0, lightning: 0, nova: 0 });
  const iFrameRef = useRef(0);
  const statsRef = useRef<PlayerStats>(INITIAL_STATS);
  
  const zoneRef = useRef({ active: false, radius: 0, center: { x: 0, y: 0 }, lastTriggeredLevel: 0 });
  const bossFlags = useRef({ boss1: false, boss2: false, boss3: false });

  // Custom Hooks
  const keysRef = useInput();

  // Sync state ref for render loop
  useEffect(() => { statsRef.current = stats; }, [stats]);

  // Load History on Mount
  useEffect(() => {
    setHistory(loadGameHistory());
  }, []);

  // --- ACTIONS ---

  const handleSaveHistory = (finalStats: PlayerStats, time: number) => {
    const updated = saveGameHistory(history, finalStats, time);
    setHistory(updated);
  };

  const startLoading = (nextState: GameState, delay = 2000) => {
    setGameState(GameState.LOADING);
    setLoadingProgress(0);
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setGameState(nextState);
    }, delay);
  };

  const startGame = () => {
    setTimer(0);
    setStats(INITIAL_STATS);
    setActiveBoss(null);
    gameTimeRef.current = 0;
    
    // Reset Entities
    enemiesRef.current = [];
    projectilesRef.current = [];
    gemsRef.current = [];
    healthDropsRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    playerRef.current = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, size: 40 };
    weaponTimersRef.current = { gun: 0, book: 0, lightning: 0, nova: 0 };
    zoneRef.current = { active: false, radius: 0, center: {x:0, y:0}, lastTriggeredLevel: 0 };
    bossFlags.current = { boss1: false, boss2: false, boss3: false };
    
    lastTimeRef.current = performance.now();
    startLoading(GameState.PLAYING);
  };

  const handleGameOver = () => {
    handleSaveHistory(statsRef.current, gameTimeRef.current);
    startLoading(GameState.GAMEOVER, 1500);
  };

  const backToMenu = () => { startLoading(GameState.MENU, 1000); };

  // Core Damage Logic
  const takeDamage = useCallback((amount: number) => {
    if (iFrameRef.current > 0) return;
    
    setStats(prev => calculatePlayerDamage(
        prev, 
        amount, 
        shakeManager.current, 
        playerRef.current, 
        particlesRef.current, 
        floatingTextsRef.current
    ));
    
    iFrameRef.current = 0.5;
  }, []);

  // Level Up Logic
  const handleLevelUp = useCallback(() => {
    setLevelUpOptions(generateLevelUpOptions());
    setGameState(GameState.LEVEL_UP);
  }, []);

  const handleBuffSelect = (buff: Buff) => {
    setSelectedBuff(buff);
    const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    setCurrentQuestion(q);
    setGameState(GameState.QUIZ);
  };

  const handleQuizResult = (correct: boolean) => {
     setStats(prev => applyQuizResult(prev, selectedBuff, correct));
     setGameState(GameState.PLAYING);
     lastTimeRef.current = performance.now();
  };

  // --- GAME LOOP ---

  const update = useCallback((deltaTime: number) => {
    if (gameState !== GameState.PLAYING) return;
    const dt = deltaTime / 1000;
    gameTimeRef.current += dt;
    setTimer(Math.floor(gameTimeRef.current));
    shakeManager.current.update();

    const s = statsRef.current;

    // 1. Player & Zone
    updateZoneLogic(s, zoneRef.current, playerRef.current, floatingTextsRef.current, dt);
    // PASS ACTIVE BOSS TO PLAYER MOVEMENT FOR BLACK HOLE LOGIC
    updatePlayerMovement(playerRef.current, keysRef.current, s, zoneRef.current, dt, activeBoss);

    // 2. Enemy Spawning
    spawnTimerRef.current += dt;
    const spawnInterval = Math.max(0.05, 0.5 - (s.level * 0.01) - (gameTimeRef.current * 0.0005));
    if (spawnTimerRef.current >= spawnInterval) {
      handleEnemySpawning(
        gameTimeRef.current,
        playerRef.current,
        bossFlags.current,
        enemiesRef.current,
        setActiveBoss
      );
      spawnTimerRef.current = 0;
    }

    // 3. Weapons & Projectiles
    updateGun(dt, weaponTimersRef.current, s, playerRef.current, enemiesRef.current, projectilesRef.current, particlesRef.current);
    updateLightning(dt, weaponTimersRef.current, s, playerRef.current, enemiesRef.current, particlesRef.current, floatingTextsRef.current, shakeManager.current);
    updateBook(dt, gameTimeRef.current, s, playerRef.current, enemiesRef.current, particlesRef.current, floatingTextsRef.current);
    updateNova(dt, weaponTimersRef.current, s, playerRef.current, enemiesRef.current, particlesRef.current, floatingTextsRef.current, shakeManager.current);

    projectilesRef.current = updateProjectiles(dt, projectilesRef.current, enemiesRef.current, playerRef.current, particlesRef.current, floatingTextsRef.current, takeDamage);

    // 4. Enemies
    updateEnemies(
      dt, 
      gameTimeRef.current, 
      playerRef.current, 
      enemiesRef.current, 
      projectilesRef.current, 
      particlesRef.current, 
      shakeManager.current,
      takeDamage, 
      iFrameRef.current
    );
    if (iFrameRef.current > 0) iFrameRef.current -= dt;

    // 5. Deaths & Drops & SPLITTER LOGIC
    const newMinis: Enemy[] = [];
    enemiesRef.current.forEach(e => {
      if (e.hp <= 0) {
        if (e.aiType !== 'KAMIKAZE') {
            setStats(prev => ({ ...prev, kills: prev.kills + 1 }));
            
            // --- SPLITTER SPAWN LOGIC ---
            if (e.type === 'SPLITTER') {
                for(let k=0; k<3; k++) {
                   newMinis.push({
                      id: Math.random().toString(),
                      x: e.x + getRandomRange(-20, 20), y: e.y + getRandomRange(-20, 20),
                      width: 25, height: 25,
                      type: 'MINI', aiType: 'MINI', hp: e.maxHP * 0.3, maxHP: e.maxHP * 0.3,
                      speed: 180, damage: 10, color: '#34d399', borderColor: '#064e3b',
                      flashTime: 0, attackRange: 0, attackPattern: 'BASIC'
                   });
                }
                // Slime explosion particles
                for(let j=0; j<10; j++) {
                     particlesRef.current.push({
                        id: Math.random().toString(), x: e.x, y: e.y, width:0, height:0,
                        vx: getRandomRange(-100, 100), vy: getRandomRange(-100, 100),
                        life: 0.5, maxLife: 0.5, color: '#10b981', size: 5, type: 'SQUARE', drag: 0.9, growth: -2
                     });
                }
            }
            // ----------------------------

            let xpAmount = 25; let xpSize = 12; let heartChance = 0.01; let healAmount = 10;
            if (e.type.includes('BOSS')) { xpAmount = 2000; xpSize = 24; heartChance = 1.0; healAmount = 100; } 
            else if (e.type === 'ELITE') { xpAmount = 200; xpSize = 16; heartChance = 0.15; healAmount = 40; } 
            else if (e.type === 'EXPLODER') { xpAmount = 40; xpSize = 12; heartChance = 0.02; healAmount = 15; }
            else if (e.type === 'SPLITTER') { xpAmount = 60; xpSize = 14; heartChance = 0.05; }
            
            gemsRef.current.push({
              id: Math.random().toString(), x: e.x, y: e.y, width: xpSize, height: xpSize,
              amount: xpAmount, color: 'oklch(0.5635 0.2408 260.8178)'
            });
            if (Math.random() < heartChance) {
                healthDropsRef.current.push({
                    id: Math.random().toString(), x: e.x + getRandomRange(-20, 20), y: e.y + getRandomRange(-20, 20),
                    width: 24, height: 24, healAmount, life: 30
                });
            }
        }
        createHitEffect(particlesRef.current, floatingTextsRef.current, e.x, e.y, e.color, 0, true); 
        if (activeBoss && e.id === activeBoss.id) setActiveBoss(null);
      }
    });
    
    // Filter dead enemies AND Add new minis
    enemiesRef.current = enemiesRef.current.filter(e => e.hp > 0).concat(newMinis);

    // 6. Collectibles
    const { nextGems, nextHealth } = updateCollectibles(
        dt, 
        gemsRef.current, 
        healthDropsRef.current, 
        playerRef.current, 
        s, 
        setStats, 
        handleLevelUp, 
        floatingTextsRef.current
    );
    gemsRef.current = nextGems;
    healthDropsRef.current = nextHealth;

    // 7. Sync & Cleanup
    if (activeBoss) {
        const bossRef = enemiesRef.current.find(e => e.id === activeBoss.id);
        if (bossRef) setActiveBoss({...bossRef}); 
        else setActiveBoss(null);
    }
    
    particlesRef.current = updateParticles(particlesRef.current, dt);
    floatingTextsRef.current = updateFloatingTexts(floatingTextsRef.current, dt);

    if (s.hp <= 0) handleGameOver();
  }, [gameState, activeBoss, takeDamage, handleLevelUp]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const offsets = shakeManager.current.getOffsets();

    renderGame(ctx, {
        stats: statsRef.current,
        player: playerRef.current,
        enemies: enemiesRef.current,
        projectiles: projectilesRef.current,
        particles: particlesRef.current,
        floatingTexts: floatingTextsRef.current,
        gems: gemsRef.current,
        healthDrops: healthDropsRef.current,
        zone: zoneRef.current,
        gameTime: gameTimeRef.current,
        offsets: offsets
    });

  }, [stats, activeBoss]);

  const loop = useCallback((time: number) => {
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    update(deltaTime);
    draw();
    requestRef.current = requestAnimationFrame(loop);
  }, [update, draw]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [loop]);

  // --- RENDER ---
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white flex items-center justify-center font-sans">
      
      {gameState === GameState.LOADING && <LoadingScreen progress={loadingProgress} />}

      {gameState === GameState.MENU && (
        <MainMenu 
          onStart={startGame}
          onShowHistory={() => setShowHistory(true)}
          onShowTutorial={() => setShowTutorial(true)}
          onShowPolicy={() => setShowPolicy(true)}
        />
      )}

      {gameState === GameState.GAMEOVER && (
        <GameOverScreen 
          stats={stats}
          onRetry={startGame}
          onMenu={backToMenu}
        />
      )}

      {showHistory && <HistoryModal history={history} onClose={() => setShowHistory(false)} />}
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
      {showPolicy && <PolicyModal onClose={() => setShowPolicy(false)} />}

      {gameState === GameState.LEVEL_UP && <LevelUpModal options={levelUpOptions} onSelect={handleBuffSelect} />}
      {gameState === GameState.QUIZ && currentQuestion && selectedBuff && <QuizModal question={currentQuestion} selectedBuff={selectedBuff} onAnswer={handleQuizResult} />}
      
      {(gameState === GameState.PLAYING || gameState === GameState.LEVEL_UP || gameState === GameState.QUIZ) && <HUD stats={stats} timer={timer} activeBoss={activeBoss} />}

      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full object-contain cursor-crosshair" />
    </div>
  );
};

export default App;