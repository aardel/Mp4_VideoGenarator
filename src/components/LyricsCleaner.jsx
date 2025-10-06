import { useState, useEffect } from 'react'
import { analyzeLyrics, getLyricsStats, cleanLyrics, DEFAULT_FILTERS, PATTERN_TYPES } from '../utils/lyricsCleaner'

function LyricsCleaner({ lyrics, originalLyrics, onApplyCleaned, onRestoreOriginal }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [stats, setStats] = useState(null)
  const [previewCleaned, setPreviewCleaned] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [workingLyrics, setWorkingLyrics] = useState(lyrics)

  useEffect(() => {
    // Use original lyrics if available, otherwise current lyrics
    const sourceText = originalLyrics || lyrics
    setWorkingLyrics(sourceText)

    if (sourceText) {
      const analyzed = analyzeLyrics(sourceText)
      const lyricsStats = getLyricsStats(analyzed)
      setStats(lyricsStats)

      // Auto-generate cleaned preview
      const cleaned = cleanLyrics(sourceText, filters)
      setPreviewCleaned(cleaned)
    }
  }, [lyrics, originalLyrics, filters])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApply = () => {
    onApplyCleaned(previewCleaned)
  }

  const handleRestore = () => {
    if (onRestoreOriginal) {
      onRestoreOriginal()
    }
  }

  const hasDetectedPatterns = stats && (
    stats.titles > 0 ||
    stats.sectionHeaders > 0 ||
    stats.separators > 0
  )

  if (!lyrics || !hasDetectedPatterns) {
    return null
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border-2 border-yellow-600">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-yellow-400">⚡ Lyrics Cleaner</h2>
          <p className="text-sm text-gray-400 mt-1">
            Detected {stats.titles + stats.sectionHeaders + stats.separators} items to clean
            {originalLyrics && <span className="ml-2 text-green-400">• Original saved</span>}
          </p>
        </div>
        <div className="flex gap-2">
          {originalLyrics && (
            <button
              onClick={handleRestore}
              className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded transition text-sm"
              title="Restore original lyrics"
            >
              ↺ Restore
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Detection Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.titles > 0 && (
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-red-400 text-xs font-medium mb-1">TITLES</div>
                <div className="text-2xl font-bold">{stats.titles}</div>
              </div>
            )}
            {stats.sectionHeaders > 0 && (
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-amber-400 text-xs font-medium mb-1">SECTIONS</div>
                <div className="text-2xl font-bold">{stats.sectionHeaders}</div>
              </div>
            )}
            {stats.separators > 0 && (
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-gray-400 text-xs font-medium mb-1">SEPARATORS</div>
                <div className="text-2xl font-bold">{stats.separators}</div>
              </div>
            )}
            {stats.emptyLines > 0 && (
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-gray-400 text-xs font-medium mb-1">EMPTY LINES</div>
                <div className="text-2xl font-bold">{stats.emptyLines}</div>
              </div>
            )}
          </div>

          {/* Filter Options */}
          <div className="bg-gray-700 rounded p-4 space-y-3">
            <h3 className="font-semibold text-sm mb-3">Cleaning Options</h3>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm">
                <span className="text-red-400">■</span> Remove Titles
                {stats.titles > 0 && <span className="text-gray-400 ml-2">({stats.titles} found)</span>}
              </span>
              <input
                type="checkbox"
                checked={filters.removeTitle}
                onChange={(e) => handleFilterChange('removeTitle', e.target.checked)}
                className="w-5 h-5 rounded bg-gray-600 border-gray-500 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm">
                <span className="text-amber-400">■</span> Remove Section Headers (Verse, Chorus, etc.)
                {stats.sectionHeaders > 0 && <span className="text-gray-400 ml-2">({stats.sectionHeaders} found)</span>}
              </span>
              <input
                type="checkbox"
                checked={filters.removeSectionHeaders}
                onChange={(e) => handleFilterChange('removeSectionHeaders', e.target.checked)}
                className="w-5 h-5 rounded bg-gray-600 border-gray-500 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm">
                <span className="text-gray-400">■</span> Remove Separators (---, ___, etc.)
                {stats.separators > 0 && <span className="text-gray-400 ml-2">({stats.separators} found)</span>}
              </span>
              <input
                type="checkbox"
                checked={filters.removeSeparators}
                onChange={(e) => handleFilterChange('removeSeparators', e.target.checked)}
                className="w-5 h-5 rounded bg-gray-600 border-gray-500 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <div className="border-t border-gray-600 pt-3 mt-3">
              <h4 className="text-xs font-semibold text-gray-400 mb-2">Empty Line Options</h4>

              <label className="flex items-center justify-between cursor-pointer mb-2">
                <span className="text-sm">Remove ALL empty lines</span>
                <input
                  type="checkbox"
                  checked={filters.removeEmptyLines}
                  onChange={(e) => handleFilterChange('removeEmptyLines', e.target.checked)}
                  className="w-5 h-5 rounded bg-gray-600 border-gray-500 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">Collapse multiple empty lines to one</span>
                <input
                  type="checkbox"
                  checked={filters.collapseMultipleEmptyLines}
                  onChange={(e) => handleFilterChange('collapseMultipleEmptyLines', e.target.checked)}
                  disabled={filters.removeEmptyLines}
                  className="w-5 h-5 rounded bg-gray-600 border-gray-500 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </label>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Preview (Cleaned)</h3>
            <div className="bg-gray-900 rounded p-4 max-h-40 overflow-y-auto">
              <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                {previewCleaned || '(No lyrics to preview)'}
              </pre>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Result: {previewCleaned.split('\n').length} lines
            </p>
          </div>

          {/* Apply Button */}
          <button
            onClick={handleApply}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            ✨ Apply Cleaned Lyrics
          </button>
        </div>
      )}

      {!isExpanded && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {stats.titles > 0 && <span className="mr-3 text-red-400">• {stats.titles} titles</span>}
            {stats.sectionHeaders > 0 && <span className="mr-3 text-amber-400">• {stats.sectionHeaders} sections</span>}
            {stats.separators > 0 && <span className="mr-3 text-gray-400">• {stats.separators} separators</span>}
          </div>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded transition text-sm"
          >
            Quick Clean
          </button>
        </div>
      )}
    </div>
  )
}

export default LyricsCleaner
