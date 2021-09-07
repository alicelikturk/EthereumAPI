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
 *     parameters:
 *       - name: isActive
 *         in: boolean
 *         schema:
 *           type: boolean
 *         required: true
 *         description: to set current client
 *       - name: name
 *         in: query
 *         schema:
 *           type: string
 *         required: false
 *         description: client name
 *       - name: mainnetHttp
 *         in: query
 *         schema:
 *           type: string
 *         required: false
 *         description: HTTP url for the mainnet with token
 *       - name: ropstenHttp
 *         in: query
 *         schema:
 *           type: string
 *         required: false
 *         description: HTTP url for the ropsten with token
 *       - name: mainnetWss
 *         in: query
 *         schema:
 *           type: string
 *         required: false
 *         description: WS url for the mainnet with token
 *       - name: ropstenWss
 *         in: query
 *         schema:
 *           type: string
 *         required: false
 *         description: WS url for the ropsten with token
 *       - name: mainnetIpc
 *         in: query
 *         schema:
 *           type: string
 *         description: IPC for the mainnet with token
 *       - name: ropstenIpc
 *         in: query
 *         schema:
 *           type: string
 *         description: IPC for the ropsten with token
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
 *     summary: Update new client
 *     tags: [Clients]
 *     description: Update new client
 *     parameters:
 *       - name: isActive
 *         in: boolean
 *         schema:
 *           type: boolean
 *         required: true
 *         description: to set current client
 *       - name: name
 *         in: query
 *         schema:
 *           type: string
 *         required: false
 *         description: client name
 *       - name: mainnetHttp
 *         in: query
 *         schema:
 *           type: string
 *         required: false
 *         description: HTTP url for the mainnet with token
 *       - name: ropstenHttp
 *         in: query
 *         schema:
 *           type: string
 *         required: false
 *         description: HTTP url for the ropsten with token
 *       - name: mainnetWss
 *         in: query
 *         schema:
 *           type: string
 *         required: false
 *         description: WS url for the mainnet with token
 *       - name: ropstenWss
 *         in: query
 *         schema:
 *           type: string
 *         required: false
 *         description: WS url for the ropsten with token
 *       - name: mainnetIpc
 *         in: query
 *         schema:
 *           type: string
 *         description: IPC for the mainnet with token
 *       - name: ropstenIpc
 *         in: query
 *         schema:
 *           type: string
 *         description: IPC for the ropsten with token
 *     responses:
 *       200:
 *         description: Success
 */
router.patch('/', clientController.Update);

module.exports = router;