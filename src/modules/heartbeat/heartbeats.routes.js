const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap

const HeartbeatsController = require('./heartbeats.controller');

router.get('/v1/heartbeats', HeartbeatsController.getMine);
router.delete('/v1/heartbeats', HeartbeatsController.deleteMine);
router.post('/v1/heartbeats', HeartbeatsController.postMine);

module.exports = router;
