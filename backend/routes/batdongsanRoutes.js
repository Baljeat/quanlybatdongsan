const express = require('express');
const router = express.Router();
const bdsController = require('../controllers/batDongSanControllers');

router.get('/', bdsController.getAllBDS);
router.get('/tra-cuu', bdsController.traCuuBDS);
router.get('/hinh-anh/:id', bdsController.getHinhAnhBDS);
router.get('/:id', bdsController.getBDSById);
router.put('/:id', bdsController.updateBDS); 

module.exports = router;