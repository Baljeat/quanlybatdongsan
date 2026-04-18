import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Card, Form, DatePicker, Select, InputNumber, Divider,
   Row, Col, Typography, App, Space, Popconfirm, Modal, Descriptions, Input, Alert } from 'antd';
import { PlusOutlined, ArrowLeftOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { createHopDongDatCoc, getDanhSachBDS, getDanhSachKH } from '../../services/hopdongdatcocServices';
import dayjs from 'dayjs';
import axios from 'axios';


const { Title, Text } = Typography;

const HopdongMain = () => {
  const [view, setView] = useState('list');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  
  const [danhSachBDS, setDanhSachBDS] = useState([]);
  const [danhSachKH, setDanhSachKH] = useState([]);
  const [danhSachHDKG, setDanhSachHDKG] = useState([]); 
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedHD, setSelectedHD] = useState(null);

  const { notification: notify } = App.useApp();

  // 1. Tải danh mục (BDS, KH và HĐ Ký gửi)
  const loadCategories = async () => {
    try {
      const [resBDS, resKH, resHDKG] = await Promise.all([
        getDanhSachBDS(), 
        getDanhSachKH(),
        axios.get('http://localhost:3000/api/ky-gui/hieu-luc') 
      ]);
      setDanhSachBDS(resBDS.data || []);
      setDanhSachKH(resKH.data || []);
      setDanhSachHDKG(resHDKG.data || []);
    } catch (err) {
      notify.error({ message: 'Lỗi tải danh mục' });
    }
  };

  // 2. Lấy danh sách HĐ đặt cọc
  const fetchHopDongs = async (keyword = '') => {
    setLoading(true);
    try {
      const url = keyword 
        ? `http://localhost:3000/api/hopdong?keyword=${keyword}` 
        : 'http://localhost:3000/api/hopdong';
      const res = await axios.get(url);
      setData(res.data || []);
      
      if (keyword && res.data.length === 0) {
        notify.info({ message: 'Kết quả', description: 'Không tìm thấy kết quả' });
      }
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
    if (view === 'list') fetchHopDongs();
    if (view === 'create') loadCategories();
  }, [view]);

  const handleCancel = async (dcid) => {
    try {
      setLoading(true);
      const res = await axios.delete(`http://localhost:3000/api/hopdong/${dcid}`);
      notify.success({ message: 'Thành công', description: res.data.message, duration: 6 });
      fetchHopDongs();
    } catch (error) {
      const serverMessage = error.response?.data?.message || 'Không thể hủy hợp đồng.';
      notify.error({ message: 'Lỗi nghiệp vụ', description: serverMessage });
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Lấy thông tin nhân viên login từ localStorage (Auth dồn)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const submitData = {
        ...values,
        nvid_auth: user.nvid || 1, 
        ngaylaphd: values.ngaylaphd.format('YYYY-MM-DD'),
        ngayhethan: values.ngayhethan.format('YYYY-MM-DD'),
      };
      const res = await createHopDongDatCoc(submitData);
      notify.success({ 
        message: res.data.message || 'Thành công', 
        description: res.data.legalNote, 
        duration: 10, 
      });
      setView('list');
      form.resetFields();
    } catch (error) {
      notify.error({ message: 'Lỗi', description: error.response?.data?.message || 'Lỗi lưu dữ liệu' });
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
      filters: [{ text: 'Hiệu lực', value: 1 }, { text: 'Đã hủy', value: 0 }],
      onFilter: (value, record) => record.tinhtrang === value,
      render: t => <Tag color={t === 1 ? 'green' : 'red'}>{t === 1 ? 'Hiệu lực' : 'Đã hủy'}</Tag> 
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => { setSelectedHD(record); setIsDetailModalOpen(true); }}>Chi tiết</Button>
          {record.tinhtrang === 1 && (
            <Popconfirm title="Hủy hợp đồng?" onConfirm={() => handleCancel(record.dcid)} okText="Đồng ý" cancelText="Hủy">
              <Button size="small" danger>Xóa</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    }
  ];

  return (
    <>
      {view === 'list' ? (
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
          extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setView('create')}>Lập phiếu mới</Button>}
        >
          {/* MÔ TẢ GIỚI THIỆU */}
          <Alert
            message={<Text strong style={{ fontSize: '15px' }}>Giới thiệu</Text>}
            description={
              <ul style={{ paddingLeft: '20px', margin: '5px 0 0 0' }}>
                <li>
                  <Text strong>Liên kết:</Text> Chỉ lập phiếu dựa trên danh sách Hợp đồng ký gửi đang hiệu lực.
                </li>
                <li>
                  <Text strong>Tài chính:</Text> Số tiền đặt cọc tối thiểu phải đạt <Text type="danger" strong>10%</Text> giá trị niêm yết của Bất động sản.
                </li>
                <li>
                  <Text strong>Pháp lý:</Text> Tuân thủ Điều 328 Bộ luật Dân sự 2015 về việc xử lý tiền cọc khi có bên vi phạm thỏa thuận.
                </li>
              </ul>
            }
            type="info"
            showIcon
            style={{ marginBottom: '20px', backgroundColor: '#f0f5ff', border: '1px solid #adc6ff' }}
          />

          <Table 
            dataSource={data} 
            loading={loading}
            rowKey="dcid"
            columns={columns}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      ) : (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => setView('list')}>Quay lại</Button>
            <Title level={3} style={{ margin: 0 }}>PHIẾU ĐẶT CỌC BẤT ĐỘNG SẢN</Title>
            <div style={{ width: 100 }}></div>
          </div>
          <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ ngaylaphd: dayjs() }}>
            <Row gutter={24}>
              <Col span={16}>
                <Card title="Thông tin chi tiết giao dịch" bordered={false}>
                  <Divider orientation="left" plain>I. CHỌN TỪ HỢP ĐỒNG KÝ GỬI</Divider>
                  <Form.Item 
                    label="Hợp đồng ký gửi liên kết" 
                    name="kgid" 
                    rules={[{required: true, message: 'Bắt buộc chọn hợp đồng ký gửi!'}]}
                  >
                    <Select 
                      placeholder="Chọn hợp đồng ký gửi còn hiệu lực..."
                      showSearch
                      size="large"
                      onChange={(kgid) => {
                        const selected = danhSachHDKG.find(h => h.kgid === kgid);
                        if (selected) {
                          form.setFieldsValue({
                            bdsid: selected.bdsid,
                            khid: selected.khid,
                          });
                        }
                      }}
                    >
                      {danhSachHDKG.map(item => (
                        <Select.Option key={item.kgid} value={item.kgid}>
                          HDKG{item.kgid} - {item.KhachHang?.hoten} - {item.BatDongSan?.sonha} {item.BatDongSan?.tenduong}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Divider orientation="left" plain style={{ marginTop: 30 }}>II. THÔNG TIN KHÁCH HÀNG VÀ BẤT ĐỘNG SẢN</Divider>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Bất Động Sản" name="bdsid" >
                        <Select placeholder="Tự động điền..." disabled size="large">
                          {danhSachBDS.map(item => (
                            <Select.Option key={item.bdsid} value={item.bdsid}>
                              {item.sonha} {item.tenduong}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Khách hàng đặt cọc" name="khid" >
                        <Select placeholder="Tự động điền..." disabled size="large">
                          {danhSachKH.map(item => (
                            <Select.Option key={item.khid} value={item.khid}>{item.hoten}</Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Thỏa thuận đặt cọc" bordered={false}>
                  <Form.Item 
                    label="Số tiền cọc (VNĐ)" 
                    name="giatri" 
                    rules={[
                      { required: true, message: 'Nhập tiền cọc!' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const bdsId = getFieldValue('bdsid');
                          const bds = danhSachBDS.find(i => i.bdsid === bdsId);
                          if (bds && value < bds.dongia * 0.1) {
                            return Promise.reject(new Error(`Tối thiểu 10% (${(bds.dongia * 0.1).toLocaleString()} đ)`));
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <InputNumber 
                      style={{width:'100%'}} 
                      size="large" 
                      formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                      parser={v => v.replace(/\$\s?|(,*)/g, '')} 
                    />
                  </Form.Item>
                  <Form.Item label="Ngày lập phiếu" name="ngaylaphd">
                    <DatePicker style={{width:'100%'}} format="DD/MM/YYYY" disabled size="large" />
                  </Form.Item>
                  <Form.Item label="Hạn ký hợp đồng" name="ngayhethan" rules={[{required: true, message: 'Chọn ngày!'}]}>
                    <DatePicker 
                      style={{width:'100%'}} 
                      format="DD/MM/YYYY" 
                      size="large" 
                      disabledDate={(current) => current && current <= dayjs().endOf('day')} 
                    />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block size="large" style={{marginTop: 20, height: 50, fontWeight: 'bold'}}>
                    Thêm phiếu đặt cọc
                  </Button>
                </Card>
              </Col>
            </Row>
          </Form>
        </div>
      )}

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
            
            {/* HIỂN THỊ NHÂN VIÊN LẬP PHIẾU */}
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
              <Tag color={selectedHD.tinhtrang === 1 ? 'green' : 'red'}>
                {selectedHD.tinhtrang === 1 ? 'Đang hiệu lực' : 'Đã hủy'}
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