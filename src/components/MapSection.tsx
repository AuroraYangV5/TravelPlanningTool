import { motion } from 'motion/react';
import { 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Map as MapIcon,
  Star
} from 'lucide-react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ItineraryData, MapPoint } from '../types';

interface MapSectionProps {
  itinerary: ItineraryData;
}

const SketchMap = ({ points, cityName }: { points: MapPoint[], cityName: string }) => {
  if (!points || points.length === 0) return null;
  
  const lats = points.map(p => p.lat);
  const lngs = points.map(p => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  const latDiff = maxLat - minLat || 0.01;
  const lngDiff = maxLng - minLng || 0.01;
  
  const normalize = (p: MapPoint) => ({
    x: 20 + ((p.lng - minLng) / lngDiff) * 160,
    y: 100 - ((p.lat - minLat) / latDiff) * 80,
    label: p.label
  });

  const normalizedPoints = points.map((p, i) => ({
    ...normalize(p),
    offsetDir: i % 2 === 0 ? -1 : 1
  }));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-4">
        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
        <h3 className="text-lg font-bold text-stone-700">{cityName} 手绘地图</h3>
      </div>
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
                        strokeWidth={1.5 / (state?.scale || 1)}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray={`${4 / (state?.scale || 1)},${4 / (state?.scale || 1)}`}
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
                            cx={p.x} cy={p.y} r={2.5 / (state?.scale || 1)} 
                            fill="#065F46" 
                          />
                          <motion.text 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.2 + 0.5 }}
                            x={p.x} 
                            y={p.y + (p.offsetDir * (6 / (state?.scale || 1)))} 
                            fontSize={4.5 / (state?.scale || 1)} 
                            className="font-hand fill-stone-800 font-bold"
                            textAnchor="middle"
                            style={{ 
                              paintOrder: 'stroke',
                              stroke: 'white',
                              strokeWidth: `${1 / (state?.scale || 1)}px`,
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
              </>
            );
          }}
        </TransformWrapper>
      </div>
    </div>
  );
};

export const MapSection = ({ itinerary }: MapSectionProps) => {
  const cities = itinerary.cities || [];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <MapIcon className="text-emerald-600" size={24} />
          <h2 className="text-2xl font-serif font-bold">路线地图</h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        {cities.length > 0 ? (
          cities.map((city, idx) => (
            <SketchMap 
              key={idx} 
              cityName={city.cityName} 
              points={city.routePoints} 
            />
          ))
        ) : (
          <div className="bg-stone-50 rounded-3xl p-12 text-center border-2 border-dashed border-stone-200">
            <p className="text-stone-400 text-sm">暂无地图数据</p>
          </div>
        )}
      </div>
    </section>
  );
};
