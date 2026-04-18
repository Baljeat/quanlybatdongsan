const { Op } = require('sequelize');
const BatDongSan = require('../models/BatDongSan');

exports.getAllBDS = async (req, res) => {
    try {
        const listBDS = await BatDongSan.findAll();
        res.json(listBDS);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.traCuuBDS = async (req, res) => {
    try {
        const keyword = req.query.keyword;
        if (!keyword?.trim()) {
            return res.status(400).json({ message: "Vui lòng nhập từ khóa" });
        }
        const ketQua = await BatDongSan.findAll({
            where: {
                [Op.or]: [
                    { masoqsdd: { [Op.like]: `%${keyword}%` } },
                    { tenduong: { [Op.like]: `%${keyword}%` } }
                ]
            }
        });
        return res.json(ketQua);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.getBDSById = async (req, res) => {
    try {
        const bds = await BatDongSan.findByPk(req.params.id);
        if (!bds) return res.status(404).json({ message: "Không tìm thấy" });
        res.json(bds);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getHinhAnhBDS = async (req, res) => {
    try {
        const bds = await BatDongSan.findByPk(req.params.id, { attributes: ['hinhanh'] });
        if (!bds || !bds.hinhanh) {
            return res.status(404).json({ message: "Không có hình ảnh" });
        }

        const base64Image = Buffer.from(bds.hinhanh).toString('base64');
        const imageSrc = `data:image/jpeg;base64,${base64Image}`;
        res.json({ src: imageSrc });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateBDS = async (req, res) => {
    try {
        const { id } = req.params;
        const { masoqsdd, tenduong, dientich, dongia, hinhanh } = req.body;

        if (!masoqsdd || !tenduong || !dientich || !dongia) {
            return res.status(400).json({ message: "Thông tin bắt buộc không được để trống" });
        }

        const dataUpdate = { ...req.body };

        if (hinhanh && typeof hinhanh === 'string' && hinhanh.startsWith('data:')) {
            const base64Data = hinhanh.split(',')[1];
            dataUpdate.hinhanh = Buffer.from(base64Data, 'base64');
        }

        const [updated] = await BatDongSan.update(dataUpdate, { where: { bdsid: id } });
        if (updated) return res.json({ message: "Cập nhật thành công" });
        
        return res.status(404).json({ message: "Không tìm thấy bất động sản" });
    } catch (error) {
        res.status(500).json({ error: "Lỗi hệ thống khi cập nhật" });
    }
};