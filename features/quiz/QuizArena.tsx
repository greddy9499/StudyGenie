
import * as React from 'react';
import { StudyDocument, QuizQuestion, NotificationType } from '../../types.ts';
import { generateQuizQuestions, generateBossChallenge } from '../../services/geminiService.ts';

const { useState } = React;

interface QuizArenaProps {
  documents: StudyDocument[];
  onResult: (xp: number, conceptId?: string, isCorrect?: boolean) => void;
  notify: (msg: string, type: NotificationType) => void;
}

const QuizArena: React.FC<QuizArenaProps> = ({ documents, onResult, notify }) => {
  const [mode, setMode] = useState<'daily' | 'boss' | 'none'>('none');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showXpBurst, setShowXpBurst] = useState(false);

  const startChallenge = async (type: 'daily' | 'boss', doc: StudyDocument) => {
    setIsGenerating(true);
    setMode(type);
    setCurrentIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedOption(null);
    
    try {
      const qs = type === 'boss' 
        ? await generateBossChallenge(doc.concepts) 
        : await generateQuizQuestions(doc.content, doc.concepts, 5);
      
      if (!qs || qs.length === 0) {
        throw new Error("No questions could be synthesized for this material.");
      }
      
      setQuestions(qs);
      notify(`${type.toUpperCase()} Trial Initialized. Grounding knowledge...`, "info");
    } catch (err: any) {
      notify(err.message, "error");
      setMode('none');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (opt: string) => {
    if (isAnswered) return;
    const q = questions[currentIndex];
    setSelectedOption(opt);
    setIsAnswered(true);
    
    const isCorrect = opt === q.correctAnswer;
    const gain = isCorrect ? (mode === 'boss' ? 250 : 50) : 0;
    
    if (isCorrect) {
      setScore(s => s + 1);
      setShowXpBurst(true);
      setTimeout(() => setShowXpBurst(false), 1200);
    }
    
    // Pass back the mastery result immediately
    onResult(gain, q.conceptId, isCorrect);
  };

  const proceedToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setIsAnswered(false);
      setSelectedOption(null);
    } else {
      const finalAccuracy = (score / questions.length) * 100;
      notify(`Session complete. Mastery accuracy: ${finalAccuracy.toFixed(0)}%`, "success");
      setMode('none');
      setQuestions([]);
    }
  };

  if (mode === 'none') {
    return (
      <div className="space-y-12 animate-slide-up max-w-5xl mx-auto py-10">
        <div className="text-center space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Layer 3: Assessment Engine</h2>
          <h1 className="text-4xl font-black text-indigo-950 tracking-tighter">Active Recall Arena</h1>
          <p className="text-slate-500 max-w-lg mx-auto font-medium">Challenge your long-term memory with adaptive context-aware testing sessions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {documents.map(doc => (
            <div key={doc.id} className="bg-white p-12 rounded-[4rem] premium-shadow border border-slate-50 flex flex-col items-center text-center group relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl grayscale pointer-events-none transition-premium group-hover:opacity-10 group-hover:rotate-6">⚔️</div>
              <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-4xl mb-8 group-hover:rotate-6 transition-transform duration-500 shadow-inner">
                {doc.type === 'video' ? '🎬' : '📑'}
              </div>
              <h3 className="text-2xl font-black text-indigo-950 mb-2 truncate w-full px-4 tracking-tighter transition-premium group-hover:text-indigo-600">{doc.title}</h3>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-10">
                {doc.concepts.length} Mastery Nodes Available
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full relative z-10">
                <button 
                  onClick={() => startChallenge('daily', doc)}
                  className="py-5 bg-indigo-50 text-indigo-600 rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                >
                   Daily Drill
                </button>
                <button 
                  onClick={() => startChallenge('boss', doc)}
                  className="py-5 bg-indigo-950 text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                >
                  Challenge Boss
                </button>
              </div>
            </div>
          ))}
          {documents.length === 0 && (
            <div className="col-span-full py-24 text-center bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200 text-slate-400 shadow-inner">
              <span className="text-6xl mb-6 block grayscale opacity-20">🕯️</span>
              <p className="font-black text-[10px] uppercase tracking-widest">Source material required to initialize arena sequence.</p>
              <p className="text-xs font-medium mt-3">Upload a document to start studying.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] animate-fade-in text-center px-6">
        <div className="relative mb-12">
            <div className="w-24 h-24 border-[12px] border-indigo-100 rounded-full"></div>
            <div className="absolute inset-0 w-24 h-24 border-[12px] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h3 className="text-3xl font-black text-indigo-950 tracking-widest uppercase mb-4 animate-pulse">Summoning assessment...</h3>
        <p className="text-slate-400 font-medium max-w-sm leading-relaxed uppercase text-[10px] tracking-widest">Grounding questions in your unique cognitive vault.</p>
      </div>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in relative px-2 mb-20 py-10">
       <div className={`p-10 md:p-20 rounded-[4.5rem] premium-shadow border relative overflow-hidden transition-premium ${mode === 'boss' ? 'bg-indigo-950 text-white border-white/5' : 'bg-white text-slate-900 border-slate-50'}`}>
          <div className="absolute top-0 left-0 w-full h-2.5 bg-slate-200/20">
            <div className={`h-full bg-indigo-500 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)] ${showXpBurst ? 'animate-bar-pulse' : ''}`} style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mb-16 gap-8">
             <div className="flex flex-col items-center sm:items-start gap-3">
                <span className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-premium ${mode === 'boss' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-indigo-50 text-indigo-600'}`}>
                    {mode === 'boss' ? 'BOSS CHALLENGE' : 'ROUTINE CHECK'} — NODE 0{currentIndex + 1}
                </span>
                <p className={`text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 transition-premium ${mode === 'boss' ? 'text-white' : 'text-slate-500'}`}>
                    Active Recall Protocol Engaged
                </p>
             </div>
             <div className="flex flex-col items-center sm:items-end">
                <span className="text-[10px] font-black uppercase opacity-60 mb-1 tracking-widest">Accuracy</span>
                <span className="font-black text-4xl tracking-tighter transition-premium">
                    {currentIndex === 0 ? '--' : `${((score / currentIndex) * 100).toFixed(0)}%`}
                </span>
             </div>
          </div>

          <h3 className="text-3xl md:text-4xl font-black leading-tight mb-16 tracking-tighter text-center sm:text-left animate-slide-up">{q.question}</h3>

          <div className="grid grid-cols-1 gap-5 mb-16">
            {q.options.map((opt, i) => {
              const correct = opt === q.correctAnswer;
              const selected = opt === selectedOption;
              let s = "w-full text-left p-8 rounded-[2.5rem] border-2 font-black transition-all duration-500 text-sm leading-relaxed relative overflow-hidden shadow-sm ";
              
              if (!isAnswered) {
                s += mode === 'boss' 
                   ? "bg-indigo-900/40 border-indigo-800 hover:border-indigo-400 hover:bg-indigo-800 hover:shadow-indigo-500/20" 
                   : "bg-white border-slate-100 hover:border-indigo-600 hover:bg-slate-50";
              } else if (correct) {
                s += "bg-emerald-500 text-white border-emerald-500 scale-[1.03] z-10 shadow-2xl shadow-emerald-500/40 animate-card-bump";
              } else if (selected) {
                s += "bg-rose-500 text-white border-rose-500";
              } else {
                s += "opacity-20 grayscale";
              }

              return (
                <button key={i} onClick={() => handleAnswer(opt)} disabled={isAnswered} className={s}>
                   <span className="mr-8 opacity-30 text-[10px] font-black">VARIANT 0{i+1}</span>
                   <span className="flex-1">{opt}</span>
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="animate-slide-up space-y-8">
               <div className={`p-10 rounded-[3rem] border transition-premium ${mode === 'boss' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100 shadow-inner'}`}>
                 <div className="flex items-center gap-4 mb-6">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-premium ${mode === 'boss' ? 'bg-white/10' : 'bg-white'}`}>💡</div>
                    <h4 className={`text-[10px] font-black uppercase tracking-[0.4em] transition-premium ${mode === 'boss' ? 'text-indigo-200' : 'text-slate-400'}`}>Grounding Analysis</h4>
                 </div>
                 <p className="text-base leading-loose font-medium italic opacity-90">{q.explanation}</p>
               </div>
               <button 
                onClick={proceedToNext}
                className={`w-full py-7 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] transition-all duration-500 shadow-2xl group ${mode === 'boss' ? 'bg-white text-indigo-950 hover:bg-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/30'}`}
               >
                 <span className="flex items-center justify-center gap-3">
                   {currentIndex < questions.length - 1 ? 'Deploy next engagement' : 'Synapse complete - Return to hub'}
                   <span className="group-hover:translate-x-1 transition-transform duration-500">→</span>
                 </span>
               </button>
            </div>
          )}
       </div>
    </div>
  );
};

export default QuizArena;
