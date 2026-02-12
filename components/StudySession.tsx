
import React, { useState, useEffect } from 'react';
import { StudyDocument, QuizQuestion } from '../types';
import { generateQuizQuestions } from '../services/geminiService';

interface StudySessionProps {
  documents: StudyDocument[];
  onResult: (conceptId: string, correct: boolean) => void;
}

const StudySession: React.FC<StudySessionProps> = ({ documents, onResult }) => {
  const [sessionActive, setSessionActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const startSession = async (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    setLoading(true);
    try {
      const q = await generateQuizQuestions(doc.content, doc.concepts, 5);
      setQuestions(q);
      setCurrentIndex(0);
      setScore(0);
      setSessionActive(true);
    } catch (err) {
      console.error(err);
      alert("Error generating questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    
    const correct = option === questions[currentIndex].correctAnswer;
    if (correct) setScore(s => s + 1);
    
    onResult(questions[currentIndex].conceptId, correct);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setSessionActive(false);
      alert(`Session Complete! You got ${score + (selectedOption === questions[currentIndex].correctAnswer ? 1 : 0)} / ${questions.length} correct.`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h3 className="text-2xl font-black text-indigo-900 animate-pulse">Summoning Knowledge...</h3>
        <p className="text-slate-500 mt-2 italic">Gemini is crafting custom challenges for your brain.</p>
      </div>
    );
  }

  if (!sessionActive) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-800 mb-3">Study Arena</h2>
          <p className="text-slate-500">Challenge yourself with adaptive AI-generated questions. Master your concepts to level up.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Select a Topic to Challenge</h3>
          {documents.map(doc => (
            <div key={doc.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50 transition-all cursor-pointer" onClick={() => startSession(doc.id)}>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">⚔️</div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">{doc.title}</h4>
                  <p className="text-sm text-slate-400">{doc.concepts.length} Concepts ready</p>
                </div>
              </div>
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 group-hover:bg-indigo-700">Enter Arena</button>
            </div>
          ))}
          {documents.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400">Upload a document first to start studying!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto animate-in zoom-in-95 duration-300">
      <div className="mb-10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Question {currentIndex + 1} of {questions.length}</span>
          <span className="text-xs font-bold text-indigo-600">Mastery Boost: +10%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-indigo-50/50">
        <div className="flex gap-2 mb-6">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            currentQ.difficulty === 'hard' ? 'bg-rose-100 text-rose-600' :
            currentQ.difficulty === 'medium' ? 'bg-amber-100 text-amber-600' :
            'bg-emerald-100 text-emerald-600'
          }`}>
            {currentQ.difficulty}
          </span>
        </div>
        
        <h3 className="text-2xl font-bold text-slate-800 leading-tight mb-8">{currentQ.question}</h3>

        <div className="grid grid-cols-1 gap-4 mb-8">
          {currentQ.options.map((option, idx) => {
            const isCorrect = option === currentQ.correctAnswer;
            const isSelected = option === selectedOption;
            
            let btnClass = "w-full text-left p-6 rounded-2xl border-2 font-medium transition-all duration-200 ";
            if (!isAnswered) {
              btnClass += "bg-white border-slate-100 hover:border-indigo-400 hover:bg-indigo-50/30";
            } else {
              if (isCorrect) {
                btnClass += "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm shadow-emerald-100 scale-[1.02]";
              } else if (isSelected) {
                btnClass += "bg-rose-50 border-rose-500 text-rose-700";
              } else {
                btnClass += "bg-slate-50 border-slate-100 opacity-50";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                disabled={isAnswered}
                className={btnClass}
              >
                <span className="inline-block w-8 h-8 rounded-lg bg-slate-100 text-slate-500 text-center leading-8 text-xs font-black mr-4 uppercase">
                  {String.fromCharCode(65 + idx)}
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="animate-in slide-in-from-top-4 duration-300">
            <div className={`p-6 rounded-2xl mb-8 ${selectedOption === currentQ.correctAnswer ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'}`}>
              <p className="font-bold mb-2 flex items-center gap-2">
                {selectedOption === currentQ.correctAnswer ? '✨ Brilliant!' : '💡 Learning Opportunity'}
              </p>
              <p className="text-sm leading-relaxed opacity-90">{currentQ.explanation}</p>
            </div>
            <button 
              onClick={nextQuestion}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl active:scale-95"
            >
              {currentIndex < questions.length - 1 ? 'Next Challenge' : 'Finish Session'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudySession;
