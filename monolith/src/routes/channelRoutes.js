const express = require('express');
const router = express.Router();
const { createChannel, sendMessage, getMessages, getChannels } = require('../controllers/channelController');
const authMiddleware = require('../middlewares/auth');





router.post('/groups/:groupId/channels', authMiddleware, createChannel);
router.post('/:channelId/messages', authMiddleware, sendMessage);
router.get('/:channelId/messages', authMiddleware, getMessages);
router.get('/grupos/:groupId/list', authMiddleware, getChannels);

module.exports = router;