import {
    Layout,
    Card,
    Typography,
    Button,
    Segmented,
    Select,
    Space,
    ConfigProvider,
} from "antd";
import { PlusOutlined, FilterOutlined } from "@ant-design/icons";
import type { Post } from "../../../../interfaces/post";
import { ActivityCard } from "./ActivityCard";
import { StatsCards } from "./StatsCards";

const { Title, Text } = Typography;

interface StatItem {
    title: string;
    count: number;
    icon: React.ReactNode;
    id: number;
}

interface DashboardViewProps {
    stats: StatItem[];
    currentTab: string;
    filterType: string;
    filteredPosts: Post[];
    loading: boolean;
    formatDateDisplay: (dateStr: string | Date | undefined) => string;
    renderStatusTag: (status: string) => React.ReactNode;
    getStatusName: (post: Post) => string;
    onTabChange: (tab: string) => void;
    onFilterChange: (filter: string) => void;
    onOpenCreate: () => void;
    onViewDetail: (item: Post) => void;
    onEdit: (item: Post) => void;
    onDelete: (id: number) => void;
    onReject: (item: Post) => void;
    onApprove: (item: Post) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
    stats,
    currentTab,
    filterType,
    filteredPosts,
    loading,
    formatDateDisplay,
    renderStatusTag,
    getStatusName,
    onTabChange,
    onFilterChange,
    onOpenCreate,
    onViewDetail,
    onEdit,
    onDelete,
    onReject,
    onApprove,
}) => {
    return (
        <Layout
            style={{ minHeight: "100vh", background: "#fff", padding: "24px" }}
        >
            <StatsCards stats={stats} />

            <div style={{ marginBottom: "32px" }}>
                <ConfigProvider
                    theme={{
                        components: {
                            Segmented: {
                                borderRadius: 24,
                                borderRadiusLG: 24,
                                itemSelectedBg: "#fff",
                                trackBg: "#f0f0f0",
                            },
                        },
                    }}
                >
                    <Segmented
                        block
                        options={["กิจกรรมทั้งหมด", "โพสต์รออนุมัติ", "ไม่อนุมัติ"]}
                        value={currentTab}
                        onChange={(val) => onTabChange(val as string)}
                        size="large"
                        style={{ padding: "4px", borderRadius: "24px" }}
                    />
                </ConfigProvider>
            </div>

            <Card
                style={{
                    borderRadius: "16px",
                    border: "1px solid #d9d9d9",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
                bodyStyle={{ padding: "32px" }}
            >
                <div style={{ marginBottom: "24px" }}>
                    <Title level={3} style={{ marginBottom: "16px" }}>
                        {currentTab}
                    </Title>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "16px",
                        }}
                    >
                        {currentTab === "กิจกรรมทั้งหมด" && (
                            <Space>
                                <FilterOutlined style={{ color: "#bfbfbf" }} />
                                <Text type="secondary">Filter:</Text>
                                <Select
                                    value={filterType}
                                    onChange={onFilterChange}
                                    style={{ width: 160, background: "#f5f5f5" }}
                                    bordered={false}
                                    options={[
                                        { value: "all", label: "ทั้งหมด" },
                                        { value: "approved", label: "อนุมัติแล้ว" },
                                        { value: "active", label: "กำลังดำเนินการ" },
                                        { value: "upcoming", label: "รอใช้งาน" },
                                        { value: "ended", label: "สิ้นสุดแล้ว" },
                                    ]}
                                />
                            </Space>
                        )}

                        {currentTab === "กิจกรรมทั้งหมด" && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={onOpenCreate}
                                style={{
                                    background: "#000",
                                    borderColor: "#000",
                                    borderRadius: "8px",
                                    height: "40px",
                                    padding: "0 24px",
                                }}
                            >
                                สร้างกิจกรรมใหม่
                            </Button>
                        )}
                    </div>
                </div>

                <Space direction="vertical" style={{ width: "100%" }} size="large">
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "20px" }}>
                            กำลังโหลดข้อมูล...
                        </div>
                    ) : filteredPosts.length === 0 ? (
                        <div
                            style={{ textAlign: "center", padding: "20px", color: "#999" }}
                        >
                            ไม่พบข้อมูล
                        </div>
                    ) : (
                        filteredPosts.map((item) => (
                            <ActivityCard
                                key={`post-${item.ID}`}
                                item={item}
                                currentTab={currentTab}
                                formatDateDisplay={formatDateDisplay}
                                renderStatusTag={renderStatusTag}
                                getStatusName={getStatusName}
                                onViewDetail={onViewDetail}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onReject={onReject}
                                onApprove={onApprove}
                            />
                        ))
                    )}
                </Space>
            </Card>
        </Layout>
    );
};
