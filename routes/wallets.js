const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');

router.get('/', walletController.List);

router.post('/', walletController.Create);

router.get('/:walletId', walletController.Get);

router.delete('/:walletId', walletController.Delete);

router.patch('/', walletController.Update);

module.exports = router;