const express = require('express');
const router = express.Router();
const specialObjectController = require('../controller/specialObjectController');

// router.put('/add', historyController.historyAdd);
router.post('/list', specialObjectController.specialObjectList);
router.put('/add', specialObjectController.specialObjectAdd);
// router.post('/modify', historyController)

module.exports = router;