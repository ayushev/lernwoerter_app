import React from 'react';

export default function OptionButton({ label, state, onClick, disabled }) {
  let className = 'option-btn';
  if (state === 'correct') className += ' option-correct';
  if (state === 'wrong') className += ' option-wrong';

  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
