import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Mail, Lock, User, AlertCircle } from 'lucide-react';
import logoUrl from '../assets/images/pumtap_logo_1779570363768.png';

interface AuthProps {
  onSuccess: (userProfile: any) => void;
}

export default function Auth({ onSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (isForgot) {
      try {
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Ocurrió un error al procesar la solicitud');
        }

        setSuccessMessage(data.message || 'Se ha enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada o spam.');
      } catch (err: any) {
        setError(err.message || 'Ocurrió un error de conexión');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('¡Las contraseñas no coinciden! Por favor, verifica que sean idénticas.');
      setLoading(false);
      return;
    }

    if (!isLogin && password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email, password } 
        : { email, password, name };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error al procesar la solicitud');
      }

      // Save user session in localStorage to auto-restore on reload
      localStorage.setItem('magic_play_user_profile', JSON.stringify(data));
      onSuccess(data);
    } catch (err: any) {
      let msg = err.message || 'Ocurrió un error de conexión';
      if (msg.includes('auth/operation-not-allowed')) {
        msg = '⚠️ El método de inicio de sesión con Correo/Contraseña está desactivado en Firebase. Debes ir a tu Consola de Firebase -> Authentication -> Sign-in-method y habilitar "Correo electrónico/contraseña".';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center p-6 font-sans overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-8 my-8"
      >
        <div className="flex flex-col items-center relative w-full pt-4 select-none">
          {/* Estrellitas de colores de fondo */}
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            <motion.div
              animate={{ y: [-4, 4, -4], rotate: [0, 10, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.1 }}
              className="absolute top-0 left-6 text-yellow-400 opacity-80"
            >
              <Sparkles size={28} />
            </motion.div>
            <motion.div
              animate={{ y: [4, -4, 4], rotate: [0, -15, 0], scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.4 }}
              className="absolute -top-3 right-6 text-pink-400 opacity-80"
            >
              <Sparkles size={24} />
            </motion.div>
            <motion.div
              animate={{ y: [-3, 3, -3], rotate: [0, 15, 0], scale: [0.9, 1.05, 0.9] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.7 }}
              className="absolute bottom-6 left-4 text-cyan-400 opacity-80"
            >
              <Sparkles size={22} />
            </motion.div>
            <motion.div
              animate={{ y: [3, -3, 3], rotate: [0, -12, 0], scale: [0.95, 1.1, 0.95] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.2 }}
              className="absolute bottom-8 right-4 text-orange-400 opacity-80"
            >
              <Sparkles size={26} />
            </motion.div>
            <motion.div
              animate={{ y: [-2, 2, -2], rotate: [0, 8, 0], scale: [0.8, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut", delay: 0.9 }}
              className="absolute -top-6 left-[43%] text-purple-400 opacity-70"
            >
              <Sparkles size={20} />
            </motion.div>
            <motion.div
              animate={{ y: [2, -2, 2], rotate: [0, -8, 0], scale: [0.85, 1.05, 0.85] }}
              transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-12 right-[45%] text-emerald-400 opacity-70"
            >
              <Sparkles size={18} />
            </motion.div>
          </div>

          <img 
            src={logoUrl} 
            alt="PumTap Logo" 
            className="w-56 sm:w-64 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] relative z-10"
            referrerPolicy="no-referrer"
          />
          <p className="text-zinc-400 font-comic mt-2 text-center text-sm relative z-10">
            {isForgot ? 'Recuperar contraseña' : isLogin ? '¡Bienvenido de nuevo!' : 'Crea tu cuenta mágica'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              key="auth-error-msg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 text-red-400 text-sm"
            >
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
          {successMessage && (
            <motion.div 
              key="auth-success-msg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-3 text-emerald-400 text-sm"
            >
              <Sparkles size={18} className="flex-shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {!isForgot && !isLogin && (
            <div className="relative">
              <User size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text" 
                placeholder="¿Cómo te llamas?" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-15 bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 text-lg text-white font-bold focus:border-blue-500 transition-colors outline-none"
              />
            </div>
          )}
          
          <div className="relative">
            <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-15 bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 text-lg text-white font-bold focus:border-blue-500 transition-colors outline-none"
            />
          </div>

          {!isForgot && (
            <div className="relative">
              <Lock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="password" 
                placeholder="Contraseña" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-15 bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 text-lg text-white font-bold focus:border-blue-500 transition-colors outline-none"
              />
            </div>
          )}

          {isLogin && !isForgot && (
            <div className="flex justify-end -mt-1 px-1">
              <button 
                type="button"
                onClick={() => {
                  setIsForgot(true);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-xs font-bold text-zinc-500 hover:text-white transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {!isForgot && !isLogin && (
            <div className="relative">
              <Lock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="password" 
                placeholder="Repetir contraseña" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full h-15 bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 text-lg text-white font-bold focus:border-blue-500 transition-colors outline-none"
              />
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-white text-zinc-950 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:scale-100 animate-none"
          >
            {loading ? 'CARGANDO...' : isForgot ? 'ENVIAR ENLACE' : isLogin ? 'ENTRAR' : 'CREAR CUENTA'}
            {!loading && <ArrowRight />}
          </button>
        </form>

        <div className="text-center">
          {isForgot ? (
            <button 
              onClick={() => {
                setIsForgot(false);
                setError(null);
                setSuccessMessage(null);
              }}
              className="text-zinc-500 font-bold hover:text-white transition-colors"
            >
              Volver al inicio de sesión
            </button>
          ) : (
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setConfirmPassword('');
                setPassword('');
                setSuccessMessage(null);
              }}
              className="text-zinc-500 font-bold hover:text-white transition-colors"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entra aquí'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
