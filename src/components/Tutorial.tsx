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
  Target,
  Eye,
  Volume2,
  Type,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface AccessibilitySettings {
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'highcontrast';
  subtitles: boolean;
  screenReader: boolean;
  largeFonts: boolean;
}

interface TutorialProps {
  onComplete: (settings: AccessibilitySettings) => void;
}

const STEPS = [
  {
    type: "info",
    title: "¡Bienvenidos a PumTap!",
    description: "Un mundo de diversión diseñado para aprender jugando.",
    icon: Sparkles,
    color: "from-blue-500 to-cyan-500",
    image: <Brush size={120} className="text-white" />
  },
  {
    type: "info",
    title: "Elige tu Reto",
    description: "Utiliza el menú superior para saltar entre diferentes mini-juegos mágicos.",
    icon: Gamepad2,
    color: "from-purple-500 to-pink-500",
    image: <Zap size={120} className="text-white" />
  },
  {
    type: "info",
    title: "Gana Puntos",
    description: "Completa los desafíos para ganar puntos y convertirte en un Maestro del Tiempo o un Genio de las Mates.",
    icon: Trophy,
    color: "from-orange-500 to-yellow-500",
    image: <Target size={120} className="text-white" />
  },
  {
    type: "accessibility",
    title: "Inclusión y Accesibilidad",
    description: "Personaliza el juego para que sea cómodo y amigable para todos. Puedes cambiar esto después en tu Perfil.",
    icon: Eye,
    color: "from-teal-500 to-emerald-500",
    image: <Eye size={120} className="text-white" />
  }
];

export default function Tutorial({ onComplete }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [accSettings, setAccSettings] = useState<AccessibilitySettings>({
    colorBlindness: 'none',
    subtitles: false,
    screenReader: false,
    largeFonts: false,
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const speakText = (text: string) => {
    if (window.speechSynthesis) {
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
        console.error("Error setting speech synthesis voice:", err);
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleScreenReader = () => {
    const newVal = !accSettings.screenReader;
    setAccSettings(prev => ({ ...prev, screenReader: newVal }));
    if (newVal) {
      setTimeout(() => speakText("Asistente de voz activado en PumTap. ¡Bienvenido!"), 100);
    }
  };

  const handleColorBlindnessChange = (mode: AccessibilitySettings['colorBlindness']) => {
    setAccSettings(prev => ({ ...prev, colorBlindness: mode }));
    let spanishMode = "Ninguno";
    if (mode === 'protanopia') spanishMode = "Protanopia";
    if (mode === 'deuteranopia') spanishMode = "Deuteranopia";
    if (mode === 'tritanopia') spanishMode = "Tritanopia";
    if (mode === 'highcontrast') spanishMode = "Alto Contraste";
    
    if (accSettings.screenReader) {
      speakText(`Filtro de color cambiado a ${spanishMode}`);
    }
  };

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      if (accSettings.screenReader) {
        speakText(STEPS[currentStep + 1].title + ". " + STEPS[currentStep + 1].description);
      }
    } else {
      onComplete(accSettings);
    }
  };

  const Step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col items-center justify-center p-4 text-center overflow-y-auto">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-purple-500/10 pointer-events-none" />
      
      <motion.div 
        key={currentStep}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.1, y: -20 }}
        className="w-full max-w-2xl flex flex-col items-center gap-6 bg-zinc-900/50 backdrop-blur-3xl border border-white/10 p-6 sm:p-10 rounded-[3rem] sm:rounded-[4rem] shadow-2xl relative my-auto scrollbar-hide max-h-[96vh] overflow-y-auto"
      >
        {Step.type === "info" ? (
          <>
            <div className={`w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br ${Step.color} rounded-[2.5rem] flex items-center justify-center shadow-2xl mb-2 flex-shrink-0`}>
              <motion.div
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 0.9, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {Step.image}
              </motion.div>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-5xl font-black text-white font-comic tracking-tight uppercase leading-none">
                {Step.title}
              </h2>
              <p className="text-lg sm:text-2xl text-zinc-400 font-comic max-w-md">
                {Step.description}
              </p>
            </div>
          </>
        ) : (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="text-center">
              <h2 className="text-2xl sm:text-4xl font-black text-white font-comic tracking-tight uppercase flex items-center justify-center gap-2">
                <Sparkles size={28} className="text-teal-400 animate-pulse" />
                {Step.title}
              </h2>
              <p className="text-zinc-400 font-comic text-xs sm:text-sm mt-1 max-w-md mx-auto">
                {Step.description}
              </p>
            </div>

            {/* Accessibility options grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 text-left font-comic text-white">
              {/* Option 1: Color Blindness */}
              <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-2.5">
                <span className="text-xs uppercase font-extrabold text-teal-400 tracking-wider flex items-center gap-2">
                  <Brush size={14} /> Filtro de Color / Daltonismo
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] sm:text-xs">
                  {[
                    { id: 'none', label: 'Estándar' },
                    { id: 'protanopia', label: 'Protanopía (Rojo)' },
                    { id: 'deuteranopia', label: 'Deuteranopía (Verde)' },
                    { id: 'tritanopia', label: 'Tritanopía (Azul)' },
                    { id: 'highcontrast', label: 'Alto Contraste 🌗' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleColorBlindnessChange(opt.id as any)}
                      className={`py-1.5 px-2 rounded-lg font-bold border transition-all text-left truncate ${
                        accSettings.colorBlindness === opt.id
                          ? 'bg-teal-500/20 border-teal-400 text-teal-300'
                          : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:border-white/10'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 2: Large Fonts */}
              <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex flex-col gap-1 pr-2">
                  <span className="text-xs uppercase font-extrabold text-teal-400 tracking-wider flex items-center gap-2">
                    <Type size={14} /> Textos Más Grandes
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-zinc-500 leading-normal">
                    Aumenta el tamaño de la letra para una lectura más cómoda.
                  </span>
                </div>
                <button
                  onClick={() => {
                    const nextVal = !accSettings.largeFonts;
                    setAccSettings(p => ({ ...p, largeFonts: nextVal }));
                    if (accSettings.screenReader) {
                      speakText(nextVal ? "Tamaño de fuentes ampliado" : "Tamaño de fuentes estándar");
                    }
                  }}
                  className="text-teal-400 hover:scale-110 active:scale-95 transition-all outline-none"
                >
                  {accSettings.largeFonts ? <ToggleRight size={40} /> : <ToggleLeft size={40} className="text-zinc-600" />}
                </button>
              </div>

              {/* Option 3: Screen Reader */}
              <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex flex-col gap-1 pr-2">
                  <span className="text-xs uppercase font-extrabold text-teal-400 tracking-wider flex items-center gap-2">
                    <Volume2 size={14} /> Asistente de Voz / Lector
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-zinc-500 leading-normal">
                    Lector de pantalla integrado de PumTap que narra las acciones por voz.
                  </span>
                </div>
                <button
                  onClick={toggleScreenReader}
                  className="text-teal-400 hover:scale-110 active:scale-95 transition-all outline-none"
                >
                  {accSettings.screenReader ? <ToggleRight size={40} /> : <ToggleLeft size={40} className="text-zinc-600" />}
                </button>
              </div>

              {/* Option 4: Subtitles */}
              <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex flex-col gap-1 pr-2">
                  <span className="text-xs uppercase font-extrabold text-teal-400 tracking-wider flex items-center gap-2">
                    <Zap size={14} /> Subtítulos Visuales
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-zinc-500 leading-normal">
                    Ayuda visual que muestra bocadillos o alertas textuales cuando hay efectos de sonido.
                  </span>
                </div>
                <button
                  onClick={() => {
                    const nextVal = !accSettings.subtitles;
                    setAccSettings(p => ({ ...p, subtitles: nextVal }));
                    if (accSettings.screenReader) {
                      speakText(nextVal ? "Subtítulos visuales habilitados" : "Subtítulos visuales deshabilitados");
                    }
                  }}
                  className="text-teal-400 hover:scale-110 active:scale-95 transition-all outline-none"
                >
                  {accSettings.subtitles ? <ToggleRight size={40} /> : <ToggleLeft size={40} className="text-zinc-600" />}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-500 ${i === currentStep ? 'w-12 bg-white' : 'w-2 bg-white/10'}`} 
            />
          ))}
        </div>

        <button 
          onClick={next}
          onMouseEnter={() => {
            if (accSettings.screenReader) {
              speakText(currentStep === STEPS.length - 1 ? "Botón para empezar a jugar" : "Botón para ir al paso siguiente");
            }
          }}
          className="w-full h-16 bg-white text-zinc-950 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:scale-102 active:scale-98 transition-all shadow-xl flex-shrink-0"
        >
          {currentStep === STEPS.length - 1 ? (
            <>¡EMPEZAR A JUGAR! <CheckCircle2 size={24} /></>
          ) : (
            <>SIGUIENTE RETO <ChevronRight size={24} /></>
          )}
        </button>
      </motion.div>
    </div>
  );
}
