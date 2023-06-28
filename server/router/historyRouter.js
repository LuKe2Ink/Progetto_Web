const express = require('express');
const router = express.Router();
const historyController = require('../controller/historyController');

router.put('/add', historyController.historyAdd);
router.post('/modify', historyController.historyModify);

module.exports = router;