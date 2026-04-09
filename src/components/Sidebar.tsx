import { 
  MapPin, 
  ChevronRight, 
  Compass,
  Calendar,
  Wallet,
  Target,
  History,
  Settings
} from 'lucide-react';

interface SidebarProps {
  step: number;
  setStep: (step: number) => void;
  showSaved: boolean;
  setShowSaved: (show: boolean) => void;
  savedCount: number;
  modelType: 'qwen' | 'doubao';
  setModelType: (type: 'qwen' | 'doubao') => void;
  onOpenSettings: () => void;
}

export const Sidebar = ({ 
  step, 
  setStep, 
  showSaved, 
  setShowSaved, 
  savedCount, 
  modelType, 
  setModelType,
  onOpenSettings
}: SidebarProps) => {
  return (
    <nav className="w-full md:w-20 lg:w-64 bg-white border-b md:border-b-0 md:border-r border-stone-200 flex flex-col z-20 shrink-0">
      <div className="p-4 md:p-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#009966] rounded-xl flex items-center justify-center shadow-lg shadow-stone-200 overflow-hidden transition-transform hover:scale-110 duration-300">
            <img src="/logo.svg" alt="Logo" className="w-7 h-7" referrerPolicy="no-referrer" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg md:text-xl font-bold text-stone-900 tracking-tight leading-none">旅行助手</span>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em] mt-1">Travel AI</span>
          </div>
        </div>

        {/* Mobile Model Switcher */}
        <div className="flex md:hidden items-center gap-2">
          <div className="flex p-0.5 bg-stone-100 rounded-lg">
            <button
              onClick={() => setModelType('qwen')}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                modelType === 'qwen' ? 'bg-white text-emerald-600 shadow-sm' : 'text-stone-500'
              }`}
            >
              千问
            </button>
            <button
              onClick={() => setModelType('doubao')}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                modelType === 'doubao' ? 'bg-white text-emerald-600 shadow-sm' : 'text-stone-500'
              }`}
            >
              豆包
            </button>
          </div>
          <button 
            onClick={onOpenSettings}
            className="p-2 text-stone-400 hover:text-emerald-600 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="px-4 py-2 md:px-3 md:py-4 flex md:flex-col gap-2 overflow-x-auto no-scrollbar border-t md:border-t-0 border-stone-100">
        {/* Desktop Model Switcher */}
        <div className="hidden md:block">
          <div className="hidden lg:block px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-stone-400">
            模型选择
          </div>
          <div className="flex gap-1 p-1 bg-stone-100 rounded-xl mx-2 mb-4">
            <button
              onClick={() => setModelType('qwen')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                modelType === 'qwen' 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              千问
            </button>
            <button
              onClick={() => setModelType('doubao')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                modelType === 'doubao' 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              豆包
            </button>
          </div>
        </div>

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
            {savedCount > 0 && (
              <span className="ml-auto bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 md:gap-3 px-2 md:px-4 py-1.5 md:py-3 rounded-xl transition-all duration-200 whitespace-nowrap flex-1 md:flex-none text-stone-500 hover:bg-stone-100"
          >
            <Settings size={14} className="shrink-0 md:size-[18px]" />
            <span className="text-[10px] md:text-sm lg:text-base">设置</span>
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
  );
};
