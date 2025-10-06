import { useEffect, useRef, useState } from 'react'
import { calculateScrollSpeed, calculateScrollPosition, calculateTotalLyricsHeight } from '../utils/scrollCalculator'

function PreviewPlayer({
  currentTime,
  lyricsLines,
  backgroundImage,
  scrollSettings,
  styles,
  audioDuration,
  isPlaying,
  songTitle
}) {
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)
  const [backgroundImageLoaded, setBackgroundImageLoaded] = useState(null)
  const lastTimeRef = useRef(currentTime)
  const smoothScrollRef = useRef(0)

  // Load background image
  useEffect(() => {
    if (!backgroundImage) {
      setBackgroundImageLoaded(null)
      return
    }

    const img = new Image()
    img.onload = () => {
      setBackgroundImageLoaded(img)
    }
    img.src = URL.createObjectURL(backgroundImage)

    return () => {
      URL.revokeObjectURL(img.src)
    }
  }, [backgroundImage])

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })

    // Enable sub-pixel positioning and font smoothing
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    const width = canvas.width
    const height = canvas.height

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw background
      if (backgroundImageLoaded) {
        ctx.save()

        // Apply blur if needed
        if (styles.backgroundBlur > 0) {
          ctx.filter = `blur(${styles.backgroundBlur}px) brightness(${styles.backgroundBrightness}%)`
        } else {
          ctx.filter = `brightness(${styles.backgroundBrightness}%)`
        }

        // Draw image to cover canvas
        const imgRatio = backgroundImageLoaded.width / backgroundImageLoaded.height
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

        ctx.drawImage(backgroundImageLoaded, offsetX, offsetY, drawWidth, drawHeight)
        ctx.restore()
      } else {
        // Default gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, height)
        gradient.addColorStop(0, '#1a1a2e')
        gradient.addColorStop(1, '#0f0f1e')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
      }

      // Calculate scroll position with smooth interpolation
      const lineHeight = styles.fontSize * styles.lineHeight
      const totalHeight = calculateTotalLyricsHeight(lyricsLines, lineHeight)
      const scrollSpeed = calculateScrollSpeed(totalHeight, audioDuration, scrollSettings)
      const targetScrollPosition = calculateScrollPosition(currentTime, scrollSpeed, scrollSettings)

      // Smooth interpolation for scrolling (lerp with 0.15 factor for smoothness)
      const lerpFactor = isPlaying ? 0.15 : 1 // Instant when paused, smooth when playing
      smoothScrollRef.current += (targetScrollPosition - smoothScrollRef.current) * lerpFactor
      const scrollPosition = smoothScrollRef.current

      // Reset smooth scroll on seek
      if (Math.abs(currentTime - lastTimeRef.current) > 0.5) {
        smoothScrollRef.current = targetScrollPosition
      }
      lastTimeRef.current = currentTime

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

      // Draw text background box
      if (styles.backgroundColor && parseFloat(styles.backgroundColor.match(/[\d.]+(?=\))/)?.[0]) > 0) {
        ctx.fillStyle = styles.backgroundColor
        const padding = 40
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

      // Reset shadow
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Add text shadow if enabled
      if (styles.textShadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
        ctx.shadowBlur = 10
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
      }

      // Calculate text X position based on alignment
      let textX
      switch (styles.textAlign) {
        case 'left':
          textX = 80
          break
        case 'right':
          textX = width - 80
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
          // For empty lines, use smaller spacing
          const currentLineHeight = line.trim() === '' ? lineHeight * 0.5 : lineHeight
          const y = textY + (index * lineHeight) - scrollPosition + visibleHeight / 2

          // Only draw lines that are visible (skip empty lines)
          if (y > textY - lineHeight && y < textY + visibleHeight + lineHeight) {
            if (line.trim() !== '') {
              ctx.fillText(line, textX, y)
            }
          }
        })

        ctx.restore()
      }

      // Draw center line indicator (subtle)
      const centerY = textY + visibleHeight / 2
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(50, centerY)
      ctx.lineTo(width - 50, centerY)
      ctx.stroke()

      // Draw song title if enabled
      if (styles.showTitle && songTitle) {
        // Reset canvas state for title
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)'
        ctx.shadowBlur = 8
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2

        ctx.font = `bold ${styles.titleSize}px ${styles.fontFamily}`
        ctx.fillStyle = styles.fontColor
        ctx.textBaseline = 'alphabetic'

        const padding = 40
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

    render()

    // Re-render when playing
    if (isPlaying) {
      const animate = () => {
        render()
        animationFrameRef.current = requestAnimationFrame(animate)
      }
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [currentTime, lyricsLines, backgroundImageLoaded, scrollSettings, styles, audioDuration, isPlaying, songTitle])

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Preview</h2>

      <div className="relative bg-black rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="w-full h-auto"
          style={{ maxHeight: '500px' }}
        />

        {!backgroundImage && (
          <div className="absolute top-4 left-4 text-gray-400 text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
            No background image
          </div>
        )}

        {lyricsLines.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-400 text-lg">No lyrics to display</p>
          </div>
        )}
      </div>

      <p className="mt-3 text-sm text-gray-400">
        Preview updates in real-time as you adjust settings and play the audio.
      </p>
    </div>
  )
}

export default PreviewPlayer
