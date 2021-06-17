const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');


router.get("/subscribe", transactionController.SubscribePendingTransactions);
router.get("/unsubscribe", transactionController.UnsubscribePendingTransactions);

module.exports = router;