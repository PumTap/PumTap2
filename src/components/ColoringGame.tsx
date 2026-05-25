import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, 
  Sparkles, 
  Trophy, 
  RefreshCw,
  Undo2,
  CheckCircle2,
  Gamepad2
} from 'lucide-react';

import SuccessOverlay from './SuccessOverlay';

interface Dot {
  id: number;
  x: number;
  y: number;
  radius: number;
  targetColor: string;
}

interface Drawing {
  id: string;
  name: string;
  dots: Dot[];
}

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', 
  '#3b82f6', '#a855f7', '#ec4899', '#ffffff', '#18181b'
];

const DRAWINGS: Drawing[] = [
  {
    id: 'flower',
    name: 'Flor Mágica',
    dots: [
      { id: 1, x: 100, y: 100, radius: 25, targetColor: '#eab308' },
      { id: 2, x: 100, y: 50, radius: 20, targetColor: '#ec4899' },
      { id: 3, x: 140, y: 70, radius: 20, targetColor: '#ec4899' },
      { id: 4, x: 140, y: 130, radius: 20, targetColor: '#ec4899' },
      { id: 5, x: 100, y: 150, radius: 20, targetColor: '#ec4899' },
      { id: 6, x: 60, y: 130, radius: 20, targetColor: '#ec4899' },
      { id: 7, x: 60, y: 70, radius: 20, targetColor: '#ec4899' },
      { id: 8, x: 100, y: 185, radius: 15, targetColor: '#22c55e' },
      { id: 9, x: 75, y: 175, radius: 12, targetColor: '#22c55e' },
      { id: 10, x: 125, y: 175, radius: 12, targetColor: '#22c55e' },
    ]
  },
  {
    id: 'house',
    name: 'Casita',
    dots: [
      // Base
      { id: 1, x: 70, y: 150, radius: 25, targetColor: '#3b82f6' },
      { id: 2, x: 130, y: 150, radius: 25, targetColor: '#3b82f6' },
      { id: 3, x: 70, y: 110, radius: 25, targetColor: '#3b82f6' },
      { id: 4, x: 130, y: 110, radius: 25, targetColor: '#3b82f6' },
      // Roof
      { id: 5, x: 100, y: 60, radius: 25, targetColor: '#ef4444' },
      { id: 6, x: 60, y: 80, radius: 20, targetColor: '#ef4444' },
      { id: 7, x: 140, y: 80, radius: 20, targetColor: '#ef4444' },
      // Door & Window
      { id: 8, x: 100, y: 150, radius: 15, targetColor: '#18181b' },
      { id: 9, x: 100, y: 100, radius: 10, targetColor: '#eab308' },
    ]
  },
  {
    id: 'fish',
    name: 'Pez de Colores',
    dots: [
      // Body
      { id: 1, x: 110, y: 100, radius: 40, targetColor: '#f97316' },
      { id: 2, x: 70, y: 100, radius: 30, targetColor: '#f97316' },
      // Tail
      { id: 3, x: 40, y: 80, radius: 18, targetColor: '#22c55e' },
      { id: 4, x: 40, y: 120, radius: 18, targetColor: '#22c55e' },
      // Eye
      { id: 5, x: 130, y: 90, radius: 8, targetColor: '#18181b' },
      // Fin
      { id: 6, x: 100, y: 70, radius: 12, targetColor: '#eab308' },
    ]
  },
  {
    id: 'car',
    name: 'Coche Rápido',
    dots: [
      // Body
      { id: 1, x: 60, y: 120, radius: 25, targetColor: '#ef4444' },
      { id: 2, x: 110, y: 120, radius: 25, targetColor: '#ef4444' },
      { id: 3, x: 150, y: 120, radius: 25, targetColor: '#ef4444' },
      { id: 4, x: 100, y: 90, radius: 20, targetColor: '#3b82f6' },
      // Wheels
      { id: 5, x: 70, y: 150, radius: 15, targetColor: '#18181b' },
      { id: 6, x: 140, y: 150, radius: 15, targetColor: '#18181b' },
      // Lights
      { id: 7, x: 170, y: 120, radius: 8, targetColor: '#eab308' },
    ]
  },
  {
    id: 'caterpillar',
    name: 'Oruga Comilona',
    dots: [
      { id: 1, x: 40, y: 110, radius: 18, targetColor: '#22c55e' },
      { id: 2, x: 70, y: 100, radius: 18, targetColor: '#22c55e' },
      { id: 3, x: 100, y: 110, radius: 18, targetColor: '#22c55e' },
      { id: 4, x: 130, y: 100, radius: 18, targetColor: '#22c55e' },
      { id: 5, x: 160, y: 90, radius: 22, targetColor: '#22c55e' },
      { id: 6, x: 165, y: 85, radius: 5, targetColor: '#ffffff' },
      { id: 7, x: 175, y: 85, radius: 5, targetColor: '#ffffff' },
      { id: 8, x: 155, y: 65, radius: 6, targetColor: '#f97316' },
      { id: 9, x: 175, y: 60, radius: 6, targetColor: '#f97316' },
    ]
  },
  {
    id: 'butterfly',
    name: 'Mariposa de Colores',
    dots: [
      { id: 1, x: 100, y: 80, radius: 12, targetColor: '#18181b' },
      { id: 2, x: 100, y: 110, radius: 12, targetColor: '#18181b' },
      { id: 3, x: 100, y: 140, radius: 12, targetColor: '#18181b' },
      { id: 4, x: 70, y: 70, radius: 20, targetColor: '#3b82f6' },
      { id: 5, x: 50, y: 50, radius: 15, targetColor: '#06b6d4' },
      { id: 6, x: 130, y: 70, radius: 20, targetColor: '#3b82f6' },
      { id: 7, x: 150, y: 50, radius: 15, targetColor: '#06b6d4' },
      { id: 8, x: 75, y: 120, radius: 18, targetColor: '#a855f7' },
      { id: 9, x: 55, y: 140, radius: 12, targetColor: '#ec4899' },
      { id: 10, x: 125, y: 120, radius: 18, targetColor: '#a855f7' },
      { id: 11, x: 145, y: 140, radius: 12, targetColor: '#ec4899' },
    ]
  },
  {
    id: 'sun',
    name: 'Sol Radiante',
    dots: [
      { id: 1, x: 100, y: 100, radius: 35, targetColor: '#eab308' },
      { id: 2, x: 100, y: 35, radius: 10, targetColor: '#f97316' },
      { id: 3, x: 145, y: 55, radius: 10, targetColor: '#f97316' },
      { id: 4, x: 165, y: 100, radius: 10, targetColor: '#f97316' },
      { id: 5, x: 145, y: 145, radius: 10, targetColor: '#f97316' },
      { id: 6, x: 100, y: 165, radius: 10, targetColor: '#f97316' },
      { id: 7, x: 55, y: 145, radius: 10, targetColor: '#f97316' },
      { id: 8, x: 35, y: 100, radius: 10, targetColor: '#f97316' },
      { id: 9, x: 55, y: 55, radius: 10, targetColor: '#f97316' },
    ]
  },
  {
    id: 'rainbow',
    name: 'Arcoíris',
    dots: [
      { id: 1, x: 100, y: 140, radius: 50, targetColor: '#3b82f6' },
      { id: 2, x: 100, y: 130, radius: 45, targetColor: '#22c55e' },
      { id: 3, x: 100, y: 120, radius: 40, targetColor: '#eab308' },
      { id: 4, x: 100, y: 110, radius: 35, targetColor: '#f97316' },
      { id: 5, x: 100, y: 100, radius: 30, targetColor: '#ef4444' },
      { id: 6, x: 45, y: 150, radius: 20, targetColor: '#ffffff' },
      { id: 7, x: 65, y: 155, radius: 18, targetColor: '#ffffff' },
      { id: 8, x: 135, y: 155, radius: 18, targetColor: '#ffffff' },
      { id: 10, x: 155, y: 150, radius: 20, targetColor: '#ffffff' },
    ]
  },
  {
    id: 'snowman',
    name: 'Muñeco de Nieve',
    dots: [
      { id: 1, x: 100, y: 150, radius: 30, targetColor: '#ffffff' },
      { id: 2, x: 100, y: 100, radius: 22, targetColor: '#ffffff' },
      { id: 3, x: 100, y: 65, radius: 16, targetColor: '#ffffff' },
      { id: 4, x: 95, y: 60, radius: 3, targetColor: '#18181b' },
      { id: 5, x: 105, y: 60, radius: 3, targetColor: '#18181b' },
      { id: 6, x: 100, y: 70, radius: 4, targetColor: '#f97316' },
      { id: 7, x: 100, y: 90, radius: 4, targetColor: '#ef4444' },
      { id: 8, x: 100, y: 110, radius: 4, targetColor: '#18181b' },
    ]
  },
  {
    id: 'tree',
    name: 'Árbol Feliz',
    dots: [
      { id: 1, x: 100, y: 160, radius: 15, targetColor: '#f97316' },
      { id: 2, x: 100, y: 120, radius: 30, targetColor: '#22c55e' },
      { id: 3, x: 100, y: 80, radius: 25, targetColor: '#22c55e' },
      { id: 4, x: 100, y: 50, radius: 20, targetColor: '#22c55e' },
      { id: 5, x: 80, y: 120, radius: 6, targetColor: '#ef4444' },
      { id: 6, x: 120, y: 90, radius: 6, targetColor: '#eab308' },
      { id: 7, x: 90, y: 70, radius: 6, targetColor: '#ec4899' },
    ]
  },
  {
    id: 'rocket',
    name: 'Cohete Espacial',
    dots: [
      { id: 1, x: 100, y: 70, radius: 25, targetColor: '#ef4444' },
      { id: 2, x: 100, y: 110, radius: 30, targetColor: '#ffffff' },
      { id: 3, x: 100, y: 150, radius: 30, targetColor: '#ffffff' },
      { id: 4, x: 70, y: 150, radius: 15, targetColor: '#3b82f6' },
      { id: 5, x: 130, y: 150, radius: 15, targetColor: '#3b82f6' },
      { id: 6, x: 100, y: 180, radius: 12, targetColor: '#f97316' },
    ]
  },
  {
    id: 'apple',
    name: 'Manzana Roja',
    dots: [
      { id: 1, x: 100, y: 110, radius: 45, targetColor: '#ef4444' },
      { id: 2, x: 100, y: 60, radius: 12, targetColor: '#22c55e' },
      { id: 3, x: 110, y: 45, radius: 8, targetColor: '#18181b' },
    ]
  },
  {
    id: 'duck',
    name: 'Patito Amarillo',
    dots: [
      { id: 1, x: 100, y: 130, radius: 40, targetColor: '#eab308' },
      { id: 2, x: 140, y: 90, radius: 25, targetColor: '#eab308' },
      { id: 3, x: 155, y: 95, radius: 10, targetColor: '#f97316' },
      { id: 4, x: 145, y: 85, radius: 5, targetColor: '#18181b' },
    ]
  },
  {
    id: 'heart',
    name: 'Corazón Mágico',
    dots: [
      { id: 1, x: 75, y: 80, radius: 30, targetColor: '#ec4899' },
      { id: 2, x: 125, y: 80, radius: 30, targetColor: '#ec4899' },
      { id: 3, x: 100, y: 130, radius: 45, targetColor: '#ec4899' },
    ]
  },
  {
    id: 'alien',
    name: 'Marcianito',
    dots: [
      { id: 1, x: 100, y: 100, radius: 45, targetColor: '#22c55e' },
      { id: 2, x: 75, y: 90, radius: 12, targetColor: '#18181b' },
      { id: 3, x: 125, y: 90, radius: 12, targetColor: '#18181b' },
      { id: 4, x: 100, y: 140, radius: 15, targetColor: '#ffffff' },
    ]
  },
  {
    id: 'boat',
    name: 'Barquito',
    dots: [
      { id: 1, x: 100, y: 140, radius: 35, targetColor: '#3b82f6' },
      { id: 2, x: 70, y: 140, radius: 25, targetColor: '#3b82f6' },
      { id: 3, x: 130, y: 140, radius: 25, targetColor: '#3b82f6' },
      { id: 4, x: 100, y: 80, radius: 35, targetColor: '#ffffff' },
    ]
  },
  {
    id: 'umbrella',
    name: 'Paraguas',
    dots: [
      { id: 1, x: 100, y: 90, radius: 45, targetColor: '#a855f7' },
      { id: 2, x: 70, y: 90, radius: 30, targetColor: '#3b82f6' },
      { id: 3, x: 130, y: 90, radius: 30, targetColor: '#ec4899' },
      { id: 4, x: 100, y: 150, radius: 20, targetColor: '#18181b' },
    ]
  },
  {
    id: 'pizza',
    name: 'Pizza Ñam',
    dots: [
      { id: 1, x: 100, y: 100, radius: 45, targetColor: '#eab308' },
      { id: 2, x: 80, y: 80, radius: 10, targetColor: '#ef4444' },
      { id: 3, x: 120, y: 120, radius: 10, targetColor: '#ef4444' },
      { id: 4, x: 90, y: 110, radius: 10, targetColor: '#ef4444' },
      { id: 5, x: 110, y: 70, radius: 8, targetColor: '#22c55e' },
    ]
  },
  {
    id: 'robot',
    name: 'Robotín',
    dots: [
      { id: 1, x: 100, y: 60, radius: 25, targetColor: '#94a3b8' },
      { id: 2, x: 100, y: 120, radius: 40, targetColor: '#ffffff' },
      { id: 3, x: 85, y: 55, radius: 6, targetColor: '#06b6d4' },
      { id: 4, x: 115, y: 55, radius: 6, targetColor: '#06b6d4' },
      { id: 5, x: 100, y: 120, radius: 15, targetColor: '#ef4444' },
    ]
  },
  {
    id: 'elephant',
    name: 'Elefante',
    dots: [
      { id: 1, x: 100, y: 100, radius: 45, targetColor: '#3b82f6' },
      { id: 2, x: 60, y: 90, radius: 25, targetColor: '#3b82f6' },
      { id: 3, x: 140, y: 90, radius: 25, targetColor: '#3b82f6' },
      { id: 4, x: 100, y: 150, radius: 15, targetColor: '#18181b' },
    ]
  },
  {
    id: 'icecream',
    name: 'Helado Rico',
    dots: [
      { id: 1, x: 100, y: 80, radius: 35, targetColor: '#ec4899' },
      { id: 2, x: 100, y: 130, radius: 40, targetColor: '#f97316' },
      { id: 3, x: 100, y: 50, radius: 12, targetColor: '#ef4444' },
    ]
  },
  {
    id: 'ufo',
    name: 'OVNI',
    dots: [
      { id: 1, x: 100, y: 110, radius: 50, targetColor: '#94a3b8' },
      { id: 2, x: 100, y: 80, radius: 30, targetColor: '#06b6d4' },
      { id: 3, x: 70, y: 120, radius: 8, targetColor: '#eab308' },
      { id: 4, x: 100, y: 130, radius: 8, targetColor: '#eab308' },
      { id: 5, x: 130, y: 120, radius: 8, targetColor: '#eab308' },
    ]
  },
  {
    id: 'mushroom',
    name: 'Seta Mágica',
    dots: [
      { id: 1, x: 100, y: 80, radius: 45, targetColor: '#ef4444' },
      { id: 2, x: 100, y: 140, radius: 30, targetColor: '#ffffff' },
      { id: 3, x: 75, y: 70, radius: 10, targetColor: '#ffffff' },
      { id: 4, x: 125, y: 70, radius: 10, targetColor: '#ffffff' },
    ]
  },
  {
    id: 'bee',
    name: 'Abejita',
    dots: [
      { id: 1, x: 100, y: 100, radius: 35, targetColor: '#eab308' },
      { id: 2, x: 100, y: 100, radius: 25, targetColor: '#18181b' },
      { id: 3, x: 70, y: 80, radius: 20, targetColor: '#ffffff' },
      { id: 4, x: 130, y: 80, radius: 20, targetColor: '#ffffff' },
    ]
  },
  {
    id: 'gift',
    name: 'Regalo',
    dots: [
      { id: 1, x: 100, y: 120, radius: 45, targetColor: '#a855f7' },
      { id: 2, x: 100, y: 120, radius: 15, targetColor: '#eab308' },
      { id: 3, x: 80, y: 60, radius: 20, targetColor: '#eab308' },
      { id: 4, x: 120, y: 60, radius: 20, targetColor: '#eab308' },
    ]
  }
];

interface ColoringGameProps {
  onComplete?: () => void;
  isKidsMode?: boolean;
}

export default function ColoringGame({ onComplete, isKidsMode }: ColoringGameProps) {
  const [selectedDrawing, setSelectedDrawing] = useState<Drawing>(DRAWINGS[0]);
  const [coloredDots, setColoredDots] = useState<Record<number, string>>({});
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [showTrophy, setShowTrophy] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playPaintSound = useCallback(() => {
    initAudio();
    const ctx = audioCtxRef.current!;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440 + Math.random() * 200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }, []);

  const handleDotClick = (dot: Dot) => {
    if (dot.targetColor === currentColor && !coloredDots[dot.id]) {
      playPaintSound();
      
      const nextColoredDots = { ...coloredDots, [dot.id]: currentColor };
      setColoredDots(nextColoredDots);
      
      const allColored = selectedDrawing.dots.every(d => 
        nextColoredDots[d.id] === d.targetColor
      );
      
      if (allColored) {
        if (isKidsMode) {
          setTimeout(() => {
            reset();
          }, 1500);
        } else {
          setShowTrophy(true);
          onComplete?.();
        }
      }
    }
  };

  const reset = () => {
    const nextIdx = (DRAWINGS.indexOf(selectedDrawing) + 1) % DRAWINGS.length;
    setSelectedDrawing(DRAWINGS[nextIdx]);
    setColoredDots({});
    setShowTrophy(false);
  };

  return (
    <div className="h-full w-full bg-zinc-950 flex flex-col items-center justify-start p-3 sm:p-6 lg:overflow-hidden font-sans overflow-y-auto scrollbar-hide">
      
      {/* Header */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-4 sm:mb-6 z-10 flex-shrink-0 gap-2">
        <div className="bg-zinc-900/40 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/5 flex items-center gap-2">
          <Palette className="text-pink-500 w-5 h-5" />
          <span className="text-base sm:text-lg font-black text-white font-comic tracking-tight uppercase">Pinta por Puntos</span>
        </div>
        
        <div className="bg-white/5 px-4 py-1.5 rounded-xl border border-white/5 text-zinc-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest text-center">
          {Object.keys(coloredDots).length} / {selectedDrawing.dots.length}
        </div>
      </div>

      <div className="flex-1 w-full max-w-5xl flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 lg:gap-12 min-h-0">
        
        {/* Color Palette */}
        <div className="flex sm:flex-col gap-2 p-2 sm:p-3.5 bg-zinc-900/30 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/5 order-2 sm:order-1 flex-shrink-0 max-w-full overflow-x-auto scrollbar-hide shadow-xl">
          {COLORS.map((color, idx) => (
            <motion.button
              key={`palette-color-${color}-${idx}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentColor(color)}
              className={`w-9 h-9 sm:w-11 sm:h-11 flex-shrink-0 rounded-full border-4 transition-all shadow-xl ${currentColor === color ? 'border-white scale-110 shadow-white/20' : color === '#18181b' ? 'border-zinc-700' : 'border-white/10'}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Canvas Area */}
        <div className="relative flex-1 aspect-square w-full max-w-[360px] sm:max-w-[45vh] lg:max-w-[480px] bg-zinc-900/20 rounded-[2.5rem] sm:rounded-[3rem] border-2 border-white/5 shadow-2xl flex items-center justify-center p-2 sm:p-4 order-1 sm:order-2">
          <svg key={`canvas-${selectedDrawing.id}`} viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
            {selectedDrawing.dots.map(dot => (
              <motion.circle
                key={`dot-${selectedDrawing.id}-${dot.id}`}
                cx={dot.x}
                cy={dot.y}
                r={dot.radius}
                fill={coloredDots[dot.id] || 'transparent'}
                stroke={dot.targetColor === '#18181b' ? '#52525b' : dot.targetColor}
                strokeWidth="2"
                strokeDasharray="4 2"
                className="cursor-pointer"
                onClick={() => handleDotClick(dot)}
                whileHover={{ scale: 1.05, strokeWidth: 4 }}
                whileTap={{ scale: 0.95 }}
                initial={false}
                animate={{
                  fill: coloredDots[dot.id] || 'rgba(255,255,255,0.03)',
                  strokeWidth: coloredDots[dot.id] ? 1 : 2,
                  stroke: coloredDots[dot.id] === '#18181b' ? 'rgba(255,255,255,0.2)' : (coloredDots[dot.id] ? 'transparent' : (dot.targetColor === '#18181b' ? '#52525b' : dot.targetColor))
                }}
              />
            ))}
          </svg>

          <SuccessOverlay 
            isVisible={showTrophy && !isKidsMode}
            title="¡GENIAL!"
            message={`¡Has terminado de pintar ${selectedDrawing.name}!`}
            onAction={reset}
            actionLabel="¡OTRO!"
          />
        </div>

        {/* Drawing Selection */}
        <div className="flex sm:flex-col gap-2.5 sm:gap-3 p-1.5 sm:p-3 order-3 overflow-x-auto sm:overflow-y-auto scrollbar-hide snap-x snap-mandatory flex-shrink-0 w-full sm:w-28 lg:w-44 sm:max-h-[50vh] lg:max-h-[480px]">
          {DRAWINGS.map((drawing, dIdx) => (
            <button
              key={`drawing-select-${drawing.id}-${dIdx}`}
              onClick={() => { setSelectedDrawing(drawing); setColoredDots({}); setShowTrophy(false); }}
              className={`p-2 sm:p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 min-w-[90px] sm:min-w-0 snap-center ${selectedDrawing.id === drawing.id ? 'bg-white border-white scale-105 shadow-xl' : 'bg-white/5 border-zinc-900 text-white/40 hover:bg-white/10'}`}
            >
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-zinc-950/20 rounded-xl flex items-center justify-center p-1.5 sm:p-2">
                <svg viewBox="0 0 200 200" className="w-full h-full opacity-90">
                  {drawing.dots.map((dot, dotIdx) => (
                    <circle
                      key={`preview-dot-${drawing.id}-${dot.id}-${dotIdx}`}
                      cx={dot.x}
                      cy={dot.y}
                      r={dot.radius}
                      fill="transparent"
                      stroke={dot.targetColor === '#18181b' ? '#71717a' : dot.targetColor}
                      strokeWidth="10"
                    />
                  ))}
                </svg>
              </div>
              <span className={`text-[8px] sm:text-[9px] font-black uppercase text-center truncate w-full ${selectedDrawing.id === drawing.id ? 'text-zinc-950' : 'text-white/30'}`}>
                {drawing.name}
              </span>
            </button>
          ))}
        </div>
      </div>


    </div>
  );
}

