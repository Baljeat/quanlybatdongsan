const express = require('express');
const router = express.Router();
const hopDongController = require('../controllers/hopdongdatcocController');

router.post('/', hopDongController.createHopDong);
router.get('/', hopDongController.getAllHopDong);
router.delete('/:dcid', hopDongController.cancelHopDong);
module.exports = router;