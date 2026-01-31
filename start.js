const express = require('express');
const app = express();
const router = require('./router');
const cookieParser = require('cookie-parser');
const cors = require('cors');

app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true               
}));

app.use(express.json());

app.use('/', router);

const port = 3444;
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
