const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const router = require('./router');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { setupChatSocket } = require('./chat/chatSocket');

const allowedOrigins = [
  "https://food-front-rho.vercel.app"
];

// Define cors options once and reuse
const corsOptions = {
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

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
app.use(cors(corsOptions));
app.options('/{*path}', cors(corsOptions))

app.use(express.json());
app.use('/', router);

const port = process.env.PORT || 3444;
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`Socket.IO is ready for connections`);
});
