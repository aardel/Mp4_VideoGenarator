# Auto-Scrolling Lyric Video Creator

A web application that creates professional lyric videos with automatic scrolling text, perfectly timed to your music.

## Features

### Core Features
- **Auto-Scroll Calculation**: Automatically calculates scroll speed to finish exactly when the song ends
- **Smooth Scrolling**: Sub-pixel rendering with interpolation for buttery-smooth 60fps scrolling
- **File Upload**: Support for MP3, WAV, M4A audio files and custom background images
- **Live Preview**: Real-time canvas preview with smooth rendering

### Video Export
- **MP4 Export**: YouTube-ready MP4 videos (H.264 + AAC)
- **Quality Presets**:
  - **Fast**: 720p @ 24fps (~2-3 min render time) - Recommended
  - **Balanced**: 720p @ 30fps (~3-4 min render time)
  - **Quality**: 1080p @ 30fps (~4-6 min render time)
  - **Max Quality**: 1080p @ 60fps (~6-10 min render time)
- **Optimized Encoding**: Uses FFmpeg with fast presets for quick exports

### Styling & Customization
- **Song Title**: Display title in any corner (top/bottom, left/right)
- **Font Controls**: Multiple fonts, sizes, auto-size for longest line
- **Colors**: Text color, background color with opacity
- **Effects**: Text shadows, background blur, brightness adjustment
- **Alignment**: Left, center, or right text alignment
- **Positioning**: Top, center, or bottom vertical positioning

### Lyrics Management
- **Smart Lyrics Cleaner**: Automatically detects and removes:
  - Song titles and metadata
  - Section headers (Verse, Chorus, etc.)
  - Separators and empty lines
  - Configurable filters with preview
- **Lyrics Editor**:
  - Live line tracking (current line, character count)
  - Longest line detection
  - Full-screen viewer overlay
  - Auto-scroll to highlighted lines

### Advanced Features
- **Instrumental Display**: Shows "INSTRUMENTAL" during start delay with 2-second fade-in
- **Project Manager**: Save/load complete projects as portable JSON files
  - All settings preserved
  - Audio and images embedded (Base64)
  - Easy sharing and backup
- **Auto-Size Font**: Automatically calculates optimal font size for longest line
- **Scroll Controls**:
  - Speed modifier (50%-200%)
  - Start delay (0-30 seconds)
  - End padding
  - Visible lines adjustment (3-10 lines)

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

1. **Upload Files**:
   - Upload your audio file (MP3, WAV, or M4A)
   - Add lyrics (paste text or upload .txt file)
   - (Optional) Upload a background image
   - Enter song title

2. **Clean Lyrics** (Optional):
   - Click "🧹 Clean" button in lyrics editor
   - Toggle filters to remove metadata, sections, separators
   - Preview cleaned lyrics and apply

3. **Customize Styling**:
   - Use "Auto Size" to optimize font for longest line
   - Adjust font family, size, color, and effects
   - Position song title in desired corner
   - Configure background blur and brightness

4. **Fine-Tune Scrolling**:
   - Set start delay for instrumental intro
   - Adjust scroll speed modifier (50%-200%)
   - Configure visible lines (3-10)
   - Set end padding

5. **Preview**:
   - Play audio to see real-time scrolling preview
   - Use "📖 View" to see all lyrics in full-screen overlay
   - Make adjustments as needed

6. **Export Video**:
   - Choose quality preset (Fast recommended for most cases)
   - Click "🎬 Export Video"
   - Wait for rendering to complete (~2-10 min depending on preset)
   - Video downloads as MP4, ready for YouTube upload

7. **Save Project** (Optional):
   - Click "Save Project" to download a .lvp.json file
   - All settings, audio, and images are embedded
   - Use "Load Project" to restore later

## How It Works

The app automatically calculates the scroll speed based on:
- Total lyrics height (lines × line height)
- Audio duration
- Start delay and end padding settings

**Formula**: `scrollSpeed = lyricsHeight / (duration - delay - padding) × speedModifier`

The lyrics scroll smoothly from bottom to top, showing approximately 5 lines at a time (configurable), and finish scrolling exactly when the song ends.

## Technology Stack

- **React 18** - UI framework with hooks
- **Vite 5** - Fast build tool with HMR
- **Tailwind CSS 3** - Utility-first styling
- **Canvas API** - High-performance 60fps rendering with sub-pixel positioning
- **FFmpeg.wasm** - Browser-based MP4 video encoding (H.264 + AAC)
- **Web Audio API** - Audio playback and timing

## Build for Production

```bash
npm run build
```

The optimized files will be in the `dist` folder.

## Preview Production Build

```bash
npm run preview
```

## Tips & Best Practices

### For Best Results:
- **Use "Fast" preset** (720p @ 24fps) for quick exports - perfect quality for YouTube lyrics videos
- **Use high-resolution background images** (1920x1080 or larger) for best quality
- **Enable text shadow** for better readability over complex backgrounds
- **Use background blur** to make text stand out more
- **Use "Auto Size"** button to automatically optimize font size for your lyrics

### Workflow Tips:
- Clean lyrics first before adjusting styling (use the 🧹 Clean button)
- Save your project after setup to preserve all settings
- Preview with audio playback before exporting
- Use the full-screen viewer (📖 View) to check all lyrics before export

### Troubleshooting:
- If export fails halfway, try reloading the page and loading your saved project
- Use lower quality presets (Fast/Balanced) for faster, more reliable exports
- Ensure your audio file is accessible before starting export

## Browser Compatibility

**Recommended**: Chrome/Edge (best performance and compatibility)

Also works in:
- Firefox (may have slower export speeds)
- Safari (limited FFmpeg support)

**Note**: MP4 export uses FFmpeg.wasm which works best in Chromium-based browsers.

## License

MIT
