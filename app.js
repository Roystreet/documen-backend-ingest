require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const { errors } = require('celebrate');
const logger = require('./src/middlewares/logger');
const app = express();
const port = process.env.PORT || 3000;
const { sequelize } = require('./src/models');
global.logger = logger;
// Middleware para parsear JSON
app.use(express.json());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(errors());

// Ruta de ejemplo
app.get('/', (req, res) => {
  res.send('¡Hola, mundo!');
});

// Iniciar el servidor
app.listen(port, async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    logger.info('Conexión establecida correctamente.');
  } catch (error) {
    logger.error('No se pudo conectar con la base de datos:', error)
  }

});