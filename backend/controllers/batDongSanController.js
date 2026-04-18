const BatDongSan = require('../models/BatDongSan');

const getBatDongSans = async (req, res) => {
  try {
    const danhSachBDS = await BatDongSan.findAll();
    res.status(200).json(danhSachBDS);
  } catch (error) {
    console.error('Error in getBatDongSans:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách bất động sản.' });
  }
};

module.exports = { getBatDongSans };