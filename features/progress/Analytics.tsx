
import * as React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UserStats, StudyDocument } from '../../types';

interface AnalyticsProps {
  stats: UserStats;
  documents: StudyDocument[];
}

const Analytics: React.FC<AnalyticsProps> = ({ stats, documents }) => {
  return (
    <div className="space-y-12 animate-slide-up max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Layer 4: Progress Tracker</h2>
        <h1 className="text-4xl font-black text-indigo-950 tracking-tighter">Neuro Analytics</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Wireframe Match: XP Progression */}
        <div className="lg:col-span-8 bg-white p-12 rounded-[4rem] premium-shadow border border-slate-50 flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-lg font-black text-indigo-950">XP Progression Velocity</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Daily Accumulation Curve</p>
            </div>
            <div className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-black text-indigo-600">7-Day Analysis</div>
          </div>
          <div className="h-[400px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.history}>
                <defs>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={15} />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', padding: '20px' }}
                   itemStyle={{ fontWeight: 800, color: '#4f46e5' }}
                />
                <Area type="monotone" dataKey="xp" stroke="#4f46e5" strokeWidth={5} fillOpacity={1} fill="url(#colorXp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wireframe Match: Skill Scores */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-10 rounded-[3.5rem] premium-shadow border border-slate-50">
            <h3 className="text-sm font-black text-indigo-950 uppercase tracking-[0.2em] mb-10">Neural Skill Scores</h3>
            <div className="space-y-10">
               {[
                 { label: 'Retention', val: stats.retention || 82, color: 'bg-indigo-600' },
                 { label: 'Speed', val: stats.speed || 91, color: 'bg-orange-500' },
                 { label: 'Accuracy', val: stats.accuracy || 76, color: 'bg-emerald-500' },
               ].map(s => (
                 <div key={s.label} className="space-y-3">
                   <div className="flex justify-between items-end">
                     <span className="text-sm font-black text-indigo-950 uppercase tracking-tighter">{s.label}</span>
                     <span className="text-xs font-black text-slate-400">{s.val}%</span>
                   </div>
                   <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-[2px]">
                     <div 
                        className={`h-full rounded-full transition-all duration-[2s] ${s.color}`} 
                        style={{ width: `${s.val}%` }}
                     ></div>
                   </div>
                 </div>
               ))}
            </div>
            
            <div className="mt-12 pt-12 border-t border-slate-50">
               <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">🧠</div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Learning Pattern</p>
                    <p className="text-sm font-black text-indigo-950 tracking-tighter">Highly Recursive</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-indigo-950 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-6xl rotate-12 group-hover:rotate-0 transition-transform">💎</div>
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">Genie Standing</h3>
            <p className="text-4xl font-black tracking-tighter mb-2">#1,240</p>
            <p className="text-xs font-bold text-indigo-300">Top 4% Global Resonance</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
