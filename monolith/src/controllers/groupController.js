const crypto = require('crypto');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const JoinRequest = require('../models/JoinRequest');
const User = require('../models/User');

// Crear grupo
const createGroup = async (req, res) => {
    try {
        const { name, description, subscriptionType } = req.body;
        const adminId = req.user.id;
        const inviteCode = crypto.randomBytes(4).toString('hex');

        const group = await Group.create({
            name,
            description,
            adminId,
            inviteCode,
            subscriptionType: subscriptionType || 'public'
        });

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

        // Grupo con aprobación — crear solicitud pendiente
        if (group.subscriptionType === 'approval') {
            const existingRequest = await JoinRequest.findOne({
                where: { userId: req.user.id, groupId: group.id, status: 'pending' }
            });
            if (existingRequest) {
                return res.status(400).json({ error: 'Ya tienes una solicitud pendiente' });
            }

            await JoinRequest.create({
                userId: req.user.id,
                groupId: group.id
            });

            return res.json({ message: 'Solicitud enviada. El admin debe aprobarla.', status: 'pending' });
        }

        // Grupo público — unirse directo
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

// Ver solicitudes pendientes
const getJoinRequests = async (req, res) => {
    try {
        const { groupId } = req.params;

        // Verificar que es admin
        const member = await GroupMember.findOne({
            where: { userId: req.user.id, groupId, role: 'admin' }
        });
        if (!member) return res.status(403).json({ error: 'Solo el admin puede ver solicitudes' });

        const requests = await JoinRequest.findAll({
            where: { groupId, status: 'pending' },
            include: [{ model: User, attributes: ['id', 'username', 'email'] }]
        });

        res.json({ requests });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Aprobar o rechazar solicitud
const handleJoinRequest = async (req, res) => {
    try {
        const { groupId, requestId } = req.params;
        const { action } = req.body; // 'approve' o 'reject'

        const member = await GroupMember.findOne({
            where: { userId: req.user.id, groupId, role: 'admin' }
        });
        if (!member) return res.status(403).json({ error: 'Solo el admin puede gestionar solicitudes' });

        const request = await JoinRequest.findByPk(requestId);
        if (!request) return res.status(404).json({ error: 'Solicitud no encontrada' });

        if (action === 'approve') {
            await GroupMember.create({
                userId: request.userId,
                groupId,
                role: 'member'
            });
            request.status = 'approved';
        } else {
            request.status = 'rejected';
        }

        await request.save();
        res.json({ message: action === 'approve' ? 'Usuario aprobado' : 'Solicitud rechazada' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createGroup, getMyGroups, joinGroup, getInviteCode, joinByCode, getJoinRequests, handleJoinRequest };