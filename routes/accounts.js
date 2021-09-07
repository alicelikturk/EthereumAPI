const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

 /**
  * @swagger
  * tags:
  *   name: Accounts
  *   description: The account managing API
  */


/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Get all accounts
 *     tags: [Accounts]
 *     description: Get all accounts
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', accountController.List);
/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Add new account
 *     tags: [Accounts]
 *     description: Add new account
 *     parameters:
 *      - name: walletId
 *        description: Wallet Id
 *        in: query
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Created
 */
router.post('/', accountController.Add);
/**
 * @swagger
 * /accounts/{accountId}:
 *   get:
 *     summary: Get the account by id
 *     tags: [Accounts]
 *     description: Get the account by id
 *     parameters:
 *       - in: path
 *         name: accountId
 *         schema:
 *           type: string
 *         required: true
 *         description: The account id
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/:accountId', accountController.Get);
/**
 * @swagger
 * /accounts/{accountId}:
 *   delete:
 *     summary: Delete the account by id
 *     tags: [Accounts]
 *     description: Delete the account by id
 *     parameters:
 *       - in: path
 *         name: accountId
 *         schema:
 *           type: string
 *         required: true
 *         description: The account id
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/:accountId', accountController.Delete);

module.exports = router;