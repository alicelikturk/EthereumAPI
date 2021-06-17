const express = require('express');
const router = express.Router();
const blockController = require('../controllers/blockController');

//router.get('/', blockController.List);

//router.post('/', blockController.Add);

//router.get('/:blockId', blockController.Get);

//router.delete('/:blockId', blockController.Delete);

router.get("/subscribe", blockController.SubscribeNewBlockHeaders);
router.get("/unsubscribe", blockController.UnsubscribeNewBlockHeaders);

module.exports = router;