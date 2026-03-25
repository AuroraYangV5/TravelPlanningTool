import { useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Map as MapIcon 
} from 'lucide-react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ItineraryData } from '../types';

// Fix Leaflet marker icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface MapSectionProps {
  itinerary: ItineraryData;
  mapView: 'sketch' | 'real';
  setMapView: (view: 'sketch' | 'real') => void;
}

const MapBoundsAdjuster = ({ points }: { points: { lat: number; lng: number }[] }) => {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);
  return null;
};

export const MapSection = ({ itinerary, mapView, setMapView }: MapSectionProps) => {
  const renderSketchMap = () => {
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

  const renderRealMap = () => {
    if (!itinerary?.routePoints || itinerary.routePoints.length === 0) return null;
    const points = itinerary.routePoints;
    const polylinePositions = points.map(p => [p.lat, p.lng] as [number, number]);
    
    // Custom Marker Icon
    const customIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-8 h-8 bg-emerald-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white">
               <div class="w-2 h-2 bg-white rounded-full"></div>
             </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
    
    return (
      <div className="relative w-full aspect-video bg-stone-100 rounded-3xl border-2 border-stone-200 overflow-hidden shadow-inner z-0 group">
        <MapContainer 
          center={[points[0].lat, points[0].lng]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((p, i) => (
            <Marker key={i} position={[p.lat, p.lng]} icon={customIcon}>
              <Popup>
                <div className="font-sans p-1">
                  <p className="font-bold text-emerald-700 text-sm">{p.label}</p>
                </div>
              </Popup>
            </Marker>
          ))}
          <Polyline positions={polylinePositions} color="#059669" weight={4} opacity={0.6} dashArray="10, 10" />
          <MapBoundsAdjuster points={points} />
        </MapContainer>
        
        <button 
          onClick={() => setMapView('sketch')}
          className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 flex items-center gap-2 shadow-lg hover:bg-emerald-600 hover:text-white transition-all"
        >
          <Sparkles size={14} /> 返回手绘视图
        </button>
      </div>
    );
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MapIcon className="text-emerald-600" size={24} />
        <h2 className="text-2xl font-serif font-bold">路线地图</h2>
      </div>
      {mapView === 'sketch' ? renderSketchMap() : renderRealMap()}
    </section>
  );
};
