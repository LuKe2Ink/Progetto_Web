const express = require('express');
const router = express.Router();
const attachmentController = require('../controller/attachmentController');

router.put('/add', attachmentController.attachmentAdd);
router.post('/delete', attachmentController.attachmentDelete);

module.exports = router;