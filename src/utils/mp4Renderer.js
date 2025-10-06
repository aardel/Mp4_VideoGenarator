import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { calculateScrollSpeed, calculateScrollPosition, calculateTotalLyricsHeight } from './scrollCalculator'

let ffmpeg = null
let ffmpegLoaded = false

/**
 * Load FFmpeg.wasm
 */
async function loadFFmpeg(onProgress = () => {}) {
  if (ffmpegLoaded) return ffmpeg

  ffmpeg = new FFmpeg()

  ffmpeg.on('log', ({ message }) => {
    console.log('FFmpeg:', message)
  })

  ffmpeg.on('progress', ({ progress, time }) => {
    onProgress({ type: 'encoding', progress: progress * 100 })
  })

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  })

  ffmpegLoaded = true
  return ffmpeg
}

/**
 * Render video as MP4 using FFmpeg.wasm
 */
export async function renderMP4Video({
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
  try {
    onProgress({ type: 'init', progress: 0, message: 'Initializing FFmpeg...' })

    // Load FFmpeg
    const ff = await loadFFmpeg(onProgress)

    onProgress({ type: 'init', progress: 5, message: 'Loading files...' })

    // Convert files to Blob URLs immediately to prevent permission issues
    // Create stable blob URLs that won't expire during rendering
    let audioBlob = null
    let audioBlobUrl = null
    if (audioFile) {
      audioBlob = audioFile instanceof Blob ? audioFile : await audioFile.arrayBuffer().then(ab => new Blob([ab]))
      audioBlobUrl = URL.createObjectURL(audioBlob)
    }

    onProgress({ type: 'init', progress: 10, message: 'Rendering frames...' })

    // Set up canvas dimensions
    const dimensions = resolution === '1080p'
      ? { width: 1920, height: 1080 }
      : { width: 1280, height: 720 }

    const canvas = document.createElement('canvas')
    canvas.width = dimensions.width
    canvas.height = dimensions.height
    const ctx = canvas.getContext('2d', { alpha: false })

    // Enable sub-pixel positioning and font smoothing
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Load background image with stable blob URL
    let backgroundImg = null
    let backgroundBlobUrl = null
    if (backgroundImage) {
      const bgBlob = backgroundImage instanceof Blob ? backgroundImage : await backgroundImage.arrayBuffer().then(ab => new Blob([ab]))
      backgroundBlobUrl = URL.createObjectURL(bgBlob)
      backgroundImg = await loadImageFromUrl(backgroundBlobUrl)
    }

    // Calculate video parameters
    const lineHeight = styles.fontSize * styles.lineHeight
    const totalHeight = calculateTotalLyricsHeight(lyricsLines, lineHeight)
    const scrollSpeed = calculateScrollSpeed(totalHeight, audioDuration, scrollSettings)

    // Render all frames
    const totalFrames = Math.ceil(audioDuration * frameRate)
    const frames = []

    onProgress({ type: 'rendering', progress: 10, message: `Rendering ${totalFrames} frames...` })

    for (let i = 0; i < totalFrames; i++) {
      const currentTime = i / frameRate

      // Render frame
      renderFrame(ctx, canvas, {
        currentTime,
        backgroundImg,
        lyricsLines,
        scrollSpeed,
        scrollSettings,
        styles,
        lineHeight,
        songTitle,
        dimensions
      })

      // Convert canvas to blob with lower quality for faster encoding
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.92))
      const arrayBuffer = await blob.arrayBuffer()
      frames.push(new Uint8Array(arrayBuffer))

      // Update progress
      if (i % 10 === 0) {
        const progress = 10 + (i / totalFrames) * 30
        onProgress({ type: 'rendering', progress, message: `Rendering frame ${i + 1}/${totalFrames}...` })
      }
    }

    onProgress({ type: 'encoding', progress: 40, message: 'Writing frames to FFmpeg...' })

    // Write frames to FFmpeg
    for (let i = 0; i < frames.length; i++) {
      const filename = `frame${i.toString().padStart(5, '0')}.png`
      await ff.writeFile(filename, frames[i])

      if (i % 50 === 0) {
        const progress = 40 + (i / frames.length) * 10
        onProgress({ type: 'encoding', progress, message: `Writing frame ${i + 1}/${frames.length}...` })
      }
    }

    onProgress({ type: 'encoding', progress: 50, message: 'Writing audio file...' })

    // Write audio file using stable blob URL
    await ff.writeFile('audio.mp3', await fetchFile(audioBlobUrl))

    onProgress({ type: 'encoding', progress: 55, message: 'Encoding video with FFmpeg...' })

    // Run FFmpeg to create video with optimized settings
    // Use 'veryfast' preset for faster encoding (was 'medium')
    // CRF 25 for slightly smaller file size with minimal quality loss (was 23)
    await ff.exec([
      '-framerate', frameRate.toString(),
      '-i', 'frame%05d.png',
      '-i', 'audio.mp3',
      '-c:v', 'libx264',
      '-preset', 'veryfast', // Faster encoding
      '-crf', '25', // Slightly smaller files
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '128k', // Lower audio bitrate (was 192k, fine for lyrics videos)
      '-shortest',
      'output.mp4'
    ])

    onProgress({ type: 'encoding', progress: 90, message: 'Reading output...' })

    // Read the output
    const data = await ff.readFile('output.mp4')
    const blob = new Blob([data.buffer], { type: 'video/mp4' })

    onProgress({ type: 'encoding', progress: 95, message: 'Cleaning up...' })

    // Clean up files
    for (let i = 0; i < frames.length; i++) {
      const filename = `frame${i.toString().padStart(5, '0')}.png`
      try {
        await ff.deleteFile(filename)
      } catch (e) {
        // Ignore deletion errors
      }
    }

    try {
      await ff.deleteFile('audio.mp3')
      await ff.deleteFile('output.mp4')
    } catch (e) {
      // Ignore deletion errors
    }

    // Clean up blob URLs
    if (audioBlobUrl) URL.revokeObjectURL(audioBlobUrl)
    if (backgroundBlobUrl) URL.revokeObjectURL(backgroundBlobUrl)

    onProgress({ type: 'complete', progress: 100, message: 'Complete!' })

    return blob

  } catch (error) {
    console.error('MP4 rendering error:', error)
    throw new Error('Failed to render MP4: ' + error.message)
  }
}

/**
 * Render a single frame
 */
function renderFrame(ctx, canvas, {
  currentTime,
  backgroundImg,
  lyricsLines,
  scrollSpeed,
  scrollSettings,
  styles,
  lineHeight,
  songTitle,
  dimensions
}) {
  const { width, height } = dimensions

  // Clear canvas
  ctx.clearRect(0, 0, width, height)

  // Draw background
  if (backgroundImg) {
    ctx.save()
    if (styles.backgroundBlur > 0) {
      ctx.filter = `blur(${styles.backgroundBlur}px) brightness(${styles.backgroundBrightness}%)`
    } else {
      ctx.filter = `brightness(${styles.backgroundBrightness}%)`
    }

    const imgRatio = backgroundImg.width / backgroundImg.height
    const canvasRatio = width / height
    let drawWidth, drawHeight, offsetX = 0, offsetY = 0

    if (imgRatio > canvasRatio) {
      drawHeight = height
      drawWidth = height * imgRatio
      offsetX = (width - drawWidth) / 2
    } else {
      drawWidth = width
      drawHeight = width / imgRatio
      offsetY = (height - drawHeight) / 2
    }

    ctx.drawImage(backgroundImg, offsetX, offsetY, drawWidth, drawHeight)
    ctx.restore()
  } else {
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, '#1a1a2e')
    gradient.addColorStop(1, '#0f0f1e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
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
      textY = height - visibleHeight - 100
      break
    case 'center':
    default:
      textY = (height - visibleHeight) / 2
      break
  }

  // Draw text background
  if (styles.backgroundColor && parseFloat(styles.backgroundColor.match(/[\d.]+(?=\))/)?.[0]) > 0) {
    ctx.fillStyle = styles.backgroundColor
    const padding = 60
    ctx.fillRect(
      padding,
      textY - padding / 2,
      width - padding * 2,
      visibleHeight + padding
    )
  }

  // Set up text styling with improved rendering
  ctx.font = `${styles.fontSize}px ${styles.fontFamily}`
  ctx.fillStyle = styles.fontColor
  ctx.textAlign = styles.textAlign
  ctx.textBaseline = 'middle' // Better vertical alignment

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
      textX = width - 120
      break
    case 'center':
    default:
      textX = width / 2
      break
  }

  // Check if we should show instrumental or lyrics
  const fadeInStart = scrollSettings.startDelay - 2 // 2 seconds before delay ends
  const showInstrumental = currentTime < fadeInStart && scrollSettings.startDelay > 0
  const inFadeIn = currentTime >= fadeInStart && currentTime < scrollSettings.startDelay

  if (showInstrumental) {
    // Show "INSTRUMENTAL" text during delay (before fade-in)
    ctx.save()
    ctx.font = `bold ${styles.fontSize * 1.2}px ${styles.fontFamily}`
    ctx.fillStyle = styles.fontColor
    ctx.textAlign = 'center'

    if (styles.textShadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
    }

    const instrumentalY = textY + visibleHeight / 2
    ctx.fillText('INSTRUMENTAL', width / 2, instrumentalY)
    ctx.restore()
  } else {
    // Calculate fade-in opacity
    let opacity = 1
    if (inFadeIn) {
      // Fade in over 2 seconds
      const fadeProgress = (currentTime - fadeInStart) / 2
      opacity = Math.min(fadeProgress, 1)
    }

    // Draw lyrics with fade effect
    ctx.save()
    ctx.globalAlpha = opacity
    ctx.beginPath()
    ctx.rect(0, textY, width, visibleHeight)
    ctx.clip()

    lyricsLines.forEach((line, index) => {
      const y = textY + (index * lineHeight) - scrollPosition + visibleHeight / 2

      if (y > textY - lineHeight && y < textY + visibleHeight + lineHeight) {
        if (line.trim() !== '') {
          ctx.fillText(line, textX, y)
        }
      }
    })

    ctx.restore()
  }

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

    switch (styles.titlePosition) {
      case 'top-left':
        ctx.textAlign = 'left'
        titleX = padding
        titleY = padding + styles.titleSize
        break
      case 'top-right':
        ctx.textAlign = 'right'
        titleX = width - padding
        titleY = padding + styles.titleSize
        break
      case 'bottom-left':
        ctx.textAlign = 'left'
        titleX = padding
        titleY = height - padding
        break
      case 'bottom-right':
        ctx.textAlign = 'right'
        titleX = width - padding
        titleY = height - padding
        break
    }

    ctx.fillText(songTitle, titleX, titleY)
  }
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
 * Load image from URL
 */
function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

/**
 * Download blob as file
 */
export function downloadMP4(blob, filename = 'lyric-video.mp4') {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
