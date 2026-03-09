const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');
const User = require('./User');
const Group = require('./Group');

const GroupMember = sequelize.define('GroupMember', {
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    groupId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'member'),
        defaultValue: 'member'
    }
});

GroupMember.belongsTo(User, { foreignKey: 'userId' });
GroupMember.belongsTo(Group, { foreignKey: 'groupId' });

module.exports = GroupMember;