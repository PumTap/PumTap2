import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dog, Cat, Fish, Bird, Bug, Rabbit, Snail, Turtle,
  Gift, Key, Umbrella, Backpack, Camera, Lightbulb, Watch, Magnet,
  Car, Bike, Truck, Ship, Plane, Rocket, Train, Bus,
  RefreshCcw, ArrowLeft, Trophy, Sparkles, LayoutGrid,
  Sun, Moon, Globe, Orbit, Star, Satellite, Atom
} from 'lucide-react';

import SuccessOverlay from './SuccessOverlay';

type Category = 'animals' | 'objects' | 'vehicles' | 'planets';

const SPANISH_NAMES: Record<string, string> = {
  // Animals
  dog: 'Perro',
  cat: 'Gato',
  fish: 'Pez',
  bird: 'Pájaro',
  bug: 'Bicho',
  rabbit: 'Conejo',
  snail: 'Caracol',
  turtle: 'Tortuga',
  
  // Objects
  gift: 'Regalo',
  key: 'Llave',
  umbrella: 'Paraguas',
  backpack: 'Mochila',
  camera: 'Cámara',
  bulb: 'Bombilla',
  watch: 'Reloj',
  magnet: 'Imán',

  // Vehicles
  car: 'Coche',
  bike: 'Bicicleta',
  truck: 'Camión',
  ship: 'Barco',
  plane: 'Avión',
  rocket: 'Cohete espacial',
  train: 'Tren',
  bus: 'Autobús',

  // Planets
  sun: 'Sol',
  moon: 'Luna',
  earth: 'Tierra',
  saturn: 'Planeta Saturno',
  star: 'Estrella',
  satellite: 'Satélite',
  rocket_planet: 'Cohete espacial',
  core: 'Átomo'
};

interface CardType {
  id: number;
  icon: React.ElementType;
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
  color: string;
}

const CATEGORIES = {
  animals: {
    label: 'Animales',
    icon: Dog,
    color: '#4ade80',
    icons: [
      { id: 'dog', icon: Dog },
      { id: 'cat', icon: Cat },
      { id: 'fish', icon: Fish },
      { id: 'bird', icon: Bird },
      { id: 'bug', icon: Bug },
      { id: 'rabbit', icon: Rabbit },
      { id: 'snail', icon: Snail },
      { id: 'turtle', icon: Turtle },
    ]
  },
  objects: {
    label: 'Objetos',
    icon: Lightbulb,
    color: '#f87171',
    icons: [
      { id: 'gift', icon: Gift },
      { id: 'key', icon: Key },
      { id: 'umbrella', icon: Umbrella },
      { id: 'backpack', icon: Backpack },
      { id: 'camera', icon: Camera },
      { id: 'bulb', icon: Lightbulb },
      { id: 'watch', icon: Watch },
      { id: 'magnet', icon: Magnet },
    ]
  },
  vehicles: {
    label: 'Vehículos',
    icon: Rocket,
    color: '#60a5fa',
    icons: [
      { id: 'car', icon: Car },
      { id: 'bike', icon: Bike },
      { id: 'truck', icon: Truck },
      { id: 'ship', icon: Ship },
      { id: 'plane', icon: Plane },
      { id: 'rocket', icon: Rocket },
      { id: 'train', icon: Train },
      { id: 'bus', icon: Bus },
    ]
  },
  planets: {
    label: 'Planetas',
    icon: Orbit,
    color: '#c084fc',
    icons: [
      { id: 'sun', icon: Sun },
      { id: 'moon', icon: Moon },
      { id: 'earth', icon: Globe },
      { id: 'saturn', icon: Orbit },
      { id: 'star', icon: Star },
      { id: 'satellite', icon: Satellite },
      { id: 'rocket_planet', icon: Rocket },
      { id: 'core', icon: Atom },
    ]
  }
};

const COLORS = ['#ef4444', '#3b82f6', '#facc15', '#22c55e', '#f472b6', '#f97316', '#a855f7', '#06b6d4'];

interface MemoryGameProps {
  onComplete?: () => void;
  isKidsMode?: boolean;
}

export default function MemoryGame({ onComplete, isKidsMode }: MemoryGameProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const hasCalledOnComplete = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const speakText = (text: string) => {
    try {
      const profileStr = localStorage.getItem('magic_play_user_profile');
      if (profileStr) {
        const profile = JSON.parse(profileStr);
        if (profile?.accessibility?.screenReader && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'es-ES';
          try {
            const voices = window.speechSynthesis.getVoices();
            const esVoice = voices.find(v => v.lang === 'es-ES' || v.lang === 'es_ES') || 
                            voices.find(v => v.lang.startsWith('es-') || v.lang.startsWith('es_')) ||
                            voices.find(v => v.lang.includes('es'));
            if (esVoice) {
              utterance.voice = esVoice;
            }
          } catch (err) {
            console.error(err);
          }
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (e) {
      console.error("speakText error in MemoryGame:", e);
    }
  };

  const initGame = useCallback((cat: Category) => {
    const config = CATEGORIES[cat];
    speakText(`Iniciando juego de memoria con tema ${config.label}`);
    const gameIcons = [...config.icons];
    
    // Create pairs
    const deck: CardType[] = [];
    gameIcons.forEach((item, index) => {
      const color = COLORS[index % COLORS.length];
      // First card of pair
      deck.push({
        id: index * 2,
        icon: item.icon,
        pairId: item.id,
        isFlipped: false,
        isMatched: false,
        color
      });
      // Second card of pair
      deck.push({
        id: index * 2 + 1,
        icon: item.icon,
        pairId: item.id,
        isFlipped: false,
        isMatched: false,
        color
      });
    });

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setCategory(cat);
    setFlippedIds([]);
    setDisabled(false);
    setIsGameComplete(false);
  }, []);

  const playSynthSound = (type: 'flip' | 'match' | 'fail' | 'victory') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      if (type === 'flip') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
        setTimeout(() => ctx.close(), 150);
      } else if (type === 'match') {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now);
        gain1.gain.setValueAtTime(0.12, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, now + 0.06);
        gain2.gain.setValueAtTime(0.12, now + 0.06);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc1.start();
        osc1.stop(now + 0.25);
        osc2.start(now + 0.06);
        osc2.stop(now + 0.3);
        setTimeout(() => ctx.close(), 450);
      } else if (type === 'fail') {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.18);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.18);
        setTimeout(() => ctx.close(), 250);
      } else if (type === 'victory') {
        const now = ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(0.1, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.25);
        });
        setTimeout(() => ctx.close(), 900);
      }
    } catch (e) {
      console.error('Synth sound error:', e);
    }
  };

  const handleCardClick = (id: number) => {
    if (disabled) return;
    if (flippedIds.includes(id)) return;
    
    const card = cards.find(c => c.id === id);
    if (card?.isMatched) return;

    // Play crisp homogeneous flip sound
    playSynthSound('flip');

    const name = SPANISH_NAMES[card?.pairId || ''] || card?.pairId || 'carta';

    setFlippedIds(prev => [...prev, id]);

    if (flippedIds.length === 1) {
      const firstId = flippedIds[0];
      const secondId = id;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard?.pairId === secondCard?.pairId) {
        // MATCH
        setCards(prev => prev.map(c => 
          (c.id === firstId || c.id === secondId) ? { ...c, isMatched: true } : c
        ));
        setFlippedIds([]);
        // Play success matching sound after a small delay so they don't overlap with flip
        setTimeout(() => playSynthSound('match'), 120);
        speakText(`${name}. ¡Pareja encontrada!`);
      } else {
        // NO MATCH
        setDisabled(true);
        // Play fail sound after a small delay
        setTimeout(() => playSynthSound('fail'), 120);
        speakText(`${name}. No coincide con ${SPANISH_NAMES[firstCard?.pairId || ''] || ''}.`);
        setTimeout(() => {
          setFlippedIds([]);
          setDisabled(false);
        }, 1100);
      }
    } else {
      speakText(name);
    }
  };

  useEffect(() => {
    const isMatchedAll = cards.length > 0 && cards.every(c => c.isMatched);
    if (!isMatchedAll) {
      hasCalledOnComplete.current = false;
    } else if (isMatchedAll && !hasCalledOnComplete.current) {
      hasCalledOnComplete.current = true;
      // Play general victory sound
      playSynthSound('victory');
      if (isKidsMode) {
        const timer = setTimeout(() => {
          if (category) {
            initGame(category);
          }
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setIsGameComplete(true);
          onComplete?.();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [cards, onComplete, isKidsMode, category, initGame]);

  if (!category) {
    return (
      <div className="h-full w-full bg-zinc-950 flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto scrollbar-hide">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Sparkles className="text-yellow-400 w-6 h-6 sm:w-8 sm:h-8" />
            <h2 className="text-3xl sm:text-5xl font-black text-white font-comic tracking-tighter uppercase">MEMO</h2>
            <Sparkles className="text-yellow-400 w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <p className="text-lg sm:text-xl text-zinc-500 font-comic">Elige un tema para jugar</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 w-full max-w-6xl px-2 sm:px-0">
          {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES.animals][]).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <motion.button
                key={`memory-cat-${key}`}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => initGame(key)}
                className="group relative h-28 xs:h-36 sm:h-48 lg:h-64 bg-zinc-900/40 border border-white/5 rounded-2xl sm:rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-center gap-1.5 sm:gap-4 shadow-xl transition-all hover:border-white/10 hover:bg-zinc-900/60"
              >
                <div 
                  className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
                  style={{ backgroundColor: config.color }}
                />
                <div 
                  className="p-1.5 xs:p-3 sm:p-6 rounded-xl sm:rounded-3xl bg-white/5 group-hover:bg-white/10 transition-colors text-white"
                  style={{ color: config.color }}
                >
                  <Icon className="w-8 h-8 xs:w-12 sm:w-20 sm:h-20 animate-none" />
                </div>
                <span className="text-xs xs:text-base sm:text-2xl font-black text-white font-comic tracking-tight uppercase opacity-80">{config.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-zinc-950 flex flex-col p-3 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 sm:mb-6 max-w-5xl mx-auto w-full z-10">
        <button 
          onClick={() => setCategory(null)}
          className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900/40 text-white/80 rounded-xl border border-white/5 hover:bg-zinc-800 transition-colors font-bold text-sm"
        >
          <ArrowLeft size={18} /> Volver
        </button>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <div 
            className="p-1.5 sm:p-2 rounded-lg"
            style={{ backgroundColor: `${CATEGORIES[category].color}15`, color: CATEGORIES[category].color }}
          >
            {React.createElement(CATEGORIES[category].icon, { size: 20 })}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white font-comic uppercase tracking-tighter opacity-80">{CATEGORIES[category].label}</h3>
        </div>

        <button 
          onClick={() => initGame(category)}
          className="p-2 sm:p-2.5 bg-zinc-900/40 text-white/60 rounded-xl border border-white/5 hover:bg-zinc-800 transition-colors"
          title="Reiniciar"
        >
          <RefreshCcw size={20} />
        </button>
      </div>

      {/* GridContainer with subtle background */}
      <div className="flex-1 flex items-center justify-center min-h-0 w-full relative">
        <div className="w-full h-full max-w-7xl mx-auto flex items-center justify-center p-2 sm:p-4">
          <div className="grid grid-cols-4 gap-2 sm:gap-4 lg:gap-5 w-full max-w-[min(90vw,70vh)] h-auto content-center mx-auto transition-all">
            {cards.map((card) => (
              <div 
                key={card.id} 
                className="relative aspect-square cursor-pointer perspective-1000 group"
                onClick={() => handleCardClick(card.id)}
              >
              <motion.div
                className="w-full h-full relative preserve-3d"
                initial={false}
                animate={{ rotateY: (flippedIds.includes(card.id) || card.isMatched) ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', damping: 20, stiffness: 260 }}
              >
                {/* Back (Cover) */}
                <div className="absolute inset-0 backface-hidden bg-zinc-900 border-2 border-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl group-hover:border-white/10 transition-colors">
                  <div className="p-1 sm:p-3 bg-white/5 rounded-full">
                    <LayoutGrid className="text-zinc-700 w-5 h-5 xs:w-8 xs:h-8" />
                  </div>
                </div>
                
                {/* Front (Icon) */}
                <div 
                  className="absolute inset-0 backface-hidden rotate-y-180 bg-zinc-800 border-2 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl"
                  style={{ borderColor: card.color, backgroundColor: `${card.color}08` }}
                >
                  <card.icon className="w-6 h-6 xs:w-10 xs:h-10 sm:w-14 sm:h-14" style={{ color: card.color }} />
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>

      <SuccessOverlay 
        isVisible={isGameComplete && !isKidsMode}
        title="¡INCREÍBLE!"
        message={`Has encontrado todas las parejas${category ? ` de ${CATEGORIES[category].label.toLowerCase()}` : ''}`}
        onAction={() => initGame(category!)}
        actionLabel="¡OTRA VEZ!"
      />

      <style>{`
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
