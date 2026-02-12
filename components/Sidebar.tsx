
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'library', label: 'Library', icon: '📚' },
    { id: 'quests', label: 'Quests', icon: '🗺️' },
    { id: 'study', label: 'Study Arena', icon: '⚔️' },
    { id: 'tutor', label: 'AI Tutor', icon: '🤖' },
  ];

  return (
    <nav className="w-20 md:w-64 bg-white border-r border-slate-200 flex flex-col h-full z-10">
      <div className="p-6 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-200">
          🧞
        </div>
        <span className="hidden md:block font-bold text-xl tracking-tight text-indigo-900">StudyGenie</span>
      </div>
      
      <div className="flex-1 px-3 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="hidden md:block">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-slate-100 hidden md:block">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl text-white">
          <p className="text-xs font-medium opacity-80 uppercase tracking-wider mb-1">Current Goal</p>
          <p className="font-semibold text-sm mb-3">Master 5 New Concepts</p>
          <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white w-3/5 rounded-full"></div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
