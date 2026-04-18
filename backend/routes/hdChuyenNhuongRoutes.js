// File: backend/routes/hdChuyenNhuongRoutes.js
const express = require('express');
const router = express.Router();
const hdController = require('../controllers/hdChuyenNhuongController');

router.get('/', hdController.getAll);
router.get('/hopdongdatcoc', hdController.getHDDatCocHopLe);
router.post('/', hdController.create);
router.delete('/:id', hdController.deleteHD);
router.get('/bds/:bdsid', hdController.getBDSInfo);

module.exports = router;