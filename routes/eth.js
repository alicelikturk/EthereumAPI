const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const chainController = require('../controllers/chainController');
const accountController = require('../controllers/accountController');

router.get('/isAddress/:address', chainController.IsAddress);
router.get('/tx/:txHash', chainController.GetTransaction);
// /chain, /provider will be merged later
router.get('/chain', chainController.GetChain);
router.get('/provider', chainController.GetProvider);
router.post('/accounts', accountController.Add);
router.post('/send', chainController.SendTo);
router.get('/balance/:address', chainController.GetBalance);
router.get("/subscribe", transactionController.SubscribePendingTransactions);
router.get("/unsubscribe", transactionController.UnsubscribePendingTransactions);
//test
router.post('/move', chainController.MoveTo);
router.get('/test', chainController.Test);



module.exports = router;