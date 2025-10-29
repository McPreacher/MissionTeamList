# Senior Missions Team — Email Management App

A small React + Tailwind app to store student & chaperone names/emails and quickly copy email lists
for updates. Includes:
- Add/Edit/Remove people (with guardian emails for students)
- Search, role filter
- Copy All / Students / Chaperones / Selected / Selected+Guardians
- LocalStorage persistence

## Run locally
```bash
npm install
npm run dev
```

## Deploy to Netlify (via GitHub)
1. Create a new GitHub repo and push this folder.
2. In Netlify, **New site from Git** → select your repo.
3. Build command: `npm run build`
   Publish directory: `dist`
   (No base directory needed)
4. Deploy.

## Notes
- Data is stored in browser `localStorage` under the key `sm_members`.
- You can export/import later if desired.
