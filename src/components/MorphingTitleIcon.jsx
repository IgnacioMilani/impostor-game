import { useState, useEffect, useRef } from 'react';

const TITLE_ICONS = [
  { icon: 'domino_mask', color: '#ff4d6d' },
  { icon: 'theater_comedy', color: '#fbbf24' },
  { icon: 'visibility_off', color: '#a855f7' },
  { icon: 'forum', color: '#22d3ee' },
  { icon: 'quiz', color: '#4ade80' },
  { icon: 'psychology_alt', color: '#f472b6' },
  { icon: 'fingerprint', color: '#60a5fa' },
  { icon: 'person_search', color: '#2dd4bf' },
  { icon: 'gavel', color: '#fb923c' },
  { icon: 'how_to_vote', color: '#a3e635' },
  { icon: 'record_voice_over', color: '#38bdf8' },
  { icon: 'lightbulb', color: '#facc15' },
  { icon: 'question_mark', color: '#e879f9' },
  { icon: 'priority_high', color: '#f87171' },
  { icon: 'local_police', color: '#3b82f6' },
  { icon: 'shield', color: '#34d399' },
  { icon: 'fact_check', color: '#4ade80' },
  { icon: 'groups', color: '#818cf8' },
  { icon: 'sentiment_very_dissatisfied', color: '#fb7185' },
  { icon: 'masks', color: '#5eead4' },
];

const INITIAL_HOLD_MS = 10000;
const CYCLE_MS = 10000;
const ANIM_MS = 900;

function MorphingTitleIcon() {
  const [layers, setLayers] = useState([{ id: 0, index: 0 }]);
  const counterRef = useRef(0);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let intervalId;
    let removalId;

    const advance = () => {
      let next;
      do {
        next = Math.floor(Math.random() * TITLE_ICONS.length);
      } while (next === currentIndexRef.current && TITLE_ICONS.length > 1);

      currentIndexRef.current = next;
      counterRef.current += 1;
      const newLayer = { id: counterRef.current, index: next };

      setLayers((prev) => {
        const last = prev[prev.length - 1];
        return [{ ...last, outgoing: true }, newLayer];
      });

      clearTimeout(removalId);
      removalId = setTimeout(() => setLayers([newLayer]), ANIM_MS);
    };

    const startId = setTimeout(() => {
      advance();
      intervalId = setInterval(advance, CYCLE_MS);
    }, INITIAL_HOLD_MS);

    return () => {
      clearTimeout(startId);
      clearTimeout(removalId);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <span className="title-morph" aria-hidden="true">
      {layers.map((layer) => {
        const { icon, color } = TITLE_ICONS[layer.index];
        return (
          <span
            key={layer.id}
            className={`material-symbols-outlined title-morph__icon ${layer.outgoing ? 'is-out' : 'is-in'}`}
            style={{ color }}
          >
            {icon}
          </span>
        );
      })}
    </span>
  );
}

export default MorphingTitleIcon;
