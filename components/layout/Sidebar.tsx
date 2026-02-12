
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setTab: (t: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setTab, onLogout }) => {
  const menu = [
    { id: 'dashboard', icon: '✦', label: 'Overview' },
    { id: 'study', icon: '📂', label: 'Knowledge' },
    { id: 'quests', icon: '⚔️', label: 'Quests' },
    { id: 'quiz', icon: '🔥', label: 'Arena' },
    { id: 'tutor', icon: '🤖', label: 'Genie' },
    { id: 'progress', icon: '📈', label: 'Growth' },
  ];

  return (
    <nav className="w-24 md:w-72 bg-white border-r border-slate-50 flex flex-col h-full z-20 relative">
      <div className="p-10 flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl shadow-indigo-200/50 transform hover:rotate-6 transition-transform cursor-pointer">
          🧞
        </div>
        <div className="hidden md:block">
          <span className="block font-extrabold text-xl tracking-tighter text-indigo-950 leading-none">StudyGenie</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">v2.5 Professional</span>
        </div>
      </div>

      <div className="flex-1 px-6 space-y-2 mt-4">
        {menu.map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`w-full flex items-center gap-5 px-5 py-4 rounded-2xl transition-all duration-300 group ${
              activeTab === item.id 
              ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200 active-nav-glow' 
              : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'
            }`}
          >
            <span className={`text-xl transition-transform group-hover:scale-110 ${activeTab === item.id ? 'scale-110' : ''}`}>
              {item.icon}
            </span>
            <span className="hidden md:block text-sm font-bold tracking-tight">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-6 mx-4 mb-6 space-y-2 bg-slate-50 rounded-[2rem] border border-slate-100/50">
        <button 
          onClick={() => setTab('profile')}
          className={`w-full flex items-center gap-4 px-5 py-3 rounded-xl transition-all ${
            activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'
          }`}
        >
          <span className="text-lg">👤</span>
          <span className="hidden md:block text-xs font-bold uppercase tracking-widest">Account</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-5 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all group"
        >
          <span className="text-lg group-hover:translate-x-1 transition-transform">🚪</span>
          <span className="hidden md:block text-xs font-bold uppercase tracking-widest">Sign Out</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
