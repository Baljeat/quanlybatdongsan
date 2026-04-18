import React, { useState } from 'react';
import { Modal, Input, Button, message } from 'antd';
import api from '../services/api';

const TraCuuBDS = ({ visible, onCancel, onSearchSuccess }) => {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    if (!keyword.trim()) {
      return message.warning("Vui lòng nhập thông tin tra cứu!");
    }

    setLoading(true);
    api.get(`/batdongsan/tra-cuu?keyword=${keyword}`)
      .then(res => {
        if (Array.isArray(res.data) && res.data.length === 0) {
          message.info("Không tìm thấy bất động sản");
          return;
        }

        onSearchSuccess(res.data);
      })
      .catch(() => { 
        message.info("Không tìm thấy kết quả phù hợp");
    })
      .finally(() => setLoading(false));
  };

  const handleCancel = () => {
    setKeyword('');
    onCancel();
  };

  return (
    <Modal
      title="BIỂU MẪU TRA CỨU"
      open={visible}
      onCancel={handleCancel}
      footer={null} 
    >
      <div style={{ padding: '20px 0' }}>
        <p>Nhập thông tin BĐS cần tra cứu (Mã số QSDĐ hoặc Tên đường):</p>
        <Input 
          placeholder="Ví dụ: QSD12345 hoặc Cách Mạng Tháng 8..." 
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={handleSearch}
          style={{ marginBottom: 20 }}
        />
        <div style={{ textAlign: 'right' }}>
          <Button onClick={handleCancel} style={{ marginRight: 10 }}>
            Hủy bỏ
          </Button>
          <Button 
            type="primary" 
            onClick={handleSearch} 
            loading={loading}
          >
            Tìm kiếm
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TraCuuBDS;