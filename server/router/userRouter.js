const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

router.put('/register', userController.userRegister);
router.post('/modify', userController.userModify);
router.post('/delete', userController.userDelete);
router.post('/login', userController.userLogin);
router.post('/token', userController.userVerifyOrRefresh);
router.post('/settings', userController.userSettings);
router.post('/modify/password', userController.userChangePassword);
router.post('/list', userController.usersList);
router.post('/active', userController.disableEnableUser);
module.exports = router;