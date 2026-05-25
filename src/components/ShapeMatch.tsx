import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Circle, 
  Square, 
  Triangle, 
  Star, 
  Diamond, 
  Heart, 
  RefreshCcw, 
  Trophy,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// Use a subset of Lucide icons that represent clear shapes
import SuccessOverlay from './SuccessOverlay';

const SHAPE_ICONS = {
  circle: Circle,
  square: Square,
  triangle: Triangle,
  star: Star,
  diamond: Diamond,
  heart: Heart,
};

type ShapeType = keyof typeof SHAPE_ICONS;

const COLORS = [
  { name: 'rosa-neon', value: '#ff007f', border: '#ff3399' },
  { name: 'azul-neon', value: '#00f0ff', border: '#33f5ff' },
  { name: 'verde-neon', value: '#39ff14', border: '#66ff4d' },
  { name: 'amarillo-neon', value: '#ffea00', border: '#ffee33' },
  { name: 'naranja-neon', value: '#ff5f00', border: '#ff7f33' },
  { name: 'purpura-neon', value: '#ab00ff', border: '#be33ff' },
];

interface ShapeItem {
  id: string;
  type: ShapeType;
  color: typeof COLORS[0];
  isMatched: boolean;
}

interface ShapeMatchProps {
  onComplete?: (points: number) => void;
  isKidsMode?: boolean;
}

export default function ShapeMatch({ onComplete, isKidsMode }: ShapeMatchProps) {
  const [shapes, setShapes] = useState<ShapeItem[]>([]);
  const [sockets, setSockets] = useState<ShapeItem[]>([]);
  const [score, setScore] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const initGame = useCallback(() => {
    const selectedShapes: ShapeItem[] = [];
    const availableTypes = Object.keys(SHAPE_ICONS) as ShapeType[];
    
    // Shuffle lists to guarantee absolute uniqueness of shapes and colors
    const shuffledTypes = [...availableTypes].sort(() => Math.random() - 0.5);
    const shuffledColors = [...COLORS].sort(() => Math.random() - 0.5);
    
    // Create 4 completely unique shapes with unique colors
    for (let i = 0; i < 4; i++) {
      const type = shuffledTypes[i];
      const color = shuffledColors[i % shuffledColors.length];
      const uniqueId = `${type}-${color.name}-${Math.random().toString(36).substring(2, 11)}`;
      selectedShapes.push({
        id: uniqueId,
        type,
        color,
        isMatched: false,
      });
    }

    setShapes([...selectedShapes].sort(() => Math.random() - 0.5));
    setSockets([...selectedShapes].sort(() => Math.random() - 0.5));
    setShowSuccess(false);
    setShowLevelUp(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const playMatchSound = () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
    setTimeout(() => ctx.close(), 200);
  };

  const playErrorSound = () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
    setTimeout(() => ctx.close(), 300);
  };

  const handleMatch = (shapeId: string, socketId: string) => {
    const shape = shapes.find(s => s.id === shapeId);
    
    if (shape && shapeId === socketId) {
      // Correct match
      playMatchSound();
      setShapes(prev => prev.map(s => s.id === shapeId ? { ...s, isMatched: true } : s));
      setSockets(prev => prev.map(s => s.id === socketId ? { ...s, isMatched: true } : s));
      
      // Check if level is complete
      const updatedShapes = shapes.map(s => s.id === shapeId ? { ...s, isMatched: true } : s);
      if (updatedShapes.every(s => s.isMatched)) {
        handleLevelComplete();
      }
    } else {
      playErrorSound();
    }
  };

  const handleLevelComplete = () => {
    setShowSuccess(true);
    setScore(prev => prev + 25);
    setRoundsCompleted(prev => prev + 1);
    
    if (isKidsMode) {
      setTimeout(() => {
        initGame();
        setShowSuccess(false);
        setShowLevelUp(false);
      }, 1500);
    } else {
      if (onComplete) {
        onComplete(25);
      }

      setTimeout(() => {
        setShowLevelUp(true);
      }, 1000);
    }
  };

  return (
    <div className="h-full w-full bg-zinc-950 flex flex-col items-center justify-center p-4 landscape:py-2 landscape:px-6 sm:p-8 font-sans overflow-hidden relative">
      {/* Background neon grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#14141b_1px,transparent_1px),linear-gradient(to_bottom,#14141b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />

      <header className="w-full max-w-4xl flex items-center justify-between mb-6 landscape:mb-2 md:mb-8 z-10 flex-shrink-0">
        <div className="flex flex-col">
          <h2 className="text-2xl sm:text-4xl landscape:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-amber-400 tracking-tight uppercase italic leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] animate-pulse">
            Ajuste Mágico
          </h2>
          <p className="text-[10px] sm:text-xs font-black text-cyan-400/60 uppercase tracking-widest mt-1">
            Coloque cada forma en su lugar
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-zinc-900/90 backdrop-blur-md px-4 py-1.5 landscape:px-3 landscape:py-1 sm:px-6 sm:py-2 rounded-xl border-2 border-zinc-800 shadow-2xl flex items-center gap-3">
            <Trophy className="text-yellow-400 w-5 h-5 landscape:w-4 landscape:h-4 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
            <span className="text-xl sm:text-2xl font-black text-white">{score}</span>
          </div>
          <button 
            onClick={initGame}
            className="p-2 sm:p-3 landscape:p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-800 hover:text-white transition-colors shadow-lg active:scale-95"
          >
            <RefreshCcw size={20} />
          </button>
        </div>
      </header>

      <main className="w-full max-w-[95%] lg:max-w-6xl flex-1 flex flex-col landscape:flex-row md:flex-row items-center justify-center gap-6 landscape:gap-14 md:gap-20 lg:gap-32 z-10 mb-8 landscape:mb-2">
        {/* Sockets (Huecos) */}
        <div className="grid grid-cols-2 gap-4 landscape:gap-2 sm:gap-10 order-2 md:order-1">
          {sockets.map((socket) => (
            <div 
              key={socket.id}
              className="relative w-24 h-24 landscape:w-[15vh] landscape:h-[15vh] sm:w-36 sm:h-36 lg:w-44 lg:h-44 flex items-center justify-center"
              data-socket-id={socket.id}
            >
              <ShapeContainer 
                type={socket.type}
                color={socket.color.value}
                isSocket={true}
                isMatched={socket.isMatched}
              >
                {!socket.isMatched ? (
                  <div className="text-zinc-800 select-none pointer-events-none">
                    {React.createElement(SHAPE_ICONS[socket.type], { 
                      size: window.innerWidth < 640 ? 32 : 48, 
                      strokeWidth: 2,
                      className: "opacity-40"
                    })}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]"
                  >
                    <CheckCircle2 className="w-10 h-10 sm:w-20 sm:h-20 landscape:w-8 landscape:h-8" />
                  </motion.div>
                )}
              </ShapeContainer>
            </div>
          ))}
        </div>

        {/* Draggable Shapes */}
        <div className="grid grid-cols-2 gap-4 landscape:gap-2 sm:gap-10 order-1 md:order-2">
          {shapes.map((shape) => (
            <div key={shape.id} className="relative w-24 h-24 landscape:w-[15vh] landscape:h-[15vh] sm:w-36 sm:h-36 lg:w-44 lg:h-44">
              <AnimatePresence>
                {!shape.isMatched && (
                  <DraggableShape 
                    key={shape.id}
                    shape={shape} 
                    onMatch={(socketId) => handleMatch(shape.id, socketId)}
                  />
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </main>

      <SuccessOverlay 
        isVisible={showLevelUp && !isKidsMode}
        title="¡GENIAL!"
        message="¡Lo has logrado!"
        points={25}
        onAction={initGame}
        actionLabel="REINTENTAR"
      />


      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}} />
    </div>
  );
}

interface DraggableShapeProps {
  key?: string | number;
  shape: ShapeItem;
  onMatch: (socketId: string) => void;
}

const SHAPE_PATHS = {
  circle: "M 50,50 m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0",
  square: "M 20,10 H 80 A 10,10 0 0 1 90,20 V 80 A 10,10 0 0 1 80,90 H 20 A 10,10 0 0 1 10,80 V 20 A 10,10 0 0 1 20,10 Z",
  triangle: "M 50,15 L 85,85 H 15 Z",
  star: "M 50,10 L 61,40 L 92,40 L 67,60 L 77,90 L 50,70 L 23,90 L 33,60 L 8,40 L 39,40 Z",
  diamond: "M 50,10 L 90,50 L 50,90 L 10,50 Z",
  heart: "M 50,30 C 50,15 90,15 90,45 C 90,75 50,90 50,90 C 50,90 10,75 10,45 C 10,15 50,15 50,30"
};

function ShapeContainer({ type, color, border, isSocket, isMatched, children }: { 
  type: ShapeType; 
  color: string; 
  border?: string; 
  isSocket?: boolean;
  isMatched?: boolean;
  children?: React.ReactNode;
}) {
  const isFilled = !isSocket || isMatched;
  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {/* Neon Glow beneath active or filled shapes */}
        {isFilled && (
          <path 
            d={SHAPE_PATHS[type]} 
            fill="none"
            stroke={color}
            strokeWidth={14}
            className="blur-md opacity-40 transition-all duration-300"
          />
        )}
        <path 
          d={SHAPE_PATHS[type]} 
          fill={isSocket && !isMatched ? 'rgba(9, 9, 11, 0.6)' : color}
          stroke={color}
          strokeWidth={isSocket && !isMatched ? 2.5 : border ? 1 : 0}
          strokeDasharray={isSocket && !isMatched ? "5,5" : "none"}
          className="transition-all duration-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
        />
      </svg>
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        {children}
      </div>
    </div>
  );
}

function DraggableShape({ shape, onMatch }: DraggableShapeProps) {
  const [isError, setIsError] = useState(false);

  return (
    <motion.div
      drag
      dragSnapToOrigin
      dragMomentum={false}
      dragElastic={0.1}
      whileDrag={{ scale: 1.1, zIndex: 100, rotate: 2 }}
      whileHover={{ scale: 1.05, cursor: 'grab' }}
      whileTap={{ cursor: 'grabbing' }}
      onDragEnd={(e, info) => {
        // Detect if dropped over a socket
        const x = info.point.x;
        const y = info.point.y;
        
        const elements = document.elementsFromPoint(x, y);
        const socketElement = elements.find(el => el.getAttribute('data-socket-id'));
        
        if (socketElement) {
          const socketId = socketElement.getAttribute('data-socket-id');
          if (socketId === shape.id) {
            onMatch(socketId);
          } else {
            setIsError(true);
            setTimeout(() => setIsError(false), 500);
          }
        }
      }}
      className={`w-full h-full flex items-center justify-center active:scale-95 ${isError ? 'animate-shake' : ''}`}
      data-shape-id={shape.id}
    >
      <ShapeContainer 
        type={shape.type} 
        color={shape.color.value} 
        border={shape.color.border}
      >
        <div className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.85)] flex items-center justify-center">
          {React.createElement(SHAPE_ICONS[shape.type], { 
            size: window.innerWidth < 640 ? 36 : 56, 
            strokeWidth: 3 
          })}
        </div>
      </ShapeContainer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}} />
    </motion.div>
  );
}
