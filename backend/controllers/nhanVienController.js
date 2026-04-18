const NhanVien = require('../models/NhanVienModel');
const sequelize = require('../config/db'); 

exports.getAllNhanVien = async (req, res) => {
  try {
    const { keyword } = req.query; 
    let condition = {};
    if (keyword) {
      condition = { tennv: { [require('sequelize').Op.like]: `%${keyword}%` } };
    }
    const data = await NhanVien.findAll({ where: condition });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

exports.createNhanVien = async (req, res) => {
  try {
    const { taikhoan, matkhau, tennv, sdt, diachi, ngaysinh, email, gioitinh, quyen, trangthai } = req.body;
    
    // Kiểm tra tất cả các trường không được rỗng (ngoại trừ doanhthu)
    // Dùng !== undefined cho các trường kiểu số/boolean vì giá trị 0 dễ bị hiểu nhầm là rỗng
    if (!taikhoan || !matkhau || !tennv || !sdt || !diachi || !ngaysinh || !email || 
        gioitinh === undefined || quyen === undefined || trangthai === undefined) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin nhân viên (chỉ doanh thu được để trống)!" });
    }

    const exist = await NhanVien.findOne({ where: { taikhoan } });
    if (exist) {
      return res.status(400).json({ message: "Tài khoản đã tồn tại" });
    }

    const newNV = await NhanVien.create(req.body);
    res.status(201).json({ message: "Thêm thành công", data: newNV });
  } catch (error) {
    res.status(500).json({ message: "Lỗi thêm nhân viên", error });
  }
};

exports.updateNhanVien = async (req, res) => {
  try {
    const { id } = req.params;
    const { taikhoan, matkhau, tennv, sdt, diachi, ngaysinh, email, gioitinh, quyen, trangthai } = req.body;

    // 1. Kiểm tra các trường bắt buộc (Không kiểm tra matkhau ở đây)
    if (!taikhoan || !tennv || !sdt || !diachi || !ngaysinh || !email || 
        gioitinh === undefined || quyen === undefined || trangthai === undefined) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin nhân viên!" });
    }

    // 2. Kiểm tra trùng lặp tài khoản
    const exist = await NhanVien.findOne({ where: { taikhoan } });
    if (exist && exist.nvid != id) {
      return res.status(400).json({ message: "Tài khoản này đã tồn tại (bị trùng lặp)!" });
    }

    // 3. XỬ LÝ LOGIC MẬT KHẨU
    // Tạo một bản sao của req.body để tránh can thiệp trực tiếp
    const updateData = { ...req.body }; 
    
    // Nếu mật khẩu bị bỏ trống (chuỗi rỗng), ta xóa luôn key này khỏi dữ liệu cập nhật
    // Khi đó Sequelize sẽ bỏ qua cột matkhau, giữ nguyên mật khẩu cũ trong DB.
    if (!matkhau || matkhau.trim() === "") {
      delete updateData.matkhau;
    }

    // 4. Cập nhật vào DB
    await NhanVien.update(updateData, { where: { nvid: id } });
    res.json({ message: "Cập nhật thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật", error });
  }
};

// Xóa Nhân Viên (Sửa lại theo chuẩn sơ đồ tuần tự)
exports.deleteNhanVien = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Kiểm tra Bất Động Sản (Nhân viên có đang phụ trách BĐS nào không?)
    const checkBDS = await sequelize.query(
      `SELECT COUNT(b.bdsid) as count 
       FROM batdongsan b 
       JOIN khachhang kh ON b.khid = kh.khid 
       WHERE kh.nvid = :id`,
      { replacements: { id }, type: sequelize.QueryTypes.SELECT }
    );
    if (checkBDS[0].count > 0) {
      return res.status(400).json({ message: "Không thể xóa! Nhân viên này đang phụ trách Bất động sản của khách hàng." });
    }

    // 2. Kiểm tra Hợp Đồng Ký Gửi
    const checkKyGui = await sequelize.query(
      `SELECT COUNT(kg.kgid) as count 
       FROM hopdongkygui kg 
       JOIN khachhang kh ON kg.khid = kh.khid 
       WHERE kh.nvid = :id`,
      { replacements: { id }, type: sequelize.QueryTypes.SELECT }
    );
    if (checkKyGui[0].count > 0) {
      return res.status(400).json({ message: "Không thể xóa! Nhân viên đang phụ trách khách hàng có Hợp đồng ký gửi." });
    }

    // 3. Kiểm tra Hợp Đồng Chuyển Nhượng
    const checkChuyenNhuong = await sequelize.query(
      `SELECT COUNT(cn.cnid) as count 
       FROM hopdongchuyennhuong cn 
       JOIN khachhang kh ON cn.khid = kh.khid 
       WHERE kh.nvid = :id`,
      { replacements: { id }, type: sequelize.QueryTypes.SELECT }
    );
    if (checkChuyenNhuong[0].count > 0) {
      return res.status(400).json({ message: "Không thể xóa! Nhân viên đang phụ trách khách hàng có Hợp đồng chuyển nhượng." });
    }

    // 5. Nếu vượt qua TẤT CẢ các vòng kiểm tra trên -> Tiến hành xóa thật
    const deletedRows = await NhanVien.destroy({ where: { nvid: id } });
    
    // Đề phòng trường hợp Frontend gửi ID ảo không có trong Database
    if (deletedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên này trong CSDL để xóa!" });
    }
    
    res.json({ message: "Xóa nhân viên thành công!" });
  } catch (error) {
    console.error("Lỗi SQL khi xóa:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi xóa", error });
  }
};