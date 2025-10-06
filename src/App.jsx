import { useState, useRef } from 'react'
import FileUploader from './components/FileUploader'
import LyricsEditor from './components/LyricsEditor'
import LyricsCleaner from './components/LyricsCleaner'
import AudioPlayer from './components/AudioPlayer'
import ScrollSettings from './components/ScrollSettings'
import StyleControls from './components/StyleControls'
import PreviewPlayer from './components/PreviewPlayer'
import ExportButton from './components/ExportButton'
import ProjectManager from './components/ProjectManager'

function App() {
  // Audio state
  const [audioFile, setAudioFile] = useState(null)
  const [audioDuration, setAudioDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  // Lyrics state
  const [lyrics, setLyrics] = useState('')
  const [lyricsLines, setLyricsLines] = useState([])
  const [originalLyrics, setOriginalLyrics] = useState('') // Store original before cleaning

  // Background image state
  const [backgroundImage, setBackgroundImage] = useState(null)

  // Song title state
  const [songTitle, setSongTitle] = useState('')

  // Highlighted line state (for auto-size feature)
  const [highlightedLine, setHighlightedLine] = useState(null)

  // Cleaner visibility state
  const [showCleaner, setShowCleaner] = useState(true)

  // Scroll settings state
  const [scrollSettings, setScrollSettings] = useState({
    speedModifier: 1.0,
    startDelay: 0,
    endPadding: 2,
    visibleLines: 5
  })

  // Style settings state
  const [styles, setStyles] = useState({
    fontFamily: 'Arial',
    fontSize: 42,
    fontColor: '#FFFFFF',
    lineHeight: 1.5,
    textShadow: true,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    verticalPosition: 'center',
    backgroundBlur: 0,
    backgroundBrightness: 100,
    titlePosition: 'top-left',
    titleSize: 24,
    showTitle: true
  })

  // Handle audio file upload
  const handleAudioUpload = (file) => {
    setAudioFile(file)
    const audio = new Audio(URL.createObjectURL(file))
    audio.addEventListener('loadedmetadata', () => {
      setAudioDuration(audio.duration)
    })
  }

  // Handle lyrics change
  const handleLyricsChange = (text) => {
    setLyrics(text)
    const lines = text.split('\n')
    setLyricsLines(lines)

    // Store original if this is the first time or manual edit
    if (originalLyrics === '' && text.length > 0) {
      setOriginalLyrics(text)
    }
  }

  // Handle applying cleaned lyrics
  const handleApplyCleanedLyrics = (cleanedText) => {
    // Store current lyrics as original before applying cleaned version
    if (lyrics && lyrics !== cleanedText) {
      setOriginalLyrics(lyrics)
    }
    handleLyricsChange(cleanedText)
  }

  // Restore original lyrics
  const handleRestoreOriginal = () => {
    if (originalLyrics) {
      handleLyricsChange(originalLyrics)
    }
  }

  // Handle background image upload
  const handleBackgroundUpload = (file) => {
    setBackgroundImage(file)
  }

  // Update scroll settings
  const updateScrollSettings = (updates) => {
    setScrollSettings(prev => ({ ...prev, ...updates }))
  }

  // Update styles
  const updateStyles = (updates) => {
    setStyles(prev => ({ ...prev, ...updates }))
  }

  // Handle loading a project
  const handleLoadProject = (project) => {
    // Load song title
    setSongTitle(project.songTitle || '')

    // Load lyrics
    if (project.lyrics) {
      setOriginalLyrics(project.lyrics) // Set as original
      handleLyricsChange(project.lyrics)
    }

    // Load audio file
    if (project.audioFile) {
      handleAudioUpload(project.audioFile)
    }

    // Load background image
    if (project.backgroundImage) {
      setBackgroundImage(project.backgroundImage)
    }

    // Load scroll settings
    if (project.scrollSettings) {
      setScrollSettings(project.scrollSettings)
    }

    // Load styles
    if (project.styles) {
      setStyles(project.styles)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Auto-Scrolling Lyric Video Creator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Project Manager */}
            <ProjectManager
              songTitle={songTitle}
              lyrics={lyrics}
              audioFile={audioFile}
              backgroundImage={backgroundImage}
              scrollSettings={scrollSettings}
              styles={styles}
              onLoadProject={handleLoadProject}
            />

            {/* File Uploads */}
            <FileUploader
              onAudioUpload={handleAudioUpload}
              onLyricsUpload={handleLyricsChange}
              onBackgroundUpload={handleBackgroundUpload}
              onSongTitleChange={setSongTitle}
              audioFile={audioFile}
              backgroundImage={backgroundImage}
              audioDuration={audioDuration}
              songTitle={songTitle}
            />

            {/* Lyrics Cleaner */}
            {showCleaner && (
              <LyricsCleaner
                lyrics={lyrics}
                originalLyrics={originalLyrics}
                onApplyCleaned={handleApplyCleanedLyrics}
                onRestoreOriginal={handleRestoreOriginal}
              />
            )}

            {/* Lyrics Editor */}
            <LyricsEditor
              lyrics={lyrics}
              onLyricsChange={handleLyricsChange}
              highlightedLine={highlightedLine}
              onCleanClick={() => setShowCleaner(true)}
            />

            {/* Audio Player */}
            {audioFile && (
              <AudioPlayer
                audioFile={audioFile}
                audioRef={audioRef}
                currentTime={currentTime}
                setCurrentTime={setCurrentTime}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                duration={audioDuration}
              />
            )}

            {/* Scroll Settings */}
            <ScrollSettings
              settings={scrollSettings}
              onSettingsChange={updateScrollSettings}
              audioDuration={audioDuration}
            />

            {/* Style Controls */}
            <StyleControls
              styles={styles}
              onStylesChange={updateStyles}
              lyricsLines={lyricsLines}
              onHighlightLine={setHighlightedLine}
              scrollSettings={scrollSettings}
              audioDuration={audioDuration}
              audioRef={audioRef}
              setCurrentTime={setCurrentTime}
            />

            {/* Export Button */}
            <ExportButton
              audioFile={audioFile}
              lyricsLines={lyricsLines}
              backgroundImage={backgroundImage}
              scrollSettings={scrollSettings}
              styles={styles}
              audioDuration={audioDuration}
              songTitle={songTitle}
            />
          </div>

          {/* Right Column - Preview */}
          <div className="lg:sticky lg:top-8 h-fit">
            <PreviewPlayer
              audioRef={audioRef}
              currentTime={currentTime}
              lyricsLines={lyricsLines}
              backgroundImage={backgroundImage}
              scrollSettings={scrollSettings}
              styles={styles}
              audioDuration={audioDuration}
              isPlaying={isPlaying}
              songTitle={songTitle}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
