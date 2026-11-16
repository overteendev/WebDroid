# Material You Launcher (Pixel 8 Pro)

An interactive Android 14 / Material You launcher experience styled after the Google Pixel 8 Pro, built with React 19, TypeScript, Vite, Tailwind CSS v4, and Progressive Web App (PWA) offline support.

## Features

- **Pixel 8 Pro Hardware & UI Architecture**: Realistic device frame with centered punch-hole camera, earpiece slit, right-side Power & Volume rockers, circular adaptive app icons, 2×2 circular app folders, At a Glance weather widget, and bottom Google Search pill (`G`, Voice Mic, and Lens).
- **Scalloped MD3 Lock Screen & Optical Fingerprint Unlock**: Always-On Display (AOD) clock and full-screen Scalloped Material Design 3 lock screen with an on-screen optical fingerprint sensor—tap the sensor to unlock directly into the home screen with a smooth reveal animation.
- **120fps Motion & Haptic Feedback**: High-refresh-rate spring transitions, circular icon launch reveals, gesture pill navigation, and tactile vibration feedback across taps, folder expansion, and lock/unlock events.
- **Customizable Quick Settings Shade**: Pull down from the status bar and enter Edit Mode to drag and drop Quick Settings tiles into any order (persisted locally).
- **Offline-Ready PWA**: Pre-caches fonts, icons, and assets via `vite-plugin-pwa` and Workbox so it can be installed on mobile or desktop.

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
4. Build the production static bundle into `dist/`:
   ```bash
   npm run build
   ```
5. Preview the production build locally:
   ```bash
   npm run preview
   ```

---

## Deploying to GitHub Pages

This project is pre-configured to work on both **project pages** (`https://<username>.github.io/<repo-name>/`) and **user/organization pages** (`https://<username>.github.io/`) thanks to:

- Relative asset base (`base: process.env.VITE_BASE_PATH || './'`) in `vite.config.ts`
- Relative PWA manifest paths (`id`, `start_url`, `scope`, and `icons`) in `vite.config.ts` and `index.html`
- `public/.nojekyll` automatically copied into `dist/.nojekyll` on build

You can deploy using **either** the `gh-pages` npm package (Option 1) or Vite's static build process (Option 2).

---

### Option 1: Deploy with the `gh-pages` Package

`gh-pages` is already included in `devDependencies`, and `package.json` defines `"predeploy": "npm run build"` and `"deploy": "gh-pages -d dist"`.

1. **Install dependencies** (if you haven't already):
   ```bash
   npm install
   ```

2. **Initialize Git and push your repository to GitHub** (skip if already pushed):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

3. **Build and publish `dist/` to the `gh-pages` branch**:
   ```bash
   npm run deploy
   ```
   - `npm run deploy` automatically executes `predeploy` (`npm run build`), builds the static production assets into `dist/`, and pushes the contents of `dist/` to the `gh-pages` branch on GitHub.
   - *(Optional)* If you prefer an explicit subpath instead of the default `./` relative base, run:
     ```bash
     VITE_BASE_PATH=/<your-repo-name>/ npm run deploy
     ```

4. **Enable GitHub Pages in your repository settings**:
   - Open your repository on GitHub and go to **Settings → Pages**.
   - Under **Build and deployment → Source**, select **Deploy from a branch**.
   - Under **Branch**, select **`gh-pages`** and **`/ (root)`**, then click **Save**.
   - Wait ~1–2 minutes and open `https://<your-username>.github.io/<your-repo-name>/`.

---

### Option 2: Deploy Using Vite's Static Build Process

#### 2A. Automated Build & Deploy via GitHub Actions (Recommended for GitHub)

A ready-to-use workflow is included at `.github/workflows/deploy.yml`.

1. Push your project to the `main` branch on GitHub:
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push -u origin main
   ```
2. On GitHub, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Every push to `main` (or manual trigger in the **Actions** tab via **Run workflow**) runs `npm ci` and `npm run build` (`vite build`), uploads the `dist/` artifact, and publishes it to GitHub Pages.

#### 2B. Manual Vite Static Build & Branch Push

If you want to generate Vite's static bundle manually without using `gh-pages` or GitHub Actions:

1. Run Vite's production build:
   ```bash
   npm run build
   ```
   *(Optional: pass `VITE_BASE_PATH=/<your-repo-name>/ npm run build` if hosting at a fixed subpath.)*

2. Confirm `dist/` contains `index.html`, `assets/`, `manifest.webmanifest`, `sw.js`, and `.nojekyll`.

3. Push `dist/` directly to a `gh-pages` branch using Git:
   ```bash
   git add -f dist
   git commit -m "Build static dist for GitHub Pages"
   git subtree push --prefix dist origin gh-pages
   ```
   *(Alternatively, upload the contents of `dist/` to your static host or an orphan `gh-pages` branch.)*

4. In GitHub **Settings → Pages**, set **Source** to **Deploy from a branch**, select **`gh-pages`** and **`/ (root)`**, and click **Save**.

---

## Deploying to Netlify

The build remains fully compatible with both **Netlify Drop** and **Netlify Git integration**:

- **Netlify Drop (No CLI required)**:
  1. Run `npm run build`.
  2. Open [Netlify Drop](https://app.netlify.com/drop).
  3. Drag and drop the generated **`dist/`** folder onto the page (`public/_redirects` is automatically copied to `dist/_redirects`).
- **Netlify + GitHub**:
  1. Connect your GitHub repository in Netlify.
  2. `netlify.toml` automatically sets the build command (`npm run build`), publish directory (`dist`), and SPA redirect rules.

---

## Troubleshooting

- **Blank page or missing icons/JS on a `<repo-name>` subpath**: Make sure you ran `npm run build` / `npm run deploy` after pulling the `vite.config.ts` (`base: './'`) and `index.html` (`./`) updates, and verify `dist/.nojekyll` is present in the deployed output.
- **PWA installation & vibration haptics**: Service workers and `navigator.vibrate` require a secure context (`https://`), which GitHub Pages (`*.github.io`) and Netlify provide automatically. Clear site data or unregister older service workers in DevTools (**Application → Service Workers**) if testing across both root and subpath URLs on the same origin.
