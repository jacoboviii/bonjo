const KEY = 'bonjo.progress.v1';

export function readProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const value = JSON.parse(raw);
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
}

export function markLevelComplete(id, score = 0) {
  const progress = readProgress();
  const previous = progress[id] || {};
  progress[id] = {
    cleared: true,
    best: Math.max(Number(previous.best) || 0, Number(score) || 0),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // storage can be unavailable in private mode; the run still completes.
  }
  return progress;
}

export function levelProgress(id, progress = readProgress()) {
  return progress[id] || {};
}
