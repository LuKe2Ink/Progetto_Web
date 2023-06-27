const express = require('express');
const router = express.Router();
const historyController = require('../controller/historyController');

router.put('/add', historyController.historyAdd);
router.post('/modify', historyController.historyModify);

router.put('/special/add', historyController.specialHistoryAdd);
router.post('/special/modify', historyController.specialHistoryModify);

module.exports = router;