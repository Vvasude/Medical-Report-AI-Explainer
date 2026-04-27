# Medical-Report-AI-Explainer

AI-powered medical report explainer using retrieval-augmented generation (RAG) to interpret lab results and provide patient-friendly summaries based on clinical guidelines.

## Deployment (Render backend + Vercel frontend)

### 1) Deploy backend to Render

- Push this repository to GitHub.
- In Render, create a **Web Service** from the repo.
- Render can auto-detect `render.yaml` in this repo.
- Set these environment variables in Render:
  - `CHROMA_API_KEY`
  - `CHROMA_TENANT`
  - `CHROMA_DATABASE`
  - `GOOGLE_API_KEY`
  - `GEMINI_MODEL` (optional)
  - `FRONTEND_ORIGINS` (comma-separated list of allowed frontend origins, e.g. `https://your-frontend.vercel.app`)
- After deploy, note your backend URL (example: `https://medical-report-ai-backend.onrender.com`).

### 2) Deploy frontend to Vercel

- Import the same repo into Vercel.
- Set **Root Directory** to `frontend`.
- Add environment variable:
  - `VITE_API_URL=https://<your-render-backend-url>`
- Build command: `npm run build`
- Output directory: `dist`

### 3) Connect frontend and backend

- Ensure Render `FRONTEND_ORIGINS` includes your Vercel URL.
- Redeploy backend after changing `FRONTEND_ORIGINS`.
