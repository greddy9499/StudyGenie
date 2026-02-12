
import { Flashcard } from "../types";

/**
 * SuperMemo-2 (SM-2) Algorithm implementation
 * 
 * Quality (q) mapping:
 * 5: perfect response (Easy)
 * 4: correct response after a hesitation (Good)
 * 3: correct response recalled with serious difficulty (Hard)
 * 2: incorrect response; where the correct one seemed easy to recall (Again/Hard)
 * 1: incorrect response; the correct one remembered (Again)
 * 0: complete blackout (Again)
 */
export const calculateSM2 = (card: Flashcard, quality: number): Flashcard => {
  let { interval, easeFactor, repetitionCount } = card;

  if (quality >= 3) {
    // Correct response
    if (repetitionCount === 0) {
      interval = 1;
    } else if (repetitionCount === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitionCount += 1;
  } else {
    // Incorrect response
    repetitionCount = 0;
    interval = 1;
  }

  // Ease Factor adjustment: EF':=EF+(0.1-(5-q)*(0.08+(5-q)*0.02))
  // Simplified logic for quality mapping
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  // Constrain EF to minimum of 1.3
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReviewAt = Date.now() + interval * 86400000;

  return {
    ...card,
    interval,
    easeFactor,
    repetitionCount,
    lastReviewedAt: Date.now(),
    nextReviewAt
  };
};

export const isCardDue = (card: Flashcard): boolean => {
  return card.nextReviewAt <= Date.now();
};
