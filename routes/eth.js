const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const chainController = require('../controllers/chainController');
const accountController = require('../controllers/accountController');
const walletController = require('../controllers/walletController');
const globalVariableController = require('../controllers/globalVariableController');


/**
 * @swagger
 * tags:
 *   name: ETH
 *   description: ERC20 token managing API
 */

/**
 * @swagger
 * /eth/isAddress/{address}:
 *   get:
 *     summary: Validate the address
 *     tags: [ETH]
 *     description: Validate the address
 *     parameters:
 *       - in: path
 *         name: address
 *         schema:
 *           type: string
 *         required: true
 *         description: Ethereum address
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/isAddress/:address', chainController.IsAddress);
/**
 * @swagger
 * /eth/tx/{txHash}:
 *   get:
 *     summary: Get transaction by transaction hash
 *     tags: [ETH]
 *     description: Get transaction by transaction hash
 *     parameters:
 *       - in: path
 *         name: txHash
 *         schema:
 *           type: string
 *         required: true
 *         description: Transaction hash
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/tx/:txHash', chainController.GetTransaction);

// IMPORTANT !!!
// /chain, /provider will be merged later

/**
 * @swagger
 * /eth/chain:
 *   get:
 *     summary: Get current Network Type
 *     tags: [ETH]
 *     description: Get current Network Type
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/chain', chainController.GetChain);
/**
 * @swagger
 * /eth/provider:
 *   get:
 *     summary: Get current Provider
 *     tags: [ETH]
 *     description: Get current Provider
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/provider', chainController.GetProvider);
/**
 * @swagger
 * /eth/accounts:
 *   post:
 *     summary: Add new account
 *     tags: [ETH]
 *     description: Add new account
 *     requestBody:
 *      description: The account to create by wallet name
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - wallet
 *            properties:
 *              wallet:
 *                type: string
 *     responses:
 *        200:
 *          description: Created
 */
router.post('/accounts', accountController.Add);
/**
 * @swagger
 * /eth/send:
 *   post:
 *     summary: To send ether to an address
 *     tags: [ETH]
 *     description: Send ether
 *     requestBody:
 *      description: To send ether to an address
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - wallet
 *              - amount
 *              - address
 *            properties:
 *              wallet:
 *                type: string
 *              amount:
 *                type: number
 *              address:
 *                type: string
 *     responses:
 *      200:
 *       description: OK
 */
router.post('/send', chainController.SendTo);
/**
 * @swagger
 * /eth/balance/{address}:
 *   get:
 *     summary: Get the balance of ether at an address 
 *     tags: [ETH]
 *     description: Get the balance of ether at an address 
 *     parameters:
 *       - in: path
 *         name: address
 *         schema:
 *           type: string
 *         required: true
 *         description: The address
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/balance/:address', chainController.GetBalance);
/**
 * @swagger
 * /eth/subscribe:
 *   get:
 *     summary: Subscribe the new transaction notification
 *     tags: [ETH]
 *     description: Subscribe the new transaction notification
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/subscribe", transactionController.SubscribePendingTransactions);
/**
 * @swagger
 * /eth/unsubscribe:
 *   get:
 *     summary: Unsubscribe the new transaction notification
 *     tags: [ETH]
 *     description: Unsubscribe the new transaction notification
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/unsubscribe", transactionController.UnsubscribePendingTransactions);
/**
 * @swagger
 * /eth/wallets/name/{wallet}:
 *   patch:
 *     summary: Update the wallet by wallet name
 *     tags: [ETH]
 *     description: Update the wallet by wallet name
 *     parameters:
 *       - in: path
 *         name: wallet
 *         schema:
 *           type: string
 *         required: true
 *         description: The wallet name
 *     requestBody:
 *      description: The wallet to update
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              notifyUrl:
 *                type: string
 *     responses:
 *        200:
 *          description: Updated
 */
router.patch('/wallets/name/:wallet', walletController.UpdateByName);
/**
 * @swagger
 * /eth/wallets/name/{name}:
 *   get:
 *     summary: Get the wallet by wallet name
 *     tags: [ETH]
 *     description: Get the wallet by wallet name
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: The wallet name
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/wallets/name/:name', walletController.GetByName);
/**
 * @swagger
 * /eth/globalVariables:
 *   get:
 *     summary: Get all system variables
 *     tags: [ETH]
 *     description: Get all system variables
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/globalVariables', globalVariableController.List);
/**
 * @swagger
 * /eth/globalVariables:
 *   patch:
 *     summary: Update the system variables
 *     tags: [ETH]
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
router.patch('/globalVariables', globalVariableController.Update);
//test
router.post('/move', chainController.MoveTo);
router.get('/test', chainController.Test);



module.exports = router;