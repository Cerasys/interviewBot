FROM mcr.microsoft.com/devcontainers/javascript-node:18 AS build

WORKDIR /app

COPY . .

RUN npm ci
RUN npm run build

CMD ["npm","run","start"]
