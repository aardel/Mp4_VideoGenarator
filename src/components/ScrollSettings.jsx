function ScrollSettings({ settings, onSettingsChange, audioDuration }) {
  const handleSpeedChange = (value) => {
    onSettingsChange({ speedModifier: parseFloat(value) })
  }

  const handleStartDelayChange = (value) => {
    onSettingsChange({ startDelay: parseFloat(value) })
  }

  const handleEndPaddingChange = (value) => {
    onSettingsChange({ endPadding: parseFloat(value) })
  }

  const handleVisibleLinesChange = (value) => {
    onSettingsChange({ visibleLines: parseInt(value) })
  }

  const effectiveDuration = Math.max(0, audioDuration - settings.startDelay - settings.endPadding)

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Scroll Settings</h2>

      <div className="space-y-4">
        {/* Speed Modifier */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Scroll Speed: {Math.round(settings.speedModifier * 100)}%
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={settings.speedModifier}
            onChange={(e) => handleSpeedChange(e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <p className="text-xs text-gray-400 mt-1">
            {settings.speedModifier < 1 ? 'Slower' : settings.speedModifier > 1 ? 'Faster' : 'Auto-calculated'}
          </p>
        </div>

        {/* Start Delay */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Start Delay: {settings.startDelay}s
          </label>
          <input
            type="range"
            min="0"
            max="30"
            step="0.5"
            value={settings.startDelay}
            onChange={(e) => handleStartDelayChange(e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <p className="text-xs text-gray-400 mt-1">
            Delay before scrolling begins
          </p>
        </div>

        {/* End Padding */}
        <div>
          <label className="block text-sm font-medium mb-2">
            End Padding: {settings.endPadding}s
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={settings.endPadding}
            onChange={(e) => handleEndPaddingChange(e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <p className="text-xs text-gray-400 mt-1">
            Keep final lines visible after scrolling
          </p>
        </div>

        {/* Visible Lines */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Visible Lines: {settings.visibleLines}
          </label>
          <input
            type="range"
            min="3"
            max="10"
            step="1"
            value={settings.visibleLines}
            onChange={(e) => handleVisibleLinesChange(e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <p className="text-xs text-gray-400 mt-1">
            Number of lines visible at once
          </p>
        </div>

        {/* Info Display */}
        {audioDuration > 0 && (
          <div className="mt-4 p-3 bg-gray-700 rounded text-sm">
            <p className="text-gray-300">
              <strong>Effective scroll duration:</strong> {effectiveDuration.toFixed(1)}s
            </p>
            <p className="text-gray-400 text-xs mt-1">
              (Audio: {audioDuration.toFixed(1)}s - Delay: {settings.startDelay}s - Padding: {settings.endPadding}s)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ScrollSettings
