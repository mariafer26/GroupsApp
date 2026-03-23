const Channel = require('../models/Channel');
const Message = require('../models/Message');
const GroupMember = require('../models/GroupMember');
const MessageStatus = require('../models/MessageStatus');
const User = require('../models/User');

const createChannel = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name } = req.body;

        const member = await GroupMember.findOne({
            where: { userId: req.user.id, groupId }
        });
        if (!member) return res.status(403).json({ error: 'No eres miembro de este grupo' });

        const channel = await Channel.create({ name, groupId });
        res.status(201).json({ message: 'Canal creado', channel });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { content } = req.body;

        const message = await Message.create({
            content,
            senderId: req.user.id,
            channelId,
            type: 'text'
        });

        // Crear estado "enviado" para el remitente
        await MessageStatus.create({
            messageId: message.id,
            userId: req.user.id,
            deliveredAt: new Date()
        });

        res.status(201).json({ message: 'Mensaje enviado', data: message });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getMessages = async (req, res) => {
    try {
        const { channelId } = req.params;

        const messages = await Message.findAll({
            where: { channelId },
            include: [
                { model: User, as: 'sender', attributes: ['id', 'username'] },
                { model: MessageStatus, as: 'statuses' }
            ],
            order: [['createdAt', 'ASC']]
        });

        res.json({ messages });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Marcar mensajes como leídos
const markAsRead = async (req, res) => {
    try {
        const { channelId } = req.params;
        const userId = req.user.id;

        // Buscar todos los mensajes del canal que no son míos
        const messages = await Message.findAll({
            where: { channelId }
        });

        for (const message of messages) {
            if (message.senderId === userId) continue;

            const status = await MessageStatus.findOne({
                where: { messageId: message.id, userId }
            });

            if (status) {
                // Actualizar readAt si no está marcado
                if (!status.readAt) {
                    status.readAt = new Date();
                    await status.save();
                }
            } else {
                // Crear registro nuevo
                await MessageStatus.create({
                    messageId: message.id,
                    userId,
                    deliveredAt: new Date(),
                    readAt: new Date()
                });
            }
        }

        res.json({ message: 'Mensajes marcados como leídos' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getChannels = async (req, res) => {
    try {
        const { groupId } = req.params;
        const channels = await Channel.findAll({ where: { groupId } });
        res.json({ channels });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const sendFile = async (req, res) => {
    try {
        const { channelId } = req.params;

        if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });

        const isImage = req.file.mimetype.startsWith('image/');
        const fileUrl = `/uploads/${req.file.filename}`;

        const message = await Message.create({
            content: req.file.originalname,
            senderId: req.user.id,
            channelId,
            type: isImage ? 'image' : 'file',
            fileUrl
        });

        await MessageStatus.create({
            messageId: message.id,
            userId: req.user.id,
            deliveredAt: new Date()
        });

        res.status(201).json({ message: 'Archivo enviado', data: message });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


module.exports = { createChannel, sendMessage, getMessages, markAsRead, getChannels, sendFile };