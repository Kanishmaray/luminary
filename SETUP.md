# Luminary — Setup Guide

## Requirements
Node.js v18 or later — download from https://nodejs.org (pick the LTS version)

## First-time setup

Open Terminal (Mac) or Command Prompt (Windows), navigate to this folder, and run:

```
npm install --legacy-peer-deps
npm run dev
```

Then open http://localhost:5173 in your browser.

## If npm install fails (only needed once)

The folder may have stale node_modules from a previous attempt. Delete the
`node_modules` folder manually (it's safe to delete), then run the commands above.

## Notes
- All data is saved locally in your browser — nothing is sent anywhere
- Mock data is pre-loaded so every feature is explorable from day one
- Dark/light mode toggle lives in the bottom-left of the sidebar
- When you're ready to add real auth and cloud sync, we'll wire up Supabase
