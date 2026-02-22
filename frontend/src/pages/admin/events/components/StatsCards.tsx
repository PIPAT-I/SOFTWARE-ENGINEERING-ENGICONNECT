import { Card, Row, Col, Typography } from "antd";

const { Title, Text } = Typography;

interface StatItem {
    title: string;
    count: number;
    icon: React.ReactNode;
    id: number;
}

interface StatsCardsProps {
    stats: StatItem[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
    return (
        <Row gutter={[16, 16]} style={{ marginBottom: "32px" }}>
            {stats.map((stat) => (
                <Col xs={24} sm={12} md={6} key={stat.id}>
                    <Card
                        hoverable
                        style={{ borderRadius: "12px", border: "1px solid #f0f0f0" }}
                        bodyStyle={{ padding: "20px" }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                            }}
                        >
                            <div>
                                <Text type="secondary">{stat.title}</Text>
                                <Title level={2} style={{ margin: "8px 0 0" }}>
                                    {stat.count}
                                </Title>
                            </div>
                            <div style={{ fontSize: "24px", color: "#595959" }}>
                                {stat.icon}
                            </div>
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};
