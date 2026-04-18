// File: frontend/src/pages/HopDongChuyenNhuong/index.jsx
// Import React hooks và các thư viện cần thiết
import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Input, Space, message, Popconfirm } from 'antd';
import { SearchOutlined, PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { hdChuyenNhuongService } from '../../services/hdChuyenNhuongService';
import dayjs from 'dayjs';

// Import các Modal (Mình đã chia nhỏ thành các file riêng biệt)
import ModalThemHD from './ModalThemHD';
import ModalXemBDS from './ModalXemBDS';

// Component quản lý hợp đồng chuyển nhượng
const HopDongChuyenNhuong = () => {
  // State dữ liệu bảng và trạng thái tải
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  
  // States cho Modals
  const [isThemVisible, setIsThemVisible] = useState(false);
  const [isXemBDSVisible, setIsXemBDSVisible] = useState(false);
  const [selectedBDSId, setSelectedBDSId] = useState(null);

  // Hàm lấy danh sách hợp đồng (có thể lọc theo từ khóa)
  const fetchContracts = async (keyword = "") => {
    setLoading(true);
    try {
      const res = await hdChuyenNhuongService.getAll(keyword);
      setData(res.data);
    } catch (error) {
      message.error("Lỗi lấy danh sách hợp đồng");
    }
    setLoading(false);
  };

  // Gọi dữ liệu lần đầu khi trang vừa được mở
  useEffect(() => { fetchContracts(); }, []);

  // Xử lý tra cứu theo tên khách hàng
  const handleSearch = () => {
    if (!searchText) message.warning("Vui lòng nhập tên khách hàng để tra cứu!");
    fetchContracts(searchText);
  };

  // Xử lý xóa hợp đồng theo mã
  const handleDelete = async (id) => {
    try {
      await hdChuyenNhuongService.delete(id);
      message.success("Xóa hợp đồng chuyển nhượng thành công!");
      fetchContracts();
    } catch (error) {
      if(error.response) message.error(error.response.data.message);
    }
  };

  // Mở modal xem thông tin bất động sản
  const openXemBDS = (bdsid) => {
    setSelectedBDSId(bdsid);
    setIsXemBDSVisible(true);
  };

  // Cấu hình cột cho bảng hiển thị
  const columns = [
    { title: 'Mã HĐ', dataIndex: 'cnid', key: 'cnid' },
    { title: 'Khách hàng', dataIndex: 'tenkhachhang', key: 'tenkhachhang' },
    { title: 'Bất động sản', dataIndex: 'tenduong', key: 'tenduong' },
    { title: 'Giá trị', dataIndex: 'giatri', render: (val) => val.toLocaleString() + ' đ' },
    { title: 'Ngày lập', dataIndex: 'ngaylap', render: (val) => dayjs(val).format('DD/MM/YYYY') },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} onClick={() => openXemBDS(record.bdsid)}>Xem BĐS</Button>
          <Popconfirm title="Xóa hợp đồng này?" onConfirm={() => handleDelete(record.cnid)}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Giao diện chính của trang
  return (
    <Card 
      title="Quản Lý Hợp Đồng Chuyển Nhượng" 
      extra={
        <Space>
          <Input placeholder="Tìm tên khách hàng..." value={searchText} onChange={e => setSearchText(e.target.value)} />
          <Button icon={<SearchOutlined />} onClick={handleSearch}>Tra cứu</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsThemVisible(true)}>Thêm Mới</Button>
        </Space>
      }
    >
      {/* Bảng danh sách hợp đồng */}
      <Table dataSource={data} columns={columns} rowKey="cnid" loading={loading} />

      {/* Tách riêng Modal để Code App chính không bị quá dài */}
      <ModalThemHD 
        open={isThemVisible} 
        onClose={() => setIsThemVisible(false)} 
        onSuccess={() => fetchContracts()} 
      />

      <ModalXemBDS 
        open={isXemBDSVisible} 
        bdsid={selectedBDSId} 
        onClose={() => setIsXemBDSVisible(false)} 
      />
    </Card>
  );
};

export default HopDongChuyenNhuong;