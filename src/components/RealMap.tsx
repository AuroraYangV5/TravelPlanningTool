import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Map as MapIcon } from 'lucide-react';
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

interface RealMapProps {
  itinerary: ItineraryData | null;
  setMapView: (view: 'sketch' | 'real') => void;
}

const MapAutoFit = ({ points }: { points: { lat: number; lng: number }[] }) => {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);
  return null;
};

export const RealMap = ({ itinerary, setMapView }: RealMapProps) => {
  if (!itinerary?.routePoints || itinerary.routePoints.length === 0) return null;
  const points = itinerary.routePoints;
  const polylinePositions = points.map(p => [p.lat, p.lng] as [number, number]);
  
  // Custom Marker Icon
  const customIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="w-8 h-8 bg-emerald-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">📍</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  return (
    <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-2 border-stone-200 shadow-sm">
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
        <MapAutoFit points={points} />
        {points.map((p, i) => (
          <Marker key={i} position={[p.lat, p.lng]} icon={customIcon}>
            <Popup>
              <div className="font-bold text-emerald-700">{p.label}</div>
            </Popup>
          </Marker>
        ))}
        <Polyline 
          positions={polylinePositions} 
          color="#10B981" 
          weight={4} 
          opacity={0.6} 
          dashArray="10, 10"
        />
      </MapContainer>
      
      <div 
        onClick={() => setMapView('sketch')}
        className="absolute bottom-4 right-6 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-stone-200 text-[10px] font-bold text-stone-500 flex items-center gap-1.5 shadow-sm cursor-pointer hover:bg-emerald-600 hover:text-white transition-all"
      >
        <MapIcon size={12} /> 切换至手绘草图
      </div>
    </div>
  );
};
