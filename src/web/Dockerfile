FROM node:18

# Create app directory
WORKDIR /app

# Bundle app source
COPY . .

RUN npm install
RUN npm install --only=dev
RUN npm install chokidar -D
# If you are building your code for production
# RUN npm ci --only=production



CMD [ "npm", "start" ]
