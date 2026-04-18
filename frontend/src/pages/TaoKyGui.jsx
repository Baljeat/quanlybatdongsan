import React, { useState, useEffect } from 'react';
import { taoKyGuiMoi, layDanhSachBDS, layDanhSachKhachHang } from '../services/kyGuiService';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import KyGuiForm from '../components/KyGuiForm';

export default function TaoKyGui() {
  const today = new Date().toISOString().split('T')[0];
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    khid: '',
    bdsid: '',
    giatri: '',
    chiphidv: '',
    ngaybatdau: today,
    ngayketthuc: '',
    trangthai: '0'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [danhSachBDS, setDanhSachBDS] = useState([]);
  const [danhSachKH, setDanhSachKH] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bdsResponse, khResponse] = await Promise.all([
          layDanhSachBDS(),
          layDanhSachKhachHang()
        ]);
        setDanhSachBDS(bdsResponse.data);
        setDanhSachKH(khResponse.data);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu dropdown:', err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'giatri' || name === 'chiphidv') {
      const numericValue = value.replace(/\D/g, '');
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
    
    const giatriRaw = formData.giatri.replace(/,/g, '');
    const chiphidvRaw = formData.chiphidv.replace(/,/g, '');

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
        chiphidv: Number(chiphidvRaw),
        // Tránh lỗi MySQL khi chuỗi ngày tháng bị rỗng
        ngayketthuc: formData.ngayketthuc ? formData.ngayketthuc : null
      };
      await taoKyGuiMoi(payload);
      setFormData({
        khid: '', bdsid: '', giatri: '', chiphidv: '',
        ngaybatdau: today, ngayketthuc: '', trangthai: '0'
      });
      setShowSuccess(true);
      // Đợi 2s để hiện Toast rồi tự động chuyển về trang Quản Lý
      setTimeout(() => navigate('/quan-ly-ky-gui'), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ color: '#f0f0f0' }}>
      <Toast show={showSuccess} message="Tạo hợp đồng thành công!" />

      <KyGuiForm 
        title="Tạo Hợp Đồng Ký Gửi Mới"
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={() => { if (window.confirm('Bạn có chắc chắn muốn hủy và quay lại trang quản lý không?')) navigate('/quan-ly-ky-gui'); }}
        loading={loading}
        error={error}
        danhSachBDS={danhSachBDS}
        danhSachKH={danhSachKH}
        submitText="Tạo Hợp Đồng"
        isEdit={false}
      />
    </div>
  );
}