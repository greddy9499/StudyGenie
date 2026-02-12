
import React, { useState, useRef, useEffect } from 'react';
import { StudyDocument } from '../types';
import { chatWithTutor } from '../services/geminiService';

interface TutorProps {
  documents: StudyDocument[];
  selectedDoc: StudyDocument | null;
}

const Tutor: React.FC<TutorProps> = ({ documents, selectedDoc }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedDoc || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatWithTutor(userMessage, [], selectedDoc.content);
      setMessages(prev => [...prev, { role: 'assistant', content: response || "I'm sorry, I couldn't generate an answer." }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "An error occurred. Please check your connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black text-slate-800">AI Tutor Mode</h2>
        <p className="text-slate-500 text-sm">Ask questions based only on your uploaded materials. StudyGenie is grounded in your notes.</p>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col">
        {/* Context Selector */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Context:</span>
          <div className="bg-white border border-slate-200 px-3 py-1 rounded-full text-xs font-bold text-indigo-700 flex items-center gap-2">
            🤖 {selectedDoc ? selectedDoc.title : 'No context selected'}
          </div>
          {!selectedDoc && (
            <span className="text-rose-500 text-[10px] font-bold animate-pulse">Select a document in the library first!</span>
          )}
        </div>

        {/* Chat window */}
        <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <div className="text-6xl mb-4">🧙‍♂️</div>
              <p className="max-w-xs font-medium">I'm your Genie. Ask me anything about your notes and I'll help you master the material.</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200 shadow-sm'
              }`}>
                {m.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 p-4 rounded-2xl rounded-bl-none border border-slate-200 flex gap-2">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="relative flex items-center">
            <input 
              type="text" 
              placeholder={selectedDoc ? "Ask your Genie..." : "Select context to start chatting"}
              disabled={!selectedDoc || isLoading}
              className="w-full pl-6 pr-16 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm disabled:opacity-50"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={!selectedDoc || isLoading || !input.trim()}
              className="absolute right-2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:bg-slate-300 disabled:shadow-none shadow-lg shadow-indigo-100"
            >
              🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutor;
