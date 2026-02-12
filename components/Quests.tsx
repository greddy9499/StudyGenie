
import React, { useState } from 'react';
import { Quest, StudyDocument, QuizQuestion, Concept } from '../types';
import { generateBossChallenge } from '../services/geminiService';

interface QuestsProps {
  quests: Quest[];
  documents: StudyDocument[];
  onBossDefeated: (questId: string, badge: string) => void;
  onUpdateMastery: (conceptId: string, change: number) => void;
}

const Quests: React.FC<QuestsProps> = ({ quests, documents, onBossDefeated, onUpdateMastery }) => {
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null);
  const [bossMode, setBossMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [bossScore, setBossScore] = useState(0);

  const startBossChallenge = async (quest: Quest) => {
    const doc = documents.find(d => docMatchesQuest(d, quest));
    if (!doc) return;

    setLoading(true);
    setActiveQuestId(quest.id);
    try {
      // Corrected call: generateBossChallenge expects concepts array
      const q = await generateBossChallenge(doc.concepts);
      setQuestions(q);
      setBossMode(true);
      setCurrentQIndex(0);
      setBossScore(0);
      setIsAnswered(false);
      setSelectedOption(null);
    } catch (err) {
      console.error(err);
      alert("Failed to summon the boss.");
    } finally {
      setLoading(false);
    }
  };

  const docMatchesQuest = (doc: StudyDocument, quest: Quest) => `quest-${doc.id}` === quest.id;

  const handleAnswer = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    const correct = option === questions[currentQIndex].correctAnswer;
    if (correct) setBossScore(s => s + 1);
  };

  const nextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedOption(null);
    } else {
      const finalScore = bossScore + (selectedOption === questions[currentQIndex].correctAnswer ? 1 : 0);
      const passed = finalScore >= 4; // 80% to pass boss level
      
      if (passed && activeQuestId) {
        const quest = quests.find(q => q.id === activeQuestId);
        if (quest) onBossDefeated(quest.id, quest.badge);
        alert(`🏆 BOSS DEFEATED! You earned the "${quest?.badge}" badge and 1000 XP!`);
      } else {
        alert(`💀 DEFEATED. You got ${finalScore}/5. You need 4/5 to master this path.`);
      }
      setBossMode(false);
      setBossScore(0);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-20 h-20 border-8 border-purple-600 border-t-transparent rounded-full animate-spin mb-8 shadow-2xl shadow-purple-200"></div>
        <h2 className="text-3xl font-black text-purple-900 animate-pulse">RAISING THE BOSS...</h2>
        <p className="text-slate-500 mt-4 font-medium italic">Synthesizing multiple concepts into a final exam.</p>
      </div>
    );
  }

  if (bossMode) {
    const q = questions[currentQIndex];
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 animate-in zoom-in-95 duration-500">
        <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl border-4 border-purple-500 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-purple-500/20">
             <div className="h-full bg-purple-500 transition-all duration-700" style={{width: `${((currentQIndex + 1) / questions.length) * 100}%`}}></div>
          </div>

          <div className="flex justify-between items-center mb-10">
            <span className="px-4 py-1.5 bg-purple-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">BOSS LEVEL CHALLENGE</span>
            <span className="text-purple-300 font-bold text-sm tracking-widest">HP: {questions.length - bossScore} / {questions.length}</span>
          </div>

          <h3 className="text-2xl font-bold text-white mb-10 leading-relaxed">{q.question}</h3>

          <div className="space-y-4 mb-10">
            {q.options.map((opt, i) => {
              const correct = opt === q.correctAnswer;
              const selected = opt === selectedOption;
              let style = "w-full text-left p-6 rounded-2xl border-2 font-bold transition-all ";
              if (!isAnswered) {
                style += "bg-slate-800 border-slate-700 text-slate-300 hover:border-purple-500 hover:bg-slate-700";
              } else if (correct) {
                style += "bg-emerald-900/50 border-emerald-500 text-emerald-200";
              } else if (selected) {
                style += "bg-rose-900/50 border-rose-500 text-rose-200";
              } else {
                style += "bg-slate-800 border-slate-700 text-slate-500 opacity-40";
              }

              return (
                <button key={i} onClick={() => handleAnswer(opt)} disabled={isAnswered} className={style}>
                  <span className="mr-4 opacity-50">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="animate-in slide-in-from-bottom-4">
              <div className={`p-6 rounded-2xl mb-8 ${selectedOption === q.correctAnswer ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-800' : 'bg-rose-900/20 text-rose-400 border border-rose-800'}`}>
                <p className="font-bold mb-2">{selectedOption === q.correctAnswer ? '✔️ CRITICAL HIT!' : '❌ BOSS BLOCKED'}</p>
                <p className="text-sm opacity-80">{q.explanation}</p>
              </div>
              <button onClick={nextQuestion} className="w-full py-5 bg-purple-600 text-white rounded-2xl font-black text-xl hover:bg-purple-700 shadow-xl shadow-purple-900/20">
                CONTINUE BATTLE
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Active Quests</h2>
        <p className="text-slate-500 text-lg">Follow the path of mastery. Complete concept milestones to unlock the legendary Boss Challenge for each subject.</p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {quests.map((quest) => {
          const doc = documents.find(d => docMatchesQuest(d, quest));
          if (!doc) return null;
          
          const avgMastery = doc.concepts.length > 0 
            ? Math.round(doc.concepts.reduce((acc, c) => acc + c.masteryLevel, 0) / doc.concepts.length)
            : 0;
          
          const isUnlocked = avgMastery >= 60;

          return (
            <div key={quest.id} className={`relative bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden group transition-all duration-500 ${quest.isCompleted ? 'ring-4 ring-emerald-500/20' : ''}`}>
              {quest.isCompleted && (
                <div className="absolute top-6 right-6 bg-emerald-500 text-white px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest z-10">
                  COMPLETED
                </div>
              )}
              
              <div className="flex flex-col lg:flex-row h-full">
                {/* Visual Path Segment */}
                <div className="lg:w-1/3 bg-slate-50 border-r border-slate-100 p-8 flex flex-col justify-center items-center gap-6">
                  <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-2xl transition-transform duration-500 group-hover:scale-110 ${quest.isCompleted ? 'bg-emerald-100' : 'bg-indigo-100'}`}>
                    {quest.isCompleted ? '🏆' : '🗺️'}
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-black text-slate-800 mb-2">{quest.title}</h3>
                    <p className="text-sm text-slate-500">{quest.description}</p>
                  </div>
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      <span>Path Progress</span>
                      <span>{avgMastery}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-indigo-500 transition-all duration-1000" style={{width: `${avgMastery}%`}}></div>
                    </div>
                  </div>
                </div>

                {/* Milestones and Boss */}
                <div className="lg:w-2/3 p-8 lg:p-12 relative">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8">Path Milestones</h4>
                  <div className="flex flex-col md:flex-row justify-between items-center relative mb-12">
                    {/* Progress Line */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
                    
                    {[
                      { label: 'Beginner', threshold: 0, icon: '🌱' },
                      { label: 'Learner', threshold: 30, icon: '📖' },
                      { label: 'Expert', threshold: 60, icon: '🧠' },
                    ].map((m, i) => (
                      <div key={i} className="relative z-10 flex flex-col items-center gap-2 mb-6 md:mb-0">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-lg border-2 transition-all ${avgMastery >= m.threshold ? 'bg-white border-indigo-500 text-indigo-500' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                          {m.icon}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${avgMastery >= m.threshold ? 'text-indigo-600' : 'text-slate-300'}`}>
                          {m.label}
                        </span>
                      </div>
                    ))}

                    {/* Boss Node */}
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <button 
                        onClick={() => isUnlocked && startBossChallenge(quest)}
                        disabled={!isUnlocked || quest.isCompleted}
                        className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl shadow-2xl transition-all ${
                          quest.isCompleted ? 'bg-emerald-500 text-white cursor-default' :
                          isUnlocked ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white hover:scale-110 active:scale-95 animate-pulse' : 
                          'bg-slate-100 text-slate-300 cursor-not-allowed border-2 border-dashed border-slate-200'
                        }`}
                      >
                        {quest.isCompleted ? '✨' : '💀'}
                      </button>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isUnlocked ? 'text-purple-600' : 'text-slate-300'}`}>
                        Boss Level
                      </span>
                    </div>
                  </div>

                  {!isUnlocked && !quest.isCompleted && (
                    <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                      <p className="text-sm text-indigo-900 font-medium">
                        🔒 <span className="font-black">Boss Locked:</span> Reach <span className="font-black">60% Average Mastery</span> in all related concepts to unlock the Boss Challenge.
                      </p>
                    </div>
                  )}

                  {quest.isCompleted && (
                    <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl">🎖️</div>
                      <div>
                        <h5 className="font-black text-emerald-900 uppercase text-xs tracking-widest mb-1">Badge Earned</h5>
                        <p className="text-sm text-emerald-700 font-bold">{quest.badge}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-8">
                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Required Mastery</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {doc.concepts.map(c => (
                        <div key={c.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white shadow-sm">
                          <span className="text-xs font-bold text-slate-600 truncate mr-2">{c.name}</span>
                          <span className={`text-xs font-black ${c.masteryLevel >= 60 ? 'text-emerald-500' : 'text-slate-400'}`}>
                            {c.masteryLevel}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {quests.length === 0 && (
          <div className="bg-white p-20 rounded-[3rem] border border-dashed border-slate-200 text-center">
             <div className="text-6xl mb-6 opacity-30">📭</div>
             <h3 className="text-2xl font-bold text-slate-400 mb-2">No Quests Available</h3>
             <p className="text-slate-400">Upload documents in the Library to automatically generate mastery quests.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quests;