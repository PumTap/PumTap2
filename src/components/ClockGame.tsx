import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Trophy, 
  RotateCcw, 
  Settings, 
  Sparkles, 
  CheckCircle2,
  ChevronRight,
  Palette,
  Timer
} from 'lucide-react';

interface ClockGameProps {
  onComplete: (points: number) => void;
}

type ThemeType = 'classic' | 'space' | 'wood' | 'neon' | 'minimal';

interface ThemeConfig {
  name: string;
  bg: string;
  face: string;
  numbers: string;
  hourHand: string;
  minHand: string;
  center: string;
  accent: string;
}

const THEMES: Record<ThemeType, ThemeConfig> = {
  classic: {
    name: 'Soleado',
    bg: 'bg-sky-400',
    face: 'bg-white border-yellow-400 shadow-[0_20px_50px_rgba(0,0,0,0.1)]',
    numbers: 'text-orange-500 font-comic',
    hourHand: 'bg-orange-600',
    minHand: 'bg-sky-600',
    center: 'bg-orange-500',
    accent: 'bg-yellow-400'
  },
  space: {
    name: 'Galaxia',
    bg: 'bg-indigo-950',
    face: 'bg-indigo-900/40 border-indigo-400/30 backdrop-blur-md shadow-[0_0_60px_rgba(99,102,241,0.3)]',
    numbers: 'text-indigo-100 font-comic',
    hourHand: 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]',
    minHand: 'bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.8)]',
    center: 'bg-white shadow-[0_0_20px_white]',
    accent: 'bg-yellow-400'
  },
  wood: {
    name: 'Selva',
    bg: 'bg-emerald-900',
    face: 'bg-emerald-800 border-emerald-400/30 shadow-inner',
    numbers: 'text-lime-300 font-comic font-black',
    hourHand: 'bg-orange-950',
    minHand: 'bg-lime-400',
    center: 'bg-emerald-400',
    accent: 'bg-orange-500'
  },
  neon: {
    name: 'Gominola',
    bg: 'bg-pink-500',
    face: 'bg-white border-pink-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)]',
    numbers: 'text-pink-600 font-comic tracking-tighter',
    hourHand: 'bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.3)]',
    minHand: 'bg-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.3)]',
    center: 'bg-white shadow-[0_0_10px_white]',
    accent: 'bg-yellow-300'
  },
  minimal: {
    name: 'Arcoíris',
    bg: 'bg-violet-600',
    face: 'bg-white border-white/20 shadow-2xl',
    numbers: 'text-zinc-600 font-comic',
    hourHand: 'bg-red-500',
    minHand: 'bg-blue-500',
    center: 'bg-zinc-800',
    accent: 'bg-blue-400'
  }
};

interface ClockGameProps {
  onComplete: (points: number) => void;
  isKidsMode?: boolean;
}

export default function ClockGame({ onComplete, isKidsMode }: ClockGameProps) {
  const [round, setRound] = useState(1);
  const [targetTime, setTargetTime] = useState({ hour: 3, minute: 0 });
  const [userTime, setUserTime] = useState({ hour: 12, minute: 0 });
  const [theme, setTheme] = useState<ThemeType>('classic');
  const [status, setStatus] = useState<'playing' | 'success' | 'finished'>('playing');
  const [isHourDragging, setIsHourDragging] = useState(false);
  const [isMinDragging, setIsMinDragging] = useState(false);
  const clockRef = useRef<HTMLDivElement>(null);

  const generateTargetTime = useCallback(() => {
    const h = Math.floor(Math.random() * 12) || 12;
    // 0, 15, 30, 45 minute increments for easier play for kids
    const m = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
    setTargetTime({ hour: h, minute: m });
  }, []);

  useEffect(() => {
    generateTargetTime();
  }, [generateTargetTime]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isHourDragging && !isMinDragging) return;
    if (!clockRef.current) return;

    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    // Adjusted angle so 0 is at 12 o'clock
    const adjustedAngle = (angle + 90 + 360) % 360;

    if (isMinDragging) {
      // 360 degrees = 60 minutes, so 1 min = 6 degrees
      const min = Math.round(adjustedAngle / 6) % 60;
      // Snap to 5 minutes
      const snappedMin = Math.round(min / 5) * 5;
      setUserTime(prev => ({ ...prev, minute: snappedMin % 60 }));
    } else if (isHourDragging) {
      // 360 degrees = 12 hours, so 1 hour = 30 degrees
      const hour = Math.floor(adjustedAngle / 30) % 12;
      setUserTime(prev => ({ ...prev, hour: hour === 0 ? 12 : hour }));
    }
  };

  const checkTime = () => {
    if (userTime.hour === targetTime.hour && userTime.minute === targetTime.minute) {
      if (isKidsMode) {
        setStatus('success');
      } else if (round === 5) {
        setStatus('finished');
        onComplete(25);
      } else {
        setStatus('success');
      }
    }
  };

  const nextRound = () => {
    const nextR = round + 1;
    setRound(nextR);
    generateTargetTime();
    // Cycle theme automatically
    const themes: ThemeType[] = ['classic', 'space', 'wood', 'neon', 'minimal'];
    setTheme(themes[(nextR - 1) % themes.length]);
    setStatus('playing');
  };

  const resetGame = () => {
    setRound(1);
    setTheme('classic');
    generateTargetTime();
    setUserTime({ hour: 12, minute: 0 });
    setStatus('playing');
  };

  const currentTheme = THEMES[theme];

  useEffect(() => {
    if (isKidsMode && status === 'success') {
      const timer = setTimeout(() => {
        nextRound();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, isKidsMode]);

  return (
    <div 
      className={`h-full w-full flex flex-col landscape:flex-row items-center justify-between landscape:justify-around p-4 landscape:py-2 landscape:px-6 sm:p-8 transition-colors duration-1000 ${currentTheme.bg} overflow-hidden font-comic`}
      onPointerMove={handlePointerMove}
      onPointerUp={() => { setIsHourDragging(false); setIsMinDragging(false); }}
    >
      {/* Target Time Display */}
      <div className="w-full landscape:w-auto flex justify-center pt-14 landscape:pt-0 sm:pt-14 flex-shrink-0">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-zinc-900/40 backdrop-blur-xl border-4 border-white/20 p-4 sm:p-6 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-1"
        >
          <span className="text-white/60 text-[10px] sm:text-xs font-black uppercase tracking-widest">Pon esta hora:</span>
          <div className="flex items-center gap-3">
            <div className="text-white text-4xl sm:text-7xl font-black font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
              {targetTime.hour.toString().padStart(2, '0')}:{targetTime.minute.toString().padStart(2, '0')}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="bg-yellow-400 text-zinc-900 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase leading-none">Reloj {round}</span>
              <span className="bg-white/10 text-white/80 text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter leading-none">{currentTheme.name}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Clock Area */}
      <div className="flex-grow flex items-center justify-center w-full min-h-0 relative py-2 sm:py-6">
        <motion.div
          key={theme}
          initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          className="relative aspect-square w-[70vw] max-w-[280px] xs:max-w-[320px] sm:max-w-[420px] md:max-w-[460px] lg:max-w-[500px] xl:max-w-[540px] max-h-[42vh] xs:max-h-[48vh] sm:max-h-[55vh] md:max-h-[60vh] flex items-center justify-center"
        >
          {/* Decorative glow */}
          <div className="absolute inset-4 rounded-full bg-white/10 blur-[60px]" />
          
          {/* Clock Face */}
          <div 
            ref={clockRef}
            className={`w-full h-full rounded-full border-[6px] sm:border-[16px] shadow-2xl relative flex items-center justify-center transition-all duration-700 ${currentTheme.face}`}
          >
            {/* Hour Markers */}
            {[...Array(12)].map((_, i) => {
              const rotation = (i + 1) * 30;
              return (
                <div 
                  key={`hour-num-${i}`} 
                  className="absolute inset-4 sm:inset-10 flex flex-col items-center pointer-events-none"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <span 
                    className={`font-black text-lg xs:text-xl sm:text-4xl transition-colors duration-500 drop-shadow-sm ${currentTheme.numbers}`}
                    style={{ transform: `rotate(-${rotation}deg)` }}
                  >
                    {i + 1}
                  </span>
                </div>
              );
            })}

            {/* Hour Hand */}
            <motion.div
              className={`absolute origin-bottom rounded-full z-20 transition-all duration-300 ${currentTheme.hourHand}`}
              style={{
                width: '3.5%',
                height: '28%',
                top: '22%',
                rotate: (userTime.hour * 30) + (userTime.minute * 0.5),
                boxShadow: isHourDragging ? '0 0 30px rgba(59,130,246,0.6)' : 'none'
              }}
            >
              <div 
                className={`absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 sm:w-12 sm:h-12 rounded-full transition-all cursor-grab active:cursor-grabbing border-4 border-white/40 flex items-center justify-center ${isHourDragging ? 'bg-blue-500 scale-125 rotate-12 shadow-xl' : 'bg-orange-500 hover:scale-110'}`}
                onPointerDown={(e) => { e.stopPropagation(); setIsHourDragging(true); }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </motion.div>

            {/* Minute Hand */}
            <motion.div
              className={`absolute origin-bottom rounded-full z-10 transition-all duration-300 ${currentTheme.minHand}`}
              style={{
                width: '2.5%',
                height: '38%',
                top: '12%',
                rotate: userTime.minute * 6,
                boxShadow: isMinDragging ? '0 0 30px rgba(59,130,246,0.6)' : 'none'
              }}
            >
              <div 
                className={`absolute -top-5 left-1/2 -translate-x-1/2 w-9 h-9 sm:w-14 sm:h-14 rounded-full transition-all cursor-grab active:cursor-grabbing border-4 border-white/40 flex items-center justify-center ${isMinDragging ? 'bg-blue-400 scale-125 -rotate-12 shadow-xl' : 'bg-sky-500 hover:scale-110'}`}
                onPointerDown={(e) => { e.stopPropagation(); setIsMinDragging(true); }}
              >
                <div className="w-1 h-1 rounded-full bg-white" />
              </div>
            </motion.div>

            {/* Center Pin */}
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow-lg z-30 transition-colors duration-500 border-4 border-white/20 ${currentTheme.center}`} />

            {/* Minute indicators (ticks) */}
            {[...Array(60)].map((_, i) => (
              <div 
                key={`min-tick-${i}`} 
                className="absolute inset-0.5 sm:inset-3 flex flex-col items-center pointer-events-none"
                style={{ transform: `rotate(${i * 6}deg)` }}
              >
                <div className={`w-0.5 rounded-full ${i % 5 === 0 ? 'h-2 sm:h-5 bg-zinc-400/40' : 'h-1 sm:h-3 bg-zinc-300/20'}`} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer Controls */}
      <div className="w-full landscape:w-auto flex flex-col items-center gap-3 sm:gap-6 z-40 pb-6 sm:pb-8 flex-shrink-0">
        <motion.div 
          className="flex flex-col items-center bg-white/10 backdrop-blur-xl px-10 py-3 rounded-[2.5rem] border-2 border-white/10 shadow-2xl"
          animate={{ scale: isHourDragging || isMinDragging ? 0.95 : 1 }}
        >
           <span className="text-white/40 text-[9px] sm:text-xs font-black uppercase tracking-widest mb-0.5">Tu hora es:</span>
           <div className="text-white text-4xl sm:text-7xl font-black font-mono tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
             {userTime.hour.toString().padStart(2, '0')}:{userTime.minute.toString().padStart(2, '0')}
           </div>
        </motion.div>

        <button
          onClick={checkTime}
          className="group relative h-14 sm:h-20 px-10 bg-white text-zinc-900 rounded-[2.5rem] font-black font-comic text-xl sm:text-3xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl animate-pulse"
        >
          ¡LO TENGO!
          <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
            <ChevronRight size={24} strokeWidth={3} />
          </motion.div>
        </button>
      </div>

      {/* Instructions Overlay (Shown briefly or as helper) */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none opacity-40">
        <p className="text-white text-[10px] font-medium uppercase tracking-[0.3em] flex items-center gap-2">
          Arrastra los círculos de las agujas
        </p>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {status === 'success' && (
          <motion.div 
            key="clock-status-success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border-2 border-green-500 p-8 rounded-[3rem] shadow-2xl flex flex-col items-center text-center gap-6 max-w-sm"
            >
              <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center">
                <CheckCircle2 size={64} />
              </div>
              <div>
                <h3 className="text-4xl font-black text-white font-comic uppercase mb-2">¡MUY BIEN!</h3>
                <p className="text-zinc-400 font-comic text-xl">¿Estás listo para el siguiente reloj?</p>
              </div>
              {!isKidsMode && (
                <button 
                  onClick={nextRound}
                  className="w-full h-16 bg-green-500 text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  SIGUIENTE <ChevronRight />
                </button>
              )}
            </motion.div>
          </motion.div>
        )}

        {status === 'finished' && (
          <motion.div 
            key="clock-status-finished-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border-2 border-yellow-500 p-10 rounded-[4rem] shadow-2xl flex flex-col items-center text-center gap-8 max-w-lg"
            >
              <div className="relative">
                <Trophy size={100} className="text-yellow-500" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-8 border-4 border-dashed border-yellow-500/20 rounded-full"
                />
              </div>
              
              <div>
                <h2 className="text-5xl font-black text-white font-comic mb-4 tracking-tight uppercase">¡MAESTRO DEL TIEMPO!</h2>
                <p className="text-2xl text-zinc-400 font-comic">
                  Has completado todos los relojes. 
                  <br />¡Has ganado <span className="text-yellow-500 font-black">25 PUNTOS</span>!
                </p>
              </div>

              <div className="flex gap-4 w-full">
                <button 
                  onClick={resetGame}
                  className="flex-1 h-16 bg-white/5 text-white rounded-2xl border border-white/10 font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                >
                  <RotateCcw size={20} /> JUGAR OTRA VEZ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
