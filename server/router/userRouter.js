const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

router.put('/register', userController.userRegister);
router.post('/modify', userController.userModify);
router.delete('/delete', userController.userDelete);
router.post('/login', userController.userLogin);
router.post('/token', userController.userVerifyOrRefresh);
module.exports = router;