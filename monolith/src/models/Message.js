const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');
const User = require('./User');
const Channel = require('./Channel');

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    content: {
        type: DataTypes.TEXT
    },
    type: {
        type: DataTypes.ENUM('text', 'image', 'file'),
        defaultValue: 'text'
    },
    fileUrl: {
        type: DataTypes.STRING
    },
    senderId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    channelId: {
        type: DataTypes.UUID,
        allowNull: false
    }
});

Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(Channel, { foreignKey: 'channelId' });

module.exports = Message;