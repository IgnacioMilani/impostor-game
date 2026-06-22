import { useEffect, useRef } from 'react';

function CategoryCarousel({ children }) {
  const carouselRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const didDrag = useRef(false);
  const velocitySamples = useRef([]);
  const momentumFrame = useRef(null);

  const cancelMomentum = () => {
    if (momentumFrame.current !== null) {
      cancelAnimationFrame(momentumFrame.current);
      momentumFrame.current = null;
    }
    carouselRef.current?.classList.remove('momentum');
  };

  const trackVelocity = (x) => {
    const samples = velocitySamples.current;
    samples.push({ x, t: performance.now() });
    if (samples.length > 6) samples.shift();
  };

  const getVelocity = () => {
    const samples = velocitySamples.current;
    if (samples.length < 2) return 0;

    const first = samples[0];
    const last = samples[samples.length - 1];
    const dt = last.t - first.t;
    if (dt <= 0) return 0;

    return (last.x - first.x) / dt;
  };

  const startMomentum = (velocityPxPerMs) => {
    const el = carouselRef.current;
    if (!el || Math.abs(velocityPxPerMs) < 0.15) return;

    cancelMomentum();
    el.classList.add('momentum');

    let velocity = -velocityPxPerMs * 1000;
    let lastTime = performance.now();

    const step = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.032);
      lastTime = now;

      el.scrollLeft += velocity * dt;
      velocity *= Math.pow(0.92, dt * 60);

      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
      if ((atStart || atEnd) && Math.sign(velocity) !== 0) {
        velocity *= 0.4;
      }

      if (Math.abs(velocity) < 20) {
        cancelMomentum();
        return;
      }

      momentumFrame.current = requestAnimationFrame(step);
    };

    momentumFrame.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const stopDrag = () => {
      if (!isDragging.current) return;

      isDragging.current = false;
      el.classList.remove('dragging');

      if (didDrag.current) {
        startMomentum(getVelocity());
      }

      velocitySamples.current = [];
    };

    const onPointerMove = (e) => {
      if (!isDragging.current) return;

      trackVelocity(e.pageX);
      const dx = e.pageX - startX.current;

      if (Math.abs(dx) > 5) {
        didDrag.current = true;
        el.classList.add('dragging');
        el.scrollLeft = scrollStart.current - dx;
      }
    };

    const onWheel = (e) => {
      cancelMomentum();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta === 0) return;
      e.preventDefault();
      el.scrollLeft += delta;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('pointercancel', stopDrag);
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      cancelMomentum();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', stopDrag);
      window.removeEventListener('pointercancel', stopDrag);
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !carouselRef.current) return;

    cancelMomentum();
    isDragging.current = true;
    didDrag.current = false;
    startX.current = e.pageX;
    scrollStart.current = carouselRef.current.scrollLeft;
    velocitySamples.current = [{ x: e.pageX, t: performance.now() }];
  };

  const onClickCapture = (e) => {
    if (didDrag.current) {
      e.preventDefault();
      e.stopPropagation();
      didDrag.current = false;
    }
  };

  return (
    <div className="category-carousel-wrapper">
      <div
        ref={carouselRef}
        className="category-carousel"
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
      >
        {children}
      </div>
    </div>
  );
}

export default CategoryCarousel;
