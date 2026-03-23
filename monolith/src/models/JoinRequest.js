const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');
const User = require('./User');
const Group = require('./Group');

const JoinRequest = sequelize.define('JoinRequest', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    groupId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    }
});

JoinRequest.belongsTo(User, { foreignKey: 'userId' });
JoinRequest.belongsTo(Group, { foreignKey: 'groupId' });

module.exports = JoinRequest;