import React from 'react';

export default function CompletionScreen({ score, onBack }) {
  const percent = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  let message, emoji;
  if (percent === 100) {
    message = 'Perfekt! Alles richtig!';
    emoji = '🏆';
  } else if (percent >= 80) {
    message = 'Super gemacht!';
    emoji = '🌟';
  } else if (percent >= 50) {
    message = 'Gut gemacht! Weiter üben!';
    emoji = '💪';
  } else {
    message = 'Übung macht den Meister!';
    emoji = '📚';
  }

  return (
    <div className="completion-screen">
      <div className="completion-emoji">{emoji}</div>
      <h2 className="completion-title">Geschafft!</h2>
      <p className="completion-message">{message}</p>
      <div className="completion-stats">
        <div className="stat-box">
          <span className="stat-number">{score.correct}</span>
          <span className="stat-label">Richtig</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">{score.total - score.correct}</span>
          <span className="stat-label">Falsch</span>
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
