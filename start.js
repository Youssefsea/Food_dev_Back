const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
app.set('trust proxy', 1);
const router = require('./router');
const cookieParser = require('cookie-parser');
const { setupChatSocket } = require('./chat/chatSocket');

const allowedOrigins = ["https://food-front-rho.vercel.app"];

// CORS middleware - must be first
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://food-front-rho.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

setupChatSocket(io);
app.use(cookieParser());
app.use(express.json());
app.use('/', router);

const port = process.env.PORT || 3444;
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`Socket.IO is ready for connections`);
});
