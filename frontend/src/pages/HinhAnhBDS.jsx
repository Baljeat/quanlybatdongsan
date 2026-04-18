import React, { useState, useEffect } from 'react';
import { Modal, Image, Spin, Empty } from 'antd';
import api from '../services/api';

const HinhAnhBDS = ({ bdsId, visible, onCancel }) => {
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  if (visible && bdsId) {
    api.get(`/batdongsan/hinh-anh/${bdsId}`)
      .then(res => setImgSrc(res.data.src))
      .catch(() => setImgSrc(null))
      .finally(() => setLoading(false));
  }
}, [visible, bdsId]);

  return (
    <Modal
      title="HÌNH ẢNH CHI TIẾT"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>
      ) : imgSrc ? (
        <Image src={imgSrc} width="100%" />
      ) : (
        <Empty description="Bất động sản này chưa có hình ảnh" />
      )}
    </Modal>
  );
};

export default HinhAnhBDS;