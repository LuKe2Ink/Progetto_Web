const express = require('express');
const router = express.Router();
const eventsTypeController = require('../controller/eventsTypecontroller');

router.post('/list', eventsTypeController.eventsTypeList);
router.put('/create', eventsTypeController.eventsTypeCreate);
router.post('/modify', eventsTypeController.eventsTypeModify);
router.delete('/delete', eventsTypeController.eventsTypeDelete);

module.exports = router;