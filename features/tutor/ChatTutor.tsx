
import React, { useState, useRef, useEffect } from 'react';
import { StudyDocument, NotificationType } from '../../types';
import { chatWithTutor } from '../../services/geminiService';

interface ChatTutorProps {
  documents: StudyDocument[];
  activeDocId: string | null;
  setActiveDocId: (id: string | null) => void;
  notify: (msg: string, type: NotificationType) => void;
}

const ChatTutor: React.FC<ChatTutorProps> = ({ documents, activeDocId, setActiveDocId, notify }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatHistory, setChatHistory] = useState<{ role: string, parts: { text: string }[] }[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(activeDocId ? [activeDocId] : []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDocPicker, setShowDocPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (activeDocId && !selectedDocIds.includes(activeDocId)) {
      setSelectedDocIds(prev => [...prev, activeDocId]);
    }
  }, [activeDocId]);

  const selectedDocs = documents.filter(d => selectedDocIds.includes(d.id));
  const combinedContext = selectedDocs.map(d => `--- DOCUMENT: ${d.title} ---\n${d.content}`).join('\n\n');

  const toggleDoc = (id: string) => {
    setSelectedDocIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = textToSend.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatWithTutor(userMessage, chatHistory, combinedContext);
      
      const newHistory = [
        ...chatHistory,
        { role: 'user', parts: [{ text: userMessage }] },
        { role: 'model', parts: [{ text: response || '' }] }
      ];
      setChatHistory(newHistory);
      
      setMessages(prev => [...prev, { role: 'assistant', content: response || "I've analyzed your context but couldn't synthesize a direct answer." }]);
    } catch (err: any) {
      notify("Cognitive link interrupted.", "error");
      setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ AI link interrupted. Please verify your connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    { label: "Explain simply", prompt: "Explain the current concepts in simple terms, as if to a 10-year-old." },
    { label: "Provide a real-life example", prompt: "Give me a practical, real-life example of how these concepts are applied." },
    { label: "Test me on this", prompt: "Ask me a challenging question based on the selected context to test my mastery." }
  ];

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-200px)] flex flex-col gap-6 animate-slide-up">
      <div className="bg-white p-6 md:p-8 rounded-[3rem] premium-shadow border border-slate-50 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white text-2xl shadow-xl shadow-indigo-100">
              🧞
            </div>
            <div>
              <h2 className="text-2xl font-black text-indigo-950 tracking-tight">AI Tutor Arena</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full ${selectedDocIds.length > 0 ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  {selectedDocIds.length > 0 ? `${selectedDocIds.length} Sources Grounded` : 'General Knowledge Mode'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowDocPicker(!showDocPicker)}
              className="px-6 py-3 bg-indigo-50 text-indigo-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center gap-2"
            >
              {showDocPicker ? 'Hide Vault' : 'Sync Vault Context'} 📚
            </button>
            {messages.length > 0 && (
               <button onClick={() => { setMessages([]); setChatHistory([]); }} className="p-3 text-slate-300 hover:text-indigo-600">🧹</button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedDocs.map(doc => (
            <div key={doc.id} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
              <span>{doc.title}</span>
              <button onClick={() => toggleDoc(doc.id)} className="hover:text-rose-200 ml-1">✕</button>
            </div>
          ))}
          {selectedDocIds.length === 0 && !showDocPicker && (
            <p className="text-[10px] font-bold text-slate-400 italic px-4">Operating in wide-knowledge mode.</p>
          )}
        </div>

        {showDocPicker && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4 border-t border-slate-50 max-h-[200px] overflow-y-auto scrollbar-hide">
            {documents.map(doc => (
              <button
                key={doc.id}
                onClick={() => toggleDoc(doc.id)}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedDocIds.includes(doc.id) ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-slate-100 text-slate-400'
                }`}
              >
                <span className="text-xl">{doc.type === 'video' ? '🎬' : '📑'}</span>
                <span className="text-xs font-black truncate">{doc.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 bg-white rounded-[3.5rem] premium-shadow border border-slate-50 overflow-hidden flex flex-col relative">
        <div ref={scrollRef} className="flex-1 p-10 overflow-y-auto space-y-8 scrollbar-hide">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-50">
              <span className="text-6xl mb-6">🤖</span>
              <h3 className="text-xl font-black text-indigo-950 tracking-tight mb-3">Universal Genie Active</h3>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed font-medium">Ask me anything about your documents or any general topic!</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-6 rounded-[2.2rem] text-sm leading-relaxed font-medium ${
                m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'
              }`}>
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 p-6 rounded-[2.2rem] rounded-tl-none border border-slate-100 flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Genie is thinking...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-white border-t border-slate-50 space-y-6">
          <div className="relative flex items-center group">
            <input 
              type="text" 
              placeholder="Ask the Genie anything..."
              disabled={isLoading}
              className="w-full pl-8 pr-32 py-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] focus:outline-none focus:ring-8 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-600 transition-all text-sm font-medium"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="absolute right-3 px-6 py-4 bg-indigo-600 text-white rounded-[1.8rem] font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 active:scale-95 transition-all shadow-xl"
            >
              Deploy 🚀
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {suggestions.map((s) => (
              <button 
                key={s.label} 
                onClick={() => handleSend(s.prompt)}
                disabled={isLoading}
                className="whitespace-nowrap px-6 py-3 rounded-full border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatTutor;
