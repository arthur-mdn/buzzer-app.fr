FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_PORT=3000
ARG VITE_INSTANCE_URL
ARG VITE_SERVER_URL
ARG VITE_SERVER_SOCKET_URL
ARG VITE_SEND_PINGS=false

ENV VITE_PORT=$VITE_PORT \
    VITE_INSTANCE_URL=$VITE_INSTANCE_URL \
    VITE_SERVER_URL=$VITE_SERVER_URL \
    VITE_SERVER_SOCKET_URL=$VITE_SERVER_SOCKET_URL \
    VITE_SEND_PINGS=$VITE_SEND_PINGS

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
