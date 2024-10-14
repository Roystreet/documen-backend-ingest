const router = require('express').Router();
const userRouter = require('./userRouter');
const documentRouter = require('./documentRouter');
const companyRouter = require('./companyRouter');
/*const roleRouter = require('./roleRouter');
const chatRouter = require('./chatRouter');
const chatMessageRouter = require('./chatMessageRouter');
const userRoleRouter = require('./userRoleRouter');
*/

router.use('/users', userRouter)
router.use('/documents', documentRouter)
router.use('/companies', companyRouter)
/*
router.use('/roles', roleRouter)
router.use('/companies', companyRouter)
router.use('/documents', documentRouter)
router.use('/chats', chatRouter)
router.use('/chat-messages', chatMessageRouter)
router.use('/user-roles', userRoleRouter)
*/

module.exports = router;