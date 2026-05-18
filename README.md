# SMB AI Copilot (React + FastAPI)

This repo contains:

- `frontend/`: Next.js (React) + Tailwind + Recharts dashboard UI
- `backend/`: Python FastAPI API serving dashboard data + copilot chat + optional email integrations

## Run the backend (FastAPI)

```powershell
cd backend
python -m pip install -r requirements.txt

# Optional: set OAuth credentials (Gmail/Outlook)
copy .env.example .env

# Run (use 8001 if 8000 is taken on your machine)
python -m uvicorn app.main:app --reload --port 8001
```

API docs: `http://localhost:8001/docs`
Health check: `http://localhost:8001/health`

## Run the frontend (Next.js)

```powershell
cd frontend
copy .env.local.example .env.local
npm install
npm run dev
```

Open: `http://localhost:3000`

## Gmail / Outlook integrations (optional)

This app supports connecting Gmail and Outlook via OAuth 2.0 to power **Email Insights**.

1) Create OAuth apps:
- **Gmail**: Enable Gmail API, create an OAuth Web Client, and add the redirect URI:
  - `http://localhost:8001/api/integrations/gmail/callback`
  - Add scopes: `gmail.send`, `gmail.readonly`
- **Outlook**: Create an app registration, add redirect URI:
  - `http://localhost:8001/api/integrations/outlook/callback`
  - Add delegated permissions: `Mail.Read`, `Mail.Send`, `User.Read`, `offline_access`.

2) Put credentials in `backend/.env` (copied from `backend/.env.example`).

3) In the dashboard, use the **Email Integrations** card:
- Click **Connect** → sign in → you'll be redirected back to the app.
- Click **Sync** to pull recent emails.

### Sending Emails

You can send emails via the API:

```
POST /api/integrations/{provider}/send
{
  "to": "recipient@example.com",
  "subject": "Your subject",
  "body": "Your message body",
  "cc": ["cc@example.com"]  // optional
}
```

**Notes**:
- If you open the frontend from another device on your LAN (ex: `http://192.168.1.3:3000`), set `PUBLIC_BACKEND_URL` to `http://192.168.1.3:8001` and update redirect URIs in Google/Microsoft to match.
- Tokens/emails are stored locally under `backend/app/data/` for development.

## Razorpay payments (optional)

This app includes a minimal Razorpay order + checkout flow.

1) Add your Razorpay keys to `backend/.env`:

```env
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

2) Start backend + frontend, then open `http://localhost:3000/payments` and use the **Collect Payment** card.

## Deploy on Render

This repo is structured as a small monorepo:

- `backend/` FastAPI (Python)
- `frontend/` Next.js (Node)

### Option A (Recommended): Render Blueprint (`render.yaml`)

1) Push this repo to GitHub/GitLab/Bitbucket.
2) In Render Dashboard → **New** → **Blueprint** → select your repo.
3) When prompted for env vars:
   - `PUBLIC_BACKEND_URL`: set to your backend service URL (example: `https://smp-backend.onrender.com`)
   - `FRONTEND_URL`: set to your frontend service URL (example: `https://smp-frontend.onrender.com`)
   - `NEXT_PUBLIC_API_URL` (on the frontend service): set to your backend service URL (example: `https://smp-backend.onrender.com`)

Notes:
- `NEXT_PUBLIC_API_URL` is build-time for Next.js (it’s embedded into the client bundle), so set it before deploy.
- For Gmail/Outlook OAuth, also set these env vars on the backend service:
  - `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`
  - `OUTLOOK_CLIENT_ID`, `OUTLOOK_CLIENT_SECRET`
  - And add redirect URIs using your deployed backend URL:
    - `{PUBLIC_BACKEND_URL}/api/integrations/gmail/callback`
    - `{PUBLIC_BACKEND_URL}/api/integrations/outlook/callback`
- For Razorpay payments on Render, set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` on the backend service.

### Option B: Create services manually (no Blueprint)

Create **two Web Services** in Render:

**Backend (FastAPI)**
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/health`
- Env vars: `PUBLIC_BACKEND_URL`, `FRONTEND_URL` (and optional OAuth / Razorpay vars above)

**Frontend (Next.js)**
- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Env var: `NEXT_PUBLIC_API_URL` = your backend service URL (no trailing slash)
