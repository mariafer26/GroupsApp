const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');
const Group = require('./Group');

const Channel = sequelize.define('Channel', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    groupId: {
        type: DataTypes.UUID,
        allowNull: false
    }
});

Channel.belongsTo(Group, { foreignKey: 'groupId' });

module.exports = Channel;