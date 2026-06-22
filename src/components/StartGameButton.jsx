import { useState, useRef, useCallback, useEffect } from 'react';
import { playStartGameSound } from '../utils/gameAudio';

const PARTICLE_COUNT = 14;
const RIPPLE_LIFETIME = 600;
const PARTICLE_LIFETIME = 700;
const SHIMMER_ANIM_MS = 900;
const SHIMMER_MIN_DELAY_MS = 3000;
const SHIMMER_MAX_DELAY_MS = 10000;

function randomShimmerDelay() {
  return SHIMMER_MIN_DELAY_MS + Math.random() * (SHIMMER_MAX_DELAY_MS - SHIMMER_MIN_DELAY_MS);
}

function StartGameButton({ disabled, onLaunch }) {
  const buttonRef = useRef(null);
  const [ripples, setRipples] = useState([]);
  const [particles, setParticles] = useState([]);
  const [isLaunching, setIsLaunching] = useState(false);
  const [shimmerPlay, setShimmerPlay] = useState(false);
  const idRef = useRef(0);
  const shimmerTimeoutRef = useRef(null);
  const shimmerResetRef = useRef(null);

  const nextId = () => {
    idRef.current += 1;
    return idRef.current;
  };

  const addRipple = useCallback((x, y) => {
    const id = nextId();
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, RIPPLE_LIFETIME);
  }, []);

  const spawnParticles = useCallback((originX, originY) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const cx = originX ?? rect.width / 2;
    const cy = originY ?? rect.height / 2;

    const batch = Array.from({ length: PARTICLE_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 90;
      return {
        id: nextId(),
        x: cx,
        y: cy,
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
        size: 3 + Math.random() * 5,
        hue: 265 + Math.random() * 35,
        delay: Math.random() * 0.08,
      };
    });

    setParticles((prev) => [...prev, ...batch]);
    setTimeout(() => {
      const ids = new Set(batch.map((p) => p.id));
      setParticles((prev) => prev.filter((p) => !ids.has(p.id)));
    }, PARTICLE_LIFETIME);
  }, []);

  useEffect(() => {
    const clearShimmerTimers = () => {
      if (shimmerTimeoutRef.current !== null) {
        clearTimeout(shimmerTimeoutRef.current);
        shimmerTimeoutRef.current = null;
      }
      if (shimmerResetRef.current !== null) {
        clearTimeout(shimmerResetRef.current);
        shimmerResetRef.current = null;
      }
    };

    if (disabled) {
      clearShimmerTimers();
      setShimmerPlay(false);
      return clearShimmerTimers;
    }

    const scheduleShimmer = () => {
      shimmerTimeoutRef.current = setTimeout(() => {
        setShimmerPlay(true);
        shimmerResetRef.current = setTimeout(() => {
          setShimmerPlay(false);
          scheduleShimmer();
        }, SHIMMER_ANIM_MS);
      }, randomShimmerDelay());
    };

    scheduleShimmer();
    return clearShimmerTimers;
  }, [disabled]);

  const handlePointerDown = (e) => {
    if (disabled || isLaunching) return;
    const rect = e.currentTarget.getBoundingClientRect();
    addRipple(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleClick = (e) => {
    if (disabled || isLaunching) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsLaunching(true);
    addRipple(x, y);
    spawnParticles(x, y);
    playStartGameSound();
    onLaunch();
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`btn-start-game ${!disabled ? 'btn-start-game--ready' : ''} ${isLaunching ? 'btn-start-game--launching' : ''}`}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      disabled={disabled}
    >
      <span className={`btn-start-game__shimmer ${shimmerPlay ? 'btn-start-game__shimmer--play' : ''}`} aria-hidden="true" />
      <span className="btn-start-game__label">Comenzar Juego</span>

      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="btn-start-game__ripple"
          style={{ left: ripple.x, top: ripple.y }}
        />
      ))}

      {particles.map((particle) => (
        <span
          key={particle.id}
          className="btn-start-game__particle"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            background: `hsl(${particle.hue}, 100%, 75%)`,
            boxShadow: `0 0 ${particle.size * 2}px hsla(${particle.hue}, 100%, 65%, 0.8)`,
            animationDelay: `${particle.delay}s`,
            '--tx': `${particle.tx}px`,
            '--ty': `${particle.ty}px`,
          }}
        />
      ))}
    </button>
  );
}

export default StartGameButton;
