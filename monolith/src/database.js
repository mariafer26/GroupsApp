const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Base de datos conectada');

        await sequelize.sync({ alter: true });
        console.log('✅ Tablas sincronizadas');
    } catch (error) {
        console.error('❌ Error conectando la base de datos:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };