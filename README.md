# Auto-Scrolling Lyric Video Creator

A web application that creates professional lyric videos with automatic scrolling text, perfectly timed to your music.

## Features

- **Auto-Scroll Calculation**: Automatically calculates scroll speed to finish exactly when the song ends
- **File Upload**: Support for MP3, WAV, M4A audio files and custom background images
- **Live Preview**: Real-time preview with canvas rendering and smooth scrolling
- **Customizable Styling**:
  - Multiple fonts and sizes
  - Text colors and shadows
  - Background effects (blur, brightness)
  - Vertical positioning options
- **Scroll Controls**:
  - Speed modifier (50%-200%)
  - Start delay
  - End padding
  - Visible lines adjustment (3-10 lines)
- **Video Export**: Export to high-quality WebM video (720p or 1080p at 30/60 FPS)

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

### Usage

1. **Upload Audio**: Click "Upload Audio File" and select your music file
2. **Add Lyrics**: Either upload a .txt file or paste lyrics directly into the editor
3. **Upload Background**: (Optional) Add a background image for your video
4. **Adjust Settings**:
   - Fine-tune scroll speed, delays, and visible lines
   - Customize text styling (font, size, color, alignment)
   - Adjust background effects
5. **Preview**: Play the audio and watch the real-time preview
6. **Export**: Choose resolution and frame rate, then click "Export Video"

## How It Works

The app automatically calculates the scroll speed based on:
- Total lyrics height (lines × line height)
- Audio duration
- Start delay and end padding settings

**Formula**: `scrollSpeed = lyricsHeight / (duration - delay - padding) × speedModifier`

The lyrics scroll smoothly from bottom to top, showing approximately 5 lines at a time (configurable), and finish scrolling exactly when the song ends.

## Technology Stack

- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Canvas API** - Rendering
- **MediaRecorder API** - Video export
- **Web Audio API** - Audio processing

## Build for Production

```bash
npm run build
```

The optimized files will be in the `dist` folder.

## Preview Production Build

```bash
npm run preview
```

## Keyboard Shortcuts

- **Space**: Play/Pause audio (when audio player is focused)
- **Arrow Keys**: Seek through audio (when progress bar is focused)

## Tips

- Use high-resolution background images (1920x1080 or larger) for best quality
- For long songs, consider increasing visible lines to reduce scroll speed
- Test different scroll speeds with the speed modifier slider
- Enable text shadow for better readability over complex backgrounds
- Use background blur to make text more prominent

## Browser Compatibility

Works best in modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

Note: Video export uses WebM format which may not be supported in all browsers. Chrome/Edge recommended for export.

## License

MIT
