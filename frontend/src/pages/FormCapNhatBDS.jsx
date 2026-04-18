import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, message, Upload, Image, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import api from '../services/api';

const FormCapNhatBDS = ({ visible, record, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [previewImage, setPreviewImage] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);

    useEffect(() => {
        if (visible && record) {
            form.setFieldsValue({
              ...record,
              dientich: record.dientich,
              dongia: record.dongia
            });
            if (record.hinhanh) {
              const base64 = typeof record.hinhanh === 'string' ? record.hinhanh : null;
              setTimeout(() => setPreviewImage(base64), 0);
            } else {
              setTimeout(() => setPreviewImage(null), 0);
            }
        }
    }, [visible, record, form]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            let payload = {
              ...values,
              dientich: Number(values.dientich),
              dongia: Number(values.dongia)
            };

            if (uploadFile) {
              const reader = new FileReader();
              reader.readAsDataURL(uploadFile);
              await new Promise((resolve, reject) => {
                reader.onload = () => {
                  payload.hinhanh = reader.result;
                  resolve();
                };
                reader.onerror = reject;
              });
            }

            const response = await api.put(`/batdongsan/${record.bdsid}`, payload);

            message.success(response.data.message);
            onSuccess();
        } catch (error) {
            const msg = error.response?.data?.message || "Có lỗi xảy ra";
            message.error(msg);
        }
    };

    return (
        <Modal
            title="CẬP NHẬT BẤT ĐỘNG SẢN"
            open={visible}
            onOk={handleSave} 
            onCancel={() => {
              form.resetFields();
              setPreviewImage(null);
              setUploadFile(null);
              onCancel();
            }} 
            okText="Lưu thay đổi"
            cancelText="Hủy bỏ"
        >
            <Form form={form} layout="vertical">
                <Form.Item name="masoqsdd" label="Mã số QSDĐ" rules={[{ required: true, message: 'Mã số QSDĐ không được để trống' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="tenduong" label="Tên đường" rules={[{ required: true, message: 'Tên đường không được để trống' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="dientich" label="Diện tích (m2)" rules={[{ required: true, message: 'Diện tích không được để trống' }]}>
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="dongia" label="Đơn giá (VNĐ)" rules={[{ required: true, message: 'Đơn giá không được để trống' }]}>
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="chieudai" label="Chiều dài (m)">
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="chieurong" label="Chiều rộng (m)">
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="huehong" label="Huê hồng (%)">
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="sonha" label="Số nhà">
                    <Input />
                </Form.Item>
                <Form.Item name="phuong" label="Phường">
                    <Input />
                </Form.Item>
                <Form.Item name="quan" label="Quận">
                    <Input />
                </Form.Item>
                <Form.Item name="thanhpho" label="Thành phố">
                    <Input />
                </Form.Item>
                <Form.Item name="mota" label="Mô tả">
                    <Input.TextArea rows={4} />
                </Form.Item>
                <Form.Item name="loaiid" label="Loại ID">
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="khid" label="KH ID">
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="tinhtrang" label="Tình trạng">
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="Hình ảnh">
                    <Upload
                        beforeUpload={(file) => {
                            setUploadFile(file);
                            const reader = new FileReader();
                            reader.onload = () => setPreviewImage(reader.result);
                            reader.readAsDataURL(file);
                            return false;
                        }}
                        showUploadList={false}
                    >
                        <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                    </Upload>
                    {previewImage && <Image src={previewImage} width={200} style={{ marginTop: 10 }} />}
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default FormCapNhatBDS;