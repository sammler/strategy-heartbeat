const express = require('express');
const HeartbeatsController = require('./heartbeats.controller');

const router = express.Router(); // eslint-disable-line new-cap

// /heartbeats/v1
router.get('', HeartbeatsController.get);

module.exports = router;
