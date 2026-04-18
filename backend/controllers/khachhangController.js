const dayjs = require('dayjs');
const { Op } = require('sequelize');
const NhanVien = require('../models/NhanVienModel');
const KhachHang = require('../models/KhachHangModel');
const Batdongsan = require('../models/BatDongSanModel'); 
const HopDongDatCoc = require('../models/HopDongDatCocModel');

// --- HÀM VALIDATE CẬP NHẬT LOGIC ĐỘ TUỔI ---
const validateCustomer = (data) => {
    const { hoten, sdt, cmnd, email, ngaysinh } = data;
    
    // 1. Kiểm tra các trường bắt buộc
    if (!hoten || !sdt || !cmnd || !ngaysinh) return "Họ tên, SĐT, CMND và Ngày sinh là bắt buộc.";
    
    // 2. Định dạng SĐT: Phải hoàn toàn là số, từ 9-11 chữ số
    if (!/^\d{9,11}$/.test(String(sdt))) return "Số điện thoại phải từ 9-11 chữ số.";
    
    // 3. Định dạng Email: Kiểm tra chặt chẽ hơn
    // Nếu có nhập email thì phải đúng định dạng
    if (email && email.trim() !== "") {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) return "Định dạng Email không hợp lệ (Thiếu @ hoặc tên miền).";
    }
    
    // 4. Định dạng CMND/CCCD: 9 hoặc 12 số
    if (!/^\d{9}$|^\d{12}$/.test(cmnd)) return "CMND phải là dãy số 9 hoặc 12 ký tự.";

    // 5. LOGIC ĐỘ TUỔI
    const birthDate = dayjs(ngaysinh);
    const today = dayjs();
    const age = today.diff(birthDate, 'year');

    if (!birthDate.isValid()) return "Ngày sinh không hợp lệ.";
    
    if (birthDate.isAfter(today) || birthDate.isSame(today, 'day')) {
        return "Ngày sinh không được là ngày hiện tại hoặc tương lai.";
    }

    if (age < 15) {
        return "Khách hàng chưa đủ 15 tuổi, không thể đăng ký thông tin trên hệ thống.";
    }

    if (age > 120) {
        return "Ngày sinh không thực tế (vượt quá 120 tuổi).";
    }

    return null;
};

// --- CÁC HÀM XỬ LÝ ---

// 1. Lấy danh sách (Giữ nguyên logic tìm kiếm tốt)
exports.getAllKhachHang = async (req, res) => {
    try {
        const { keyword, trangthai, gioitinh } = req.query;
        let where = {};

        // Xử lý tìm kiếm từ khóa
        if (keyword?.trim()) {
            const s = `%${keyword.trim()}%`;
            where[Op.or] = [
                { hoten: { [Op.like]: s } },
                { cmnd: { [Op.like]: s } },
                { sdt: { [Op.like]: s } },
                { email: { [Op.like]: s } }
            ];
        }

        if (trangthai !== undefined && trangthai !== "") {
            where.trangthai = Number(trangthai);
        }
        if (gioitinh !== undefined && gioitinh !== "") {
            where.gioitinh = Number(gioitinh);
        }

        const data = await KhachHang.findAll({ 
            where, 
            include: [{ 
                model: NhanVien, 
                attributes: ['tennv'] 
            }],
            order: [['khid', 'ASC']] 
        });

        res.json(data);
    } catch (err) {
        // Log lỗi chi tiết để bạn dễ debug
        console.error("Lỗi getAllKhachHang:", err);
        res.status(500).json({ 
            message: 'Lỗi hệ thống', 
            error: err.message 
        });
    }
};

// 2. Thêm mới (Tích hợp thông báo phân loại độ tuổi)
exports.createKhachHang = async (req, res) => {
    try {
        // Gọi hàm validate
        const errorMsg = validateCustomer(req.body);
        if (errorMsg) return res.status(400).json({ message: errorMsg });

        // Kiểm tra trùng CMND
        const existing = await KhachHang.findOne({ where: { cmnd: req.body.cmnd } });
        if (existing) return res.status(400).json({ message: 'Số CMND đã tồn tại!' });

        const { ngaysinh } = req.body;
        const age = dayjs().diff(dayjs(ngaysinh), 'year');

        // Thực hiện tạo mới
        const newKH = await KhachHang.create({ 
            ...req.body, 
            trangthai: 1 
        });

        // Phân loại thông báo dựa trên độ tuổi (15-18 hoặc trên 18)
        let responseMsg = "Thêm khách hàng thành công!";
        if (age >= 15 && age < 18) {
            responseMsg = "Thành công! Lưu ý: Khách hàng từ 15-18 tuổi cần văn bản đồng ý của người giám hộ khi giao dịch.";
        }

        res.status(201).json({ message: responseMsg, data: newKH });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// 3. Xóa mềm (Ràng buộc chặt chẽ theo sơ đồ AD_HDDC_02) 
exports.deleteKhachHang = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra sở hữu BĐS (Ràng buộc nhánh 1 trong AD_Xoa) [cite: 21]
        const holdsBDS = await Batdongsan.findOne({ where: { khid: id } });
        if (holdsBDS) {
            return res.status(400).json({ message: 'Khách hàng đang đứng tên Bất động sản ký gửi, không thể xóa!' });
        }

        // Kiểm tra HĐ đặt cọc (Ràng buộc nhánh 2 trong AD_Xoa) [cite: 23]
        const holdsContract = await HopDongDatCoc.findOne({ where: { khid: id, tinhtrang: 1 } });
        if (holdsContract) {
            return res.status(400).json({ message: 'Khách hàng đang có hợp đồng đặt cọc còn hiệu lực!' });
        }

        await KhachHang.update({ trangthai: 0 }, { where: { khid: id } });
        res.json({ message: 'Đã chuyển trạng thái sang Ngưng hoạt động' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi hệ thống khi xóa', error: err.message });
    }
};

// 4. Cập nhật & Chi tiết
exports.updateKhachHang = async (req, res) => {
    try {
        const { id } = req.params;
        const errorMsg = validateCustomer(req.body);
        if (errorMsg) return res.status(400).json({ message: errorMsg });

        await KhachHang.update(req.body, { where: { khid: id } });
        res.json({ message: 'Cập nhật thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi cập nhật', error: err.message });
    }
};

exports.getKhachHangById = async (req, res) => {
    try {
        const data = await KhachHang.findByPk(req.params.id);
        data ? res.json(data) : res.status(404).json({ message: 'Không tìm thấy' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};