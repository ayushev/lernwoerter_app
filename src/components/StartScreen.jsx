import React from 'react';

const categoryLabels = {
  all: { emoji: '🌟', label: 'Alle Wörter' },
  artikel: { emoji: '📝', label: 'der / die / das' },
  'v-spelling': { emoji: '🔤', label: 'V-Wörter' },
  spelling: { emoji: '✏️', label: 'Knifflige Wörter' }
};

export default function StartScreen({ onStart, onReset, repetitionCount }) {
  return (
    <div className="start-screen">
      <div className="start-title">
        <span className="start-emoji">📚</span>
        <h1>Wörter Lernen</h1>
        <p className="start-subtitle">Wähle eine Kategorie!</p>
      </div>

      <div className="category-buttons">
        {Object.entries(categoryLabels).map(([key, { emoji, label }]) => (
          <button
            key={key}
            className="category-btn"
            onClick={() => onStart(key)}
          >
            <span className="cat-emoji">{emoji}</span>
            <span className="cat-label">{label}</span>
          </button>
        ))}
      </div>

      {repetitionCount > 0 && (
        <p className="rep-info">
          🔁 {repetitionCount} {repetitionCount === 1 ? 'Wort' : 'Wörter'} zum Wiederholen
        </p>
      )}

      <button className="reset-btn" onClick={onReset}>
        🗑️ Fortschritt zurücksetzen
      </button>
    </div>
  );
}
