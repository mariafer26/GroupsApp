const express = require('express');
const router = express.Router();
const { createChannel, sendMessage, getMessages, markAsRead, getChannels, sendFile } = require('../controllers/channelController');
const authMiddleware = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.post('/groups/:groupId/channels', authMiddleware, createChannel);
router.post('/:channelId/messages', authMiddleware, sendMessage);
router.post('/:channelId/files', authMiddleware, upload.single('file'), sendFile);
router.get('/:channelId/messages', authMiddleware, getMessages);
router.put('/:channelId/read', authMiddleware, markAsRead);
router.get('/grupos/:groupId/list', authMiddleware, getChannels);

module.exports = router;