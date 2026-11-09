# Deploying Bonjo

Bonjo is a static Vite build: `npm run build` writes everything to `dist/`.
There is no backend and no special server headers.

## 1. Build locally

```bash
cd ~/Projects/bonjo
npm install
npm run build
npm run preview   # sanity-check the production build at localhost:4173
```

## 2. GitHub Pages (free, durable)

1. Create an empty repository on GitHub, for example `bonjo`.
2. From this folder:

   ```bash
   git remote add origin git@github.com:YOUR_USER/bonjo.git
   git push -u origin main
   ```

3. In the repository: **Settings → Pages → Build and deployment → Source:
   GitHub Actions**.
4. The included workflow (`.github/workflows/deploy.yml`) builds and deploys on
   every push to `main`.
5. Your game is at `https://YOUR_USER.github.io/bonjo/`.

`vite.config.js` uses `base: './'`, so relative assets work under a repo
subpath. No extra configuration needed.

## 3. Netlify Drop (fastest, no repo needed)

1. `npm run build`
2. Open <https://app.netlify.com/drop>
3. Drag the whole `dist/` folder onto the page.
4. Netlify gives you a public URL immediately. Claim the site to keep it.

For a Git-connected site, import the repo; `netlify.toml` already sets:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

## 4. itch.io (best for playtesters)

```bash
npm run build
cd dist
rm -f ../bonjo-web.zip
zip -r ../bonjo-web.zip .
```

Then on itch.io:

1. **Create new project → HTML**.
2. Upload `bonjo-web.zip`.
3. Check **"This file will be played in the browser"**.
4. Set the embed size to **1024 × 576** (or "Fit to container").
5. Enable fullscreen; landscape is best on phones.
6. Upload, set the project to **Draft** for playtesters, and share the link.

Do **not** zip the `dist` folder itself — zip its *contents* so `index.html`
sits at the root.

## 5. Cloudflare Pages / Vercel

Both auto-detect Vite:

- Build command: `npm run build`
- Output directory: `dist`
- Node: 18+

## 6. Temporary public tunnel (quick playtest)

If the game is running locally (for example `npm run preview` on port 4173),
expose it with a Cloudflare quick tunnel:

```bash
cloudflared tunnel --url http://127.0.0.1:4173
```

The command prints a `https://*.trycloudflare.com` URL. It works while the
tunnel and preview server stay running, and is perfect for a 24-hour playtest.
For anything permanent, use GitHub Pages, Netlify or itch.io.

## Tester instructions

Send:

> **Bonjo — La Cuadra**  
> A / D or arrows to move · Space to jump and flap (hold to glide) · S to dive  
> On a phone: use the on-screen buttons, landscape recommended.  
> Dive on rival dogs to subdue them, bounce on the striped awnings, and hit the
> piñata three times.

Ask them to play only the first minute and report:

- Where did you get stuck or die twice?
- Did you find the awning and the piñata without being told?
- What did you try that the game didn't allow?
