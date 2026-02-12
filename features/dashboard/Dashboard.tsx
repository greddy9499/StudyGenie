import * as React from 'react';
import { User, UserStats, StudyDocument } from '../../types';

interface DashboardProps {
  user: User | null;
  stats: UserStats;
  documents: StudyDocument[];
  setView: (v: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, stats, documents, setView }) => {
  const [pulse, setPulse] = React.useState(false);
  const progressPercent = (stats.xp % 1000) / 10;
  
  // Trigger pulse effect when XP changes
  React.useEffect(() => {
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 500);
    return () => clearTimeout(t);
  }, [stats.xp]);

  const weakConcept = documents
    .flatMap(d => d.concepts)
    .filter(c => c.masteryLevel < 40)
    .sort((a, b) => a.masteryLevel - b.masteryLevel)[0];

  return (
    <div className="space-y-10 animate-slide-up px-2 md:px-0 max-w-6xl mx-auto py-6 children-animate">
      <style>{`
        .dash-card { background: white; border: 1px solid #f1f5f9; border-radius: 3.5rem; padding: 2.5rem; transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .dash-card:hover { transform: translateY(-4px); box-shadow: 0 25px 50px -15px rgba(0,0,0,0.05); }
      `}</style>

      {/* Greetings Header */}
      <section className="flex justify-between items-end px-4">
        <div>
          <h2 className="text-slate-400 font-extrabold uppercase tracking-[0.4em] text-[10px] mb-2">Academic Protocol</h2>
          <h1 className="text-5xl font-black text-indigo-950 tracking-tighter">
            Welcome, <span className="text-indigo-600 transition-all duration-500">{user?.name.split(' ')[0] || 'Genie'}</span>
          </h1>
        </div>
        <div className="hidden md:flex gap-4">
            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 transition-premium hover:shadow-md">
                <span className="text-lg">🔥</span>
                <span className="text-xs font-black uppercase text-indigo-950 tracking-widest">{stats.streak} Day Heat</span>
            </div>
        </div>
      </section>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={`lg:col-span-8 dash-card relative overflow-hidden flex flex-col justify-between ${pulse ? 'animate-card-bump border-indigo-200' : ''}`}>
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-9xl font-black pointer-events-none">L{stats.level}</div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-6">
               <div className="space-y-1">
                 <h3 className="text-4xl font-black text-indigo-950 tracking-tighter">Level {stats.level}</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cognitive Standing</p>
               </div>
               <div className="text-right">
                  <span className={`text-[11px] font-black uppercase tracking-widest block mb-1 transition-all duration-300 ${pulse ? 'text-indigo-500 scale-110' : 'text-indigo-600'}`}>{stats.xp % 1000} / 1000 XP</span>
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">Next synchronization in {1000 - (stats.xp % 1000)} XP</p>
               </div>
            </div>
            
            <div className="w-full h-5 bg-slate-50 rounded-full overflow-hidden p-[3px] border border-slate-100 shadow-inner group">
              <div 
                className={`h-full xp-bar-flow rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(79,70,229,0.3)] ${pulse ? 'animate-bar-pulse' : ''}`} 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-8 pt-8 border-t border-slate-50 relative z-10">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Rank</p>
              <p className="text-2xl font-black text-indigo-950 tracking-tighter">#1,402</p>
            </div>
            <div className={`space-y-1 transition-all duration-500 ${pulse ? 'scale-105' : ''}`}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total XP</p>
              <p className="text-2xl font-black text-indigo-600 tracking-tighter">{stats.xp.toLocaleString()}</p>
            </div>
            <div className="space-y-1 hidden md:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery Nodes</p>
              <p className="text-2xl font-black text-emerald-500 tracking-tighter">{documents.reduce((acc, d) => acc + d.concepts.length, 0)}</p>
            </div>
          </div>
        </div>

        {/* Alert Card */}
        <div className="lg:col-span-4 bg-rose-50 p-10 rounded-[3.5rem] premium-shadow border border-rose-100 flex flex-col justify-between group transition-all hover:scale-[1.02]">
          <div>
            <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500">Neuro Alert</span>
            </div>
            <h3 className="text-2xl font-black text-indigo-950 leading-tight mb-3 tracking-tighter transition-premium group-hover:text-rose-900">
              Drifting retention in:<br/>
              <span className="text-rose-500 underline decoration-rose-300 decoration-4 underline-offset-8">
                {weakConcept?.name || "Neural Basics"}
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-loose mt-4">
              AI has detected resonance loss. A quick engagement node is required to stabilize.
            </p>
          </div>
          <button 
            onClick={() => setView('quiz')}
            className="w-full mt-10 py-5 bg-rose-600 text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-700 active:scale-95 transition-all"
          >
            Initiate Stabilization
          </button>
        </div>
      </div>

      {/* Grid Layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 children-animate">
        {/* Revision Queue */}
        <div className="dash-card">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-[11px] font-black text-indigo-950 uppercase tracking-[0.4em]">Revision Protocol</h3>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-50 px-3 py-1 rounded-lg">3 Nodes Due</span>
          </div>
          <div className="space-y-4">
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all cursor-pointer">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover:rotate-6 transition-transform duration-500">🧠</div>
                <div>
                  <h4 className="font-black text-indigo-950 tracking-tight">Active Recall Path</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">Status: High Priority</p>
                </div>
              </div>
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full">DEPLOY</span>
            </div>
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between group opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">⏳</div>
                <div>
                  <h4 className="font-black text-slate-800 tracking-tight">Spaced Repetition</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">Scheduled: Wednesday</p>
                </div>
              </div>
              <span className="text-[10px] font-black text-slate-300">LOCKED</span>
            </div>
          </div>
        </div>

        {/* Action Matrix */}
        <div className="grid grid-cols-2 gap-6 children-animate">
          <button 
            onClick={() => setView('study')}
            className="flex flex-col items-center justify-center gap-5 bg-indigo-600 p-8 rounded-[3.5rem] text-white shadow-2xl shadow-indigo-300 hover:scale-[1.03] active:scale-95 transition-all group overflow-hidden"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform duration-500">📄</span>
            <span className="font-black text-[10px] uppercase tracking-widest leading-none">Knowledge Unit</span>
          </button>
          <button 
            onClick={() => setView('study')}
            className="flex flex-col items-center justify-center gap-5 bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-indigo-50 hover:scale-[1.03] active:scale-95 transition-all group overflow-hidden"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform duration-500">🎥</span>
            <span className="font-black text-[10px] uppercase tracking-widest text-indigo-950 leading-none">Visual Sync</span>
          </button>
          <button 
            onClick={() => setView('tutor')}
            className="col-span-2 flex items-center justify-center gap-6 bg-slate-900 p-8 rounded-[3.5rem] text-white shadow-2xl hover:bg-slate-800 active:scale-[0.99] transition-all group overflow-hidden"
          >
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform duration-500">🧞</div>
            <div className="text-left">
                <span className="font-black text-[10px] font-extrabold uppercase tracking-[0.4em] block mb-1 text-indigo-400">Layer 2 Access</span>
                <span className="font-black text-lg uppercase tracking-widest">Activate AI Tutor</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;