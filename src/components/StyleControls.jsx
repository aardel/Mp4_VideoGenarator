import { calculateTimeForLine } from '../utils/linePositionCalculator'

function StyleControls({ styles, onStylesChange, lyricsLines, onHighlightLine, scrollSettings, audioDuration, audioRef, setCurrentTime }) {
  const fonts = [
    'Arial',
    'Helvetica',
    'Georgia',
    'Times New Roman',
    'Courier New',
    'Verdana',
    'Impact',
    'Comic Sans MS',
    'Trebuchet MS',
    'Palatino'
  ]

  const handleChange = (key, value) => {
    onStylesChange({ [key]: value })
  }

  const autoSizeFont = () => {
    if (!lyricsLines || lyricsLines.length === 0) {
      alert('Please add lyrics first')
      return
    }

    // Find the longest line and its index
    let longestLine = ''
    let longestLineIndex = 0
    lyricsLines.forEach((line, index) => {
      if (line.length > longestLine.length) {
        longestLine = line
        longestLineIndex = index
      }
    })

    if (!longestLine) return

    // Highlight the longest line in the editor
    onHighlightLine(longestLineIndex)

    // Calculate when this line will be visible in the preview
    const timeForLine = calculateTimeForLine(
      longestLineIndex,
      lyricsLines,
      styles,
      scrollSettings,
      audioDuration
    )

    // Seek the audio to show this line in the preview
    if (audioRef.current) {
      audioRef.current.currentTime = timeForLine
      setCurrentTime(timeForLine)
    }

    // Clear highlight after 3 seconds
    setTimeout(() => {
      onHighlightLine(null)
    }, 3000)

    // Create a temporary canvas to measure text
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // Canvas width to fit text (leaving margins)
    const canvasWidth = 1280 // Preview canvas width
    const maxWidth = canvasWidth * 0.85 // 85% of canvas width (leaving 15% for margins)

    // Binary search for optimal font size
    let minSize = 16
    let maxSize = 120
    let optimalSize = 42

    while (minSize <= maxSize) {
      const testSize = Math.floor((minSize + maxSize) / 2)
      ctx.font = `${testSize}px ${styles.fontFamily}`
      const metrics = ctx.measureText(longestLine)
      const textWidth = metrics.width

      if (textWidth <= maxWidth) {
        optimalSize = testSize
        minSize = testSize + 1
      } else {
        maxSize = testSize - 1
      }
    }

    // Set the optimal font size
    handleChange('fontSize', optimalSize)
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Style Controls</h2>

      <div className="space-y-4">
        {/* Font Family */}
        <div>
          <label className="block text-sm font-medium mb-2">Font Family</label>
          <select
            value={styles.fontFamily}
            onChange={(e) => handleChange('fontFamily', e.target.value)}
            className="w-full bg-gray-700 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {fonts.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">
              Font Size: {styles.fontSize}px
            </label>
            <button
              onClick={autoSizeFont}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition"
            >
              Auto Size
            </button>
          </div>
          <input
            type="range"
            min="20"
            max="120"
            step="2"
            value={styles.fontSize}
            onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
          />
          <p className="text-xs text-gray-400 mt-1">
            Auto Size finds optimal size for longest line
          </p>
        </div>

        {/* Font Color */}
        <div>
          <label className="block text-sm font-medium mb-2">Font Color</label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={styles.fontColor}
              onChange={(e) => handleChange('fontColor', e.target.value)}
              className="w-12 h-10 bg-gray-700 rounded cursor-pointer"
            />
            <input
              type="text"
              value={styles.fontColor}
              onChange={(e) => handleChange('fontColor', e.target.value)}
              className="flex-1 bg-gray-700 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Line Height */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Line Height: {styles.lineHeight}
          </label>
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={styles.lineHeight}
            onChange={(e) => handleChange('lineHeight', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
          />
        </div>

        {/* Text Alignment */}
        <div>
          <label className="block text-sm font-medium mb-2">Text Alignment</label>
          <div className="flex space-x-2">
            {['left', 'center', 'right'].map(align => (
              <button
                key={align}
                onClick={() => handleChange('textAlign', align)}
                className={`flex-1 py-2 rounded transition ${
                  styles.textAlign === align
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Text Shadow */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Text Shadow/Outline</label>
          <button
            onClick={() => handleChange('textShadow', !styles.textShadow)}
            className={`px-4 py-2 rounded transition ${
              styles.textShadow
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            {styles.textShadow ? 'On' : 'Off'}
          </button>
        </div>

        {/* Background Color */}
        <div>
          <label className="block text-sm font-medium mb-2">Text Background</label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={(() => {
                const rgbaMatch = styles.backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
                if (rgbaMatch) {
                  const r = parseInt(rgbaMatch[1]).toString(16).padStart(2, '0')
                  const g = parseInt(rgbaMatch[2]).toString(16).padStart(2, '0')
                  const b = parseInt(rgbaMatch[3]).toString(16).padStart(2, '0')
                  return `#${r}${g}${b}`
                }
                return '#000000'
              })()}
              onChange={(e) => {
                const hex = e.target.value
                const opacity = parseFloat(styles.backgroundColor.match(/[\d.]+(?=\))/)?.[0] || '0.5')
                const r = parseInt(hex.slice(1, 3), 16)
                const g = parseInt(hex.slice(3, 5), 16)
                const b = parseInt(hex.slice(5, 7), 16)
                handleChange('backgroundColor', `rgba(${r},${g},${b},${opacity})`)
              }}
              className="w-12 h-10 bg-gray-700 rounded cursor-pointer"
            />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={parseFloat(styles.backgroundColor.match(/[\d.]+(?=\))/)?.[0] || '0.5')}
              onChange={(e) => {
                const opacity = e.target.value
                const rgba = styles.backgroundColor.replace(/[\d.]+(?=\))/, opacity)
                handleChange('backgroundColor', rgba)
              }}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
            />
            <span className="text-sm text-gray-400 w-16">
              {Math.round(parseFloat(styles.backgroundColor.match(/[\d.]+(?=\))/)?.[0] || '0.5') * 100)}%
            </span>
          </div>
        </div>

        {/* Vertical Position */}
        <div>
          <label className="block text-sm font-medium mb-2">Vertical Position</label>
          <div className="flex space-x-2">
            {['top', 'center', 'bottom'].map(pos => (
              <button
                key={pos}
                onClick={() => handleChange('verticalPosition', pos)}
                className={`flex-1 py-2 rounded transition ${
                  styles.verticalPosition === pos
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {pos.charAt(0).toUpperCase() + pos.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Background Blur */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Background Blur: {styles.backgroundBlur}px
          </label>
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            value={styles.backgroundBlur}
            onChange={(e) => handleChange('backgroundBlur', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
          />
        </div>

        {/* Background Brightness */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Background Brightness: {styles.backgroundBrightness}%
          </label>
          <input
            type="range"
            min="0"
            max="150"
            step="5"
            value={styles.backgroundBrightness}
            onChange={(e) => handleChange('backgroundBrightness', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
          />
        </div>

        {/* Title Settings */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="text-lg font-semibold mb-3">Song Title Settings</h3>

          {/* Show Title Toggle */}
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium">Show Title</label>
            <button
              onClick={() => handleChange('showTitle', !styles.showTitle)}
              className={`px-4 py-2 rounded transition ${
                styles.showTitle
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {styles.showTitle ? 'On' : 'Off'}
            </button>
          </div>

          {/* Title Position */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Title Position</label>
            <div className="grid grid-cols-2 gap-2">
              {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => (
                <button
                  key={pos}
                  onClick={() => handleChange('titlePosition', pos)}
                  disabled={!styles.showTitle}
                  className={`py-2 rounded transition text-sm ${
                    styles.titlePosition === pos
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } ${!styles.showTitle ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {pos.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Title Size */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Title Size: {styles.titleSize}px
            </label>
            <input
              type="range"
              min="16"
              max="48"
              step="2"
              value={styles.titleSize}
              onChange={(e) => handleChange('titleSize', parseInt(e.target.value))}
              disabled={!styles.showTitle}
              className={`w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600 ${
                !styles.showTitle ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default StyleControls
