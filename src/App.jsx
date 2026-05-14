import React, { useState, useCallback } from 'react';
import words from './data/words.json';
import { useProgress } from './hooks/useProgress';
import { useWordPicker } from './hooks/useWordPicker';
import StartScreen from './components/StartScreen';
import WordCard from './components/WordCard';
import OptionButton from './components/OptionButton';
import Celebration from './components/Celebration';
import ProgressBar from './components/ProgressBar';
import CompletionScreen from './components/CompletionScreen';
import DiktatMode from './components/DiktatMode';
import { playCorrectSound } from './utils/sounds';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('start'); // 'start' | 'quiz' | 'diktat'
  const [optionStates, setOptionStates] = useState({});
  const [answered, setAnswered] = useState(false);
  const [celebrationKey, setCelebrationKey] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const { progress, stats, recordCorrect, recordWrong, getRepetitionIds, resetProgress } = useProgress();
  const { currentWord, completed, pickNext, startSession } = useWordPicker(words, getRepetitionIds);

  const handleStart = useCallback((category) => {
    setScore({ correct: 0, total: 0 });
    startSession(category);
    setScreen('quiz');
    setOptionStates({});
    setAnswered(false);
  }, [startSession]);

  const handleAnswer = useCallback((selected) => {
    if (answered) return;
    setAnswered(true);

    const correct = currentWord.correct;
    const isCorrect = selected === correct;

    // Build option states
    const states = {};
    currentWord.options.forEach((opt) => {
      if (opt === correct) {
        states[opt] = 'correct';
      } else if (opt === selected && !isCorrect) {
        states[opt] = 'wrong';
      }
    });
    setOptionStates(states);

    if (isCorrect) {
      playCorrectSound();
      recordCorrect(currentWord.id);
      setCelebrationKey((k) => k + 1);
      setScore((s) => ({ correct: s.correct + 1, total: s.total + 1 }));
    } else {
      recordWrong(currentWord.id);
      setScore((s) => ({ ...s, total: s.total + 1 }));
    }

    // Auto-advance after delay
    const delay = isCorrect ? 1500 : 2500;
    setTimeout(() => {
      pickNext();
      setOptionStates({});
      setAnswered(false);
    }, delay);
  }, [answered, currentWord, recordCorrect, recordWrong, pickNext]);

  const handleReset = useCallback(() => {
    if (window.confirm('Wirklich alles zurücksetzen?')) {
      resetProgress();
    }
  }, [resetProgress]);

  const handleBack = useCallback(() => {
    setScreen('start');
    setOptionStates({});
    setAnswered(false);
  }, []);

  const handleStartDiktat = useCallback(() => {
    setScore({ correct: 0, total: 0 });
    setScreen('diktat');
  }, []);

  const repetitionCount = getRepetitionIds().length;

  if (screen === 'start') {
    return (
      <StartScreen
        onStart={handleStart}
        onStartDiktat={handleStartDiktat}
        onReset={handleReset}
        repetitionCount={repetitionCount}
        stats={stats}
      />
    );
  }

  if (screen === 'diktat') {
    return (
      <DiktatMode
        words={words}
        progress={progress}
        recordCorrect={recordCorrect}
        recordWrong={recordWrong}
        onBack={handleBack}
      />
    );
  }

  if (completed) {
    return (
      <CompletionScreen
        score={score}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="quiz-screen">
      <div className="quiz-header">
        <button className="back-btn" onClick={handleBack}>← Zurück</button>
        <ProgressBar correct={score.correct} total={score.total} />
      </div>

      {currentWord && (
        <>
          <WordCard word={currentWord} />

          <div className={`options-grid options-grid-${currentWord.options.length}`}>
            {currentWord.options.map((opt) => (
              <OptionButton
                key={opt}
                label={opt}
                state={optionStates[opt] || 'neutral'}
                onClick={() => handleAnswer(opt)}
                disabled={answered}
              />
            ))}
          </div>

          {answered && optionStates[Object.keys(optionStates).find(k => optionStates[k] === 'wrong')] && (
            <div className="feedback-wrong">
              <p>
                Das richtige Wort ist:{' '}
                <strong>
                  {currentWord.type === 'artikel'
                    ? `${currentWord.correct} ${currentWord.word}`
                    : currentWord.word}
                </strong>
              </p>
            </div>
          )}

          <Celebration trigger={celebrationKey} />
        </>
      )}
    </div>
  );
}
