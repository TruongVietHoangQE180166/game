
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  GameState, PlayerStats, Enemy, Projectile, Particle, ExpGem, HealthDrop, ArmorDrop,
  Buff, Question, FloatingText, GameHistory, Rarity 
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
import VictoryScreen from './components/VictoryScreen';
import HistoryModal from './components/HistoryModal';
import TutorialModal from './components/TutorialModal';
import PolicyModal from './components/PolicyModal';
import NameInputModal from './components/NameInputModal';
import LeaderboardModal from './components/LeaderboardModal';
import GameMap from './components/GameMap'; // NEW

// Hooks & Logic
import { useInput } from './hooks/useInput';
import { loadGameHistory, saveGameHistory } from './logic/storage';
import { calculatePlayerDamage, generateLevelUpOptions, applyQuizResult, generateFixedRarityOptions } from './logic/gameRules';
import { INITIAL_STATS } from './logic/stats';
import { createHitEffect, updateParticles, updateFloatingTexts } from './logic/particles';
import { updatePlayerMovement, updateZoneLogic, ZoneState } from './logic/player';
import { updateGun, updateLightning, updateBook, updateNova } from './logic/weapons';
import { handleEnemySpawning, updateEnemies } from './logic/enemies';
import { updateProjectiles } from './logic/projectiles';
import { updateCollectibles } from './logic/collectibles';
import { renderGame } from './logic/renderer';
import { submitScoreToSupabase } from './logic/supabaseClient';

const App: React.FC = () => {
  // --- STATE ---
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [timer, setTimer] = useState(0);
  const [stats, setStats] = useState<PlayerStats>(INITIAL_STATS);
  const [activeBosses, setActiveBosses] = useState<Enemy[]>([]);
  const [playerName, setPlayerName] = useState<string>('USER');
  
  // Menu UI States
  const [showHistory, setShowHistory] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Gameplay UI States
  const [levelUpOptions, setLevelUpOptions] = useState<Buff[]>([]);
  const [selectedBuff, setSelectedBuff] = useState<Buff | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [bossRewardTitle, setBossRewardTitle] = useState<{title: string, tagline: string} | null>(null);

  // Rewards State
  const [rewardsRemaining, setRewardsRemaining] = useState(0);
  const [currentRewardRarity, setCurrentRewardRarity] = useState<Rarity>(Rarity.COMMON);

  // --- REFS ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  
  const playerRef = useRef({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, size: 40 });
  
  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const gemsRef = useRef<ExpGem[]>([]);
  const healthDropsRef = useRef<HealthDrop[]>([]);
  const armorDropsRef = useRef<ArmorDrop[]>([]); 
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  
  const shakeManager = useRef(new ScreenShake());
  const gameTimeRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const weaponTimersRef = useRef({ gun: 0, book: 0, lightning: 0, nova: 0 });
  const iFrameRef = useRef(0);
  const statsRef = useRef<PlayerStats>(INITIAL_STATS);
  
  const zoneRef = useRef<ZoneState>({ active: false, radius: 0, center: { x: 0, y: 0 }, lastBossId: null });
  
  const bossTrackerRef = useRef({ 
    boss1Spawned: false, boss1DeathTime: null as number | null,
    boss2Spawned: false, boss2DeathTime: null as number | null,
    boss3Spawned: false, boss3DeathTime: null as number | null,
    tripleBossSpawned: false 
  });
  
  const winTriggeredRef = useRef(false);
  const gameOverTriggeredRef = useRef(false);
  const availableQuestionIndicesRef = useRef<number[]>([]);
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
    submitScoreToSupabase({
        name: playerName,
        time_survived: Math.floor(time),
        level: finalStats.level,
        kills: finalStats.kills
    });
  };

  const startLoading = (nextState: GameState, delay = 3000) => {
    setGameState(GameState.LOADING);
    setLoadingProgress(0);
    const updateInterval = 50;
    const baseIncrement = 100 / (delay / updateInterval);

    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return Math.min(100, prev + (baseIncrement * ((Math.random() * 1.0) + 0.5)));
      });
    }, updateInterval);

    setTimeout(() => { clearInterval(interval); setGameState(nextState); }, delay);
  };

  const handleStartRequest = () => setShowNameInput(true);
  const handleNameConfirm = (name: string) => { setPlayerName(name); setShowNameInput(false); startGame(); };

  const startGame = () => {
    setTimer(0); setStats(INITIAL_STATS); setActiveBosses([]); gameTimeRef.current = 0;
    enemiesRef.current = []; projectilesRef.current = []; gemsRef.current = []; healthDropsRef.current = [];
    armorDropsRef.current = []; particlesRef.current = []; floatingTextsRef.current = [];
    playerRef.current = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, size: 40 };
    weaponTimersRef.current = { gun: 0, book: 0, lightning: 0, nova: 0 };
    zoneRef.current = { active: false, radius: 0, center: {x:0, y:0}, lastBossId: null };
    setRewardsRemaining(0); availableQuestionIndicesRef.current = [];
    bossTrackerRef.current = { boss1Spawned: false, boss1DeathTime: null, boss2Spawned: false, boss2DeathTime: null, boss3Spawned: false, boss3DeathTime: null, tripleBossSpawned: false };
    winTriggeredRef.current = false; gameOverTriggeredRef.current = false;
    lastTimeRef.current = performance.now();
    startLoading(GameState.PLAYING, 4500);
  };

  const handleGameOver = () => {
    if (gameOverTriggeredRef.current || winTriggeredRef.current) return;
    gameOverTriggeredRef.current = true;
    handleSaveHistory(statsRef.current, gameTimeRef.current);
    startLoading(GameState.GAMEOVER, 1500);
  };
  
  const handleWin = () => {
      if (winTriggeredRef.current || gameOverTriggeredRef.current) return;
      winTriggeredRef.current = true;
      handleSaveHistory(statsRef.current, gameTimeRef.current);
      setTimeout(() => { setGameState(GameState.WIN); }, 2000);
  };

  const backToMenu = () => { startLoading(GameState.MENU, 1000); };

  const takeDamage = useCallback((amount: number) => {
    if (iFrameRef.current > 0) return;
    setStats(prev => calculatePlayerDamage(prev, amount, shakeManager.current, playerRef.current, particlesRef.current, floatingTextsRef.current));
    iFrameRef.current = 0.5;
  }, []);

  const handleLevelUp = useCallback(() => {
    setLevelUpOptions(generateLevelUpOptions());
    setGameState(GameState.LEVEL_UP);
  }, []);

  const handleBuffSelect = (buff: Buff) => {
    setSelectedBuff(buff);
    if (availableQuestionIndicesRef.current.length === 0) availableQuestionIndicesRef.current = QUESTIONS.map((_, index) => index);
    const poolIndex = Math.floor(Math.random() * availableQuestionIndicesRef.current.length);
    const questionIndex = availableQuestionIndicesRef.current[poolIndex];
    availableQuestionIndicesRef.current.splice(poolIndex, 1);
    setCurrentQuestion(QUESTIONS[questionIndex]);
    setGameState(GameState.QUIZ);
  };

  const handleBossRewardSelect = (buff: Buff) => {
      setStats(prev => buff.effect(prev));
      const nextRemaining = rewardsRemaining - 1;
      setRewardsRemaining(nextRemaining);
      if (nextRemaining > 0) {
          setLevelUpOptions(generateFixedRarityOptions(currentRewardRarity));
          setBossRewardTitle(prev => prev ? { ...prev, tagline: prev.tagline.replace('(1/2)', '(2/2)') } : null);
      } else {
          setGameState(GameState.PLAYING);
          lastTimeRef.current = performance.now();
      }
  };

  const handleQuizResult = (correct: boolean) => {
     setStats(prev => applyQuizResult(prev, selectedBuff, correct));
     setGameState(GameState.PLAYING);
     lastTimeRef.current = performance.now();
  };

  const update = useCallback((deltaTime: number) => {
    if (gameState !== GameState.PLAYING) return;
    const dt = deltaTime / 1000;
    gameTimeRef.current += dt;
    setTimer(Math.floor(gameTimeRef.current));
    shakeManager.current.update();
    const s = statsRef.current;

    if (s.hp < s.maxHP || s.currentArmor < s.maxArmor) {
        setStats(prev => ({
            ...prev,
            hp: Math.min(prev.maxHP, prev.hp + (prev.hpRegen * dt)),
            currentArmor: Math.min(prev.maxArmor, prev.currentArmor + (prev.armorRegen * dt))
        }));
    }

    updateZoneLogic(zoneRef.current, playerRef.current, floatingTextsRef.current, dt, activeBosses);
    updatePlayerMovement(playerRef.current, keysRef.current, s, zoneRef.current, dt, activeBosses);

    spawnTimerRef.current += dt;
    const spawnInterval = Math.max(1.0, 3.0 - (s.level * 0.05) - (gameTimeRef.current * 0.002));
    if (spawnTimerRef.current >= spawnInterval) {
      handleEnemySpawning(gameTimeRef.current, playerRef.current, bossTrackerRef.current, enemiesRef.current, setActiveBosses);
      spawnTimerRef.current = 0;
    }

    updateGun(dt, weaponTimersRef.current, s, playerRef.current, enemiesRef.current, projectilesRef.current, particlesRef.current);
    updateLightning(dt, weaponTimersRef.current, s, playerRef.current, enemiesRef.current, particlesRef.current, floatingTextsRef.current, shakeManager.current);
    updateBook(dt, gameTimeRef.current, s, playerRef.current, enemiesRef.current, particlesRef.current, floatingTextsRef.current);
    updateNova(dt, weaponTimersRef.current, s, playerRef.current, enemiesRef.current, particlesRef.current, floatingTextsRef.current, shakeManager.current);

    projectilesRef.current = updateProjectiles(dt, projectilesRef.current, enemiesRef.current, playerRef.current, particlesRef.current, floatingTextsRef.current, takeDamage);

    updateEnemies(dt, gameTimeRef.current, playerRef.current, enemiesRef.current, projectilesRef.current, particlesRef.current, shakeManager.current, takeDamage, iFrameRef.current);
    if (iFrameRef.current > 0) iFrameRef.current -= dt;

    const newMinis: Enemy[] = [];
    enemiesRef.current.forEach(e => {
      if (e.hp <= 0) {
        if (e.aiType !== 'KAMIKAZE') {
            setStats(prev => ({ ...prev, kills: prev.kills + 1 }));
            if (!bossTrackerRef.current.tripleBossSpawned) {
                if (e.type === 'BOSS_1') {
                    bossTrackerRef.current.boss1DeathTime = gameTimeRef.current;
                    setGameState(GameState.BOSS_REWARD);
                    setRewardsRemaining(2);
                    setCurrentRewardRarity(Rarity.LEGENDARY);
                    setLevelUpOptions(generateFixedRarityOptions(Rarity.LEGENDARY));
                    setBossRewardTitle({ title: "BOSS 1 ĐÃ DIỆT!", tagline: "// PHẦN THƯỞNG HUYỀN THOẠI (1/2) //" });
                }
                else if (e.type === 'BOSS_2') {
                    bossTrackerRef.current.boss2DeathTime = gameTimeRef.current;
                    setGameState(GameState.BOSS_REWARD);
                    setRewardsRemaining(2);
                    setCurrentRewardRarity(Rarity.MYTHIC);
                    setLevelUpOptions(generateFixedRarityOptions(Rarity.MYTHIC));
                    setBossRewardTitle({ title: "BOSS 2 ĐÃ DIỆT!", tagline: "// PHẦN THƯỞNG THẦN THOẠI (1/2) //" });
                }
                else if (e.type === 'BOSS_3') {
                    bossTrackerRef.current.boss3DeathTime = gameTimeRef.current;
                    setGameState(GameState.BOSS_REWARD);
                    setRewardsRemaining(2);
                    setCurrentRewardRarity(Rarity.GODLY);
                    setLevelUpOptions(generateFixedRarityOptions(Rarity.GODLY));
                    setBossRewardTitle({ title: "BOSS 3 ĐÃ DIỆT!", tagline: "// PHẦN THƯỞNG THƯỢNG CỔ (1/2) //" });
                }
            }
            
            if (e.type === 'SPLITTER') {
                for(let k=0; k<3; k++) {
                   newMinis.push({
                      id: Math.random().toString(), x: e.x + getRandomRange(-20, 20), y: e.y + getRandomRange(-20, 20),
                      width: 62, height: 62, type: 'MINI', aiType: 'MINI', hp: e.maxHP * 0.3, maxHP: e.maxHP * 0.3,
                      speed: 180, damage: 10, color: '#34d399', borderColor: '#064e3b', flashTime: 0, attackRange: 0, attackPattern: 'BASIC'
                   });
                }
                for(let j=0; j<10; j++) particlesRef.current.push({ id: Math.random().toString(), x: e.x, y: e.y, width:0, height:0, vx: getRandomRange(-100, 100), vy: getRandomRange(-100, 100), life: 0.5, maxLife: 0.5, color: '#10b981', size: 5, type: 'SQUARE', drag: 0.9, growth: -2 });
            }

            let xpAmount = 300; let xpSize = 12; let heartChance = 0.01; let healAmount = 10; let armorChance = 0.005; let armorAmount = 20;
            if (e.type.includes('BOSS')) { xpAmount = 50000; xpSize = 24; heartChance = 1.0; healAmount = 100; armorChance = 1.0; armorAmount = 100; } 
            else if (e.type === 'ELITE') { xpAmount = 8000; xpSize = 16; heartChance = 0.15; healAmount = 40; armorChance = 0.1; armorAmount = 50; } 
            else if (e.type === 'EXPLODER') { xpAmount = 1000; xpSize = 12; heartChance = 0.02; healAmount = 15; armorChance = 0.02; }
            else if (e.type === 'SPLITTER') { xpAmount = 1500; xpSize = 14; heartChance = 0.05; }
            
            gemsRef.current.push({ id: Math.random().toString(), x: e.x, y: e.y, width: xpSize, height: xpSize, amount: xpAmount, color: 'oklch(0.5635 0.2408 260.8178)' });
            if (Math.random() < heartChance) healthDropsRef.current.push({ id: Math.random().toString(), x: e.x + getRandomRange(-20, 20), y: e.y + getRandomRange(-20, 20), width: 24, height: 24, healAmount, life: 30 });
            if (Math.random() < armorChance) armorDropsRef.current.push({ id: Math.random().toString(), x: e.x + getRandomRange(-20, 20), y: e.y + getRandomRange(-20, 20), width: 24, height: 24, restoreAmount: armorAmount, life: 30 });
        }
        createHitEffect(particlesRef.current, floatingTextsRef.current, e.x, e.y, e.color, 0, true); 
        if (e.aiType === 'BOSS') setActiveBosses(prev => prev.filter(b => b.id !== e.id));
      }
    });
    enemiesRef.current = enemiesRef.current.filter(e => e.hp > 0).concat(newMinis);

    if (bossTrackerRef.current.tripleBossSpawned && !winTriggeredRef.current) {
        if (enemiesRef.current.filter(e => e.aiType === 'BOSS').length === 0) handleWin();
    }

    const { nextGems, nextHealth, nextArmor } = updateCollectibles(dt, gemsRef.current, healthDropsRef.current, armorDropsRef.current, playerRef.current, s, setStats, handleLevelUp, floatingTextsRef.current);
    gemsRef.current = nextGems; healthDropsRef.current = nextHealth; armorDropsRef.current = nextArmor;

    if (activeBosses.length > 0) setActiveBosses(enemiesRef.current.filter(e => e.aiType === 'BOSS'));
    particlesRef.current = updateParticles(particlesRef.current, dt);
    floatingTextsRef.current = updateFloatingTexts(floatingTextsRef.current, dt);
    if (s.hp <= 0) handleGameOver();
  }, [gameState, activeBosses, takeDamage, handleLevelUp, rewardsRemaining, currentRewardRarity]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const offsets = shakeManager.current.getOffsets();
    renderGame(ctx, {
        stats: statsRef.current, player: playerRef.current, enemies: enemiesRef.current,
        projectiles: projectilesRef.current, particles: particlesRef.current, floatingTexts: floatingTextsRef.current,
        gems: gemsRef.current, healthDrops: healthDropsRef.current, armorDrops: armorDropsRef.current,
        zone: zoneRef.current, gameTime: gameTimeRef.current, offsets: offsets
    });
  }, [stats, activeBosses]);

  const loop = useCallback((time: number) => {
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    update(deltaTime);
    draw();
    requestRef.current = requestAnimationFrame(loop);
  }, [update, draw]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [loop]);

  // --- RENDER ---
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#111827] flex items-center justify-center font-sans">
      
      {/* Background Map - Shows only when playing/paused to avoid clutter in menu */}
      {gameState !== GameState.MENU && gameState !== GameState.LOADING && (
          <GameMap 
            playerRef={playerRef} 
            shakeManager={shakeManager} 
            canvasWidth={CANVAS_WIDTH} 
            canvasHeight={CANVAS_HEIGHT} 
          />
      )}

      {gameState === GameState.LOADING && <LoadingScreen progress={loadingProgress} />}
      {gameState === GameState.MENU && <MainMenu onStart={handleStartRequest} onShowHistory={() => setShowHistory(true)} onShowTutorial={() => setShowTutorial(true)} onShowPolicy={() => setShowPolicy(true)} onShowLeaderboard={() => setShowLeaderboard(true)} />}
      {gameState === GameState.GAMEOVER && <GameOverScreen stats={stats} onRetry={startGame} onMenu={backToMenu} />}
      {gameState === GameState.WIN && <VictoryScreen stats={stats} onRetry={startGame} onMenu={backToMenu} />}

      {showHistory && <HistoryModal history={history} onClose={() => setShowHistory(false)} />}
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
      {showPolicy && <PolicyModal onClose={() => setShowPolicy(false)} />}
      {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
      {showNameInput && <NameInputModal onConfirm={handleNameConfirm} onCancel={() => setShowNameInput(false)} />}

      {gameState === GameState.LEVEL_UP && <LevelUpModal options={levelUpOptions} onSelect={handleBuffSelect} />}
      {gameState === GameState.BOSS_REWARD && <LevelUpModal options={levelUpOptions} onSelect={handleBossRewardSelect} title={bossRewardTitle?.title} tagline={bossRewardTitle?.tagline} />}
      {gameState === GameState.QUIZ && currentQuestion && selectedBuff && <QuizModal question={currentQuestion} selectedBuff={selectedBuff} onAnswer={handleQuizResult} />}
      
      {(gameState === GameState.PLAYING || gameState === GameState.LEVEL_UP || gameState === GameState.QUIZ || gameState === GameState.BOSS_REWARD) && <HUD stats={stats} timer={timer} activeBosses={activeBosses} />}

      {/* Main Game Canvas (Transparent Background) */}
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="absolute inset-0 w-full h-full object-contain cursor-crosshair z-10" />
    </div>
  );
};

export default App;
