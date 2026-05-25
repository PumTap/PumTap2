import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  RefreshCw, 
  Sparkles, 
  User, 
  Eye, 
  Smile, 
  Scissors, 
  Palette,
  Camera
} from 'lucide-react';

type CATEGORY = 'skin' | 'hair' | 'eyes' | 'mouth' | 'nose' | 'extra';

interface FeatureOption {
  id: string;
  render: (color: string) => React.ReactNode;
}

const SKIN_COLORS = ['#FFDBAC', '#F1C27D', '#E0AC69', '#8D5524', '#C68642', '#FFC9B9', '#FFE0BD', '#EBCBB9', '#FFAD60', '#964B00'];
const HAIR_COLORS = ['#09090b', '#422006', '#713f12', '#a16207', '#451a03', '#ca8a04', '#ef4444', '#3b82f6', '#ec4899', '#a855f7', '#22c55e', '#ffffff', '#94a3b8'];
const EYE_COLORS = ['#000000', '#3b82f6', '#22c55e', '#78350f', '#0ea5e9', '#fbbf24', '#94a3b8', '#ec4899'];

const FEATURES: Record<CATEGORY, FeatureOption[]> = {
  skin: [
    { id: 'round', render: (c) => <ellipse cx="100" cy="110" rx="70" ry="80" fill={c} stroke="rgba(0,0,0,0.1)" strokeWidth="2" /> },
    { id: 'oval', render: (c) => <rect x="40" y="30" width="120" height="150" rx="60" fill={c}  stroke="rgba(0,0,0,0.1)" strokeWidth="2" /> },
    { id: 'square', render: (c) => <rect x="45" y="40" width="110" height="140" rx="30" fill={c} stroke="rgba(0,0,0,0.1)" strokeWidth="2" /> },
    { id: 'heart', render: (c) => <path d="M100,190 Q30,150 30,80 A30,30 0 0,1 100,80 A30,30 0 0,1 170,80 Q170,150 100,190" fill={c} stroke="rgba(0,0,0,0.1)" strokeWidth="2" /> },
    { id: 'long', render: (c) => <rect x="50" y="20" width="100" height="170" rx="50" fill={c} stroke="rgba(0,0,0,0.1)" strokeWidth="2" /> },
  ],
  hair: [
    { id: 'none', render: () => null },
    { id: 'short', render: (c) => <path d="M40,70 Q40,20 100,20 Q160,20 160,70 L160,90 Q100,70 40,90 Z" fill={c} /> },
    { id: 'spiky', render: (c) => <path d="M40,80 L30,50 L60,70 L70,30 L100,60 L130,30 L140,70 L170,50 L160,80 Q100,50 40,80" fill={c} /> },
    { id: 'bowl', render: (c) => <path d="M30,100 Q30,10 100,10 Q170,10 170,100 L160,110 Q100,90 40,110 Z" fill={c} /> },
    { id: 'long', render: (c) => <path d="M30,110 L30,180 Q30,190 40,190 L160,190 Q170,190 170,180 L170,110 Q170,30 100,30 Q30,30 30,110" fill={c} /> },
    { id: 'curly', render: (c) => (
      <g fill={c}>
        <circle cx="50" cy="50" r="30" /><circle cx="100" cy="30" r="35" /><circle cx="150" cy="50" r="30" />
        <circle cx="40" cy="100" r="25" /><circle cx="160" cy="100" r="25" />
      </g>
    )},
    { id: 'mohawk', render: (c) => <path d="M90,20 L110,20 L115,80 L85,80 Z M100,10 L110,30 L90,30 Z M100,-10 L110,10 L90,10 Z" fill={c} transform="translate(0, 10)" /> },
    { id: 'tails', render: (c) => (
      <g fill={c}>
        <path d="M40,70 Q40,20 100,20 Q160,20 160,70 L160,90 Q100,70 40,90 Z" />
        <circle cx="30" cy="80" r="25" /><circle cx="170" cy="80" r="25" />
      </g>
    )},
    { id: 'afro', render: (c) => <circle cx="100" cy="70" r="70" fill={c} /> },
    { id: 'bangs', render: (c) => <path d="M40,70 Q100,10 160,70 L160,100 Q140,80 120,100 Q100,80 80,100 Q60,80 40,100 Z" fill={c} /> },
  ],
  eyes: [
    { id: 'dot', render: (c) => <g><circle cx="75" cy="100" r="8" fill={c} /><circle cx="125" cy="100" r="8" fill={c} /></g> },
    { id: 'happy', render: (c) => (
      <g fill="none" stroke={c} strokeWidth="4" strokeLinecap="round">
        <path d="M60,110 Q75,90 90,110" /><path d="M110,110 Q125,90 140,110" />
      </g>
    )},
    { id: 'big', render: (c) => (
      <g>
        <circle cx="70" cy="105" r="15" fill="white" stroke="black" strokeWidth="2" />
        <circle cx="130" cy="105" r="15" fill="white" stroke="black" strokeWidth="2" />
        <circle cx="75" cy="105" r="6" fill={c} /><circle cx="135" cy="105" r="6" fill={c} />
      </g>
    )},
    { id: 'cool', render: () => (
      <g fill="#18181b">
        <rect x="50" y="95" width="45" height="25" rx="5" />
        <rect x="105" y="95" width="45" height="25" rx="5" />
        <line x1="95" y1="105" x2="105" y2="105" stroke="#18181b" strokeWidth="4" />
      </g>
    )},
    { id: 'wink', render: (c) => (
      <g>
        <circle cx="75" cy="100" r="8" fill={c} />
        <path d="M110,105 Q125,115 140,105" fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" />
      </g>
    )},
    { id: 'anime', render: (c) => (
      <g>
        <ellipse cx="70" cy="105" rx="14" ry="20" fill={c} />
        <ellipse cx="130" cy="105" rx="14" ry="20" fill={c} />
        <circle cx="73" cy="98" r="5" fill="white" />
        <circle cx="133" cy="98" r="5" fill="white" />
        <circle cx="67" cy="112" r="2" fill="white" fillOpacity="0.6" />
        <circle cx="127" cy="112" r="2" fill="white" fillOpacity="0.6" />
      </g>
    )},
    { id: 'starry', render: () => (
      <g fill="gold">
        <path d="M70,90 L75,105 L90,105 L78,115 L82,130 L70,120 L58,130 L62,115 L50,105 L65,105 Z" />
        <path d="M130,90 L135,105 L150,105 L138,115 L142,130 L130,120 L118,130 L122,115 L110,105 L125,105 Z" />
      </g>
    )},
    { id: 'cat', render: (c) => (
      <g>
        <ellipse cx="70" cy="105" rx="15" ry="10" fill="white" stroke="black" strokeWidth="1" />
        <ellipse cx="130" cy="105" rx="15" ry="10" fill="white" stroke="black" strokeWidth="1" />
        <rect x="68" y="98" width="4" height="14" rx="2" fill={c} />
        <rect x="128" y="98" width="4" height="14" rx="2" fill={c} />
      </g>
    )},
    { id: 'tired', render: (c) => (
      <g>
        <circle cx="75" cy="100" r="8" fill={c} />
        <circle cx="125" cy="100" r="8" fill={c} />
        <path d="M55,115 Q75,125 95,115" fill="none" stroke="black" strokeOpacity={0.2} strokeWidth="2" opacity="0.3" />
        <path d="M105,115 Q125,125 145,115" fill="none" stroke="black" strokeOpacity={0.2} strokeWidth="2" opacity="0.3" />
      </g>
    )},
    { id: 'lashes', render: (c) => (
      <g>
        <circle cx="75" cy="105" r="10" fill="white" stroke="black" strokeWidth="1" />
        <circle cx="125" cy="105" r="10" fill="white" stroke="black" strokeWidth="1" />
        <circle cx="75" cy="105" r="5" fill={c} />
        <circle cx="125" cy="105" r="5" fill={c} />
        <path d="M60,95 L55,85 M70,90 L65,80 M80,90 L85,80" stroke="black" strokeWidth="2" strokeLinecap="round" />
        <path d="M140,95 L145,85 M130,90 L135,80 M120,90 L115,80" stroke="black" strokeWidth="2" strokeLinecap="round" />
      </g>
    )},
  ],
  nose: [
    { id: 'round', render: () => <circle cx="100" cy="125" r="6" fill="rgba(0,0,0,0.2)" /> },
    { id: 'pointy', render: () => <path d="M100,120 L105,135 L95,135 Z" fill="rgba(0,0,0,0.2)" /> },
    { id: 'u', render: () => <path d="M95,130 Q100,140 105,130" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="3" strokeLinecap="round" /> },
    { id: 'pig', render: () => (
      <g transform="translate(100, 130)">
        <ellipse cx="0" cy="0" rx="12" ry="8" fill="rgba(0,0,0,0.15)" />
        <circle cx="-4" cy="0" r="2" fill="rgba(0,0,0,0.3)" />
        <circle cx="4" cy="0" r="2" fill="rgba(0,0,0,0.3)" />
      </g>
    )},
  ],
  mouth: [
    { id: 'smile', render: () => <path d="M70,145 Q100,170 130,145" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" /> },
    { id: 'laugh', render: () => <path d="M70,145 Q100,180 130,145 Q100,155 70,145" fill="#f43f5e" stroke="black" strokeWidth="2" /> },
    { id: 'o', render: () => <circle cx="100" cy="155" r="12" fill="none" stroke="black" strokeWidth="4" /> },
    { id: 'meh', render: () => <line x1="75" y1="155" x2="125" y2="155" stroke="black" strokeWidth="4" strokeLinecap="round" /> },
    { id: 'tongue', render: () => (
      <g>
        <path d="M75,150 Q100,150 125,150" stroke="black" strokeWidth="3" />
        <path d="M90,150 Q100,175 110,150 Z" fill="#f43f5e" stroke="black" strokeWidth="1" />
      </g>
    )},
    { id: 'vampire', render: () => (
      <g>
        <path d="M70,150 Q100,170 130,150" fill="white" stroke="black" strokeWidth="2" />
        <path d="M80,150 L85,160 L90,150 Z" fill="white" stroke="black" strokeWidth="1" />
        <path d="M110,150 L115,160 L120,150 Z" fill="white" stroke="black" strokeWidth="1" />
      </g>
    )},
    { id: 'sad', render: () => <path d="M70,165 Q100,140 130,165" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" /> },
  ],
  extra: [
    { id: 'none', render: () => null },
    { id: 'blush', render: () => <g><circle cx="55" cy="130" r="10" fill="#f43f5e" fillOpacity="0.2" /><circle cx="145" cy="130" r="10" fill="#f43f5e" fillOpacity="0.2" /></g> },
    { id: 'bow', render: (c) => (
      <g transform="translate(140, 60) rotate(15)">
        <path d="M-15,-10 L15,10 L15,-10 L-15,10 Z" fill={c} stroke="black" strokeWidth="1" />
        <circle cx="0" cy="0" r="5" fill="black" />
      </g>
    )},
    { id: 'glasses', render: () => (
      <g fill="none" stroke="blue" strokeWidth="2">
        <circle cx="70" cy="105" r="22" /><circle cx="130" cy="105" r="22" />
        <line x1="92" y1="105" x2="108" y2="105" />
      </g>
    )},
    { id: 'mustache', render: () => <path d="M80,140 Q90,130 100,140 Q110,130 120,140 Q130,150 110,150 Q100,145 90,150 Q70,150 80,140 Z" fill="#422006" /> },
    { id: 'beard', render: (c) => <path d="M45,130 Q100,210 155,130 L150,140 Q100,200 50,140 Z" fill={c} opacity="0.8" /> },
    { id: 'crown', render: () => <path d="M60,40 L70,20 L100,40 L130,20 L140,40 L150,80 L50,80 Z" fill="gold" stroke="#ca8a04" strokeWidth="2" /> },
    { id: 'pirate', render: () => (
      <g>
        <circle cx="130" cy="105" r="18" fill="black" />
        <line x1="100" y1="70" x2="160" y2="140" stroke="black" strokeWidth="4" />
      </g>
    )},
  ]
};

interface FaceMakerProps {
  onComplete?: () => void;
}

export default function FaceMaker({ onComplete }: FaceMakerProps) {
  const [selections, setSelections] = useState({
    skin: FEATURES.skin[0].id,
    hair: FEATURES.hair[1].id,
    eyes: FEATURES.eyes[1].id,
    nose: FEATURES.nose[0].id,
    mouth: FEATURES.mouth[0].id,
    extra: FEATURES.extra[1].id,
  });

  const [colors, setColors] = useState({
    skin: SKIN_COLORS[0],
    hair: HAIR_COLORS[1],
    eyes: EYE_COLORS[0],
    extra: HAIR_COLORS[2],
  });

  const [activeCategory, setActiveCategory] = useState<CATEGORY>('skin');
  const [showSuccess, setShowSuccess] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const randomize = () => {
    const newSels = { ...selections };
    (Object.keys(FEATURES) as CATEGORY[]).forEach(cat => {
      const options = FEATURES[cat];
      newSels[cat] = options[Math.floor(Math.random() * options.length)].id;
    });
    setSelections(newSels);
    
    setColors({
      skin: SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)],
      hair: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
      eyes: EYE_COLORS[Math.floor(Math.random() * EYE_COLORS.length)],
      extra: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
    });
  };

  const download = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    const svgSize = svgRef.current.getBoundingClientRect();
    canvas.width = 800; // High res
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, 800, 800);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "mi-cara-magica.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    img.src = url;
  };

  const handleFinish = () => {
    setShowSuccess(true);
    onComplete?.();
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const currentOption = (cat: CATEGORY) => FEATURES[cat].find(f => f.id === selections[cat])!;

  return (
    <div className="h-full w-full bg-zinc-950 flex flex-col landscape:flex-row md:flex-row p-4 md:p-8 gap-4 md:gap-8 overflow-hidden relative">
      
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            key="face-maker-success-mask"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-xl pointer-events-none"
          >
            <div className="bg-white/10 p-12 rounded-[3rem] border border-white/20 flex flex-col items-center gap-6">
              <Sparkles className="text-yellow-400" size={80} />
              <h2 className="text-5xl font-black text-white font-comic">¡CARA GENIAL!</h2>
              <p className="text-xl text-zinc-400 font-comic">+25 PUNTOS</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PREVIEW AREA - Fixed/Sticky on mobile */}
      <div className="flex-shrink-0 w-full landscape:w-1/2 landscape:flex-1 md:flex-1 flex flex-col items-center justify-center gap-3 md:gap-6 py-2 md:py-4 bg-zinc-950 z-20">
        <motion.div 
          layout
          className="relative w-44 h-44 sm:w-64 sm:h-64 landscape:w-56 landscape:h-56 md:w-[400px] md:h-[400px] bg-zinc-900 rounded-[2rem] md:rounded-[3rem] border-4 border-white/5 shadow-2xl flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          
          <svg 
            ref={svgRef}
            viewBox="0 0 200 200" 
            className="w-full h-full drop-shadow-2xl"
          >
            <AnimatePresence mode="popLayout">
              <g key="face-base">
                {currentOption('skin').render(colors.skin)}
              </g>
              <g key="nose" className="opacity-80">
                {currentOption('nose').render('')}
              </g>
              <g key="eyes">
                {currentOption('eyes').render(colors.eyes)}
              </g>
              <g key="mouth">
                {currentOption('mouth').render('')}
              </g>
              <g key="hair">
                {currentOption('hair').render(colors.hair)}
              </g>
              <g key="extra">
                {currentOption('extra').render(colors.extra)}
              </g>
            </AnimatePresence>
          </svg>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={randomize}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 text-white rounded-lg border border-white/10 hover:bg-zinc-700 transition-colors font-bold text-xs md:text-sm"
          >
            <RefreshCw size={14} /> Aleatorio
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={download}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 text-white rounded-lg border border-white/10 hover:bg-zinc-700 transition-colors font-bold text-xs md:text-sm"
          >
            <Download size={14} /> Guardar
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFinish}
            className="flex items-center gap-1.5 px-5 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-xl font-bold text-xs md:text-sm"
          >
            <Camera size={14} /> ¡LISTO!
          </motion.button>
        </div>
      </div>

      {/* CONTROLS AREA - Scrollable */}
      <div className="w-full md:w-[400px] flex flex-col gap-6 bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-t-[2rem] md:rounded-[2.5rem] p-5 md:p-6 shadow-2xl overflow-y-auto flex-1">
        <h3 className="text-xl md:text-2xl font-black text-white font-comic flex items-center gap-3">
          <Sparkles className="text-yellow-400" /> ¡DISEÑA TU CARA!
        </h3>

        {/* Categories Tab */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-shrink-0">
          {(['skin', 'hair', 'eyes', 'mouth', 'extra'] as CATEGORY[]).map(cat => (
            <button
              key={`face-cat-tab-${cat}`}
              onClick={() => setActiveCategory(cat)}
              className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-all flex flex-col items-center gap-1 min-w-[64px] md:min-w-[70px] flex-shrink-0 ${activeCategory === cat ? 'bg-white text-zinc-950 scale-105 shadow-xl font-bold' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
            >
              <div className={activeCategory === cat ? 'text-zinc-950' : 'text-zinc-400'}>
                {cat === 'skin' && <User size={22} />}
                {cat === 'hair' && <Scissors size={22} />}
                {cat === 'eyes' && <Eye size={22} />}
                {cat === 'mouth' && <Smile size={22} />}
                {cat === 'extra' && <Sparkles size={22} />}
              </div>
              <span className="text-[9px] md:text-[10px] uppercase font-black">{cat === 'extra' ? 'extra' : cat}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto pr-1">
          {/* Colors selector (if applicable) */}
          {(activeCategory === 'skin' || activeCategory === 'hair' || activeCategory === 'eyes' || activeCategory === 'extra') && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Palette size={12} /> Color {activeCategory === 'skin' ? 'piel' : activeCategory === 'hair' ? 'pelo' : activeCategory === 'eyes' ? 'ojos' : 'detalle'}
              </span>
              <div className="flex flex-wrap gap-2">
                {(activeCategory === 'skin' ? SKIN_COLORS : activeCategory === 'hair' ? HAIR_COLORS : activeCategory === 'eyes' ? EYE_COLORS : HAIR_COLORS).map((c, cIdx) => (
                  <button
                    key={`face-color-${c}-${cIdx}`}
                    onClick={() => setColors({...colors, [activeCategory]: c})}
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-full border-4 transition-all ${colors[activeCategory as keyof typeof colors] === c ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Options Grid */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Estilo</span>
            <div className="grid grid-cols-3 gap-3">
              {FEATURES[activeCategory].map(opt => (
                <button
                  key={`face-opt-${activeCategory}-${opt.id}`}
                  onClick={() => setSelections({...selections, [activeCategory]: opt.id})}
                  className={`aspect-square rounded-xl md:rounded-2xl border-2 transition-all flex items-center justify-center p-2 ${selections[activeCategory] === opt.id ? 'bg-white border-white scale-105 shadow-xl' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                >
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {opt.render(activeCategory === 'skin' ? colors.skin : activeCategory === 'hair' ? colors.hair : activeCategory === 'eyes' ? colors.eyes : colors.extra || 'black')}
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
