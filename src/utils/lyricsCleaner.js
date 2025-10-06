/**
 * Detect and categorize different types of lyrics metadata
 */

export const PATTERN_TYPES = {
  TITLE: 'title',
  SECTION_HEADER: 'section_header',
  SEPARATOR: 'separator',
  EMPTY_LINE: 'empty_line',
  LYRIC: 'lyric'
}

export const DEFAULT_FILTERS = {
  removeTitle: true,
  removeSectionHeaders: true,
  removeSeparators: true,
  removeEmptyLines: false,
  collapseMultipleEmptyLines: true
}

/**
 * Patterns to detect in lyrics
 */
const PATTERNS = {
  // Title patterns: "Title:", "Song:", etc.
  title: /^(title|song|artist|by|lyrics)[\s:]+.*/i,

  // Section headers: "Verse 1", "Chorus", "Bridge", "Pre-Chorus", etc.
  sectionHeader: /^(verse|chorus|bridge|pre-chorus|intro|outro|interlude|hook|refrain)(\s+\d+)?[\s:]*$/i,

  // Separators: "⸻", "___", "---", "***", etc.
  separator: /^[\s\-_*⸻═]+$/,
}

/**
 * Analyze a line and determine its type
 */
export function analyzeLine(line) {
  const trimmed = line.trim()

  if (trimmed === '') {
    return { type: PATTERN_TYPES.EMPTY_LINE, original: line, display: line }
  }

  if (PATTERNS.title.test(trimmed)) {
    return { type: PATTERN_TYPES.TITLE, original: line, display: trimmed }
  }

  if (PATTERNS.sectionHeader.test(trimmed)) {
    return { type: PATTERN_TYPES.SECTION_HEADER, original: line, display: trimmed }
  }

  if (PATTERNS.separator.test(trimmed)) {
    return { type: PATTERN_TYPES.SEPARATOR, original: line, display: trimmed }
  }

  return { type: PATTERN_TYPES.LYRIC, original: line, display: line }
}

/**
 * Analyze all lines in lyrics text
 */
export function analyzeLyrics(lyricsText) {
  const lines = lyricsText.split('\n')
  return lines.map((line, index) => ({
    index,
    ...analyzeLine(line)
  }))
}

/**
 * Get statistics about detected patterns
 */
export function getLyricsStats(analyzedLines) {
  const stats = {
    total: analyzedLines.length,
    titles: 0,
    sectionHeaders: 0,
    separators: 0,
    emptyLines: 0,
    lyrics: 0
  }

  analyzedLines.forEach(line => {
    switch (line.type) {
      case PATTERN_TYPES.TITLE:
        stats.titles++
        break
      case PATTERN_TYPES.SECTION_HEADER:
        stats.sectionHeaders++
        break
      case PATTERN_TYPES.SEPARATOR:
        stats.separators++
        break
      case PATTERN_TYPES.EMPTY_LINE:
        stats.emptyLines++
        break
      case PATTERN_TYPES.LYRIC:
        stats.lyrics++
        break
    }
  })

  return stats
}

/**
 * Clean lyrics based on filters
 */
export function cleanLyrics(lyricsText, filters = DEFAULT_FILTERS) {
  const analyzedLines = analyzeLyrics(lyricsText)
  const cleaned = []
  let lastWasEmpty = false
  let lastWasMetadata = false // Track if last line was title/section/separator

  for (let i = 0; i < analyzedLines.length; i++) {
    const line = analyzedLines[i]
    let shouldInclude = true
    let isMetadata = false

    // Apply filters
    switch (line.type) {
      case PATTERN_TYPES.TITLE:
        shouldInclude = !filters.removeTitle
        isMetadata = true
        break
      case PATTERN_TYPES.SECTION_HEADER:
        shouldInclude = !filters.removeSectionHeaders
        isMetadata = true
        break
      case PATTERN_TYPES.SEPARATOR:
        shouldInclude = !filters.removeSeparators
        isMetadata = true
        break
      case PATTERN_TYPES.EMPTY_LINE:
        // Handle empty lines
        if (filters.removeEmptyLines) {
          shouldInclude = false
        } else if (filters.collapseMultipleEmptyLines && lastWasEmpty) {
          shouldInclude = false
        }
        break
    }

    if (shouldInclude) {
      cleaned.push(line.original)
      lastWasEmpty = line.type === PATTERN_TYPES.EMPTY_LINE
      lastWasMetadata = isMetadata
    } else {
      // If we removed metadata (section header, etc.), add one empty line to separate sections
      if (isMetadata && !lastWasEmpty && cleaned.length > 0) {
        cleaned.push('')
        lastWasEmpty = true
      } else {
        lastWasEmpty = false
      }
      lastWasMetadata = false
    }
  }

  // Remove leading and trailing empty lines
  while (cleaned.length > 0 && cleaned[0].trim() === '') {
    cleaned.shift()
  }
  while (cleaned.length > 0 && cleaned[cleaned.length - 1].trim() === '') {
    cleaned.pop()
  }

  return cleaned.join('\n')
}

/**
 * Get color for pattern type (for visual highlighting)
 */
export function getColorForType(type) {
  switch (type) {
    case PATTERN_TYPES.TITLE:
      return '#ef4444' // red
    case PATTERN_TYPES.SECTION_HEADER:
      return '#f59e0b' // amber
    case PATTERN_TYPES.SEPARATOR:
      return '#6b7280' // gray
    case PATTERN_TYPES.EMPTY_LINE:
      return '#374151' // dark gray
    case PATTERN_TYPES.LYRIC:
    default:
      return '#ffffff' // white
  }
}
