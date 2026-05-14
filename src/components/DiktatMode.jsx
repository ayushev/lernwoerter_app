import React, { useState, useCallback, useEffect, useRef } from 'react';
import { playCorrectSound } from '../utils/sounds';

// Audio element fallback for browsers without speechSynthesis (e.g. Kindle Silk)
const audioRef = { current: null };

function speak(text) {
  // Method 1: native speechSynthesis
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.8;

    const voices = window.speechSynthesis.getVoices();
    const deVoice = voices.find((v) => v.lang.startsWith('de'));
    if (deVoice) utterance.voice = deVoice;

    // Check if we actually have voices — if not, fall back
    if (voices.length > 0) {
      window.speechSynthesis.speak(utterance);
      return;
    }
  }

  // Method 2: Audio element with Google Translate TTS
  try {
    const encoded = encodeURIComponent(text);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=de&client=tw-ob`;
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    audioRef.current.src = url;
    audioRef.current.play().catch(() => {
      // Audio blocked or unavailable — ignore silently
    });
  } catch {
    // No audio available
  }
}

export default function DiktatMode({ words, progress, recordCorrect, recordWrong, onBack }) {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [finished, setFinished] = useState(false);
  const [needsTap, setNeedsTap] = useState(true);

  // Load voices (some browsers load async)
  useEffect(() => {
    window.speechSynthesis?.getVoices();
    const handleVoices = () => window.speechSynthesis?.getVoices();
    window.speechSynthesis?.addEventListener?.('voiceschanged', handleVoices);
    return () => window.speechSynthesis?.removeEventListener?.('voiceschanged', handleVoices);
  }, []);

  // Initialize queue on mount
  useEffect(() => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setQueue(shuffled.slice(1));
    setCurrent(shuffled[0]);
    setRevealed(false);
    setFinished(false);
    setScore({ correct: 0, total: 0 });
  }, [words]);

  const getFullWord = useCallback((word) => {
    if (!word) return '';
    // For nouns, include the Artikel
    const isNoun = word.word[0] === word.word[0].toUpperCase() && word.type === 'artikel';
    if (isNoun) return `${word.correct} ${word.word}`;
    return word.word;
  }, []);

  const handleSpeak = useCallback(() => {
    if (!current) return;
    speak(getFullWord(current));
    setNeedsTap(false);
  }, [current, getFullWord]);

  const handleReveal = useCallback(() => {
    setRevealed(true);
  }, []);

  const handleResult = useCallback((knew) => {
    if (knew) {
      playCorrectSound();
      recordCorrect(current.id);
      setScore((s) => ({ correct: s.correct + 1, total: s.total + 1 }));
    } else {
      recordWrong(current.id);
      setScore((s) => ({ ...s, total: s.total + 1 }));
    }

    // Next word
    if (queue.length === 0) {
      setFinished(true);
      setCurrent(null);
      return;
    }

    const next = queue[0];
    setQueue((q) => q.slice(1));
    setCurrent(next);
    setRevealed(false);
  }, [current, queue, recordCorrect, recordWrong]);

  // No auto-speak — mobile browsers block autoplay without user gesture

  if (finished) {
    const percent = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    return (
      <div className="completion-screen">
        <div className="completion-emoji">📝</div>
        <h2 className="completion-title">Diktat fertig!</h2>
        <p className="completion-message">
          {percent >= 80 ? 'Super gemacht!' : 'Weiter üben!'}
        </p>
        <div className="completion-stats">
          <div className="stat-box">
            <span className="stat-number">{score.correct}</span>
            <span className="stat-label">Gewusst</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{score.total - score.correct}</span>
            <span className="stat-label">Nicht gewusst</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{percent}%</span>
            <span className="stat-label">Ergebnis</span>
          </div>
        </div>
        <button className="completion-btn" onClick={onBack}>
          ← Zurück zum Menü
        </button>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="quiz-screen">
      <div className="quiz-header">
        <button className="back-btn" onClick={onBack}>← Zurück</button>
        <div className="progress-bar">
          <span className="progress-text">
            {score.correct} / {score.total} gewusst
          </span>
        </div>
      </div>

      <div className="diktat-card">
        <p className="diktat-hint">
          {needsTap ? 'Tippe auf den Lautsprecher!' : 'Hör genau zu und merke dir das Wort!'}
        </p>

        <button className={`diktat-speaker ${needsTap ? 'diktat-speaker-pulse' : ''}`} onClick={handleSpeak}>
          🔊
        </button>
        <p className="diktat-speaker-label">
          {needsTap ? 'Tippe zum Hören' : 'Nochmal hören'}
        </p>

        {!revealed ? (
          <button className="diktat-reveal-btn" onClick={handleReveal}>
            Antwort zeigen
          </button>
        ) : (
          <div className="diktat-answer">
            <p className="diktat-word">{getFullWord(current)}</p>
            <p className="diktat-question">Hast du es gewusst?</p>
            <div className="diktat-buttons">
              <button
                className="diktat-yes"
                onClick={() => handleResult(true)}
              >
                ✅ Ja!
              </button>
              <button
                className="diktat-no"
                onClick={() => handleResult(false)}
              >
                ❌ Nein
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
