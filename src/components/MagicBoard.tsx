import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Eraser, 
  Trash2,
  Download, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Cloud, 
  Star, 
  Heart, 
  TreePine, 
  Flower, 
  Fish, 
  Car, 
  Smile, 
  Mountain,
  Zap,
  Bug,
  Maximize,
  Minimize,
  Circle,
  Undo2,
  Brush,
  Palette,
  Sparkles,
  Layers,
  Hand,
  Wand2,
  Home as HomeIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function ButterflyIcon({ size = 24, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 4v16" />
      <path d="M12 4c-5 0-8 3-8 8s3 8 8 8" />
      <path d="M12 4c5 0 8 3 8 8s-3 8-8 8" />
      <path d="M12 12c-4-1-6-4-6-7" />
      <path d="M12 12c4-1 6-4 6-7" />
      <path d="M12 12c-4 1-6 4-6 7" />
      <path d="M12 12c4 1 6 4 6 7" />
    </svg>
  );
}

// STAMPS configuration
const STAMPS = [
  { id: 'sun', icon: Sun, label: 'Sol', color: '#fbbf24' },
  { id: 'house', icon: HomeIcon, label: 'Casa', color: '#ff5555' },
  { id: 'mountain', icon: Mountain, label: 'Montaña', color: '#99ff99' },
  { id: 'cloud', icon: Cloud, label: 'Nube', color: '#ffffff' },
  { id: 'tree', icon: TreePine, label: 'Árbol', color: '#44ff44' },
  { id: 'flower', icon: Flower, label: 'Flor', color: '#ff88cc' },
  { id: 'star', icon: Star, label: 'Estrella', color: '#ffff44' },
  { id: 'moon', icon: Moon, label: 'Luna', color: '#ccddee' },
  { id: 'heart', icon: Heart, label: 'Corazón', color: '#ff4444' },
  { id: 'butterfly', icon: ButterflyIcon, label: 'Mariposa', color: '#cc99ff' },
  { id: 'bolt', icon: Zap, label: 'Rayo', color: '#ffff00' },
  { id: 'fish', icon: Fish, label: 'Pez', color: '#55bbff' },
  { id: 'car', icon: Car, label: 'Coche', color: '#ff2222' },
  { id: 'balloon', icon: Circle, label: 'Globo', color: '#aa77ff' },
  { id: 'smiley', icon: Smile, label: 'Sonrisa', color: '#ffcc00' },
];

const COLORS_BASE = [
  { hex: '#ef4444', label: 'Rojo' },
  { hex: '#f97316', label: 'Naranja' },
  { hex: '#facc15', label: 'Amarillo' },
  { hex: '#22c55e', label: 'Verde' },
  { hex: '#3b82f6', label: 'Azul' },
  { hex: '#a855f7', label: 'Morado' },
  { hex: '#f472b6', label: 'Rosa' },
  { hex: '#ffffff', label: 'Blanco' },
  { hex: '#6b7280', label: 'Gris' },
  { hex: '#000000', label: 'Negro' },
];

const SIZES = {
  small: { value: 8, label: 'Pequeño', iconSize: 16 },
  medium: { value: 16, label: 'Mediano', iconSize: 24 },
  large: { value: 32, label: 'Grande', iconSize: 32 },
};

const STAMP_SIZES = {
  small: { scale: 0.5, label: 'Pequeño' },
  medium: { scale: 1, label: 'Mediano' },
  large: { scale: 1.5, label: 'Grande' },
};

function CursorFollower({ color, isEraser = false }: { color: string; isEraser?: boolean }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <motion.div 
      className={`fixed pointer-events-none z-50 ${isEraser ? '' : 'mix-blend-screen'}`}
      animate={{ x: pos.x - 20, y: pos.y - 20 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300, mass: 0.5 }}
    >
      <div className="relative">
        {isEraser ? (
          <Eraser className="text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]" size={32} />
        ) : (
          <Sparkles className="text-white" size={40} style={{ filter: `drop-shadow(0 0 10px ${color})`, color }} />
        )}
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute inset-0 bg-white/20 blur-xl rounded-full"
        />
      </div>
    </motion.div>
  );
}

export default function MagicBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentColor, setCurrentColor] = useState('#ffffff');
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [currentSize, setCurrentSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [tool, setTool] = useState<'brush' | 'stamp' | 'eraser'>('brush');
  const [selectedStamp, setSelectedStamp] = useState(STAMPS[0]);
  const [isRainbow, setIsRainbow] = useState(false);
  const [isMagic, setIsMagic] = useState(false);
  const [bgDark, setBgDark] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const [isClickToDraw, setIsClickToDraw] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isPointerDown = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [hue, setHue] = useState(0);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => {
        console.error(`Error attempting to enable full-screen mode: ${e.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const drawStampOutline = (ctx: CanvasRenderingContext2D, x: number, y: number, type: string, size: number, color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 5;
    ctx.shadowColor = color;
    
    ctx.beginPath();
    switch(type) {
      case 'sun':
        ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
        for(let i=0; i<8; i++) {
          const angle = (i * Math.PI * 2) / 8;
          ctx.moveTo(x + Math.cos(angle) * size * 0.35, y + Math.sin(angle) * size * 0.35);
          ctx.lineTo(x + Math.cos(angle) * size * 0.5, y + Math.sin(angle) * size * 0.5);
        }
        break;
      case 'house':
        ctx.rect(x - size * 0.3, y - size * 0.1, size * 0.6, size * 0.4);
        ctx.moveTo(x - size * 0.35, y - size * 0.1);
        ctx.lineTo(x, y - size * 0.4);
        ctx.lineTo(x + size * 0.35, y - size * 0.1);
        break;
      case 'mountain':
        ctx.moveTo(x - size * 0.5, y + size * 0.3);
        ctx.lineTo(x - size * 0.1, y - size * 0.2);
        ctx.lineTo(x + size * 0.1, y + size * 0.1);
        ctx.lineTo(x + size * 0.3, y - size * 0.1);
        ctx.lineTo(x + size * 0.5, y + size * 0.3);
        ctx.moveTo(x - size * 0.2, y - size * 0.05);
        ctx.lineTo(x - size * 0.1, y - size * 0.1);
        ctx.lineTo(x, y - size * 0.05);
        break;
      case 'bolt':
        ctx.moveTo(x + size * 0.1, y - size * 0.4);
        ctx.lineTo(x, y + size * 0.05);
        ctx.lineTo(x + size * 0.1, y + size * 0.05);
        ctx.lineTo(x - size * 0.1, y + size * 0.4);
        ctx.lineTo(x + size * 0.2, y - size * 0.05);
        ctx.lineTo(x, y - size * 0.05);
        ctx.closePath();
        break;
      case 'butterfly':
        ctx.moveTo(x, y - size * 0.2);
        ctx.bezierCurveTo(x - size * 0.05, y - size * 0.2, x - size * 0.05, y + size * 0.2, x, y + size * 0.2);
        ctx.bezierCurveTo(x + size * 0.05, y + size * 0.2, x + size * 0.05, y - size * 0.2, x, y - size * 0.2);
        ctx.moveTo(x + size * 0.02, y - size * 0.05);
        ctx.bezierCurveTo(x + size * 0.5, y - size * 0.6, x + size * 0.7, y, x + size * 0.1, y + size * 0.05);
        ctx.moveTo(x + size * 0.05, y + size * 0.05);
        ctx.bezierCurveTo(x + size * 0.6, y + size * 0.5, x + size * 0.4, y + size * 0.6, x + size * 0.02, y + size * 0.1);
        ctx.moveTo(x - size * 0.02, y - size * 0.05);
        ctx.bezierCurveTo(x - size * 0.5, y - size * 0.6, x - size * 0.7, y, x - size * 0.1, y + size * 0.05);
        ctx.moveTo(x - size * 0.05, y + size * 0.05);
        ctx.bezierCurveTo(x - size * 0.6, y + size * 0.5, x - size * 0.4, y + size * 0.6, x - size * 0.02, y + size * 0.1);
        ctx.moveTo(x, y - size * 0.2);
        ctx.quadraticCurveTo(x - size * 0.2, y - size * 0.4, x - size * 0.15, y - size * 0.5);
        ctx.moveTo(x, y - size * 0.2);
        ctx.quadraticCurveTo(x + size * 0.2, y - size * 0.4, x + size * 0.15, y - size * 0.5);
        break;
      case 'heart':
        const hSize = size * 0.4;
        ctx.moveTo(x, y + hSize * 0.3);
        ctx.bezierCurveTo(x - hSize, y - hSize, x - hSize * 1.5, y + hSize * 0.5, x, y + hSize);
        ctx.bezierCurveTo(x + hSize * 1.5, y + hSize * 0.5, x + hSize, y - hSize, x, y + hSize * 0.3);
        break;
      case 'star':
        for(let i=0; i<5; i++) {
          const r1 = size * 0.5;
          const r2 = size * 0.2;
          const a1 = (i * Math.PI * 2) / 5 - Math.PI/2;
          const a2 = a1 + Math.PI/5;
          ctx.lineTo(x + Math.cos(a1) * r1, y + Math.sin(a1) * r1);
          ctx.lineTo(x + Math.cos(a2) * r2, y + Math.sin(a2) * r2);
        }
        ctx.closePath();
        break;
      case 'moon':
        ctx.arc(x, y, size * 0.4, 0.4, Math.PI * 1.6);
        ctx.quadraticCurveTo(x + size * 0.1, y, x + size * 0.36, y + size * 0.15);
        break;
      case 'flower':
        ctx.arc(x, y, size * 0.1, 0, Math.PI * 2);
        for(let i=0; i<5; i++) {
          const angle = (i * Math.PI * 2) / 5;
          ctx.moveTo(x + Math.cos(angle) * size * 0.1, y + Math.sin(angle) * size * 0.1);
          ctx.arc(x + Math.cos(angle) * size * 0.3, y + Math.sin(angle) * size * 0.3, size * 0.15, 0, Math.PI * 2);
        }
        break;
      case 'cloud':
        ctx.moveTo(x - size * 0.3, y);
        ctx.arc(x - size * 0.2, y, size * 0.15, Math.PI, Math.PI * 2);
        ctx.arc(x, y - size * 0.1, size * 0.2, Math.PI, Math.PI * 2);
        ctx.arc(x + size * 0.2, y, size * 0.15, Math.PI, Math.PI * 2.2);
        ctx.lineTo(x - size * 0.3, y);
        break;
      case 'tree':
        ctx.moveTo(x, y - size * 0.4);
        ctx.lineTo(x - size * 0.3, y);
        ctx.lineTo(x + size * 0.3, y);
        ctx.closePath();
        ctx.rect(x - size * 0.05, y, size * 0.1, size * 0.2);
        break;
      case 'fish':
        ctx.ellipse(x, y, size * 0.4, size * 0.25, 0, 0, Math.PI * 2);
        ctx.moveTo(x - size * 0.4, y);
        ctx.lineTo(x - size * 0.6, y - size * 0.2);
        ctx.lineTo(x - size * 0.6, y + size * 0.2);
        ctx.closePath();
        break;
      case 'car':
        ctx.moveTo(x - size * 0.4, y + size * 0.1);
        ctx.lineTo(x + size * 0.4, y + size * 0.1);
        ctx.lineTo(x + size * 0.4, y - size * 0.1);
        ctx.lineTo(x + size * 0.2, y - size * 0.1);
        ctx.lineTo(x + size * 0.1, y - size * 0.3);
        ctx.lineTo(x - size * 0.2, y - size * 0.3);
        ctx.lineTo(x - size * 0.3, y - size * 0.1);
        ctx.lineTo(x - size * 0.4, y - size * 0.1);
        ctx.closePath();
        ctx.moveTo(x - size * 0.2, y + size * 0.1);
        ctx.arc(x - size * 0.2, y + size * 0.1, size * 0.1, 0, Math.PI * 2);
        ctx.moveTo(x + size * 0.2, y + size * 0.1);
        ctx.arc(x + size * 0.2, y + size * 0.1, size * 0.1, 0, Math.PI * 2);
        break;
      case 'balloon':
        ctx.ellipse(x, y - size * 0.1, size * 0.3, size * 0.4, 0, 0, Math.PI * 2);
        ctx.moveTo(x, y + size * 0.3);
        ctx.bezierCurveTo(x + size * 0.1, y + size * 0.5, x - size * 0.1, y + size * 0.6, x, y + size * 0.8);
        break;
      case 'smiley':
        ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
        ctx.moveTo(x - size * 0.15, y - size * 0.1);
        ctx.arc(x - size * 0.15, y - size * 0.1, size * 0.05, 0, Math.PI * 2);
        ctx.moveTo(x + size * 0.15, y - size * 0.1);
        ctx.arc(x + size * 0.15, y - size * 0.1, size * 0.05, 0, Math.PI * 2);
        ctx.moveTo(x - size * 0.2, y + size * 0.1);
        ctx.quadraticCurveTo(x, y + size * 0.3, x + size * 0.2, y + size * 0.1);
        break;
    }
    ctx.stroke();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const data = canvas.toDataURL();
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.src = data;
        img.onload = () => ctx.drawImage(img, 0, 0);
      }
    };
    resize();
    window.addEventListener('resize', resize);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
    return () => window.removeEventListener('resize', resize);
  }, []);

  const playMagicSound = useCallback((stampId?: string) => {
    if (!isSoundOn) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      // Default brush sound values
      let freqStart = 440 + Math.random() * 400;
      let freqEnd = 880 + Math.random() * 400;
      let duration = 0.1;
      let type: OscillatorType = 'sine';

      // Custom profiles for stamps
      if (stampId) {
        duration = 0.2;
        switch(stampId) {
          case 'sun': 
            type = 'triangle'; freqStart = 800; freqEnd = 1200; break;
          case 'bolt': 
            type = 'sawtooth'; freqStart = 200; freqEnd = 50; duration = 0.15; break;
          case 'cloud': 
            type = 'sine'; freqStart = 300; freqEnd = 350; duration = 0.3; break;
          case 'star': 
            type = 'sine'; freqStart = 1000; freqEnd = 2000; break;
          case 'heart': 
            type = 'sine'; freqStart = 200; freqEnd = 400; break;
          case 'moon': 
            type = 'sine'; freqStart = 150; freqEnd = 250; duration = 0.4; break;
          case 'house': 
            type = 'square'; freqStart = 100; freqEnd = 120; break;
          case 'car': 
            type = 'sawtooth'; freqStart = 80; freqEnd = 150; break;
          case 'fish': 
            type = 'sine'; freqStart = 400; freqEnd = 600; break;
          case 'flower': 
            type = 'triangle'; freqStart = 600; freqEnd = 800; break;
          default:
            type = 'sine'; freqStart = 500; freqEnd = 700;
        }
      }

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(freqStart, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(freqEnd, audioCtx.currentTime + duration);
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
      
      // Close context after play
      setTimeout(() => audioCtx.close(), (duration + 0.1) * 1000);
    } catch (e) {
      console.warn('Audio not allowed', e);
    }
  }, [isSoundOn]);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const currentData = canvas.toDataURL();
    setHistory(prev => {
      if (prev[prev.length - 1] === currentData) return prev;
      return [...prev.slice(-19), currentData];
    });
  }, []);

  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const undo = () => {
    if (history.length === 0) return;
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (newHistory.length > 0) {
      const img = new Image();
      img.src = newHistory[newHistory.length - 1];
      img.onload = () => ctx.drawImage(img, 0, 0);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    saveToHistory();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'pizarra-magica.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isPointerDown.current = true;
    saveToHistory();
    if (tool === 'stamp') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const scale = STAMP_SIZES[currentSize].scale;
      const stampSize = 100 * scale;
      drawStampOutline(ctx, x, y, selectedStamp.id, stampSize, selectedStamp.color);
      playMagicSound(selectedStamp.id);
    }
  };

  const handlePointerUp = () => {
    isPointerDown.current = false;
    lastPos.current = null;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (tool !== 'brush' && tool !== 'eraser') return;
    if (isClickToDraw && !isPointerDown.current) return;
    if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
    historyTimeoutRef.current = setTimeout(saveToHistory, 1000);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineWidth = SIZES[currentSize].value;

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.fill();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      let color = currentColor;
      if (isRainbow) {
        color = `hsl(${hue}, 80%, 60%)`;
        setHue(prev => (prev + 5) % 360);
      } else if (isMagic) {
        setHue(prev => (prev + 2) % 360);
        color = `hsl(${hue}, 90%, 70%)`;
      }
      ctx.strokeStyle = color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      if (Math.random() > 0.8) {
        ctx.beginPath();
        ctx.arc(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 20, Math.random() * 3, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
      }
    }
    playMagicSound();
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCurrentColor(newColor);
    setTool('brush');
    setIsRainbow(false);
    setIsMagic(false);
    
    // Update recent colors (avoid duplicates and keep top 5)
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== newColor);
      return [newColor, ...filtered].slice(0, 5);
    });
  };

  return (
    <div className={`absolute inset-0 select-none font-sans transition-colors duration-700 ${bgDark ? 'bg-zinc-950' : 'bg-zinc-800'}`}>
      <input 
        type="color" 
        ref={colorInputRef} 
        onChange={handleCustomColorChange} 
        className="hidden" 
      />
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-10 left-20 w-1 h-1 bg-white rounded-full animate-pulse" />
        <div className="absolute top-40 right-40 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-1 h-1 bg-blue-200 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/4 w-0.5 h-0.5 bg-pink-200 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="absolute top-2 sm:top-4 left-0 right-0 z-30 flex justify-center px-4">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/10 backdrop-blur-md p-1.5 sm:p-3 rounded-xl sm:rounded-3xl flex flex-wrap justify-center gap-1.5 sm:gap-4 items-center border border-white/20 shadow-2xl max-w-full overflow-x-auto scrollbar-hide"
        >
          <div className="flex gap-1 sm:gap-2 pr-1.5 sm:pr-4 border-r border-white/10">
            <button 
              onClick={() => setIsClickToDraw(!isClickToDraw)} 
              className={`p-1.5 sm:p-3 rounded-lg sm:rounded-2xl transition-all ${isClickToDraw ? 'bg-orange-500 shadow-lg scale-105' : 'bg-purple-600 shadow-lg scale-105'}`}
              title={isClickToDraw ? "Modo: Clic para dibujar" : "Modo: Dibujo al pasar"}
            >
              {isClickToDraw ? <Hand size={18} className="sm:w-7 sm:h-7" /> : <Wand2 size={18} className="sm:w-7 sm:h-7" />}
            </button>
            <button onClick={undo} className="p-1.5 sm:p-3 bg-blue-500 rounded-lg sm:rounded-2xl hover:bg-blue-400 transition-colors" title="Deshacer">
              <Undo2 size={18} className="sm:w-7 sm:h-7" />
            </button>
            <button onClick={clearCanvas} className="p-1.5 sm:p-3 bg-red-500 rounded-lg sm:rounded-2xl hover:bg-red-400 transition-colors" title="Borrar Todo">
              <Trash2 size={18} className="sm:w-7 sm:h-7" />
            </button>
            <button onClick={() => setBgDark(!bgDark)} className="p-1.5 sm:p-3 bg-zinc-700 rounded-lg sm:rounded-2xl hover:bg-zinc-600 transition-colors" title="Cambiar Fondo">
              <Layers size={18} className="sm:w-7 sm:h-7" />
            </button>
            <button onClick={() => setIsSoundOn(!isSoundOn)} className="p-1.5 sm:p-3 bg-yellow-600 rounded-lg sm:rounded-2xl hover:bg-yellow-500 transition-colors hidden sm:flex" title="Sonido">
              {isSoundOn ? <Volume2 size={18} className="sm:w-7 sm:h-7" /> : <VolumeX size={18} className="sm:w-7 sm:h-7" />}
            </button>
            <button onClick={downloadImage} className="p-1.5 sm:p-3 bg-green-600 rounded-lg sm:rounded-2xl hover:bg-green-500 transition-colors" title="Guardar">
              <Download size={18} className="sm:w-7 sm:h-7" />
            </button>
          </div>

          <div className="flex gap-1 sm:gap-2 pr-1.5 sm:pr-4 border-r border-white/10">
            <button 
              onClick={() => { setTool('brush'); setIsRainbow(false); setIsMagic(false); }}
              className={`p-1.5 sm:p-3 rounded-lg sm:rounded-2xl transition-all ${tool === 'brush' && !isRainbow && !isMagic ? 'bg-white text-zinc-900 scale-105 shadow-lg' : 'bg-white/10 text-white'}`}
              title="Pincel"
            >
              <Brush size={18} className="sm:w-7 sm:h-7" />
            </button>
            <button 
              onClick={() => { setTool('brush'); setIsRainbow(true); setIsMagic(false); }}
              className={`p-1.5 sm:p-3 rounded-lg sm:rounded-2xl transition-all ${isRainbow ? 'bg-gradient-to-r from-red-400 via-green-400 to-blue-400 scale-105 shadow-lg' : 'bg-white/10 text-white'}`}
              title="Pincel Arcoíris"
            >
              <Palette size={18} className="sm:w-7 sm:h-7" />
            </button>
            <button 
              onClick={() => { setTool('brush'); setIsRainbow(false); setIsMagic(true); }}
              className={`p-1.5 sm:p-3 rounded-lg sm:rounded-2xl transition-all ${isMagic ? 'bg-gradient-to-tr from-yellow-400 to-pink-500 scale-105 shadow-lg' : 'bg-white/10 text-white'}`}
              title="Pincel Mágico"
            >
              <Sparkles size={18} className="sm:w-7 sm:h-7" />
            </button>
            <button 
              onClick={() => { setTool('eraser'); setIsRainbow(false); setIsMagic(false); }}
              className={`p-1.5 sm:p-3 rounded-lg sm:rounded-2xl transition-all ${tool === 'eraser' ? 'bg-pink-500 text-white scale-105 shadow-lg' : 'bg-white/10 text-white'}`}
              title="Goma de Borrar"
            >
              <Eraser size={18} className="sm:w-7 sm:h-7" />
            </button>
          </div>

          <div className="flex gap-1 sm:gap-2">
            {(Object.entries(SIZES) as [keyof typeof SIZES, typeof SIZES.small][]).map(([key, config]) => (
              <button
                key={`magic-size-${key}`}
                onClick={() => setCurrentSize(key)}
                className={`flex items-center justify-center p-1.5 sm:p-3 rounded-lg sm:rounded-2xl transition-all ${currentSize === key ? 'bg-white text-zinc-900 scale-105 shadow-lg' : 'bg-white/10 text-white'}`}
              >
                <div className="rounded-full bg-current" style={{ width: config.iconSize / 3, height: config.iconSize / 3 }} />
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="absolute inset-y-0 left-0 flex items-center p-1 sm:p-4 z-20">
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white/10 backdrop-blur-md p-1.5 sm:p-3 rounded-xl sm:rounded-3xl flex flex-col gap-1.5 sm:gap-3 border border-white/20 shadow-2xl overflow-y-auto max-h-[70vh] landscape:max-h-[85vh] scrollbar-hide"
        >
          {COLORS_BASE.map((c) => (
            <button
              key={`magic-color-${c.hex}`}
              onClick={() => { setCurrentColor(c.hex); setTool('brush'); setIsRainbow(false); setIsMagic(false); }}
              className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 sm:border-4 transition-all ${currentColor === c.hex && tool === 'brush' && !isRainbow && !isMagic ? 'border-white scale-110 shadow-xl' : 'border-transparent'}`}
              style={{ backgroundColor: c.hex }}
              title={c.label}
            />
          ))}
          
          {recentColors.length > 0 && <div className="h-px bg-white/20 mx-2 my-1" />}
          
          {recentColors.map((hex, i) => (
            <button
              key={`recent-${hex}-${i}`}
              onClick={() => { setCurrentColor(hex); setTool('brush'); setIsRainbow(false); setIsMagic(false); }}
              className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 sm:border-4 transition-all ${currentColor === hex && tool === 'brush' && !isRainbow && !isMagic ? 'border-white scale-110 shadow-xl' : 'border-transparent'}`}
              style={{ backgroundColor: hex }}
              title="Color reciente"
            />
          ))}

          <div className="h-px bg-white/20 mx-2 my-1" />
          
          <button
            onClick={() => colorInputRef.current?.click()}
            className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 sm:border-4 border-dashed border-white/30 flex items-center justify-center bg-white/5 hover:bg-white/20 transition-all"
            title="Elegir más colores"
          >
            <Palette size={16} className="text-white" />
          </button>
        </motion.div>
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center p-1 sm:p-4 z-20">
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white/10 backdrop-blur-md p-1.5 sm:p-3 rounded-xl sm:rounded-3xl flex flex-col gap-1 sm:gap-2 max-h-[70vh] landscape:max-h-[85vh] overflow-y-auto border border-white/20 shadow-2xl scrollbar-hide"
        >
          {STAMPS.map((stamp) => {
            const Icon = stamp.icon;
            return (
              <button
                key={`magic-stamp-${stamp.id}`}
                onClick={() => { setSelectedStamp(stamp); setTool('stamp'); }}
                className={`w-9 h-9 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl flex items-center justify-center transition-all border-2 ${tool === 'stamp' && selectedStamp.id === stamp.id ? 'bg-white/20 border-white scale-110 shadow-xl' : 'bg-white/10 border-transparent text-white hover:bg-white/20'}`}
                title={stamp.label}
              >
                <Icon size={20} className="sm:w-8 sm:h-8" style={{ color: stamp.color }} />
              </button>
            );
          })}
        </motion.div>
      </div>

      <div 
        className="absolute inset-0 overflow-hidden" 
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ cursor: tool === 'stamp' ? 'copy' : 'none' }}
      >
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          className="w-full h-full touch-none"
        />
        {(tool === 'brush' || tool === 'eraser') && (
          <CursorFollower 
            color={isRainbow || isMagic ? `hsl(${hue}, 100%, 70%)` : currentColor} 
            isEraser={tool === 'eraser'}
          />
        )}
      </div>

      <AnimatePresence>
        {(tool === 'stamp') && (
          <motion.div
            key="magicboard-stamp-tip"
            initial={{ scale: 0, opacity: 0, x: -50 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0, opacity: 0, x: -50 }}
            className="absolute bottom-6 right-6 sm:bottom-10 sm:right-24 pointer-events-none bg-white/20 backdrop-blur-lg px-4 py-2 sm:px-6 sm:py-3 rounded-full border border-white/30 z-20"
          >
            <p className="text-sm sm:text-xl font-comic text-white flex items-center gap-2">
              <span className="text-xl sm:text-3xl">✨</span> ¡Toca la pizarra!
            </p>
          </motion.div>
        )}
        {tool === 'brush' && (
          <motion.div
            key="magicboard-brush-tip"
            initial={{ scale: 0, opacity: 0, x: -50 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0, opacity: 0, x: -50 }}
            className="absolute bottom-6 right-6 sm:bottom-10 sm:right-24 pointer-events-none bg-white/20 backdrop-blur-lg px-4 py-2 sm:px-6 sm:py-3 rounded-full border border-white/30 z-20"
          >
            <p className="text-sm sm:text-xl font-comic text-white flex items-center gap-2">
              <span className="text-xl sm:text-3xl">🎨</span> Dibuja lo que quieras
            </p>
          </motion.div>
        )}
        {tool === 'eraser' && (
          <motion.div
            key="magicboard-eraser-tip"
            initial={{ scale: 0, opacity: 0, x: -50 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0, opacity: 0, x: -50 }}
            className="absolute bottom-6 right-6 sm:bottom-10 sm:right-24 pointer-events-none bg-white/20 backdrop-blur-lg px-4 py-2 sm:px-6 sm:py-3 rounded-full border border-white/30 z-20"
          >
            <p className="text-sm sm:text-xl font-comic text-white flex items-center gap-2">
              <span className="text-xl sm:text-3xl">🧹</span> Desliza para borrar
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-4 left-0 right-0 pointer-events-none flex justify-center">
        <p className="text-white/30 font-comic text-lg">Pizarra Mágica ✨ Un espacio para crear</p>
      </div>
    </div>
  );
}
