const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');


 /**
  * @swagger
  * tags:
  *   name: Contracts
  *   description: ERC20 token contracts managing API
  */


/**
 * @swagger
 * /contracts:
 *   get:
 *     summary: Get all contracts
 *     tags: [Contracts]
 *     description: Get all contracts
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', contractController.List);
/**
 * @swagger
 * /contracts/subscribe:
 *   get:
 *     summary: Subscribe the transfer function all ERC20 token
 *     tags: [Contracts]
 *     description: Subscribe the transfer function each ERC20 token
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/subscribe", contractController.SubscribeToTokenTransfer);
/**
 * @swagger
 * /contracts/{contractId}:
 *   get:
 *     summary: Get the contract by id
 *     tags: [Contracts]
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
router.get('/:contractId', contractController.Get);
/**
 * @swagger
 * /contracts/balance/{symbol}/{address}:
 *   get:
 *     summary: Get the balance of a specific ERC20 token at an address 
 *     tags: [Contracts]
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
 * /contracts:
 *   post:
 *     summary: Add new contract
 *     tags: [Contracts]
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
router.post('/', contractController.Add);
/**
 * @swagger
 * /contracts/send:
 *   post:
 *     summary: To send token to an address
 *     tags: [Contracts]
 *     description: Send token
 *     requestBody:
 *      description: To send token to an address
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - wallet
 *              - contractAddress
 *              - amount
 *              - address
 *            properties:
 *              wallet:
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
 * /contracts/{contractId}:
 *   delete:
 *     summary: Delete the contract by id
 *     tags: [Contracts]
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
router.delete('/:contractId', contractController.Delete);
/**
 * @swagger
 * /contracts:
 *   patch:
 *     summary: Update the contract
 *     tags: [Contracts]
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
router.patch('/', contractController.Update);


module.exports = router;