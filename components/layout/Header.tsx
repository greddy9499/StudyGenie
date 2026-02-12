
import React from 'react';
import { User, UserStats } from '../../types';

interface HeaderProps {
  user: User | null;
  stats: UserStats;
}

const Header: React.FC<HeaderProps> = ({ user, stats }) => {
  const progressPercent = (stats.xp % 1000) / 10;

  return (
    <header className="h-24 border-b border-slate-50 bg-white/60 backdrop-blur-xl sticky top-0 z-10 px-10 flex items-center justify-between">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <h2 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">Global Resonance</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl font-black text-indigo-950 tracking-tight">Level {stats.level}</span>
          <div className="h-4 w-px bg-slate-100"></div>
          <span className="text-slate-500 font-bold text-sm">{stats.xp.toLocaleString()} Total XP</span>
        </div>
      </div>

      <div className="flex items-center gap-10">
        <div className="flex flex-col items-end min-w-[220px] hidden lg:flex">
          <div className="flex justify-between w-full mb-2">
            <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest">Mastery Progress</span>
            <span className="text-[10px] font-black text-slate-400">{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-[2px]">
            <div 
              className="h-full xp-bar-flow rounded-full transition-all duration-1000 ease-in-out" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center gap-5 pl-8 border-l border-slate-100">
          <div className="flex flex-col items-end">
            <span className="text-sm font-extrabold text-slate-900 tracking-tight">{user?.name || 'Academic'}</span>
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 bg-orange-50 rounded-md">
                <span className="text-[9px] text-orange-600 font-black uppercase tracking-tighter">
                  🔥 {stats.streak} Day Heat
                </span>
              </div>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border-2 border-white shadow-xl shadow-indigo-100/30 overflow-hidden transform hover:scale-105 transition-transform cursor-pointer">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="Avatar" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
