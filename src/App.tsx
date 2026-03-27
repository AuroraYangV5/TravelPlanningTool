/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ItineraryData, ChatMessage } from './types';
import { Sidebar } from './components/Sidebar';
import { StepWizard } from './components/StepWizard';
import { ItineraryResult } from './components/ItineraryResult';
import { AIAssistant } from './components/AIAssistant';
import { SavedItineraries } from './components/SavedItineraries';
import { X, AlertCircle } from 'lucide-react';

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
  const [savedItineraries, setSavedItineraries] = useState<ItineraryData[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [modelType, setModelType] = useState<'qwen' | 'doubao'>('qwen');
  
  // API Keys
  const [userQwenKey, setUserQwenKey] = useState('');
  const [userDoubaoKey, setUserDoubaoKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('saved_itineraries');
    if (saved) {
      try {
        setSavedItineraries(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved itineraries", e);
      }
    }

    const qKey = localStorage.getItem('user_qwen_key');
    const dKey = localStorage.getItem('user_doubao_key');
    if (qKey) setUserQwenKey(qKey);
    if (dKey) setUserDoubaoKey(dKey);
  }, []);

  const saveKeys = (qKey: string, dKey: string) => {
    setUserQwenKey(qKey);
    setUserDoubaoKey(dKey);
    localStorage.setItem('user_qwen_key', qKey);
    localStorage.setItem('user_doubao_key', dKey);
    setIsSettingsOpen(false);
  };

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
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
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
      `;

      const apiKey = modelType === 'qwen' ? userQwenKey : userDoubaoKey;

      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, modelType, apiKey: apiKey || undefined })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "生成攻略时遇到错误，请稍后重试。");
      }

      const result = await response.json();
      let text = result.text;
      if (!text) throw new Error("AI 未能生成内容，请重试。");

      console.log("Response length:", text.length);

      try {
        // Robust attempt to fix truncated JSON
        let processedText = text.trim();
        
        // If it looks like it was cut off inside the nodes array or routePoints array
        if (!processedText.endsWith('}')) {
          console.warn("Detected truncated JSON, attempting to repair...");
          
          // Try to close the last object if it's partially written
          if (processedText.includes('{') && !processedText.endsWith('}')) {
            // Find the last complete object or array element
            const lastComma = processedText.lastIndexOf(',');
            if (lastComma > -1) {
              processedText = processedText.substring(0, lastComma);
            }
            
            // Close the arrays and the main object
            if (processedText.includes('"nodes": [')) {
              if (!processedText.includes('],')) {
                processedText += '],';
              }
            }
            if (!processedText.includes('"cities": [')) {
              processedText += '"cities": []';
            } else if (!processedText.endsWith(']')) {
               processedText += ']';
            }
            
            if (!processedText.endsWith('}')) {
              processedText += '}';
            }
          }
        }
        
        const data = JSON.parse(processedText);
        setItinerary(data);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "Raw Text:", text);
        throw new Error("生成的数据格式有误或被截断，请尝试减少天数或重新生成。");
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
      const apiKey = modelType === 'qwen' ? userQwenKey : userDoubaoKey;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: chatHistory,
          systemInstruction: `你是一个专业的旅游助手。当前用户正在规划前往 ${destination || '未知目的地'} 的旅行。请提供专业的建议。`,
          modelType,
          apiKey: apiKey || undefined
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

  const isUsingDefaultKey = (modelType === 'qwen' && !userQwenKey) || (modelType === 'doubao' && !userDoubaoKey);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-stone-50">
      <Sidebar 
        step={step} 
        setStep={setStep} 
        showSaved={showSaved} 
        setShowSaved={setShowSaved} 
        savedCount={savedItineraries.length} 
        modelType={modelType}
        setModelType={setModelType}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 overflow-y-auto h-screen relative">
        <div className="max-w-4xl mx-auto p-4 md:p-12 min-h-full flex flex-col">
          {isUsingDefaultKey && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-700 text-xs md:text-sm"
            >
              <AlertCircle size={18} className="shrink-0" />
              <p>
                当前使用公共 API Key，免费额度有限且速度较慢。
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="ml-2 font-bold underline hover:text-amber-800"
                >
                  配置自己的 Key
                </button>
              </p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {showSaved ? (
              <SavedItineraries 
                savedItineraries={savedItineraries}
                onSelect={(saved) => { setItinerary(saved); setStep(5); setShowSaved(false); }}
                onDelete={deleteSavedItinerary}
                onClose={() => setShowSaved(false)}
              />
            ) : (
              <div className="flex-1 flex flex-col">
                <StepWizard 
                  step={step}
                  setStep={setStep}
                  destination={destination}
                  setDestination={setDestination}
                  purpose={purpose}
                  setPurpose={setPurpose}
                  days={days}
                  setDays={setDays}
                  budget={budget}
                  setBudget={setBudget}
                  onGenerate={generateItinerary}
                />

                {step === 5 && (
                  <ItineraryResult 
                    isGenerating={isGenerating}
                    error={error}
                    itinerary={itinerary}
                    destination={destination}
                    days={days}
                    onRetry={generateItinerary}
                    onReset={() => setStep(1)}
                    onSave={saveCurrentItinerary}
                    isSaved={itinerary ? savedItineraries.some(i => i.title === itinerary.title) : false}
                  />
                )}
              </div>
            )}
          </AnimatePresence>

          <footer className="mt-auto pt-12 pb-4 text-center text-stone-400 text-[10px] md:text-xs">
            <p className="mb-2 opacity-60">© 2026 Customized Travel Planner Assistant</p>
            <a 
              href="https://beian.miit.gov.cn" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-emerald-600 transition-colors"
            >
              京ICP备2026014244号-1
            </a>
          </footer>
        </div>
      </main>

      <AIAssistant 
        chatInput={chatInput}
        setChatInput={setChatInput}
        chatHistory={chatHistory}
        isTyping={isTyping}
        onChat={handleChat}
        chatEndRef={chatEndRef}
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
      />

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-stone-900">API 设置</h3>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">通义千问 API Key</label>
                  <input 
                    type="password"
                    value={userQwenKey}
                    onChange={(e) => setUserQwenKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  <p className="mt-1.5 text-[10px] text-stone-400">从 阿里云 DashScope 获取</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">豆包 API Key</label>
                  <input 
                    type="password"
                    value={userDoubaoKey}
                    onChange={(e) => setUserDoubaoKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  <p className="mt-1.5 text-[10px] text-stone-400">从 火山引擎 Ark 平台获取</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl">
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    <strong>提示：</strong> 您的 API Key 将仅保存在本地浏览器中，不会上传到我们的服务器。配置自己的 Key 可以获得更快的响应速度和更高的额度。
                  </p>
                </div>
                <button 
                  onClick={() => saveKeys(userQwenKey, userDoubaoKey)}
                  className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
                >
                  保存配置
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
