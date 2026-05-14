import React, { useState, useCallback, useEffect } from 'react';

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = 0.8;

  // Try to find a German voice
  const voices = window.speechSynthesis.getVoices();
  const deVoice = voices.find((v) => v.lang.startsWith('de'));
  if (deVoice) utterance.voice = deVoice;

  window.speechSynthesis.speak(utterance);
}

export default function DiktatMode({ words, progress, recordCorrect, recordWrong, onBack }) {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [finished, setFinished] = useState(false);

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
  }, [current, getFullWord]);

  const handleReveal = useCallback(() => {
    setRevealed(true);
  }, []);

  const handleResult = useCallback((knew) => {
    if (knew) {
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

  // Auto-speak when a new word appears
  useEffect(() => {
    if (current && !revealed && !finished) {
      const timer = setTimeout(() => speak(getFullWord(current)), 400);
      return () => clearTimeout(timer);
    }
  }, [current, revealed, finished, getFullWord]);

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
        <p className="diktat-hint">Hör genau zu und merke dir das Wort!</p>

        <button className="diktat-speaker" onClick={handleSpeak}>
          🔊
        </button>
        <p className="diktat-speaker-label">Nochmal hören</p>

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
