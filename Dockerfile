ARG NODEJS_IMAGE=node:26.13.0-alpine3.24
FROM --platform=$BUILDPLATFORM $NODEJS_IMAGE AS base

FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_PUBLIC_GTM_ID=""
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM $NODEJS_IMAGE AS runner
WORKDIR /app

ENV NODE_OPTIONS="--max-http-header-size=81920"
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1


RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 4000

ENV PORT=4000

CMD ["node", "server.js"]