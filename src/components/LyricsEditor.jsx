import { useRef, useEffect, useState } from 'react'

function LyricsEditor({ lyrics, onLyricsChange, highlightedLine, onCleanClick }) {
  const textareaRef = useRef(null)
  const [currentLineInfo, setCurrentLineInfo] = useState({ line: 0, chars: 0 })
  const [longestLineIndex, setLongestLineIndex] = useState(-1)
  const [showOverlay, setShowOverlay] = useState(false)

  const lines = lyrics.split('\n')
  const lineCount = lines.length
  const charCount = lyrics.length

  // Find longest line
  useEffect(() => {
    if (lines.length === 0) return
    let maxLength = 0
    let maxIndex = 0
    lines.forEach((line, index) => {
      if (line.length > maxLength) {
        maxLength = line.length
        maxIndex = index
      }
    })
    setLongestLineIndex(maxIndex)
  }, [lyrics])

  // Update current line info on cursor position change
  const handleSelectionChange = () => {
    if (!textareaRef.current) return
    const cursorPos = textareaRef.current.selectionStart
    const textBeforeCursor = lyrics.substring(0, cursorPos)
    const currentLine = textBeforeCursor.split('\n').length - 1
    const currentLineText = lines[currentLine] || ''
    setCurrentLineInfo({ line: currentLine + 1, chars: currentLineText.length })
  }

  // Scroll to highlighted line when it changes
  useEffect(() => {
    if (highlightedLine !== null && textareaRef.current) {
      // Calculate character position of the line
      let charPos = 0
      for (let i = 0; i < highlightedLine && i < lines.length; i++) {
        charPos += lines[i].length + 1 // +1 for newline
      }

      // Select the line
      const lineStart = charPos
      const lineEnd = charPos + (lines[highlightedLine]?.length || 0)

      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(lineStart, lineEnd)

      // Scroll line into view
      const lineHeight = 20 // approximate
      const scrollTop = highlightedLine * lineHeight
      textareaRef.current.scrollTop = scrollTop - 100 // offset to center
    }
  }, [highlightedLine, lines])

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Lyrics Editor</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">
            <span className="mr-4">Lines: {lineCount}</span>
            <span>Characters: {charCount}</span>
          </div>
          <button
            onClick={onCleanClick}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition"
          >
            🧹 Clean
          </button>
          <button
            onClick={() => setShowOverlay(true)}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition"
          >
            📖 View
          </button>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={lyrics}
        onChange={(e) => onLyricsChange(e.target.value)}
        onKeyUp={handleSelectionChange}
        onClick={handleSelectionChange}
        placeholder="Paste your lyrics here...&#10;&#10;Each line will scroll automatically&#10;from bottom to top.&#10;&#10;Empty lines are preserved for spacing."
        className="w-full h-64 bg-gray-700 text-white rounded p-4 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
        spellCheck="false"
      />

      <div className="mt-2 flex justify-between items-center text-xs">
        <div className="text-gray-400">
          <span className="mr-4">
            Current line: {currentLineInfo.line} ({currentLineInfo.chars} chars)
          </span>
          {longestLineIndex >= 0 && (
            <span className="text-yellow-400">
              Longest: Line {longestLineIndex + 1} ({lines[longestLineIndex]?.length || 0} chars)
            </span>
          )}
        </div>
        <p className="text-gray-400">
          Tip: Auto-scrolls to finish with the song
        </p>
      </div>

      {/* Overlay Viewer */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h2 className="text-2xl font-semibold">Lyrics Viewer</h2>
              <button
                onClick={() => setShowOverlay(false)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
              >
                ✕ Close
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-gray-900 rounded-lg p-6">
                <pre className="text-white font-mono text-lg leading-relaxed whitespace-pre-wrap">
                  {lyrics || '(No lyrics to display)'}
                </pre>
              </div>
            </div>

            {/* Footer Stats */}
            <div className="p-4 border-t border-gray-700 bg-gray-750">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Total Lines: {lineCount}</span>
                <span>Total Characters: {charCount}</span>
                {longestLineIndex >= 0 && (
                  <span className="text-yellow-400">
                    Longest Line: {lines[longestLineIndex]?.length || 0} chars
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LyricsEditor
