// Keep at most one GPU frame in flight. Never wait synchronously for the GPU;
// a busy frame yields so the browser can continue handling native input.
export function boundedPixelRatio(
  width,
  height,
  requested,
  maxPixels = Infinity,
) {
  return Math.min(
    requested,
    Math.sqrt(maxPixels / Math.max(1, width * height)),
  );
}

// A settled view gets one supersampled frame, independently of the temporary
// movement quality. Event-driven scenes cannot rely on 90 future fast frames
// to recover detail: there may be no future frames while someone is reading.
export function settledPixelRatio(width, height, dpr, maxPixels = 4000000) {
  return boundedPixelRatio(
    width,
    height,
    Math.max(1.5, Math.min(dpr, 2)),
    maxPixels,
  );
}

export function createFrameBudget({
  gl,
  pixelRatio,
  onPixelRatio,
  onOverBudget,
  minimumPixelRatio = 0.65,
}) {
  let pending = null;
  let submittedAt = 0;
  let samples = 0;
  let slowFrames = 0;
  let fastFrames = 0;
  let changedAt = -Infinity;
  let ratio = pixelRatio;
  const minimum = Math.min(pixelRatio, minimumPixelRatio);
  let samplePending = true;
  const recent = [];
  let suspended = false;

  function reset() {
    if (pending) {
      gl.deleteSync(pending);
    }
    pending = null;
  }
  function ready(now) {
    if (suspended) {
      return false;
    }
    if (!pending) {
      return true;
    }
    const status = gl.clientWaitSync(pending, 0, 0);
    if (status === gl.TIMEOUT_EXPIRED) {
      return false;
    }
    reset();
    if (status === gl.WAIT_FAILED) {
      return true;
    }
    // A deliberate one-off detail frame is not a scrolling-speed sample.
    if (!samplePending) {
      return true;
    }
    const elapsed = now - submittedAt;
    // Initial shader/texture uploads are not representative of steady rendering.
    if (++samples <= 2) {
      return true;
    }
    recent.push(elapsed);
    if (recent.length > 8) {
      recent.shift();
    }
    const severelySlow =
      recent.length >= 4 && recent.slice(-4).every((ms) => ms > 100);
    const persistentlySlow =
      recent.length === 8 &&
      ratio <= minimum + 0.2 &&
      recent.filter((ms) => ms > 40).length >= 6;
    if (onOverBudget && (severelySlow || persistentlySlow)) {
      suspended = true;
      onOverBudget();
      return false;
    }
    slowFrames = elapsed > 48 ? slowFrames + 1 : 0;
    fastFrames = elapsed < 22 ? fastFrames + 1 : 0;
    if (now - changedAt < 1500) {
      return true;
    }
    const next =
      slowFrames >= 2
        ? Math.max(minimum, ratio * 0.8)
        : fastFrames >= 90
          ? Math.min(pixelRatio, ratio + 0.1)
          : ratio;
    if (Math.abs(next - ratio) > 0.001) {
      ratio = next;
      changedAt = now;
      slowFrames = fastFrames = 0;
      onPixelRatio(ratio);
    }
    return true;
  }
  function submit(now, { sample = true } = {}) {
    if (pending || suspended) {
      return false;
    }
    pending = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    submittedAt = now;
    samplePending = sample;
    return true;
  }
  return {
    ready,
    submit,
    reset,
    get pending() {
      return pending !== null;
    },
  };
}
