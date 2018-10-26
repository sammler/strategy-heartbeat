const express = require('express');
const SettingsController = require('./settings.controller');

const router = express.Router(); // eslint-disable-line new-cap


/**
 * @swagger
 *
 * definitions:
 *   SettingsResult:
 *    type: object
 *    properties:
 *      user_id:
 *        type: string
 *        description: The id of the given user.
 *
 *
 * /v1/settings/me:
 *   get:
 *     description: Get the settings of currently authenticated user.
 *     security: []
 *     produces:
 *       - application/json
 *     tags:
 *       - settings
 *     responses:
 *       200:
 *         description: Returned settings for the given user.
 *         schema:
 *           $ref: '#/definitions/SettingsResult'
 */
router.get('/v1/settings/me', SettingsController.get);
router.post('/v1/settings', SettingsController.post);

module.exports = router;
