import { motion } from 'motion/react';
import { Sparkles, ZoomIn, ZoomOut, Maximize, Map as MapIcon } from 'lucide-react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ItineraryData } from '../types';

interface SketchMapProps {
  itinerary: ItineraryData | null;
  setMapView: (view: 'sketch' | 'real') => void;
}

export const SketchMap = ({ itinerary, setMapView }: SketchMapProps) => {
  if (!itinerary?.routePoints || itinerary.routePoints.length === 0) return null;
  const points = itinerary.routePoints;
  
  // Normalize points to 0-100 range for SVG
  const lats = points.map(p => p.lat);
  const lngs = points.map(p => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  const latDiff = maxLat - minLat || 1;
  const lngDiff = maxLng - minLng || 1;
  
  const normalizedPoints = points.map((p, i) => ({
    x: 20 + ((p.lng - minLng) / lngDiff) * 160,
    y: 100 - ((p.lat - minLat) / latDiff) * 80, // Invert Y for SVG
    label: p.label,
    offsetDir: i % 2 === 0 ? -1 : 1 // Alternate above/below to reduce overlap
  }));

  return (
    <div className="relative w-full aspect-video bg-[#F9F7F2] rounded-3xl border-2 border-stone-200 overflow-hidden shadow-sm group">
      <TransformWrapper
        initialScale={1}
        initialPositionX={0}
        initialPositionY={0}
        minScale={0.5}
        maxScale={20}
      >
        {(context: any) => {
          const { zoomIn, zoomOut, resetTransform, state } = context;
          return (
            <>
              <div className="absolute top-4 left-6 z-10 font-hand text-stone-400 text-sm flex items-center gap-2 pointer-events-none">
                <Sparkles size={14} /> 路线手绘草图 (支持缩放和平移)
              </div>
              
              <div className="absolute top-4 right-6 z-10 flex gap-2">
                <button onClick={() => zoomIn()} className="p-2 bg-white/80 backdrop-blur-sm rounded-lg border border-stone-200 text-stone-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                  <ZoomIn size={16} />
                </button>
                <button onClick={() => zoomOut()} className="p-2 bg-white/80 backdrop-blur-sm rounded-lg border border-stone-200 text-stone-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                  <ZoomOut size={16} />
                </button>
                <button onClick={() => resetTransform()} className="p-2 bg-white/80 backdrop-blur-sm rounded-lg border border-stone-200 text-stone-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                  <Maximize size={16} />
                </button>
              </div>

              <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%" }}>
                <div className="w-full h-full p-12">
                  {/* Paper texture effect */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                  
                  <svg className="w-full h-full" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <filter id="handdrawn" x="-10%" y="-10%" width="120%" height="120%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
                      </filter>
                    </defs>
                    
                    {/* Path */}
                    <motion.path
                      d={`M ${normalizedPoints.map(p => `${p.x},${p.y}`).join(' L ')}`}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth={1.5 / state.scale}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={`${4 / state.scale},${4 / state.scale}`}
                      filter="url(#handdrawn)"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    />
                    
                    {/* Points */}
                    {normalizedPoints.map((p, i) => (
                      <g key={i} className="filter drop-shadow-sm">
                        <motion.circle 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.2 }}
                          cx={p.x} cy={p.y} r={2.5 / state.scale} 
                          fill="#065F46" 
                        />
                        <motion.text 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.2 + 0.5 }}
                          x={p.x} 
                          y={p.y + (p.offsetDir * (6 / state.scale))} 
                          fontSize={4.5 / state.scale} 
                          className="font-hand fill-stone-800 font-bold"
                          textAnchor="middle"
                          style={{ 
                            paintOrder: 'stroke',
                            stroke: 'white',
                            strokeWidth: `${1 / state.scale}px`,
                            pointerEvents: 'none'
                          }}
                        >
                          {p.label}
                        </motion.text>
                      </g>
                    ))}
                  </svg>
                </div>
              </TransformComponent>
              
              <div 
                onClick={() => setMapView('real')}
                className="absolute bottom-4 right-6 z-10 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-stone-200 text-[10px] font-bold text-stone-500 flex items-center gap-1.5 shadow-sm cursor-pointer hover:bg-emerald-600 hover:text-white transition-all"
              >
                <MapIcon size={12} /> 切换至卫星/街道地图
              </div>
            </>
          );
        }}
      </TransformWrapper>
    </div>
  );
};
