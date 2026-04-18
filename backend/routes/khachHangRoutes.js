const express = require('express');
const router = express.Router();
// Sửa lại tên import để tránh lỗi hoa/thường trên Linux/Mac
const khachHangController = require('../controllers/khachHangController');

router.get('/', khachHangController.getAllKhachHang);
router.post('/', khachHangController.createKhachHang);
router.put('/:id', khachHangController.updateKhachHang);
router.delete('/:id', khachHangController.deleteKhachHang);

module.exports = router;
