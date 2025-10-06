import { useState } from 'react'
import { renderMP4Video, downloadMP4 } from '../utils/mp4Renderer'

function ExportButton({
  audioFile,
  lyricsLines,
  backgroundImage,
  scrollSettings,
  styles,
  audioDuration,
  songTitle
}) {
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [preset, setPreset] = useState('balanced')

  // Preset configurations
  const presets = {
    fast: { resolution: '720p', frameRate: 24, label: 'Fast', desc: '720p • 24fps • ~2-3 min' },
    balanced: { resolution: '720p', frameRate: 30, label: 'Balanced', desc: '720p • 30fps • ~3-4 min' },
    quality: { resolution: '1080p', frameRate: 30, label: 'Quality', desc: '1080p • 30fps • ~4-6 min' },
    max: { resolution: '1080p', frameRate: 60, label: 'Max Quality', desc: '1080p • 60fps • ~6-10 min' }
  }

  const currentPreset = presets[preset]

  const handleExport = async () => {
    if (!audioFile) {
      alert('Please upload an audio file first')
      return
    }

    if (lyricsLines.length === 0) {
      alert('Please add lyrics before exporting')
      return
    }

    setIsExporting(true)
    setProgress(0)
    setProgressMessage('Starting export...')

    try {
      const blob = await renderMP4Video({
        audioFile,
        lyricsLines,
        backgroundImage,
        scrollSettings,
        styles,
        audioDuration,
        songTitle,
        resolution: currentPreset.resolution,
        frameRate: currentPreset.frameRate,
        onProgress: (status) => {
          setProgress(status.progress)
          setProgressMessage(status.message || '')
        }
      })

      const filename = `lyric-video-${Date.now()}.mp4`
      downloadMP4(blob, filename)

      alert('MP4 video exported successfully! Ready for YouTube upload.')
    } catch (error) {
      console.error('Export error:', error)
      alert('Export failed: ' + error.message)
    } finally {
      setIsExporting(false)
      setProgress(0)
      setProgressMessage('')
    }
  }

  const canExport = audioFile && lyricsLines.length > 0

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Export Video</h2>

      <div className="space-y-4">
        {/* Quality Presets */}
        <div>
          <label className="block text-sm font-medium mb-2">Quality Preset</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(presets).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setPreset(key)}
                disabled={isExporting}
                className={`py-3 px-3 rounded transition text-left ${
                  preset === key
                    ? 'bg-red-600 text-white ring-2 ring-red-400'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                } ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="font-semibold text-sm">{config.label}</div>
                <div className="text-xs opacity-80 mt-1">{config.desc}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: "Fast" preset is recommended for quick exports. 720p is perfect for YouTube lyrics videos.
          </p>
        </div>

        {/* Export Progress */}
        {isExporting && (
          <div className="space-y-2">
            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className="bg-red-600 h-full transition-all duration-300 flex items-center justify-center text-xs font-medium"
                style={{ width: `${progress}%` }}
              >
                {progress > 10 && <span className="text-white">{Math.round(progress)}%</span>}
              </div>
            </div>
            <p className="text-sm text-gray-400 text-center">
              {progressMessage || 'Rendering video...'}
            </p>
            <p className="text-xs text-gray-500 text-center">
              This may take several minutes depending on video length.
            </p>
          </div>
        )}

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={!canExport || isExporting}
          className={`w-full font-bold py-4 px-6 rounded-lg transition text-lg ${
            canExport && !isExporting
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isExporting ? '⏳ Exporting...' : '🎬 Export Video'}
        </button>

        {!canExport && (
          <p className="text-sm text-yellow-400 text-center">
            {!audioFile ? '⚠️ Upload audio file first' : '⚠️ Add lyrics first'}
          </p>
        )}

        <div className="mt-4 p-3 bg-gray-700 rounded text-sm text-gray-300">
          <p className="font-medium mb-1">Export Info:</p>
          <ul className="text-xs space-y-1 text-gray-400">
            <li>• Format: MP4 (H.264 video, AAC audio)</li>
            <li>• Duration: {audioDuration.toFixed(1)}s</li>
            <li>• Output: {currentPreset.resolution} at {currentPreset.frameRate} FPS</li>
            <li>• Est. render time: {currentPreset.desc.split('•')[2]}</li>
            <li>• ✅ YouTube compatible</li>
            <li>• ✅ Social media ready</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ExportButton
