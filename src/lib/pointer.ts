/** setPointerCapture throws if the pointer is already gone (fast taps, synthetic events) — capture is best-effort. */
export function capture(e: React.PointerEvent) {
  try {
    e.currentTarget.setPointerCapture(e.pointerId);
  } catch {
    // pointer already released; nothing to capture
  }
}
