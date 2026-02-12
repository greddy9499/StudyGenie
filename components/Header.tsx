
import React from 'react';
import { UserStats } from '../types';

interface HeaderProps {
  stats: UserStats;
}

const Header: React.FC<HeaderProps> = ({ stats }) => {
  const progressPercent = (stats.xp % 1000) / 10;

  return (
    <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between">
      <div className="flex flex-col">
        <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Global Status</h2>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-indigo-600">Level {stats.level}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600 font-medium">{stats.xp} XP Earned</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end min-w-[150px] hidden sm:flex">
          <div className="flex justify-between w-full mb-1">
            <span className="text-xs font-semibold text-indigo-600">Progress to Lvl {stats.level + 1}</span>
            <span className="text-xs font-bold">{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div 
              className="h-full xp-gradient transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold">John Doe</span>
            <span className="text-xs text-orange-500 font-bold flex items-center gap-1">
              🔥 {stats.streak} Day Streak
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
            <img src="https://picsum.photos/100/100" alt="Avatar" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
