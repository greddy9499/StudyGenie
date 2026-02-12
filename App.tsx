
import * as React from 'react';
import { User, StudyDocument, UserStats, NotificationType, Quest } from './types.ts';
import Sidebar from './components/layout/Sidebar.tsx';
import Header from './components/layout/Header.tsx';
import Login from './features/auth/Login.tsx';
import Dashboard from './features/dashboard/Dashboard.tsx';
import StudyView from './features/study/StudyView.tsx';
import QuizArena from './features/quiz/QuizArena.tsx';
import Analytics from './features/progress/Analytics.tsx';
import ChatTutor from './features/tutor/ChatTutor.tsx';
import Profile from './features/profile/Profile.tsx';
import Settings from './features/settings/Settings.tsx';
import Quests from './components/Quests.tsx';
import Notification from './components/ui/Notification.tsx';

const { useState, useEffect, useCallback } = React;

const App: React.FC = () => {
  const [view, setView] = useState<string>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [toast, setToast] = useState<{ message: string; type: NotificationType } | null>(null);
  const [xpGains, setXpGains] = useState<{ id: number; amount: number }[]>([]);
  
  const [stats, setStats] = useState<UserStats>(() => {
    const defaultStats: UserStats = {
      xp: 0,
      level: 1,
      streak: 5,
      accuracy: 0,
      retention: 0,
      speed: 0,
      totalQuestionsAnswered: 0,
      badges: [],
      history: [
        { date: 'Mon', xp: 400 },
        { date: 'Tue', xp: 700 },
        { date: 'Wed', xp: 500 },
        { date: 'Thu', xp: 900 },
        { date: 'Fri', xp: 1200 },
      ]
    };
    try {
      const saved = localStorage.getItem('sg_stats_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultStats, ...parsed };
      }
      return defaultStats;
    } catch (e) {
      return defaultStats;
    }
  });

  const notify = useCallback((message: string, type: NotificationType = 'info') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    try {
      const savedDocs = localStorage.getItem('sg_docs_v3');
      if (savedDocs) {
        const parsed = JSON.parse(savedDocs);
        if (Array.isArray(parsed)) {
          setDocuments(parsed);
          if (parsed.length > 0) setActiveDocId(parsed[parsed.length - 1].id);
        }
      }
      
      const savedUser = localStorage.getItem('sg_user_v3');
      const token = localStorage.getItem('sg_token_v3');
      if (savedUser && token === 'active') {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser) {
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      }
    } catch (e) {
      console.error("Hydration error", e);
    }
  }, []);

  useEffect(() => {
    if (documents.length > 0 && !activeDocId) {
      setActiveDocId(documents[documents.length - 1].id);
    }
  }, [documents, activeDocId]);

  useEffect(() => {
    try {
      localStorage.setItem('sg_docs_v3', JSON.stringify(documents));
      localStorage.setItem('sg_stats_v3', JSON.stringify(stats));
      if (user) localStorage.setItem('sg_user_v3', JSON.stringify(user));
    } catch (e) {
      console.error("Persistence error", e);
    }
  }, [documents, stats, user]);

  useEffect(() => {
    const generatedQuests: Quest[] = documents.map(doc => ({
      id: `quest-${doc.id}`,
      title: `${doc.title} Mastery`,
      description: `Defeat the ${doc.title} Boss to earn your badge.`,
      badge: `${doc.title} Sage`,
      isCompleted: false
    }));
    setQuests(generatedQuests);
  }, [documents]);

  const addXP = useCallback((amount: number) => {
    const gainId = Date.now();
    setXpGains(prev => [...prev, { id: gainId, amount }]);
    
    setTimeout(() => {
      setXpGains(prev => prev.filter(g => g.id !== gainId));
    }, 1200);

    setStats(prev => {
      const newXp = prev.xp + amount;
      const newLevel = Math.floor(newXp / 1000) + 1;
      if (newLevel > prev.level) notify("Level Up! Level " + newLevel, "success");
      return { ...prev, xp: newXp, level: newLevel };
    });
  }, [notify]);

  const updateMastery = useCallback((conceptId: string, isCorrect: boolean) => {
    setDocuments(prev => prev.map(doc => ({
      ...doc,
      concepts: doc.concepts.map(c => {
        if (c.id !== conceptId) return c;
        const change = isCorrect ? 12 : -6;
        const newMastery = Math.min(100, Math.max(0, c.masteryLevel + change));
        return { ...c, masteryLevel: newMastery };
      })
    })));
  }, []);

  const handleBossDefeat = useCallback((questId: string, badge: string) => {
    addXP(1000);
    const docId = questId.replace('quest-', '');
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== docId) return doc;
      return {
        ...doc,
        concepts: doc.concepts.map(c => ({ ...c, masteryLevel: 100, status: 'mastered' }))
      };
    }));
    setStats(prev => ({
      ...prev,
      badges: [...prev.badges, badge]
    }));
  }, [addXP]);

  const handleAuth = (u: User) => {
    const userWithDefaults = {
      ...u,
      username: u.username || u.name.toLowerCase().replace(/\s/g, ''),
      bio: u.bio || "Mastering the world, one concept at a time."
    };
    setUser(userWithDefaults);
    setIsAuthenticated(true);
    localStorage.setItem('sg_token_v3', 'active');
    notify(`Welcome back, ${u.name.split(' ')[0]}`, "success");
  };

  if (!isAuthenticated) return <Login onLogin={handleAuth} notify={notify} />;

  return (
    <div className="flex h-screen bg-[#FDFDFF] text-slate-900 overflow-hidden relative">
      <Sidebar 
        activeTab={view} 
        setTab={setView} 
        onLogout={() => { 
          localStorage.clear(); 
          window.location.reload(); 
        }} 
      />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <Header user={user} stats={stats} />
        
        <div className="fixed top-24 right-10 z-[60] flex flex-col items-end pointer-events-none">
          {xpGains.map(gain => (
            <div key={gain.id} className="xp-gain-popup flex items-center gap-2 mb-2">
              <span className="text-2xl font-black text-indigo-600 drop-shadow-sm">+{gain.amount} XP</span>
              <span className="text-xl">✨</span>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth scrollbar-hide">
          <div className="max-w-7xl mx-auto pb-24">
            {view === 'dashboard' && <Dashboard user={user} stats={stats} documents={documents} setView={setView} />}
            {view === 'study' && (
              <StudyView 
                documents={documents} 
                setDocuments={setDocuments} 
                activeDocId={activeDocId}
                setActiveDocId={setActiveDocId}
                notify={notify} 
              />
            )}
            {view === 'quests' && (
              <Quests 
                quests={quests} 
                documents={documents} 
                onBossDefeated={handleBossDefeat} 
                onUpdateMastery={(id, val) => updateMastery(id, val > 0)} 
              />
            )}
            {view === 'quiz' && (
              <QuizArena 
                documents={documents} 
                onResult={(xp, conceptId, correct) => {
                  addXP(xp);
                  if (conceptId) updateMastery(conceptId, correct);
                }} 
                notify={notify} 
              />
            )}
            {view === 'progress' && <Analytics stats={stats} documents={documents} />}
            {view === 'tutor' && (
              <ChatTutor 
                documents={documents} 
                activeDocId={activeDocId}
                setActiveDocId={setActiveDocId}
                notify={notify} 
              />
            )}
            {view === 'profile' && <Profile user={user} stats={stats} documents={documents} setView={setView} onUpdateUser={setUser} />}
            {view === 'settings' && <Settings onLogout={() => { localStorage.clear(); window.location.reload(); }} />}
          </div>
        </div>
        {toast && (
          <Notification 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
