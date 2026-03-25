import { Compass, Bus, Utensils, Wallet } from 'lucide-react';
import { ItineraryData } from '../types';

interface ItineraryTimelineProps {
  itinerary: ItineraryData;
}

export const ItineraryTimeline = ({ itinerary }: ItineraryTimelineProps) => {
  return (
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
  );
};
