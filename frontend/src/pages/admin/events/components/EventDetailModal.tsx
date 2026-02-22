import React from "react";
import { Modal, Button, Descriptions, Typography, Space, Tag, Image } from "antd";
import {
    UserOutlined,
    CalendarOutlined,
    CheckSquareFilled,
    SyncOutlined,
    ClockCircleOutlined,
    StopOutlined,
} from "@ant-design/icons";
import type { Post } from "../../../../interfaces/post";

const { Text } = Typography;

interface EventDetailModalProps {
    open: boolean;
    onClose: () => void;
    post: Post | null;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ open, onClose, post }) => {
    const formatDateDisplay = (dateStr: string | Date | undefined) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const renderStatusTag = (status: string) => {
        switch (status?.toLowerCase()) {
            case "active":
                return (
                    <Tag color="success" icon={<SyncOutlined spin />}>
                        กำลังดำเนินการ
                    </Tag>
                );
            case "upcoming":
                return (
                    <Tag color="blue" icon={<ClockCircleOutlined />}>
                        รอใช้งาน
                    </Tag>
                );
            case "ended":
                return (
                    <Tag color="default" icon={<StopOutlined />}>
                        สิ้นสุดแล้ว
                    </Tag>
                );
            case "approved":
                return (
                    <Tag color="cyan" icon={<CheckSquareFilled />}>
                        อนุมัติแล้ว
                    </Tag>
                );
            case "pending":
                return <Tag color="warning">รออนุมัติ</Tag>;
            case "rejected":
                return <Tag color="error">ไม่อนุมัติ</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    const getStatusName = (post: Post): string => {
        return post?.status?.status_name?.toLowerCase() || "pending";
    };

    return (
        <Modal
            title="รายละเอียดกิจกรรม"
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    ปิด
                </Button>,
            ]}
            width={700}
        >
            {post && (
                <div>
                    {post.picture && (
                        <div style={{ textAlign: "center", marginBottom: "24px" }}>
                            <Image
                                width={300}
                                src={
                                    post.picture.startsWith("data:")
                                        ? post.picture
                                        : `data:image/jpeg;base64,${post.picture}`
                                }
                                alt="Activity Cover"
                                style={{ borderRadius: "8px", objectFit: "cover" }}
                            />
                        </div>
                    )}
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="ชื่อกิจกรรม">
                            <Text strong>{post.title}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="สถานะ">
                            {renderStatusTag(getStatusName(post))}
                        </Descriptions.Item>
                        <Descriptions.Item label="รายละเอียด">
                            <div style={{ whiteSpace: "pre-wrap" }}>{post.detail}</div>
                        </Descriptions.Item>
                        <Descriptions.Item label="ผู้จัดกิจกรรม">
                            <Space>
                                <UserOutlined /> {post.organizer || "-"}
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="ประเภท">
                            <Tag color="purple">{post.type || "-"}</Tag>
                        </Descriptions.Item>
                        {post.start_date && (
                            <Descriptions.Item label="วันที่เริ่มต้น">
                                <Space>
                                    <CalendarOutlined /> {formatDateDisplay(post.start_date)}
                                </Space>
                            </Descriptions.Item>
                        )}
                        {post.stop_date && (
                            <Descriptions.Item label="วันที่สิ้นสุด">
                                <Space>
                                    <CalendarOutlined /> {formatDateDisplay(post.stop_date)}
                                </Space>
                            </Descriptions.Item>
                        )}
                        {post.start && (
                            <Descriptions.Item label="ลงทะเบียน">
                                <Space direction="vertical">
                                    <Text>เริ่ม: {formatDateDisplay(post.start)}</Text>
                                    <Text>สิ้นสุด: {formatDateDisplay(post.stop)}</Text>
                                </Space>
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                </div>
            )}
        </Modal>
    );
};

export default EventDetailModal;
