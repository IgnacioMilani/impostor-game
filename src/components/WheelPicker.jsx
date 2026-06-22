import { useEffect, useRef } from 'react';

const WHEEL_ITEM_HEIGHT = 36;

function WheelPicker({ values, value, onChange, ariaLabel }) {
  const scrollRef = useRef(null);
  const settleTimer = useRef(null);
  const lockUntil = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = values.indexOf(value);
    if (idx < 0) return;
    const target = idx * WHEEL_ITEM_HEIGHT;
    if (Math.abs(el.scrollTop - target) > 1) {
      lockUntil.current = performance.now() + 250;
      el.scrollTop = target;
    }
  }, [value, values]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (performance.now() < lockUntil.current) return;
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const idx = Math.max(0, Math.min(values.length - 1, Math.round(el.scrollTop / WHEEL_ITEM_HEIGHT)));
      const next = values[idx];
      if (next !== value) onChange(next);
    }, 90);
  };

  return (
    <div className="wheel" role="listbox" aria-label={ariaLabel}>
      <div className="wheel-scroll" ref={scrollRef} onScroll={handleScroll}>
        {values.map((v) => (
          <div
            key={v}
            className={`wheel-item ${v === value ? 'is-selected' : ''}`}
            onClick={() => onChange(v)}
          >
            {String(v).padStart(2, '0')}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WheelPicker;
