import { RefObject } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Compass, 
  Loader2, 
  Send, 
  X 
} from 'lucide-react';
import Markdown from 'react-markdown';
import { ChatMessage } from '../types';

interface AIAssistantProps {
  chatInput: string;
  setChatInput: (val: string) => void;
  chatHistory: ChatMessage[];
  isTyping: boolean;
  onChat: () => void;
  chatEndRef: RefObject<HTMLDivElement | null>;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
}

export const AIAssistant = ({
  chatInput,
  setChatInput,
  chatHistory,
  isTyping,
  onChat,
  chatEndRef,
  isChatOpen,
  setIsChatOpen
}: AIAssistantProps) => {
  const ChatContent = () => (
    <>
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
            onKeyDown={(e) => e.key === 'Enter' && onChat()}
            placeholder="问问 AI 助手..."
            className="w-full bg-stone-100 border-none rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
          />
          <button 
            onClick={onChat}
            disabled={!chatInput.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[10px] text-stone-400 mt-2 text-center">由 AI 大模型 提供支持</p>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop View */}
      <aside className="hidden md:flex w-full md:w-80 lg:w-96 bg-white border-l border-stone-200 flex-col h-screen">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-emerald-600" size={20} />
            <h2 className="font-bold">AI 旅游助手</h2>
          </div>
        </div>
        <ChatContent />
      </aside>

      {/* Mobile Floating Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="md:hidden fixed bottom-6 left-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 hover:scale-110 transition-transform"
      >
        <Sparkles size={24} />
      </button>

      {/* Mobile Modal */}
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
            <ChatContent />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
