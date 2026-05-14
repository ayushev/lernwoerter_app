import { useState, useCallback } from 'react';

const STORAGE_KEY = 'woerter-progress';
const STATS_KEY = 'woerter-stats';
const REQUIRED_STREAK = 3;

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : { totalCorrect: 0, totalAnswered: 0 };
  } catch {
    return { totalCorrect: 0, totalAnswered: 0 };
  }
}

function saveStats(stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function useProgress() {
  const [progress, setProgress] = useState(loadProgress);
  const [stats, setStats] = useState(loadStats);

  const recordCorrect = useCallback((wordId) => {
    setProgress((prev) => {
      const entry = prev[wordId] || { streak: 0, mistakes: 0, inRepetition: false };
      const newStreak = entry.streak + 1;
      const inRepetition = entry.inRepetition && newStreak < REQUIRED_STREAK;
      const next = {
        ...prev,
        [wordId]: { ...entry, streak: newStreak, inRepetition }
      };
      saveProgress(next);
      return next;
    });
    setStats((prev) => {
      const next = { totalCorrect: prev.totalCorrect + 1, totalAnswered: prev.totalAnswered + 1 };
      saveStats(next);
      return next;
    });
  }, []);

  const recordWrong = useCallback((wordId) => {
    setProgress((prev) => {
      const entry = prev[wordId] || { streak: 0, mistakes: 0, inRepetition: false };
      const next = {
        ...prev,
        [wordId]: { ...entry, streak: 0, mistakes: entry.mistakes + 1, inRepetition: true }
      };
      saveProgress(next);
      return next;
    });
    setStats((prev) => {
      const next = { ...prev, totalAnswered: prev.totalAnswered + 1 };
      saveStats(next);
      return next;
    });
  }, []);

  const getRepetitionIds = useCallback(() => {
    return Object.entries(progress)
      .filter(([, v]) => v.inRepetition)
      .map(([id]) => id);
  }, [progress]);

  const resetProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STATS_KEY);
    setProgress({});
    setStats({ totalCorrect: 0, totalAnswered: 0 });
  }, []);

  return { progress, stats, recordCorrect, recordWrong, getRepetitionIds, resetProgress };
}
