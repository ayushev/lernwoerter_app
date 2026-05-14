import { useState, useCallback } from 'react';

const STORAGE_KEY = 'woerter-progress';
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

export function useProgress() {
  const [progress, setProgress] = useState(loadProgress);

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
  }, []);

  const getRepetitionIds = useCallback(() => {
    return Object.entries(progress)
      .filter(([, v]) => v.inRepetition)
      .map(([id]) => id);
  }, [progress]);

  const resetProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProgress({});
  }, []);

  return { progress, recordCorrect, recordWrong, getRepetitionIds, resetProgress };
}
