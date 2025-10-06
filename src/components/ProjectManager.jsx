import { useState, useRef } from 'react'
import { saveProject, downloadProject, loadProject } from '../utils/projectManager'

function ProjectManager({
  songTitle,
  lyrics,
  audioFile,
  backgroundImage,
  scrollSettings,
  styles,
  onLoadProject
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleSave = async () => {
    if (!songTitle && !lyrics && !audioFile) {
      alert('Please add at least a song title, lyrics, or audio file before saving')
      return
    }

    setIsSaving(true)
    try {
      const projectData = await saveProject({
        songTitle,
        lyrics,
        audioFile,
        backgroundImage,
        scrollSettings,
        styles
      })

      const filename = `${songTitle || 'untitled-project'}.lvp.json`
      downloadProject(projectData, filename)

      alert('Project saved successfully!')
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save project: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file extension
    if (!file.name.endsWith('.json') && !file.name.endsWith('.lvp.json')) {
      alert('Please select a valid project file (.json or .lvp.json)')
      return
    }

    setIsLoading(true)
    try {
      const project = await loadProject(file)
      onLoadProject(project)
      alert('Project loaded successfully!')
    } catch (error) {
      console.error('Load error:', error)
      alert('Failed to load project: ' + error.message)
    } finally {
      setIsLoading(false)
      // Reset file input
      e.target.value = ''
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-600">
      <h2 className="text-2xl font-semibold mb-4 text-blue-400">💾 Project Manager</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Save Project */}
        <div>
          <h3 className="text-sm font-medium mb-2">Save Project</h3>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full font-bold py-3 px-6 rounded-lg transition ${
              isSaving
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSaving ? '💾 Saving...' : '💾 Save Project'}
          </button>
          <p className="text-xs text-gray-400 mt-2">
            Saves all settings, lyrics, audio, and background image
          </p>
        </div>

        {/* Load Project */}
        <div>
          <h3 className="text-sm font-medium mb-2">Load Project</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.lvp.json"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={handleLoadClick}
            disabled={isLoading}
            className={`w-full font-bold py-3 px-6 rounded-lg transition ${
              isLoading
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isLoading ? '📂 Loading...' : '📂 Load Project'}
          </button>
          <p className="text-xs text-gray-400 mt-2">
            Restore a previously saved project
          </p>
        </div>
      </div>

      {/* Project Info */}
      <div className="mt-4 p-3 bg-gray-700 rounded text-sm">
        <p className="font-medium mb-1">Current Project:</p>
        <ul className="text-xs space-y-1 text-gray-400">
          <li>• Title: {songTitle || '(No title)'}</li>
          <li>• Lyrics: {lyrics ? `${lyrics.split('\n').length} lines` : 'None'}</li>
          <li>• Audio: {audioFile ? audioFile.name : 'Not uploaded'}</li>
          <li>• Background: {backgroundImage ? backgroundImage.name : 'Not uploaded'}</li>
        </ul>
      </div>

      <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 rounded text-xs text-blue-200">
        <p className="font-medium mb-1">💡 Tip:</p>
        <p>Project files (.lvp.json) contain everything you need to resume editing later. Keep them safe!</p>
      </div>
    </div>
  )
}

export default ProjectManager
