import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dog, Cat, Fish, Bird, Bug, Rabbit, Snail, Turtle,
  Gift, Key, Umbrella, Backpack, Camera, Lightbulb, Watch, Magnet,
  Car, Bike, Truck, Ship, Plane, Rocket, Train, Bus,
  RefreshCcw, ArrowLeft, Trophy, Sparkles, LayoutGrid
} from 'lucide-react';

import SuccessOverlay from './SuccessOverlay';

type Category = 'animals' | 'objects' | 'vehicles';

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
      { id: 'dog', icon: Dog, sound: 'https://assets.mixkit.co/active_storage/sfx/2521/2521-preview.mp3' },
      { id: 'cat', icon: Cat, sound: 'https://assets.mixkit.co/active_storage/sfx/2522/2522-preview.mp3' },
      { id: 'fish', icon: Fish, sound: 'https://assets.mixkit.co/active_storage/sfx/1110/1110-preview.mp3' },
      { id: 'bird', icon: Bird, sound: 'https://assets.mixkit.co/active_storage/sfx/1363/1363-preview.mp3' },
      { id: 'bug', icon: Bug, sound: 'https://assets.mixkit.co/active_storage/sfx/2523/2523-preview.mp3' },
      { id: 'rabbit', icon: Rabbit, sound: 'https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3' },
      { id: 'snail', icon: Snail, sound: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' },
      { id: 'turtle', icon: Turtle, sound: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' },
    ]
  },
  objects: {
    label: 'Objetos',
    icon: Lightbulb,
    color: '#f87171',
    icons: [
      { id: 'gift', icon: Gift, sound: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' },
      { id: 'key', icon: Key, sound: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' },
      { id: 'umbrella', icon: Umbrella, sound: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' },
      { id: 'backpack', icon: Backpack, sound: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' },
      { id: 'camera', icon: Camera, sound: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' },
      { id: 'bulb', icon: Lightbulb, sound: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' },
      { id: 'watch', icon: Watch, sound: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' },
      { id: 'magnet', icon: Magnet, sound: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' },
    ]
  },
  vehicles: {
    label: 'Vehículos',
    icon: Rocket,
    color: '#60a5fa',
    icons: [
      { id: 'car', icon: Car, sound: 'https://assets.mixkit.co/active_storage/sfx/2501/2501-preview.mp3' },
      { id: 'bike', icon: Bike, sound: 'https://assets.mixkit.co/active_storage/sfx/2500/2500-preview.mp3' },
      { id: 'truck', icon: Truck, sound: 'https://assets.mixkit.co/active_storage/sfx/2502/2502-preview.mp3' },
      { id: 'ship', icon: Ship, sound: 'https://assets.mixkit.co/active_storage/sfx/2503/2503-preview.mp3' },
      { id: 'plane', icon: Plane, sound: 'https://assets.mixkit.co/active_storage/sfx/2504/2504-preview.mp3' },
      { id: 'rocket', icon: Rocket, sound: 'https://assets.mixkit.co/active_storage/sfx/2505/2505-preview.mp3' },
      { id: 'train', icon: Train, sound: 'https://assets.mixkit.co/active_storage/sfx/2506/2506-preview.mp3' },
      { id: 'bus', icon: Bus, sound: 'https://assets.mixkit.co/active_storage/sfx/2517/2517-preview.mp3' },
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

  const initGame = useCallback((cat: Category) => {
    const config = CATEGORIES[cat];
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

  const playSound = (url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const handleCardClick = (id: number) => {
    if (disabled) return;
    if (flippedIds.includes(id)) return;
    
    const card = cards.find(c => c.id === id);
    if (card?.isMatched) return;

    // Play sound for the card
    if (card && category) {
      const iconConfig = CATEGORIES[category].icons.find(i => i.id === card.pairId);
      if (iconConfig?.sound) {
        playSound(iconConfig.sound);
      }
    }

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
      } else {
        // NO MATCH
        setDisabled(true);
        setTimeout(() => {
          setFlippedIds([]);
          setDisabled(false);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.isMatched)) {
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 w-full max-w-5xl">
          {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES.animals][]).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <motion.button
                key={`memory-cat-${key}`}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => initGame(key)}
                className="group relative h-48 sm:h-64 bg-zinc-900/40 border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-center gap-3 sm:gap-4 shadow-xl transition-all hover:border-white/10 hover:bg-zinc-900/60"
              >
                <div 
                  className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
                  style={{ backgroundColor: config.color }}
                />
                <div 
                  className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/5 group-hover:bg-white/10 transition-colors"
                  style={{ color: config.color }}
                >
                  <Icon className="w-12 h-12 sm:w-20 sm:h-20" />
                </div>
                <span className="text-xl sm:text-2xl font-black text-white font-comic tracking-tight uppercase opacity-80">{config.label}</span>
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
                  <div className="p-2 sm:p-3 bg-white/5 rounded-full">
                    <LayoutGrid size={24} className="text-zinc-700 sm:w-8 sm:h-8" />
                  </div>
                </div>
                
                {/* Front (Icon) */}
                <div 
                  className="absolute inset-0 backface-hidden rotate-y-180 bg-zinc-800 border-2 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl"
                  style={{ borderColor: card.color, backgroundColor: `${card.color}08` }}
                >
                  <card.icon size={36} className="w-10 h-10 sm:w-16 sm:h-16" style={{ color: card.color }} />
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
