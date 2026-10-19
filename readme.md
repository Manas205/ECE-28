# ECE'28 Drive
A study-material website containing content of ECE'28 batch. Content lives in a shared Google Drive folder, and the site shows it as a searchable folder tree with an in-page file preview. Upload to Drive and the site updates itself.

**Live:** https://ece28ftw.vercel.app
Inspired from : https://ece27ftw.vercel.app

## Features
- Folder tree that mirrors your Drive
- Search across all files and folders
- In-page preview, plus Download and Open buttons
- Mobile-friendly layout
- Server-side caching for fast loads

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS
- **Backend:** Node.js, Express
- **Data:** Google Drive API v3
- **Hosting:** Vercel (frontend), Render (backend)

## Setup
**1. Drive:** share the root folder as *Anyone with the link, Viewer* and copy its folder ID from the URL.

**2. API key:** in Google Cloud Console, enable the Drive API and create an API key restricted to it.

**3. Backend**

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
API_KEY=your_google_api_key
FOLDER_ID=your_root_folder_id
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev
```

**4. Frontend**

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173.

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `API_KEY` | server | Google API key |
| `FOLDER_ID` | server | Root Drive folder ID |
| `CLIENT_URL` | server | Frontend address allowed by CORS |
| `VITE_API_URL` | client | Backend URL |

## Deployment

- **Backend (Render):** root directory `server`, build `npm install`, start `npm start`, add the server variables.
- **Frontend (Vercel):** root directory `client`, add `VITE_API_URL`.
- Set `CLIENT_URL` on Render to your Vercel address, and redeploy the frontend whenever `VITE_API_URL` changes.


