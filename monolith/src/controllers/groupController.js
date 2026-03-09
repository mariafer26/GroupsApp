const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');

// Crear grupo
const createGroup = async (req, res) => {
    try {
        const { name, description } = req.body;
        const adminId = req.user.id;

        const group = await Group.create({ name, description, adminId });

        // El creador entra automáticamente como admin
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

module.exports = { createGroup, getMyGroups, joinGroup };