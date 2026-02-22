import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, Space, Tag, message, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { DataType, ParticipantType } from './types';
import { GetParticipantsByActivity } from './helpers';
import CertificatePreviewModal from './CertificatePreviewModal';

const { Title, Text } = Typography;

interface ParticipantListContentProps {
    onBack: () => void;
    activity?: DataType | null;
    certTemplate?: any;
}

const ParticipantListContent: React.FC<ParticipantListContentProps> = ({ onBack, activity, certTemplate }) => {
    const [participants, setParticipants] = useState<ParticipantType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);


    // Preview State
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!activity) return;
            setLoading(true);
            try {
                const data = await GetParticipantsByActivity(activity.key);
                setParticipants(data);
            } catch (error) {
                console.error(error);
                message.error("ไม่สามารถโหลดรายชื่อได้");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activity]);

    const handlePreview = (record: ParticipantType) => {
        if (!certTemplate) {
            message.warning("กรุณาสร้างเทมเพลตใบประกาศก่อน");
            return;
        }

        setPreviewData({
            template_participation: certTemplate.picture_participation,
            template_winner: certTemplate.picture_winner,
            name: record.name,
            title_th: certTemplate.title_th || activity?.activity,
            activity: activity?.activity,
            detail: certTemplate.detail,
            organizer: certTemplate.organizer,
            date: certTemplate.date || activity?.dateHeld || new Date().toLocaleDateString('th-TH'),
            award: record.award,
            hasAward: record.award !== '-'
        });
        setPreviewOpen(true);
    };

    const columns: ColumnsType<ParticipantType> = [
        { title: 'รหัสนักศึกษา', dataIndex: 'studentId', key: 'studentId' },
        { title: 'ชื่อ-นามสกุล', dataIndex: 'name', key: 'name' },
        { title: 'สาขาวิชา', dataIndex: 'department', key: 'department' },
        {
            title: 'รางวัล',
            dataIndex: 'award',
            key: 'award',
            render: (award) => award !== '-' ? <Tag color="gold">{award}</Tag> : <Text type="secondary">-</Text>
        },
        {
            title: 'การจัดการ',
            key: 'action',
            render: (_, record) => (
                <Button
                    size="small"
                    onClick={() => handlePreview(record)}
                    style={{ borderRadius: 6, padding: '0 16px' }}
                >
                    ใบประกาศ
                </Button>
            )
        },
    ];



    return (
        <div style={{ width: '100%', margin: '0 auto' }}>
            <div style={{ marginBottom: 24, cursor: 'pointer' }} onClick={onBack}>
                <Space><ArrowLeftOutlined /><Text>ย้อนกลับ</Text></Space>
            </div>
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ marginBottom: 4 }}>{activity?.activity}</Title>
                <Text type="secondary">ออกใบประกาศสำหรับกิจกรรมที่สิ้นสุดแล้ว ({participants.length} คน)</Text>
            </div>

            <Card style={{ borderRadius: 12, padding: 0 }} bodyStyle={{ padding: 0 }}>
                <Table<ParticipantType>
                    columns={columns}
                    dataSource={participants}
                    loading={loading}
                    pagination={false}
                />
            </Card>

            {previewData && (
                <CertificatePreviewModal
                    open={previewOpen}
                    onCancel={() => setPreviewOpen(false)}
                    data={previewData}
                />
            )}
        </div>
    );
};

export default ParticipantListContent;
