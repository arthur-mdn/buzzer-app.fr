FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev
RUN npm install -g nodemon

COPY . .

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "server.js"]