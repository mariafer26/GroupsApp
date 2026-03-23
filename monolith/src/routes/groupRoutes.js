const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');

const { createGroup, getMyGroups, joinGroup, getInviteCode, joinByCode, getJoinRequests, handleJoinRequest } = require('../controllers/groupController');

router.post('/', authMiddleware, createGroup);
router.get('/my', authMiddleware, getMyGroups);
router.post('/join/:code', authMiddleware, joinByCode);
router.get('/:groupId/invite', authMiddleware, getInviteCode);
router.get('/:groupId/requests', authMiddleware, getJoinRequests);
router.put('/:groupId/requests/:requestId', authMiddleware, handleJoinRequest);
router.post('/:groupId/join', authMiddleware, joinGroup);


module.exports = router;