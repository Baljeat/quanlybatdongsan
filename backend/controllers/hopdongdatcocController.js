const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');

// Models
const NhanVien = require('../models/NhanVienModel');
const KhachHang = require('../models/KhachHangModel');
const BatDongSan = require('../models/BatDongSanModel');
const HopDongDatCoc = require('../models/HopDongDatCocModel');
const HopDongChuyenNhuong = require('../models/HopDongChuyenNhuongModel');

// Cấu hình Dayjs cho múi giờ Việt Nam
dayjs.extend(utc);
dayjs.extend(timezone);
const VN_TZ = "Asia/Ho_Chi_Minh";

/**
 * 1. LẬP HỢP ĐỒNG ĐẶT CỌC
 */
exports.createHopDong = async (req, res) => {
    try {
        const { bdsid, khid, ngaylaphd, ngayhethan, giatri, kgid } = req.body;
        
        // Giữ nguyên cách lấy nvid_auth cũ
        const nvid = req.body.nvid_auth; 

        // 1. Giữ nguyên các kiểm tra bắt buộc cũ
        if (!kgid) return res.status(400).json({ message: 'Vui lòng chọn Hợp đồng ký gửi liên kết.' });
        if (!bdsid) return res.status(400).json({ message: 'Vui lòng chọn Bất động sản.' });
        if (!khid) return res.status(400).json({ message: 'Vui lòng chọn Khách hàng.' });
        if (!nvid) return res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ.' });

        const t = await sequelize.transaction();
        try {
            // 2. Kiểm tra tồn tại BĐS (Giữ nguyên)
            const bds = await BatDongSan.findByPk(bdsid);
            if (!bds) {
                await t.rollback();
                return res.status(404).json({ message: 'Không tìm thấy thông tin Bất động sản này.' });
            }

            // --- PHẦN SỬA MỚI: Giải thích chi tiết lý do ---
            if (bds.tinhtrang !== 0) {
                await t.rollback();
                
                let lyDo = 'Bất động sản này hiện không khả dụng để đặt cọc.';
                
                if (bds.tinhtrang === 1) {
                    lyDo = 'Bất động sản này đã được đặt cọc hoặc đang trong giao dịch.';
                } else if (bds.tinhtrang === 2) {
                    lyDo = 'Bất động sản này đã bán/giao dịch thành công.';
                } else {
                    // Giải thích chi tiết về việc thiếu ký gửi như bạn muốn
                    lyDo = 'Bất động sản này chưa có hợp đồng ký gửi hợp lệ hoặc chưa được duyệt để đưa vào kinh doanh.';
                }

                return res.status(400).json({ message: lyDo });
            }
            // --- KẾT THÚC PHẦN SỬA MỚI ---

            // 4. Giữ nguyên kiểm tra tiền cọc tối thiểu 10%
            const minDeposit = bds.dongia * 0.1;
            if (!giatri || giatri < minDeposit) {
                await t.rollback();
                return res.status(400).json({ 
                    message: `Số tiền đặt cọc tối thiểu là 10% giá trị BĐS (${minDeposit.toLocaleString()} đ).` 
                });
            }

            // 5. Giữ nguyên kiểm tra ngày lập phiếu (Ngày hiện tại)
            const todayStr = dayjs().tz(VN_TZ).format('YYYY-MM-DD');
            const inputDateStr = dayjs(ngaylaphd).format('YYYY-MM-DD');

            if (!ngaylaphd || inputDateStr !== todayStr) {
                await t.rollback();
                return res.status(400).json({ 
                    message: `Ngày lập phiếu phải là ngày hiện tại (${dayjs().tz(VN_TZ).format('DD/MM/YYYY')}).` 
                });
            }

            // 6. Giữ nguyên phần tạo Hợp đồng mới (Giữ nguyên các field cũ)
            const newContract = await HopDongDatCoc.create({
                nvid,       
                khid,       
                bdsid,      
                kgid,     
                ngaylaphd,
                ngayhethan,
                giatri,     
                tinhtrang: 1, // Giữ nguyên giá trị cũ của bạn mình
                trangthai: 1  
            }, { transaction: t });

            // 7. Cập nhật trạng thái BĐS (Giữ nguyên)
            await BatDongSan.update(
                { tinhtrang: 1 }, 
                { where: { bdsid }, transaction: t }
            );

            await t.commit();
            res.status(201).json({ 
                message: 'Lập phiếu đặt cọc thành công!', 
                legalNote: 'Theo khoản 2 Điều 328 Bộ luật Dân sự 2015: Nếu khách hàng vi phạm, số tiền đặt cọc thuộc về bên nhận đặt cọc.',
                data: newContract 
            });

        } catch (dbErr) {
            await t.rollback();
            throw dbErr;
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};



/**
 * 2. LẤY DANH SÁCH HỢP ĐỒNG
 */
exports.getAllHopDong = async (req, res) => {
    try {
        const { keyword } = req.query;
        let whereClause = {};

        if (keyword) {
            whereClause = {
                [Op.or]: [
                    { dcid: { [Op.like]: `%${keyword}%` } }, 
                    { '$KhachHang.hoten$': { [Op.like]: `%${keyword}%` } } 
                ]
            };
        }

        const list = await HopDongDatCoc.findAll({
            where: whereClause,
            include: [
                { model: BatDongSan, attributes: ['sonha', 'tenduong'] },
                { model: KhachHang, attributes: ['hoten','sdt'] },
                { model: NhanVien, attributes: ['tennv'] }
            ],
            order: [['dcid', 'ASC']]
        });

        res.json(list);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * 3. HỦY HỢP ĐỒNG (KIỂM TRA RÀNG BUỘC THỜI GIAN & PHÁP LÝ)
 */
exports.cancelHopDong = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { dcid } = req.params;
        
        const hd = await HopDongDatCoc.findByPk(dcid);
        if (!hd) {
            await t.rollback();
            return res.status(404).json({ message: 'Không tìm thấy hợp đồng.' });
        }

        // Ràng buộc 1: Kiểm tra liên kết Chuyển nhượng
        const checkLienKet = await HopDongChuyenNhuong.findOne({ where: { dcid } });
        if (checkLienKet) {
            await t.rollback();
            return res.status(400).json({ 
                message: 'Hợp đồng đang liên kết với Hợp đồng Chuyển nhượng. Không thể hủy!' 
            });
        }

        // Ràng buộc 2: Kiểm tra thời gian (Phải trễ hơn ngày hết hạn ít nhất 1 ngày)
        const now = dayjs().tz(VN_TZ).startOf('day');
        const expirationDate = dayjs(hd.ngayhethan).tz(VN_TZ).startOf('day');

        if (!now.isAfter(expirationDate, 'day')) {
            await t.rollback();
            return res.status(400).json({ 
                message: `Hợp đồng vẫn còn trong thời hạn ký kết (Hạn đến: ${expirationDate.format('DD/MM/YYYY')}). Chỉ được hủy khi khách hàng quá hạn 01 ngày và vi phạm hợp đồng.` 
            });
        }

        // Thực hiện hủy: Cập nhật tinhtrang về 0 và giải phóng BĐS
        await HopDongDatCoc.update(
            { tinhtrang: 0 }, 
            { where: { dcid }, transaction: t }
        );

        await BatDongSan.update(
            { tinhtrang: 0 }, 
            { where: { bdsid: hd.bdsid }, transaction: t }
        );

        await t.commit();
        res.json({ message: 'Hủy thành công và giải phóng BĐS. Theo Điều 328 BLDS, số tiền cọc được xử lý cho bên nhận cọc do khách vi phạm thời hạn.' });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: error.message });
    }
};