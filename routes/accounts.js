const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.get('/', accountController.List);

router.get('/wallet/:walletId', accountController.WalletAccountList);

router.post('/', accountController.Add);

router.get('/:accountId', accountController.Get);

router.get('/balance/:address', accountController.GetBalance);

router.delete('/:accountId', accountController.Delete);

module.exports = router;