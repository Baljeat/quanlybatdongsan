import { Layout, Menu, Avatar, Button, Tag, Space, Typography } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  DashboardOutlined, UserOutlined, HomeOutlined, 
  PlusCircleOutlined, FileTextOutlined, 
  LogoutOutlined, BankOutlined 
} from "@ant-design/icons";

const { Sider, Content } = Layout;
const { Text } = Typography;

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- 1. XỬ LÝ DỮ LIỆU USER AN TOÀN ---
  const userStr = localStorage.getItem("user");
  const roleStored = localStorage.getItem("role"); 
  
  let userData = { 
    tennv: "Người dùng", 
    role: roleStored || "guest" 
  };

  if (userStr) {
    try {
      const parsed = JSON.parse(userStr);
      // Đảm bảo parsed là một Object hợp lệ và gộp dữ liệu role cho chắc chắn
      if (parsed && typeof parsed === 'object') {
        userData = { ...parsed, role: roleStored || parsed.role || "guest" };
      }
    } catch (e) {
      console.error("Dữ liệu user bị lỗi định dạng JSON");
    }
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // --- 2. DANH SÁCH MENU (Cập nhật đường dẫn chuẩn) ---
  const menuItems = [
    { key: "/", icon: <DashboardOutlined />, label: "Tổng quan" },
    { key: "/nhan-vien", icon: <UserOutlined />, label: "Nhân viên", adminonly: true },
    { key: "/khach-hang", icon: <UserOutlined />, label: "Khách hàng" },
    { 
      key: "group-bds", 
      icon: <HomeOutlined />, 
      label: "Bất động sản",
      children: [
        { key: "/bat-dong-san", label: "Danh sách" },
        { key: "/bat-dong-san/add", icon: <PlusCircleOutlined />, label: "Thêm mới" },
      ]
    },
    {
      key: "group-ky-gui",
      icon: <FileTextOutlined />,
      label: "HĐ ký gửi",
      children: [
        { key: "/quan-ly-ky-gui", label: "Danh sách" },
        { key: "/tao-ky-gui", icon: <PlusCircleOutlined />, label: "Thêm mới" },
      ]
    },
    { key: "/hop-dong-dat-coc", icon: <FileTextOutlined />, label: "HĐ đặt cọc" },
    { key: "/hop-dong-chuyen-nhuong", icon: <FileTextOutlined />, label: "HĐ chuyển nhượng" },
  ];

  // Lọc menu theo quyền và loại bỏ thuộc tính "adminonly" để tránh lỗi Warning DOM của React
  const allowedMenuItems = menuItems
    .filter(i => !i.adminonly || (i.adminonly && userData.role === 'admin'))
    .map(item => {
      const newItem = { ...item };
      delete newItem.adminonly; // Sử dụng delete để không sinh ra lỗi "biến thừa (unused vars)" của ESLint
      return newItem;
    });

  // Hàm giúp giữ Menu luôn sáng (highlight) khi đang ở bên trong các trang con
  const getActiveMenuKey = () => {
    const path = location.pathname;
    // Đối với các trang con như Sửa, highlight menu Danh sách cha
    if (path.startsWith("/sua-ky-gui/")) return "/quan-ly-ky-gui";
    if (path.includes("/bat-dong-san") && !path.includes("/add")) return "/bat-dong-san";
    return path;
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={260} theme="light" style={{ borderRight: "1px solid #f0f0f0", position: 'fixed', height: '100vh', left: 0, top: 0 }}>
        {/* Bọc toàn bộ nội dung Sider bằng 1 thẻ flex-column để `flex: 1` bên dưới hoạt động */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ height: 64, display: "flex", alignItems: "center", padding: "0 24px", borderBottom: "1px solid #f0f0f0" }}>
            <BankOutlined style={{ fontSize: 24, color: "#1677ff" }} />
            <span style={{ marginLeft: 12, fontSize: 18, fontWeight: 700 }}>Quản lý BĐS</span>
          </div>

          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
            <Space>
              <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: "#e6f4ff" }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Hiển thị tên nhân viên hoặc phần trước @ của email */}
              <Text strong>{userData.tennv || userData.email?.split('@')[0] || "User"}</Text>
                <Tag 
                  color={userData.role === 'admin' ? 'red' : 'blue'} 
                  style={{ width: 'fit-content', marginTop: 4, textTransform: 'capitalize' }}
                >
                  {userData.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                </Tag>
              </div>
            </Space>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
            <Menu
              mode="inline"
              selectedKeys={[getActiveMenuKey()]}
              items={allowedMenuItems}
              onClick={({ key }) => navigate(key)}
              style={{ border: "none" }}
            />
          </div>

          <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
            <Button type="text" danger block icon={<LogoutOutlined />} onClick={handleLogout} style={{ textAlign: 'left' }}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </Sider>

      <Layout style={{ marginLeft: 260 }}>
        <Content style={{ padding: "24px", background: "#f3f4f6", minHeight: "100vh" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}