import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCcw, CheckCircle2, ChevronRight, ChevronLeft, Brush, Star, Square, Circle, Triangle, Heart, Hexagon, ArrowBigRight, Shapes } from 'lucide-react';

interface Shape {
  id: string;
  name: string;
  icon: any;
  points: { x: number; y: number }[];
  color: string;
}

const SHAPES: Shape[] = [
  {
    id: 'circle',
    name: 'Círculo',
    icon: Circle,
    color: '#3b82f6',
    points: Array.from({ length: 100 }, (_, i) => {
      const angle = (i / 100) * Math.PI * 2;
      return { x: 50 + Math.cos(angle) * 35, y: 50 + Math.sin(angle) * 35 };
    })
  },
  {
    id: 'square',
    name: 'Cuadrado',
    icon: Square,
    color: '#ef4444',
    points: [
      ...Array.from({ length: 20 }, (_, i) => ({ x: 20 + i * 3, y: 20 })),
      ...Array.from({ length: 20 }, (_, i) => ({ x: 80, y: 20 + i * 3 })),
      ...Array.from({ length: 20 }, (_, i) => ({ x: 80 - i * 3, y: 80 })),
      ...Array.from({ length: 20 }, (_, i) => ({ x: 20, y: 80 - i * 3 })),
    ]
  },
  {
    id: 'triangle',
    name: 'Triángulo',
    icon: Triangle,
    color: '#10b981',
    points: [
      ...Array.from({ length: 25 }, (_, i) => ({ x: 50 - i * 1.5, y: 20 + i * 2.4 })),
      ...Array.from({ length: 25 }, (_, i) => ({ x: 12.5 + i * 3, y: 80 })),
      ...Array.from({ length: 25 }, (_, i) => ({ x: 87.5 - i * 1.5, y: 80 - i * 2.4 })),
    ]
  },
  {
    id: 'star',
    name: 'Estrella',
    icon: Star,
    color: '#f59e0b',
    points: Array.from({ length: 100 }, (_, i) => {
      const t = (i / 100) * Math.PI * 2;
      const r = i % 20 < 10 ? 40 : 15;
      return { x: 50 + Math.cos(t) * r, y: 50 + Math.sin(t) * r };
    })
  },
  {
    id: 'heart',
    name: 'Corazón',
    icon: Heart,
    color: '#ec4899',
    points: Array.from({ length: 100 }, (_, i) => {
      const t = (i / 100) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      return { x: 50 + x * 2.2, y: 45 + y * 2.2 };
    })
  },
  {
    id: 'pentagon',
    name: 'Pentágono',
    icon: Shapes,
    color: '#a855f7',
    points: Array.from({ length: 5 }, (_, i) => {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      return { x: 50 + Math.cos(angle) * 35, y: 50 + Math.sin(angle) * 35 };
    }).reduce((acc: {x:number, y:number}[], p, i, arr) => {
      const next = arr[(i + 1) % arr.length];
      const segments = 20;
      for (let s = 0; s < segments; s++) {
        acc.push({
          x: p.x + (next.x - p.x) * (s / segments),
          y: p.y + (next.y - p.y) * (s / segments)
        });
      }
      return acc;
    }, [])
  },
  {
    id: 'hexagon',
    name: 'Hexágono',
    icon: Hexagon,
    color: '#f97316',
    points: Array.from({ length: 6 }, (_, i) => {
      const angle = (i / 6) * Math.PI * 2;
      return { x: 50 + Math.cos(angle) * 35, y: 50 + Math.sin(angle) * 35 };
    }).reduce((acc: {x:number, y:number}[], p, i, arr) => {
      const next = arr[(i + 1) % arr.length];
      const segments = 15;
      for (let s = 0; s < segments; s++) {
        acc.push({
          x: p.x + (next.x - p.x) * (s / segments),
          y: p.y + (next.y - p.y) * (s / segments)
        });
      }
      return acc;
    }, [])
  },
  {
    id: 'arrow',
    name: 'Flecha',
    icon: ArrowBigRight,
    color: '#06b6d4',
    points: [
      { x: 20, y: 40 }, { x: 60, y: 40 }, { x: 60, y: 20 },
      { x: 85, y: 50 }, { x: 60, y: 80 }, { x: 60, y: 60 },
      { x: 20, y: 60 }, { x: 20, y: 40 }
    ].reduce((acc: {x:number, y:number}[], p, i, arr) => {
      const next = arr[(i + 1) % arr.length];
      const segments = 12;
      for (let s = 0; s < segments; s++) {
        acc.push({
          x: p.x + (next.x - p.x) * (s / segments),
          y: p.y + (next.y - p.y) * (s / segments)
        });
      }
      return acc;
    }, [])
  }
];

export default function ShapeDrawing({ onComplete }: { onComplete?: () => void }) {
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tracedPoints, setTracedPoints] = useState<{ x: number; y: number }[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showParticle, setShowParticle] = useState(false);
  
  const currentShape = SHAPES[currentShapeIndex];

  const clearCanvas = useCallback(() => {
    setTracedPoints([]);
    setIsSuccess(false);
    setShowParticle(false);
  }, []);

  const nextShape = useCallback(() => {
    setCurrentShapeIndex((prev) => (prev + 1) % SHAPES.length);
    clearCanvas();
  }, [clearCanvas]);

  const prevShape = useCallback(() => {
    setCurrentShapeIndex((prev) => (prev - 1 + SHAPES.length) % SHAPES.length);
    clearCanvas();
  }, [clearCanvas]);

  const checkCompletion = useCallback((userPoints: { x: number; y: number }[]) => {
    if (userPoints.length < 15 || isSuccess) return;

    let hitCount = 0;
    const threshold = 10; 

    currentShape.points.forEach(sp => {
      const isHit = userPoints.some(up => {
        const dist = Math.sqrt(Math.pow(sp.x - up.x, 2) + Math.pow(sp.y - up.y, 2));
        return dist < threshold;
      });
      if (isHit) hitCount++;
    });

    const completionRatio = hitCount / currentShape.points.length;
    if (completionRatio > 0.8) {
      setIsSuccess(true);
      setShowParticle(true);
      playSuccessSound();
      
      // Award 25 points only if this was the last shape
      if (currentShapeIndex === SHAPES.length - 1) {
        if (onComplete) (onComplete as any)(25);
      }
      
      // Auto-advance with a pleasant delay
      setTimeout(() => {
        nextShape();
      }, 1500);
    }
  }, [currentShape, onComplete, nextShape, isSuccess]);

  const playSuccessSound = () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isSuccess) return;
    setIsDrawing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setTracedPoints([{ x, y }]);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || isSuccess) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Smooth drawing by only adding points if they moved enough
    setTracedPoints(prev => {
      const last = prev[prev.length - 1];
      if (last) {
        const dist = Math.sqrt(Math.pow(last.x - x, 2) + Math.pow(last.y - y, 2));
        if (dist < 1) return prev;
      }
      return [...prev, { x, y }];
    });
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    checkCompletion(tracedPoints);
  };

  return (
    <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center p-2 sm:p-6">
      <div className="w-full max-w-5xl h-full flex flex-col bg-zinc-900/40 rounded-[2.5rem] border border-white/5 p-4 sm:p-10 shadow-2xl overflow-hidden">
        
        {/* Header - More Compact on small screens */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-zinc-800/50 border border-white/10 shadow-inner">
              <Brush className="text-pink-400" size={32} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase leading-none">Dibujo Mágico</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">{currentShape.name}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-zinc-950/50 p-2 rounded-2xl border border-white/5">
            <button 
              onClick={prevShape}
              disabled={isSuccess}
              className="p-4 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl text-white transition-all active:scale-90"
            >
              <ChevronLeft size={28} />
            </button>
            <div className="px-4 text-zinc-600 font-mono text-sm font-bold">
              {currentShapeIndex + 1} / {SHAPES.length}
            </div>
            <button 
              onClick={nextShape}
              disabled={isSuccess}
              className="p-4 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl text-white transition-all active:scale-90"
            >
              <ChevronRight size={28} />
            </button>
          </div>
        </div>

        {/* Canvas Area - Dynamic Sizing */}
        <div className="flex-1 min-h-0 relative w-full flex items-center justify-center">
          <div 
            className="relative aspect-square h-full max-w-full rounded-[3rem] bg-zinc-950 border-4 border-white/5 shadow-2xl cursor-crosshair touch-none flex items-center justify-center overflow-hidden group"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 opacity-10 pointer-events-none transition-colors duration-1000" style={{ backgroundColor: currentShape.color }} />

            {/* Template Shape (Dotted) */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
              <path
                d={currentShape.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                fill="none"
                stroke={currentShape.color}
                strokeWidth="5"
                strokeDasharray="4 6"
                className="transition-all duration-700 opacity-30 group-hover:opacity-50"
                strokeLinecap="round"
              />
            </svg>

            {/* User Drawing */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
              {tracedPoints.length > 0 && (
                <path
                  d={tracedPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                  fill="none"
                  stroke={currentShape.color}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                  style={{ filter: `drop-shadow(0 0 8px ${currentShape.color})` }}
                />
              )}
            </svg>

            {/* Success Overlay */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div 
                  key="shape-drawing-success-overlay"
                  initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                  animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/60 z-20"
                >
                  <motion.div
                    initial={{ scale: 0.2, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="p-8 bg-emerald-500 rounded-full mb-6 shadow-[0_0_60px_rgba(16,185,129,0.5)]"
                  >
                    <CheckCircle2 size={100} className="text-white" />
                  </motion.div>
                  <motion.h2 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-6xl font-black text-white italic uppercase tracking-tighter"
                  >
                    ¡MAGNÍFICO!
                  </motion.h2>
                  {currentShapeIndex === SHAPES.length - 1 && (
                    <p className="text-emerald-400 font-bold uppercase tracking-widest mt-2">+25 PUNTOS</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hint */}
            {!isDrawing && tracedPoints.length === 0 && !isSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute flex flex-col items-center gap-4 text-zinc-500 font-black text-2xl uppercase tracking-wider pointer-events-none select-none"
              >
                <RefreshCcw className="animate-spin-slow opacity-20" size={60} />
                <span>Repasa la línea</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-8 flex justify-center items-center gap-6">
          <button 
            onClick={clearCanvas}
            disabled={isSuccess || tracedPoints.length === 0}
            className="group flex items-center gap-3 px-8 py-4 bg-zinc-800/50 hover:bg-zinc-800 disabled:opacity-0 disabled:pointer-events-none text-zinc-400 hover:text-white rounded-2xl font-black uppercase text-sm tracking-widest transition-all"
          >
            <RefreshCcw size={20} className="group-active:rotate-180 transition-transform" /> Borrar Trazo
          </button>
        </div>

      </div>
    </div>
  );
}
