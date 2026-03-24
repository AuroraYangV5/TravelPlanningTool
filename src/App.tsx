/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Utensils, 
  Info, 
  Send, 
  ChevronRight, 
  Sun, 
  Waves, 
  Compass,
  Sparkles,
  Loader2,
  X,
  Calendar,
  Wallet,
  Target,
  ArrowRight,
  RefreshCw,
  Download,
  Map as MapIcon,
  Hotel,
  Bus,
  AlertCircle,
  Save,
  History,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize
} from 'lucide-react';
import Markdown from 'react-markdown';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

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

interface ItineraryNode {
  day: number;
  time: string;
  activity: string;
  location: string;
  transport: string;
  dining: { restaurant: string; dishes: string[] };
  cost: number;
  description: string;
}

interface ItineraryData {
  title: string;
  accommodation: { name: string; area: string; price: string };
  nodes: ItineraryNode[];
  totalBudget: number;
  routePoints: { lat: number; lng: number; label: string }[];
}

export default function App() {
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState('');
  const [purpose, setPurpose] = useState('');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [mapView, setMapView] = useState<'sketch' | 'real'>('sketch');
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [savedItineraries, setSavedItineraries] = useState<ItineraryData[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('saved_itineraries');
    if (saved) {
      try {
        setSavedItineraries(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved itineraries", e);
      }
    }
  }, []);

  const saveCurrentItinerary = () => {
    if (!itinerary) return;
    const newSaved = [itinerary, ...savedItineraries.filter(i => i.title !== itinerary.title)];
    setSavedItineraries(newSaved);
    localStorage.setItem('saved_itineraries', JSON.stringify(newSaved));
  };

  const deleteSavedItinerary = (title: string) => {
    const newSaved = savedItineraries.filter(i => i.title !== title);
    setSavedItineraries(newSaved);
    localStorage.setItem('saved_itineraries', JSON.stringify(newSaved));
  };
  
  // AI Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const generateItinerary = async () => {
    if (!destination.trim()) return;
    setIsGenerating(true);
    setError(null);
    setStep(5); // Loading/Result step

    try {
      const prompt = `
        作为一个专业的旅游规划师，请为我生成一份详细的旅游攻略。
        目的地: ${destination}
        目的: ${purpose || '休闲'}
        天数: ${days}天
        预算范围: ${budget || '适中'}
        
        特别要求：
        1. 如果目的是“特种兵旅行”，请安排极高密度的行程，每天打卡更多的景点（至少5-6个时间点），并优化路线。
        2. 必须考虑景点间的地理距离，将地理位置接近的景区安排在同一天或相邻时间段，以减少交通时间，最大化游玩效率。
        3. 路线必须逻辑连贯，不走回头路。
        
        请返回JSON格式的数据，包含以下字段：
        - title: 攻略标题
        - accommodation: { name: 酒店名称, area: 所在区域, price: 大概价格 }
        - nodes: 数组，每个对象包含 { day: 天数, time: 时间点, activity: 活动名称, location: 地点, transport: 交通工具, dining: { restaurant: 餐厅名, dishes: [推荐菜1, 推荐菜2] }, cost: 预估开销(数字), description: 简单描述 }
        - totalBudget: 总预估开销
        - routePoints: 数组，包含 { lat: 真实的纬度(数字), lng: 真实的经度(数字), label: 地点名称 } 用于在地图上绘制路线。请务必提供真实的地理坐标。
        
        注意：请保持描述简洁有力，避免生成过长的文本导致数据截断。对于每一天，根据目的提供合适数量的活动（特种兵旅行应提供更多）。
      `;

      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "生成攻略时遇到错误，请稍后重试。");
      }

      const result = await response.json();
      const text = result.text;
      if (!text) throw new Error("AI 未能生成内容，请重试。");

      try {
        const data = JSON.parse(text);
        setItinerary(data);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "Raw Text:", text);
        throw new Error("生成的数据格式有误，请尝试重新生成。");
      }
    } catch (err: any) {
      console.error("Generation Error:", err);
      setError(err.message || "生成攻略时遇到错误，请稍后重试。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: chatHistory,
          systemInstruction: `你是一个专业的旅游助手。当前用户正在规划前往 ${destination || '未知目的地'} 的旅行。请提供专业的建议。`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "抱歉，我遇到了一些问题。");
      }

      const result = await response.json();
      setChatHistory(prev => [...prev, { role: 'model', text: result.text }]);
    } catch (error: any) {
      setChatHistory(prev => [...prev, { role: 'model', text: error.message || "抱歉，我遇到了一些问题。" }]);
    } finally {
      setIsTyping(false);
    }
  };

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
    <div className="min-h-screen flex flex-col md:flex-row bg-stone-50">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-20 lg:w-64 bg-white border-b md:border-b-0 md:border-r border-stone-200 flex flex-col z-20 shrink-0">
        <div className="p-4 md:p-6 flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Compass size={24} />
            </div>
            <span className="font-serif text-xl font-bold text-emerald-900 tracking-tight">你的旅游助手</span>
          </div>
        </div>

        <div className="px-4 py-2 md:px-3 md:py-4 flex md:flex-col gap-2 overflow-x-auto no-scrollbar border-t md:border-t-0 border-stone-100">
          <div className="hidden lg:block px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-stone-400">
            规划进度
          </div>
          <div className="flex md:flex-col gap-2 w-full">
            {[
              { id: 1, label: '目的地', icon: MapPin },
              { id: 2, label: '目的', icon: Target },
              { id: 3, label: '天数', icon: Calendar },
              { id: 4, label: '预算', icon: Wallet }
            ].map((s) => (
              <div
                key={s.id}
                onClick={() => step > s.id && setStep(s.id)}
                className={`flex items-center gap-1.5 md:gap-3 px-2 md:px-4 py-1.5 md:py-3 rounded-xl transition-all duration-200 whitespace-nowrap flex-1 md:flex-none cursor-pointer ${
                  step === s.id 
                    ? 'bg-emerald-50 text-emerald-700 font-medium' 
                    : step > s.id ? 'text-emerald-600 opacity-60 hover:bg-emerald-50/50' : 'text-stone-300'
                }`}
              >
                <s.icon size={14} className="shrink-0 md:size-[18px]" />
                <span className="text-[10px] md:text-sm lg:text-base">{s.label}</span>
                {step > s.id && <ChevronRight size={14} className="ml-auto hidden lg:block" />}
              </div>
            ))}
            
            <div className="hidden md:block h-px bg-stone-100 my-2 mx-4" />
            
            <button
              onClick={() => setShowSaved(!showSaved)}
              className={`flex items-center gap-1.5 md:gap-3 px-2 md:px-4 py-1.5 md:py-3 rounded-xl transition-all duration-200 whitespace-nowrap flex-1 md:flex-none ${
                showSaved 
                  ? 'bg-stone-900 text-white' 
                  : 'text-stone-500 hover:bg-stone-100'
              }`}
            >
              <History size={14} className="shrink-0 md:size-[18px]" />
              <span className="text-[10px] md:text-sm lg:text-base">历史攻略</span>
              {savedItineraries.length > 0 && (
                <span className="ml-auto bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {savedItineraries.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="p-4 hidden lg:block mt-auto">
          <div className="bg-stone-900 rounded-2xl p-4 text-white">
            <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold mb-2">灵感发现</p>
            <p className="text-sm leading-relaxed opacity-80 italic font-serif">
              "旅行不是为了逃避生活，而是为了不让生活逃避我们。"
            </p>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen relative">
        <div className="max-w-4xl mx-auto p-4 md:p-12 min-h-full flex flex-col">
          <AnimatePresence mode="wait">
            {showSaved ? (
              <motion.div
                key="saved"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col w-full"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-serif font-bold text-stone-900">我的<span className="text-emerald-600 italic">收藏</span></h2>
                  <button 
                    onClick={() => setShowSaved(false)}
                    className="text-stone-400 hover:text-stone-600 flex items-center gap-1 text-sm"
                  >
                    返回规划 <X size={16} />
                  </button>
                </div>
                
                {savedItineraries.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-stone-200">
                    <History size={48} className="text-stone-200 mb-4" />
                    <p className="text-stone-400">暂无收藏的攻略</p>
                    <button 
                      onClick={() => setShowSaved(false)}
                      className="mt-4 text-emerald-600 font-bold hover:underline"
                    >
                      去规划一个吧
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {savedItineraries.map((saved, idx) => (
                      <div 
                        key={idx}
                        className="bg-white p-6 rounded-2xl border-2 border-stone-100 shadow-sm hover:border-emerald-500 transition-all group relative"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-serif font-bold text-stone-800 mb-1">{saved.title}</h3>
                            <div className="flex items-center gap-4 text-xs text-stone-400">
                              <span className="flex items-center gap-1"><MapPin size={12} /> {saved.accommodation.area}</span>
                              <span className="flex items-center gap-1"><Calendar size={12} /> {saved.nodes.length / 3}天行程</span>
                              <span className="flex items-center gap-1"><Wallet size={12} /> 预算 ¥{saved.totalBudget}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => { setItinerary(saved); setStep(5); setShowSaved(false); }}
                              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all"
                            >
                              查看详情
                            </button>
                            <button 
                              onClick={() => deleteSavedItinerary(saved.title)}
                              className="p-2 text-stone-300 hover:text-red-500 transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-2 overflow-hidden">
                          {(saved.routePoints || []).slice(0, 4).map((p, i) => (
                            <span key={i} className="text-[10px] bg-stone-50 px-2 py-1 rounded-md text-stone-500 whitespace-nowrap">
                              {p.label}
                            </span>
                          ))}
                          {saved.routePoints.length > 4 && <span className="text-[10px] text-stone-300">...</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <>
                {/* Step 1: Destination */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full"
              >
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-4">
                  你想去<span className="text-emerald-600 italic underline decoration-emerald-200 underline-offset-8">哪里</span>？
                </h1>
                <p className="text-stone-500 mb-8">输入一个城市，或者多个城市的组合（如：三亚，或者 重庆-成都-西安）</p>
                <div className="relative group">
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="例如：三亚 或 苏州-南京"
                    className="w-full text-2xl font-serif bg-white border-2 border-stone-200 rounded-2xl px-6 py-5 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50/50 outline-none transition-all"
                  />
                  <button
                    onClick={() => destination.trim() && setStep(2)}
                    disabled={!destination.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 disabled:opacity-30 transition-all shadow-lg shadow-emerald-200"
                  >
                    <ArrowRight size={24} />
                  </button>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {['三亚', '苏州-南京', '重庆-成都', '西安-洛阳'].map(t => (
                    <button 
                      key={t} 
                      onClick={() => setDestination(t)}
                      className="text-xs font-medium px-3 py-1.5 bg-stone-100 text-stone-500 rounded-full hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Purpose */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full"
              >
                <h2 className="text-4xl font-serif font-bold text-stone-900 mb-4">旅行的<span className="text-emerald-600 italic">目的</span>是？</h2>
                <p className="text-stone-500 mb-8">这能帮我们更好地为你推荐活动（可选）</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { p: '休闲度假', d: '慢节奏，远离尘嚣，享受宁静的假期时光' },
                    { p: '特种兵旅行', d: '高效率，日行万步，打卡城市每一个角落' },
                    { p: '深度文化', d: '寻访古迹，听历史回响，感受当地民俗风情' },
                    { p: '浪漫蜜月', d: '精致浪漫，在唯美风景中留下永恒甜蜜回忆' },
                    { p: '亲子研学', d: '寓教于乐，大手牵小手，共度温馨成长时光' },
                    { p: '户外徒步', d: '挑战极限，穿越山海，亲近最原始的自然' }
                  ].map(item => (
                    <button
                      key={item.p}
                      onClick={() => { setPurpose(item.p); setStep(3); }}
                      className={`p-6 rounded-2xl border-2 text-left transition-all ${
                        purpose === item.p 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                          : 'border-stone-100 bg-white hover:border-stone-200'
                      }`}
                    >
                      <div className="font-bold mb-1">{item.p}</div>
                      <div className="text-xs opacity-60">
                        {item.d}
                      </div>
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setStep(3)}
                  className="mt-8 text-stone-400 hover:text-stone-600 text-sm font-medium flex items-center gap-1 mx-auto"
                >
                  跳过此步 <ChevronRight size={14} />
                </button>
              </motion.div>
            )}

            {/* Step 3: Duration */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full"
              >
                <h2 className="text-4xl font-serif font-bold text-stone-900 mb-4">计划玩<span className="text-emerald-600 italic">多久</span>？</h2>
                <div className="bg-white p-8 rounded-3xl border-2 border-stone-100 shadow-sm mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-5xl font-serif font-bold text-emerald-600">{days}</span>
                    <span className="text-xl text-stone-400 font-serif">天</span>
                    <input 
                      type="range" 
                      min="1" 
                      max="15" 
                      value={days} 
                      onChange={(e) => setDays(parseInt(e.target.value))}
                      className="flex-1 mx-8 accent-emerald-600"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { l: '3天2晚', v: 3 },
                      { l: '5天4晚', v: 5 },
                      { l: '7天6晚', v: 7 }
                    ].map(preset => (
                      <button
                        key={preset.v}
                        onClick={() => setDays(preset.v)}
                        className={`py-3 rounded-xl text-sm font-bold transition-all ${
                          days === preset.v 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                        }`}
                      >
                        {preset.l}
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => setStep(4)}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                >
                  下一步
                </button>
              </motion.div>
            )}

            {/* Step 4: Budget */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full"
              >
                <h2 className="text-4xl font-serif font-bold text-stone-900 mb-4">你的<span className="text-emerald-600 italic">预算</span>范围？</h2>
                <p className="text-stone-500 mb-8">我们会根据预算调整酒店和餐饮推荐（可选）</p>
                <div className="space-y-3">
                  {[
                    { l: '经济实惠', d: '穷游党，注重性价比', v: 'economy' },
                    { l: '舒适品质', d: '中端消费，平衡体验与价格', v: 'comfort' },
                    { l: '高端奢华', d: '享受型，顶级酒店与米其林', v: 'luxury' }
                  ].map(b => (
                    <button
                      key={b.v}
                      onClick={() => { setBudget(b.l); generateItinerary(); }}
                      className="w-full p-6 rounded-2xl border-2 border-stone-100 bg-white text-left hover:border-emerald-500 hover:bg-emerald-50 group transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-lg group-hover:text-emerald-700">{b.l}</div>
                          <div className="text-sm text-stone-400">{b.d}</div>
                        </div>
                        <ChevronRight className="text-stone-300 group-hover:text-emerald-500" />
                      </div>
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => generateItinerary()}
                  className="mt-8 text-stone-400 hover:text-stone-600 text-sm font-medium flex items-center gap-1 mx-auto"
                >
                  直接生成攻略 <ChevronRight size={14} />
                </button>
              </motion.div>
            )}

            {/* Step 5: Result / Loading */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8 pb-20"
              >
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-6">
                    <div className="relative mb-4">
                      <Loader2 className="animate-spin text-emerald-600" size={64} />
                      <Sparkles className="absolute -top-6 -right-6 text-yellow-400 animate-pulse" size={32} />
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-serif font-bold text-stone-800">正在为你定制专属攻略...</h3>
                      <p className="text-stone-500 mt-2">AI 正在规划路线、筛选酒店和寻找地道美食</p>
                      <div className="mt-4 flex flex-col gap-1 text-[10px] text-stone-400 uppercase tracking-widest">
                        <span>正在优化地理位置分布...</span>
                        <span>正在计算最佳打卡顺序...</span>
                      </div>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-6">
                    <div className="p-8 bg-red-50 rounded-3xl border border-red-100 text-center max-w-md shadow-sm">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="text-red-600" size={32} />
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-red-900 mb-3">生成失败</h3>
                      <p className="text-red-700 text-sm mb-8 leading-relaxed">{error}</p>
                      <div className="flex flex-col gap-3">
                        <button 
                          onClick={() => generateItinerary()}
                          className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200"
                        >
                          <RefreshCw size={18} /> 尝试重新生成
                        </button>
                        <button 
                          onClick={() => setStep(1)}
                          className="w-full py-4 bg-white text-stone-600 border border-stone-200 rounded-xl font-bold hover:bg-stone-50 transition-all"
                        >
                          返回第一步
                        </button>
                      </div>
                    </div>
                  </div>
                ) : itinerary ? (
                  <div className="space-y-12">
                    <header className="relative">
                      <div className="absolute -top-12 -left-12 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl -z-10" />
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                        <div>
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-widest block w-fit mb-4">
                            定制攻略已生成
                          </span>
                          <h1 className="text-5xl font-serif font-bold text-stone-900 leading-tight">
                            {itinerary.title}
                          </h1>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={saveCurrentItinerary}
                            className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-200"
                          >
                            <Save size={18} />
                            {savedItineraries.some(i => i.title === itinerary.title) ? '已保存' : '保存攻略'}
                          </button>
                          <button 
                            onClick={() => setStep(1)}
                            className="flex items-center gap-2 bg-white text-stone-600 border-2 border-stone-100 px-6 py-3 rounded-2xl font-bold hover:bg-stone-50 transition-all"
                          >
                            <RefreshCw size={18} />
                            重新规划
                          </button>
                        </div>
                      </div>
                      <div className="mt-6 flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-stone-100 shadow-sm">
                          <MapPin size={16} className="text-emerald-600" />
                          <span className="text-sm font-medium">{destination}</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-stone-100 shadow-sm">
                          <Calendar size={16} className="text-emerald-600" />
                          <span className="text-sm font-medium">{days} 天</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-stone-100 shadow-sm">
                          <Wallet size={16} className="text-emerald-600" />
                          <span className="text-sm font-medium">预估: ¥{itinerary.totalBudget}</span>
                        </div>
                      </div>
                    </header>

                    {/* Hand-drawn Map Section */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <MapIcon className="text-emerald-600" size={24} />
                        <h2 className="text-2xl font-serif font-bold">路线地图</h2>
                      </div>
                      {mapView === 'sketch' ? renderSketchMap() : renderRealMap()}
                    </section>

                    {/* Accommodation Section */}
                    <section className="bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <Hotel size={24} className="text-emerald-400" />
                            <h2 className="text-2xl font-serif font-bold">推荐住宿</h2>
                          </div>
                          <h3 className="text-xl font-bold mb-1">{itinerary.accommodation.name}</h3>
                          <p className="opacity-70 text-sm mb-4">{itinerary.accommodation.area}</p>
                          <div className="text-2xl font-serif font-bold text-emerald-400">{itinerary.accommodation.price}</div>
                        </div>
                        <div className="hidden md:block w-32 h-32 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
                          <Hotel size={48} className="opacity-20" />
                        </div>
                      </div>
                    </section>

                    {/* Itinerary Timeline */}
                    <section className="space-y-8">
                      <div className="flex items-center gap-2 mb-6">
                        <Compass className="text-emerald-600" size={24} />
                        <h2 className="text-2xl font-serif font-bold">详细行程</h2>
                      </div>
                      
                      <div className="relative space-y-12 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                        {(itinerary.nodes || []).map((node, idx) => (
                          <div key={idx} className="relative pl-12">
                            <div className="absolute left-0 top-1 w-10 h-10 bg-white border-2 border-emerald-600 rounded-full flex items-center justify-center z-10 shadow-sm">
                              <span className="text-xs font-bold text-emerald-600">{node.day}</span>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-bold text-stone-400 uppercase tracking-widest">{node.time}</span>
                                  <h3 className="text-xl font-bold">{node.activity}</h3>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-stone-50 rounded-full text-[10px] font-bold text-stone-500">
                                  <Bus size={12} /> {node.transport}
                                </div>
                              </div>
                              <p className="text-stone-600 text-sm mb-6 leading-relaxed">{node.description}</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-stone-50 p-4 rounded-2xl">
                                  <div className="flex items-center gap-2 mb-2 text-emerald-700">
                                    <Utensils size={14} />
                                    <span className="text-xs font-bold uppercase tracking-wider">推荐餐饮</span>
                                  </div>
                                  <div className="font-bold text-sm mb-1">{node.dining?.restaurant || '--'}</div>
                                  <div className="flex flex-wrap gap-1">
                                    {(node.dining?.dishes || []).map(d => (
                                      <span key={d} className="text-[10px] bg-white px-2 py-0.5 rounded-md text-stone-500 border border-stone-100">{d}</span>
                                    ))}
                                  </div>
                                </div>
                                <div className="bg-stone-50 p-4 rounded-2xl flex flex-col justify-center">
                                  <div className="flex items-center gap-2 mb-1 text-stone-400">
                                    <Wallet size={14} />
                                    <span className="text-xs font-bold uppercase tracking-wider">预估开销</span>
                                  </div>
                                  <div className="text-lg font-serif font-bold text-stone-700">¥{node.cost}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <p className="text-stone-400">生成失败，请重试。</p>
                    <div className="flex flex-col gap-3 mt-4 max-w-xs mx-auto">
                      <button 
                        onClick={() => generateItinerary()} 
                        className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                      >
                        <RefreshCw size={18} /> 尝试重新生成
                      </button>
                      <button 
                        onClick={() => setStep(1)} 
                        className="w-full py-4 bg-white text-stone-600 border border-stone-200 rounded-xl font-bold hover:bg-stone-50 transition-all"
                      >
                        返回第一步
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
        </div>
      </main>

      {/* AI Assistant Panel (Desktop) / Floating Button (Mobile) */}
      <aside className="hidden md:flex w-full md:w-80 lg:w-96 bg-white border-l border-stone-200 flex-col h-screen">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-emerald-600" size={20} />
            <h2 className="font-bold">AI 旅游助手</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.length === 0 && (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4">
                <Compass size={32} />
              </div>
              <h3 className="font-bold text-stone-800 mb-2">有什么我可以帮你的？</h3>
              <p className="text-stone-500 text-sm">你可以问我关于景点门票、路线微调或当地隐藏美食的问题。</p>
            </div>
          )}
          
          { (chatHistory || []).map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-none' 
                  : 'bg-stone-100 text-stone-800 rounded-tl-none shadow-sm'
              }`}>
                <div className="markdown-body">
                  <Markdown>{msg.text}</Markdown>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-stone-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                <Loader2 className="animate-spin text-emerald-600" size={16} />
                <span className="text-xs text-stone-500">正在思考...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-stone-100">
          <div className="relative">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChat()}
              placeholder="问问 AI 助手..."
              className="w-full bg-stone-100 border-none rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
            />
            <button 
              onClick={handleChat}
              disabled={!chatInput.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-[10px] text-stone-400 mt-2 text-center">由 豆包大模型 提供支持</p>
        </div>
      </aside>

      {/* Mobile AI Assistant Floating Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="md:hidden fixed bottom-6 left-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 hover:scale-110 transition-transform"
      >
        <Sparkles size={24} />
      </button>

      {/* Mobile AI Assistant Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden fixed inset-0 bg-white z-50 flex flex-col"
          >
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <Sparkles className="text-emerald-600" size={20} />
                <h2 className="font-bold">AI 旅游助手</h2>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.length === 0 && (
                <div className="text-center py-12 px-6">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4">
                    <Compass size={32} />
                  </div>
                  <h3 className="font-bold text-stone-800 mb-2">有什么我可以帮你的？</h3>
                  <p className="text-stone-500 text-sm">你可以问我关于景点门票、路线微调或当地隐藏美食的问题。</p>
                </div>
              )}
              
              { (chatHistory || []).map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                      : 'bg-stone-100 text-stone-800 rounded-tl-none shadow-sm'
                  }`}>
                    <div className="markdown-body">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-stone-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <Loader2 className="animate-spin text-emerald-600" size={16} />
                    <span className="text-xs text-stone-500">正在思考...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-stone-100 pb-8">
              <div className="relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                  placeholder="问问 AI 助手..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pr-12 text-sm focus:border-emerald-500 outline-none transition-all"
                />
                <button
                  onClick={handleChat}
                  disabled={!chatInput.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-emerald-600 disabled:opacity-30"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
