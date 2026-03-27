import { motion } from 'motion/react';
import { 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  RefreshCw, 
  Save, 
  MapPin, 
  Calendar, 
  Wallet, 
  Hotel, 
  Compass, 
  Bus, 
  Utensils 
} from 'lucide-react';
import { ItineraryData } from '../types';
import { MapSection } from './MapSection';

interface ItineraryResultProps {
  isGenerating: boolean;
  error: string | null;
  itinerary: ItineraryData | null;
  destination: string;
  days: number;
  onRetry: () => void;
  onReset: () => void;
  onSave: () => void;
  isSaved: boolean;
}

export const ItineraryResult = ({
  isGenerating,
  error,
  itinerary,
  destination,
  days,
  onRetry,
  onReset,
  onSave,
  isSaved
}: ItineraryResultProps) => {
  if (isGenerating) {
    return (
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
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="p-8 bg-red-50 rounded-3xl border border-red-100 text-center max-w-md shadow-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-red-600" size={32} />
          </div>
          <h3 className="text-2xl font-serif font-bold text-red-900 mb-3">生成失败</h3>
          <p className="text-red-700 text-sm mb-8 leading-relaxed">{error}</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={onRetry}
              className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200"
            >
              <RefreshCw size={18} /> 尝试重新生成
            </button>
            <button 
              onClick={onReset}
              className="w-full py-4 bg-white text-stone-600 border border-stone-200 rounded-xl font-bold hover:bg-stone-50 transition-all"
            >
              返回第一步
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-400">生成失败，请重试。</p>
        <div className="flex flex-col gap-3 mt-4 max-w-xs mx-auto">
          <button 
            onClick={onRetry} 
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} /> 尝试重新生成
          </button>
          <button 
            onClick={onReset} 
            className="w-full py-4 bg-white text-stone-600 border border-stone-200 rounded-xl font-bold hover:bg-stone-50 transition-all"
          >
            返回第一步
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 pb-20"
    >
      <header className="relative">
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl -z-10" />
        <div className="flex flex-col md:flex-col justify-between gap-4 mb-4">
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
              onClick={onSave}
              className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-200"
            >
              <Save size={18} />
              {isSaved ? '已保存' : '保存攻略'}
            </button>
            <button 
              onClick={onReset}
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

      {/* Map Section */}
      <MapSection 
        itinerary={itinerary} 
      />

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
    </motion.div>
  );
};
