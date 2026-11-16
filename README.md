# WebDroid

An interactive Android 14 / Material You launcher experience styled after the Google Pixel 8 Pro, built with React 19, TypeScript, Vite, Tailwind CSS v4, and Progressive Web App (PWA) offline support. Designed to build cleanly into a self-contained static HTML bundle (`dist/`) for GitHub Pages (GitHub Actions or `gh-pages`) and Netlify Drop.

## Features

- **Material You Dynamic Themed Icons**: App icons across the Home screen, Dock, Folders, App Drawer, Quick Shade notifications, and circular App Launch reveal automatically inherit your active wallpaper's accent color palette (including custom uploaded wallpapers), with a **Themed icons** toggle under **Settings → Wallpaper & style**.
- **Pixel 8 Pro Hardware & UI Architecture**: Realistic device frame with centered punch-hole camera, earpiece slit, right-side Power & Volume rockers, circular adaptive app icons, 2×2 circular app folders, At a Glance weather widget, and bottom Google Search pill (`G`, Voice Mic, and Lens).
- **Scalloped MD3 Lock Screen & Optical Fingerprint Unlock**: Always-On Display (AOD) clock and full-screen Scalloped Material Design 3 lock screen with an on-screen optical fingerprint sensor—tap the sensor to unlock directly into the home screen.
- **120fps Motion & Haptic Feedback**: High-refresh-rate spring transitions, circular icon launch reveals, gesture pill navigation, and tactile vibration feedback across taps, folder expansion, and lock/unlock events.
- **Customizable Quick Settings Shade**: Pull down from the status bar and enter Edit Mode to drag and drop Quick Settings tiles into any order (persisted locally).
- **Offline-Ready Static PWA**: Pre-caches fonts, icons, and assets via `vite-plugin-pwa` and Workbox so it works completely offline once installed or hosted as static HTML.

---

## Local Development

### Prerequisites

- **Node.js** `20+` (or `22 LTS` recommended)
- **npm** `10+`
- **Git**

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
5. Preview the production static build locally:
   ```bash
   npm run preview
   ```

---

## Hosting as Static HTML on GitHub Pages

WebDroid is pre-configured to work on **both** GitHub Pages project URLs (`https://<username>.github.io/<repo-name>/`) and user/organization URLs (`https://<username>.github.io/`) with zero manual path rewrites:

- `vite.config.ts` uses `base: process.env.VITE_BASE_PATH || './'` so every generated `<script>`, `<link>`, font, and asset URL in `dist/index.html` is relative (`./assets/...`).
- `vite-plugin-pwa` manifest fields (`id`, `start_url`, `scope`, `icons`) and `index.html` icon links use relative `./` paths.
- `public/.nojekyll` is copied into `dist/.nojekyll` so GitHub Pages skips Jekyll processing.

### Option 1: GitHub Actions Static HTML Build (Recommended)

A ready-to-run workflow is included at `.github/workflows/deploy.yml`. It works with or without a `package-lock.json` (`npm install --no-audit --no-fund`), builds the static bundle (`npm run build`), copies `dist/index.html` to `dist/404.html` for SPA fallback, and publishes `dist/` directly to GitHub Pages.

1. Push your WebDroid project to the `main` branch on GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial WebDroid commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/WebDroid.git
   git push -u origin main
   ```
2. Open your repository on GitHub and navigate to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Wait ~1–2 minutes for the **Deploy WebDroid to GitHub Pages** workflow in the **Actions** tab to finish, then visit `https://<your-username>.github.io/WebDroid/` (or trigger it anytime via **Actions → Run workflow**).

### Option 2: Deploy with the `gh-pages` Package

`gh-pages` is already included in `devDependencies`, and `package.json` defines `"predeploy": "npm run build"` and `"deploy": "gh-pages -d dist"`.

1. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
2. Push your code to GitHub (if not already pushed).
3. Build and publish `dist/` to the `gh-pages` branch:
   ```bash
   npm run deploy
   ```
   *(Optional: pass an explicit subpath with `VITE_BASE_PATH=/WebDroid/ npm run deploy`.)*
4. On GitHub, go to **Settings → Pages → Build and deployment**, set **Source** to **Deploy from a branch**, select **`gh-pages`** and **`/ (root)`**, and click **Save**.

### Option 3: Manual Vite Static Build (`dist/`)

1. Generate the static HTML bundle:
   ```bash
   npm run build
   ```
2. Push or upload the contents of `dist/` (making sure `.nojekyll` is included) to your `gh-pages` branch or any static HTML host:
   ```bash
   git add -f dist
   git commit -m "Build static HTML bundle"
   git subtree push --prefix dist origin gh-pages
   ```

---

## Deploying to Netlify

WebDroid remains compatible with both **Netlify Drop** and **Netlify Git**:

- **Netlify Drop**: Run `npm run build`, open [Netlify Drop](https://app.netlify.com/drop), and drag and drop the `dist/` folder (`public/_redirects` is automatically copied into `dist/_redirects`).
- **Netlify + GitHub**: Connect your GitHub repository in Netlify; `netlify.toml` configures `npm run build`, publish directory `dist`, and SPA redirects automatically.
