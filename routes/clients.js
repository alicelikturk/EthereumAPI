const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

router.get('/', clientController.List);

router.post('/', clientController.Add);

router.get('/:clientId', clientController.Get);

router.delete('/:clientId', clientController.Delete);

router.patch('/', clientController.Update);

module.exports = router;