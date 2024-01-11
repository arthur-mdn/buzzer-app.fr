# Getting Started with Buzzer-App
A buzzer-app with a server and a client.
Made with React, NodeJS and Socket.io.
Usefull for quizzes and games for your parties like blindtest.

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
> ⚠️ You will need to duplicate the `.env.example` file to `.env` and update the environment variables.

> ⚠️ You will also need to create a MongoDB database and update the `DB_URI` variable in the server .env file.

### Install the client dependencies
```bash
cd client
npm install
```
> ⚠️ You will need to duplicate the `.env.example` file in to `.env` and update the environment variables.

## Execution

### Launch the server script
In the server directory, you can run this to run the server and listen for connections / sockets.

```bash
cd server
node server.js
```
### Launch the client script
In the client directory, you can run this to run the app in development mode :
```bash
cd client
npm start
```
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
