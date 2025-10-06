import { useRef } from 'react'

function FileUploader({
  onAudioUpload,
  onLyricsUpload,
  onBackgroundUpload,
  onSongTitleChange,
  audioFile,
  backgroundImage,
  audioDuration,
  songTitle
}) {
  const audioInputRef = useRef(null)
  const lyricsInputRef = useRef(null)
  const bgInputRef = useRef(null)

  const handleAudioChange = (e) => {
    const file = e.target.files[0]
    if (file && (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|m4a)$/i))) {
      onAudioUpload(file)
    } else {
      alert('Please upload a valid audio file (MP3, WAV, M4A)')
    }
  }

  const handleLyricsFile = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (event) => {
        onLyricsUpload(event.target.result)
      }
      reader.readAsText(file)
    } else {
      alert('Please upload a valid text file (.txt)')
    }
  }

  const handleBackgroundChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      onBackgroundUpload(file)
    } else {
      alert('Please upload a valid image file')
    }
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Upload Files</h2>

      {/* Song Title */}
      <div>
        <label className="block text-sm font-medium mb-2">Song Title</label>
        <input
          type="text"
          value={songTitle}
          onChange={(e) => onSongTitleChange(e.target.value)}
          placeholder="Enter song title..."
          className="w-full bg-gray-700 text-white rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-400">Will be displayed in the video corner</p>
      </div>

      {/* Audio Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Audio File</label>
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.m4a"
          onChange={handleAudioChange}
          className="hidden"
        />
        <button
          onClick={() => audioInputRef.current?.click()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
        >
          {audioFile ? 'Change Audio File' : 'Upload Audio File'}
        </button>
        {audioFile && (
          <div className="mt-2 text-sm text-gray-300">
            <p>📁 {audioFile.name}</p>
            {audioDuration > 0 && (
              <p>⏱️ Duration: {formatDuration(audioDuration)}</p>
            )}
          </div>
        )}
      </div>

      {/* Lyrics Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Lyrics File (Optional)</label>
        <input
          ref={lyricsInputRef}
          type="file"
          accept=".txt,text/plain"
          onChange={handleLyricsFile}
          className="hidden"
        />
        <button
          onClick={() => lyricsInputRef.current?.click()}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition"
        >
          Upload Lyrics (.txt)
        </button>
        <p className="mt-1 text-xs text-gray-400">Or paste lyrics directly in the editor below</p>
      </div>

      {/* Background Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Background Image</label>
        <input
          ref={bgInputRef}
          type="file"
          accept="image/*"
          onChange={handleBackgroundChange}
          className="hidden"
        />
        <button
          onClick={() => bgInputRef.current?.click()}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition"
        >
          {backgroundImage ? 'Change Background Image' : 'Upload Background Image'}
        </button>
        {backgroundImage && (
          <div className="mt-2 text-sm text-gray-300">
            <p>🖼️ {backgroundImage.name}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileUploader
