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
  AlertCircle
} from 'lucide-react';
import Markdown from 'react-markdown';

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
  routePoints: { x: number; y: number; label: string }[];
}

export default function App() {
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState('');
  const [purpose, setPurpose] = useState('');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
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
        
        请返回JSON格式的数据，包含以下字段：
        - title: 攻略标题
        - accommodation: { name: 酒店名称, area: 所在区域, price: 大概价格 }
        - nodes: 数组，每个对象包含 { day: 天数, time: 时间点, activity: 活动名称, location: 地点, transport: 交通工具, dining: { restaurant: 餐厅名, dishes: [推荐菜1, 推荐菜2] }, cost: 预估开销(数字), description: 简单描述 }
        - totalBudget: 总预估开销
        - routePoints: 数组，包含 { x: 0-100之间的坐标, y: 0-100之间的坐标, label: 地点名称 } 用于绘制手绘路线图。
        
        注意：请保持描述简洁有力，避免生成过长的文本导致数据截断。对于每一天，提供3-4个关键时间点的活动即可。
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

  const renderHandDrawnMap = () => {
    if (!itinerary?.routePoints) return null;
    const points = itinerary.routePoints;
    
    return (
      <div className="relative w-full aspect-video bg-stone-100 rounded-3xl border-2 border-dashed border-stone-300 overflow-hidden p-8">
        <div className="absolute top-4 left-4 font-hand text-stone-400 text-sm">手绘路线草图</div>
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Draw Path */}
          <motion.path
            d={`M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`}
            fill="none"
            stroke="#059669"
            strokeWidth="0.5"
            strokeDasharray="2,2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          {/* Draw Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="1.5" fill="#059669" />
              <text 
                x={p.x} 
                y={p.y - 3} 
                fontSize="3" 
                className="font-hand fill-stone-600"
                textAnchor="middle"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
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
            <span className="font-serif text-xl font-bold text-emerald-900 tracking-tight">定制旅游助手</span>
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
                className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all duration-200 whitespace-nowrap flex-1 md:flex-none ${
                  step === s.id 
                    ? 'bg-emerald-50 text-emerald-700 font-medium' 
                    : step > s.id ? 'text-emerald-600 opacity-60' : 'text-stone-300'
                }`}
              >
                <s.icon size={18} className="shrink-0" />
                <span className="text-xs md:text-sm lg:text-base">{s.label}</span>
                {step > s.id && <ChevronRight size={14} className="ml-auto hidden lg:block" />}
              </div>
            ))}
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
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-widest">
                          定制攻略已生成
                        </span>
                        <button 
                          onClick={() => setStep(1)}
                          className="text-stone-400 hover:text-emerald-600 flex items-center gap-1 text-xs font-medium"
                        >
                          <RefreshCw size={14} /> 重新规划
                        </button>
                      </div>
                      <h1 className="text-5xl font-serif font-bold text-stone-900 leading-tight">
                        {itinerary.title}
                      </h1>
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
                      {renderHandDrawnMap()}
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
                        {itinerary.nodes.map((node, idx) => (
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
                                  <div className="font-bold text-sm mb-1">{node.dining.restaurant}</div>
                                  <div className="flex flex-wrap gap-1">
                                    {node.dining.dishes.map(d => (
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
          
          {chatHistory.map((msg, idx) => (
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
              
              {chatHistory.map((msg, idx) => (
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
