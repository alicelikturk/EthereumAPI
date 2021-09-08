const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const chainController = require('../controllers/chainController');
const accountController = require('../controllers/accountController');


 /**
  * @swagger
  * tags:
  *   name: ERC20
  *   description: ERC20 token managing API
  */

/**
 * @swagger
 * /erc20/isAddress/{address}:
 *   get:
 *     summary: Validate the address
 *     tags: [ERC20]
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
 * /erc20/tx/{txHash}:
 *   get:
 *     summary: Get transaction by transaction hash
 *     tags: [ERC20]
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
 * /erc20/chain:
 *   get:
 *     summary: Get current Network Type
 *     tags: [ERC20]
 *     description: Get current Network Type
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/chain', chainController.GetChain);
/**
 * @swagger
 * /erc20/provider:
 *   get:
 *     summary: Get current Provider
 *     tags: [ERC20]
 *     description: Get current Provider
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/provider', chainController.GetProvider);

// IMPORTANT !!!
// from routes/contracts.js

/**
 * @swagger
 * /erc20/accounts:
 *   post:
 *     summary: Add new account
 *     tags: [ERC20]
 *     description: Add new account
 *     requestBody:
 *      description: The account to create
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - walletId
 *            properties:
 *              walletId:
 *                type: string
 *     responses:
 *        200:
 *          description: Created
 */
router.post('/accounts', accountController.Add);
/**
 * @swagger
 * /erc20/send:
 *   post:
 *     summary: To send token to an address
 *     tags: [ERC20]
 *     description: Send token
 *     requestBody:
 *      description: To send token to an address
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - walletId
 *              - contractAddress
 *              - amount
 *              - address
 *            properties:
 *              walletId:
 *                type: string
 *              contractAddress:
 *                type: string
 *              amount:
 *                type: number
 *              address:
 *                type: string
 *     responses:
 *      200:
 *       description: OK
 */
router.post('/send', contractController.SendToContract);
/**
 * @swagger
 * /erc20/balance/{symbol}/{address}:
 *   get:
 *     summary: Get the balance of a specific ERC20 token at an address 
 *     tags: [ERC20]
 *     description: Get the balance of a specific ERC20 token at an address 
 *     parameters:
 *       - in: path
 *         name: symbol
 *         schema:
 *           type: string
 *         required: true
 *         description: The ERC20 token symbol
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
router.get('/balance/:symbol/:address', contractController.GetBalance);
/**
 * @swagger
 * /erc20/subscribe:
 *   get:
 *     summary: Subscribe the transfer function all ERC20 token
 *     tags: [ERC20]
 *     description: Subscribe the transfer function each ERC20 token
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/subscribe", contractController.SubscribeToTokenTransfer);

/**
 * @swagger
 * /erc20/contracts:
 *   get:
 *     summary: Get all contracts
 *     tags: [ERC20]
 *     description: Get all contracts
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/contracts', contractController.List);
/**
 * @swagger
 * /erc20/contracts/{contractId}:
 *   get:
 *     summary: Get the contract by id
 *     tags: [ERC20]
 *     description: Get the contract by id
 *     parameters:
 *       - in: path
 *         name: contractId
 *         schema:
 *           type: string
 *         required: true
 *         description: The contract id
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/contracts/:contractId', contractController.Get);
/**
 * @swagger
 * /erc20/contracts:
 *   post:
 *     summary: Add new contract
 *     tags: [ERC20]
 *     description: Add new contract
 *     requestBody:
 *      description: The contract to add contract list
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - contractAddress
 *              - name
 *              - symbol
 *            properties:
 *              contractAddress:
 *                type: string
 *              symbol:
 *                type: string
 *              name:
 *                type: string
 *              abi:
 *                type: string
 *              standart:
 *                type: string
 *              assetMoveLimit:
 *                type: number
 *              isActive:
 *                type: boolean
 *      responses:
 *        200:
 *          description: Created
 */
router.post('/contracts', contractController.Add);
/**
 * @swagger
 * /erc20/contracts/{contractId}:
 *   delete:
 *     summary: Delete the contract by id
 *     tags: [ERC20]
 *     description: Delete the contract by id
 *     parameters:
 *       - in: path
 *         name: contractId
 *         schema:
 *           type: string
 *         required: true
 *         description: The contract id
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/contracts/:contractId', contractController.Delete);
/**
 * @swagger
 * /erc20/contracts:
 *   patch:
 *     summary: Update the contract
 *     tags: [ERC20]
 *     description: Update the contract
 *     requestBody:
 *      description: Update the contract
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - contractAddress
 *            properties:
 *              contractAddress:
 *                type: string
 *              symbol:
 *                type: string
 *              name:
 *                type: string
 *              abi:
 *                type: string
 *              standart:
 *                type: string
 *              assetMoveLimit:
 *                type: number
 *              isActive:
 *                type: boolean
 *     responses:
 *        200:
 *          description: Updated
 */
router.patch('/contracts', contractController.Update);

module.exports = router;