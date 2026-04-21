const express = require('express');
const {joinQueue, cancleToken, cancelToken} = require('../controllers/queueController');
const {protect} = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/join', protect, joinQueue);
router.delete('/cancel/:id', protect, cancelToken);

module.exports = router;