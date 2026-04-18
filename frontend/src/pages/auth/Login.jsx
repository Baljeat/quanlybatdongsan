import { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../../services/authServices";

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    const { password } = values;

    if (password.length < 6) {
      message.error("Mật khẩu phải >= 6 ký tự");
      return;
    }

    try {
      setLoading(true);

      const res = await loginApi(values);

      // lưu token
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("role", res.data.user.role);
      message.success("Đăng nhập thành công");
      navigate("/");
      window.location.reload();
    } catch (err) {
      message.error("Sai tài khoản hoặc mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f7fa",
      }}
    >
      <Card style={{ width: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={3}>Đăng nhập</Title>
          <Text type="secondary">Hệ thống quản lý bất động sản</Text>
        </div>

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Nhập email" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Nhập mật khẩu" }]}
          >
            <Input.Password />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>
            Đăng nhập
          </Button>
        </Form>

        <div style={{ marginTop: 12, fontSize: 12 }}>
            Acc: admin or nhanvien1 <br />
            Pass: 123456
        </div>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text>
            Chưa có tài khoản?{" "}
            <span
              onClick={() => navigate("/register")}
              style={{ color: "#1677ff", cursor: "pointer" }}
            >
              Đăng ký
            </span>
          </Text>
        </div>
      </Card>
    </div>
  );
}