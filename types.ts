
export type Difficulty = 'easy' | 'medium' | 'hard' | 'boss';
export type NotificationType = 'success' | 'error' | 'info';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  level: number;
  xp: number;
  streak: number;
}

export interface ConceptRelationship {
  sourceId: string;
  targetId: string;
  type: 'prerequisite' | 'related' | 'extension';
}

export interface Concept {
  id: string;
  name: string;
  description: string;
  masteryLevel: number; // 0-100
  lastReviewedAt: number | null;
  nextReviewAt: number | null;
  documentId: string;
  status: 'weak' | 'learning' | 'strong' | 'mastered';
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  interval: number; // Days until next review
  easeFactor: number; // SM-2 Ease Factor
  nextReviewAt: number;
  lastReviewedAt: number | null;
  repetitionCount: number;
}

export interface StudyDocument {
  id: string;
  title: string;
  content: string;
  summary?: string;
  type: 'pdf' | 'video' | 'notes' | 'audio';
  uploadedAt: number;
  concepts: Concept[];
  relationships: ConceptRelationship[];
  flashcards: Flashcard[];
}

/**
 * Represents a gamified learning path quest.
 */
export interface Quest {
  id: string;
  title: string;
  description: string;
  badge: string;
  isCompleted: boolean;
}

export interface QuizQuestion {
  id: string;
  conceptId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: Difficulty;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  accuracy: number;
  retention: number;
  speed: number;
  totalQuestionsAnswered: number;
  badges: string[];
  history: { date: string; xp: number }[];
}
