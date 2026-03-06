const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const router = require('./router');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { setupChatSocket } = require('./chat/chatSocket');

// إنشاء HTTP server
const server = http.createServer(app);

// إعداد Socket.IO مع CORS
const io = new Server(server, {
    cors: {
        origin: true,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// إعداد الشات
setupChatSocket(io);

app.use(cookieParser());

const allowedOrigins = [
  "https://food-front-rho.vercel.app"
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin || allowedOrigins.includes(origin)){
      callback(null, true);
    }else{
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
}));

app.options('*', cors()); 

app.use(express.json());

app.use('/', router);

const port = process.env.PORT || 3444;
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log(`Socket.IO is ready for connections`);
});
