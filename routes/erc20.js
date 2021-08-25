const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const chainController = require('../controllers/chainController');
const accountController = require('../controllers/accountController');

router.get('/isAddress/:address', chainController.IsAddress);
router.get('/tx/:txHash', chainController.GetTransaction);
// /chain, /provider will be merged later
router.get('/chain', chainController.GetChain);
router.get('/provider', chainController.GetProvider);
// from routes/contracts.js
router.post('/accounts', accountController.Add);
router.post('/send', contractController.SendToContract);
router.get('/balance/:symbol/:address', contractController.GetBalance);
router.get("/subscribe", contractController.SubscribeToTokenTransfer);


router.get('/', contractController.List);
router.get('/:contractId', contractController.Get);
router.post('/', contractController.Add);
router.delete('/:contractId', contractController.Delete);
router.patch('/', contractController.Update);

module.exports = router;