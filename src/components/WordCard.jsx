import React from 'react';

export default function WordCard({ word }) {
  if (!word) return null;

  const typeLabels = {
    artikel: 'Welcher Artikel?',
    'stummes-h': 'Mit H oder ohne H?',
    spelling: 'Welcher Buchstabe fehlt?'
  };

  return (
    <div className="word-card">
      <p className="word-hint">{typeLabels[word.type]}</p>
      <div className="word-display">
        {word.type === 'artikel' ? (
          <>
            <span className="blank">___</span>{' '}
            <span className="word-text">{word.word}</span>
          </>
        ) : (
          <span className="word-text">
            {word.display.split('___').map((part, i, arr) => (
              <React.Fragment key={i}>
                {part}
                {i < arr.length - 1 && <span className="blank">___</span>}
              </React.Fragment>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}
