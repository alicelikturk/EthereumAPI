const express = require('express');
const router = express.Router();
const blockController = require('../controllers/blockController');

 /**
  * @swagger
  * tags:
  *   name: Blocks
  *   description: The block managing API
  */

//router.get('/', blockController.List);

//router.post('/', blockController.Add);

//router.get('/:blockId', blockController.Get);

//router.delete('/:blockId', blockController.Delete);

/**
 * @swagger
 * /blocks/subscribe:
 *   get:
 *     summary: Subscribe the new block notification
 *     tags: [Blocks]
 *     description: Subscribe the new block notification
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/subscribe", blockController.SubscribeNewBlockHeaders);
/**
 * @swagger
 * /blocks/unsubscribe:
 *   get:
 *     summary: Unsubscribe the new block notification
 *     tags: [Blocks]
 *     description: Unsubscribe the new block notification
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/unsubscribe", blockController.UnsubscribeNewBlockHeaders);
/**
 * @swagger
 * /blocks/latest:
 *   get:
 *     summary: Get latest block
 *     tags: [Blocks]
 *     description: Get latest block
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/latest", blockController.GetLatestBlock);

module.exports = router;