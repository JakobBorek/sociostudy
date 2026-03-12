import { useState, useEffect } from "react";

interface Progress {
  knownCards: string[];
  learningCards: string[];
  quizScores: { date: string; score: number; total: number; unit: string }[];
  streak: number;
  lastStudyDate: string | null;
}

const DEFAULT_PROGRESS: Progress = {
  knownCards: [],
  learningCards: [],
  quizScores: [],
  streak: 0,
  lastStudyDate: null,
};

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(() => {
    try {
      const saved = localStorage.getItem("sociostudy-progress");
      return saved ? JSON.parse(saved) : DEFAULT_PROGRESS;
    } catch {
      return DEFAULT_PROGRESS;
    }
  });

  useEffect(() => {
    localStorage.setItem("sociostudy-progress", JSON.stringify(progress));
  }, [progress]);

  const markCardKnown = (cardId: string) => {
    setProgress((p) => ({
      ...p,
      knownCards: [...new Set([...p.knownCards, cardId])],
      learningCards: p.learningCards.filter((id) => id !== cardId),
    }));
  };

  const markCardLearning = (cardId: string) => {
    setProgress((p) => ({
      ...p,
      learningCards: [...new Set([...p.learningCards, cardId])],
      knownCards: p.knownCards.filter((id) => id !== cardId),
    }));
  };

  const addQuizScore = (score: number, total: number, unit: string) => {
    setProgress((p) => ({
      ...p,
      quizScores: [
        ...p.quizScores,
        { date: new Date().toISOString(), score, total, unit },
      ],
    }));
  };

  const updateStreak = () => {
    const today = new Date().toDateString();
    setProgress((p) => {
      if (p.lastStudyDate === today) return p;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isConsecutive = p.lastStudyDate === yesterday.toDateString();
      return {
        ...p,
        streak: isConsecutive ? p.streak + 1 : 1,
        lastStudyDate: today,
      };
    });
  };

  return {
    progress,
    markCardKnown,
    markCardLearning,
    addQuizScore,
    updateStreak,
  };
}
