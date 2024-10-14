const router = require('express').Router();
const companyController = require('../controllers/companyController');

// Rutas para empresas
router.post('/create', companyController.createCompany);
router.get('/:id', companyController.getCompanyById);
router.get('/', companyController.getAllCompanies);
router.get('/:id/users', companyController.getUserForCompany);
router.post('/users/create',companyController.createUserForCompany); 


module.exports = router;