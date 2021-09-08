const express = require('express');
const router = express.Router();
const globalVariableController = require('../controllers/globalVariableController');


 /**
  * @swagger
  * tags:
  *   name: Global Variables
  *   description: Manage the system variables
  */


/**
 * @swagger
 * /globalVariables:
 *   get:
 *     summary: Get all system variables
 *     tags: [Global Variables]
 *     description: Get all system variables
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', globalVariableController.List);
/**
 * @swagger
 * /globalVariables:
 *   patch:
 *     summary: Update the system variables
 *     tags: [Global Variables]
 *     description: Update the system variables
 *     requestBody:
 *      description: Update the system variables
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              confirmationCount:
 *                type: number
 *              autoMoving:
 *                type: boolean
 *     responses:
 *        200:
 *          description: Updated
 */
router.patch('/', globalVariableController.Update);

module.exports = router;