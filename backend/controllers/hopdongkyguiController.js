const KyGui = require('../models/HopDongKyGuiModel');
const BatDongSan = require('../models/BatDongSanModel');
const KhachHang = require('../models/KhachHangModel');

const getKyGuis = async (req, res) => {
  try {
    const kyGuis = await KyGui.findAll();
    res.status(200).json(kyGuis);
  } catch (error) {
    console.error('Error in getKyGuis:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu ký gửi.' });
  }
};
const layDanhSachHieuLuc = async (req, res) => {
    try {
        const danhSach = await KyGui.findAll({
            where: { trangthai: 1 }, // Chỉ lấy cái còn hiệu lực để đặt cọc
            include: [
                { model: BatDongSan },
                { model: KhachHang }
            ]
        });
        res.status(200).json(danhSach);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách hiệu lực" });
    }
};
const getKyGuiById = async (req, res) => {
  try {
    const { id } = req.params;
    const kyGui = await KyGui.findByPk(id, {
      include: 
      [{ model: BatDongSan }, 
      { model: KhachHang }]
    });
    if (kyGui) {
      res.status(200).json(kyGui);
    } else {
      res.status(404).json({ message: 'Không tìm thấy hợp đồng ký gửi.' });
    }
  } catch (error) {
    console.error('Error in getKyGuiById:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu hợp đồng.' });
  }
};

const createKyGui = async (req, res) => {
  try {
    const { khid, bdsid, giatri, chiphidv, ngaybatdau } = req.body;

    if (!khid || !bdsid || giatri === undefined || chiphidv === undefined || !ngaybatdau) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ các trường bắt buộc.' });
    }

    const newKyGui = await KyGui.create(req.body);

    res.status(201).json({ message: 'Tạo hợp đồng ký gửi thành công!', data: newKyGui });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      if (error.sqlMessage.includes('khachhang')) {
        return res.status(400).json({ message: 'Mã Khách Hàng không tồn tại trong hệ thống. Vui lòng kiểm tra lại!' });
      } else if (error.sqlMessage.includes('bdsid')) {
        return res.status(400).json({ message: 'Mã Bất Động Sản không tồn tại trong hệ thống. Vui lòng kiểm tra lại!' });
      }
      return res.status(400).json({ message: 'Dữ liệu tham chiếu không tồn tại (Mã KH hoặc Mã BĐS bị sai).' });
    }
    console.error('Error in createKyGui:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo hợp đồng ký gửi.' });
  }
};

const updateKyGui = async (req, res) => {
  try {
    const { id } = req.params;
    const { khid, bdsid, giatri, chiphidv, ngaybatdau } = req.body;

    const existingKyGui = await KyGui.findByPk(id);
    if (!existingKyGui) {
      return res.status(404).json({ message: 'Không tìm thấy hợp đồng ký gửi để cập nhật.' });
    }

    if (!khid || !bdsid || giatri === undefined || chiphidv === undefined || !ngaybatdau) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ các trường bắt buộc.' });
    }

    await KyGui.update(req.body, { where: { kgid: id } });
    res.status(200).json({ message: 'Cập nhật hợp đồng ký gửi thành công.' });

  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      if (error.sqlMessage.includes('khachhang')) {
        return res.status(400).json({ message: 'Mã Khách Hàng không tồn tại trong hệ thống. Vui lòng kiểm tra lại!' });
      } else if (error.sqlMessage.includes('bdsid')) {
        return res.status(400).json({ message: 'Mã Bất Động Sản không tồn tại trong hệ thống. Vui lòng kiểm tra lại!' });
      }
      return res.status(400).json({ message: 'Dữ liệu tham chiếu không tồn tại (Mã KH hoặc Mã BĐS bị sai).' });
    }
    console.error('Error in updateKyGui:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật hợp đồng ký gửi.' });
  }
};

const deleteKyGui = async (req, res) => {
  try {
    const { id } = req.params;

    // Bước 1: Lấy thông tin hợp đồng để kiểm tra.
    const kyGuiToDelete = await KyGui.findByPk(id);
    if (!kyGuiToDelete) {
      return res.status(404).json({ message: 'Không tìm thấy hợp đồng ký gửi để xóa.' });
    }

    // Bước 2: Validation - Kiểm tra hợp đồng có còn hiệu lực không.
    if (String(kyGuiToDelete.trangthai) === '1') {
      return res.status(400).json({ message: 'Không thể xóa hợp đồng đang còn hiệu lực. Vui lòng cập nhật trạng thái sang "Đã hết hạn" hoặc "Đã hủy" trước.' });
    }

    // Bước 3: Nếu mọi kiểm tra đều qua, tiến hành xóa.
    await KyGui.destroy({ where: { kgid: id } });
    res.status(200).json({ message: 'Xóa hợp đồng ký gửi thành công.' });
  } catch (error) {
    console.error('Error in deleteKyGui:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa hợp đồng ký gửi.' });
  }
};

module.exports = {
  getKyGuis,
  layDanhSachHieuLuc,
  getKyGuiById,
  createKyGui,
  updateKyGui,
  deleteKyGui,
};