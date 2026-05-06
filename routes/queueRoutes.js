const express = require('express');
const {listQueues, joinQueue, cancelToken, trackMyToken} = require('../controllers/queueController');
const {protect} = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/list', listQueues);
router.get('/track', protect, trackMyToken);
router.post('/join', protect, joinQueue);
router.delete('/cancel/:id', protect, cancelToken);

module.exports = router;