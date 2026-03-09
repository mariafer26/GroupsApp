const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');
const User = require('./User');

const Group = sequelize.define('Group', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    adminId: {
        type: DataTypes.UUID,
        allowNull: false
    }
});

// Un grupo tiene un administrador
Group.belongsTo(User, { foreignKey: 'adminId', as: 'admin' });

module.exports = Group;