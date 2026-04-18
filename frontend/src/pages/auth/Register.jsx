import { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (values) => {
    const { password, confirm } = values;

    if (password !== confirm) {
      message.error("Mật khẩu không khớp");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      message.success("Đăng ký thành công");
      navigate("/login");
      setLoading(false);
    }, 800);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f5f7fa"
    }}>
      <Card style={{ width: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={3}>Đăng ký</Title>
        </div>

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>

          <Form.Item name="confirm" label="Nhập lại mật khẩu" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>
            Đăng ký
          </Button>
        </Form>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text>
            Đã có tài khoản?{" "}
            <span
              onClick={() => navigate("/login")}
              style={{ color: "#1677ff", cursor: "pointer" }}
            >
              Đăng nhập
            </span>
          </Text>
        </div>
      </Card>
    </div>
  );
}