import React from 'react';

export default function KyGuiForm({
  title,
  formData,
  onChange,
  onSubmit,
  onCancel,
  loading,
  error,
  danhSachBDS,
  danhSachKH,
  submitText,
  isEdit
}) {
  const darkTheme = {
    form: { backgroundColor: '#2c2c2c', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
    h2: { color: '#00aaff', textAlign: 'center', marginBottom: '25px' },
    label: { fontWeight: 'bold', marginBottom: '8px', display: 'block', color: '#e0e0e0' },
    input: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#ffffff', color: '#333333', boxSizing: 'border-box', fontSize: '16px' },
    error: { color: '#ff4d4d', textAlign: 'center', minHeight: '24px', marginBottom: '10px' },
    button: { padding: '14px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '17px', fontWeight: 'bold', marginTop: '15px', transition: 'background-color 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' },
    cancelButton: { padding: '14px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '17px', fontWeight: 'bold', marginTop: '15px', transition: 'background-color 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }
  };

  return (
    <div style={darkTheme.form}>
      <h2 style={darkTheme.h2}>{title}</h2>
      
      <form onSubmit={onSubmit}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={darkTheme.error}>{error || '\u00A0'}</div>
          
          <div>
            <label style={darkTheme.label}>Mã Khách Hàng (*):</label>
            <select name="khid" value={formData.khid} onChange={onChange} required style={darkTheme.input}>
              <option value="">-- Chọn Khách Hàng --</option>
              {danhSachKH.map(kh => (
                <option key={kh.khid} value={kh.khid}>{kh.khid} - {kh.hoten || 'Chưa cập nhật tên'}</option>
              ))}
            </select>
          </div>
          
          <div style={{marginTop: '15px'}}>
            <label style={darkTheme.label}>Mã Bất Động Sản (*):</label>
            <select name="bdsid" value={formData.bdsid} onChange={onChange} required style={darkTheme.input}>
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
            <input type="text" inputMode="numeric" name="giatri" value={formData.giatri} onChange={onChange} required style={darkTheme.input} placeholder="Ví dụ: 3,500,000,000" />
          </div>
          
          <div style={{marginTop: '15px'}}>
            <label style={darkTheme.label}>Chi Phí Dịch Vụ (VNĐ) (*):</label>
            <input type="text" inputMode="numeric" name="chiphidv" value={formData.chiphidv} onChange={onChange} required style={darkTheme.input} placeholder="Ví dụ: 50,000,000" />
          </div>
          
          <div style={{marginTop: '15px'}}>
            <label style={darkTheme.label}>Ngày Bắt Đầu (*):</label>
            <div style={{ position: 'relative' }}>
              <style>{`input[name="ngaybatdau"]::-webkit-calendar-picker-indicator { opacity: 0; }`}</style>
              <input 
                type="date" 
                name="ngaybatdau" 
                value={formData.ngaybatdau} 
                onChange={onChange} 
                required
                readOnly
                style={{ ...darkTheme.input, backgroundColor: '#f0f0f0', color: '#888', cursor: 'not-allowed' }}
              />
              <svg style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#666' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <span style={{ fontSize: '13px', color: '#888', marginTop: '5px', display: 'block', fontStyle: 'italic' }}>
              {isEdit ? '* Ngày bắt đầu của hợp đồng không thể thay đổi.' : '* Ngày bắt đầu là ngày hôm nay và không thể thay đổi.'}
            </span>
          </div>
          
          <div style={{marginTop: '15px'}}>
            <label style={darkTheme.label}>Ngày Kết Thúc:</label>
            <div style={{ position: 'relative' }}>
              <style>{`input[name="ngayketthuc"]::-webkit-calendar-picker-indicator { opacity: 0; }`}</style>
              <input 
                type="date" 
                name="ngayketthuc" 
                value={formData.ngayketthuc} 
                onChange={onChange} 
                min={formData.ngaybatdau}
                style={{ ...darkTheme.input, cursor: 'pointer' }}
                onClick={(e) => e.target.showPicker && e.target.showPicker()} 
                onKeyDown={(e) => e.preventDefault()} 
              />
              <svg style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#666' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
          </div>
          
          <div style={{marginTop: '15px'}}>
            <label style={darkTheme.label}>Trạng Thái:</label>
            <select name="trangthai" value={formData.trangthai} onChange={onChange} style={darkTheme.input}>
              <option value="0">Mới tạo</option>
              <option value="1">Đang hiệu lực</option>
              <option value="2">Đã hết hạn</option>
              <option value="3">Đã hủy</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <button type="button" style={darkTheme.cancelButton} onClick={onCancel} onMouseOver={e => e.currentTarget.style.backgroundColor = '#5a6268'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#6c757d'}>
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
              ) : submitText}
            </button>
          </div>
          
        </div>
      </form>
    </div>
  );
}