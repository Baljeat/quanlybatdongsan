import React, { useEffect, useState } from "react";
import { Table, Button, Input, Space, Card, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { getBatDongSan } from "../services/api";
import FormChiTietBDS from "./FormChiTietBDS";
import HinhAnhBDS from "./HinhAnhBDS";
import TraCuuBDS from "./FormTraCuuBDS";
import FormCapNhatBDS from './FormCapNhatBDS';

const DanhSachBDS = () => {
  const [listBDS, setListBDS] = useState([]);
  const [originalListBDS, setOriginalListBDS] = useState([]);
  const [chiTietVisible, setChiTietVisible] = useState(false);
  const [selectedBDSId, setSelectedBDSId] = useState(null);
  const [isImgOpen, setIsImgOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const fetchData = async () => {
      try {
        const response = await getBatDongSan();
        setListBDS(response.data);
        setOriginalListBDS(response.data);
        setIsFiltered(false);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      }
    };

  useEffect(() => {
    const run = async () => {
      await fetchData();
    };
    run();
  }, []); //

  const handleOpenDetail = (id) => {
    setSelectedBDSId(id);
    setChiTietVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: "Mã số QSDĐ",
      dataIndex: "masoqsdd",
      key: "masoqsdd",
      render: (text) => <b>{text}</b>,
    },
    { title: "Tên đường", dataIndex: "tenduong", key: "tenduong" },
    {
      title: "Diện tích",
      dataIndex: "dientich",
      render: (val) => `${val} m²`,
    },
    {
      title: "Đơn giá",
      dataIndex: "dongia",
      render: (val) => `${val?.toLocaleString()} VNĐ`,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => handleOpenDetail(record.bdsid)}>
            Xem chi tiết
          </Button>

          <Button
            onClick={() => {
              setSelectedBDSId(record.bdsid);
              setIsImgOpen(true);
            }}
          >
            Xem hình
          </Button>

          <Button
            style={{ backgroundColor: "#77d4a9", color: "#000" }} 
            onClick={() => handleEdit(record)}
          >
            Cập nhật
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      <Card>
        <Typography.Title level={2}>Quản Lý Bất Động Sản</Typography.Title>

        {/* Form Tra cứu Bất Động Sản */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginBottom: 20,
          }}
        >
          {isFiltered && (
            <Button
              onClick={() => {
                setListBDS(originalListBDS);
                setIsFiltered(false);
              }}
            >
              Quay về danh sách
            </Button>
          )}
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => setIsSearchOpen(true)}
          >
            Tra cứu Bất động sản
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={listBDS}
          rowKey="bdsid"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      {/* Form chi tiết bất động sản */}
      <FormChiTietBDS
        bdsId={selectedBDSId}
        visible={chiTietVisible}
        onCancel={() => setChiTietVisible(false)}
      />

      {/* Form hình ảnh bất động sản */}
      <HinhAnhBDS
        bdsId={selectedBDSId}
        visible={isImgOpen}
        onCancel={() => setIsImgOpen(false)}
      />

      {/* Form tra cứu bất động sản */}
      <TraCuuBDS
        visible={isSearchOpen}
        onCancel={() => {
          setIsSearchOpen(false);
          setListBDS(originalListBDS);
          setIsFiltered(false);
        }}
        onSearchSuccess={(results) => {
          setListBDS(results);
          setIsFiltered(true);
          setIsSearchOpen(false);
        }}
      />

      {/* Form cập nhật bất động sản */}
      <FormCapNhatBDS
        visible={isModalOpen}
        record={editingRecord}
        onCancel={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchData();
        }}
      />
    </div>
  );
};

export default DanhSachBDS;
