# Sujal Malhotra · Portfolio

Terminal-themed portfolio: React, Vite, TypeScript, Tailwind CSS v4, Framer Motion.

## Run

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the build
```

## Edit content

All resume content lives in `src/data/resume.ts` (architecture diagrams in `src/data/architecture.ts`).
`public/resume.pdf` is the downloadable resume.

## Deploy (Vercel recommended)

1. Push the folder to GitHub and import it in Vercel. `vercel.json` is already set up.
2. Environment variables (Project Settings > Environment Variables):
   - `ANTHROPIC_API_KEY`: turns on the AI answers for `ask` in the terminal (served by `api/ask.ts`).
     Optional `ANTHROPIC_MODEL` (default `claude-haiku-5-5`). Without a key, `ask` falls back to searching the resume text.
   - `VITE_FORMSPREE_ID`: form ID from formspree.io so the contact form sends directly.
     Without it, the form opens the visitor's email app with the message filled in.
   - `VITE_SITE_URL`: the live URL (e.g. `https://your-domain.com`), so LinkedIn/WhatsApp previews show `og.png`.

Other static hosts work too (Netlify, Cloudflare Pages); only `ask`'s AI mode needs the serverless function.

## Features

- Interactive terminal: help, about, ask, ls/cd/cat/pwd over the resume as files, projects, open, skills, grep,
  experience, education, certs, contact, status, fetch, theme, sound, snake, typetest, stars, reboot,
  sudo hire sujal, goto, palette, clear. Tab completes, up/down history, ctrl+l clears. Window buttons close/minimize/full screen.
- Live GitHub panel (public API, cached 30 min), live demo status check, certificate viewer.
- Project architecture diagrams, deploy replay reel, pipeline playground with fault injection.
- Command palette (ctrl/cmd+k), shortcuts: / terminal, 0-7 sections, j/k, t accent, m sound, ? help.
- Accent themes, key sounds, shooting stars (click the sky), mascot, first-visit boot screen.
- Contact form, offline support (service worker), installable (manifest), social preview image.
