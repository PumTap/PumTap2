import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Brush, 
  Hand, 
  Sparkles, 
  Search, 
  Target, 
  Smile, 
  Music, 
  Palette, 
  Maximize, 
  Minimize,
  Trophy,
  Coins,
  Lock,
  Unlock,
  ArrowRight,
  LogOut,
  CreditCard,
  LayoutGrid,
  Camera,
  Volume2,
  Hash,
  Zap,
  Clock,
  Loader2,
  Star,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MagicBoard from './components/MagicBoard';
import MathHands from './components/MathHands';
import MemoryGame from './components/MemoryGame';
import BalloonPop from './components/BalloonPop';
import FaceMaker from './components/FaceMaker';
import PianoGame from './components/PianoGame';
import ColoringGame from './components/ColoringGame';
import ShapeMatch from './components/ShapeMatch';
import ConnectNumbers from './components/ConnectNumbers';
import PopItGame from './components/PopItGame';
import ShapeDrawing from './components/ShapeDrawing';
import ClockGame from './components/ClockGame';
import Auth from './components/Auth';
import Tutorial from './components/Tutorial';
import logoUrl from './assets/images/pumtap_logo_1779570363768.png';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  points: number;
  hasSeenTutorial: boolean;
  isPremium: boolean;
  pointsLimit?: number;
}

const GAMES = [
  { id: 'magicboard', icon: Brush, label: 'Punta', color: 'from-blue-500 to-cyan-500' },
  { id: 'mathhands', icon: Hand, label: 'Mates', color: 'from-orange-500 to-amber-500' },
  { id: 'memory', icon: Search, label: 'Memo', color: 'from-green-500 to-teal-500' },
  { id: 'balloons', icon: Target, label: 'Globos', color: 'from-pink-500 to-rose-500' },
  { id: 'face', icon: Smile, label: 'Caras', color: 'from-yellow-500 to-orange-500' },
  { id: 'piano', icon: Music, label: 'Piano', color: 'from-purple-500 to-indigo-500' },
  { id: 'numbers', icon: Hash, label: 'Orden', color: 'from-indigo-500 to-violet-500' },
  { id: 'shapes', icon: LayoutGrid, label: 'Huecos', color: 'from-cyan-500 to-blue-500' },
  { id: 'drawshapes', icon: Brush, label: 'Dibujar', color: 'from-purple-400 to-pink-500' },
  { id: 'coloring', icon: Palette, label: 'Pintar', color: 'from-pink-500/80 to-rose-500/80' },
  { id: 'popit', icon: Zap, label: 'Pop It', color: 'from-blue-400 to-indigo-600' },
  { id: 'clock', icon: Clock, label: 'Reloj', color: 'from-emerald-500 to-green-600' },
];

export default function App() {
  const [activeGame, setActiveGame] = useState<'home' | 'magicboard' | 'mathhands' | 'memory' | 'balloons' | 'face' | 'piano' | 'coloring' | 'shapes' | 'numbers' | 'popit' | 'drawshapes' | 'clock'>('home');
  const [isKidsMode, setIsKidsMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [stripeVerifying, setStripeVerifying] = useState(false);
  const [stripeMessage, setStripeMessage] = useState<string | null>(null);
  const [stripeWarning, setStripeWarning] = useState<{ type: 'premium' | 'extension'; message: string } | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [checkoutType, setCheckoutType] = useState<'premium' | 'extension' | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Restore session on render and sync in background
  useEffect(() => {
    const saved = localStorage.getItem('magic_play_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserProfile(parsed);
        // Background refresh to keep points, premium status, tutorial etc in sync
        fetch(`/api/user/profile/${parsed.uid}`)
          .then(res => res.json())
          .then(data => {
            if (data && !data.error) {
              const updated = { uid: parsed.uid, ...data };
              setUserProfile(updated);
              localStorage.setItem('magic_play_user_profile', JSON.stringify(updated));
            }
          })
          .catch(err => console.error("Error background syncing profile:", err));
      } catch (e) {
        console.error("Error reading saved profile:", e);
      }
    }
    setAuthLoading(false);
  }, []);

  // Stripe checkout callback handler
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (sessionId) {
      setStripeVerifying(true);
      setStripeMessage("Verificando tu pago seguro de Stripe...");

      const checkPayment = async () => {
        const saved = localStorage.getItem('magic_play_user_profile');
        if (!saved) {
          setStripeMessage("No se encontró una sesión activa de usuario.");
          setTimeout(() => {
            setStripeMessage(null);
            setStripeVerifying(false);
            window.history.replaceState({}, document.title, "/");
          }, 3000);
          return;
        }

        try {
          const parsed = JSON.parse(saved);
          const res = await fetch('/api/stripe/verify-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId })
          });
          const data = await res.json();
          if (data.success && data.profile) {
            const updatedProfile = { uid: parsed.uid, ...data.profile };
            setUserProfile(updatedProfile);
            localStorage.setItem('magic_play_user_profile', JSON.stringify(updatedProfile));
            setStripeMessage("¡Pago verificado con éxito! Membresía activada. 🎉");
          } else {
            setStripeMessage(`Fallo en la verificación: ${data.error || "No completado"}`);
          }
        } catch (err) {
          console.error("Stripe verification error:", err);
          setStripeMessage("Error de conexión al validar el pago de Stripe.");
        } finally {
          setTimeout(() => {
            setStripeMessage(null);
            setStripeVerifying(false);
            window.history.replaceState({}, document.title, "/");
          }, 3500);
        }
      };

      checkPayment();
    }
  }, []);

  // Poll for checkout completion in background (when original tab is waiting)
  useEffect(() => {
    if (!checkoutUrl || !userProfile) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/user/profile/${userProfile.uid}`);
        if (!res.ok) return;
        const data = await res.json();
        
        if (data && !data.error) {
          const isPremiumUpdated = data.isPremium && !userProfile.isPremium;
          const isLimitUpdated = typeof data.pointsLimit === 'number' && 
            typeof userProfile.pointsLimit === 'number' && 
            data.pointsLimit > userProfile.pointsLimit;

          if (isPremiumUpdated || isLimitUpdated) {
            const updated = { uid: userProfile.uid, ...data };
            setUserProfile(updated);
            localStorage.setItem('magic_play_user_profile', JSON.stringify(updated));
            setCheckoutUrl(null);
            setCheckoutType(null);
            setStripeMessage(
              isPremiumUpdated 
                ? "¡Membresía Premium activada automáticamente! 🎉" 
                : "¡Límite ampliado automáticamente con éxito! ⚡"
            );
            setStripeVerifying(true);
            setTimeout(() => {
              setStripeMessage(null);
              setStripeVerifying(false);
            }, 3000);
          }
        }
      } catch (err) {
        console.error("Error background polling for checkout verification:", err);
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [checkoutUrl, userProfile]);

  const toggleLock = () => {
    if (!containerRef.current) return;
    const newLockState = !isLocked;
    setIsLocked(newLockState);

    if (newLockState) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(err => {
          console.error(`Error: ${err.message}`);
        });
        setIsFullscreen(true);
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
          console.error(`Error: ${err.message}`);
        });
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      const fsActive = !!document.fullscreenElement;
      setIsFullscreen(fsActive);
      if (!fsActive) {
        setIsLocked(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleCompleteChallenge = useCallback(async (amount: number = 25) => {
    if (isKidsMode) return;
    if (!userProfile) return;
    const newPoints = (userProfile.points || 0) + amount;
    
    // Optimistic UI updates for stellar gameplay fluid response
    setUserProfile(prev => prev ? { ...prev, points: newPoints } : null);

    try {
      const response = await fetch('/api/user/update-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: userProfile.uid, points: newPoints })
      });
      const data = await response.json();
      if (data.success) {
        const updated = { ...userProfile, points: newPoints };
        localStorage.setItem('magic_play_user_profile', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error updating points:', error);
    }
  }, [userProfile]);

  const handleLogout = async () => {
    localStorage.removeItem('magic_play_user_profile');
    setUserProfile(null);
    setActiveGame('home');
  };

  const handleBuyPremium = async () => {
    if (!userProfile) return;
    
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: userProfile.uid, type: 'premium' })
      });
      const data = await response.json();
      
      if (data.success && data.url) {
        // Safe payment handling avoiding iframe blank screen blocker
        setCheckoutUrl(data.url);
        setCheckoutType('premium');
        try {
          window.open(data.url, '_blank');
        } catch (e) {
          console.log("Popup blocked, fallback Modal will serve the user", e);
        }
      } else if (data.error === 'stripe_not_configured') {
        // Fallback simulation mode since key isn't in AI Studio secrets yet!
        setUserProfile(prev => prev ? { ...prev, isPremium: true } : null);
        const updated = { ...userProfile, isPremium: true };
        localStorage.setItem('magic_play_user_profile', JSON.stringify(updated));

        // Display beautiful helpful dialog explanation
        setStripeWarning({
          type: 'premium',
          message: data.message || 'Se ha activado el simulador gratuito temporalmente.'
        });

        // Sync with base database too bypass
        await fetch('/api/user/buy-premium', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: userProfile.uid })
        });
      } else {
        alert(data.error || 'Ocurrió un error al contactar con Stripe.');
      }
    } catch (error) {
      console.error('Error buying premium:', error);
    }
  };

  const handleTutorialComplete = async () => {
    if (!userProfile) return;
    
    setUserProfile(prev => prev ? { ...prev, hasSeenTutorial: true } : null);

    try {
      const response = await fetch('/api/user/seen-tutorial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: userProfile.uid })
      });
      const data = await response.json();
      if (data.success) {
        const updated = { ...userProfile, hasSeenTutorial: true };
        localStorage.setItem('magic_play_user_profile', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error completing tutorial:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center p-6 select-none">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: [0.95, 1.05, 1], opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex flex-col items-center gap-6 relative"
        >
          {/* Estrellitas de colores de fondo */}
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            <motion.div
              animate={{ y: [-6, 6, -6], rotate: [0, 15, 0], scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut", delay: 0.1 }}
              className="absolute -top-4 -left-8 text-yellow-400 opacity-90"
            >
              <Sparkles size={32} />
            </motion.div>
            <motion.div
              animate={{ y: [6, -6, 6], rotate: [0, -20, 0], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut", delay: 0.3 }}
              className="absolute -top-6 -right-8 text-pink-400 opacity-90"
            >
              <Sparkles size={28} />
            </motion.div>
            <motion.div
              animate={{ y: [-5, 5, -5], rotate: [0, 18, 0], scale: [0.9, 1.1, 0.9] }}
              transition={{ repeat: Infinity, duration: 3.6, ease: "easeInOut", delay: 0.6 }}
              className="absolute bottom-4 -left-12 text-cyan-400 opacity-90"
            >
              <Sparkles size={26} />
            </motion.div>
            <motion.div
              animate={{ y: [5, -5, 5], rotate: [0, -15, 0], scale: [0.95, 1.15, 0.95] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.2 }}
              className="absolute bottom-6 -right-12 text-orange-400 opacity-90"
            >
              <Sparkles size={30} />
            </motion.div>
            <motion.div
              animate={{ y: [-3, 3, -3], rotate: [0, 10, 0], scale: [0.8, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.8 }}
              className="absolute -top-12 left-[44%] text-purple-400 opacity-80"
            >
              <Sparkles size={24} />
            </motion.div>
          </div>

          <img 
            src={logoUrl} 
            alt="PumTap Logo" 
            className="w-64 sm:w-80 md:w-96 object-contain animate-pulse relative z-10"
            referrerPolicy="no-referrer"
          />
          <Loader2 className="text-cyan-400 animate-spin relative z-10" size={32} />
        </motion.div>
      </div>
    );
  }

  if (!userProfile) {
    return <Auth onSuccess={(profile) => setUserProfile(profile)} />;
  }

  if (!userProfile.hasSeenTutorial) {
    return <Tutorial onComplete={handleTutorialComplete} />;
  }

  const pointsLimit = userProfile.pointsLimit ?? 2000;
  const isBlocked = userProfile.points >= pointsLimit && !userProfile.isPremium;

  const handleBuyLimitExtension = async () => {
    if (!userProfile) return;
    const currentLimit = userProfile.pointsLimit ?? 2000;
    const newLimit = currentLimit + 2000;

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: userProfile.uid, type: 'extension' })
      });
      const data = await response.json();

      if (data.success && data.url) {
        // Safe payment handling avoiding iframe blank screen blocker
        setCheckoutUrl(data.url);
        setCheckoutType('extension');
        try {
          window.open(data.url, '_blank');
        } catch (e) {
          console.log("Popup blocked, fallback Modal will serve the user", e);
        }
      } else if (data.error === 'stripe_not_configured') {
        // Fallback simulation mode since key isn't in AI Studio secrets yet!
        setUserProfile(prev => prev ? { ...prev, pointsLimit: newLimit } : null);
        const updated = { ...userProfile, pointsLimit: newLimit };
        localStorage.setItem('magic_play_user_profile', JSON.stringify(updated));

        // Display beautiful helpful dialog explanation
        setStripeWarning({
          type: 'extension',
          message: data.message || 'Se ha activado el simulador gratuito temporalmente.'
        });

        // Sync with base database too bypass
        await fetch('/api/user/buy-limit-extension', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: userProfile.uid })
        });
      } else {
        alert(data.error || 'Ocurrió un error al contactar con Stripe.');
      }
    } catch (error) {
      console.error('Error buying points limit extension:', error);
    }
  };

  if (isBlocked) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center p-4 sm:p-6 font-sans overflow-y-auto">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-2xl bg-zinc-900 border-2 border-yellow-500/30 p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl flex flex-col items-center text-center gap-6 sm:gap-8"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center border-2 border-yellow-500/50">
            <Lock size={48} className="sm:w-14 sm:h-14" />
          </div>
          
          <div>
            <h2 className="text-3xl sm:text-5xl font-black text-white font-comic mb-2 sm:mb-4 tracking-tight uppercase">¡Wow, {userProfile.name}!</h2>
            <p className="text-lg sm:text-2xl text-zinc-400 font-comic">
              Has alcanzado tu límite actual de <span className="text-yellow-500 font-black">{pointsLimit.toLocaleString()} puntos</span>.
              ¡Eres increíble jugando!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {/* Option 1: Limit Extension */}
            <div className="bg-zinc-850 border border-zinc-800 p-5 rounded-3xl flex flex-col justify-between items-center text-center gap-4 hover:border-zinc-700 transition-all">
              <div>
                <span className="bg-zinc-800 text-zinc-400 text-xs px-3 py-1 rounded-full uppercase font-black tracking-widest leading-none">Ampliación</span>
                <h3 className="text-xl font-bold text-white mt-2">Más margen</h3>
                <p className="text-zinc-400 text-xs sm:text-sm mt-1 leading-relaxed">
                  Añade +2.000 puntos para seguir acumulando ranking y récords. Nuevo límite: <strong>{(pointsLimit + 2000).toLocaleString()} pts</strong>.
                </p>
              </div>
              <div className="w-full mt-2">
                <span className="text-white font-black text-3xl font-comic block mb-3">1,00€</span>
                <button 
                  onClick={handleBuyLimitExtension}
                  className="w-full py-3 bg-zinc-800 text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 hover:bg-zinc-700 active:scale-95 transition-all shadow-md"
                >
                  <CreditCard size={18} /> PAGAR 1€
                </button>
              </div>
            </div>

            {/* Option 2: Infinite Points */}
            <div className="bg-zinc-850 border-2 border-yellow-500/20 p-5 rounded-3xl flex flex-col justify-between items-center text-center gap-4 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl group-hover:bg-yellow-500/20 transition-all pointer-events-none" />
              <div>
                <span className="bg-yellow-500/20 text-yellow-500 text-xs px-3 py-1 rounded-full uppercase font-black tracking-widest leading-none">Mejor Oferta ✨</span>
                <h3 className="text-xl font-bold text-white mt-2">Puntos Infinitos</h3>
                <p className="text-zinc-400 text-xs sm:text-sm mt-1 leading-relaxed">
                  Desbloquea diversión ilimitada para siempre. Olvídate de límites y juega todo lo que quieras.
                </p>
              </div>
              <div className="w-full mt-2">
                <span className="text-yellow-400 font-black text-3xl font-comic block mb-3">2,99€</span>
                <button 
                  onClick={handleBuyPremium}
                  className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-zinc-950 rounded-2xl font-black text-base flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-yellow-500/10"
                >
                  <Sparkles size={18} /> PAGAR 2,99€
                </button>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="text-zinc-500 font-bold hover:text-white transition-colors text-sm sm:text-base mt-2"
          >
            Salir de la cuenta
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 bg-zinc-950 flex flex-col select-none touch-none overflow-hidden font-sans">
      {/* SUPERIOR BAR - GAME LAUNCHER */}
      <header className="h-12 sm:h-14 bg-zinc-900/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-2 sm:px-4 z-50 relative">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => !isLocked && setActiveGame('home')}
            disabled={isLocked}
            className={`p-1 sm:p-1.5 rounded-lg shadow-lg border border-white/5 transition-all ${
              isLocked 
                ? 'opacity-30 cursor-not-allowed bg-zinc-900/50 text-zinc-650' 
                : 'bg-zinc-800/50 hover:scale-110 active:scale-95 text-white'
            }`}
          >
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400 animate-pulse" />
          </button>
          
          <div className="hidden xl:flex flex-col ml-2">
            <span className="text-zinc-500 text-[7px] uppercase font-black tracking-widest leading-none mb-0.5">Jugador</span>
            <span className="text-white font-black text-[10px]">{userProfile.name}</span>
          </div>
        </div>

        {/* Game Launcher Icons */}
        <nav className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 overflow-x-auto px-2 scrollbar-hide">
          {GAMES.map((game) => {
            const isCurrent = activeGame === game.id;
            return (
              <button 
                key={game.id}
                onClick={() => !isLocked && setActiveGame(game.id as any)}
                disabled={isLocked}
                className={`flex-shrink-0 flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-all active:scale-95 ${
                  isCurrent 
                    ? `bg-white/5 text-white ring-1 ring-white/10` 
                    : 'text-zinc-500'
                } ${
                  isLocked 
                    ? 'opacity-30 cursor-not-allowed' 
                    : 'hover:bg-white/5'
                }`}
              >
                <div className={`p-1 rounded-md ${isCurrent ? `bg-gradient-to-br ${game.color} shadow-lg shadow-${game.id === 'magicboard' ? 'blue' : 'pink'}-500/20` : 'bg-white/5'}`}>
                  <game.icon size={14} className="sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="font-bold text-[10px] sm:text-xs hidden lg:block uppercase tracking-wider">{game.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3 ml-2">
          <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg border border-white/5">
            <Coins className="text-yellow-500 w-3.5 h-3.5" />
            <span className="text-white font-black text-xs">{userProfile.points}</span>
          </div>

          <button 
            onClick={toggleLock}
            className={`p-1.5 sm:p-2 rounded-lg flex items-center justify-center border transition-all ${
              isLocked 
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30 shadow-lg shadow-amber-500/10' 
                : 'bg-zinc-800/30 hover:bg-zinc-700/50 text-zinc-400 border-transparent hover:text-white'
            }`}
            title={isLocked ? "Desbloquear juego" : "Bloquear juego (Modo completo)"}
          >
            {isLocked ? <Lock size={16} className="text-amber-400 animate-pulse" /> : <Unlock size={16} />}
          </button>
        </div>
      </header>

      {/* VIEWPORT CONTENIDO */}
      <main className="flex-1 relative bg-zinc-950 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeGame === 'magicboard' && (
            <motion.div
              key="magicboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="absolute inset-0"
            >
              <MagicBoard />
            </motion.div>
          )}

          {activeGame === 'mathhands' && (
            <motion.div
              key="mathhands"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="absolute inset-0"
            >
              <MathHands onComplete={handleCompleteChallenge} isKidsMode={isKidsMode} />
            </motion.div>
          )}

          {activeGame === 'memory' && (
            <motion.div
              key="memory"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="absolute inset-0"
            >
              <MemoryGame onComplete={handleCompleteChallenge} isKidsMode={isKidsMode} />
            </motion.div>
          )}

          {activeGame === 'balloons' && (
            <motion.div
              key="balloons"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute inset-0"
            >
              <BalloonPop onComplete={handleCompleteChallenge} isKidsMode={isKidsMode} />
            </motion.div>
          )}

          {activeGame === 'face' && (
            <motion.div
              key="face"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="absolute inset-0"
            >
              <FaceMaker onComplete={handleCompleteChallenge} />
            </motion.div>
          )}

          {activeGame === 'piano' && (
            <motion.div
              key="piano"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0"
            >
              <PianoGame onComplete={handleCompleteChallenge} isKidsMode={isKidsMode} />
            </motion.div>
          )}

          {activeGame === 'coloring' && (
            <motion.div
              key="coloring"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <ColoringGame onComplete={handleCompleteChallenge} isKidsMode={isKidsMode} />
            </motion.div>
          )}

          {activeGame === 'shapes' && (
            <motion.div
              key="shapes"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="absolute inset-0"
            >
              <ShapeMatch onComplete={handleCompleteChallenge} isKidsMode={isKidsMode} />
            </motion.div>
          )}

          {activeGame === 'numbers' && (
            <motion.div
              key="numbers"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="absolute inset-0"
            >
              <ConnectNumbers onComplete={handleCompleteChallenge} isKidsMode={isKidsMode} />
            </motion.div>
          )}

          {activeGame === 'drawshapes' && (
            <motion.div
              key="drawshapes"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="absolute inset-0"
            >
              <ShapeDrawing onComplete={handleCompleteChallenge} />
            </motion.div>
          )}

          {activeGame === 'popit' && (
            <motion.div
              key="popit"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="absolute inset-0"
            >
              <PopItGame onComplete={handleCompleteChallenge} isKidsMode={isKidsMode} />
            </motion.div>
          )}

          {activeGame === 'clock' && (
            <motion.div
              key="clock"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0"
            >
              <ClockGame onComplete={handleCompleteChallenge} isKidsMode={isKidsMode} />
            </motion.div>
          )}

          {activeGame === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-8 landscape:py-2 landscape:px-4 text-center overflow-y-auto"
            >
              <div className="max-w-3xl flex flex-col items-center gap-4 sm:gap-6 landscape:gap-1.5">
                <motion.div 
                  initial={{ scale: 0.85, y: -15 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 120, damping: 15 }}
                  className="relative select-none w-full flex justify-center py-6"
                >
                  {/* Estrellitas de colores de fondo */}
                  <div className="absolute inset-0 pointer-events-none overflow-visible max-w-sm sm:max-w-md md:max-w-xl mx-auto">
                    <motion.div
                      animate={{ y: [-8, 8, -8], rotate: [0, 20, 0], scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.1 }}
                      className="absolute top-0 left-4 text-yellow-400 opacity-95"
                    >
                      <Sparkles className="w-10 h-10 sm:w-12 sm:h-12" />
                    </motion.div>
                    <motion.div
                      animate={{ y: [8, -8, 8], rotate: [0, -25, 0], scale: [1, 1.25, 1] }}
                      transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.3 }}
                      className="absolute -top-4 right-4 text-pink-400 opacity-95"
                    >
                      <Sparkles className="w-8 h-8 sm:w-10 sm:h-10" />
                    </motion.div>
                    <motion.div
                      animate={{ y: [-6, 6, -6], rotate: [0, 15, 0], scale: [0.9, 1.15, 0.9] }}
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.6 }}
                      className="absolute bottom-6 left-2 sm:left-4 text-cyan-400 opacity-95"
                    >
                      <Sparkles className="w-7 h-7 sm:w-9 sm:h-9" />
                    </motion.div>
                    <motion.div
                      animate={{ y: [6, -6, 6], rotate: [0, -15, 0], scale: [0.95, 1.2, 0.95] }}
                      transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.2 }}
                      className="absolute bottom-6 right-2 sm:right-4 text-orange-400 opacity-95"
                    >
                      <Sparkles className="w-9 h-9 sm:w-11 sm:h-11" />
                    </motion.div>
                    <motion.div
                      animate={{ y: [-4, 4, -4], rotate: [0, 10, 0], scale: [0.8, 1.05, 0.8] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.8 }}
                      className="absolute -top-10 left-[45%] text-purple-400 opacity-80"
                    >
                      <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
                    </motion.div>
                    <motion.div
                      animate={{ y: [4, -4, 4], rotate: [0, -10, 0], scale: [0.85, 1.1, 0.85] }}
                      transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut", delay: 0.5 }}
                      className="absolute -bottom-8 left-[35%] text-emerald-400 opacity-80"
                    >
                      <Sparkles className="w-5 h-5 sm:w-7 sm:h-7" />
                    </motion.div>
                    <motion.div
                      animate={{ y: [-5, 5, -5], rotate: [0, 12, 0], scale: [0.8, 1, 0.8] }}
                      transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut", delay: 1.1 }}
                      className="absolute -bottom-6 right-[35%] text-amber-400 opacity-80"
                    >
                      <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
                    </motion.div>
                  </div>

                  <img 
                    src={logoUrl} 
                    alt="PumTap Logo" 
                    className="w-64 sm:w-80 md:w-[420px] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] relative z-10"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
                
                <div>
                  <h1 className="text-3xl sm:text-6xl md:text-8xl font-black text-white font-comic tracking-tight uppercase mb-2 landscape:mb-0 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] leading-tight px-2">
                    ¡HOLA <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">{(userProfile?.name || '').toUpperCase()}</span>!
                  </h1>
                  <p className="text-sm sm:text-xl md:text-2xl text-zinc-400 font-comic max-w-2xl mx-auto mb-4">
                    ¡Tienes <span className="text-yellow-500 font-black">{userProfile?.points}</span> puntos! Completa retos para ganar más y desbloquear sorpresas.
                  </p>

                  {/* Kids Mode Selector */}
                  <div className="flex justify-center mb-6">
                    {userProfile?.isPremium ? (
                      <div className="bg-zinc-900/80 backdrop-blur-md p-4 rounded-[2rem] border border-white/10 flex items-center justify-between gap-6 max-w-sm w-full shadow-lg">
                        <div className="flex items-center gap-3 text-left">
                          <div className="p-2.5 bg-pink-500/20 text-pink-400 rounded-2xl">
                            <Sparkles size={24} className="text-yellow-400 fill-yellow-400 animate-pulse" />
                          </div>
                          <div>
                            <h4 className="text-white font-black text-sm landscape:text-xs tracking-tight uppercase font-comic">MODO INFANTIL 👶🌟</h4>
                            <p className="text-zinc-400 text-[10px] sm:text-[11px]">Juega sin parar, ¡sin fin de juego!</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsKidsMode(!isKidsMode)}
                          className={`relative w-14 h-8 rounded-full p-1 transition-colors duration-300 ${isKidsMode ? 'bg-gradient-to-r from-pink-500 to-cyan-500' : 'bg-zinc-700'}`}
                        >
                          <motion.div
                            layout
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="w-6 h-6 bg-white rounded-full shadow-md"
                            style={{ float: isKidsMode ? 'right' : 'left' }}
                          />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => setShowPremiumModal(true)}
                        className="cursor-pointer bg-zinc-900/40 hover:bg-zinc-900/60 backdrop-blur-md p-4 rounded-[2rem] border-2 border-dashed border-zinc-800 flex items-center justify-between gap-6 max-w-sm w-full shadow-lg transition-all hover:scale-[1.02]"
                      >
                        <div className="flex items-center gap-3 text-left">
                          <div className="p-2.5 bg-zinc-800 text-zinc-500 rounded-2xl flex items-center justify-center">
                            <Lock size={18} className="text-yellow-500/80" />
                          </div>
                          <div>
                            <h4 className="text-zinc-400 font-bold text-sm tracking-tight uppercase font-comic flex items-center gap-1.5">
                              MODO INFANTIL <span className="text-[9px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded-md font-black">PREMIUM</span>
                            </h4>
                            <p className="text-zinc-500 text-[10px] sm:text-[11px]">Diversión infinita libre de pausas</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-xl">🔒 Desbloquear</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-4 mt-2 landscape:mt-1 items-center">
                  <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
                    <button 
                      onClick={() => {
                        const firstGame = GAMES[0];
                        setActiveGame((firstGame?.id as any) || 'magicboard');
                      }}
                      className="group bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 sm:px-8 sm:py-4 rounded-2xl sm:rounded-3xl font-black text-lg sm:text-2xl flex items-center gap-3 transition-all hover:scale-105 shadow-xl"
                    >
                      ¡JUGAR! <ArrowRight className="group-hover:translate-x-2 transition-transform w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    {isBlocked && (
                      <button 
                        onClick={handleBuyPremium}
                        className="bg-yellow-500 text-zinc-950 px-6 py-2.5 sm:px-8 sm:py-4 rounded-2xl sm:rounded-3xl font-black text-lg sm:text-2xl flex items-center gap-3 transition-all hover:scale-105 shadow-xl"
                      >
                        PREMIUM <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    )}
                  </div>

                  {!isLocked && (
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-zinc-500 hover:text-red-400 font-bold transition-all px-4 py-2 mt-2 rounded-xl hover:bg-white/5 active:scale-95"
                    >
                      <LogOut size={16} />
                      <span>Salir de la cuenta</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Stripe Verification Overlay */}
      {stripeVerifying && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4 z-[9999] text-center font-sans">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-white/10 p-6 sm:p-10 rounded-3xl max-w-md shadow-2xl flex flex-col items-center gap-4"
          >
            <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
            <p className="text-xl sm:text-2xl font-comic font-black text-white">{stripeMessage}</p>
          </motion.div>
        </div>
      )}

      {/* Stripe Config Warning / Simulator Activated Modal */}
      {stripeWarning && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4 z-[9999] text-center font-sans">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-zinc-900 border border-yellow-500/30 p-6 sm:p-8 rounded-[2rem] max-w-lg shadow-2xl flex flex-col items-center gap-6"
          >
            <div className="w-16 h-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center border border-yellow-500/40">
              <Sparkles size={32} />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white font-comic tracking-tight mb-2">¡Suscripción Simulada con Éxito! 🎉</h3>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-4">
                Has obtenido acceso premium temporal gracias al <strong className="text-yellow-400">simulador de desarrollo</strong>. ¡Sigue probando!
              </p>
              <div className="bg-zinc-800/80 border border-white/5 p-4 rounded-2xl text-left text-xs sm:text-sm text-zinc-400 leading-relaxed font-mono">
                <span className="text-yellow-500 font-bold block mb-1">💡 Para conectar tu cuenta real de Stripe:</span>
                1. Registra tu <strong className="text-white">STRIPE_SECRET_KEY</strong> en el panel de Secrets de AI Studio.<br/>
                2. El servidor detectará tu clave y abrirá automáticamente las pasarelas reales y seguras de Stripe Checkout en tus pruebas.
              </div>
            </div>

            <button
              onClick={() => setStripeWarning(null)}
              className="px-8 py-3 bg-yellow-500 text-zinc-950 font-black text-base rounded-2xl active:scale-95 transition-all w-full shadow-lg shadow-yellow-500/10 hover:bg-yellow-400"
            >
              ¡ENTENDIDO, GRACIAS!
            </button>
          </motion.div>
        </div>
      )}

      {/* Stripe Checkout New Window/Tab Modal */}
      {checkoutUrl && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 z-[9999] text-center font-sans animate-fade-in">
          <motion.div 
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            className="bg-zinc-900 border border-emerald-500/20 p-6 sm:p-10 rounded-[2.5rem] max-w-lg shadow-2xl flex flex-col items-center gap-6"
          >
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/5">
              <CreditCard size={38} className="animate-pulse text-emerald-400" />
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl sm:text-3xl font-black text-white font-comic tracking-tight">
                {checkoutType === 'premium' ? '¡Desbloquea Premium Infinito! 🌟' : '¡Suma +2,000 Puntos Extra! ⚡'}
              </h3>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                Para tu máxima seguridad, procesamos los pagos a través de la pasarela oficial y encriptada de <strong className="text-white">Stripe</strong>.
              </p>
              <div className="bg-zinc-800/60 border border-white/5 p-4 rounded-2xl text-center text-xs sm:text-sm text-zinc-400 leading-relaxed font-comic">
                <span className="text-emerald-400 font-bold block mb-1">📢 Aviso de Navegador / Iframe:</span>
                Las pasarelas bancarias protegidas se abren en una pestaña nueva separada de este entorno de pruebas.
              </div>
            </div>

            <div className="w-full flex flex-col gap-3">
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-black text-lg rounded-2xl flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-teal-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Sparkles size={20} /> IR A PAGAR CON STRIPE
              </a>

              <div className="flex items-center justify-center gap-2.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 py-3 px-4 rounded-xl text-sm font-comic">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-duration-1000"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>Detectando tu pago automáticamente... No cierres esta ventana</span>
              </div>

              <button
                onClick={() => {
                  setCheckoutUrl(null);
                  setCheckoutType(null);
                }}
                className="w-full py-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-500 hover:text-white font-bold text-xs rounded-lg transition-all"
              >
                Volver a la aplicación
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Premium Explanation & Purchase Dialog Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 z-[9999] text-center font-sans">
          <motion.div 
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            className="w-full max-w-lg bg-zinc-900 border-2 border-yellow-500/20 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-6 text-center relative overflow-hidden text-white"
          >
            {/* Background glowing effects */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <button 
              onClick={() => setShowPremiumModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all"
            >
              <X size={18} />
            </button>

            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 text-zinc-950 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/10">
              <Sparkles size={32} />
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-comic tracking-tight uppercase">
                ¡PumTap Premium! 👶🌟
              </h3>
              <p className="text-zinc-400 text-sm sm:text-base mt-2 font-comic max-w-md mx-auto leading-relaxed">
                Desbloquea la experiencia completa y dale a los más pequeños un entorno seguro, divertido y libre de interrupciones.
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full text-left mt-2">
              {/* Option 1: Premium Infinitos */}
              <div className="bg-zinc-850 border border-yellow-500/30 p-4 sm:p-5 rounded-2xl shadow-xl">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <span className="bg-yellow-500/20 text-yellow-500 text-[10px] sm:text-xs px-2.5 py-1 rounded-md uppercase font-black tracking-wider leading-none">PAGO ÚNICO • PARA SIEMPRE ⭐</span>
                    <h4 className="text-base sm:text-lg font-black text-white mt-1.5 font-comic">Pumtap Premium - Puntos Infinitos</h4>
                    <p className="text-zinc-400 text-xs sm:text-sm mt-1 leading-relaxed">
                      Desbloquea el **Modo Infantil** permanentemente para jugar sin esperas, sin límites diarios y con diversión libre de pausas.
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-yellow-400 font-comic font-black text-xl sm:text-2xl">2,99€</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPremiumModal(false);
                    handleBuyPremium();
                  }}
                  className="w-full mt-3 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-zinc-950 rounded-xl font-black text-sm uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md font-comic cursor-pointer"
                >
                  <Sparkles size={16} /> Obtener Acceso Infinito
                </button>
              </div>

              {/* Option 2: 2000 points extension */}
              <div className="bg-zinc-850 border border-zinc-800 p-4 sm:p-5 rounded-2xl shadow-md">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <span className="bg-zinc-850 text-zinc-400 text-[10px] sm:text-xs px-2.5 py-1 rounded-md border border-zinc-700 uppercase font-black tracking-wider leading-none">Ampliación de Límite</span>
                    <h4 className="text-base sm:text-lg font-bold text-white mt-1.5 font-comic">Ampliación +2.000 Pts (Pumtap)</h4>
                    <p className="text-zinc-400 text-xs sm:text-sm mt-1 leading-relaxed">
                      Añade 2.000 puntos extras a tu límite para seguir acumulando ranking en los retos interactivos de hoy.
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-zinc-300 font-comic font-semibold text-lg sm:text-xl">1,00€</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPremiumModal(false);
                    handleBuyLimitExtension();
                  }}
                  className="w-full mt-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700/80 rounded-xl font-bold text-sm uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition-all font-comic cursor-pointer"
                >
                  <CreditCard size={16} /> Ampliar +2.000 puntos
                </button>
              </div>
            </div>

            <div className="text-[11px] text-zinc-500 font-comic mt-1 font-semibold">
              Tu compra ayuda a seguir mejorando PumTap. ¡Mil gracias por tu apoyo! ❤️
            </div>
          </motion.div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
