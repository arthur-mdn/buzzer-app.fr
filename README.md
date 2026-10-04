# Getting Started with Buzzer-App
A buzzer-app with a server and a client.
Made with React, NodeJS and Socket.io.
Useful for quizzes and games for your parties like blind-test.

Requires **Node.js 20.19+**.

## Installation
```bash
git clone https://github.com/arthur-mdn/buzzer-app.git
cd buzzer-app
```
### Install the server dependencies
```bash
cd server
npm install
```
> Duplicate `.env.example` to `.env` and set `DB_URI`, `CLIENT_URL=http://localhost:5174`, and a strong `JWT_SECRET` (32+ characters). Changing `JWT_SECRET` invalidates existing tokens. Leave `ADMIN_PASSWORD` empty to disable admin registration. In production, set `CLIENT_URL=https://buzzer-app.fr` (CORS). Known placeholder secrets are rejected at boot.

> Create a MongoDB database and update `DB_URI` in the server `.env` file.

### Install the client dependencies
```bash
cd client
npm install
```
> Duplicate `.env.example` to `.env` and update the environment variables. The Vite app listens on port **5174**.

## Execution

### Launch the server
```bash
cd server
node server.js
```

### Launch the client
```bash
cd client
npm run dev
```
Open [http://localhost:5174](http://localhost:5174) in your browser.

### Docker (development)
```bash
docker compose up --build
```
MongoDB is not published on the host in development; the API reaches it on the Docker network only.
