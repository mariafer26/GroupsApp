require('dotenv').config();
const express = require('express');
const { connectDB } = require('./database');
require('./models/User');

const authRoutes = require('./routes/authRoutes');
const app = express();
const PORT = process.env.PORT || 3000;
const groupRoutes = require('./routes/groupRoutes');


app.use(express.json());
app.use('/api/groups', groupRoutes);
app.use('/api/auth', authRoutes);
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'GroupsApp corriendo!'
    });
});

// Arrancar servidor
const start = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
};

start();