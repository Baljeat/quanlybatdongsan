import { Card, Row, Col, Typography, Statistic, Table, Tag, Button } from 'antd';
import { 
  HomeOutlined, 
  RiseOutlined, 
  DollarCircleOutlined, 
  KeyOutlined, 
  EyeOutlined 
} from '@ant-design/icons';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

const { Title, Text } = Typography;

// Mock data giả lập (Lân hãy kết nối với mockProperties của bạn nhé)
const mockData = [
  { id: 1, title: "Căn hộ Vinhomes", type: 'apartment', status: 'available', price: 3500000000, district: 'Quận 9', city: 'TP.HCM', images: ['https://via.placeholder.com/150'] },
  { id: 2, title: "Nhà phố liền kề", type: 'house', status: 'sold', price: 7200000000, district: 'Quận 7', city: 'TP.HCM', images: ['https://via.placeholder.com/150'] },
  { id: 3, title: "Biệt thự sân vườn", type: 'villa', status: 'available', price: 15000000000, district: 'Quận 2', city: 'TP.HCM', images: ['https://via.placeholder.com/150'] },
];

export default function Dashboard() {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const formatCurrency = (value) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)} tỷ`;
    return `${(value / 1000000).toFixed(0)} tr`;
  };

  // Logic xử lý dữ liệu cho biểu đồ (giữ nguyên từ Figma của bạn)
  const propertyTypeData = [
    { name: 'Căn hộ', value: 45 },
    { name: 'Nhà phố', value: 25 },
    { name: 'Biệt thự', value: 15 },
    { name: 'Đất nền', value: 10 },
  ];

  const monthlyData = [
    { month: 'T1', revenue: 45000 }, { month: 'T2', revenue: 52000 },
    { month: 'T3', revenue: 48000 }, { month: 'T4', revenue: 61000 },
    { month: 'T5', revenue: 55000 }, { month: 'T6', revenue: 67000 }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Tổng quan</Title>
        <Text type="secondary">Thống kê và báo cáo hệ thống quản lý bất động sản</Text>
      </div>

      {/* Stats Grid */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic 
              title="Tổng BĐS" 
              value={128} 
              prefix={<HomeOutlined style={{ color: '#3b82f6' }} />} 
            />
            <Text type="success">+12% so với tháng trước</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic 
              title="Đang bán" 
              value={84} 
              prefix={<KeyOutlined style={{ color: '#10b981' }} />} 
            />
            <Text type="secondary">65% tổng số</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic 
              title="Đã giao dịch" 
              value={32} 
              prefix={<RiseOutlined style={{ color: '#f59e0b' }} />} 
            />
            <Text type="warning">Tháng này</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic 
              title="Giá trị TB" 
              value={4.2} 
              suffix="tỷ"
              prefix={<DollarCircleOutlined style={{ color: '#8b5cf6' }} />} 
            />
            <Text type="secondary">Đơn vị: VNĐ</Text>
          </Card>
        </Col>
      </Row>

      {/* Charts Grid */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Phân loại BĐS" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={propertyTypeData}
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {propertyTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Doanh thu 6 tháng (triệu VNĐ)" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Recent Properties Table */}
      <Card 
        title="BĐS mới nhất" 
        bordered={false}
        extra={<Button type="link" icon={<EyeOutlined />}>Xem tất cả</Button>}
      >
        <Table 
          dataSource={mockData} 
          rowKey="id" 
          pagination={false}
          columns={[
            {
              title: 'Bất động sản',
              render: (record) => (
                <Space>
                  <img src={record.images[0]} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectCover: 'cover' }} />
                  <div>
                    <Text strong>{record.title}</Text><br />
                    <Text type="secondary" size="small">{record.district}, {record.city}</Text>
                  </div>
                </Space>
              )
            },
            {
              title: 'Giá',
              dataIndex: 'price',
              render: (price) => <Text strong>{formatCurrency(price)}</Text>
            },
            {
              title: 'Trạng thái',
              dataIndex: 'status',
              render: (status) => (
                <Tag color={status === 'available' ? 'green' : 'red'}>
                  {status === 'available' ? 'Đang bán' : 'Đã bán'}
                </Tag>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
}

// Helper component Space cho Table
function Space({ children }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>{children}</div>;
}