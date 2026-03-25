import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Target, 
  Sun, 
  Waves, 
  Compass, 
  Sparkles, 
  ChevronRight, 
  Loader2, 
  RefreshCw, 
  ArrowRight 
} from 'lucide-react';

interface StepFormProps {
  step: number;
  setStep: (step: number) => void;
  destination: string;
  setDestination: (val: string) => void;
  purpose: string;
  setPurpose: (val: string) => void;
  days: number;
  setDays: (val: number) => void;
  budget: string;
  setBudget: (val: string) => void;
  isGenerating: boolean;
  generateItinerary: () => void;
}

export const StepForm = ({
  step,
  setStep,
  destination,
  setDestination,
  purpose,
  setPurpose,
  days,
  setDays,
  budget,
  setBudget,
  isGenerating,
  generateItinerary
}: StepFormProps) => {
  const purposes = [
    { id: 'relax', label: '休闲度假', icon: Sun, color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { id: 'explore', label: '深度探索', icon: Compass, color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { id: 'special', label: '特种兵旅行', icon: Sparkles, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { id: 'food', label: '美食之旅', icon: Waves, color: 'bg-rose-50 text-rose-600 border-rose-100' },
  ];

  const budgets = ['经济实惠', '舒适平衡', '奢华享受', '不设上限'];

  return (
    <div className="bg-white p-8 md:p-12 rounded-[40px] border border-stone-100 shadow-xl shadow-stone-200/50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-stone-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-serif font-bold text-stone-900">你想去哪里？</h2>
              <p className="text-stone-400 font-medium">输入目的地，开启你的专属旅程</p>
            </div>
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600 group-focus-within:scale-110 transition-transform">
                <MapPin size={24} />
              </div>
              <input 
                type="text" 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="例如：三亚、成都、大理..."
                className="w-full py-6 pl-16 pr-8 bg-stone-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-3xl text-xl font-bold transition-all outline-none placeholder:text-stone-300"
              />
            </div>
            <button 
              disabled={!destination}
              onClick={() => setStep(2)}
              className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-bold text-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 group"
            >
              下一步 <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-serif font-bold text-stone-900">旅行目的是？</h2>
              <p className="text-stone-400 font-medium">我们将根据您的偏好定制路线</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {purposes.map((p) => (
                <button 
                  key={p.id}
                  onClick={() => {
                    setPurpose(p.label);
                    setStep(3);
                  }}
                  className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    purpose === p.label ? 'border-emerald-500 bg-emerald-50/30' : 'border-stone-50 bg-stone-50/50 hover:border-stone-200'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${p.color}`}>
                    <p.icon size={28} />
                  </div>
                  <span className="font-bold text-stone-700">{p.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-serif font-bold text-stone-900">计划玩几天？</h2>
              <p className="text-stone-400 font-medium">合理安排每一天的精彩瞬间</p>
            </div>
            <div className="flex items-center justify-center gap-8 py-12 bg-stone-50 rounded-[40px] border-2 border-dashed border-stone-200">
              <button 
                onClick={() => setDays(Math.max(1, days - 1))}
                className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center text-3xl font-bold text-stone-400 hover:text-emerald-600 transition-colors"
              >
                -
              </button>
              <div className="text-center">
                <span className="text-7xl font-serif font-bold text-emerald-600">{days}</span>
                <p className="text-stone-400 font-bold uppercase tracking-widest mt-2">Days</p>
              </div>
              <button 
                onClick={() => setDays(days + 1)}
                className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center text-3xl font-bold text-stone-400 hover:text-emerald-600 transition-colors"
              >
                +
              </button>
            </div>
            <button 
              onClick={() => setStep(4)}
              className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-bold text-lg hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 group"
            >
              下一步 <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-serif font-bold text-stone-900">预算范围是？</h2>
              <p className="text-stone-400 font-medium">我们将为您匹配最合适的消费方案</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {budgets.map((b) => (
                <button 
                  key={b}
                  onClick={() => setBudget(b)}
                  className={`p-6 rounded-3xl border-2 font-bold transition-all ${
                    budget === b ? 'border-emerald-500 bg-emerald-50/30 text-emerald-700' : 'border-stone-50 bg-stone-50/50 text-stone-600 hover:border-stone-200'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            <button 
              disabled={!budget || isGenerating}
              onClick={() => generateItinerary()}
              className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-bold text-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-3"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  AI 正在为您精心规划...
                </>
              ) : (
                <>
                  <Sparkles size={24} />
                  立即生成专属攻略
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
