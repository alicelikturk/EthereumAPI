const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.get('/', accountController.List);

//router.post('/', blockController.Add);

//router.get('/:blockId', blockController.Get);

//router.delete('/:blockId', blockController.Delete);

module.exports = router;