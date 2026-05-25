import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Gamepad2, 
  Trophy, 
  ChevronRight, 
  CheckCircle2,
  Brush,
  Zap,
  Target
} from 'lucide-react';

interface TutorialProps {
  onComplete: () => void;
}

const STEPS = [
  {
    title: "¡Bienvenidos a Magic Play!",
    description: "Un mundo de diversión diseñado para aprender jugando.",
    icon: Sparkles,
    color: "from-blue-500 to-cyan-500",
    image: <Brush size={120} className="text-white" />
  },
  {
    title: "Elige tu Reto",
    description: "Utiliza el menú superior para saltar entre diferentes mini-juegos mágicos.",
    icon: Gamepad2,
    color: "from-purple-500 to-pink-500",
    image: <Zap size={120} className="text-white" />
  },
  {
    title: "Gana Puntos",
    description: "Completa los desafíos para ganar puntos y convertirte en un Maestro del Tiempo o un Genio de las Mates.",
    icon: Trophy,
    color: "from-orange-500 to-yellow-500",
    image: <Target size={120} className="text-white" />
  }
];

export default function Tutorial({ onComplete }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const Step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-purple-500/10 pointer-events-none" />
      
      <motion.div 
        key={currentStep}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.1, y: -20 }}
        className="w-full max-w-lg flex flex-col items-center gap-8 bg-zinc-900/50 backdrop-blur-3xl border-2 border-white/10 p-10 rounded-[4rem] shadow-2xl relative"
      >
        <div className={`w-32 h-32 bg-gradient-to-br ${Step.color} rounded-[2.5rem] flex items-center justify-center shadow-2xl mb-4`}>
          <motion.div
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 0.9, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            {Step.image}
          </motion.div>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl sm:text-5xl font-black text-white font-comic tracking-tight uppercase leading-none">
            {Step.title}
          </h2>
          <p className="text-xl sm:text-2xl text-zinc-400 font-comic">
            {Step.description}
          </p>
        </div>

        <div className="flex gap-2 mb-4">
          {STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-500 ${i === currentStep ? 'w-12 bg-white' : 'w-2 bg-white/10'}`} 
            />
          ))}
        </div>

        <button 
          onClick={next}
          className="w-full h-20 bg-white text-zinc-950 rounded-3xl font-black text-2xl flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-xl"
        >
          {currentStep === STEPS.length - 1 ? (
            <>¡EMPEZAR! <CheckCircle2 size={32} /></>
          ) : (
            <>SIGUIENTE <ChevronRight size={32} /></>
          )}
        </button>
      </motion.div>
    </div>
  );
}
