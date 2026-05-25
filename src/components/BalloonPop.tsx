import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, RefreshCcw, ArrowLeft, Target, Heart } from 'lucide-react';

import SuccessOverlay from './SuccessOverlay';

interface Balloon {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  points: number;
  isPopping: boolean;
  shape: 'oval' | 'heart' | 'star' | 'square';
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

const BALLOON_COLORS = [
  '#ff4d4d', '#4dff4d', '#4d4dff', '#ffff4d', '#ff4dff', '#4dffff', '#ffa500'
];

const BALLOON_SHAPES: Balloon['shape'][] = ['oval', 'heart', 'star', 'square'];

interface BalloonPopProps {
  onComplete?: () => void;
  isKidsMode?: boolean;
}

export default function BalloonPop({ onComplete, isKidsMode }: BalloonPopProps) {
  // Speed multiplier (0.5 to 1.5)
  const [speedMultiplier, setSpeedMultiplier] = useState(0.8);

  // Logic state (source of truth for the game loop)
  const gameRef = useRef({
    balloons: [] as Balloon[],
    lives: 5,
    score: 0,
    gameState: 'start' as 'start' | 'playing' | 'ended',
    highScore: 0
  });

  // UI state (re-renders the component)
  const [ui, setUi] = useState({
    balloons: [] as Balloon[],
    lives: 5,
    score: 0,
    gameState: 'start' as 'start' | 'playing' | 'ended'
  });

  const [particles, setParticles] = useState<Particle[]>([]);
  const [highScore, setHighScore] = useState(0);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const particleId = useRef(0);

  // Sync UI with Logic
  const syncUi = useCallback(() => {
    setUi({
      balloons: [...gameRef.current.balloons],
      lives: gameRef.current.lives,
      score: gameRef.current.score,
      gameState: gameRef.current.gameState
    });
  }, []);

  const playPopSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const noise = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(500 + Math.random() * 300, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.12);
      
      noise.type = 'triangle';
      noise.frequency.setValueAtTime(1200, audioCtx.currentTime);
      noise.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.04);

      gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
      
      oscillator.connect(gainNode);
      noise.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      noise.start();
      oscillator.stop(audioCtx.currentTime + 0.12);
      noise.stop(audioCtx.currentTime + 0.04);
      
      setTimeout(() => audioCtx.close(), 300);
    } catch (e) {
      console.warn('Audio blocked', e);
    }
  }, []);

  const createParticles = (x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2;
      const velocity = 4 + Math.random() * 10;
      newParticles.push({
        id: particleId.current++,
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 3,
        color,
        size: 5 + Math.random() * 8,
        life: 1.0
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const spawnBalloon = useCallback(() => {
    if (gameRef.current.gameState !== 'playing') return;
    
    const color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
    const shape = BALLOON_SHAPES[Math.floor(Math.random() * BALLOON_SHAPES.length)];
    const size = 80 + Math.random() * 40;
    
    // Calculate safer x position to avoid cut-offs on mobile
    // We use a tighter range (15% to 85%) to ensure the balloon and its decorations are visible
    const x = 12 + Math.random() * 76;
    
    const baseSpeed = 0.6 + Math.random() * 1.0 + (gameRef.current.score / 800); 
    const speed = baseSpeed * speedMultiplier;
    
    const newBalloon: Balloon = {
      id: nextId.current++,
      x,
      y: 110, 
      size,
      color,
      speed,
      points: 10,
      isPopping: false,
      shape
    };
    
    gameRef.current.balloons = [...gameRef.current.balloons, newBalloon];
    syncUi();
  }, [syncUi, speedMultiplier]);

  const processedEscapes = useRef(new Set<number>());

  const playLifeLossSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
      setTimeout(() => audioCtx.close(), 400);
    } catch (e) {}
  }, []);

  // Main Game Loop using requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = 0;
    let spawnTimer = 0;

    const gameLoop = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      if (gameRef.current.gameState === 'playing') {
        // Handle Spawning
        spawnTimer -= deltaTime;
        if (spawnTimer <= 0) {
          spawnBalloon();
          // Adjust spawn rate based on score and speed
          const spawnBase = Math.max(700, 1800 - (gameRef.current.score * 3));
          spawnTimer = spawnBase / speedMultiplier;
        }

        // Move Balloons and filter escaped ones in ONE pass
        const stillInPlay: Balloon[] = [];
        let escapedCount = 0;

        for (const b of gameRef.current.balloons) {
          const nextY = b.y - b.speed;
          
          if (nextY < -15) {
            // Check if this specific balloon has already been processed for escape
            if (!b.isPopping && !processedEscapes.current.has(b.id)) {
              escapedCount++;
              processedEscapes.current.add(b.id);
              playLifeLossSound();
            }
            // Balloon is removed regardless since it's out of bounds
          } else {
            stillInPlay.push({ ...b, y: nextY });
          }
        }

        if (escapedCount > 0) {
          gameRef.current.lives = isKidsMode ? 5 : Math.max(0, gameRef.current.lives - escapedCount);
          if (gameRef.current.lives === 0 && !isKidsMode) {
            gameRef.current.gameState = 'ended';
            if (gameRef.current.score >= 100) {
              onComplete?.();
            }
          }
        }

        gameRef.current.balloons = stillInPlay;
        syncUi();
      }

      // Update Particles in parallel UI state
      setParticles(prev => {
        if (prev.length === 0) return prev;
        return prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.5,
            life: p.life - 0.03
          }))
          .filter(p => p.life > 0);
      });

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [spawnBalloon, syncUi, speedMultiplier]);

  const popBalloon = (balloon: Balloon) => {
    if (gameRef.current.gameState !== 'playing' || balloon.isPopping) return;
    
    // Find in source of truth
    const targetIdx = gameRef.current.balloons.findIndex(b => b.id === balloon.id);
    if (targetIdx === -1) return;

    gameRef.current.balloons[targetIdx].isPopping = true;
    gameRef.current.score += 10;
    
    playPopSound();
    
    if (gameContainerRef.current) {
      const rect = gameContainerRef.current.getBoundingClientRect();
      const pX = (balloon.x / 100) * rect.width + (balloon.size / 2);
      const pY = (balloon.y / 100) * rect.height + (balloon.size * 0.6);
      createParticles(pX, pY, balloon.color);
    }

    // High score update
    if (gameRef.current.score > highScore) {
      setHighScore(gameRef.current.score);
    }

    setTimeout(() => {
      gameRef.current.balloons = gameRef.current.balloons.filter(b => b.id !== balloon.id);
    }, 100);
  };

  const startGame = () => {
    gameRef.current = {
      balloons: [],
      lives: 5,
      score: 0,
      gameState: 'playing',
      highScore: highScore
    };
    processedEscapes.current.clear();
    setParticles([]);
    syncUi();
  };

  return (
    <div 
      ref={gameContainerRef}
      className="h-full w-full bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden select-none touch-none"
      style={{ cursor: 'crosshair' }}
    >
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
        <div className="flex gap-4">
          <div className="bg-zinc-900/80 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/10 flex items-center gap-3 shadow-xl">
            <Trophy className="text-yellow-400" />
            <span className="text-2xl font-black text-white font-comic">{ui.score}</span>
          </div>
          <motion.div 
            key={`balloon-lives-${ui.lives}`}
            animate={ui.lives < 3 ? { scale: [1, 1.2, 1] } : {}}
            className="bg-zinc-900/80 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/10 flex items-center gap-3 shadow-xl"
          >
            <Heart className={ui.lives <= 1 ? 'text-red-500 fill-red-500 animate-pulse' : 'text-red-500 fill-red-500'} />
            <span className={`text-2xl font-black font-comic ${ui.lives <= 1 ? 'text-red-500' : 'text-white'}`}>{ui.lives}</span>
          </motion.div>
        </div>
        
        <div className="bg-zinc-900/80 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/10 text-zinc-500 font-bold hidden sm:block">
          Récord: {highScore}
        </div>
      </div>

      {/* Speed Control */}
      <div className="absolute bottom-6 left-6 z-40 bg-zinc-900/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 flex flex-col gap-2 shadow-2xl pointer-events-auto">
        <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-2">
          Velocidad: {Math.round(speedMultiplier * 100)}%
        </label>
        <input 
          type="range" 
          min="0.3" 
          max="1.5" 
          step="0.05" 
          value={speedMultiplier} 
          onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
          className="w-32 accent-cyan-500"
        />
      </div>

      {/* SVG Definitions for Clips */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="heart-clip" clipPathUnits="objectBoundingBox">
            <path d="M.5,1 C.5,1 0,.7 0,.35 A.25,.25 0 1,1 .5,.35 A.25,.25 0 1,1 1,.35 C1,.7 .5,1 .5,1" />
          </clipPath>
          <clipPath id="star-clip" clipPathUnits="objectBoundingBox">
            <path d="M.5,0 L.61,.35 L.98,.35 L.68,.57 L.79,.91 L.5,.7 L.21,.91 L.32,.57 L.02,.35 L.39,.35 Z" />
          </clipPath>
          <clipPath id="square-clip" clipPathUnits="objectBoundingBox">
            <rect x="0.1" y="0" width="0.8" height="0.9" rx="0.3" />
          </clipPath>
        </defs>
      </svg>

      {/* Game Area */}
      <div className="absolute inset-0">
        {ui.balloons.map(balloon => (
          <motion.div
            key={`balloon-item-${balloon.id}`}
            className="absolute flex flex-col items-center cursor-pointer select-none"
            style={{
              left: `${balloon.x}%`,
              top: `${balloon.y}%`,
              width: balloon.size,
              height: balloon.size * 1.5,
              zIndex: Math.floor(balloon.y)
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              popBalloon(balloon);
            }}
            animate={{
              x: balloon.isPopping ? 0 : [0, 5, -5, 0],
              scale: balloon.isPopping ? 2 : 1,
              opacity: balloon.isPopping ? 0 : 1,
              rotate: balloon.isPopping ? 0 : [-2, 2, -2]
            }}
            transition={{ 
              x: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 0.15 },
              opacity: { duration: 0.15 }
            }}
          >
            {/* Balloon Body */}
            <div 
              className={`relative w-full aspect-square shadow-2xl transition-colors duration-500 ${balloon.shape === 'oval' ? 'rounded-full' : ''}`}
              style={{
                backgroundColor: balloon.color,
                clipPath: balloon.shape === 'heart' 
                  ? 'url(#heart-clip)' 
                  : balloon.shape === 'star'
                  ? 'url(#star-clip)'
                  : balloon.shape === 'square'
                  ? 'url(#square-clip)'
                  : '',
                boxShadow: `inset -10px -10px 20px rgba(0,0,0,0.2)`,
                filter: `drop-shadow(0 0 12px ${balloon.color}55)`
              }}
            >
              {/* Shine Highlight */}
              <div className="absolute top-[12%] left-[18%] w-[25%] h-[15%] bg-white/40 rounded-full rotate-[35deg] blur-[1px]" />
              <div className="absolute top-[10%] left-[15%] w-[10%] h-[10%] bg-white/60 rounded-full blur-[2px]" />
            </div>

            {/* Balloon Knot (Pitorro) */}
            <div 
              className="w-4 h-3 -mt-1 z-0"
              style={{ 
                backgroundColor: balloon.color,
                clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
                opacity: 0.9,
                filter: 'brightness(0.9)'
              }}
            />

            {/* Balloon String (Cuerda) */}
            <div className="relative w-[2px] h-20 -mt-0.5 overflow-visible">
              <svg 
                width="20" 
                height="80" 
                viewBox="0 0 20 80" 
                className="absolute left-[-9px] top-0 opacity-50"
              >
                <path 
                  d="M10,0 Q15,20 10,40 Q5,60 10,80" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="1.2" 
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Particles Area */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {particles.map(p => (
          <div
            key={`particle-item-${p.id}`}
            className="absolute rounded-full shadow-lg"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              opacity: p.life,
              transform: `scale(${p.life})`,
              boxShadow: `0 0 10px ${p.color}`
            }}
          />
        ))}
      </div>

      {/* Screens */}
      <AnimatePresence>
        {ui.gameState === 'start' && (
          <motion.div
            key="balloon-start-screen"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="z-50 text-center flex flex-col items-center gap-8 bg-zinc-900/90 backdrop-blur-xl p-12 rounded-[3rem] border border-white/10 shadow-2xl"
          >
            <div className="relative">
              <Sparkles className="text-yellow-400 absolute -top-8 -left-8 animate-bounce" size={48} />
              <h2 className="text-6xl font-black text-white font-comic">EXPLOTA-GLOBOS</h2>
              <Sparkles className="text-yellow-400 absolute -bottom-8 -right-8 animate-bounce" size={48} style={{ animationDelay: '0.5s' }} />
            </div>
            <p className="text-2xl text-zinc-400 font-comic max-w-sm">
              ¡Divertirte explotando globos! ¡No dejes que escapen!
            </p>
            <button
              onClick={startGame}
              className="px-12 py-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black text-4xl rounded-3xl shadow-[0_10px_40px_-10px_rgba(6,182,212,0.5)] hover:scale-105 active:scale-95 transition-all"
            >
              ¡EMPEZAR!
            </button>
          </motion.div>
        )}

      <SuccessOverlay 
        key="balloon-success-overlay"
        isVisible={ui.gameState === 'ended' && !isKidsMode}
        title={ui.score >= 100 ? "¡GENIAL!" : "¡BIEN JUEGO!"}
        message={`Has conseguido ${ui.score} puntos`}
        points={ui.score}
        onAction={startGame}
        actionLabel="REINTENTAR"
      />
      </AnimatePresence>

      <div className="hidden sm:block pointer-events-none fixed z-[60] mix-blend-difference" id="crosshair" />
    </div>
  );
}
