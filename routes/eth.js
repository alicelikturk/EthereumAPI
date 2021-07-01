const express = require('express');
const router = express.Router();
const ethController = require('../controllers/ethController');

router.get('/isAddress/:address', ethController.IsAddress);

router.get('/tx/:txHash', ethController.GetTransaction);

router.get('/chain', ethController.GetChain);

router.post('/send', ethController.SendTo);

router.post('/move', ethController.MoveTo);
router.post('/walletaccounts/:walletId', ethController.WalletAccounts);


module.exports = router;