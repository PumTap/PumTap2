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
      <circle cx="12" cy="7" r="1.5" />
      <rect x="11.25" y="8.5" width="1.5" height="9" rx="0.75" fill="currentColor" />
      <path d="M12 10C11.5 6, 6 5, 6 9C6 12.5, 9.5 13.5, 12 11.5" />
      <path d="M12 11.5C10 13.5, 7.5 14, 7.5 17C7.5 19.5, 11 19, 12 14.5" />
      <path d="M12 10C12.5 6, 18 5, 18 9C18 12.5, 14.5 13.5, 12 11.5" />
      <path d="M12 11.5C14 13.5, 16.5 14, 16.5 17C16.5 19.5, 13 19, 12 14.5" />
      <path d="M10.5 5.5c-1-1.5-2-1.5-2.5-.5" />
      <path d="M13.5 5.5c1-1.5 2-1.5 2.5-.5" />
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

// Helper to generate inline SVG content representing identical stamps to the sidebar icons
const getStampSvg = (id: string, color: string) => {
  let content = '';
  switch (id) {
    case 'sun':
      content = `<circle cx="12" cy="12" r="4" fill="${color}" fill-opacity="0.2"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>`;
      break;
    case 'house':
      content = `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="${color}" fill-opacity="0.13"/><polyline points="9 22 9 12 15 12 15 22"/>`;
      break;
    case 'mountain':
      content = `<path d="m8 3 4 8 5-5 5 15H2L8 3z" fill="${color}" fill-opacity="0.13"/>`;
      break;
    case 'cloud':
      content = `<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" fill="${color}" fill-opacity="0.13"/>`;
      break;
    case 'tree':
      content = `<path d="m12 2 10 10H17l5 5H2l5-5H3L12 2z" fill="${color}" fill-opacity="0.13"/><path d="M12 17v5"/>`;
      break;
    case 'flower':
      content = `<circle cx="12" cy="12" r="3" fill="${color}" fill-opacity="0.2"/><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V12m0 0a4.5 4.5 0 1 1-4.5 4.5M12 12a4.5 4.5 0 1 1 4.5 4.5M12 12v4.5"/>`;
      break;
    case 'star':
      content = `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="${color}" fill-opacity="0.2"/>`;
      break;
    case 'moon':
      content = `<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="${color}" fill-opacity="0.13"/>`;
      break;
    case 'heart':
      content = `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill="${color}" fill-opacity="0.2"/>`;
      break;
    case 'butterfly':
      content = `<circle cx="12" cy="7" r="1.5" fill="${color}" /><rect x="11.25" y="8.5" width="1.5" height="9" rx="0.75" fill="${color}" /><path d="M12 10 C 11.5 6, 6 5, 6 9 C 6 12.5, 9.5 13.5, 12 11.5" fill="none" /><path d="M12 11.5 C 10 13.5, 7.5 14, 7.5 17 C 7.5 19.5, 11 19, 12 14.5" fill="none" /><path d="M12 10 C 12.5 6, 18 5, 18 9 C 18 12.5, 14.5 13.5, 12 11.5" fill="none" /><path d="M12 11.5 C 14 13.5, 16.5 14, 16.5 17 C 16.5 19.5, 13 19, 12 14.5" fill="none" /><path d="M10.5 5.5 c -1 -1.5, -2 -1.5, -2.5 -0.5" fill="none" /><path d="M13.5 5.5 c 1 -1.5, 2 -1.5, 2.5 -0.5" fill="none" />`;
      break;
    case 'bolt':
      content = `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="${color}" fill-opacity="0.2"/>`;
      break;
    case 'fish':
      content = `<circle cx="15" cy="9.5" r="1.5" fill="${color}"/><path d="M11 9c-1 1.5-1 3.5 0 5" /><path d="M18 12.5c-.8.8-2 .8-2.8 0" /><path d="M20 12c0-4-4-7-10-7-4.5 0-6 3-6 7s1.5 7 6 7c6 0 10-3 10-7Z" fill="${color}" fill-opacity="0.13"/><path d="M4 12 L 0 8.5 L 1.5 12 L 0 15.5 Z" fill="${color}" fill-opacity="0.2" /><path d="M9 5c1-2 3-2 4 0" fill="${color}" fill-opacity="0.2" /><path d="M9 19c1 2 3 2 4 0" fill="${color}" fill-opacity="0.2" />`;
      break;
    case 'car':
      content = `<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" fill="${color}" fill-opacity="0.13"/><circle cx="7" cy="17" r="2" fill="${color}" fill-opacity="0.27"/><circle cx="17" cy="17" r="2" fill="${color}" fill-opacity="0.27"/><path d="M9 17h6"/>`;
      break;
    case 'balloon':
      content = `<circle cx="12" cy="10" r="8" fill="${color}" fill-opacity="0.2"/><path d="M12 18c-1 1.5-2 3.5-1 5" />`;
      break;
    case 'smiley':
      content = `<circle cx="12" cy="12" r="10" fill="${color}" fill-opacity="0.13"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>`;
      break;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${content}</svg>`;
};

export default function MagicBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentColor, setCurrentColor] = useState('#ffffff');
  const [customColor, setCustomColor] = useState<string | null>(null);
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
  const [eraserParticles, setEraserParticles] = useState<any[]>([]);

  const spawnEraserParticles = (x: number, y: number) => {
    const count = 3;
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2.5;
      newParticles.push({
        id: Math.random() + Date.now() + i,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color: Math.random() > 0.4 ? '#ff79c6' : '#fbcfe8',
        opacity: 1,
      });
    }
    setEraserParticles(prev => [...prev, ...newParticles].slice(-40));
  };

  useEffect(() => {
    if (eraserParticles.length === 0) return;
    let active = true;
    let frameId: number;
    const update = () => {
      if (!active) return;
      setEraserParticles(prev => {
        if (prev.length === 0) return prev;
        return prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.08, // gravity
            opacity: p.opacity - 0.04,
          }))
          .filter(p => p.opacity > 0);
      });
      frameId = requestAnimationFrame(update);
    };
    frameId = requestAnimationFrame(update);
    return () => {
      active = false;
      cancelAnimationFrame(frameId);
    };
  }, [eraserParticles.length > 0]);

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

  const drawStampDirectly = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    type: string,
    size: number,
    color: string
  ) => {
    ctx.save();
    
    // Set standard styles matching SVG's strokes
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Enable high-quality glowing effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    
    // Position and scale to match bounds
    ctx.translate(x, y);
    const scale = size / 24;
    ctx.scale(scale, scale);
    ctx.translate(-12, -12); // Center a 24x24 path on (x, y)
    
    const drawPath = (d: string, fillOpacity = 0, stroke = true) => {
      const p = new Path2D(d);
      if (fillOpacity > 0) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.shadowBlur = 0;
        ctx.globalAlpha = fillOpacity;
        ctx.fill(p);
        ctx.restore();
      }
      if (stroke) {
        ctx.stroke(p);
      }
    };
    
    const drawCircle = (cx: number, cy: number, r: number, fillOpacity = 0, stroke = true) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      if (fillOpacity > 0) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.shadowBlur = 0;
        ctx.globalAlpha = fillOpacity;
        ctx.fill();
        ctx.restore();
      }
      if (stroke) {
        ctx.stroke();
      }
    };
    
    switch (type) {
      case 'sun':
        drawCircle(12, 12, 4, 0.2, true);
        drawPath("M12 2v2");
        drawPath("M12 20v2");
        drawPath("m4.93 4.93 1.41 1.41");
        drawPath("m17.66 17.66 1.41 1.41");
        drawPath("M2 12h2");
        drawPath("M20 12h2");
        drawPath("m6.34 17.66-1.41 1.41");
        drawPath("m19.07 4.93-1.41 1.41");
        break;
      case 'house':
        drawPath("m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", 0.13, true);
        drawPath("M9 22V12h6v10", 0, true);
        break;
      case 'mountain':
        drawPath("m8 3 4 8 5-5 5 15H2L8 3z", 0.13, true);
        break;
      case 'cloud':
        drawPath("M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z", 0.13, true);
        break;
      case 'tree':
        drawPath("m12 2 10 10H17l5 5H2l5-5H3L12 2z", 0.13, true);
        drawPath("M12 17v5");
        break;
      case 'flower':
        drawCircle(12, 12, 3, 0.2, true);
        drawPath("M12 7.5a4.5 4.5 0 1 1 4.5 4.5");
        drawPath("M12 7.5A4.5 4.5 0 1 0 7.5 12");
        drawPath("M12 16.5a4.5 4.5 0 1 1-4.5-4.5");
        drawPath("M12 16.5a4.5 4.5 0 1 0 4.5-4.5");
        drawPath("M12 7.5V12");
        drawPath("M12 12v4.5");
        drawPath("M12 12h4.5");
        drawPath("M12 12H7.5");
        break;
      case 'star':
        drawPath("M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 Z", 0.2, true);
        break;
      case 'moon':
        drawPath("M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", 0.13, true);
        break;
      case 'heart':
        drawPath("M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z", 0.2, true);
        break;
      case 'butterfly':
        drawCircle(12, 7, 1.5, 1.0, true);
        drawPath("M11.25 8.5 h1.5 v9 h-1.5 z", 1.0, true);
        drawPath("M12 10C11.5 6, 6 5, 6 9C6 12.5, 9.5 13.5, 12 11.5", 0.15, true);
        drawPath("M12 11.5C10 13.5, 7.5 14, 7.5 17C7.5 19.5, 11 19, 12 14.5", 0.15, true);
        drawPath("M12 10C12.5 6, 18 5, 18 9C18 12.5, 14.5 13.5, 12 11.5", 0.15, true);
        drawPath("M12 11.5C14 13.5, 16.5 14, 16.5 17C16.5 19.5, 13 19, 12 14.5", 0.15, true);
        drawPath("M10.5 5.5c-1-1.5-2-1.5-2.5-.5");
        drawPath("M13.5 5.5c1-1.5 2-1.5 2.5-.5");
        break;
      case 'bolt':
        drawPath("M13 2 L3 14 L12 14 L11 22 L21 10 L12 10 Z", 0.2, true);
        break;
      case 'fish':
        drawCircle(15, 9.5, 1.5, 1.0, true);
        drawPath("M11 9c-1 1.5-1 3.5 0 5");
        drawPath("M18 12.5c-.8.8-2 .8-2.8 0");
        drawPath("M20 12c0-4-4-7-10-7-4.5 0-6 3-6 7s1.5 7 6 7c6 0 10-3 10-7Z", 0.13, true);
        drawPath("M4 12 L 0 8.5 L 1.5 12 L 0 15.5 Z", 0.2, true);
        drawPath("M9 5c1-2 3-2 4 0", 0.2, true);
        drawPath("M9 19c1 2 3 2 4 0", 0.2, true);
        break;
      case 'car':
        drawPath("M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2", 0.13, true);
        drawCircle(7, 17, 2, 0.27, true);
        drawCircle(17, 17, 2, 0.27, true);
        drawPath("M9 17h6");
        break;
      case 'balloon':
        drawCircle(12, 10, 8, 0.2, true);
        drawPath("M12 18c-1 1.5-2 3.5-1 5");
        break;
      case 'smiley':
        drawCircle(12, 12, 10, 0.13, true);
        drawPath("M8 14s1.5 2 4 2 4-2 4-2");
        drawPath("M9 9h.01");
        drawPath("M15 9h.01");
        break;
    }
    
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    // Set initial size instantly so the board functions immediately on mount
    const initialWidth = parent.clientWidth || window.innerWidth;
    const initialHeight = parent.clientHeight || window.innerHeight;
    canvas.width = initialWidth;
    canvas.height = initialHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    let timeoutId: NodeJS.Timeout;

    const resizeCanvas = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        const width = Math.floor(entry.contentRect.width || parent.clientWidth || window.innerWidth);
        const height = Math.floor(entry.contentRect.height || parent.clientHeight || window.innerHeight);
        if (width <= 0 || height <= 0) continue;

        // Debounce resize updates to maintain canvas state stable during layout animations
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          const data = canvas.toDataURL();
          canvas.width = width;
          canvas.height = height;

          const currentCtx = canvas.getContext('2d');
          if (currentCtx) {
            currentCtx.lineCap = 'round';
            currentCtx.lineJoin = 'round';

            const img = new Image();
            img.onload = () => {
              currentCtx.drawImage(img, 0, 0);
            };
            img.src = data;
          }
        }, 120);
      }
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(parent);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'stamp') {
      const scale = STAMP_SIZES[currentSize].scale;
      const stampSize = 100 * scale;
      drawStampDirectly(ctx, x, y, selectedStamp.id, stampSize, selectedStamp.color);
      playMagicSound(selectedStamp.id);
    } else if (tool === 'brush' || tool === 'eraser') {
      ctx.lineWidth = SIZES[currentSize].value;
      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.fill();
        spawnEraserParticles(x, y);
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
        ctx.fillStyle = color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      playMagicSound();
    }
  };

  const handlePointerUp = () => {
    isPointerDown.current = false;
    lastPos.current = null;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (tool !== 'brush' && tool !== 'eraser') return;
    if (!isPointerDown.current) return;
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
      spawnEraserParticles(x, y);
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
    setCustomColor(newColor);
    setCurrentColor(newColor);
    setTool('brush');
    setIsRainbow(false);
    setIsMagic(false);
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

      <div className="absolute top-2 sm:top-4 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/10 backdrop-blur-md p-1.5 sm:p-3 rounded-xl sm:rounded-3xl flex flex-wrap justify-center gap-1.5 sm:gap-4 items-center border border-white/20 shadow-2xl max-w-full overflow-x-auto scrollbar-hide pointer-events-auto"
        >
          <div className="flex gap-1 sm:gap-2 pr-1.5 sm:pr-4 border-r border-white/10">
            <button onClick={undo} className="p-1.5 sm:p-3 bg-blue-500 rounded-lg sm:rounded-2xl hover:bg-blue-400 transition-colors" title="Deshacer">
              <Undo2 size={18} className="sm:w-7 sm:h-7" />
            </button>
            <button onClick={clearCanvas} className="p-1.5 sm:p-3 bg-red-500 rounded-lg sm:rounded-2xl hover:bg-red-400 transition-colors" title="Borrar Todo">
              <Trash2 size={18} className="sm:w-7 sm:h-7" />
            </button>
            <button 
              onClick={() => { setTool('eraser'); setIsRainbow(false); setIsMagic(false); }}
              className={`p-1.5 sm:p-3 rounded-lg sm:rounded-2xl transition-all ${tool === 'eraser' ? 'bg-pink-500 text-white scale-105 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}
              title="Goma de Borrar"
            >
              <Eraser size={18} className="sm:w-7 sm:h-7" />
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
              onClick={() => { setTool('brush'); setIsRainbow(false); setIsMagic(true); }}
              className={`p-1.5 sm:p-3 rounded-lg sm:rounded-2xl transition-all ${isMagic ? 'bg-gradient-to-tr from-yellow-400 to-pink-500 scale-105 shadow-lg' : 'bg-white/10 text-white'}`}
              title="Pincel Mágico"
            >
              <Sparkles size={18} className="sm:w-7 sm:h-7" />
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

      <div className="absolute inset-y-0 left-0 flex items-center p-1 sm:p-4 z-20 pointer-events-none">
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white/10 backdrop-blur-md p-1 sm:p-3 rounded-xl sm:rounded-3xl flex flex-col gap-1 sm:gap-2.5 border border-white/20 shadow-2xl overflow-y-auto max-h-[70vh] landscape:max-h-[85vh] scrollbar-hide pointer-events-auto"
        >
          {COLORS_BASE.map((c) => (
            <button
              key={`magic-color-${c.hex}`}
              onClick={() => { setCurrentColor(c.hex); setTool('brush'); setIsRainbow(false); setIsMagic(false); }}
              className={`w-6 h-6 min-[375px]:w-8 min-[375px]:h-8 sm:w-12 sm:h-12 rounded-full border border-white/20 sm:border-4 transition-all ${currentColor === c.hex && tool === 'brush' && !isRainbow && !isMagic ? 'border-white scale-110 shadow-xl ring-2 ring-white/50' : 'border-transparent'}`}
              style={{ backgroundColor: c.hex }}
              title={c.label}
            />
          ))}
          
          <div className="h-px bg-white/20 mx-2 my-0.5" />
          
          <button
            onClick={() => {
              if (customColor) {
                setCurrentColor(customColor);
                setTool('brush');
                setIsRainbow(false);
                setIsMagic(false);
              }
              colorInputRef.current?.click();
            }}
            className={`w-6 h-6 min-[375px]:w-8 min-[375px]:h-8 sm:w-12 sm:h-12 rounded-full border sm:border-4 transition-all flex items-center justify-center ${currentColor === customColor && tool === 'brush' && !isRainbow && !isMagic && customColor ? 'border-white scale-110 shadow-xl ring-2 ring-white/50' : 'border-white/30 border-dashed bg-white/5 hover:bg-white/20 text-white'}`}
            style={{ backgroundColor: customColor || 'transparent' }}
            title="Elegir más colores"
          >
            {!customColor && <Palette className="w-3.5 h-3.5 min-[375px]:w-4 min-[375px]:h-4 sm:w-6 sm:h-6" />}
          </button>
        </motion.div>
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center p-1 sm:p-4 z-20 pointer-events-none">
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white/10 backdrop-blur-md p-1 sm:p-3 rounded-xl sm:rounded-3xl flex flex-col gap-1 sm:gap-2 max-h-[70vh] landscape:max-h-[85vh] overflow-y-auto border border-white/20 shadow-2xl scrollbar-hide pointer-events-auto"
        >
          {STAMPS.map((stamp) => {
            const Icon = stamp.icon;
            return (
              <button
                key={`magic-stamp-${stamp.id}`}
                onClick={() => { setSelectedStamp(stamp); setTool('stamp'); }}
                className={`w-7 h-7 min-[375px]:w-9 min-[375px]:h-9 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl flex items-center justify-center transition-all border ${tool === 'stamp' && selectedStamp.id === stamp.id ? 'bg-white/20 border-white scale-110 shadow-xl' : 'bg-white/10 border-transparent text-white hover:bg-white/20'}`}
                title={stamp.label}
              >
                <Icon className="w-4 h-4 min-[375px]:w-5 min-[375px]:h-5 sm:w-8 sm:h-8" style={{ color: stamp.color }} />
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
        {eraserParticles.map(p => (
          <div
            key={`eraser-p-${p.id}`}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              opacity: p.opacity,
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
            }}
          />
        ))}
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
