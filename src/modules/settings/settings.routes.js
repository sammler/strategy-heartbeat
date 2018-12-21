const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap

const SettingsController = require('./settings.controller');
const verifyJwtToken = require('../../middleware/verifyJwtToken');

/**
 * @todo: Settings does not match the model anymore ..
 * @todo: Standardize the error object
 *
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
 *      every_ten_minutes:
 *        type: boolean
 *      every_hour:
 *        type: boolean
 *      every_day:
 *        type: boolean
 *      every_week:
 *        type: boolean
 *      every_month:
 *        type: boolean
 *      created_at:
 *        type: string
 *        format: date
 *        readOnly: true
 *      updated_at:
 *        type: string
 *        format: date
 *        readOnly: true
 *   Error:
 *     type: object
 *     properties:
 *       code:
 *         type: integer
 *         format: int32
 *       message:
 *         type: string
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
 *       401:
 *         description:
 *
 *           User is not authorized to perform this action.
 *       default:
 *         description: Unexpected error
 *         schema:
 *           $ref: '#/definitions/Error'
 */
router.get('/v1/settings', verifyJwtToken, SettingsController.getMine);

/**
 * @swagger
 *
 * /v1/settings:
 *   post:
 *     summary: Adds or updates settings.
 *     description:
 *
 *       Adds or updates the settings for the currently authenticated user.
 *
 *       Creates/updates/deletes also the related jobs as defined in the settings and stores the resulting Job IDs.
 *
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
 *       401:
 *         description: User is not authorized to perform this action.
 *       default:
 *         description: Unexpected error
 *         schema:
 *           $ref: '#/definitions/Error'
 */
router.post('/v1/settings', verifyJwtToken, SettingsController.createUpdateMine);

/**
 * @todo: Should only work for role `system` or `admin`.
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
 *       default:
 *         description: Unexpected error
 *         schema:
 *           $ref: '#/definitions/Error'
 */
router.get('/v1/settings/count', SettingsController.count);

module.exports = router;
