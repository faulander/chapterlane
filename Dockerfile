# syntax=docker/dockerfile:1

FROM oven/bun:1.2-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts

FROM deps AS build
WORKDIR /app
COPY . .
RUN bun run build

FROM oven/bun:1.2-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    DATABASE_PATH=/app/data/chapterlane.db \
    LOG_LEVEL=info

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/src/lib/server/db/migrations ./src/lib/server/db/migrations

RUN mkdir -p /app/data/covers

EXPOSE 3000
CMD ["bun", "build/index.js"]
