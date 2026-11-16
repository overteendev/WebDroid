# WebDroid

An interactive Android 14 / Material You launcher experience styled after the Google Pixel 8 Pro, built with React 19, TypeScript, Vite, Tailwind CSS v4, and Progressive Web App (PWA) offline support.

## Features

- **Material You Dynamic Themed Icons**: App icons across the Home screen, Dock, Folders, App Drawer, Quick Shade notifications, and circular App Launch reveal automatically adopt the active wallpaper's accent palette (including custom uploaded wallpapers), with a **Themed icons** toggle under **Settings → Wallpaper & style**.
- **Pixel 8 Pro Hardware & UI Architecture**: Realistic device frame with centered punch-hole camera, earpiece slit, right-side Power & Volume rockers, circular adaptive app icons, 2×2 circular app folders, At a Glance weather widget, and bottom Google Search pill (`G`, Voice Mic, and Lens).
- **Scalloped MD3 Lock Screen & Optical Fingerprint Unlock**: Always-On Display (AOD) clock and full-screen Scalloped Material Design 3 lock screen with an on-screen optical fingerprint sensor—tap the sensor to unlock directly into the home screen.
- **120fps Motion & Haptic Feedback**: High-refresh-rate spring transitions, circular icon launch reveals, gesture pill navigation, and tactile vibration feedback across taps, folder expansion, and lock/unlock events.
- **Customizable Quick Settings Shade**: Pull down from the status bar and enter Edit Mode to drag and drop Quick Settings tiles into any order (persisted locally).
- **Offline-Ready Static PWA**: Pre-caches fonts, icons, and assets via `vite-plugin-pwa` and Workbox so it works cleanly as static HTML.

---

## Local Development

### Prerequisites

- **Node.js** `20+` (or `22 LTS` recommended)
- **npm** `10+`

### Setup & Scripts

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the local development server (`http://localhost:3000`):
   ```bash
   npm run dev
   ```
3. Run TypeScript type checking:
   ```bash
   npm run lint
   ```
4. Build the static HTML production bundle into `dist/`:
   ```bash
   npm run build
   ```
5. Preview the static build locally:
   ```bash
   npm run preview
   ```

---

## Manual Static HTML Hosting on GitHub Pages

WebDroid is configured with relative asset and PWA manifest paths (`base: './'` in `vite.config.ts` and `./` links in `index.html`), plus `public/.nojekyll`, so the compiled `dist/` folder can be hosted directly on any GitHub Pages static URL (`https://<username>.github.io/<repo-name>/` or `https://<username>.github.io/`):

1. Build the static HTML output:
   ```bash
   npm install
   npm run build
   ```
2. Upload or copy the contents of **`dist/`** (including `index.html`, `assets/`, `manifest.webmanifest`, `sw.js`, icons, and `.nojekyll`) into your GitHub Pages branch/folder (for example, `main` `/` or `gh-pages` `/`).
3. In your GitHub repository, open **Settings → Pages**, set **Source** to **Deploy from a branch**, choose your branch and folder, and click **Save**.
