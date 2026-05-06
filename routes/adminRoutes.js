const express = require('express')
const {callNextToken, skipToken, blacklistUser, getDailyStats, resetQueue, queueHistory} = require('../controllers/adminController')
const {protect, adminOnly} = require('../middlewares/authMiddleware')

const router = express.Router();

router.post('/call-next', protect, adminOnly, callNextToken);
router.post('/skip', protect, adminOnly, skipToken);
router.post('/blacklist', protect, adminOnly, blacklistUser);
router.get('/stats/:queueId', protect, adminOnly, getDailyStats);
router.post('/reset/:queueId', protect, adminOnly, resetQueue);
router.get('/history/:queueId', protect, adminOnly, queueHistory);

module.exports = router;
