const NhanVien = require('../models/NhanVienModel');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES || '1h';
if (!JWT_SECRET) {
    console.error("CRITICAL ERROR: JWT_SECRET is not defined in .env file");
    process.exit(1); // Dừng server nếu thiếu cấu hình quan trọng
}

const getRoleName = (quyen) => {
    return Number(quyen) === 1 ? 'admin' : 'nhanvien';
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await NhanVien.findOne({ 
      where: {
        [Op.or] : [{ email: email }, { taikhoan: email }]
      }
    });

    if (!user || String(user.matkhau) !== String(password)) {
      return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
    }

    const roleName = getRoleName(user.quyen);
    console.log(`>>> Login thành công: ${user.tennv} - Role: ${roleName}`);

    const payload = { id: user.nvid, email: user.email, role: roleName };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    return res.json({
      token,
      user: {
        id: user.nvid,
        tennv: user.tennv,
        email: user.email,
        role: roleName
      }
    });
  } catch (error) {
    console.error("Lỗi Login:", error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu' });

    const exist = await NhanVien.findOne({ 
      where: { [Op.or]: [{ email }, { taikhoan: email }] } 
    });
    
    if (exist) return res.status(400).json({ message: 'Email hoặc tài khoản đã tồn tại' });

    const newUser = await NhanVien.create({
      taikhoan: email,
      matkhau: password,
      tennv: String(email).split('@')[0],
      email,
      gioitinh: 0,
      quyen: 0, // Mặc định là nhân viên
      trangthai: 1
    });

    return res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi đăng ký', error: error.message });
  }
};

exports.logout = async (req, res) => {
  res.json({ message: 'Đã đăng xuất' });
};

// --- fix lỗi 500 ---
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await NhanVien.findByPk(decoded.id);
    if (!user) return res.status(401).json({ message: 'Người dùng không tồn tại' });

    // QUAN TRỌNG: Phải dùng hàm getRoleName ở đây luôn để đồng bộ với Login
    req.user = { 
        id: user.nvid, 
        tennv: user.tennv, 
        email: user.email, 
        role: getRoleName(user.quyen) 
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token hết hạn', error: err.message });
  }
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ Admin mới có quyền này' });
  }
  next();
};

exports.me = (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Chưa đăng nhập' });
  res.json({ user: req.user });
};