const express = require('express');
const router = express.Router();
const eventsController = require('../controller/eventsController');

router.post('/list', eventsController.eventsList);
router.put('/create', eventsController.eventCreate);
router.post('/modify', eventsController.eventModify);
router.post('/delete', eventsController.eventDelete);

module.exports = router;