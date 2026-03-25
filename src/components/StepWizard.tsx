import { motion } from 'motion/react';
import { 
  ArrowRight, 
  ChevronRight 
} from 'lucide-react';

interface StepWizardProps {
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
  onGenerate: () => void;
}

export const StepWizard = ({
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
  onGenerate
}: StepWizardProps) => {
  return (
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
                onClick={() => { setBudget(b.l); onGenerate(); }}
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
            onClick={() => onGenerate()}
            className="mt-8 text-stone-400 hover:text-stone-600 text-sm font-medium flex items-center gap-1 mx-auto"
          >
            直接生成攻略 <ChevronRight size={14} />
          </button>
        </motion.div>
      )}
    </>
  );
};
