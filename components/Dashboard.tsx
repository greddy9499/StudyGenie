
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { UserStats, Concept, StudyDocument } from '../types';

interface DashboardProps {
  stats: UserStats;
  concepts: Concept[];
  documents: StudyDocument[];
  onSelectDoc: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, concepts, documents, onSelectDoc }) => {
  const activityData = [
    { day: 'Mon', xp: 400 },
    { day: 'Tue', xp: 300 },
    { day: 'Wed', xp: 800 },
    { day: 'Thu', xp: 200 },
    { day: 'Fri', xp: 550 },
    { day: 'Sat', xp: 1100 },
    { day: 'Sun', xp: 950 },
  ];

  const skillsData = concepts.slice(0, 6).map(c => ({
    subject: c.name.length > 12 ? c.name.substring(0, 10) + '...' : c.name,
    A: c.masteryLevel,
    fullMark: 100,
  }));

  const masteryAvg = concepts.length > 0 
    ? Math.round(concepts.reduce((acc, c) => acc + c.masteryLevel, 0) / concepts.length)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="md:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg Mastery', value: `${masteryAvg}%`, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: '🎯' },
          { label: 'Accuracy', value: `${stats.accuracy}%`, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '📈' },
          { label: 'Total Questions', value: stats.totalQuestionsAnswered, color: 'text-amber-600', bg: 'bg-amber-50', icon: '❓' },
          { label: 'Days Active', value: stats.streak, color: 'text-rose-600', bg: 'bg-rose-50', icon: '🔥' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className={`w-10 h-10 ${item.bg} rounded-2xl flex items-center justify-center text-xl`}>{item.icon}</span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">{item.label}</h3>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Learning Activity</h3>
            <p className="text-sm text-slate-400">XP earned over the last 7 days</p>
          </div>
          <select className="bg-slate-50 border-none rounded-lg text-sm font-medium px-4 py-2 text-slate-600">
            <option>Last 7 Days</option>
            <option>Last Month</option>
          </select>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="colorXP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="xp" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorXP)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Badges Earned</h3>
          <div className="grid grid-cols-3 gap-3">
            {stats.badges.map((badge, i) => (
              <div key={i} className="flex flex-col items-center gap-2" title={badge}>
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg border-4 border-white">
                  {i % 3 === 0 ? '🏅' : i % 3 === 1 ? '💎' : '🔥'}
                </div>
                <span className="text-[10px] font-black uppercase text-slate-500 text-center truncate w-full">{badge}</span>
              </div>
            ))}
            {stats.badges.length === 0 && <p className="text-slate-400 text-center py-4 col-span-3">No badges yet.</p>}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold text-slate-800 w-full mb-1">Knowledge Radar</h3>
          <p className="text-sm text-slate-400 w-full mb-8">Concept mastery distribution</p>
          <div className="h-[180px] w-full">
            {skillsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillsData}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis dataKey="subject" tick={{fill: '#64748b', fontSize: 8}} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} hide />
                  <Radar name="Mastery" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                Upload documents to see radar
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Documents</h3>
          <div className="space-y-4">
            {documents.slice(0, 3).map(doc => (
              <div key={doc.id} onClick={() => onSelectDoc(doc.id)} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-xl">📄</div>
                  <div>
                    <h4 className="font-bold text-slate-700">{doc.title}</h4>
                    <p className="text-xs text-slate-400">{doc.concepts.length} concepts identified</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-indigo-600 font-bold text-sm">
                    {Math.round(doc.concepts.reduce((a, b) => a + b.masteryLevel, 0) / (doc.concepts.length || 1))}% Mastery
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Mastery List</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {concepts.sort((a,b) => a.masteryLevel - b.masteryLevel).slice(0, 5).map(concept => (
              <div key={concept.id} className="group flex flex-col p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-slate-700">{concept.name}</h4>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    concept.masteryLevel > 70 ? 'bg-emerald-100 text-emerald-700' :
                    concept.masteryLevel > 30 ? 'bg-amber-100 text-amber-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {concept.masteryLevel > 70 ? 'Proficient' : concept.masteryLevel > 30 ? 'Developing' : 'Weak'}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      concept.masteryLevel > 70 ? 'bg-emerald-500' :
                      concept.masteryLevel > 30 ? 'bg-amber-500' :
                      'bg-rose-500'
                    }`}
                    style={{ width: `${concept.masteryLevel}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
