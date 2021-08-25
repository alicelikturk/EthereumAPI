const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.get('/', accountController.List);

router.post('/', accountController.Add);

router.get('/:accountId', accountController.Get);

router.delete('/:accountId', accountController.Delete);

module.exports = router;