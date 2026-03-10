require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { connectDB } = require('./database');

require('./models/User');
require('./models/Group');
require('./models/GroupMember');
require('./models/Channel');
require('./models/Message');

const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const channelRoutes = require('./routes/channelRoutes');

const app = express();
const httpServer = createServer(app); // 👈 servidor HTTP que envuelve express
const io = new Server(httpServer, {
    cors: { origin: '*' }
});

app.use(express.json());
app.use(express.static('public'));
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/channels', channelRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'GroupsApp corriendo!' });
});

// ============================================
// SOCKET.IO — conexiones en tiempo real
// ============================================
io.on('connection', (socket) => {
    console.log(`🟢 Usuario conectado: ${socket.id}`);

    // Usuario se une a un canal
    socket.on('join_channel', (channelId) => {
        socket.join(channelId);
        console.log(`👤 ${socket.id} se unió al canal ${channelId}`);
    });

    // Usuario envía un mensaje
    socket.on('send_message', (data) => {
        // Reenvía el mensaje a todos en el canal
        io.to(data.channelId).emit('new_message', data);
        console.log(`💬 Mensaje en canal ${data.channelId}: ${data.content}`);
    });

    // Usuario se desconecta
    socket.on('disconnect', () => {
        console.log(`🔴 Usuario desconectado: ${socket.id}`);
    });
});

// ============================================

const start = async () => {
    await connectDB();
    httpServer.listen(process.env.PORT || 3000, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${process.env.PORT || 3000}`);
    });
};

start();