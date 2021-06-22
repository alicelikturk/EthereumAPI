const express = require('express');
const router = express.Router();
const globalVariableController = require('../controllers/globalVariableController');

router.get('/', globalVariableController.List);

router.patch('/', globalVariableController.Update);

module.exports = router;