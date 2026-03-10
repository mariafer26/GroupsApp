const Channel = require('../models/Channel');
const Message = require('../models/Message');
const GroupMember = require('../models/GroupMember');
const User = require('../models/User');

// Crear canal dentro de un grupo
const createChannel = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name } = req.body;

        // Verificar que el usuario es miembro del grupo
        const member = await GroupMember.findOne({
            where: { userId: req.user.id, groupId }
        });

        if (!member) {
            return res.status(403).json({ error: 'No eres miembro de este grupo' });
        }

        const channel = await Channel.create({ name, groupId });
        res.status(201).json({ message: 'Canal creado', channel });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Enviar mensaje a un canal
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

        res.status(201).json({ message: 'Mensaje enviado', data: message });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener mensajes de un canal
const getMessages = async (req, res) => {
    try {
        const { channelId } = req.params;

        const messages = await Message.findAll({
            where: { channelId },
            include: [{
                model: User,
                as: 'sender',
                attributes: ['id', 'username']
            }],
            order: [['createdAt', 'ASC']]
        });

        res.json({ messages });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener canales de un grupo
const getChannels = async (req, res) => {
    try {
        const { groupId } = req.params;
        const channels = await Channel.findAll({ where: { groupId } });
        res.json({ channels });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createChannel, sendMessage, getMessages, getChannels };

