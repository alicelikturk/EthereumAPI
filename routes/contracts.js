const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');

router.get('/', contractController.List);

router.get("/subscribe", contractController.SubscribeToTokenTransfer);

router.post('/', contractController.Add);

router.post('/send', contractController.SendToContract);

router.get('/:contractId', contractController.Get);

router.delete('/:contractId', contractController.Delete);

router.patch('/', contractController.Update);


module.exports = router;