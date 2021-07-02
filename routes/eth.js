const express = require('express');
const router = express.Router();
const ethController = require('../controllers/ethController');

router.get('/isAddress/:address', ethController.IsAddress);

router.get('/tx/:txHash', ethController.GetTransaction);

// /chain, /provider will be merged later
router.get('/chain', ethController.GetChain);
router.get('/provider', ethController.GetProvider);

router.post('/send', ethController.SendTo);

router.post('/move', ethController.MoveTo);
router.get('/test', ethController.Test);


module.exports = router;