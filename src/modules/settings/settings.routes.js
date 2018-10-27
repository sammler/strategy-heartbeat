const express = require('express');
const SettingsController = require('./settings.controller');

const router = express.Router(); // eslint-disable-line new-cap


/**
 * @swagger
 *
 * definitions:
 *   Settings:
 *    type: object
 *    properties:
 *      id:
 *        type: string
 *        format: uid
 *      user_id:
 *        type: string
 *        format: uid
 *        description: The id of the given user.
 *      every_minute:
 *        type: boolean
 *      every_two_minutes:
 *        type: boolean
 *      every_five_minutes:
 *        type: boolean
 *      s5r_created_at:
 *        type: string
 *        format: date
 *        readOnly: true
 *      s5r_updated_at:
 *        type: string
 *        format: date
 *        readOnly: true
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
 *           $ref: '#/definitions/Settings'
 */
router.get('/v1/settings/me', SettingsController.get);
router.post('/v1/settings', SettingsController.post);

module.exports = router;
