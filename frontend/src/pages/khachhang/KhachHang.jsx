import { useState, useEffect } from "react";
import { Table, Button, Space, Popconfirm, Card, Input, message, Modal, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { getAllKhachHang, deleteKhachHang } from "../../services/khachhangServices";

export default function KhachHang() {
  const navigate = useNavigate();
  
  // --- 1. QUẢN LÝ STATE ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");

  // --- 2. GỌI API LẤY DỮ LIỆU ---
  async function fetchData(q = "") {
    setLoading(true);
    try {
      const res = await getAllKhachHang({ keyword: q }); 
      setData(res.data || []);
    } catch (err) {
      console.error("Lỗi gọi API:", err);
      message.error("Không thể tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // --- 3. LOGIC XÓA (NGƯNG HOẠT ĐỘNG) ---
  const handleDelete = async (record) => {
    try {
      setLoading(true);
      const res = await deleteKhachHang(record.khid); 
      message.success(res.data.message || "Đã cập nhật trạng thái khách hàng");
      await fetchData(keyword); 
    } catch (err) {
      const errorDetail = err?.response?.data?.message || "Lỗi khi xử lý";
      Modal.error({
        title: 'Thông báo',
        content: errorDetail,
      });
    } finally {
      setLoading(false);
    }
  };

  // --- 4. ĐỊNH NGHĨA CỘT BẢNG ---
  const columns = [
    { title: "Mã", dataIndex: "khid", width: 80 },
    { title: "Họ tên", dataIndex: "hoten", ellipsis: true },
    { title: "SĐT", dataIndex: "sdt", width: 130 },
    { title: "CMND", dataIndex: "cmnd", width: 140 },
    { title: "Email", dataIndex: "email", ellipsis: true },
    {
      title: "Loại KH",
      dataIndex: "loaikh",
      width: 150,
      render: (v) => (Number(v) === 1 ? <Tag color="gold">VIP (Có BĐS)</Tag> : <Tag color="default">Tiềm năng</Tag>),
    },
    {
      title: "Trạng thái",
      dataIndex: "trangthai",
      width: 120,
      render: (v) => (Number(v) === 1 ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngưng</Tag>),
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => navigate("/khach-hang/add", { state: record })}>
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa khách hàng này?"
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Quản lý khách hàng"
      extra={
        <Space>
          <Input.Search
            placeholder="Tìm mã, tên, SĐT..."
            allowClear
            onSearch={(v) => {
              setKeyword(v);
              fetchData(v);
            }} 
            onChange={(e) => {
              if (!e.target.value) {
                setKeyword("");
                fetchData("");
              }
            }}
          />
          <Button type="primary" onClick={() => navigate("/khach-hang/add")}>
            Thêm mới
          </Button>
        </Space>
      }
    >
      <Table
        loading={loading}
        dataSource={data}
        columns={columns}
        rowKey="khid"
        pagination={{ pageSize: 8 }}
        scroll={{ x: 1000 }}
      />
    </Card>
  );
}