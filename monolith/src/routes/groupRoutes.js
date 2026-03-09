const express = require('express');
const router = express.Router();
const { createGroup, getMyGroups, joinGroup } = require('../controllers/groupController');
const authMiddleware = require('../middlewares/auth');

// Todas estas rutas requieren token
router.post('/', authMiddleware, createGroup);
router.get('/my', authMiddleware, getMyGroups);
router.post('/:groupId/join', authMiddleware, joinGroup);

module.exports = router;