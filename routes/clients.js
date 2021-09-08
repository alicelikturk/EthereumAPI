const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');


/**
  * @swagger
  * tags:
  *   name: Clients
  *   description: The Ethereum node clients
  */

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Get all clients
 *     tags: [Clients]
 *     description: Get all clients
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', clientController.List);
/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Add new client
 *     tags: [Clients]
 *     description: Add new client
 *     requestBody:
 *       description: The client to create
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            required:
 *              - isActive
 *            properties:
 *              isActive:
 *                type: boolean
 *              name:
 *                type: string
 *              mainnetHttp:
 *                type: string
 *              ropstenHttp:
 *                type: string
 *              mainnetWss:
 *                type: string
 *              ropstenWss:
 *                type: string
 *              mainnetIpc:
 *                type: string
 *              ropstenIpc:
 *                type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/', clientController.Add);
/**
 * @swagger
 * /clients/{clientId}:
 *   get:
 *     summary: Get the client by id
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: clientId
 *         schema:
 *           type: string
 *         required: true
 *         description: The client id
 *     responses:
 *       200:
 *         description: The client description by id
 */
router.get('/:clientId', clientController.Get);
/**
 * @swagger
 * /clients/{clientId}:
 *   delete:
 *     summary: Delete the client by id
 *     tags: [Clients]
 *     description: Delete the client by id
 *     parameters:
 *       - in: path
 *         name: clientId
 *         schema:
 *           type: string
 *         required: true
 *         description: The account id
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/:clientId', clientController.Delete);
/**
 * @swagger
 * /clients:
 *   patch:
 *     summary: Update the active client
 *     tags: [Clients]
 *     description: Update the active client
 *     requestBody:
 *       description: The active client to update
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            required:
 *              - isActive
 *            properties:
 *              isActive:
 *                type: boolean
 *              name:
 *                type: string
 *              mainnetHttp:
 *                type: string
 *              ropstenHttp:
 *                type: string
 *              mainnetWss:
 *                type: string
 *              ropstenWss:
 *                type: string
 *              mainnetIpc:
 *                type: string
 *              ropstenIpc:
 *                type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.patch('/', clientController.Update);

module.exports = router;