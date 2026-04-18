const express = require('express');
const router = express.Router();
const BatDongSan = require('../models/BatDongSanModel');

// API lấy danh sách BĐS còn trống (tinhtrang = 0)
router.get('/', async (req, res) => {
    try {
        const list = await BatDongSan.findAll({
            where: { tinhtrang: 0 } // Chỉ lấy những căn chưa bán/chưa cọc
        });
        res.json(list);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách BĐS', error: error.message });
    }
});

module.exports = router;