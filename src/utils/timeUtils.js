export const MAX_TIME_MINUTES = 30;
export const MINUTE_VALUES = Array.from({ length: MAX_TIME_MINUTES + 1 }, (_, i) => i);
export const SECOND_VALUES = [0, 10, 20, 30, 40, 50];

export function snapSeconds(seconds) {
  return Math.min(50, Math.round(seconds / 10) * 10);
}

export function normalizeSetupTime(totalSeconds) {
  const capped = Math.min(MAX_TIME_MINUTES * 60, Math.max(0, totalSeconds));
  const minutes = Math.floor(capped / 60);
  const seconds = snapSeconds(capped % 60);
  return minutes * 60 + seconds;
}
