const router = require('express').Router();
const userRequest = require('../request/userRequest');
const userController = require('../controllers/userController');


router.post('/register', userRequest.createUser, userController.createUser);
router.put('/update/:id', userRequest.updateUser, userController.updateUser);
router.get('/:id', userController.getUser);
router.post('/login', userRequest.loginUser, userController.loginUser);
router.post('/logout', userController.logoutUser);

module.exports = router;