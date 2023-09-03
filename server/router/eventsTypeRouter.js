const express = require('express');
const router = express.Router();
const eventsTypeController = require('../controller/eventsTypecontroller');

router.post('/list', eventsTypeController.eventsTypeList);
router.post('/list/filtered', eventsTypeController.eventsTypeListFiltered);
router.put('/create', eventsTypeController.eventsTypeCreate);
router.post('/modify', eventsTypeController.eventsTypeModify);
router.post('/delete', eventsTypeController.eventsTypeDelete);

module.exports = router;