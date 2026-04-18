// File: frontend/src/pages/QuanLyNhanVien.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Modal, Form, Input, Select, DatePicker, message, Space, Popconfirm, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../services/api';
import dayjs from 'dayjs';

const QuanLyNhanVien = () => {
  // State và form phục vụ quản lý danh sách, loading, modal và chế độ chỉnh sửa
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

  // Tải danh sách nhân viên (có hỗ trợ tìm kiếm theo keyword)
  const fetchData = async (keyword = "") => {
    setLoading(true);
    try {
      const res = await api.get('/nhanvien', { params: { keyword } });
      setData(res.data);
      return res.data;
    } catch (error) {
      message.error('Lỗi kết nối máy chủ');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Lấy dữ liệu lần đầu khi mở trang
  useEffect(() => { fetchData(); }, []);

  // Mở modal tra cứu và reset form tìm kiếm
  const openSearchModal = () => {
    searchForm.resetFields();
    setIsSearchModalVisible(true);
  };

  // Đóng modal tra cứu và reset form
  const closeSearchModal = () => {
    setIsSearchModalVisible(false);
    searchForm.resetFields();
  };

  // Xử lý tra cứu nhân viên theo từ khóa nhập vào
  const handleSearch = async () => {
    try {
      const { keyword } = await searchForm.validateFields();
      const trimmedKeyword = keyword.trim();
      const result = await fetchData(trimmedKeyword);
      if (Array.isArray(result) && result.length === 0) {
        message.warning('Không tìm thấy nhân viên phù hợp.');
      }
      closeSearchModal();
    } catch (error) {
      if (error?.errorFields) {
        message.warning('Vui lòng nhập tiêu chí tra cứu!');
      } else {
        message.error('Có lỗi xảy ra khi tra cứu.');
      }
    }
  };

  // Mở modal thêm/sửa; nếu có record thì nạp dữ liệu để chỉnh sửa
  const openModal = (record = null) => {
    setIsModalVisible(true);
    if (record) {
      setEditingId(record.nvid);
      form.setFieldsValue({
        ...record,
        ngaysinh: record.ngaysinh ? dayjs(record.ngaysinh) : null
      });
    } else {
      setEditingId(null);
      form.resetFields();
    }
  };

  // Lưu nhân viên (thêm mới hoặc cập nhật) rồi tải lại danh sách
  const handleSave = async () => {
    try {
      const values = await form.validateFields(); 
      
      const submitData = {
        ...values,
        ngaysinh: values.ngaysinh ? values.ngaysinh.format('YYYY-MM-DD') : null
      };

      if (editingId) {
        await api.put(`/nhanvien/${editingId}`, submitData);
        message.success('Cập nhật thông tin thành công!');
      } else {
        await api.post('/nhanvien', submitData);
        message.success('Thêm nhân viên thành công!');
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      if(error.response && error.response.data) {
        message.error(error.response.data.message);
      }
    }
  };

  // Xóa nhân viên theo id và tải lại danh sách
  const handleDelete = async (id) => {
    try {
      await api.delete(`/nhanvien/${id}`);
      message.success('Xóa nhân viên thành công!');
      fetchData();
    } catch (error) {
      if(error.response && error.response.data) {
        message.error(error.response.data.message);
      }
    }
  };

  // Cấu hình các cột hiển thị trên bảng nhân viên
  const columns = [
    { title: 'Mã NV', dataIndex: 'nvid', key: 'nvid', width: 70, fixed: 'left' },
    { title: 'Tài khoản', dataIndex: 'taikhoan', key: 'taikhoan', width: 100, fixed: 'left' },
    { title: 'Mật khẩu', dataIndex: 'matkhau', key: 'matkhau', width: 100 },
    { title: 'Tên NV', dataIndex: 'tennv', key: 'tennv', width: 150 },
    { title: 'Ngày sinh', dataIndex: 'ngaysinh', key: 'ngaysinh', width: 120, render: (val) => val ? dayjs(val).format('DD/MM/YYYY') : '' },
    { title: 'Giới tính', dataIndex: 'gioitinh', key: 'gioitinh', width: 90, render: (val) => val ? 'Nam' : 'Nữ' },
    { title: 'SĐT', dataIndex: 'sdt', key: 'sdt', width: 120 },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 180 },
    { title: 'Địa chỉ', dataIndex: 'diachi', key: 'diachi', width: 200 },
    { title: 'Doanh thu', dataIndex: 'doanhthu', key: 'doanhthu', width: 120, render: (val) => val ? val.toLocaleString() + ' đ' : '0 đ' },
    { title: 'Quyền', dataIndex: 'quyen', key: 'quyen', width: 110, render: (val) => val ? 'Quản lý' : 'Nhân viên' },
    { title: 'Trạng thái', dataIndex: 'trangthai', key: 'trangthai', width: 110, render: (val) => val ? 'Đang làm' : 'Nghỉ việc' },
    {
      title: 'Hành động',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} type="link" />
          <Popconfirm title="Bạn có chắc chắn muốn xóa nhân viên này?" onConfirm={() => handleDelete(record.nvid)}>
            <Button icon={<DeleteOutlined />} type="link" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title="Quản Lý Nhân Viên" 
      extra={
        <Space>
          <Button icon={<SearchOutlined />} onClick={openSearchModal}>Tra cứu</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Thêm Mới</Button>
        </Space>
      }
    >
      {/* Bảng danh sách nhân viên */}
      <Table dataSource={data} columns={columns} rowKey="nvid" loading={loading} scroll={{ x: 1800 }} />

      {/* Modal thêm/sửa nhân viên */}
      <Modal title={editingId ? "Cập Nhật Nhân Viên" : "Thêm Nhân Viên Mới"} open={isModalVisible} onOk={handleSave} onCancel={() => setIsModalVisible(false)} width={800} okText="Lưu" cancelText="Hủy">
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              {/* Trường tài khoản (cho phép sửa khi edit) */}
              <Form.Item name="taikhoan" label="Tài khoản" rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}>
                <Input /> 
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="matkhau" label="Mật khẩu" rules={[{ required: !editingId, message: 'Vui lòng nhập mật khẩu!' }]}>
                <Input.Password placeholder={editingId ? "Bỏ trống nếu không đổi mật khẩu" : ""} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="tennv" label="Tên nhân viên" rules={[{ required: true, message: 'Vui lòng nhập tên nhân viên!' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sdt"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  { pattern: /^\d{10}$/, message: 'Số điện thoại phải gồm 10 chữ số!' }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="ngaysinh" label="Ngày sinh" rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gioitinh" label="Giới tính" rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]} initialValue={true}>
                <Select>
                  <Select.Option value={true}>Nam</Select.Option>
                  <Select.Option value={false}>Nữ</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="diachi" label="Địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}>
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              {/* Trường email kèm kiểm tra định dạng */}
              <Form.Item 
                name="email" 
                label="Email" 
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không đúng định dạng (VD: abc@gmail.com)!' }
                ]}
              >
                <Input placeholder="VD: nguyenvan@gmail.com" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="quyen" label="Phân quyền" rules={[{ required: true, message: 'Vui lòng chọn phân quyền!' }]} initialValue={false}>
                <Select>
                  <Select.Option value={false}>Nhân viên Sales</Select.Option>
                  <Select.Option value={true}>Quản lý</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="trangthai" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]} initialValue={true}>
                <Select>
                  <Select.Option value={true}>Đang làm</Select.Option>
                  <Select.Option value={false}>Nghỉ việc</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

        </Form>
      </Modal>

      {/* Modal tra cứu nhân viên */}
      <Modal
        title="Tra Cứu Nhân Viên"
        open={isSearchModalVisible}
        onOk={handleSearch}
        onCancel={closeSearchModal}
        okText="Tra cứu"
        cancelText="Hủy"
      >
        <Form form={searchForm} layout="vertical">
          <Form.Item
            name="keyword"
            label="Thông tin cần tra cứu"
            rules={[
              {
                validator: (_, value) => (value && value.trim() ? Promise.resolve() : Promise.reject(new Error('Vui lòng nhập tiêu chí tra cứu!'))),
              },
            ]}
          >
            <Input placeholder="Nhập tên, tài khoản, email..." />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default QuanLyNhanVien;