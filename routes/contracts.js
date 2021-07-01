const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');

router.get('/', contractController.List);

router.get("/subscribe", contractController.SubscribeToTokenTransfer);

router.get('/:contractId', contractController.Get);

router.get('/balance/:symbol/:address', contractController.GetBalance);

router.post('/', contractController.Add);

router.post('/send', contractController.SendToContract);

router.delete('/:contractId', contractController.Delete);

router.patch('/', contractController.Update);


module.exports = router;