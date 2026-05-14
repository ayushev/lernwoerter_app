import React from 'react';

export default function ProgressBar({ correct, total }) {
  return (
    <div className="progress-bar">
      <span className="progress-stars">
        {'⭐'.repeat(Math.min(correct, 10))}
      </span>
      <span className="progress-text">
        {correct} / {total} richtig
      </span>
    </div>
  );
}
