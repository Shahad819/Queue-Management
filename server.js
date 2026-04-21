require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const queueRoutes = require('./routes/queueRoutes');

const app = express();
const PORT = process.env.PORT ||3000;

connectDB();

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/queue', queueRoutes);

app.get('/', (req,res)=>{
    res.send("Smart queue API is running successfully.")
});

app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
})
