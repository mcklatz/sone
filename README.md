# Tide Vibe - Tidal Streaming Client for Linux

A native Linux music player that streams from Tidal with bit-perfect audio quality.

## Features

- 🎵 **Tidal Streaming**: Full integration with Tidal's music library
- 🎨 **Beautiful UI**: Pixel-perfect recreation of the official Tidal interface
- 🎧 **Audiophile Quality**: Streams LOSSLESS FLAC (16-bit/44.1kHz) for bit-perfect playback
- ⚡ **Native Performance**: Built with Tauri (Rust + React) for minimal resource usage
- ⌨️ **Keyboard Shortcuts**: Space (play/pause), Arrows (volume/skip)
- 💾 **Persistent Sessions**: Saves your login and preferences
- 🎼 **Queue Management**: Auto-play next track

## Setup

### Prerequisites

1. **Rust**: Install via rustup

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
   source "$HOME/.cargo/env"
   ```

2. **System Dependencies** (Ubuntu/Debian):

   ```bash
   sudo apt update
   sudo apt install -y libwebkit2gtk-4.1-dev \
       build-essential \
       curl \
       wget \
       file \
       libssl-dev \
       libgtk-3-dev \
       libayatana-appindicator3-dev \
       librsvg2-dev
   ```

3. **Node.js**: Version 16+ required

### Installation

```bash
cd ~/dev/tide-vibe
npm install
npm run tauri dev
```

## First Run

1. Click **"Login with Tidal"**
2. Enter the displayed code at [link.tidal.com](https://link.tidal.com)
3. Your playlists will load automatically
4. Click any album or track to start playing

## Audio Setup

For best quality on Linux:

1. Select **"Pro Audio"** profile in your sound settings
2. Set Linux volume to **100%**
3. Control volume with your DAC/amp knob

## Keyboard Shortcuts

- `Space`: Play / Pause
- `→`: Next track
- `↑` / `↓`: Volume up / down

## Technical Details

- **Backend**: Rust with `rodio` for audio playback
- **Frontend**: React + Tailwind CSS
- **API**: Unofficial Tidal API integration
- **Audio Format**: Streams unencrypted FLAC (LOSSLESS quality)
- **Config**: Stored in `~/.config/tide-vibe/`

## Known Limitations

- Hi-Res/Master quality (24-bit/96kHz+) requires Widevine DRM (not yet implemented)
- Currently supports LOSSLESS (CD Quality) which is unencrypted
- No offline downloads

## License

MIT

## Disclaimer

This is an unofficial third-party client. Not affiliated with Tidal.
