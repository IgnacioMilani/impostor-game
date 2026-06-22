let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
}

async function ensureAudioReady(ctx) {
  if (!ctx) return false;
  try {
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    return true;
  } catch {
    return false;
  }
}

function createOutputChain(ctx) {
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 520;
  lowpass.Q.value = 0.6;

  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.9;

  lowpass.connect(masterGain);
  masterGain.connect(ctx.destination);

  return lowpass;
}

export async function playStartGameSound() {
  const ctx = getAudioContext();
  if (!(await ensureAudioReady(ctx))) return;

  const t = ctx.currentTime;
  const out = createOutputChain(ctx);

  const thudOsc = ctx.createOscillator();
  const thudGain = ctx.createGain();
  thudOsc.type = 'sine';
  thudOsc.frequency.setValueAtTime(160, t);
  thudOsc.frequency.exponentialRampToValueAtTime(100, t + 0.14);
  thudGain.gain.setValueAtTime(0.28, t);
  thudGain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);
  thudOsc.connect(thudGain);
  thudGain.connect(out);
  thudOsc.start(t);
  thudOsc.stop(t + 0.16);

  const swellOsc = ctx.createOscillator();
  const swellGain = ctx.createGain();
  swellOsc.type = 'sine';
  swellOsc.frequency.setValueAtTime(90, t + 0.06);
  swellOsc.frequency.exponentialRampToValueAtTime(1650, t + 0.42);
  swellGain.gain.setValueAtTime(0.0, t);
  swellGain.gain.linearRampToValueAtTime(0.4, t + 0.1);
  swellGain.gain.exponentialRampToValueAtTime(0.01, t + 0.46);
  swellOsc.connect(swellGain);
  swellGain.connect(out);
  swellOsc.start(t + 0.06);
  swellOsc.stop(t + 0.48);
}

export async function playTimeUpAlarm() {
  const ctx = getAudioContext();
  if (!(await ensureAudioReady(ctx))) return;

  const t = ctx.currentTime;

  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.9;
  masterGain.connect(ctx.destination);

  const notes = [
    { freq: 880.0, at: 0.0, dur: 0.18 },
    { freq: 1108.73, at: 0.18, dur: 0.18 },
    { freq: 1318.51, at: 0.36, dur: 0.55 },
  ];

  for (const note of notes) {
    const start = t + note.at;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(note.freq, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.5, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + note.dur);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(start);
    osc.stop(start + note.dur + 0.05);
  }
}
