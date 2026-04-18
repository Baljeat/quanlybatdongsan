const express = require('express');
const router = express.Router();
const {
  getKyGuis,
  createKyGui,
  getKyGuiById,
  updateKyGui,
  deleteKyGui,
  layDanhSachHieuLuc
} = require('../controllers/hopdongkyguiController');

router.get('/hieu-luc', layDanhSachHieuLuc);

router.route('/').get(getKyGuis).post(createKyGui);

router.route('/:id').get(getKyGuiById).put(updateKyGui).delete(deleteKyGui);

module.exports = router;
