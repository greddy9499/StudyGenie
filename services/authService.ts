
import { User } from '../types';

const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Sterling',
  username: 'alexsterling',
  email: 'alex@example.com',
  bio: 'Mastering the world, one concept at a time.',
  level: 12,
  xp: 12450,
  streak: 7
};

export const login = async (email: string, pass: string): Promise<{ user: User; token: string }> => {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 800));
  // Any non-empty email/pass will work for this demo
  if (email && pass) {
    return { user: MOCK_USER, token: 'mock-jwt-token' };
  }
  throw new Error("Invalid credentials");
};

export const logout = () => {
  localStorage.removeItem('sg_token');
  localStorage.removeItem('sg_user');
};

export const getCurrentUser = (): User | null => {
  try {
    const saved = localStorage.getItem('sg_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};
