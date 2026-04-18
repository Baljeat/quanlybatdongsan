// File: backend/routes/nhanVienRoutes.js
const express = require('express');
const router = express.Router();
const nhanVienController = require('../controllers/nhanVienController');

router.get('/', nhanVienController.getAllNhanVien);
router.post('/', nhanVienController.createNhanVien);
router.put('/:id', nhanVienController.updateNhanVien);
router.delete('/:id', nhanVienController.deleteNhanVien);

module.exports = router;