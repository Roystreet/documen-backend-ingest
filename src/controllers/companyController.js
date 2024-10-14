const { validationResult, body } = require('express-validator');
const { Company, User } = require('../models');
const bcrypt = require('bcrypt');

exports.createCompany = async (req, res) => {

    await body('name').isString().notEmpty().withMessage('El nombre es obligatorio y debe ser una cadena de texto.').run(req);
    await body('url').optional().isString().withMessage('La URL debe ser una cadena de texto.').run(req);
    await body('logo').optional().isString().withMessage('El logo debe ser una cadena de texto.').run(req);
    await body('address').optional().isString().withMessage('La dirección debe ser una cadena de texto.').run(req);
    await body('phone').optional().isString().withMessage('El teléfono debe ser una cadena de texto.').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        s
        return res.status(400).json({ succes: false, errors: errors.array() });
    }

    try {
        const company = await Company.create(req.body);
        res.status(201).json({
            succes: true,
            message: 'Empresa creada exitosamente',
            data: company,
        });
    } catch (error) {
        console.error('Error al crear empresa:', error);
        res.status(500).json({
            message: error,
            error: error.message,
        });
    }
};

// Obtener empresa por ID
exports.getCompanyById = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await Company.findByPk(id);
        if (!company) {
            return res.status(404).json({
                success: true,
                message: 'Empresa no encontrada',
                data: [],
            });
        }
        res.status(200).json({
            success: true,
            message: 'Empresa obtenida exitosamente',
            data: company,
        });
    } catch (error) {
        console.error('Error al obtener empresa:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener empresa',
            error: error.message,
        });
    }
};

// Obtener todas las empresas
exports.getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.findAll();
        res.status(200).json({
            success: true,
            message: 'Empresas obtenidas exitosamente',
            data: companies,
        });
    } catch (error) {
        console.error('Error al obtener empresas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener empresas',
            error: error.message,
        });
    }
};

exports.getUserForCompany = async (req, res) => {

    try {
        const { id } = req.params;
        const users = await User.findAll({ where: { companyId: id } });

        if (!users) {
            return res.status(404).json({
                succes: true,
                message: 'Usuarios no encontrados',
                data: [],
            });
        }
        res.status(200).json({
            succes: true,
            message: 'Usuarios obtenidos exitosamente',
            data: users,
        });

    } catch (error) {
        logger.error('Error al obtener usuarios:', error);
        res.status(500).json({
            succes: false,
            message: 'Error al obtener usuarios',
            error: error.message,
        });

    }
};

exports.createUserForCompany = async (req, res) => {
    await body('name').isString().notEmpty().withMessage('El nombre es obligatorio y debe ser una cadena de texto.').run(req);
    await body('lastname').isString().notEmpty().withMessage('El apellido es obligatorio y debe ser una cadena de texto.').run(req);
    await body('username').isString().notEmpty().withMessage('El nombre de usuario es obligatorio y debe ser una cadena de texto.').run(req);
    await body('email').isEmail().withMessage('El email es obligatorio y debe ser un email válido.').run(req);
    await body('password').isString().notEmpty().withMessage('La contraseña es obligatoria y debe ser una cadena de texto.').run(req);
    await body('companyId').isInt().withMessage('El id de la empresa es obligatorio y debe ser un número entero.').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ succes: false, errors: errors.array() });
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = await User.create({ ...req.body, password: hashedPassword });
        res.status(201).json({
            succes: true,
            message: 'Usuario creado exitosamente',
            data: user,
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({
            message: error,
            error: error.message,
        });
    }
};
