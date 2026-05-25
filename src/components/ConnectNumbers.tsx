import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCcw, Star, MousePointer2 } from 'lucide-react';
import SuccessOverlay from './SuccessOverlay';

interface NumberPoint {
  id: string;
  value: number;
  x: number;
  y: number;
  color: string;
}

type RangeCategory = '0-10' | '10-20' | '20-30';

const getRange = (cat: RangeCategory) => {
  switch (cat) {
    case '10-20': return { min: 10, max: 20 };
    case '20-30': return { min: 20, max: 30 };
    default: return { min: 0, max: 10 };
  }
};

const getNextCategory = (cat: RangeCategory): RangeCategory => {
  if (cat === '0-10') return '10-20';
  if (cat === '10-20') return '20-30';
  return '0-10';
};

const COLORS = [
  '#ef4444', '#3b82f6', '#22c55e', '#eab308', 
  '#f97316', '#a855f7', '#ec4899', '#06b6d4'
];

export default function ConnectNumbers({ onComplete, isKidsMode }: { onComplete?: (pts: number) => void; isKidsMode?: boolean }) {
  const [points, setPoints] = useState<NumberPoint[]>([]);
  const [category, setCategory] = useState<RangeCategory>('0-10');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [score, setScore] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { min, max } = getRange(category);

  const initGame = useCallback(() => {
    if (!containerRef.current) return;
    
    const { offsetWidth: w, offsetHeight: h } = containerRef.current;
    if (w === 0 || h === 0) {
      return;
    }
    
    // Increase top padding to avoid header and category switcher overlap
    const paddingX = 60;
    const paddingTop = 210; 
    const paddingBottom = 60;
    
    const newPoints: NumberPoint[] = [];
    const sessionId = Math.random().toString(36).substring(2, 9);
    const { min: activeMin, max: activeMax } = getRange(category);

    // Generate 11 points for the selected range
    for (let i = activeMin; i <= activeMax; i++) {
      let isTooClose = true;
      let x = 0, y = 0;
      
      // Try to find a spot that isn't too close to others
      let attempts = 0;
      while (isTooClose && attempts < 100) {
        x = paddingX + Math.random() * (w - paddingX * 2);
        y = paddingTop + Math.random() * (h - paddingTop - paddingBottom);
        
        isTooClose = newPoints.some(p => {
          const dist = Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2));
          return dist < 65; // Balanced minimum distance
        });
        attempts++;
      }
      
      newPoints.push({
        id: `pt-${i}-${sessionId}`,
        value: i,
        x,
        y,
        color: COLORS[(i - activeMin) % COLORS.length]
      });
    }

    setPoints(newPoints);
    setCurrentIndex(activeMin);
    setShowSuccess(false);
  }, [category]);

  useEffect(() => {
    // Generate immediately if container is ready, otherwise wait briefly
    if (containerRef.current && containerRef.current.offsetWidth > 0) {
      initGame();
    } else {
      const timer = setTimeout(initGame, 100);
      return () => clearTimeout(timer);
    }
  }, [initGame]);

  useEffect(() => {
    // Handle resizing
    const handleResize = () => {
      initGame();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [initGame]);

  const speakNumber = (num: number) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(num.toString());
      utterance.lang = 'es-ES';
      
      // Preferred children-like settings: slightly high pitch but not robotic
      utterance.pitch = 1.35; 
      utterance.rate = 0.85; 
      utterance.volume = 1;

      // Try to find a high-quality female Spanish voice
      const voices = window.speechSynthesis.getVoices();
      // Expanded list of high-quality female voice names for various OSs
      const femaleKeywords = [
        'monica', 'helena', 'lucia', 'sabina', 'child', 'girl', 
        'natural', 'google', 'paulinal', 'hilda', 'marisol', 
        'conchita', 'lola', 'juanita', 'aura'
      ];
      
      const selectedVoice = voices.find(v => 
        (v.lang.startsWith('es-ES') || v.lang.startsWith('es')) && 
        femaleKeywords.some(key => v.name.toLowerCase().includes(key))
      ) || voices.find(v => v.lang.startsWith('es'));
      
      if (selectedVoice) utterance.voice = selectedVoice;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const playPopSound = () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
    
    // Close context after a bit to save resources
    setTimeout(() => ctx.close(), 200);
  };

  const handlePointClick = (value: number) => {
    if (value === currentIndex) {
      playPopSound();
      speakNumber(value);
      if (value === max) {
        handleLevelComplete();
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    }
  };

  const handleLevelComplete = () => {
    setCurrentIndex(max + 1); // All connected
    setScore(prev => prev + 25);
    
    if (isKidsMode) {
      setTimeout(() => {
        initGame();
      }, 1500);
    } else {
      if (onComplete) onComplete(25);
      
      setTimeout(() => {
        setShowSuccess(true);
      }, 500);
    }
  };

  return (
    <div ref={containerRef} className="h-full w-full bg-zinc-950 relative overflow-hidden font-sans p-4 select-none">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 border-4 border-dashed border-white/20 rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 border-4 border-dashed border-white/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <header className="absolute top-4 left-4 right-4 sm:top-8 sm:left-8 sm:right-8 flex items-center justify-between z-30">
        <div className="flex flex-col">
          <h2 className="text-xl sm:text-3xl font-black text-white italic uppercase tracking-tighter">
            Conecta Números
          </h2>
          <p className="text-zinc-500 font-bold uppercase text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] mt-1">
            {currentIndex <= max ? `Toca el número: ${currentIndex}` : '¡Hecho!'}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="bg-zinc-900 px-4 py-1 sm:px-6 sm:py-2 rounded-xl sm:rounded-2xl border border-white/10 flex items-center gap-2 sm:gap-3">
            <Trophy className="text-yellow-500 w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-lg sm:text-2xl font-black text-white">{score}</span>
          </div>
          <button 
            onClick={() => {
              setPoints([]);
              setTimeout(initGame, 50);
            }}
            className="p-2 sm:p-3 bg-white/5 text-white rounded-xl sm:rounded-2xl hover:bg-white/10 transition-colors shadow-lg active:scale-95"
          >
            <RefreshCcw size={18} />
          </button>
        </div>
      </header>

      {/* Selector de categorías */}
      <div className="absolute top-20 sm:top-28 left-4 right-4 flex justify-center z-30 select-none">
        <div className="bg-zinc-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 flex gap-1 items-center max-w-sm w-full shadow-lg">
          {(['0-10', '10-20', '20-30'] as RangeCategory[]).map((cat) => (
            <button
              key={`cat-range-${cat}`}
              onClick={() => {
                setPoints([]);
                const rng = getRange(cat);
                setCurrentIndex(rng.min);
                setCategory(cat);
                playPopSound();
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all active:scale-95 ${
                category === cat 
                  ? 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white shadow-md' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Connection Lines */}
      <svg key={`lines-${category}`} className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <AnimatePresence>
          {points.slice(0, currentIndex - min).map((p, i) => {
            if (i === 0) return null;
            const prev = points[i - 1];
            return (
              <motion.line
                key={`line-${p.id}`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                x1={prev.x}
                y1={prev.y}
                x2={p.x}
                y2={p.y}
                stroke="white"
                strokeWidth="8"
                strokeLinecap="round"
                className="drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
              />
            );
          })}
          {currentIndex <= max && currentIndex > min && points[currentIndex - min] && (
            <motion.line
              key={`ghost-line-${points[currentIndex - min].id}`}
              x1={points[currentIndex - min - 1].x}
              y1={points[currentIndex - min - 1].y}
              x2={points[currentIndex - min].x}
              y2={points[currentIndex - min].y}
              stroke="white"
              strokeWidth="4"
              strokeDasharray="10 10"
              className="opacity-20"
            />
          )}
        </AnimatePresence>
      </svg>

      {/* Numbers */}
      <div key={`numbers-${category}`} className="absolute inset-0 z-20">
        <AnimatePresence>
          {points.map((p) => {
            const isActive = p.value === currentIndex;
            const isDone = p.value < currentIndex;
            const isLocked = p.value > currentIndex;
            const size = window.innerWidth < 640 ? 56 : 72;

            return (
              <motion.button
                key={`num-${p.id}`}
                initial={{ scale: 0 }}
                animate={{ 
                  scale: 1,
                  opacity: isLocked ? 0.3 : 1,
                  boxShadow: isActive ? '0 0 30px rgba(255,255,255,0.3)' : '0 10px 20px rgba(0,0,0,0.5)'
                }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={!isLocked ? { scale: 1.1 } : {}}
                whileTap={!isLocked ? { scale: 0.8, rotate: [0, -10, 10, 0] } : {}}
                onClick={() => handlePointClick(p.value)}
                className={`absolute flex items-center justify-center border-4 sm:border-8 transition-colors ${
                  isDone ? 'bg-white text-zinc-950 border-white' : 'text-white shadow-xl'
                }`}
                style={{
                  width: size,
                  height: size,
                  left: p.x - size / 2,
                  top: p.y - size / 2,
                  backgroundColor: isDone ? 'white' : p.color,
                  borderColor: isDone ? 'white' : p.color,
                  borderRadius: '50%',
                  filter: isLocked ? 'grayscale(0.8)' : 'none'
                }}
                disabled={isLocked}
              >
                <span className="text-2xl sm:text-4xl font-black">{p.value}</span>
                
                {isActive && (
                  <motion.div
                    layoutId="pulse"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-[-12px] border-4 border-white rounded-full pointer-events-none"
                  />
                )}

                {isDone && (
                  <motion.div
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-white rounded-full pointer-events-none"
                  />
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      <SuccessOverlay 
        isVisible={showSuccess && !isKidsMode}
        title="¡FANTÁSTICO!"
        message="¡Has conectado todos los números!"
        points={25}
        onAction={() => {
          if (category !== '20-30') {
            const nextCat = getNextCategory(category);
            setPoints([]);
            const rng = getRange(nextCat);
            setCurrentIndex(rng.min);
            setCategory(nextCat);
          } else {
            setPoints([]);
            setTimeout(initGame, 50);
          }
        }}
        actionLabel={category !== '20-30' ? "SIGUIENTE NIVEL" : "REINTENTAR"}
      />
    </div>
  );
}
