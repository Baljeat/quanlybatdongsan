// File: backend/controllers/hdChuyenNhuongController.js
const HopDongChuyenNhuong = require('../models/HopDongChuyenNhuongModel');
const { sequelize, Sequelize } = require('../config/db');

// 1. Mở màn hình & Tra cứu HĐCN
exports.getAll = async (req, res) => {
  try {
    const { keyword } = req.query;
    // Dùng query thuần để JOIN lấy thông tin Khách Hàng và BĐS cho dễ hiển thị lên Table
    let sql = `
      SELECT cn.*, kh.hoten as tenkhachhang, bds.masoqsdd, bds.tenduong 
      FROM hopdongchuyennhuong cn
      LEFT JOIN khachhang kh ON cn.khid = kh.khid
      LEFT JOIN batdongsan bds ON cn.bdsid = bds.bdsid
      WHERE 1=1
    `;
    if (keyword) {
      sql += ` AND kh.hoten LIKE '%${keyword}%'`;
    }
    const data = await sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách hợp đồng", error });
  }
};

// 1.1 Lấy danh sách HĐ Đặt cọc hợp lệ để tạo HĐ chuyển nhượng
exports.getHDDatCocHopLe = async (req, res) => {
  try {
    const sql = `
      SELECT 
        dc.dcid,
        dc.khid,
        dc.bdsid,
        dc.giatri,
        kh.hoten AS tenkhachhang,
        kh.sdt AS sdtkhachhang,
        bds.loaiid AS loaibds,
        bds.dientich,
        bds.masoqsdd,
        CONCAT_WS(', ', bds.sonha, bds.tenduong, bds.phuong, bds.quan, bds.thanhpho) AS diachibds
      FROM hopdongdatcoc dc
      LEFT JOIN khachhang kh ON dc.khid = kh.khid
      LEFT JOIN batdongsan bds ON dc.bdsid = bds.bdsid
      LEFT JOIN hopdongchuyennhuong cn ON cn.dcid = dc.dcid
      WHERE cn.dcid IS NULL
      ORDER BY dc.dcid DESC
    `;

    const data = await sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách hợp đồng đặt cọc", error });
  }
};

// 2. Thêm HĐCN (Tạo từ HĐ Đặt Cọc)
exports.create = async (req, res) => {
  try {
    const { khid, bdsid, dcid, giatri, ngaylap } = req.body;

    if (!khid || !bdsid || !dcid || !giatri || !ngaylap) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin hợp đồng!" });
    }

    const giatriNumber = Number(giatri);
    if (!Number.isFinite(giatriNumber) || giatriNumber <= 0) {
      return res.status(400).json({ message: "Giá trị hợp đồng không hợp lệ!" });
    }

    if (Number.isNaN(Date.parse(ngaylap))) {
      return res.status(400).json({ message: "Ngày lập hợp đồng không hợp lệ!" });
    }

    // Kiểm tra khách hàng hợp lệ
    const khachHang = await sequelize.query(
      `SELECT khid, sdt, trangthai FROM khachhang WHERE khid = :khid`,
      { replacements: { khid }, type: Sequelize.QueryTypes.SELECT }
    );
    if (khachHang.length === 0) {
      return res.status(400).json({ message: "Khách hàng không tồn tại!" });
    }
    if (khachHang[0].trangthai === 0) {
      return res.status(400).json({ message: "Khách hàng không còn hoạt động!" });
    }
    const sdtKhach = (khachHang[0].sdt || '').trim();
    if (!/^\d{9,15}$/.test(sdtKhach)) {
      return res.status(400).json({ message: "SĐT khách hàng không hợp lệ!" });
    }

    // Kiểm tra hợp đồng đặt cọc hợp lệ và chưa được chuyển nhượng
    const datCoc = await sequelize.query(
      `SELECT dc.dcid, dc.khid, dc.bdsid
       FROM hopdongdatcoc dc
       LEFT JOIN hopdongchuyennhuong cn ON cn.dcid = dc.dcid
       WHERE dc.dcid = :dcid AND cn.dcid IS NULL`,
      { replacements: { dcid }, type: Sequelize.QueryTypes.SELECT }
    );
    if (datCoc.length === 0) {
      return res.status(400).json({ message: "Hợp đồng đặt cọc không hợp lệ hoặc đã được chuyển nhượng!" });
    }
    if (Number(datCoc[0].khid) !== Number(khid) || Number(datCoc[0].bdsid) !== Number(bdsid)) {
      return res.status(400).json({ message: "Thông tin khách hàng hoặc bất động sản không khớp HĐ đặt cọc!" });
    }

    // Kiểm tra trùng lặp HĐ Đặt cọc (dcid là UNIQUE)
    const exist = await HopDongChuyenNhuong.findOne({ where: { dcid } });
    if (exist) {
      return res.status(400).json({ message: "Hợp đồng đặt cọc này đã được chuyển nhượng rồi!" });
    }

    // Lưu hợp đồng với trạng thái mặc định
    const newHD = await HopDongChuyenNhuong.create({
      khid,
      bdsid,
      dcid,
      giatri: giatriNumber,
      ngaylap,
      trangthai: true
    });

    // Cập nhật doanh thu cho nhân viên phụ trách khách hàng này (Ràng buộc số 10 trong PTTK)
    await sequelize.query(
      `UPDATE nhanvien nv 
       JOIN khachhang kh ON nv.nvid = kh.nvid 
       SET nv.doanhthu = nv.doanhthu + :giatri 
       WHERE kh.khid = :khid`,
      { replacements: { giatri: giatriNumber, khid }, type: Sequelize.QueryTypes.UPDATE }
    );

    res.status(201).json({ message: "Thêm Hợp đồng Chuyển nhượng thành công!", data: newHD });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm hợp đồng", error });
  }
};

// 3. Xóa HĐCN
exports.deleteHD = async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy dcid của HĐCN này để kiểm tra
    const hdcn = await HopDongChuyenNhuong.findByPk(id);
    if (!hdcn) return res.status(404).json({ message: "Không tìm thấy hợp đồng" });

    // Kiểm tra trạng thái thanh toán của HĐ Đặt cọc liên kết (Giả sử tinhtrang = 1 là chưa thanh toán xong)
    const checkDatCoc = await sequelize.query(
      `SELECT tinhtrang FROM hopdongdatcoc WHERE dcid = :dcid`,
      { replacements: { dcid: hdcn.dcid }, type: Sequelize.QueryTypes.SELECT }
    );

    if (checkDatCoc.length > 0 && checkDatCoc[0].tinhtrang === 1) {
      return res.status(400).json({ message: "Hợp đồng đặt cọc chưa thanh toán xong, từ chối xóa!" });
    }

    await HopDongChuyenNhuong.destroy({ where: { cnid: id } });
    res.json({ message: "Xóa Hợp đồng chuyển nhượng thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa hợp đồng", error });
  }
};

// 4. Xem thông tin BĐS (Phục vụ Modal Xem BĐS)
exports.getBDSInfo = async (req, res) => {
  try {
    const { bdsid } = req.params;
    const bds = await sequelize.query(
      `SELECT * FROM batdongsan WHERE bdsid = :bdsid`,
      { replacements: { bdsid }, type: Sequelize.QueryTypes.SELECT }
    );
    if (bds.length === 0) return res.status(404).json({ message: "Không tìm thấy BĐS" });
    res.json(bds[0]);
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error });
  }
};