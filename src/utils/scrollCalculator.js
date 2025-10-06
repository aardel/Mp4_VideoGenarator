/**
 * Calculate scroll speed and position for auto-scrolling lyrics
 */

export function calculateScrollSpeed(totalLyricsHeight, audioDuration, settings = {}) {
  const {
    speedModifier = 1.0,
    startDelay = 0,
    endPadding = 0
  } = settings;

  // Calculate effective duration (excluding delay and padding)
  const effectiveDuration = Math.max(0.1, audioDuration - startDelay - endPadding);

  // Base speed in pixels per second
  const baseSpeed = totalLyricsHeight / effectiveDuration;

  // Apply speed modifier
  const adjustedSpeed = baseSpeed * speedModifier;

  return adjustedSpeed;
}

export function calculateScrollPosition(currentTime, scrollSpeed, settings = {}) {
  const { startDelay = 0 } = settings;

  // Don't scroll before start delay
  if (currentTime < startDelay) {
    return 0;
  }

  // Calculate position based on elapsed time since start
  const elapsedTime = currentTime - startDelay;
  const position = elapsedTime * scrollSpeed;

  return position;
}

export function calculateTotalLyricsHeight(lines, lineHeight) {
  return lines.length * lineHeight;
}

export function getVisibleLinesRange(scrollPosition, lineHeight, visibleLines) {
  // Calculate which lines should be visible
  const startLine = Math.floor(scrollPosition / lineHeight);
  const endLine = startLine + visibleLines;

  return { startLine, endLine };
}
