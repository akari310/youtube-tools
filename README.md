# YouTube Ultimate Tools 🚀

[![Greasy Fork](https://img.shields.io/greasyfork/v/576162?label=Greasy%20Fork&color=red)](https://greasyfork.org/scripts/576162)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

A powerful, modular, and glassmorphic userscript designed to enhance your experience on **YouTube** and **YouTube Music**.

---

## ✨ Features

### 📺 YouTube Features
- **High-Quality Downloads**: MP4 (up to 4K/8K) and audio in MP3/FLAC.
- **Return YouTube Dislikes**: Real-time dislike count synchronization.
- **Cinema & Ambient Mode**: Enhanced visual experience with dynamic backgrounds.
- **Picture-in-Picture & Screenshots**: Modern tools for modern viewers.
- **Translate Comments**: Google Translate integration directly in the comment section.

### 🎵 YouTube Music (YTM) Features
- **Glassmorphic UI**: Beautifully redesigned interface with blur effects.
- **Advanced Ambient Mode**: Dynamic aura based on album art colors.
- **Nonstop Playback**: No more "Continue watching?" interruptions.
- **Audio-only Mode**: Focus on the music, save bandwidth.

---

## 🚀 Installation

### Step 1: Install a Userscript Manager
- **Tampermonkey** (Recommended): [Chrome](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) | [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
- **Violentmonkey**: [Chrome](https://chromewebstore.google.com/detail/violentmonkey/jinjacbljjnnnndkhlebbnbiomkhpnih)

### Step 2: Install the Script
[![Install Script](https://img.shields.io/badge/Install-YouTube_Ultimate_Tools-red?style=flat-square&logo=tampermonkey)](https://greasyfork.org/scripts/576162/code/YouTube%20Ultimate%20Tools.user.js)

---

## 🛠️ Development (For Contributors)

This project has been modernized with a **Node.js** workflow and a **Modular Structure**.

### Project Structure
- `src/core/`: Metadata, Initialization, and State management.
- `src/utils/`: Helper functions and API parsers.
- `src/ui/`: Themes, Styles, and Menu components.
- `src/features/`: Specialized modules (Dislikes, Downloads, Visualizer, etc.).
- `src/main/`: Core logic manager and DOM observers.

### Getting Started
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
   *This generates `youtube-tools.user.js` and a minified version.*

4. Submit a Pull Request:
   - Create a new branch for your feature.
   - Push your changes and open a PR on GitHub for review.

---

## 📜 Credits

Developed with ❤️ by:
- [**Akari**](https://github.com/akari310) (Optimization & Enhancements)
- [**DeveloperMDCM**](https://github.com/DeveloperMDCM) (Base Project & Core)
- [**nvbangg**](https://github.com/nvbangg) (Nonstop & Audio Features)

## 📄 License
This project is licensed under the [GNU General Public License v3.0](LICENSE).
