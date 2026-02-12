
import React, { useState } from 'react';
import { User, UserStats, StudyDocument } from '../../types.ts';

interface ProfileProps {
  user: User | null;
  stats: UserStats;
  documents: StudyDocument[];
  setView: (view: string) => void;
  onUpdateUser: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, stats, documents, setView, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'grid' | 'badges'>('grid');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    avatarSeed: user?.name || 'Genie'
  });

  const handleSave = () => {
    if (user) {
      onUpdateUser({
        ...user,
        name: formData.name,
        username: formData.username,
        bio: formData.bio
      });
      setIsEditing(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-slide-up pb-20 px-4 md:px-0">
      {/* Instagram-Style Header */}
      <header className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16 pt-4">
        {/* Avatar Section */}
        <div className="relative group">
          <div className="w-28 h-28 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-xl">
            <div className="w-full h-full rounded-full border-[3px] border-white overflow-hidden bg-slate-100">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.avatarSeed}`} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
          {isEditing && (
            <button 
              onClick={() => setFormData({...formData, avatarSeed: Math.random().toString(36).substring(7)})}
              className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-lg border border-slate-100 hover:scale-110 transition-all text-sm"
              title="Shuffle Look"
            >
              🎭
            </button>
          )}
        </div>

        {/* Info & Stats Section */}
        <div className="flex-1 space-y-6 flex flex-col items-center md:items-start">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <h2 className="text-xl md:text-2xl font-light text-slate-800 tracking-tight">
              {isEditing ? (
                <div className="flex items-center bg-slate-100 rounded-lg px-2 py-1">
                  <span className="text-slate-400 font-medium text-sm mr-1">@</span>
                  <input 
                    className="bg-transparent border-none focus:ring-0 text-slate-800 text-lg w-32 outline-none font-medium"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                  />
                </div>
              ) : (
                `@${user.username}`
              )}
            </h2>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleSave}
                    className="px-6 py-1.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-1.5 bg-slate-100 text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-1.5 bg-white border border-slate-200 text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                  >
                    Edit Profile
                  </button>
                  <button 
                    onClick={() => setView('settings')}
                    className="p-2 text-xl hover:rotate-90 transition-transform duration-500"
                    title="Settings"
                  >
                    ⚙️
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-8 md:gap-12">
            <div className="flex flex-col md:flex-row md:gap-1.5 items-center">
              <span className="font-bold text-lg">{documents.length}</span>
              <span className="text-slate-500 text-sm md:text-base">units</span>
            </div>
            <div className="flex flex-col md:flex-row md:gap-1.5 items-center">
              <span className="font-bold text-lg">{stats.level}</span>
              <span className="text-slate-500 text-sm md:text-base">level</span>
            </div>
            <div className="flex flex-col md:flex-row md:gap-1.5 items-center">
              <span className="font-bold text-lg">{stats.streak}</span>
              <span className="text-slate-500 text-sm md:text-base">streak</span>
            </div>
          </div>

          <div className="text-center md:text-left space-y-1 max-w-md">
            {isEditing ? (
              <div className="space-y-3">
                <input 
                  className="w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Display Name"
                />
                <textarea 
                  className="w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none"
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  placeholder="Bio"
                />
              </div>
            ) : (
              <>
                <p className="font-bold text-indigo-950 text-base">{user.name}</p>
                <p className="text-slate-700 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                  {user.bio}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-1 mt-2">
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                    {stats.xp.toLocaleString()} resonance points
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="border-t border-slate-200 mt-12">
        <div className="flex justify-center gap-16">
          <button 
            onClick={() => setActiveTab('grid')}
            className={`flex items-center gap-2 py-4 border-t-2 transition-all -mt-[2px] ${activeTab === 'grid' ? 'border-slate-800 text-slate-900' : 'border-transparent text-slate-400'}`}
          >
            <span className="text-sm">🖼️</span>
            <span className="text-xs font-black uppercase tracking-widest">Knowledge</span>
          </button>
          <button 
            onClick={() => setActiveTab('badges')}
            className={`flex items-center gap-2 py-4 border-t-2 transition-all -mt-[2px] ${activeTab === 'badges' ? 'border-slate-800 text-slate-900' : 'border-transparent text-slate-400'}`}
          >
            <span className="text-sm">🏅</span>
            <span className="text-xs font-black uppercase tracking-widest">Badges</span>
          </button>
        </div>
      </div>

      <main className="animate-fade-in">
        {activeTab === 'grid' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {documents.map(doc => {
              const avgMastery = Math.round(doc.concepts.reduce((a, b) => a + b.masteryLevel, 0) / (doc.concepts.length || 1));
              return (
                <div 
                  key={doc.id} 
                  onClick={() => setView('study')}
                  className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                      {doc.type === 'video' ? '🎬' : doc.type === 'audio' ? '🎙️' : '📑'}
                    </div>
                    <div className="text-right">
                       <span className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Mastery</span>
                       <span className={`text-xl font-black ${avgMastery >= 90 ? 'text-emerald-500' : avgMastery >= 60 ? 'text-indigo-600' : 'text-amber-500'}`}>
                         {avgMastery}%
                       </span>
                    </div>
                  </div>
                  
                  <h4 className="font-black text-indigo-950 tracking-tight text-lg mb-2 line-clamp-1">{doc.title}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{doc.concepts.length} Concept Nodes</p>
                  
                  <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden p-[2px] border border-slate-100">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${avgMastery >= 90 ? 'bg-emerald-500' : avgMastery >= 60 ? 'bg-indigo-600' : 'bg-amber-500'}`} 
                      style={{ width: `${avgMastery}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
            {documents.length === 0 && (
              <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold italic text-sm">No knowledge units uploaded yet.</p>
                <button 
                  onClick={() => setView('study')}
                  className="mt-4 text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline"
                >
                  Start your first session
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-8">
            {stats.badges.map((badge, i) => (
              <div key={i} className="flex flex-col items-center gap-4 group">
                <div className="w-20 h-20 md:w-28 md:h-28 bg-white rounded-full premium-shadow flex items-center justify-center text-4xl md:text-5xl border border-slate-50 group-hover:scale-110 transition-transform duration-300">
                   {badge.includes('Sage') ? '🧙‍♂️' : badge.includes('Scholar') ? '📚' : badge.includes('Arena') ? '🔥' : '🎖️'}
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-900 block">{badge}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase mt-1">unlocked</span>
                </div>
              </div>
            ))}
            {stats.badges.length === 0 && (
              <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold italic text-sm">Earn badges by completing Quests and Boss trials.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
