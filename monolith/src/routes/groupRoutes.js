const express = require('express');
const router = express.Router();
const { createGroup, getMyGroups, joinGroup, getInviteCode, joinByCode } = require('../controllers/groupController');
const authMiddleware = require('../middlewares/auth');

// Todas estas rutas requieren token
router.post('/', authMiddleware, createGroup);
router.get('/my', authMiddleware, getMyGroups);
router.post('/join/:code', authMiddleware, joinByCode);
router.get('/:groupId/invite', authMiddleware, getInviteCode);
router.post('/:groupId/join', authMiddleware, joinGroup);

module.exports = router;