const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');

router.get('/', walletController.List);

router.post('/', walletController.Create);

router.get('/wallet/:walletId', walletController.WalletAccountList);
router.get('/:walletId', walletController.Get);
router.get('/address/:address', walletController.GetByAddress);
router.get('/balance/:walletId', walletController.GetBalance);
router.delete('/:walletId', walletController.Delete);
router.patch('/:walletId', walletController.Update);

module.exports = router;