# Hexpile

> **Ported into this app.** The original standalone `index.html` was split into
> `page.tsx` / `Hexpile.tsx` / `hexpile.css` here, with the script and images
> served from `public/design-study/taste/`. Run it with `npm run dev` and open
> `/DesignStudy/Taste` — the "Running it" section below describes the original
> standalone repo. The remaining sections still apply: tiles are declared near
> the top of `public/design-study/taste/hexpile.js`.

An independent interaction study — a redesign of a swipe-to-sort onboarding.
Not affiliated with Taste Labs.

## Running it

It is one HTML file plus a folder of images. There is no build step and no
dependencies. Serve the folder over http and open `index.html`:

    npx serve .          # or: python3 -m http.server

**It must be served, not opened as a `file://` URL.** The tiles dissolve by
reading their own pixels off a canvas, and a `file://` page taints the canvas,
which silently disables the effect. Any static host works — Netlify, Vercel,
Cloudflare Pages, GitHub Pages, an S3 bucket.

## Deploying

Point a subdomain at the folder. Nothing else to configure.

## Swapping the images

Each tile is one line near the top of the script:

    {id:'threshold', name:'Threshold', src:'img/threshold.jpg'}

Any aspect ratio works — images are cropped, never stretched, and the crop
window is chosen by looking for the busiest part of the picture. `id` must be
unique; `name` is only used for the screen-reader announcement.

The cluster holds thirteen tiles, laid out by `CLUSTER` near the top of the
script. Add or remove rows there if you change the count.

## Type

Schibsted Grotesk and Roboto Mono, loaded from Google Fonts. Swap the `<link>`
and the two `font-family` stacks if you license the real faces.
