const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');


 /**
  * @swagger
  * tags:
  *   name: Wallets
  *   description: The wallet managing API
  */

 /**
 * @swagger
 * /wallets:
 *   get:
 *     summary: Get all wallets
 *     tags: [Wallets]
 *     description: Get all wallets
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', walletController.List);
/**
 * @swagger
 * /wallets:
 *   post:
 *     summary: Add new wallet
 *     tags: [Wallets]
 *     description: Add new wallet
 *     requestBody:
 *      description: The wallet to create
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - name
 *              - network
 *            properties:
 *              name:
 *                type: string
 *              notifyUrl:
 *                type: string
 *              network:
 *                type: string
 *                description: network {mainnet, ropsten}
 *     responses:
 *        200:
 *          description: Created
 */
router.post('/', walletController.Create);
/**
 * @swagger
 * /wallets/wallet/{walletId}:
 *   get:
 *     summary: Get the accounts belonging to the wallet by wallet id 
 *     tags: [Wallets]
 *     description: Get the accounts belonging to the wallet by wallet id
 *     parameters:
 *       - in: path
 *         name: walletId
 *         schema:
 *           type: string
 *         required: true
 *         description: The wallet id
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/wallet/:walletId', walletController.WalletAccountList);
/**
 * @swagger
 * /wallets/{walletId}:
 *   get:
 *     summary: Get the wallet by wallet id 
 *     tags: [Wallets]
 *     description: Get the wallet by wallet id
 *     parameters:
 *       - in: path
 *         name: walletId
 *         schema:
 *           type: string
 *         required: true
 *         description: The wallet id
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/:walletId', walletController.Get);
/**
 * @swagger
 * /wallets/name/{name}:
 *   get:
 *     summary: Get the wallet by wallet name
 *     tags: [Wallets]
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
 router.get('/name/:name', walletController.GetByName);
/**
 * @swagger
 * /wallets/address/{address}:
 *   get:
 *     summary: Get the wallet by wallet main address
 *     tags: [Wallets]
 *     description: Get the wallet by wallet main address
 *     parameters:
 *       - in: path
 *         name: address
 *         schema:
 *           type: string
 *         required: true
 *         description: Wallet main address
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/address/:address', walletController.GetByAddress);
/**
 * @swagger
 * /wallets/balance/{walletId}:
 *   get:
 *     summary: Get wallet balance that included all tokens and ether by wallet id
 *     tags: [Wallets]
 *     description: Get the all balance by wallet id
 *     parameters:
 *       - in: path
 *         name: walletId
 *         schema:
 *           type: string
 *         required: true
 *         description: The wallet id
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/balance/:walletId', walletController.GetBalance);
/**
 * @swagger
 * /wallets/{walletId}:
 *   delete:
 *     summary: Delete the wallet by id
 *     tags: [Wallets]
 *     description: Delete the wallet by id
 *     parameters:
 *       - in: path
 *         name: walletId
 *         schema:
 *           type: string
 *         required: true
 *         description: The wallet id
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/:walletId', walletController.Delete);
/**
 * @swagger
 * /wallets/{walletId}:
 *   patch:
 *     summary: Update the wallet by id
 *     tags: [Wallets]
 *     description: Update the wallet by id
 *     parameters:
 *       - in: path
 *         name: walletId
 *         schema:
 *           type: string
 *         required: true
 *         description: The wallet id
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
router.patch('/:walletId', walletController.Update);
/**
 * @swagger
 * /wallets/name/{wallet}:
 *   patch:
 *     summary: Update the wallet by wallet name
 *     tags: [Wallets]
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
 router.patch('/name/:wallet', walletController.UpdateByName);
module.exports = router;