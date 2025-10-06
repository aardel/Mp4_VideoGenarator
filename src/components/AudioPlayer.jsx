import { useEffect, useState } from 'react'

function AudioPlayer({
  audioFile,
  audioRef,
  currentTime,
  setCurrentTime,
  isPlaying,
  setIsPlaying,
  duration
}) {
  const [volume, setVolume] = useState(1)

  useEffect(() => {
    if (!audioFile || !audioRef.current) return

    const audio = audioRef.current
    const url = URL.createObjectURL(audioFile)
    audio.src = url

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      audio.currentTime = 0
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      URL.revokeObjectURL(url)
    }
  }, [audioFile, audioRef, setCurrentTime, setIsPlaying])

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = volume
  }, [volume, audioRef])

  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Audio Player</h2>

      <audio ref={audioRef} />

      {/* Playback Controls */}
      <div className="space-y-4">
        {/* Play/Pause Button */}
        <div className="flex justify-center">
          <button
            onClick={togglePlayPause}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition text-lg"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>

        {/* Progress Bar */}
        <div>
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-sm text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-400 w-16">Volume:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="text-sm text-gray-400 w-12">{Math.round(volume * 100)}%</span>
        </div>
      </div>
    </div>
  )
}

export default AudioPlayer
