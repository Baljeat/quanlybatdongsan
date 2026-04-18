import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { layKyGuiTheoId, capNhatKyGui, layDanhSachBDS, layDanhSachKhachHang } from '../services/kyGuiService';
import Toast from '../components/Toast';
import KyGuiForm from '../components/KyGuiForm';

export default function SuaKyGui() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    khid: '',
    bdsid: '',
    giatri: '',
    chiphidv: '',
    ngaybatdau: '',
    ngayketthuc: '',
    trangthai: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [danhSachBDS, setDanhSachBDS] = useState([]);
  const [danhSachKH, setDanhSachKH] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await layKyGuiTheoId(id);
        const data = response.data;
        const formattedData = {
          ...data,
          ngaybatdau: data.ngaybatdau ? new Date(data.ngaybatdau).toISOString().split('T')[0] : '',
          ngayketthuc: data.ngayketthuc ? new Date(data.ngayketthuc).toISOString().split('T')[0] : '',
          giatri: data.giatri ? String(data.giatri).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '',
          chiphidv: data.chiphidv ? String(data.chiphidv).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '',
          trangthai: String(data.trangthai)
        };
        setFormData(formattedData);

        // Tải danh sách Bất Động Sản và Khách Hàng
        const [bdsResponse, khResponse] = await Promise.all([
          layDanhSachBDS(),
          layDanhSachKhachHang()
        ]);
        setDanhSachBDS(bdsResponse.data);
        setDanhSachKH(khResponse.data);
      } catch (err) {
        setError('Không thể tải dữ liệu hợp đồng. ' + (err.response?.data?.message || ''));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'giatri' || name === 'chiphidv') {
      const numericValue = String(value).replace(/\D/g, '');
      const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      setFormData({ ...formData, [name]: formattedValue });
    } else if (name === 'khid' || name === 'bdsid') {
      setFormData({ ...formData, [name]: value.toUpperCase() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const giatriRaw = String(formData.giatri).replace(/,/g, '');
    const chiphidvRaw = String(formData.chiphidv).replace(/,/g, '');

    const { khid, bdsid, ngaybatdau, ngayketthuc } = formData;
    if (!khid || !bdsid || !giatriRaw || !chiphidvRaw || !ngaybatdau) {
      setError('Vui lòng điền đầy đủ các trường có dấu (*).');
      return;
    }

    if (ngayketthuc && new Date(ngayketthuc) < new Date(ngaybatdau)) {
      setError('Ngày kết thúc không được nhỏ hơn ngày bắt đầu.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        giatri: Number(giatriRaw),
        chiphidv: Number(chiphidvRaw)
      };
      await capNhatKyGui(id, payload);
      setShowSuccess(true);
      setTimeout(() => navigate('/quan-ly-ky-gui'), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = { padding: '20px' };

  if (loading && !formData.khid) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '18px' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto 15px' }}>
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.1)" strokeWidth="4"></circle>
            <path d="M12 2C6.477 2 2 6.477 2 12h4c0-3.314 2.686-6 6-6V2z" fill="#007bff">
              <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
            </path>
          </svg>
          Đang tải dữ liệu hợp đồng...
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <Toast show={showSuccess} message="Cập nhật hợp đồng thành công!" />

      <KyGuiForm
        title={`Chỉnh Sửa Hợp Đồng Ký Gửi (ID: ${id})`}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={() => { if (window.confirm('Bạn có chắc chắn muốn hủy bỏ những thay đổi đang nhập dở không?')) navigate('/quan-ly-ky-gui'); }}
        loading={loading}
        error={error}
        danhSachBDS={danhSachBDS}
        danhSachKH={danhSachKH}
        submitText="Lưu Thay Đổi"
        isEdit={true}
      />
    </div>
  );
}