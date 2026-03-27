import { motion } from 'motion/react';
import { 
  X, 
  History, 
  MapPin, 
  Calendar, 
  Wallet, 
  Trash2 
} from 'lucide-react';
import { ItineraryData } from '../types';

interface SavedItinerariesProps {
  savedItineraries: ItineraryData[];
  onSelect: (itinerary: ItineraryData) => void;
  onDelete: (title: string) => void;
  onClose: () => void;
}

export const SavedItineraries = ({
  savedItineraries,
  onSelect,
  onDelete,
  onClose
}: SavedItinerariesProps) => {
  return (
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
          onClick={onClose}
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
            onClick={onClose}
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
                    onClick={() => onSelect(saved)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all"
                  >
                    查看详情
                  </button>
                  <button 
                    onClick={() => onDelete(saved.title)}
                    className="p-2 text-stone-300 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="flex gap-2 overflow-hidden">
                {(saved.cities?.[0]?.routePoints || []).slice(0, 4).map((p, i) => (
                  <span key={i} className="text-[10px] bg-stone-50 px-2 py-1 rounded-md text-stone-500 whitespace-nowrap">
                    {p.label}
                  </span>
                ))}
                {(saved.cities?.[0]?.routePoints?.length || 0) > 4 && <span className="text-[10px] text-stone-300">...</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
