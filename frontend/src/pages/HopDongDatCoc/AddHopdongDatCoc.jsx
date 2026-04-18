import React, { useState, useEffect } from 'react';
import { Button, Card, Form, DatePicker, Select, InputNumber, Divider, Row, Col, Typography, App, Alert } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import axios from 'axios';
import { createHopDongDatCoc, getDanhSachBDS, getDanhSachKH } from '../../services/hopdongdatcocServices';

const { Title, Text } = Typography;

const AddHopdongDatCocMain = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { notification: notify } = App.useApp();

  const [danhSachBDS, setDanhSachBDS] = useState([]);
  const [danhSachKH, setDanhSachKH] = useState([]);
  const [danhSachHDKG, setDanhSachHDKG] = useState([]);
  const [allContracts, setAllContracts] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const [resBDS, resKH, resHDKG, resAllDC] = await Promise.all([
          getDanhSachBDS(),
          getDanhSachKH(),
          axios.get('http://localhost:3000/api/ky-gui/hieu-luc'),
          axios.get('http://localhost:3000/api/hopdong')
        ]);

        setDanhSachBDS(resBDS.data || []);
        setDanhSachKH(resKH.data || []);
        const hdkgData = resHDKG.data || [];
        const allDCData = resAllDC.data || [];

        setDanhSachHDKG(hdkgData);
        setAllContracts(allDCData);
      } catch (err) {
        notify.error({ message: 'Lỗi tải danh mục' });
      }
    };
    loadCategories();
  }, [notify]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
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
      navigate(-1); // Quay lại trang danh sách
    } catch (error) {
      notify.error({ message: 'Lỗi', description: error.response?.data?.message || 'Lỗi lưu dữ liệu' });
    } finally {
      setLoading(false);
    }
  };

  // Lọc ra các HĐ Ký gửi chưa bị đặt cọc và BĐS vẫn còn trống
  const availableHDKG = danhSachHDKG.filter(kg => {
    const hasActiveDeposit = allContracts.some(dc => Number(dc.kgid) === Number(kg.kgid) && Number(dc.tinhtrang) === 1);
    const isBdsAvailable = kg.BatDongSan && Number(kg.BatDongSan.tinhtrang) === 0;
    return !hasActiveDeposit && isBdsAvailable;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Quay lại</Button>
        <Title level={3} style={{ margin: 0 }}>PHIẾU ĐẶT CỌC BẤT ĐỘNG SẢN</Title>
        <div style={{ width: 100 }}></div>
      </div>

      {availableHDKG.length === 0 && (
        <Alert
          message={<Text strong style={{ fontSize: '15px' }}>Chưa có dữ liệu liên kết khả dụng!</Text>}
          description="Hiện tại hợp đồng ký gửi không còn hợp đồng nào chưa tạo mới và cũng như những hợp đồng kia đã thành đặt cọc rồi."
          type="warning"
          showIcon
          style={{ marginBottom: '20px', border: '1px solid #ffe58f' }}
        />
      )}

      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ ngaylaphd: dayjs() }}>
        <Row gutter={24}>
          <Col span={16}>
            <Card title="Thông tin chi tiết giao dịch" bordered={false}>
              <Divider orientation="left" plain>I. CHỌN TỪ HỢP ĐỒNG KÝ GỬI</Divider>
              {availableHDKG.length > 0 ? (
                <Form.Item label="Hợp đồng ký gửi liên kết" name="kgid" rules={[{ required: true, message: 'Bắt buộc chọn hợp đồng ký gửi!' }]}>
                  <Select
                    placeholder="Nhập tên KH hoặc mã BĐS để tìm kiếm..."
                    showSearch
                    size="large"
                    notFoundContent="Không có hợp đồng ký gửi nào khả dụng"
                    optionFilterProp="children"
                    filterOption={(input, option) => (option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                    onChange={(kgid) => {
                      const selected = danhSachHDKG.find(h => Number(h.kgid) === Number(kgid));
                      if (selected) form.setFieldsValue({ bdsid: selected.bdsid, khid: selected.khid });
                    }}
                  >
                    {availableHDKG.map(item => (
                      <Select.Option key={item.kgid} value={item.kgid}>
                        HDKG{item.kgid} - KH: {item.KhachHang?.hoten} - BĐS: {item.BatDongSan?.sonha} {item.BatDongSan?.tenduong}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : (
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                  <Text type="danger" strong>Không có Hợp đồng ký gửi khả dụng để chọn.</Text>
                </div>
              )}

              <Divider orientation="left" plain style={{ marginTop: 30 }}>II. THÔNG TIN KHÁCH HÀNG VÀ BẤT ĐỘNG SẢN</Divider>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Bất Động Sản" name="bdsid">
                    <Select placeholder="Tự động điền..." disabled size="large">
                      {danhSachBDS.map(item => <Select.Option key={item.bdsid} value={item.bdsid}>{item.sonha} {item.tenduong}</Select.Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Khách hàng đặt cọc" name="khid">
                    <Select placeholder="Tự động điền..." disabled size="large">
                      {danhSachKH.map(item => <Select.Option key={item.khid} value={item.khid}>{item.hoten}</Select.Option>)}
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
                dependencies={['kgid']}
                rules={[
                  { required: true, message: 'Nhập tiền cọc!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (value === undefined || value === null || value === '') return Promise.resolve();
                      const kgId = getFieldValue('kgid');
                      if (!kgId) return Promise.resolve();
                      const hdkg = danhSachHDKG.find(i => Number(i.kgid) === Number(kgId));
                      if (hdkg?.BatDongSan?.dongia) {
                        const toiThieu = Number(hdkg.BatDongSan.dongia) * 0.1;
                        if (Number(value) < toiThieu) return Promise.reject(new Error(`Cọc tối thiểu 10% (${toiThieu.toLocaleString('vi-VN')} đ)`));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber style={{ width: '100%' }} size="large" disabled={availableHDKG.length === 0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={v => v.replace(/\D/g, '')} />
              </Form.Item>
              <Form.Item label="Ngày lập phiếu" name="ngaylaphd">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabled size="large" />
              </Form.Item>
              <Form.Item label="Hạn ký hợp đồng" name="ngayhethan" rules={[{ required: true, message: 'Chọn ngày!' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" size="large" disabled={availableHDKG.length === 0} disabledDate={(current) => current && current <= dayjs().endOf('day')} />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large" disabled={availableHDKG.length === 0} style={{ marginTop: 20, height: 50, fontWeight: 'bold' }}>
                Thêm phiếu đặt cọc
              </Button>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default function AddHopdongDatCoc() { return <App><AddHopdongDatCocMain /></App>; }