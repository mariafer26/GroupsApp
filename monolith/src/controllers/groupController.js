const crypto = require('crypto');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');

// Crear grupo
const createGroup = async (req, res) => {
    try {
        const { name, description } = req.body;
        const adminId = req.user.id;
        const inviteCode = crypto.randomBytes(4).toString('hex');

        const group = await Group.create({ name, description, adminId, inviteCode });

        await GroupMember.create({
            userId: adminId,
            groupId: group.id,
            role: 'admin'
        });

        res.status(201).json({ message: 'Grupo creado', group });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener mis grupos
const getMyGroups = async (req, res) => {
    try {
        const memberships = await GroupMember.findAll({
            where: { userId: req.user.id },
            include: [{ model: Group, as: 'Group' }]
        });

        const groups = memberships.map(m => m.Group);
        res.json({ groups });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Unirse a un grupo
const joinGroup = async (req, res) => {
    try {
        const { groupId } = req.params;

        const already = await GroupMember.findOne({
            where: { userId: req.user.id, groupId }
        });

        if (already) {
            return res.status(400).json({ error: 'Ya eres miembro de este grupo' });
        }

        await GroupMember.create({
            userId: req.user.id,
            groupId,
            role: 'member'
        });

        res.json({ message: 'Te uniste al grupo exitosamente' });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener código de invitación
const getInviteCode = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findByPk(groupId);

        if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });

        // Si el grupo no tiene código aún, generarlo
        if (!group.inviteCode) {
            group.inviteCode = crypto.randomBytes(4).toString('hex');
            await group.save();
        }

        res.json({
            inviteCode: group.inviteCode,
            inviteLink: `http://localhost:3000/unirse.html?code=${group.inviteCode}`
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Unirse con código
const joinByCode = async (req, res) => {
    try {
        const { code } = req.params;
        const group = await Group.findOne({ where: { inviteCode: code } });

        if (!group) return res.status(404).json({ error: 'Código inválido' });

        const already = await GroupMember.findOne({
            where: { userId: req.user.id, groupId: group.id }
        });

        if (already) return res.status(400).json({ error: 'Ya eres miembro de este grupo' });

        await GroupMember.create({
            userId: req.user.id,
            groupId: group.id,
            role: 'member'
        });

        res.json({ message: `Te uniste a ${group.name}!`, group });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createGroup, getMyGroups, joinGroup, getInviteCode, joinByCode };