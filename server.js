require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const queueRoutes = require('./routes/queueRoutes');
const adminRoutes = require('./routes/adminRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const http = require('http');
const { Server } = require('socket.io');

const app = express();

const server = http.createServer(app)
const io = new Server(server, { cors: { origin: "*" } })
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors({origin: true, credentials: true}));

app.use(express.json());

app.set('io', io);

io.on('connection', (socket) => {
    console.log('⚡ A user connected via WebSocket:', socket.id);

    socket.on('join_queue_room', (queueId) => {
        socket.join(queueId);
        console.log(`User joined room for Queue: ${queueId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
    })
})

app.use('/api/users', userRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);

app.get('/', (req, res) => {
    res.send("Smart queue API is running successfully.")
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
