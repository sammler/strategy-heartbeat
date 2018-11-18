const express = require('express');

const SettingsController = require('./settings.controller');
const verifyJwtToken = require('../../middleware/verifyJwtToken');

const router = express.Router(); // eslint-disable-line new-cap

/**
 * @swagger
 *
 * definitions:
 *   Settings:
 *    type: object
 *    properties:
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
 *      created_at:
 *        type: string
 *        format: date
 *        readOnly: true
 *      updated_at:
 *        type: string
 *        format: date
 *        readOnly: true
 *
 * securityDefinitions:
 *   JWT:
 *     type: apiKey
 *     name: Authorization
 *     in: header
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
router.get('/v1/settings', verifyJwtToken, SettingsController.getMine);

/**
 * @swagger
 *
 * /v1/settings:
 *   post:
 *     summary: Adds or updates settings.
 *     description: Adds or updates the settings for the currently authenticated user.
 *     security: []
 *     produces:
 *       - application/json
 *     tags:
 *       - settings
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/Settings'
 *     responses:
 *       200:
 *         description: Settings saved successfully.
 *         schema:
 *           $ref: '#/definitions/Settings'
 */
router.put('/v1/settings', verifyJwtToken, SettingsController.createUpdateMine);

// Router.put('/v1/settings', SettingsController.put);

/**
 * @swagger
 *
 * /v1/settings/count:
 *   get:
 *     description: Return the amount of settings.
 *     produces:
 *       - application/json
 *     tags:
 *       - settings
 *     responses:
 *       200:
 *         description: Return amount of settings.
 */
router.get('/v1/settings/count', SettingsController.count);

module.exports = router;
