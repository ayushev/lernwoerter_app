import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function Celebration({ trigger }) {
  useEffect(() => {
    if (!trigger) return;

    const duration = 1500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#ff0', '#0f0', '#00f', '#f0f', '#0ff']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#ff0', '#0f0', '#00f', '#f0f', '#0ff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [trigger]);

  return null;
}
