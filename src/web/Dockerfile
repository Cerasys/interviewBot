FROM mcr.microsoft.com/devcontainers/javascript-node:18 AS build

# Create app directory
WORKDIR /app

# Bundle app source
COPY . .

RUN pnpm install
RUN pnpm install --only=dev
RUN pnpm install chokidar -D
# If you are building your code for production
# RUN pnpm ci --only=production



CMD [ "pnpm", "start" ]
