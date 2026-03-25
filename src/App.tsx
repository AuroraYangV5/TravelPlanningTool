/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { ItineraryData, ChatMessage } from './types';
import { Sidebar } from './components/Sidebar';
import { StepWizard } from './components/StepWizard';
import { ItineraryResult } from './components/ItineraryResult';
import { AIAssistant } from './components/AIAssistant';
import { SavedItineraries } from './components/SavedItineraries';

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
  const [modelType, setModelType] = useState<'qwen' | 'doubao'>('qwen');

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

      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, modelType })
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
            if (!processedText.includes('"routePoints": [')) {
              processedText += '"routePoints": []';
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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: chatHistory,
          systemInstruction: `你是一个专业的旅游助手。当前用户正在规划前往 ${destination || '未知目的地'} 的旅行。请提供专业的建议。`,
          modelType
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
      />

      <main className="flex-1 overflow-y-auto h-screen relative">
        <div className="max-w-4xl mx-auto p-4 md:p-12 min-h-full flex flex-col">
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
                    mapView={mapView}
                    setMapView={setMapView}
                    onRetry={generateItinerary}
                    onReset={() => setStep(1)}
                    onSave={saveCurrentItinerary}
                    isSaved={itinerary ? savedItineraries.some(i => i.title === itinerary.title) : false}
                  />
                )}
              </div>
            )}
          </AnimatePresence>
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
    </div>
  );
}
