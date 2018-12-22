const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap

const HeartbeatsController = require('./heartbeats.controller');
const verifyJwtToken = require('../../middleware/verifyJwtToken');

router.get('/v1/heartbeats', verifyJwtToken, HeartbeatsController.getMine);
router.get('/v1/heartbeats/count', verifyJwtToken, HeartbeatsController.countMine);
router.delete('/v1/heartbeats', verifyJwtToken, HeartbeatsController.deleteMine);
router.post('/v1/heartbeats', verifyJwtToken, HeartbeatsController.postMine);

module.exports = router;
