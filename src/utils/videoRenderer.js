import { calculateScrollSpeed, calculateScrollPosition, calculateTotalLyricsHeight } from './scrollCalculator'

/**
 * Render video using MediaRecorder API
 */
export async function renderVideo({
  audioFile,
  lyricsLines,
  backgroundImage,
  scrollSettings,
  styles,
  audioDuration,
  songTitle = '',
  resolution = '1080p',
  frameRate = 30,
  onProgress = () => {}
}) {
  return new Promise(async (resolve, reject) => {
    try {
      // Set up canvas dimensions
      const dimensions = resolution === '1080p'
        ? { width: 1920, height: 1080 }
        : { width: 1280, height: 720 }

      const canvas = document.createElement('canvas')
      canvas.width = dimensions.width
      canvas.height = dimensions.height
      const ctx = canvas.getContext('2d')

      // Load background image
      let backgroundImg = null
      if (backgroundImage) {
        backgroundImg = await loadImage(backgroundImage)
      }

      // Load and set up audio
      const audioElement = new Audio(URL.createObjectURL(audioFile))
      await new Promise((resolve) => {
        audioElement.addEventListener('loadedmetadata', resolve, { once: true })
      })

      // Set up MediaRecorder
      const stream = canvas.captureStream(frameRate)

      // Add audio track to stream
      const audioContext = new AudioContext()
      const source = audioContext.createMediaElementSource(audioElement)
      const destination = audioContext.createMediaStreamDestination()
      source.connect(destination)
      source.connect(audioContext.destination)

      stream.addTrack(destination.stream.getAudioTracks()[0])

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 8000000 // 8 Mbps
      })

      const chunks = []
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        URL.revokeObjectURL(audioElement.src)
        audioContext.close()
        resolve(blob)
      }

      mediaRecorder.onerror = (e) => {
        reject(new Error('MediaRecorder error: ' + e.error))
      }

      // Calculate scroll parameters
      const lineHeight = styles.fontSize * styles.lineHeight
      const totalHeight = calculateTotalLyricsHeight(lyricsLines, lineHeight)
      const scrollSpeed = calculateScrollSpeed(totalHeight, audioDuration, scrollSettings)

      // Render function
      const render = (currentTime) => {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw background
        if (backgroundImg) {
          ctx.save()
          if (styles.backgroundBlur > 0) {
            ctx.filter = `blur(${styles.backgroundBlur}px) brightness(${styles.backgroundBrightness}%)`
          } else {
            ctx.filter = `brightness(${styles.backgroundBrightness}%)`
          }

          const imgRatio = backgroundImg.width / backgroundImg.height
          const canvasRatio = canvas.width / canvas.height
          let drawWidth, drawHeight, offsetX = 0, offsetY = 0

          if (imgRatio > canvasRatio) {
            drawHeight = canvas.height
            drawWidth = canvas.height * imgRatio
            offsetX = (canvas.width - drawWidth) / 2
          } else {
            drawWidth = canvas.width
            drawHeight = canvas.width / imgRatio
            offsetY = (canvas.height - drawHeight) / 2
          }

          ctx.drawImage(backgroundImg, offsetX, offsetY, drawWidth, drawHeight)
          ctx.restore()
        } else {
          const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
          gradient.addColorStop(0, '#1a1a2e')
          gradient.addColorStop(1, '#0f0f1e')
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }

        // Calculate scroll position
        const scrollPosition = calculateScrollPosition(currentTime, scrollSpeed, scrollSettings)

        // Calculate visible area
        const visibleHeight = lineHeight * scrollSettings.visibleLines
        let textY

        switch (styles.verticalPosition) {
          case 'top':
            textY = 100
            break
          case 'bottom':
            textY = canvas.height - visibleHeight - 100
            break
          case 'center':
          default:
            textY = (canvas.height - visibleHeight) / 2
            break
        }

        // Draw text background
        if (styles.backgroundColor && parseFloat(styles.backgroundColor.match(/[\d.]+(?=\))/)?.[0]) > 0) {
          ctx.fillStyle = styles.backgroundColor
          const padding = 60
          ctx.fillRect(
            padding,
            textY - padding / 2,
            canvas.width - padding * 2,
            visibleHeight + padding
          )
        }

        // Set up text styling
        ctx.font = `${styles.fontSize}px ${styles.fontFamily}`
        ctx.fillStyle = styles.fontColor
        ctx.textAlign = styles.textAlign

        if (styles.textShadow) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
          ctx.shadowBlur = 10
          ctx.shadowOffsetX = 2
          ctx.shadowOffsetY = 2
        }

        let textX
        switch (styles.textAlign) {
          case 'left':
            textX = 120
            break
          case 'right':
            textX = canvas.width - 120
            break
          case 'center':
          default:
            textX = canvas.width / 2
            break
        }

        // Draw lyrics
        ctx.save()
        ctx.beginPath()
        ctx.rect(0, textY, canvas.width, visibleHeight)
        ctx.clip()

        lyricsLines.forEach((line, index) => {
          const y = textY + (index * lineHeight) - scrollPosition + visibleHeight / 2

          if (y > textY - lineHeight && y < textY + visibleHeight + lineHeight) {
            ctx.fillText(line, textX, y)
          }
        })

        ctx.restore()

        // Draw song title if enabled
        if (styles.showTitle && songTitle) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.9)'
          ctx.shadowBlur = 8
          ctx.shadowOffsetX = 2
          ctx.shadowOffsetY = 2

          ctx.font = `bold ${styles.titleSize}px ${styles.fontFamily}`
          ctx.fillStyle = styles.fontColor

          const padding = 60
          let titleX, titleY

          // Calculate position based on titlePosition
          switch (styles.titlePosition) {
            case 'top-left':
              ctx.textAlign = 'left'
              titleX = padding
              titleY = padding + styles.titleSize
              break
            case 'top-right':
              ctx.textAlign = 'right'
              titleX = canvas.width - padding
              titleY = padding + styles.titleSize
              break
            case 'bottom-left':
              ctx.textAlign = 'left'
              titleX = padding
              titleY = canvas.height - padding
              break
            case 'bottom-right':
              ctx.textAlign = 'right'
              titleX = canvas.width - padding
              titleY = canvas.height - padding
              break
          }

          ctx.fillText(songTitle, titleX, titleY)
        }
      }

      // Start recording
      mediaRecorder.start()
      audioElement.play()

      // Animation loop
      let startTime = performance.now()
      let lastProgressUpdate = 0

      const animate = () => {
        const elapsed = (performance.now() - startTime) / 1000
        const currentTime = audioElement.currentTime

        render(currentTime)

        // Update progress every 100ms
        if (elapsed - lastProgressUpdate > 0.1) {
          const progress = Math.min((currentTime / audioDuration) * 100, 100)
          onProgress(progress)
          lastProgressUpdate = elapsed
        }

        if (currentTime < audioDuration && !audioElement.paused) {
          requestAnimationFrame(animate)
        } else {
          mediaRecorder.stop()
          onProgress(100)
        }
      }

      requestAnimationFrame(animate)

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Load image from file
 */
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Download blob as file
 */
export function downloadVideo(blob, filename = 'lyric-video.webm') {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
