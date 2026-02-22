import React, { useState, useEffect } from 'react';
import {
    Layout, Card, Button, Typography, Space, Tag, Row, Col,
    message, Spin, Empty, Modal, Input, Table
} from 'antd';
import {
    PrinterOutlined,
    ClockCircleOutlined,
    PictureOutlined,
    SearchOutlined
} from '@ant-design/icons';
import { GetMyCertificate } from '../../../services/certificateService';
import { GetMyRegistrations } from '../../../services/registrationService';

const { Content } = Layout;
const { Title, Text } = Typography;

// --- CSS Override (Original Style) ---
const customStyles = `
  .ant-btn-primary {
    background-color: black !important;
    border-color: black !important;
  }
  .ant-btn-primary:hover, .ant-btn-primary:focus {
    background-color: #333 !important;
    border-color: #333 !important;
  }
  .cert-card {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #f0f0f0;
    transition: all 0.3s ease;
  }
  .cert-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  /* Pagination Black Style */
  .ant-pagination-item-active {
    border-color: black !important;
  }
  .ant-pagination-item-active a {
    color: black !important;
  }
  .ant-pagination-item:hover {
    border-color: black !important;
  }
  .ant-pagination-item:hover a {
    color: black !important;
  }
  .ant-pagination-prev:hover .ant-pagination-item-link,
  .ant-pagination-next:hover .ant-pagination-item-link {
    border-color: black !important;
    color: black !important;
  }

  /* Global Button Black Style (Remove Blue) */
  .ant-btn:hover, .ant-btn:focus {
    color: black !important;
    border-color: black !important;
  }
  .ant-btn-primary:hover, .ant-btn-primary:focus {
    color: white !important;
    background-color: #333 !important;
    border-color: #333 !important;
  }
  .ant-btn:active {
    color: black !important;
    border-color: black !important;
  }
  .ant-btn-primary:active {
    color: white !important;
    background-color: #000 !important;
    border-color: #000 !important;
  }

  /* Input & Search Black Style */
  .ant-input:hover, .ant-input:focus, .ant-input-focused {
    border-color: black !important;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
  }
  .ant-input-affix-wrapper:hover, .ant-input-affix-wrapper-focused {
    border-color: black !important;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
  }
  .ant-input-search .ant-input-group .ant-input-affix-wrapper:hover,
  .ant-input-search .ant-input-group .ant-input-affix-wrapper-focused {
    border-color: black !important;
  }

  /* Fix: Remove inner border for Input with Prefix (Affix Wrapper) */
  .ant-input-affix-wrapper .ant-input {
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
  }
  
  /* Ensure the wrapper itself takes the border/focus style */
  .ant-input-affix-wrapper {
    overflow: hidden;
  }
  .ant-input-affix-wrapper:hover, .ant-input-affix-wrapper-focused {
    border-color: black !important;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
  }
`;

// --- Preview Modal ---
const CertificatePreviewModal: React.FC<{
    open: boolean;
    onCancel: () => void;
    data: {
        template_participation: string;
        template_winner: string;
        name: string;
        title_th: string;
        activity: string;
        date: string;
        detail: string;
        organizer: string;
        award?: string;
        hasAward: boolean;
    };
}> = ({ open, onCancel, data }) => {
    const [currentType, setCurrentType] = useState<"participation" | "winner">(data.hasAward ? "winner" : "participation");

    useEffect(() => {
        setCurrentType(data.hasAward ? "winner" : "participation");
    }, [data.hasAward, data.name]);

    const activeTemplate = currentType === "winner" ? data.template_winner : data.template_participation;

    const handlePrint = () => {
        const printWindow = window.open("", "_blank", "width=1100,height=850");
        if (!printWindow) {
            message.error("กรุณาอนุญาตให้แสดง Pop-up เพื่อพิมพ์");
            return;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>พิมพ์ใบประกาศ - ${data.name}</title>
                    <style>
                        @page { size: landscape; margin: 0; }
                        * { box-sizing: border-box; }
                        body { margin: 0; padding: 0; background: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; }
                        .cert-page { position: relative; width: 100vw; height: 100vh; overflow: hidden; }
                        .bg-img { width: 100%; height: 100%; object-fit: fill; position: absolute; top: 0; left: 0; }
                        .content-layer {
                            position: relative; z-index: 10; width: 100%; height: 100%;
                            font-family: "Sarabun", sans-serif; color: #1a1a1a; text-align: center;
                            display: flex; flex-direction: column; align-items: center; justify-content: center;
                        }
                        .activity-name { font-size: 24px; font-weight: bold; margin-bottom: 60px; }
                        .student-name { font-size: 44px; font-weight: bold; color: #b8860b; margin-bottom: 20px; }
                        .cert-detail { font-size: 18px; width: 65%; line-height: 1.6; margin-bottom: 40px; }
                        .sign-section {
                            position: absolute; bottom: 12%; right: 10%; text-align: center; min-width: 250px;
                        }
                        .organizer-name { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
                        .issue-date { font-size: 16px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="cert-page">
                        <img src="${activeTemplate}" class="bg-img" id="cert-img" />
                        <div class="content-layer">
                            <div class="activity-name">${data.activity}</div>
                            <div class="student-name">${data.name}</div>
                            <div class="cert-detail">${data.detail}</div>
                            <div class="sign-section">
                                <div class="organizer-name">${data.organizer}</div>
                                <div class="issue-date">วันที่: ${data.date}</div>
                            </div>
                        </div>
                    </div>
                    <script>
                        const img = document.getElementById('cert-img');
                        function startPrint() { window.print(); setTimeout(() => window.close(), 500); }
                        if (img.complete) { startPrint(); }
                        else { img.onload = startPrint; img.onerror = startPrint; }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="close" onClick={onCancel} style={{ borderRadius: '8px' }}>ปิด</Button>,
                <Button
                    key="print"
                    type="primary"
                    icon={<PrinterOutlined />}
                    onClick={handlePrint}
                    style={{ background: 'black', borderColor: 'black', borderRadius: '8px' }}
                >
                    พิมพ์/ดาวน์โหลด
                </Button>,
            ]}
            width={950}
            title={null}
            centered
        >
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Space size="large">
                    <Button
                        type={currentType === 'participation' ? 'primary' : 'default'}
                        onClick={() => setCurrentType('participation')}
                        style={currentType === 'participation' ? { background: 'black', borderColor: 'black' } : {}}
                    >
                        แบบเข้าร่วม
                    </Button>
                    {data.hasAward && (
                        <Button
                            type={currentType === 'winner' ? 'primary' : 'default'}
                            onClick={() => setCurrentType('winner')}
                            style={currentType === 'winner' ? { background: 'black', borderColor: 'black' } : {}}
                        >
                            แบบได้รับรางวัล
                        </Button>
                    )}
                </Space>
            </div>

            <div style={{
                width: '100%',
                aspectRatio: '1.414/1',
                position: 'relative',
                background: '#fff',
                overflow: 'hidden',
                border: '1px solid #f0f0f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderRadius: '4px'
            }}>
                <img src={activeTemplate} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} alt="cert" />
                <div style={{
                    position: 'relative', zIndex: 1, height: '100%',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px'
                }}>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '16px' }}>{data.title_th}</div>
                    <div style={{ fontSize: '38px', color: '#b8860b', fontWeight: 'bold', margin: '20px 0' }}>{data.name}</div>
                    <div style={{ fontSize: '16px', maxWidth: '85%', lineHeight: 1.6 }}>{data.detail}</div>
                    <div style={{ position: 'absolute', bottom: '12%', right: '12%', textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 500 }}>{data.organizer}</div>
                        <div style={{ fontSize: '14px', color: '#666' }}>วันที่: {data.date}</div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}; export default function StudentCertificatesPage() {
    const [loading, setLoading] = useState(true);
    const [allActivities, setAllActivities] = useState<any[]>([]);
    const [activityFilter, setActivityFilter] = useState("");

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);

    const [participantModalOpen, setParticipantModalOpen] = useState(false);
    const [selectedActivityForTable, setSelectedActivityForTable] = useState<any>(null);
    const [activityParticipants, setActivityParticipants] = useState<any[]>([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [participantSearch, setParticipantSearch] = useState("");

    useEffect(() => {
        initPage();
    }, []);

    const initPage = async () => {
        setLoading(true);
        try {
            // 1. Fetch all Certificate Templates (Created by Admin)
            const templatesRes = await GetMyCertificate();
            const allTemplates = (templatesRes && templatesRes.status === 200) ? (Array.isArray(templatesRes.data) ? templatesRes.data : templatesRes.data?.data || []) : [];

            // 2. Fetch My Registrations to see which posts I joined
            const myRegRes = await GetMyRegistrations();
            let myRegistrations: any[] = [];
            if (myRegRes && myRegRes.status === 200) {
                myRegistrations = Array.isArray(myRegRes.data) ? myRegRes.data : myRegRes.data?.data || [];
            }

            // Extract Post objects from registrations
            const certEnabledPosts = myRegistrations
                .filter((reg: any) => {
                    const postStatus = reg.post?.status?.status_name?.toLowerCase();
                    // Show if post is Approved, Active, or Ended
                    const isPostVisible = ["approved", "active", "ended"].includes(postStatus || "");
                    return reg.post && isPostVisible && reg.status === 'approved';
                })
                .map((reg: any) => {
                    const post = reg.post;
                    const template = allTemplates.find((t: any) => t.post_id === post.ID);
                    return { ...post, template };
                })
                .filter(item => !!item.template && !!item.template.picture_participation);

            // Remove duplicates (if any)
            const uniquePosts = Array.from(new Map(certEnabledPosts.map((p: any) => [p.ID, p])).values());

            setAllActivities(uniquePosts);

        } catch (error) {
            console.error("Init Error:", error);
            message.error("ไม่สามารถโหลดข้อมูลได้");
        } finally {
            setLoading(false);
        }
    };

    const filteredActivities = allActivities.filter(act =>
        act.title.toLowerCase().includes(activityFilter.toLowerCase())
    );

    const filteredParticipants = activityParticipants.filter(p =>
        (p.user?.sut_id?.toLowerCase().includes(participantSearch.toLowerCase())) ||
        (`${p.user?.first_name} ${p.user?.last_name}`.toLowerCase().includes(participantSearch.toLowerCase()))
    );

    const ensureBase64 = (src: string) => {
        if (!src) return "";
        if (src.startsWith('data:') || src.startsWith('http')) return src;
        return `data:image/png;base64,${src}`;
    };

    const openPreview = (item: any) => {
        const { activity, user, award, isPersonalized } = item;
        const template = isPersonalized ? item : activity.template;

        if (!template) {
            message.warning("กิจกรรมนี้ยังไม่ได้จัดทำเทมเพลตใบประกาศ");
            return;
        }

        setPreviewData({
            template_participation: ensureBase64(template.picture_participation),
            template_winner: ensureBase64(template.picture_winner),
            name: isPersonalized ? (item.user ? `${item.user.first_name} ${item.user.last_name}` : "") : `${user.first_name || ""} ${user.last_name || ""}`,
            title_th: template.title_th || activity?.title || "ใบประกาศเกียรติบัตร",
            activity: activity?.title || template.post?.title || "กิจกรรม",
            detail: template.detail,
            organizer: template.organizer,
            date: template.date ? new Date(template.date).toLocaleDateString('th-TH') : new Date().toLocaleDateString('th-TH'),
            award: award,
            hasAward: !!award
        });
        setPreviewOpen(true);
    };

    const handleViewActivityParticipants = async (activity: any) => {
        setSelectedActivityForTable(activity);
        setParticipantModalOpen(true);
        setLoadingParticipants(true);
        setActivityParticipants([]);

        try {
            // Get my profile ID from localStorage or context if available, 
            // but easier to filter the registration data we already have.
            const myRegRes = await GetMyRegistrations();
            if (myRegRes && myRegRes.status === 200) {
                const myRegistrations = Array.isArray(myRegRes.data) ? myRegRes.data : myRegRes.data?.data || [];

                // Find registration for THIS activity
                const reg = myRegistrations.find((r: any) => r.post_id === activity.ID);
                if (reg) {
                    // In your system, GetMyRegistrations likely returns objects preloaded with Users[0] or similar.
                    // We extract the current user from this registration.
                    const participantsList: any[] = [];
                    const users = reg.users || [];

                    // Although it's "My" registrations, a team might have multiple users.
                    // But for "Student View", they usually only care about their own certificate.
                    // However, to be safe and show only the logged-in user:
                    // We can assume the first user in 'reg.users' (if it's a personal reg) or filter by current user ID.

                    // For now, show all users in the student's own registration (which are their teammates)
                    users.forEach((u: any) => {
                        const award = reg.results && reg.results.length > 0 ? reg.results[0].award?.award_name : null;
                        participantsList.push({
                            activity,
                            user: u,
                            award,
                            regID: reg.ID
                        });
                    });
                    setActivityParticipants(participantsList);
                }
            }
        } catch (error) {
            console.error("Fetch Participants Error:", error);
            message.error("ไม่สามารถโหลดรายชื่อได้");
        } finally {
            setLoadingParticipants(false);
        }
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#fff' }}>
            <style>{customStyles}</style>
            <Content style={{ padding: '24px 40px' }}>

                {/* Header Search Bar (Events Page Style) */}
                <Row gutter={16} align="middle" style={{ marginBottom: 32 }}>
                    <Col flex="auto">
                        <Input
                            prefix={<SearchOutlined style={{ color: "#ccc" }} />}
                            placeholder="ค้นหาชื่อกิจกรรม..."
                            size="large"
                            value={activityFilter}
                            onChange={(e) => setActivityFilter(e.target.value)}
                            style={{
                                borderRadius: "50px",
                                backgroundColor: "#fff",
                                border: "1px solid #000",
                            }}
                        />
                    </Col>
                </Row>

                {/* All Activities Section */}
                <div style={{ marginTop: 32 }}>
                    <Title level={3} style={{ marginBottom: 24 }}>ใบประกาศนียบัตร</Title>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}><Spin /></div>
                    ) : (
                        <Row gutter={[24, 24]}>
                            {filteredActivities.map((act) => (
                                <Col xs={24} sm={12} md={12} lg={8} key={act.ID}>
                                    <Card
                                        hoverable
                                        style={{
                                            borderRadius: "20px",
                                            overflow: "hidden",
                                            border: "1px solid #f0f0f0",
                                            boxShadow: "0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09)",
                                            cursor: "pointer",
                                            transition: "all 0.3s ease-in-out",
                                        }}
                                        bodyStyle={{ padding: "0" }}
                                        onClick={() => {
                                            handleViewActivityParticipants(act);
                                            setParticipantSearch("");
                                        }}
                                        cover={
                                            <div style={{ position: "relative", height: "180px", backgroundColor: "#f5f5f5" }}>
                                                {act.picture ? (
                                                    <img
                                                        alt={act.title}
                                                        src={ensureBase64(act.picture)}
                                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                    />
                                                ) : (
                                                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc" }}>
                                                        <PictureOutlined style={{ fontSize: 32 }} />
                                                    </div>
                                                )}
                                            </div>
                                        }
                                    >
                                        <div style={{ padding: "16px" }}>
                                            <Title level={5} ellipsis style={{ marginBottom: 8 }}>
                                                {act.title}
                                            </Title>
                                            <div style={{ marginBottom: "12px" }}>
                                                <Space size="small">
                                                    <ClockCircleOutlined style={{ color: "#999" }} />
                                                    <Text type="secondary" style={{ fontSize: "12px" }}>
                                                        จัดเมื่อ: {new Date(act.start_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </Text>
                                                </Space>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <Space size="small">
                                                    <Text type="secondary" style={{ fontSize: 12 }}>คลิกดูรายชื่อ</Text>
                                                    <SearchOutlined style={{ color: "#999" }} />
                                                </Space>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </div>

                {previewData && (
                    <CertificatePreviewModal
                        open={previewOpen}
                        onCancel={() => setPreviewOpen(false)}
                        data={previewData}
                    />
                )}

                {/* Participants List Modal */}
                <Modal
                    title={`รายชื่อผู้มีสิทธิ์ได้รับใบประกาศ - ${selectedActivityForTable?.title}`}
                    open={participantModalOpen}
                    onCancel={() => setParticipantModalOpen(false)}
                    footer={[
                        <Button key="close" onClick={() => setParticipantModalOpen(false)} style={{ borderRadius: '8px' }}>ปิด</Button>
                    ]}
                    width={800}
                >
                    {loadingParticipants ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}><Spin tip="กำลังโหลดรายชื่อ..." /></div>
                    ) : activityParticipants.length > 0 ? (
                        <div style={{ maxHeight: '500px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Input
                                prefix={<SearchOutlined style={{ color: "#ccc" }} />}
                                placeholder="ค้นหารหัสนักศึกษา หรือ ชื่อ-นามสกุล..."
                                allowClear
                                size="large"
                                value={participantSearch}
                                onChange={(e) => setParticipantSearch(e.target.value)}
                                style={{
                                    borderRadius: "50px",
                                    border: "1px solid black",
                                }}
                            />
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                <Table
                                    dataSource={filteredParticipants}
                                    pagination={{ pageSize: 10 }}
                                    size="small"
                                    rowKey={(record) => record.user.ID}
                                    columns={[
                                        { title: 'รหัสนักศึกษา', dataIndex: ['user', 'sut_id'], key: 'sut_id' },
                                        { title: 'ชื่อ-นามสกุล', key: 'name', render: (_, record) => `${record.user.first_name} ${record.user.last_name}` },
                                        {
                                            title: 'รางวัล',
                                            dataIndex: 'award',
                                            key: 'award',
                                            render: (award) => award ? <Tag color="gold">{award}</Tag> : <Text type="secondary">-</Text>
                                        },
                                        {
                                            title: 'การจัดการ',
                                            key: 'action',
                                            render: (_, record) => (
                                                <Button
                                                    type="link"
                                                    icon={<PrinterOutlined />}
                                                    style={{ color: 'black' }}
                                                    onClick={() => {
                                                        setParticipantModalOpen(false);
                                                        openPreview(record);
                                                    }}
                                                >
                                                    ดูและพิมพ์
                                                </Button>
                                            )
                                        }
                                    ]}
                                />
                            </div>
                        </div>
                    ) : (
                        <Empty description="ไม่พบรายชื่อผู้เข้าร่วมในกิจกรรมนี้" />
                    )}
                </Modal>
            </Content>
        </Layout>
    );
}
