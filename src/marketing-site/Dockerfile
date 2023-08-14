FROM mcr.microsoft.com/devcontainers/javascript-node:18 AS build

WORKDIR /app

COPY . .

RUN pnpm install
RUN pnpm run build

CMD ["pnpm","run","start"]
