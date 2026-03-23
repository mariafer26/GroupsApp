const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');
const User = require('./User');

const MessageStatus = sequelize.define('MessageStatus', {
    messageId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    deliveredAt: {
        type: DataTypes.DATE
    },
    readAt: {
        type: DataTypes.DATE
    }
});


module.exports = MessageStatus;