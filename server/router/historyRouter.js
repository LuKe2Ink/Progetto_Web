const express = require('express');
const router = express.Router();
const historyController = require('../controller/historyController');

router.put('/add', historyController.historyAdd);
router.post('/get', historyController.historyGet);
router.post('/get/all', historyController.historyForGraph);

module.exports = router;