import { useState, useCallback, useRef } from 'react';
import { shuffle } from '../utils/shuffle';

export function useWordPicker(words, getRepetitionIds) {
  const [currentWord, setCurrentWord] = useState(null);
  const seenRef = useRef(new Set());
  const queueRef = useRef([]);

  const pickNext = useCallback(() => {
    const repIds = getRepetitionIds();
    const repWords = words.filter((w) => repIds.includes(w.id));
    const unseenWords = words.filter(
      (w) => !seenRef.current.has(w.id) && !repIds.includes(w.id)
    );

    // 40% chance to show a repetition word if available
    let pool;
    if (repWords.length > 0 && (Math.random() < 0.4 || unseenWords.length === 0)) {
      pool = repWords;
    } else if (unseenWords.length > 0) {
      pool = unseenWords;
    } else if (repWords.length > 0) {
      pool = repWords;
    } else {
      // All done — reshuffle everything
      seenRef.current.clear();
      pool = words;
    }

    if (queueRef.current.length === 0) {
      queueRef.current = shuffle(pool);
    }

    const next = queueRef.current.pop();
    seenRef.current.add(next.id);
    setCurrentWord(next);
    return next;
  }, [words, getRepetitionIds]);

  const startSession = useCallback((category) => {
    seenRef.current.clear();
    queueRef.current = [];
    const filtered = category === 'all'
      ? words
      : words.filter((w) => w.type === category);
    const shuffled = shuffle(filtered);
    queueRef.current = shuffled;
    const first = queueRef.current.pop();
    if (first) {
      seenRef.current.add(first.id);
      setCurrentWord(first);
    }
  }, [words]);

  return { currentWord, pickNext, startSession };
}
