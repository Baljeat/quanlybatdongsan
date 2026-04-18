import { Form, Input, Button, DatePicker, Select, message } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import dayjs from "dayjs";
import { createKhachHang, updateKhachHang } from "../../services/khachhangServices";

export default function AddKhachHang() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const editingData = location.state;

  useEffect(() => {
    if (editingData) {
      form.setFieldsValue({
        ...editingData,
        // Ép kiểu về Number để khớp với value: 1 hoặc 0 trong Select options
        gioitinh: editingData.gioitinh !== undefined ? Number(editingData.gioitinh) : null,
        loaikh: editingData.loaikh !== undefined ? Number(editingData.loaikh) : 0,
        trangthai: editingData.trangthai !== undefined ? Number(editingData.trangthai) : 1,
        ngaysinh: editingData.ngaysinh ? dayjs(editingData.ngaysinh) : null,
      });
    } else {
      // Nếu là thêm mới, đảm bảo form được reset về giá trị mặc định (Hoạt động)
      form.resetFields();
    }
  }, [editingData, form]);

  const handleSubmit = (values) => {
    (async () => {
      try {
        const payload = {
          ...values,
          trangthai: values.trangthai !== undefined ? Number(values.trangthai) : 1,
          ngaysinh: values.ngaysinh ? values.ngaysinh.format("YYYY-MM-DD") : null,
        };

        if (editingData && editingData.khid) {
          await updateKhachHang(editingData.khid, payload);
          message.success("Cập nhật khách hàng thành công");
        } else {
          await createKhachHang(payload);
          message.success("Thêm khách hàng thành công");
        }

        navigate("/khach-hang");
      } catch (err) {
        const errMsg = err?.response?.data?.message || "Lỗi khi lưu khách hàng";
        message.error(errMsg);
      }
    })();
  };

  return (
    <div style={{ padding: 28, background: "#f3f4f6", minHeight: "100vh" }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <Button onClick={() => navigate("/khach-hang")}>
          ← Quay lại
        </Button>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 24, fontWeight: 600 }}>
            {editingData ? "Chỉnh sửa khách hàng" : "Thêm khách hàng"}
          </div>
          <div style={{ color: "#888" }}>
            Quản lý thông tin khách hàng
          </div>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2.5fr 1fr",
            gap: 20,
          }}
        >
          {/* ===== MAIN FORM ===== */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
            }}
          >
            {/* GRID */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <Form.Item
                name="hoten"
                label="Họ tên"
                rules={[{ required: true }]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>

              <Form.Item name="sdt" label="SĐT">
                <Input placeholder="090..." />
              </Form.Item>

              <Form.Item name="cmnd" label="CMND/CCCD">
                <Input />
              </Form.Item>

              <Form.Item name="email" label="Email">
                <Input />
              </Form.Item>

              <Form.Item name="ngaysinh" label="Ngày sinh">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item name="gioitinh" label="Giới tính">
                <Select
                  options={[
                    { value: 1, label: "Nam" },
                    { value: 0, label: "Nữ" },
                  ]}
                />
              </Form.Item>
            </div>

            {/* ADDRESS */}
            <div style={{ marginTop: 24 }}>
              <Form.Item name="diachi" label="Địa chỉ thường trú">
                <Input />
              </Form.Item>

              <Form.Item name="diachitt" label="Địa chỉ tạm trú">
                <Input />
              </Form.Item>
            </div>

            {/* NOTE */}
            <div style={{ marginTop: 16 }}>
              <Form.Item name="mota" label="Ghi chú">
                <Input.TextArea rows={3} />
              </Form.Item>
            </div>
          </div>

          {/* ===== SIDEBAR ===== */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            
            {/* STATUS BOX */}
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 12 }}>
                Phân loại
              </div>

              <Form.Item name="loaikh" label="Loại khách">
                <Select
                  options={[
                    { value: 1, label: "VIP" },
                    { value: 0, label: "Thường" },
                  ]}
                />
              </Form.Item>

              <Form.Item name="trangthai" label="Trạng thái">
                <Select
                  options={[
                    { value: 1, label: "Hoạt động" },
                    { value: 0, label: "Ngưng" },
                  ]}
                />
              </Form.Item>
            </div>

            {/* ACTION BOX */}
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  width: "100%",
                  height: 42,
                  fontSize: 15,
                  fontWeight: 500,
                }}
              >
                {editingData ? "Cập nhật" : "Lưu khách hàng"}
              </Button>

              <Button
                style={{ width: "100%", marginTop: 8 }}
                onClick={() => navigate("/khach-hang")}
              >
                Hủy
              </Button>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}