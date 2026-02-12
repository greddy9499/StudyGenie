
import React, { useState } from 'react';

interface SettingsProps {
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifs, setNotifs] = useState(true);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h2 className="text-3xl font-black text-slate-900">Settings</h2>

      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        <div className="p-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Preferences</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 text-sm">Dark Mode</p>
                <p className="text-xs text-slate-400">Switch to a darker theme for night study</p>
              </div>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${darkMode ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 text-sm">Notifications</p>
                <p className="text-xs text-slate-400">Remind me about daily streaks and revision</p>
              </div>
              <button 
                onClick={() => setNotifs(!notifs)}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifs ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifs ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Account</h3>
          <div className="space-y-4">
            <button className="w-full text-left p-4 rounded-2xl hover:bg-slate-50 transition-colors flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">Change Password</span>
              <span className="text-slate-300">→</span>
            </button>
            <button className="w-full text-left p-4 rounded-2xl hover:bg-slate-50 transition-colors flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">Email Address</span>
              <span className="text-slate-300">→</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 text-rose-500">Danger Zone</h3>
          <div className="space-y-4 mt-4">
            <button className="w-full py-4 px-6 border border-rose-100 text-rose-600 rounded-2xl font-bold text-sm hover:bg-rose-50 transition-colors">
              Delete Account
            </button>
            <button 
              onClick={onLogout}
              className="w-full py-4 px-6 bg-rose-600 text-white rounded-2xl font-bold text-sm hover:bg-rose-700 transition-colors shadow-lg shadow-rose-100"
            >
              Sign Out
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
