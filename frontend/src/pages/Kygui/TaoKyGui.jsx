import React, { useState, useEffect } from 'react';
import { taoKyGuiMoi, layDanhSachBDS, layDanhSachKhachHang } from '../../services/hopdongkyguiServices';
import { useNavigate } from 'react-router-dom';
import Toast from '../../components/Toast';

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

  const darkTheme = {
    container: { color: '#f0f0f0' },
    form: { backgroundColor: '#2c2c2c', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 10px rgba(0,0,0,0.2)' },
    h2: { color: '#00aaff', textAlign: 'center', marginBottom: '25px' },
    label: { fontWeight: 'bold', marginBottom: '8px', display: 'block', color: '#e0e0e0' },
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '6px',
      border: '1px solid #ccc',
      backgroundColor: '#ffffff',
      color: '#333333',
      boxSizing: 'border-box',
      fontSize: '16px'
    },
    error: {
      color: '#ff4d4d',
      textAlign: 'center',
      minHeight: '24px',
      marginBottom: '10px'
    },
    button: {
      padding: '14px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '17px',
      fontWeight: 'bold',
      marginTop: '15px',
      transition: 'background-color 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%'
    },
    cancelButton: {
      padding: '14px',
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '17px',
      fontWeight: 'bold',
      marginTop: '15px',
      transition: 'background-color 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%'
    }
  };


  return (
    <div style={darkTheme.container}>
      <Toast show={showSuccess} message="Tạo hợp đồng thành công!" />

      <div style={darkTheme.form}>
        <h2 style={darkTheme.h2}>Tạo Hợp Đồng Ký Gửi Mới</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={darkTheme.error}>{error || '\u00A0'}</div>
            <div>
              <label style={darkTheme.label}>Mã Khách Hàng (*):</label>
              <select name="khid" value={formData.khid} onChange={handleChange} required style={darkTheme.input}>
                <option value="">-- Chọn Khách Hàng --</option>
                {danhSachKH.map(kh => (
                  <option key={kh.khid} value={kh.khid}>{kh.khid} - {kh.hoten || 'Chưa cập nhật tên'}</option>
                ))}
              </select>
            </div>
            <div style={{marginTop: '15px'}}>
              <label style={darkTheme.label}>Mã Bất Động Sản (*):</label>
              <select name="bdsid" value={formData.bdsid} onChange={handleChange} required style={darkTheme.input}>
                <option value="">-- Chọn Mã Bất Động Sản --</option>
                {danhSachBDS.map(bds => (
                  <option key={bds.bdsid} value={bds.bdsid}>
                    {bds.bdsid} - QSDĐ: {bds.masoqsdd || 'N/A'} {bds.tenduong ? `(${bds.tenduong})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div style={{marginTop: '15px'}}>
              <label style={darkTheme.label}>Giá trị Hợp Đồng (VNĐ) (*):</label>
              <input type="text" inputMode="numeric" name="giatri" value={formData.giatri} onChange={handleChange} required style={darkTheme.input} placeholder="Ví dụ: 3,500,000,000" />
            </div>
            <div style={{marginTop: '15px'}}>
              <label style={darkTheme.label}>Chi Phí Dịch Vụ (VNĐ) (*):</label>
              <input type="text" inputMode="numeric" name="chiphidv" value={formData.chiphidv} onChange={handleChange} required style={darkTheme.input} placeholder="Ví dụ: 50,000,000" />
            </div>
            <div style={{marginTop: '15px'}}>
              <label style={darkTheme.label}>Ngày Bắt Đầu (*):</label>
              <div style={{ position: 'relative' }}>
                <style>{`
                  input[name="ngaybatdau"]::-webkit-calendar-picker-indicator {
                    opacity: 0;
                  }
                `}</style>
                <input 
                  type="date" 
                  name="ngaybatdau" 
                  value={formData.ngaybatdau} 
                  onChange={handleChange} 
                  required
                  readOnly
                  style={{ ...darkTheme.input, backgroundColor: '#f0f0f0', color: '#888', cursor: 'not-allowed' }}
                />
                <svg 
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#666' }} 
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <span style={{ fontSize: '13px', color: '#888', marginTop: '5px', display: 'block', fontStyle: 'italic' }}>* Ngày bắt đầu là ngày hôm nay và không thể thay đổi.</span>
            </div>
            <div style={{marginTop: '15px'}}>
              <label style={darkTheme.label}>Ngày Kết Thúc:</label>
              <div style={{ position: 'relative' }}>
                <style>{`
                  input[name="ngayketthuc"]::-webkit-calendar-picker-indicator {
                    opacity: 0;
                  }
                `}</style>
                <input 
                  type="date" 
                  name="ngayketthuc" 
                  value={formData.ngayketthuc} 
                  onChange={handleChange} 
                  min={formData.ngaybatdau}
                  style={{ ...darkTheme.input, cursor: 'pointer' }}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()} 
                  onKeyDown={(e) => e.preventDefault()} 
                />
                <svg 
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#666' }} 
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
            </div>
            <div style={{marginTop: '15px'}}>
              <label style={darkTheme.label}>Trạng Thái:</label>
              <select name="trangthai" value={formData.trangthai} onChange={handleChange} style={darkTheme.input}>
                <option value="0">Mới tạo</option>
                <option value="1">Đang hiệu lực</option>
                <option value="2">Đã hết hạn</option>
                <option value="3">Đã hủy</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button type="button" style={darkTheme.cancelButton} onClick={() => { if (window.confirm('Bạn có chắc chắn muốn hủy và quay lại trang quản lý không?')) navigate('/quan-ly-ky-gui'); }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#5a6268'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#6c757d'}>
                Hủy
              </button>
              <button type="submit" style={darkTheme.button} disabled={loading} onMouseOver={e => e.currentTarget.style.backgroundColor = '#0056b3'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#007bff'}>
                {loading ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4"></circle>
                      <path d="M12 2C6.477 2 2 6.477 2 12h4c0-3.314 2.686-6 6-6V2z" fill="#fff">
                        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
                      </path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : 'Tạo Hợp Đồng'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}