import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Card, Row, Col, Typography, App, Space, Popconfirm, Modal, Descriptions, Input, Alert } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import axios from 'axios';

const { Title, Text } = Typography;

const HopdongMain = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedHD, setSelectedHD] = useState(null);
  const navigate = useNavigate();

  const { notification: notify } = App.useApp();

  const fetchHopDongs = async (keyword = '') => {
    setLoading(true);
    try {
      const url = keyword 
        ? `http://localhost:3000/api/hopdong?keyword=${keyword}` 
        : 'http://localhost:3000/api/hopdong';
      const res = await axios.get(url);
      setData(res.data || []);
    } catch (error) {
      notify.error({ message: 'Lỗi hệ thống', description: 'Không thể tải danh sách.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchText.trim()) {
      notify.warning({ message: 'Thông báo', description: 'Chưa nhập tiêu chí tra cứu' });
      return;
    }
    fetchHopDongs(searchText);
  };

  const handleReset = () => {
    setSearchText('');
    fetchHopDongs();
  };

  useEffect(() => {
    fetchHopDongs();
  }, []);

  const handleCancel = async (dcid) => {
    try {
      setLoading(true);
      const res = await axios.delete(`http://localhost:3000/api/hopdong/${dcid}`);
      notify.success({ message: 'Thành công', description: res.data.message, duration: 6 });
      fetchHopDongs();
    } catch (error) {
      const serverMessage = error.response?.data?.message || 'Không thể chấm dứt hợp đồng.';
      notify.error({ message: 'Lỗi nghiệp vụ', description: serverMessage });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Mã HĐ', dataIndex: 'dcid', render: (id) => <b>HD{id}</b> },
    { 
      title: 'Bất Động Sản', 
      render: (_, record) => record.BatDongSan ? `${record.BatDongSan.sonha} ${record.BatDongSan.tenduong}` : 'N/A' 
    },
    { title: 'Khách hàng', dataIndex: ['KhachHang', 'hoten'] },
    { 
      title: 'Nhân viên lập', 
      dataIndex: ['NhanVien', 'tennv'], 
      render: (text) => <Text type="secondary">{text || 'Admin'}</Text> 
    },
    { title: 'Tiền cọc', dataIndex: 'giatri', render: v => <b>{v?.toLocaleString()} đ</b> },
    { title: 'Ngày lập', dataIndex: 'ngaylaphd', render: (d) => dayjs(d).format('DD/MM/YYYY') },
    { 
      title: 'Tình trạng', 
      dataIndex: 'tinhtrang', 
      filters: [{ text: 'Hiệu lực', value: 1 }, { text: 'Chấm dứt HĐ', value: 0 }, { text: 'Hết hạn', value: 2 }],
      onFilter: (value, record) => record.tinhtrang === value,
      render: t => {
        let color = 'green';
        let text = 'Hiệu lực';
        if (t === 0) { color = 'red'; text = 'Chấm dứt HĐ'; }
        if (t === 2) { color = 'warning'; text = 'Hết hạn'; }
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => { setSelectedHD(record); setIsDetailModalOpen(true); }}>Chi tiết</Button>
          {record.tinhtrang === 1 && (
            <Popconfirm title="Chấm dứt hợp đồng này?" onConfirm={() => handleCancel(record.dcid)} okText="Đồng ý" cancelText="Hủy">
              <Button size="small" danger>Chấm dứt</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    }
  ];

  return (
    <>
        <Card 
          title={
            <Row gutter={16} align="middle">
              <Col><strong style={{fontSize: '20px'}}>QUẢN LÝ HỢP ĐỒNG ĐẶT CỌC</strong></Col>
              <Col style={{ marginLeft: '20px' }}>
                <Space.Compact>
                  <Input 
                    placeholder="Mã HĐ, tên khách..." 
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={handleSearch}
                    prefix={<SearchOutlined />}
                    style={{ width: 250 }}
                  />
                  <Button type="primary" onClick={handleSearch}>Tra cứu</Button>
                  <Button icon={<ReloadOutlined />} onClick={handleReset} />
                </Space.Compact>
              </Col>
            </Row>
          } 
          extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/hop-dong-dat-coc/add')}>Lập phiếu mới</Button>}
        >
          <Alert
            message={<Text strong style={{ fontSize: '15px' }}>Giới thiệu</Text>}
            description={
              <ul style={{ paddingLeft: '20px', margin: '5px 0 0 0' }}>
                <li><Text strong>Liên kết:</Text> Chỉ lập phiếu dựa trên danh sách Hợp đồng ký gửi đang hiệu lực.</li>
                <li><Text strong>Tài chính:</Text> Số tiền đặt cọc tối thiểu phải đạt <Text type="danger" strong>10%</Text> giá trị niêm yết của Bất động sản.</li>
                <li><Text strong>Pháp lý:</Text> Tuân thủ Điều 328 Bộ luật Dân sự 2015 về việc xử lý tiền cọc khi có bên vi phạm thỏa thuận.</li>
              </ul>
            }
            type="info"
            showIcon
            style={{ marginBottom: '20px', backgroundColor: '#f0f5ff', border: '1px solid #adc6ff' }}
          />
          <Table dataSource={data} loading={loading} rowKey="dcid" columns={columns} pagination={{ pageSize: 10 }} />
        </Card>

      <Modal
        title={<Title level={4}>CHI TIẾT HỢP ĐỒNG HD{selectedHD?.dcid}</Title>}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[<Button key="close" onClick={() => setIsDetailModalOpen(false)}>Đóng</Button>]}
        width={700}
      >
        {selectedHD && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Mã Hợp Đồng"><b>HD{selectedHD.dcid}</b></Descriptions.Item>
            <Descriptions.Item label="Mã HĐ Ký gửi">{selectedHD.kgid ? `HDKG${selectedHD.kgid}` : 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Nhân viên lập phiếu">
              <Tag color="blue">{selectedHD.NhanVien?.tennv || 'Hệ thống'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Bất Động Sản">
              {selectedHD.BatDongSan?.sonha} {selectedHD.BatDongSan?.tenduong}, {selectedHD.BatDongSan?.quan}
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">{selectedHD.KhachHang?.hoten}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{selectedHD.KhachHang?.sdt}</Descriptions.Item>
            <Descriptions.Item label="Số tiền cọc">
              <Text type="danger" strong>{selectedHD.giatri?.toLocaleString()} đ</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày lập">{dayjs(selectedHD.ngaylaphd).format('DD/MM/YYYY')}</Descriptions.Item>
            <Descriptions.Item label="Hạn ký HĐ">{dayjs(selectedHD.ngayhethan).format('DD/MM/YYYY')}</Descriptions.Item>
            <Descriptions.Item label="Tình trạng">
              <Tag color={selectedHD.tinhtrang === 1 ? 'green' : (selectedHD.tinhtrang === 2 ? 'warning' : 'red')}>
                {selectedHD.tinhtrang === 1 ? 'Đang hiệu lực' : (selectedHD.tinhtrang === 2 ? 'Hết hạn' : 'Chấm dứt HĐ')}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
};

const HopdongDatCocExport = () => (
  <App>
    <HopdongMain />
  </App>
);

export default HopdongDatCocExport;