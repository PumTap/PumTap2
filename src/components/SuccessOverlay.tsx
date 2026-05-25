import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Sparkles, RefreshCw, Star } from 'lucide-react';

interface SuccessOverlayProps {
  key?: string;
  isVisible: boolean;
  title?: string;
  message?: string;
  points?: number;
  onAction: () => void;
  actionLabel?: string;
  icon?: React.ReactNode;
}

export default function SuccessOverlay({
  isVisible,
  title = "¡SÚPER!",
  message,
  points,
  onAction,
  actionLabel = "SIGUIENTE RETO",
  icon = <Trophy className="text-yellow-400 w-16 h-16 sm:w-24 sm:h-24 shadow-glow" />
}: SuccessOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
           key={`success-overlay-container-${title}-${points || 0}`}
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-xl p-6"
        >
          {/* Sparkles background */}
           <div className="absolute inset-0 pointer-events-none">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={`success-sparkle-${i}`}
                  initial={{ scale: 0, x: "50%", y: "50%" }}
                  animate={{ 
                    scale: [0, 1.2, 0], 
                    x: `${Math.random() * 100}%`, 
                    y: `${Math.random() * 100}%`,
                    rotate: Math.random() * 360
                  }}
                  transition={{ 
                    duration: 2 + Math.random() * 2, 
                    repeat: Infinity,
                    ease: 'easeOut' 
                  }}
                  className="absolute"
                >
                  <Sparkles className="text-yellow-400 opacity-40" size={Math.random() * 40 + 20} />
                </motion.div>
              ))}
            </div>

          <motion.div
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.5, y: 50, opacity: 0 }}
            className="bg-zinc-900 border-2 border-white/10 p-10 sm:p-14 rounded-[3rem] text-center shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col items-center gap-6 sm:gap-8 max-w-lg w-full relative overflow-hidden"
          >
             {/* Inner glow */}
             <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-500/10 blur-[80px] rounded-full" />
             <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full" />

            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-40px] border-2 border-dashed border-white/10 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative z-10"
              >
                {icon}
              </motion.div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-5xl sm:text-7xl font-black text-white font-comic mb-2 sm:mb-4 tracking-tighter uppercase italic drop-shadow-xl">
                {title}
              </h3>
              {message && (
                <p className="text-xl sm:text-2xl text-zinc-400 font-comic leading-tight">
                  {message}
                </p>
              )}
              {points !== undefined && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl sm:text-3xl font-black text-indigo-400 mt-2"
                >
                  +{points} PUNTOS
                </motion.p>
              )}
            </div>

            <div className="flex gap-3 relative z-10">
               {[1, 2, 3].map(i => (
                  <motion.div 
                    key={`success-star-${i}`}
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: i * 0.2 }}
                    className="text-yellow-400"
                  >
                    <Star size={32} fill="currentColor" />
                  </motion.div>
                ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAction}
              className="group relative flex items-center justify-center gap-3 w-full px-8 py-5 bg-white text-zinc-950 font-black text-xl sm:text-2xl rounded-2xl sm:rounded-3xl shadow-xl transition-all z-10"
            >
              <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-500" /> 
              {actionLabel}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
