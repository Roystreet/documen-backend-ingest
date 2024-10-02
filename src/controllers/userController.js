const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });
    res.status(201).json(user);
    logger.info('Usuario creado exitosamente');
  } catch (error) {
    logger.error('Error al crear usuario:', error);
    res.status(500).send('Error al crear usuario');
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send('Usuario no encontrado');
    }
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.status(200).json(user);
    logger.info('Usuario actualizado exitosamente');
  } catch (error) {
    logger.error('Error al actualizar usuario:', error);
    res.status(500).send('Error al actualizar usuario');
  }
};

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send('Usuario no encontrado');
    }
    res.status(200).json(user);
    logger.info('Usuario obtenido exitosamente');
  } catch (error) {
    logger.error('Error al obtener usuario:', error);
    res.status(500).send('Error al obtener usuario');
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({error :'Correo electrónico o contraseña incorrectos'});
    }
    const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token : token});
    logger.info('Usuario autenticado exitosamente');
  } catch (error) {
    logger.error('Error al autenticar usuario:', error);
    res.status(500).send('Error al autenticar usuario');
  }
};

exports.logoutUser = (req, res) => {
  // Aquí puedes implementar la lógica de logout, como invalidar el token en el cliente
  res.status(200).send('Usuario desconectado exitosamente');
  logger.info('Usuario desconectado exitosamente');
};