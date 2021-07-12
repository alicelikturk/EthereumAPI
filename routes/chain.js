const express = require('express');
const router = express.Router();
const chainController = require('../controllers/chainController');

router.get('/isAddress/:address', chainController.IsAddress);

router.get('/tx/:txHash', chainController.GetTransaction);

// /chain, /provider will be merged later
router.get('/chain', chainController.GetChain);
router.get('/provider', chainController.GetProvider);

router.post('/send', chainController.SendTo);

router.post('/move', chainController.MoveTo);
router.get('/test', chainController.Test);


module.exports = router;