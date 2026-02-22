import { Card, Typography, Image, Space, Button, Tag, Popconfirm, ConfigProvider } from "antd";
import {
  ClockCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { Post } from "../../../../interfaces/post";

const { Title, Text } = Typography;

interface ActivityCardProps {
  item: Post;
  currentTab: string;
  formatDateDisplay: (dateStr: string | Date | undefined) => string;
  renderStatusTag: (status: string) => React.ReactNode;
  getStatusName: (post: Post) => string;
  onViewDetail: (item: Post) => void;
  onEdit: (item: Post) => void;
  onDelete: (id: number) => void;
  onReject: (item: Post) => void;
  onApprove: (item: Post) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  item,
  currentTab,
  formatDateDisplay,
  renderStatusTag,
  getStatusName,
  onViewDetail,
  onEdit,
  onDelete,
  onReject,
  onApprove,
}) => {
  return (
    <Card
      key={`post-${item.ID}`}
      hoverable
      style={{
        borderRadius: "16px",
        border: "none",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        overflow: "hidden",
        marginBottom: "24px",
      }}
      bodyStyle={{ padding: "0" }}
    >
      <div
        style={{
          height: "220px",
          width: "100%",
          position: "relative",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Image
          alt={item.title}
          src={
            item.picture
              ? item.picture.startsWith("data:")
                ? item.picture
                : `data:image/jpeg;base64,${item.picture}`
              : "https://via.placeholder.com/800x400?text=Activity"
          }
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          preview={false}
          width="100%"
          height="100%"
        />
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 1,
          }}
        >
          <Tag
            color="rgba(0,0,0,0.6)"
            style={{
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "4px 12px",
              backdropFilter: "blur(4px)",
              fontWeight: 500,
            }}
          >
            {item.type || "Activity"}
          </Tag>
        </div>
      </div>

      <div style={{ padding: "24px" }}>
        <div style={{ marginBottom: "20px" }}>
          <Title level={3} style={{ margin: "0 0 12px 0" }}>
            {item.title}
          </Title>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Space size={16} style={{ color: "#666", fontSize: "15px" }}>
              <Space>
                <ClockCircleOutlined />
                {formatDateDisplay(item.start_date || new Date())}
              </Space>
              {renderStatusTag(getStatusName(item))}
            </Space>
            <div style={{ color: "#666", fontSize: "15px" }}>
              <Text type="secondary">โดย: </Text>
              {item.organizer}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "16px",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <ConfigProvider
            theme={{
              components: {
                Button: {
                  defaultHoverBorderColor: "#000",
                  defaultHoverColor: "#000",
                  defaultActiveBorderColor: "#000",
                  defaultActiveColor: "#000",
                },
              },
            }}
          >
            <Button
              icon={<EyeOutlined />}
              onClick={() => onViewDetail(item)}
              size="large"
              style={{ borderRadius: "8px" }}
            >
              ดูรายละเอียด
            </Button>
          </ConfigProvider>

          <Space>
            {currentTab === "กิจกรรมทั้งหมด" ? (
              <>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(item)}
                  style={{ color: "#0c0c0cff" }}
                >
                  แก้ไข
                </Button>
                <Popconfirm
                  title="ยืนยันการลบ?"
                  onConfirm={() => onDelete(item.ID)}
                  okText="ลบ"
                  cancelText="ยกเลิก"
                  okButtonProps={{ danger: true }}
                  icon={null}
                >
                  <Button type="text" danger icon={<DeleteOutlined />}>
                    ลบ
                  </Button>
                </Popconfirm>
              </>
            ) : currentTab === "ไม่อนุมัติ" ? null : (
              <>
                <Button danger onClick={() => onReject(item)}>
                  ไม่อนุมัติ
                </Button>
                <Popconfirm
                  title="ยืนยันการอนุมัติ?"
                  onConfirm={() => onApprove(item)}
                  okText="อนุมัติ"
                  cancelText="ยกเลิก"
                  okButtonProps={{ style: { backgroundColor: "#000", borderColor: "#000" } }}
                  icon={null}
                >
                  <Button
                    type="primary"
                    style={{ backgroundColor: "#161616ff", borderColor: "#161616ff" }}
                  >
                    อนุมัติ
                  </Button>
                </Popconfirm>
              </>
            )}
          </Space>
        </div>
      </div>
    </Card>
  );
};
