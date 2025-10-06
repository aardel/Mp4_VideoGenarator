import { calculateScrollSpeed, calculateTotalLyricsHeight } from './scrollCalculator'

/**
 * Calculate the timestamp when a specific line will be visible in the center of the preview
 */
export function calculateTimeForLine(lineIndex, lyricsLines, styles, scrollSettings, audioDuration) {
  if (!lyricsLines || lyricsLines.length === 0 || lineIndex < 0) {
    return 0
  }

  const lineHeight = styles.fontSize * styles.lineHeight
  const totalHeight = calculateTotalLyricsHeight(lyricsLines, lineHeight)
  const scrollSpeed = calculateScrollSpeed(totalHeight, audioDuration, scrollSettings)

  // Calculate the pixel position of this line
  const linePositionY = lineIndex * lineHeight

  // Account for the visible area offset (we want the line centered)
  const visibleHeight = lineHeight * scrollSettings.visibleLines
  const centerOffset = visibleHeight / 2

  // The scroll position when this line is centered
  const targetScrollPosition = linePositionY - centerOffset

  // Calculate time from scroll position
  // scrollPosition = (currentTime - startDelay) * scrollSpeed
  // So: currentTime = (scrollPosition / scrollSpeed) + startDelay

  if (scrollSpeed === 0) return scrollSettings.startDelay

  const calculatedTime = (targetScrollPosition / scrollSpeed) + scrollSettings.startDelay

  // Clamp to valid range
  return Math.max(scrollSettings.startDelay, Math.min(calculatedTime, audioDuration))
}

/**
 * Calculate which line is currently visible/centered in the preview
 */
export function getCurrentVisibleLine(currentTime, lyricsLines, styles, scrollSettings, audioDuration) {
  if (!lyricsLines || lyricsLines.length === 0) {
    return 0
  }

  const lineHeight = styles.fontSize * styles.lineHeight
  const totalHeight = calculateTotalLyricsHeight(lyricsLines, lineHeight)
  const scrollSpeed = calculateScrollSpeed(totalHeight, audioDuration, scrollSettings)

  // Calculate current scroll position
  const elapsedTime = currentTime - scrollSettings.startDelay
  const scrollPosition = Math.max(0, elapsedTime * scrollSpeed)

  // Calculate visible area
  const visibleHeight = lineHeight * scrollSettings.visibleLines
  const centerY = scrollPosition + (visibleHeight / 2)

  // Which line is at the center?
  const centerLineIndex = Math.floor(centerY / lineHeight)

  return Math.max(0, Math.min(centerLineIndex, lyricsLines.length - 1))
}
