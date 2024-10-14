require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors'); 
const { errors } = require('celebrate');
const logger = require('./src/middlewares/logger');
const listEndpoints = require('express-list-endpoints');
const app = express();
const port = process.env.PORT || 3000;
const { sequelize } = require('./src/models');
const routes = require('./src/router/index');

global.logger = logger;
app.use(cors());
// Middleware para parsear JSON
app.use(express.json());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Ruta de ejemplo
app.get('/', (req, res) => {
  res.send('¡Hola, mundo!');
});

app.use('/api', routes);

app.use(errors());
console.table(listEndpoints(app));
// Iniciar el servidor
app.listen(port, async () => {
  try {
    await sequelize.authenticate();
   // await sequelize.sync({ force: true });
    logger.info('Conexión establecida correctamente.');
  } catch (error) {
    logger.error('No se pudo conectar con la base de datos:', error)
  }

});