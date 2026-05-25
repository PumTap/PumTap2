import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, 
  Sparkles, 
  Trophy, 
  RefreshCw,
  Volume2,
  Star
} from 'lucide-react';

import SuccessOverlay from './SuccessOverlay';

interface Note {
  key: string;
  name: string;
  freq: number;
  color: string;
}

interface Song {
  title: string;
  sequence: number[];
}

const PIANO_NOTES: Note[] = [
  { key: 'C', name: 'DO', freq: 261.63, color: '#ef4444' }, // Red
  { key: 'D', name: 'RE', freq: 293.66, color: '#f97316' }, // Orange
  { key: 'E', name: 'MI', freq: 329.63, color: '#eab308' }, // Yellow
  { key: 'F', name: 'FA', freq: 349.23, color: '#22c55e' }, // Green
  { key: 'G', name: 'SOL', freq: 392.00, color: '#06b6d4' }, // Cyan
  { key: 'A', name: 'LA', freq: 440.00, color: '#3b82f6' }, // Blue
  { key: 'B', name: 'SI', freq: 493.88, color: '#a855f7' }, // Purple
  { key: 'C2', name: 'DO', freq: 523.25, color: '#ec4899' }, // Pink
];

const SONG_REPERTOIRE: Song[] = [
  { title: "Estrellita Dónde Estás", sequence: [0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0, 4, 4, 3, 3, 2, 2, 1, 4, 4, 3, 3, 2, 2, 1] },
  { title: "Mary Tiene un Corderito", sequence: [2, 1, 0, 1, 2, 2, 2, 1, 1, 1, 2, 4, 4, 2, 1, 0, 1, 2, 2, 2, 2, 1, 1, 2, 1, 0] },
  { title: "Navidad, Navidad", sequence: [2, 2, 2, 2, 2, 2, 2, 4, 0, 1, 2, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1, 1, 2, 1, 4] },
  { title: "Martinillo (Frère Jacques)", sequence: [0, 1, 2, 0, 0, 1, 2, 0, 2, 3, 4, 2, 3, 4, 4, 5, 4, 3, 2, 0, 4, 5, 4, 3, 2, 0] },
  { title: "Himno a la Alegría", sequence: [2, 2, 3, 4, 4, 3, 2, 1, 0, 0, 1, 2, 2, 1, 1, 2, 2, 3, 4, 4, 3, 2, 1, 0, 0, 1, 2, 1, 0, 0] },
  { title: "Rema tu Bote", sequence: [0, 0, 0, 1, 2, 2, 1, 2, 3, 4, 7, 7, 7, 4, 4, 4, 2, 2, 2, 0, 0, 0, 4, 3, 2, 1, 0] },
  { title: "Cumpleaños Feliz", sequence: [0, 0, 1, 0, 3, 2, 0, 0, 1, 0, 4, 3, 0, 0, 7, 5, 3, 2, 1, 6, 6, 5, 3, 4, 3] },
  { title: "El Puente de Londres", sequence: [4, 5, 4, 3, 2, 3, 4, 1, 2, 3, 2, 3, 4, 4, 5, 4, 3, 2, 3, 4, 1, 4, 2, 0] },
  { title: "Cinco Lobitos", sequence: [2, 2, 2, 2, 3, 3, 3, 3, 2, 1, 0, 2, 2, 2, 2, 3, 3, 3, 3, 2, 1, 0] },
  { title: "Baa Baa Oveja Negra", sequence: [0, 0, 4, 4, 5, 5, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0, 4, 4, 4, 3, 3, 3, 2, 2, 2, 1] },
  { title: "Yankee Doodle", sequence: [0, 0, 1, 2, 0, 2, 1, 0, 0, 1, 2, 0, 3, 3, 0, 0, 1, 2, 3, 2, 1, 0, 3, 5, 4, 2, 0] },
  { title: "La Araña Pequeñita", sequence: [4, 0, 0, 1, 2, 2, 2, 1, 0, 1, 2, 0, 2, 2, 3, 4, 4, 4, 3, 2, 3, 4, 0, 0, 1, 2, 2, 2, 1, 0, 1, 2, 0] },
  { title: "Las Ruedas del Autobús", sequence: [0, 3, 3, 3, 3, 3, 0, 2, 0, 3, 0, 3, 3, 3, 3, 3, 0, 2, 0, 3] },
  { title: "Alouette", sequence: [0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 4, 4, 3, 2, 1, 0, 4, 5, 4, 3, 2, 1, 0, 1, 2, 0] },
  { title: "Nana de Brahms", sequence: [2, 2, 4, 2, 2, 4, 2, 4, 6, 5, 4, 4, 3, 3, 1, 1, 0, 0, 4, 2, 0, 4, 2, 0, 4, 3, 2, 1] },
  { title: "Campanita del Lugar", sequence: [4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0, 4, 5, 4, 3, 2, 4, 5, 4, 3, 2, 4, 4, 5, 5, 4] },
  { title: "El Hombre del Muffins", sequence: [4, 0, 0, 1, 2, 3, 4, 0, 2, 3, 4, 0, 0, 1, 2, 3, 0, 1, 0] },
  { title: "Lluvia Lluvia Vete Ya", sequence: [4, 2, 4, 4, 2, 4, 4, 2, 3, 4, 4, 2, 4, 4, 2, 4, 4, 2, 3, 4, 2] },
  { title: "Cabeza, Hombros, Rodillas", sequence: [4, 4, 3, 3, 2, 2, 4, 4, 3, 3, 2, 2, 4, 5, 6, 4, 4, 3, 3, 2, 2] },
  { title: "Arroz con Leche", sequence: [0, 1, 2, 0, 1, 2, 3, 4, 4, 3, 2, 1, 1, 0, 4, 4, 3, 2, 2, 1, 1, 0] },
];

interface PianoGameProps {
  onComplete?: () => void;
  isKidsMode?: boolean;
}

export default function PianoGame({ onComplete, isKidsMode }: PianoGameProps) {
  const [currentSong, setCurrentSong] = useState<Song>(SONG_REPERTOIRE[0]);
  const [progress, setProgress] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'success'>('start');
  const [activeKey, setActiveKey] = useState<string | null>(null);
  
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playNote = useCallback((note: Note) => {
    initAudio();
    const ctx = audioCtxRef.current!;
    if (ctx.state === 'suspended') ctx.resume();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(note.freq, ctx.currentTime);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 1);

    setActiveKey(note.key);
    setTimeout(() => setActiveKey(null), 200);

    // Game Logic
    if (gameState === 'playing') {
      const targetNoteIdx = currentSong.sequence[progress];
      if (PIANO_NOTES[targetNoteIdx].key === note.key) {
        const nextProgress = progress + 1;
        if (nextProgress >= currentSong.sequence.length) {
          setGameState('success');
          if (!isKidsMode) {
            onComplete?.();
          }
          // Celebration sound
          const sweep = ctx.createOscillator();
          sweep.frequency.setValueAtTime(400, ctx.currentTime);
          sweep.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.5);
          const sweepGain = ctx.createGain();
          sweepGain.gain.setValueAtTime(0.1, ctx.currentTime);
          sweepGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          sweep.connect(sweepGain);
          sweepGain.connect(ctx.destination);
          sweep.start();
          sweep.stop(ctx.currentTime + 0.5);
        } else {
          setProgress(nextProgress);
        }
      }
    }
  }, [gameState, progress, currentSong]);

  const startNewSequence = useCallback(() => {
    // Pick a random song different from the current one
    let nextSong;
    do {
      nextSong = SONG_REPERTOIRE[Math.floor(Math.random() * SONG_REPERTOIRE.length)];
    } while (nextSong.title === currentSong.title);
    
    setCurrentSong(nextSong);
    setProgress(0);
    setGameState('playing');
  }, [currentSong]);

  useEffect(() => {
    if (isKidsMode && gameState === 'success') {
      const timer = setTimeout(() => {
        startNewSequence();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState, isKidsMode, startNewSequence]);

  return (
    <div className="h-full w-full bg-zinc-950 flex flex-col items-center p-4 md:p-8 overflow-y-auto md:overflow-hidden font-sans">
      
      {/* Header Info */}
      <div className="w-full max-w-4xl flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4 z-10">
        <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl border border-white/10 flex items-center gap-2 sm:gap-3">
          <Music className="text-pink-500 w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-lg sm:text-xl font-black text-white font-comic tracking-tight uppercase">Piano Mágico</span>
        </div>
        
        {gameState === 'playing' && (
          <div className="flex flex-col items-center gap-2">
            <span className="text-white/60 text-xs font-bold uppercase tracking-widest">{currentSong.title}</span>
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 max-w-full pb-1">
              {currentSong.sequence.map((_, i) => (
                <motion.div
                  key={`progress-${i}`}
                  initial={{ scale: 0.8 }}
                  animate={{ 
                    scale: i === progress ? [1, 1.2, 1] : 1,
                    backgroundColor: i < progress ? PIANO_NOTES[currentSong.sequence[i]].color : 'rgba(255,255,255,0.1)'
                  }}
                  className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full shadow-lg flex-shrink-0 ${i === progress ? 'ring-2 sm:ring-4 ring-white/50' : ''}`}
                  style={{
                    transition: 'background-color 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Game Area */}
      <div className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center gap-6 sm:gap-12">
        <AnimatePresence mode="wait">
          {gameState === 'start' ? (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center flex flex-col items-center gap-6"
            >
              <div className="relative">
                <Music size={120} className="text-zinc-800" />
                <Sparkles className="absolute -top-4 -right-4 text-yellow-400 animate-pulse" size={48} />
              </div>
              <p className="text-2xl text-zinc-400 font-comic max-w-md">
                ¡Toca las notas brillantes para completar el arcoíris musical!
              </p>
              <button
                onClick={startNewSequence}
                className="px-12 py-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-4xl rounded-3xl shadow-[0_20px_50px_-20px_rgba(59,130,246,0.5)] hover:scale-105 active:scale-95 transition-all"
              >
                ¡COMENZAR!
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="piano"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col items-center gap-6 sm:gap-8"
            >
              {/* Note Display */}
              <div className="flex items-center gap-4 sm:gap-8 bg-zinc-900/50 p-4 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border border-white/5 shadow-inner">
                <div className="flex flex-col items-center">
                  <span className="text-zinc-500 font-black text-[10px] sm:text-sm uppercase tracking-widest mb-1 sm:mb-2">Toca ahora</span>
                  <motion.div
                    key={progress}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl relative"
                    style={{ backgroundColor: PIANO_NOTES[currentSong.sequence[progress]].color }}
                  >
                    <span className="text-white text-3xl sm:text-4xl font-black font-comic">
                      {PIANO_NOTES[currentSong.sequence[progress]].name}
                    </span>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="absolute inset-0 border-4 border-white/50 rounded-2xl sm:rounded-3xl"
                    />
                  </motion.div>
                </div>
                
                <div className="hidden xs:flex flex-col gap-2">
                  <span className="text-zinc-600 font-bold text-[10px] sm:text-xs uppercase tracking-tighter">Próximas:</span>
                  <div className="flex gap-1.5 sm:gap-2">
                    {currentSong.sequence.slice(progress + 1, progress + 3).map((idx, i) => (
                      <div 
                        key={`next-${i}`}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl border border-white/10 opacity-50 flex items-center justify-center"
                        style={{ backgroundColor: PIANO_NOTES[idx].color }}
                      >
                        <span className="text-white text-[10px] sm:text-xs font-black">{PIANO_NOTES[idx].name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* The Piano Keys */}
              <div className="relative flex gap-1 sm:gap-2 px-2 max-w-full overflow-x-auto pb-4 scrollbar-hide">
                {PIANO_NOTES.map((note, index) => {
                  const isTarget = gameState === 'playing' && PIANO_NOTES[currentSong.sequence[progress]].key === note.key;
                  
                  return (
                    <motion.button
                      key={note.key}
                      onClick={() => playNote(note)}
                      whileTap={{ scale: 0.95, y: 10 }}
                      className={`relative w-10 h-44 xs:w-12 sm:w-20 sm:h-64 md:w-24 md:h-80 landscape:w-16 landscape:h-40 rounded-b-xl sm:rounded-b-[2rem] border-b-4 sm:border-b-8 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] sm:shadow-[0_20px_30px_-10px_rgba(0,0,0,0.5)] transition-all flex flex-col items-center justify-end pb-4 sm:pb-8 flex-shrink-0 ${
                        activeKey === note.key 
                          ? 'translate-y-2 brightness-110' 
                          : isTarget ? 'brightness-125' : 'brightness-100'
                      }`}
                      style={{ 
                        backgroundColor: note.color,
                        borderBottomColor: 'rgba(0,0,0,0.2)'
                      }}
                    >
                      {/* Highlight for target note */}
                      {isTarget && (
                        <motion.div
                          animate={{ opacity: [0.1, 0.4, 0.1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="absolute inset-0 bg-white"
                        />
                      )}

                      {/* Shine effect */}
                      <div className="absolute top-0 left-1 sm:left-2 w-2 sm:w-4 h-full bg-white/20 blur-sm sm:blur-md pointer-events-none" />
                      
                      <span className="text-white text-xs sm:text-2xl font-black font-comic relative z-10">
                        {note.name}
                      </span>

                      {activeKey === note.key && (
                        <motion.div
                          initial={{ scale: 0, opacity: 1 }}
                          animate={{ scale: 3, opacity: 0 }}
                          className="absolute bottom-10 w-12 h-12 sm:w-20 sm:h-20 bg-white/50 rounded-full pointer-events-none"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <SuccessOverlay 
          isVisible={gameState === 'success' && !isKidsMode}
          title="¡SÚPER!"
          message="¡Has completado la melodía!"
          onAction={startNewSequence}
          actionLabel="SIGUIENTE RETO"
        />
      </div>

      <div className="mt-8 text-zinc-600 font-bold text-sm tracking-widest flex items-center gap-2">
        <Volume2 size={16} /> ¡SUBE EL VOLUMEN PARA ESCUCHAR LA MÚSICA!
      </div>
    </div>
  );
}
