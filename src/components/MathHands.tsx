import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCcw, Check, X, Plus, Minus, Equal } from 'lucide-react';

import SuccessOverlay from './SuccessOverlay';

const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F1C', '#925FF0', '#FF8CC3'];

interface HandProps {
  count: number;
  color: string;
  isLeft?: boolean;
}

const Hand = ({ count, color, isLeft = true }: HandProps) => {
  // Fingers logic: Thumb is 1, Index 2, Middle 3, Ring 4, Pinky 5
  // We'll show fingers based on count
  // We'll use a coordinate system where 0,0 is top-left of the hand area
  const fingers = [
    { id: 'thumb', active: count >= 5, d: "M135 110 Q165 110 170 90 Q170 70 150 70 Q130 70 120 100" }, // Thumb sticking out more to the right
    { id: 'index', active: count >= 1, d: "M20 70 Q20 15 35 15 Q50 15 50 70" },
    { id: 'middle', active: count >= 2, d: "M50 65 Q50 5 65 5 Q80 5 80 65" },
    { id: 'ring', active: count >= 3, d: "M80 70 Q80 20 95 20 Q110 20 110 70" },
    { id: 'pinky', active: count >= 4, d: "M110 85 Q120 45 135 45 Q150 45 140 85" },
  ];

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`relative w-14 h-14 min-[375px]:w-18 min-[375px]:h-18 xs:w-24 xs:h-24 sm:w-48 sm:h-48 md:w-52 md:h-52 landscape:w-[22vh] landscape:h-[22vh] ${!isLeft ? '-scale-x-100' : ''}`}
    >
      <svg viewBox="0 0 180 180" className="w-full h-full drop-shadow-2xl overflow-visible">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Fingers - rendered behind palm */}
        {fingers.map((f) => (
          <motion.path
            key={f.id}
            d={f.d}
            stroke={f.active ? "white" : "transparent"}
            strokeWidth="4"
            strokeLinecap="round"
            fill={f.active ? color : 'rgba(255,255,255,0.05)'}
            initial={false}
            animate={{
              opacity: f.active ? 1 : 0,
              y: f.active ? 0 : 30,
              scale: f.active ? 1 : 0.5,
              translateY: f.active ? 0 : 20
            }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            style={{ filter: f.active ? 'url(#glow)' : 'none' }}
          />
        ))}

        {/* Palm - rendered in front */}
        <motion.path
          d="M20 140 Q25 70 80 70 Q135 70 140 140 Z"
          fill={color}
          stroke="white"
          strokeWidth="4"
          style={{ filter: 'url(#glow)' }}
        />
        
        {/* Palm detail */}
        <path d="M35 140 Q35 90 80 90 Q125 90 130 140" fill="black" fillOpacity="0.1" />
      </svg>
      
      {/* Visual Number Label - Fix mirroring */}
      <motion.div 
        key={`math-count-label-${isLeft ? 'left' : 'right'}-${count}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`absolute bottom-[14%] sm:bottom-[16%] left-1/2 -translate-x-1/2 bg-white text-zinc-900 font-bold text-xs min-[375px]:text-sm xs:text-2xl sm:text-3xl w-6 h-6 min-[375px]:w-8 min-[375px]:h-8 xs:w-10 xs:h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2 xs:border-4 shadow-xl z-20 ${!isLeft ? '-scale-x-100' : ''}`}
        style={{ borderColor: color, color }}
      >
        {count}
      </motion.div>
    </motion.div>
  );
};

interface MathHandsProps {
  onComplete?: () => void;
  isKidsMode?: boolean;
}

export default function MathHands({ onComplete, isKidsMode }: MathHandsProps) {
  const [num1, setNum1] = useState(1);
  const [num2, setNum2] = useState(1);
  const [op, setOp] = useState<'+' | '-'>('+');
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');
  const [randomColors, setRandomColors] = useState([COLORS[0], COLORS[1]]);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);

  const generateProblem = useCallback(() => {
    const n1 = Math.floor(Math.random() * 6); // 0-5
    const n2 = Math.floor(Math.random() * 6); // 0-5
    const operation = Math.random() > 0.5 ? '+' : '-';
    
    // Ensure num1 >= num2 for subtraction to keep result non-negative
    if (operation === '-' && n1 < n2) {
      setNum1(n2);
      setNum2(n1);
    } else {
      setNum1(n1);
      setNum2(n2);
    }
    setOp(operation);
    setStatus('playing');
    setUserAnswer(null);
    setRandomColors([
      COLORS[Math.floor(Math.random() * COLORS.length)],
      COLORS[Math.floor(Math.random() * COLORS.length)],
    ]);
  }, []);

  useEffect(() => {
    generateProblem();
  }, [generateProblem]);

  const checkAnswer = (val: number) => {
    const correct = op === '+' ? num1 + num2 : num1 - num2;
    setUserAnswer(val);
    if (val === correct) {
      if (isKidsMode) {
        setStatus('correct');
        setTimeout(() => {
          generateProblem();
        }, 1500);
      } else {
        setStatus('correct');
        onComplete?.();
      }
    } else {
      setStatus('wrong');
      setTimeout(() => setStatus('playing'), 1000);
    }
  };

  const options = Array.from({ length: 11 }, (_, i) => i);

  return (
    <div className="h-full w-full bg-zinc-950 flex flex-col items-center justify-between p-3 sm:p-6 landscape:py-1 landscape:px-6 relative overflow-hidden min-h-0">
      {/* Background blobs for mood */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full" />

      {/* Title */}
      <motion.div 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="mb-1 landscape:mb-0 text-center flex-shrink-0"
      >
        <h2 className="text-3xl sm:text-4xl landscape:text-2xl font-bold text-white font-comic flex items-center justify-center gap-3">
          <Sparkles className="text-yellow-400 w-6 h-6 sm:w-8 sm:h-8" /> ¡Aprendemos a Contar!
        </h2>
        <p className="text-zinc-400 font-comic text-base sm:text-lg landscape:hidden mt-0.5">¿Cuántos dedos hay en total?</p>
      </motion.div>

      {/* The Equation */}
      <div className="flex-1 w-full max-w-5xl flex items-center justify-center py-4 sm:py-6 md:py-8 landscape:py-1">
        <div className="flex flex-row items-center justify-center gap-1 min-[375px]:gap-2 xs:gap-5 sm:gap-8 md:gap-10 lg:gap-14 w-full">
          <Hand count={num1} color={randomColors[0]} />
          
          <motion.div 
            animate={status === 'playing' ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            className="bg-white/10 p-1 sm:p-4 rounded-xl sm:rounded-3xl border border-white/20 shadow-xl flex-shrink-0 flex items-center justify-center w-8 h-8 xs:w-12 xs:h-12 sm:w-20 sm:h-20"
          >
            {op === '+' ? <Plus className="text-white w-4 h-4 xs:w-6 xs:h-6 sm:w-12 sm:h-12" /> : <Minus className="text-white w-4 h-4 xs:w-6 xs:h-6 sm:w-12 sm:h-12" />}
          </motion.div>

          <Hand count={num2} color={randomColors[1]} isLeft={false} />

          <div className="bg-white/10 p-1 sm:p-4 rounded-xl sm:rounded-3xl border border-white/20 shadow-xl flex-shrink-0 flex items-center justify-center w-8 h-8 xs:w-12 xs:h-12 sm:w-20 sm:h-20">
            <Equal className="text-white w-4 h-4 xs:w-6 xs:h-6 sm:w-12 sm:h-12" />
          </div>

          {/* Answer Slot */}
          <motion.div 
            animate={status === 'wrong' ? { x: [-10, 10, -10, 10, 0] } : {}}
            className={/* md:w-32 md:h-32 holds it nicely */ `w-12 h-12 min-[375px]:w-14 min-[375px]:h-14 xs:w-24 xs:h-24 sm:w-32 sm:h-32 rounded-xl sm:rounded-3xl border-2 sm:border-4 flex items-center justify-center bg-zinc-900/50 backdrop-blur-md shadow-2xl transition-all flex-shrink-0 ${
              status === 'correct' ? 'border-green-500 bg-green-500/20 scale-110 font-bold' : 
              status === 'wrong' ? 'border-red-500 bg-red-500/20' : 'border-white/30 border-dashed'
            }`}
          >
            <AnimatePresence mode="wait">
              {status === 'correct' ? (
                <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                  <Check className="text-green-400 mb-0.5 w-4 h-4 xs:w-8 xs:h-8" />
                  <span className="text-white font-bold text-sm xs:text-3xl sm:text-5xl drop-shadow-[0_2px_10px_rgba(255,255,255,0.5)]">{userAnswer}</span>
                </motion.div>
              ) : status === 'wrong' ? (
                <motion.div key="wrong" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <X className="text-red-400 w-5 h-5 xs:w-10 xs:h-10" />
                </motion.div>
              ) : (
                <motion.span key="question-mark" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-zinc-500 text-lg xs:text-4xl sm:text-6xl font-black opacity-50">?</motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Input Buttons */}
      <div className="grid grid-cols-4 min-[360px]:grid-cols-6 sm:grid-cols-11 gap-1.5 sm:gap-3 max-w-4xl w-full flex-shrink-0 mb-2 landscape:mb-0.5">
        {options.map((n) => (
          <button
            key={`math-option-btn-${n}`}
            onClick={() => status === 'playing' && checkAnswer(n)}
            disabled={status !== 'playing'}
            className="group relative h-10 sm:h-16 md:h-18 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg"
          >
            <span className="text-xl sm:text-3xl md:text-4xl font-black text-white font-comic drop-shadow-md select-none">{n}</span>
            <div className="absolute inset-0 bg-blue-400/10 opacity-0 group-hover:opacity-100 rounded-2xl blur-xl transition-opacity" />
          </button>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="mt-2 sm:mt-4 landscape:mt-1 flex-shrink-0">
        <AnimatePresence>
          {status !== 'correct' && (
            <motion.button
              key="math-next-challenge-btn"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={generateProblem}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-white/10 rounded-full text-zinc-400 font-bold text-sm sm:text-lg shadow-lg hover:scale-105 active:scale-95 transition-transform hover:text-white hover:bg-orange-500/40"
            >
              <RefreshCcw size={16} /> ¡Siguiente Desafío!
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Success Celebration Overlay */}
        <SuccessOverlay 
        isVisible={status === 'correct' && !isKidsMode}
        title="¡MUY BIEN! 🌟"
        message="¡Lo has conseguido! Eres un genio de las matemáticas."
        onAction={generateProblem}
        actionLabel="¡OTRO DESAFÍO!"
      />
    </div>
  );
}
