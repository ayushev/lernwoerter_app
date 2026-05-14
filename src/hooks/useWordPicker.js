import { useState, useCallback, useRef } from 'react';
import { shuffle } from '../utils/shuffle';

export function useWordPicker(words, getRepetitionIds) {
  const [currentWord, setCurrentWord] = useState(null);
  const [completed, setCompleted] = useState(false);
  const seenRef = useRef(new Set());
  const queueRef = useRef([]);
  const filteredRef = useRef([]);

  const pickNext = useCallback(() => {
    const repIds = getRepetitionIds();
    const currentIds = filteredRef.current.map((w) => w.id);
    const repWords = filteredRef.current.filter((w) => repIds.includes(w.id));
    const unseenWords = filteredRef.current.filter(
      (w) => !seenRef.current.has(w.id) && !repIds.includes(w.id)
    );

    // If all seen and no repetitions left → completed
    if (unseenWords.length === 0 && repWords.length === 0) {
      setCompleted(true);
      setCurrentWord(null);
      return null;
    }

    let pool;
    if (repWords.length > 0 && (Math.random() < 0.4 || unseenWords.length === 0)) {
      pool = repWords;
    } else {
      pool = unseenWords;
    }

    if (queueRef.current.length === 0) {
      queueRef.current = shuffle(pool);
    }

    const next = queueRef.current.pop();
    seenRef.current.add(next.id);
    setCurrentWord(next);
    return next;
  }, [getRepetitionIds]);

  const startSession = useCallback((category) => {
    seenRef.current.clear();
    queueRef.current = [];
    setCompleted(false);
    const filtered = category === 'all'
      ? words
      : words.filter((w) => w.type === category);
    filteredRef.current = filtered;
    const shuffled = shuffle(filtered);
    queueRef.current = shuffled;
    const first = queueRef.current.pop();
    if (first) {
      seenRef.current.add(first.id);
      setCurrentWord(first);
    }
  }, [words]);

  return { currentWord, completed, pickNext, startSession };
}
