// File: frontend/src/pages/HopDongChuyenNhuong/ModalXemBDS.jsx
// Import React hooks và các thư viện cần thiết
import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, message, Spin } from 'antd';
import { hdChuyenNhuongService } from '../../services/hdChuyenNhuongService';

// Component modal xem chi tiết thông tin bất động sản
const ModalXemBDS = ({ open, bdsid, onClose }) => {
  // State lưu thông tin BĐS và trạng thái tải dữ liệu
  const [bdsInfo, setBdsInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Khi mở modal và có bdsid thì gọi API lấy thông tin BĐS
  useEffect(() => {
    if (open && bdsid) {
      setLoading(true);
      hdChuyenNhuongService.getBDSInfo(bdsid)
        .then(res => setBdsInfo(res.data))
        .catch(err => message.error("Lỗi tải thông tin BĐS"))
        .finally(() => setLoading(false));
    }
  }, [open, bdsid]);

  // Giao diện modal hiển thị thông tin chi tiết
  return (
    <Modal title="Thông tin chi tiết Bất Động Sản" open={open} onCancel={onClose} footer={null} width={600}>
      <Spin spinning={loading}>
        {/* Hiển thị thông tin nếu có dữ liệu, ngược lại báo không có */}
        {bdsInfo ? (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Mã BĐS">{bdsInfo.bdsid}</Descriptions.Item>
            <Descriptions.Item label="Loại BĐS (ID)">{bdsInfo.loaiid}</Descriptions.Item>
            <Descriptions.Item label="Mã Khách Hàng (ID)">{bdsInfo.khid}</Descriptions.Item>
            <Descriptions.Item label="Tình trạng">{bdsInfo.tinhtrang}</Descriptions.Item>
            <Descriptions.Item label="Diện tích">{bdsInfo.dientich} m2</Descriptions.Item>
            <Descriptions.Item label="Đơn giá">{bdsInfo.dongia?.toLocaleString()} đ</Descriptions.Item>
            <Descriptions.Item label="Mã số QSDD">{bdsInfo.masoqsdd}</Descriptions.Item>
            <Descriptions.Item label="Mô tả">{bdsInfo.mota}</Descriptions.Item>
            <Descriptions.Item label="Hình ảnh">{bdsInfo.hinhanh ? 'Có' : 'Không'}</Descriptions.Item>
            <Descriptions.Item label="Chiều dài">{bdsInfo.chieudai}</Descriptions.Item>
            <Descriptions.Item label="Chiều rộng">{bdsInfo.chieurong}</Descriptions.Item>
            <Descriptions.Item label="Huê hồng">{bdsInfo.huehong}</Descriptions.Item>
            <Descriptions.Item label="Số nhà">{bdsInfo.sonha}</Descriptions.Item>
            <Descriptions.Item label="Tên đường">{bdsInfo.tenduong}</Descriptions.Item>
            <Descriptions.Item label="Phường">{bdsInfo.phuong}</Descriptions.Item>
            <Descriptions.Item label="Quận">{bdsInfo.quan}</Descriptions.Item>
            <Descriptions.Item label="Thành phố">{bdsInfo.thanhpho}</Descriptions.Item>
          </Descriptions>
        ) : (
          <p>Không có dữ liệu</p>
        )}
      </Spin>
    </Modal>
  );
};

export default ModalXemBDS;