# UXAuditX production — Playwright Chromium is preinstalled in this base image (required for audits).
FROM mcr.microsoft.com/playwright:v1.60.0-jammy

WORKDIR /app

ENV NODE_ENV=production \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0
# Railway sets PORT at runtime; Next.js reads process.env.PORT

# Install deps (postinstall skips browser download — browsers come from the base image).
# `npm ci` runs `postinstall`, which references `scripts/ensure-playwright-browsers.mjs`.
# Copy scripts before installing deps so the postinstall file exists.
COPY package.json package-lock.json ./
COPY scripts ./scripts
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
