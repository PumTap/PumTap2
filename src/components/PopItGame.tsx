import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, RotateCcw, Play, Zap, Timer } from 'lucide-react';

const BUTTON_COUNT = 10;
const INITIAL_SPEED = 800; // ms between flashes
const MIN_SPEED = 200;
const ROUNDS_PER_LEVEL = 10;

// --- Sound Synthesizer ---
const playSound = (freq: number, type: OscillatorType, duration: number, volume: number) => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
    
    setTimeout(() => audioCtx.close(), duration * 1000 + 100);
  } catch (e) {
    console.error('Audio error:', e);
  }
};

const playSequenceSound = (index: number) => {
  const freqs = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25];
  playSound(freqs[index % freqs.length], 'sine', 0.2, 0.3);
};

const playFailSound = () => {
  playSound(150, 'sawtooth', 0.4, 0.2);
};

const playSuccessSound = () => {
  playSound(880, 'sine', 0.1, 0.2);
  setTimeout(() => playSound(1108.73, 'sine', 0.2, 0.2), 100);
};

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  createdAt: number;
}

export default function PopItGame({ onComplete, isKidsMode }: { onComplete?: () => void; isKidsMode?: boolean }) {
  const [status, setStatus] = useState<'idle' | 'playing' | 'gameOver' | 'nextLevel'>('idle');
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [activeBubbles, setActiveBubbles] = useState<Bubble[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [timeLeft, setTimeLeft] = useState(7);
  const [bestScore, setBestScore] = useState(() => parseInt(localStorage.getItem('popit_high_score') || '0'));

  const containerRef = useRef<HTMLDivElement>(null);
  const bubbleIdRef = useRef(0);
  const particleIdRef = useRef(0);

  // Background Music Loop (Fun & Bouncy)
  useEffect(() => {
    if (status === 'playing') {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const notes = [261.63, 329.63, 392.00, 523.25, 440.00, 349.23]; // C, E, G, C5, A, F
      let noteIndex = 0;

      const playNextNote = () => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(notes[noteIndex % notes.length], audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(notes[noteIndex % notes.length] * 0.8, audioCtx.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
        
        noteIndex++;
      };

      // Faster speed = funnier feel
      const intervalTime = Math.max(150, 400 - (level * 15) - (round * 4));
      const interval = setInterval(playNextNote, intervalTime);
      
      return () => {
        clearInterval(interval);
        audioCtx.close();
      };
    }
  }, [status, level, round]);

  // Particle Cleanup
  useEffect(() => {
    if (particles.length > 0) {
      const timeout = setTimeout(() => {
        const now = Date.now();
        setParticles(prev => prev.filter(p => now - p.createdAt < 800));
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [particles]);

  const spawnBubbles = useCallback(() => {
    if (!containerRef.current) return;
    
    // Difficulty scaling
    const bubbleCount = Math.min(3 + Math.floor(level / 2) + Math.floor(round / 4), 8);
    const newBubbles: Bubble[] = [];
    
    for (let i = 0; i < bubbleCount; i++) {
        const size = 100 + Math.random() * 40;
        newBubbles.push({
            id: bubbleIdRef.current++,
            x: 10 + Math.random() * 70, // % position
            y: 15 + Math.random() * 60, 
            size: size,
            color: `hsla(${Math.random() * 360}, 80%, 60%, 0.9)`
        });
    }
    
    setActiveBubbles(newBubbles);
    setTimeLeft(7 - (level * 0.3) - (round * 0.1)); 
  }, [level, round]);

  // Game Timer
  useEffect(() => {
    if (status === 'playing' && !isKidsMode) {
      const interval = setInterval(() => {
        setTimeLeft(prev => Math.max(0, Number((prev - 0.1).toFixed(1))));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [status, isKidsMode]);

  // Game Over trigger
  useEffect(() => {
    if (status === 'playing' && timeLeft <= 0) {
      playFailSound();
      setStatus('gameOver');
      if (score > bestScore) {
        setBestScore(score);
        localStorage.setItem('popit_high_score', score.toString());
      }
    }
  }, [timeLeft, status, score, bestScore]);

  const handleBubbleClick = (id: number) => {
    if (status !== 'playing') return;

    const bubbleIdx = activeBubbles.findIndex(b => b.id === id);
    if (bubbleIdx === -1) return;
    const bubble = activeBubbles[bubbleIdx];

    // Create more dramatic particles centered on bubble
    const now = Date.now();
    const newParticles: Particle[] = Array.from({ length: 15 }).map((_, i) => ({
      id: `pop-p-${particleIdRef.current++}-${now}-${i}`,
      x: bubble.x + 5, // Approximate center
      y: bubble.y + 5,
      vx: (Math.random() - 0.5) * 40,
      vy: (Math.random() - 0.5) * 40,
      color: bubble.color,
      size: Math.random() * 15 + 10,
      createdAt: now
    }));
    setParticles(prev => [...prev, ...newParticles]);

    playSequenceSound(id);
    setScore(prev => prev + 10 * level);
    setActiveBubbles(prev => prev.filter(b => b.id !== id));
  };

  // Handle round and level completion logic
  useEffect(() => {
    if (status === 'playing' && activeBubbles.length === 0 && (round > 1 || score > 0)) {
      const timer = setTimeout(() => {
        if (status !== 'playing') return;
        
        playSuccessSound();
        if (round < ROUNDS_PER_LEVEL) {
          setRound(r => r + 1);
        } else {
          setStatus('nextLevel');
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeBubbles.length, status, round, score]);

  // Handle bubble spawning
  useEffect(() => {
    if (status === 'playing' && activeBubbles.length === 0) {
      spawnBubbles();
    }
  }, [status, round, spawnBubbles]);

  // Handle completion notification
  useEffect(() => {
    if (status === 'nextLevel') {
      if (!isKidsMode) {
        onComplete?.();
      }
    }
  }, [status, onComplete, isKidsMode]);

  // Kids Mode Next Level Autoplay
  useEffect(() => {
    if (status === 'nextLevel' && isKidsMode) {
      const timer = setTimeout(() => {
        nextLevel();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, isKidsMode]);

  const nextLevel = () => {
    setLevel(prev => prev + 1);
    setRound(1);
    setStatus('playing');
  };

  const resetGame = useCallback(() => {
    setParticles([]);
    setActiveBubbles([]);
    setScore(0);
    setLevel(1);
    setRound(1);
    setTimeLeft(7);
    setStatus('playing');
    // Force a small delay to ensure cleanup completes before spawning
    setTimeout(() => spawnBubbles(), 50);
  }, [spawnBubbles]);

  return (
    <div className="w-full h-full bg-zinc-950 flex items-center justify-center p-4 landscape:py-1.5 landscape:px-6">
      <div className="w-full max-w-4xl flex flex-col gap-1.5 sm:gap-6">
        
        {/* Stats Header */}
        <div className="flex flex-row items-center justify-between bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-2.5 sm:p-6 rounded-2xl sm:rounded-[2.5rem] shadow-2xl gap-2 sm:gap-4">
          <div className="flex justify-start gap-4 sm:gap-8">
            <div className="flex flex-col">
              <span className="text-zinc-500 text-[8px] sm:text-[10px] uppercase font-black tracking-widest mb-0.5 sm:mb-1">Nivel</span>
              <span className="text-white font-black text-lg sm:text-3xl leading-none flex items-center gap-1.5">
                {level} <Zap size={12} className="text-yellow-400 sm:w-5 sm:h-5 animate-pulse" />
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-zinc-500 text-[8px] sm:text-[10px] uppercase font-black tracking-widest mb-0.5 sm:mb-1">Ronda</span>
              <span className="text-white font-black text-lg sm:text-3xl leading-none">
                {round}<span className="text-zinc-600 text-[10px] sm:text-lg">/10</span>
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-zinc-500 text-[8px] sm:text-[10px] uppercase font-black tracking-widest mb-0.5 sm:mb-1">Récord</span>
              <span className="text-yellow-500 font-black text-sm sm:text-lg leading-none">{bestScore.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col items-center">
             <div className="relative group">
                <Trophy size={48} className="text-yellow-500 absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                <span className="text-zinc-500 text-[8px] sm:text-[10px] uppercase font-black tracking-widest mb-0 sm:mb-1">Puntaje</span>
                <span className="text-white font-black text-xl sm:text-5xl leading-none tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  {score.toLocaleString()}
                </span>
             </div>
          </div>
        </div>

        {/* Game Arena */}
        <div 
          ref={containerRef}
          className="relative h-[55vh] landscape:h-[46vh] sm:h-auto sm:aspect-[21/9] bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-[2rem] sm:rounded-[3rem] border-4 border-white/5 shadow-inner overflow-hidden flex items-center justify-center p-3 sm:p-12"
        >
          {/* Status Overlays */}
          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.div 
                key="overlay-idle"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4"
              >
                <div className="text-center mb-8">
                    <h1 className="text-4xl sm:text-6xl font-black text-white mb-2 uppercase tracking-tighter">Explota Burbujas</h1>
                    <p className="text-zinc-400 text-sm sm:text-lg">Toca todas las burbujas antes de que se acabe el tiempo</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetGame}
                  className="group relative h-20 sm:h-24 px-8 sm:px-12 bg-white text-zinc-950 rounded-[1.5rem] sm:rounded-3xl font-black text-xl sm:text-3xl flex items-center gap-4 shadow-[0_20px_50px_rgba(255,255,255,0.2)]"
                >
                  <Play size={32} className="fill-current sm:w-10 sm:h-10" /> ¡JUGAR!
                </motion.button>
              </motion.div>
            )}

            {status === 'gameOver' && (
              <motion.div 
                key="overlay-gameOver"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-red-950/80 backdrop-blur-md p-6 text-center"
              >
                <h2 className="text-4xl sm:text-7xl font-black text-white font-comic mb-2 sm:mb-4 tracking-tighter uppercase drop-shadow-2xl">¡FIN DEL JUEGO!</h2>
                <div className="flex gap-4">
                  <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        resetGame();
                    }}
                    className="h-14 sm:h-16 px-6 sm:px-8 bg-white text-zinc-950 rounded-2xl font-black text-lg sm:text-xl flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    <RotateCcw size={20} className="sm:w-6 sm:h-6" /> REINTENTAR
                  </button>
                </div>
              </motion.div>
            )}

            {status === 'nextLevel' && (
              <motion.div 
                key="overlay-nextLevel"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-green-950/80 backdrop-blur-md p-6 text-center"
              >
                <Sparkles size={60} className="sm:w-[120px] sm:h-[120px] text-yellow-400 mb-4 sm:mb-6 animate-pulse" />
                <h2 className="text-4xl sm:text-7xl font-black text-white font-comic mb-2 sm:mb-4 tracking-tighter uppercase drop-shadow-2xl">¡SIGUIENTE!</h2>
                {isKidsMode ? (
                  <p className="text-xl sm:text-2xl text-white font-comic animate-bounce">Siguiente nivel en un momento... 🚀</p>
                ) : (
                  <button 
                    onClick={nextLevel}
                    className="h-16 sm:h-20 px-8 sm:px-12 bg-yellow-500 text-zinc-950 rounded-[1.5rem] sm:rounded-3xl font-black text-xl sm:text-2xl flex items-center gap-2 hover:scale-110 transition-all shadow-2xl"
                  >
                    SIGUIENTE NIVEL <RotateCcw size={20} className="sm:w-6 sm:h-6 rotate-180" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dynamic Bubbles */}
          <div className="absolute inset-0 pointer-events-none">
             <AnimatePresence>
                {activeBubbles.map((bubble) => (
                    <motion.button
                        key={`bubble-${bubble.id}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onPointerDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleBubbleClick(bubble.id);
                        }}
                        className="absolute pointer-events-auto rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-b-4 border-black/30 ring-2 ring-white/20 active:scale-90 transition-transform cursor-pointer"
                        style={{
                            left: `${bubble.x}%`,
                            top: `${bubble.y}%`,
                            width: bubble.size,
                            height: bubble.size,
                            backgroundColor: bubble.color,
                        }}
                    >
                         <div className="absolute inset-[15%] rounded-full bg-white/20 blur-[2px]" />
                         <div className="absolute top-2 left-4 w-[20%] h-[15%] bg-white/40 rounded-full rotate-45" />
                    </motion.button>
                ))}
             </AnimatePresence>

             {/* Explosion Particles */}
             {particles.map((particle) => (
                <motion.div
                  key={`particle-${particle.id}`}
                  initial={{ 
                    scale: 0.5,
                    opacity: 1,
                    x: 0,
                    y: 0
                  }}
                  animate={{ 
                    x: particle.vx * 15, 
                    y: particle.vy * 15,
                    scale: 2,
                    opacity: 0,
                    rotate: 360
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute pointer-events-none z-50 rounded-full"
                  style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                    backgroundColor: particle.color,
                    width: particle.size,
                    height: particle.size,
                    boxShadow: `0 0 20px ${particle.color}`,
                  }}
                />
             ))}
          </div>

          {/* Progress / Timer Bar */}
          <div className="absolute bottom-4 sm:bottom-6 inset-x-4 sm:inset-x-8 h-2 sm:h-4 bg-white/5 rounded-full overflow-hidden border border-white/10">
            <motion.div 
              className={`h-full ${timeLeft < 2 ? 'bg-red-500' : 'bg-blue-500'}`}
              animate={{ width: status === 'playing' ? `${(timeLeft / (7 - level * 0.3)) * 100}%` : '100%' }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
          </div>
          
          {status === 'playing' && (
            <div className="absolute bottom-4 right-6 sm:bottom-8 sm:right-12 flex items-center gap-2 text-white/50 font-black text-xs sm:text-base">
              <Timer size={16} className="sm:w-5 sm:h-5" /> <span className="tabular-nums">{timeLeft}s</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

