require('dotenv').config();
const { Sequelize } = require('sequelize');
const logger = require('../middlewares/logger');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
});


(async () => {
    try {
        await sequelize.authenticate();
        logger.info('Conexión establecida correctamente.');
    } catch (error) {
        logger.error('No se pudo conectar a la base de datos:', error);
    }
})();
module.exports = sequelize;