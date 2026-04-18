import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Spin, Tag, Button } from 'antd';
import { getChiTietBDS } from '../services/api';

const FormChiTietBDS = ({ bdsId, visible, onCancel }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (visible && bdsId) {
        setLoading(true);
        try {
          const res = await getChiTietBDS(bdsId);
          setData(res.data);
        } catch (err) {
          console.error("Lỗi lấy chi tiết:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();

    if (!visible) {
      setData(null);
    }
  }, [visible, bdsId]);

  return (
    <Modal
      title="BIỂU MẪU CHI TIẾT BẤT ĐỘNG SẢN"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>Thoát</Button>
      ]}
      width={700}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <Spin tip="Đang tải dữ liệu..." />
        </div>
      ) : data ? (
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Mã số QSDĐ" span={2}>
            <Tag color="blue">{data.masoqsdd}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Tên đường" span={2}>{data.tenduong}</Descriptions.Item>
          <Descriptions.Item label="Diện tích">{data.dientich} m²</Descriptions.Item>
          <Descriptions.Item label="Đơn giá">{data.dongia?.toLocaleString()} VNĐ</Descriptions.Item>
          <Descriptions.Item label="Kích thước">{`Dài ${data.chieudai}m x Rộng ${data.chieurong}m`}</Descriptions.Item>
          <Descriptions.Item label="Huê hồng">{data.huehong}%</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ" span={2}>
            {`${data.sonha}, ${data.phuong}, ${data.quan}, ${data.thanhpho}`}
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả" span={2}>{data.mota || "Chưa có mô tả."}</Descriptions.Item>
        </Descriptions>
      ) : (
        <p style={{ textAlign: 'center' }}>Đang đợi dữ liệu...</p>
      )}
    </Modal>
  );
};

export default FormChiTietBDS;