/**
 * Project Manager - Save and Load lyric video projects
 */

/**
 * Save project to a downloadable JSON file
 */
export async function saveProject({
  songTitle,
  lyrics,
  audioFile,
  backgroundImage,
  scrollSettings,
  styles
}) {
  const projectData = {
    version: '1.0',
    savedAt: new Date().toISOString(),
    songTitle,
    lyrics,
    scrollSettings,
    styles,
    files: {}
  }

  // Convert audio file to base64
  if (audioFile) {
    const audioBase64 = await fileToBase64(audioFile)
    projectData.files.audio = {
      name: audioFile.name,
      type: audioFile.type,
      data: audioBase64
    }
  }

  // Convert background image to base64
  if (backgroundImage) {
    const imageBase64 = await fileToBase64(backgroundImage)
    projectData.files.backgroundImage = {
      name: backgroundImage.name,
      type: backgroundImage.type,
      data: imageBase64
    }
  }

  return projectData
}

/**
 * Download project as JSON file
 */
export function downloadProject(projectData, filename) {
  const jsonString = JSON.stringify(projectData, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename || `${projectData.songTitle || 'lyric-video-project'}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Load project from JSON file
 */
export async function loadProject(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const projectData = JSON.parse(e.target.result)

        // Validate project data
        if (!projectData.version) {
          throw new Error('Invalid project file')
        }

        // Convert base64 files back to File objects
        const restoredProject = {
          songTitle: projectData.songTitle || '',
          lyrics: projectData.lyrics || '',
          scrollSettings: projectData.scrollSettings,
          styles: projectData.styles,
          audioFile: null,
          backgroundImage: null
        }

        // Restore audio file
        if (projectData.files?.audio) {
          restoredProject.audioFile = await base64ToFile(
            projectData.files.audio.data,
            projectData.files.audio.name,
            projectData.files.audio.type
          )
        }

        // Restore background image
        if (projectData.files?.backgroundImage) {
          restoredProject.backgroundImage = await base64ToFile(
            projectData.files.backgroundImage.data,
            projectData.files.backgroundImage.name,
            projectData.files.backgroundImage.type
          )
        }

        resolve(restoredProject)
      } catch (error) {
        reject(new Error('Failed to load project: ' + error.message))
      }
    }

    reader.onerror = () => reject(new Error('Failed to read project file'))
    reader.readAsText(file)
  })
}

/**
 * Convert File to base64 string
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Convert base64 string back to File object
 */
function base64ToFile(base64String, filename, mimeType) {
  const byteCharacters = atob(base64String)
  const byteNumbers = new Array(byteCharacters.length)

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: mimeType })

  return new File([blob], filename, { type: mimeType })
}

/**
 * Get project info without loading full files
 */
export function getProjectInfo(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const projectData = JSON.parse(e.target.result)

        resolve({
          songTitle: projectData.songTitle || 'Untitled',
          savedAt: projectData.savedAt,
          hasAudio: !!projectData.files?.audio,
          hasBackground: !!projectData.files?.backgroundImage,
          lyricsLineCount: projectData.lyrics?.split('\n').length || 0
        })
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = reject
    reader.readAsText(file)
  })
}
