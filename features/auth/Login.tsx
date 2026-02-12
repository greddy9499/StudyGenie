
import React, { useState } from 'react';
import { User, NotificationType } from '../../types';
import { login } from '../../services/authService';

interface LoginProps {
  onLogin: (u: User) => void;
  notify: (msg: string, type: NotificationType) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, notify }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { user } = await login(email, password);
      onLogin(user);
    } catch (err) {
      setError("We couldn't find an account with those credentials.");
      notify("Login failed. Check your details and try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-sm bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-100/40 border border-slate-100 animate-slide-up premium-shadow">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg shadow-indigo-200 mb-6 animate-pulse-slow">
            🧞
          </div>
          <h1 className="text-2xl font-black text-indigo-950 tracking-tight">StudyGenie AI</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to master your skills</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold animate-fade-in">
              {error}
            </div>
          )}
          <div className="group">
            <input 
              type="email" 
              placeholder="Email address" 
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all duration-300 text-sm"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="group">
            <input 
              type="password" 
              placeholder="Password" 
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all duration-300 text-sm"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
          <button className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all duration-300 hover:shadow-md">
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
            Continue with Google
          </button>
          <div className="text-center">
            <button className="text-xs font-semibold text-indigo-600 hover:underline transition-all">Forgot password?</button>
          </div>
        </div>
      </div>
      <p className="mt-8 text-sm text-slate-400 animate-fade-in delay-500">
        Don't have an account? <button className="font-bold text-indigo-600 hover:underline transition-all">Create one</button>
      </p>
    </div>
  );
};

export default Login;
