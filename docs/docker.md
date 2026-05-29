# Docker deployment (recommended for live / audits)

Audits need **Playwright + Chromium**. The official Playwright Docker image includes both, so captures work reliably on Linux.

## Quick start (VPS or any server with Docker)

1. Clone the repo and add `.env` (same variables as local).
2. From the project root:

```bash
docker compose build
docker compose up -d
```

3. Open `http://YOUR_SERVER_IP:3000` (or put a reverse proxy in front).

## Commands

```bash
# Build only
docker compose build

# Run in foreground (logs)
docker compose up

# Run in background
docker compose up -d

# Rebuild after code pull
git pull
docker compose build --no-cache
docker compose up -d

# Logs
docker compose logs -f
```

## Hosting platforms

| Platform | Setting |
|----------|---------|
| **Railway** | Settings → Build → **Dockerfile** (uses repo `Dockerfile`) |
| **Render** | New Web Service → **Docker** |
| **Fly.io** | `fly launch` with Dockerfile |
| **DigitalOcean App Platform** | Source → Dockerfile |
| **Vercel** | Not supported for audits (no Playwright) |

On Railway you can remove the extra `playwright install` build step if the builder is set to **Dockerfile** — browsers are already in the image.

## Why Docker fixes the audit error

Without Docker, `npm install` does not install Chromium. The error:

`Executable doesn't exist at .../chrome-headless-shell`

means the server was missing browsers. The Playwright base image ships with matching Chromium binaries.

## `shm_size`

`docker-compose.yml` sets `shm_size: 1gb`. If you run `docker run` manually, add:

```bash
docker run --shm-size=1gb -p 3000:3000 --env-file .env uxauditx:latest
```
