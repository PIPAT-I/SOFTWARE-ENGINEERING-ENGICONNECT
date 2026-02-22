import React from 'react';
import { Card, Table, Button, Typography, Space, Tag, Row, Col, Image, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    ClockCircleOutlined,
    EyeOutlined,
    HistoryOutlined,
    StarFilled,
    CheckSquareOutlined,
    PictureOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined
} from '@ant-design/icons';
import type { DataType } from './types';
import { customStyles } from './styles';

const { Title, Text } = Typography;

interface DashboardContentProps {
    onCreateClick: (item: DataType) => void;
    onEditClick: (item: DataType) => void;
    onDeleteClick: (id: number) => void;
    onViewParticipants: (item: DataType) => void;
    tableData: DataType[];
    loading: boolean;
    stats: { total: number; approved: number; pending: number };
}

const DashboardContent: React.FC<DashboardContentProps> = ({ onCreateClick, onEditClick, onDeleteClick, onViewParticipants, tableData, loading }) => {

    const columns: ColumnsType<DataType> = [
        { title: 'กิจกรรม', dataIndex: 'activity', key: 'activity' },
        { title: 'ประเภท', dataIndex: 'category', key: 'category' },
        { title: 'วันที่จัด', dataIndex: 'dateHeld', key: 'dateHeld' },
        {
            title: 'ใบประกาศ',
            key: 'certStatus',
            render: (_, record) => (
                record.hasCertificate ? <Tag color="gold">พร้อมใช้งาน (2 เทมเพลต)</Tag> : <Tag color="blue">รอสร้างเทมเพลต</Tag>
            )
        },
        {
            title: 'สถานะกิจกรรม',
            key: 'status',
            render: (_, record) => {
                const isExpired = record.stopDate ? new Date() > new Date(record.stopDate) : false;
                return <Tag color={isExpired ? 'default' : 'green'}>{isExpired ? 'สิ้นสุดกิจกรรม' : 'กำลังดำเนินการ'}</Tag>;
            }
        },
    ];

    const statCards = [
        { title: 'กิจกรรมสิ้นสุดแล้ว', count: tableData.length, icon: <HistoryOutlined />, id: 1 },
        { title: 'สร้างเทมเพลตแล้ว', count: tableData.filter(d => d.hasCertificate).length, icon: <CheckSquareOutlined />, id: 2 },
        { title: 'ใบประกาศที่รอสร้าง', count: tableData.filter(d => !d.hasCertificate).length, icon: <ClockCircleOutlined />, id: 3 },
    ];

    return (
        <div style={{ width: '100%', margin: '0 auto' }}>
            <style>{customStyles}</style>

            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
                {statCards.map((stat) => (
                    <Col xs={24} sm={12} md={8} key={stat.id}>
                        <Card hoverable style={{ borderRadius: '12px', border: '1px solid #f0f0f0' }} bodyStyle={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <Text type="secondary" style={{ fontSize: '14px' }}>{stat.title}</Text>
                                    <Title level={2} style={{ margin: '4px 0 0', fontWeight: 'bold' }}>{stat.count}</Title>
                                </div>
                                <div style={{ fontSize: '24px', color: '#8c8c8c' }}>{stat.icon}</div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* รายการกิจกรรม */}
            <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <Title level={4} style={{ margin: 0 }}>ใบประกาศนียบัตร</Title>
                        <Text type="secondary">ออกใบประกาศนียบัตรให้กับผู้เข้าร่วมกิจกรรม</Text>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>กำลังโหลดข้อมูล...</div>
                ) : tableData.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#999', padding: '40px', background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0' }}>
                        <HistoryOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                        <div>ขณะนี้ไม่มีกิจกรรมที่สิ้นสุดลง</div>
                    </div>
                ) : (
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        {tableData.map((item) => {
                            const displayImg = item.picture || item.certImage;
                            const imgSrc = displayImg
                                ? (displayImg.startsWith('data:') || displayImg.startsWith('http')
                                    ? displayImg
                                    : `data:image/jpeg;base64,${displayImg}`)
                                : null;

                            return (
                                <Card
                                    key={item.key}
                                    hoverable
                                    style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e8e8e8', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                                    bodyStyle={{ padding: 0 }}
                                >
                                    <div style={{ height: '220px', width: '100%', position: 'relative', backgroundColor: '#f0f0f0' }}>
                                        {imgSrc ? (
                                            <Image
                                                alt={item.activity}
                                                src={imgSrc}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                preview={false}
                                                width={'100%'}
                                                height={'220px'}
                                            />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bfbfbf' }}>
                                                <PictureOutlined style={{ fontSize: 48 }} />
                                            </div>
                                        )}
                                        <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: '8px' }}>
                                            <Tag color="white" style={{ color: 'black', borderRadius: 10, fontWeight: 500, border: 'none', padding: '4px 12px' }}>
                                                {item.category}
                                            </Tag>
                                        </div>
                                        {item.hasCertificate && (
                                            <div style={{ position: 'absolute', top: 16, left: 16 }}>
                                                <Tag color="gold" style={{ borderRadius: 10, fontWeight: 500, padding: '4px 12px', border: 'none' }}>
                                                    <StarFilled /> เทมเพลตพร้อมใช้งาน (Participation & Winners)
                                                </Tag>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ padding: '20px 24px' }}>
                                        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                                            <Col>
                                                <Title level={4} style={{ margin: 0 }}>{item.activity}</Title>
                                                <Space size="middle" style={{ marginTop: 8 }}>
                                                    <Text type="secondary"><ClockCircleOutlined /> จัดเมื่อ: {item.dateHeld}</Text>
                                                    {item.organizer && <Text type="secondary">โดย: {item.organizer}</Text>}
                                                </Space>
                                            </Col>
                                            <Col>
                                                {item.hasCertificate && (
                                                    <Space>
                                                        <Button
                                                            icon={<EditOutlined />}
                                                            className="btn-outline-hover-black"
                                                            onClick={() => onEditClick(item)}
                                                        />
                                                        <Popconfirm
                                                            title="ยืนยันการลบ?"
                                                            onConfirm={() => onDeleteClick(item.activityID)}
                                                            okText="ลบ"
                                                            cancelText="ยกเลิก"
                                                            okButtonProps={{ danger: true }}
                                                        >
                                                            <Button danger icon={<DeleteOutlined />} />
                                                        </Popconfirm>
                                                    </Space>
                                                )}
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col>
                                                <Button
                                                    size="large"
                                                    icon={<EyeOutlined />}
                                                    className="btn-outline-hover-black"
                                                    onClick={() => onViewParticipants(item)}
                                                    style={{ borderRadius: 8, minWidth: 160 }}
                                                >
                                                    รายชื่อนักศึกษา
                                                </Button>
                                            </Col>
                                            <Col flex="auto">
                                                {!item.hasCertificate ? (
                                                    <Button
                                                        type="primary"
                                                        size="large"
                                                        block
                                                        icon={<PlusOutlined />}
                                                        onClick={() => onCreateClick(item)}
                                                        style={{
                                                            background: 'black',
                                                            borderColor: 'black',
                                                            borderRadius: 8,
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        สร้างใบประกาศ
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="primary"
                                                        size="large"
                                                        block
                                                        onClick={() => onViewParticipants(item)}
                                                        style={{
                                                            background: 'black',
                                                            borderColor: 'black',
                                                            borderRadius: 8,
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        ดำเนินการออกใบประกาศและพิมพ์
                                                    </Button>
                                                )}
                                            </Col>
                                        </Row>
                                    </div>
                                </Card>
                            );
                        })}
                    </Space>
                )}
            </div>

            {/* History Table */}
            <div style={{ marginBottom: 40 }}>
                <Space style={{ marginBottom: 16 }}>
                    <HistoryOutlined />
                    <Text strong>ประวัติการจัดการ</Text>
                </Space>

                <Table<DataType>
                    columns={columns}
                    dataSource={tableData}
                    loading={loading}
                    pagination={{ pageSize: 5 }}
                    style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #f0f0f0' }}
                />
            </div>
        </div>
    );
};

export default DashboardContent;
