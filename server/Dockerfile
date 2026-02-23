FROM oven/bun:latest AS builder
WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install

COPY . .

RUN bun run build

FROM oven/bun:latest
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["bun", "run", "start:prod"]