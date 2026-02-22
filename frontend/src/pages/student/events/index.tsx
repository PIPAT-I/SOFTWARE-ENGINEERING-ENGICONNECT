import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Input,
  Modal,
  message,
  Image,
  Tag,
  Divider,
  Tooltip, // ✅ เพิ่ม Tooltip
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  HeartOutlined,
  CommentOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  TeamOutlined,
  MessageOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/th";
import isBetween from "dayjs/plugin/isBetween"; // ✅ เพิ่ม plugin

// ✅ เปิดใช้งาน plugin
dayjs.extend(isBetween);

// Import SERVICE
import { GetStudentPosts } from "../../../services/postServices";
import type { Post } from "../../../interfaces/post";

const { Title, Text, Paragraph } = Typography;
dayjs.locale("th");

const StudentActivityPage: React.FC = () => {
  const navigate = useNavigate();

  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [viewingPost, setViewingPost] = useState<Post | null>(null);
  const [searchText, setSearchText] = useState<string>("");

  // ✅ ฟังก์ชันตรวจสอบว่าอยู่ในช่วงเวลาลงทะเบียนหรือไม่
  const isRegistrationOpen = (post: Post): boolean => {
    const now = dayjs();
    const registerStart = post.start ? dayjs(post.start) : null;
    const registerStop = post.stop ? dayjs(post.stop) : null;

    if (!registerStart || !registerStop) {
      return false; // ถ้าไม่มีข้อมูลวันลงทะเบียน = ไม่เปิดรับสมัคร
    }

    return now.isBetween(registerStart, registerStop, null, "[]"); // [] = include start and end
  };

  // ✅ ฟังก์ชันสร้างข้อความสถานะการลงทะเบียน
  const getRegistrationStatus = (post: Post): {
    status: "open" | "closed" | "upcoming";
    message: string;
    color: string;
  } => {
    const now = dayjs();
    const registerStart = post.start ? dayjs(post.start) : null;
    const registerStop = post.stop ? dayjs(post.stop) : null;

    if (!registerStart || !registerStop) {
      return {
        status: "closed",
        message: "ไม่มีข้อมูลการลงทะเบียน",
        color: "#999"
      };
    }

    if (now.isBefore(registerStart)) {
      return {
        status: "upcoming",
        message: `เปิดรับสมัครวันที่ ${formatDate(post.start)}`,
        color: "#faad14"
      };
    }

    if (now.isAfter(registerStop)) {
      return {
        status: "closed",
        message: "ปิดรับสมัครแล้ว",
        color: "#ff4d4f"
      };
    }

    return {
      status: "open",
      message: `เปิดรับสมัครถึง ${formatDate(post.stop)}`,
      color: "#52c41a"
    };
  };



  const formatDate = (dateStr: string | Date | undefined) => {
    if (!dateStr) return "ไม่ระบุวันที่";
    return dayjs(dateStr).format("D MMMM YYYY");
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await GetStudentPosts();
      if (res && res.status === 200) {
        let fetchedData: Post[] = [];
        if (Array.isArray(res.data)) {
          fetchedData = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          fetchedData = res.data.data;
        }


        // ✅ Filter ONLY Ongoing events (start_date <= now <= stop_date)
        const now = dayjs();
        fetchedData = fetchedData.filter((post) => {
          if (!post.start_date || !post.stop_date) return false;
          const start = dayjs(post.start_date);
          const stop = dayjs(post.stop_date);
          return now.isBetween(start, stop, null, "[]");
        });

        setAllPosts(fetchedData);
        setPosts(fetchedData);
      } else {
        setAllPosts([]);
        setPosts([]);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      message.error("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (post: Post) => {
    setViewingPost(post);
    setIsDetailModalOpen(true);
  };

  const handleJoinChat = () => {
    if (viewingPost?.ID) {
      navigate(`/student/communication/chat/${viewingPost.ID}`);
    } else {
      message.error("ไม่พบข้อมูลกิจกรรมสำหรับการแชท");
    }
  };

  const DetailActivity = () => {
    if (viewingPost?.ID) {

      navigate(`/student/activity/detail_activity/${viewingPost.ID}`);

    } else {
      message.error("ไม่พบข้อมูลกิจกรรม");
    }
  };

  const handleRegister = () => {
    if (!viewingPost?.ID) {
      message.error("ไม่พบข้อมูลกิจกรรมสำหรับการลงทะเบียน");
      return;
    }


    if (!isRegistrationOpen(viewingPost)) {
      const status = getRegistrationStatus(viewingPost);
      message.warning(status.message);
      return;
    }

    navigate(`/student/activities/${viewingPost.ID}/register`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (searchText === "") {
      setPosts(allPosts);
      return;
    }

    const lowerCaseSearchText = searchText.toLowerCase();
    const filteredPosts = allPosts.filter((post) => {
      const titleMatch = post.title?.toLowerCase().includes(lowerCaseSearchText);
      const detailMatch = post.detail?.toLowerCase().includes(lowerCaseSearchText);
      const typeMatch = post.type?.toLowerCase().includes(lowerCaseSearchText);
      const organizerMatch = post.organizer?.toLowerCase().includes(lowerCaseSearchText);
      return titleMatch || detailMatch || typeMatch || organizerMatch;
    });

    setPosts(filteredPosts);
  }, [searchText, allPosts]);

  return (
    <Layout style={{ minHeight: "100vh", background: "#fff", padding: "24px 40px" }}>
      {/* Header */}
      <Row gutter={16} align="middle" style={{ marginBottom: 24 }}>
        <Col flex="auto">
          <Input
            prefix={<SearchOutlined style={{ color: "#ccc" }} />}
            placeholder="ค้นหากิจกรรม..."
            size="large"
            value={searchText}
            onChange={handleSearchChange}
            style={{
              borderRadius: "50px",
              backgroundColor: "#fff",
              border: "1px solid #d9d9d9",
            }}
          />
        </Col>
        <Col>
          <Button
            type="primary"
            shape="round"
            icon={<PlusOutlined />}
            size="large"
            style={{ backgroundColor: "#000", borderColor: "#000" }}
            onClick={() => navigate("/student/activity/proposal_Activity")}
          >
            โพสต์กิจกรรม
          </Button>
        </Col>
      </Row>

      <Title level={3} style={{ marginBottom: 20 }}>
        กิจกรรม
      </Title>

      {loading ? (
        <div style={{ textAlign: "center", marginTop: 50 }}>กำลังโหลด...</div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: 50, color: "#999" }}>
          {searchText
            ? `ไม่พบกิจกรรมที่เกี่ยวข้องกับ "${searchText}"`
            : "ไม่พบกิจกรรม"}
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          {posts.map((post) => {

            return (
              <Col xs={24} sm={12} lg={8} key={post.ID}>
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
                  onClick={() => handleOpenDetail(post)}
                >
                  <div style={{ position: "relative", height: "180px", backgroundColor: "#f5f5f5" }}>
                    {post.picture ? (
                      <img
                        alt={post.title}
                        src={
                          post.picture.startsWith("data:")
                            ? post.picture
                            : `data:image/jpeg;base64,${post.picture}`
                        }
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc" }}>
                        No Image
                      </div>
                    )}



                    <div style={{ position: "absolute", top: 10, right: 10, backgroundColor: "rgba(255,255,255,0.8)", borderRadius: "50%", padding: "4px 8px" }}>
                      <HeartOutlined style={{ fontSize: "16px", color: "#666" }} />
                    </div>
                  </div>

                  <div style={{ padding: "16px" }}>
                    <Title level={5} ellipsis style={{ marginBottom: 8 }}>
                      {post.title}
                    </Title>
                    <div
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        color: "rgba(0, 0, 0, 0.45)",
                        fontSize: "14px",
                        height: "42px",
                        marginBottom: "12px",
                      }}
                    >
                      {post.detail}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Space size="small">
                        <EnvironmentOutlined style={{ color: "#999" }} />
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {post.organizer || "ไม่ระบุ"}
                        </Text>
                      </Space>
                      <CommentOutlined style={{ color: "#999" }} />
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* MODAL Detail */}
      <Modal
        title={null}
        footer={null}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        width={900}
        centered
        bodyStyle={{ padding: 0 }}
        style={{ borderRadius: "16px", overflow: "hidden" }}
      >
        {viewingPost && (() => {
          const canRegister = isRegistrationOpen(viewingPost);
          const regStatus = getRegistrationStatus(viewingPost);

          return (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* Banner Image */}
              <div
                style={{
                  width: "100%",
                  height: "250px",
                  backgroundColor: "#f0f2f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  position: "relative",
                  borderTopLeftRadius: "16px",
                  borderTopRightRadius: "16px",
                }}
              >
                {viewingPost.picture ? (
                  <Image
                    src={
                      viewingPost.picture.startsWith("data:")
                        ? viewingPost.picture
                        : `data:image/jpeg;base64,${viewingPost.picture}`
                    }
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    preview={{ mask: "คลิกเพื่อขยาย" }}
                  />
                ) : (
                  <div style={{ color: "#ccc", textAlign: "center" }}>
                    <EnvironmentOutlined style={{ fontSize: "48px", marginBottom: "16px" }} />
                    <p>No Cover Image</p>
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: "32px" }}>
                {/* Tags & Title */}
                <div style={{ marginBottom: "24px" }}>
                  <Space>
                    <Tag
                      color="processing"
                      style={{
                        borderRadius: "4px",
                        fontWeight: 500,
                        backgroundColor: "#E6F4FF",
                        borderColor: "#A0D9FF",
                        color: "#1890FF",
                      }}
                    >
                      {viewingPost.type || "กิจกรรมทั่วไป"}
                    </Tag>

                    {/* ✅ Tag สถานะการลงทะเบียน */}
                    <Tag color={regStatus.color} style={{ fontWeight: 500 }}>
                      <ClockCircleOutlined /> {regStatus.message}
                    </Tag>
                  </Space>

                  <Title level={2} style={{ margin: "8px 0 0 0", color: "#2c3e50", fontWeight: 700 }}>
                    {viewingPost.title}
                  </Title>
                </div>

                {/* Key Info Row */}
                <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                  <Col span={12}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <CalendarOutlined style={{ fontSize: "18px", color: "#000", marginRight: "8px" }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: "12px", display: "block" }}>
                          วันที่จัดกิจกรรม
                        </Text>
                        <Text strong style={{ fontSize: "15px" }}>
                          {formatDate(viewingPost.start_date)}
                        </Text>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <TeamOutlined style={{ fontSize: "18px", color: "#000", marginRight: "8px" }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: "12px", display: "block" }}>
                          ผู้จัดกิจกรรม
                        </Text>
                        <Text strong style={{ fontSize: "15px" }}>
                          {viewingPost.organizer || "ไม่ระบุ"}
                        </Text>
                      </div>
                    </div>
                  </Col>
                </Row>

                <Divider style={{ margin: "20px 0" }} />

                {/* Details */}
                <div style={{ marginBottom: "32px" }}>
                  <Title level={5} style={{ marginBottom: "12px", color: "#595959" }}>
                    รายละเอียด
                  </Title>
                  <Paragraph style={{ fontSize: "15px", lineHeight: "1.7", color: "#595959", whiteSpace: "pre-wrap" }}>
                    {viewingPost.detail || "ไม่มีรายละเอียดเพิ่มเติม"}
                  </Paragraph>
                </div>

                {/* ✅ ปุ่มพร้อม Tooltip */}
                <Space
                  size={16}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  {/* ฝั่งซ้าย */}
                  <Space size={16} style={{ flex: 1 }}>
                    <Button
                      onClick={handleJoinChat}
                      size="large"
                      style={{
                        height: "52px",
                        fontSize: "18px",
                        fontWeight: 500,
                        borderRadius: "10px",
                        border: "2px solid #000",
                        color: "#000",
                        backgroundColor: "#fff",
                      }}
                      icon={<MessageOutlined />}
                    >
                      เข้าร่วมห้องแชท
                    </Button>

                    <Tooltip title={!canRegister ? regStatus.message : ""} placement="top">
                      <Button
                        type="primary"
                        onClick={handleRegister}
                        disabled={!canRegister}
                        size="large"
                        style={{
                          backgroundColor: canRegister ? "#000" : "#d9d9d9",
                          borderColor: canRegister ? "#000" : "#d9d9d9",
                          color: canRegister ? "#fff" : "#8c8c8c",
                          height: "52px",
                          fontSize: "18px",
                          fontWeight: 500,
                          borderRadius: "10px",
                          boxShadow: canRegister
                            ? "0 4px 12px rgba(0,0,0,0.2)"
                            : "none",
                        }}
                      >
                        {canRegister ? "ลงทะเบียนเข้าร่วม" : "ปิดรับสมัคร"}
                      </Button>
                    </Tooltip>
                  </Space>

                  {/* ฝั่งขวา */}
                  <Button
                    onClick={DetailActivity}
                    size="large"
                    style={{
                      height: "52px",
                      fontSize: "18px",
                      fontWeight: 500,
                      borderRadius: "10px",
                      border: "2px solid #000",
                      color: "#000",
                      backgroundColor: "#fff",
                      whiteSpace: "nowrap",
                    }}
                  >
                    รายละเอียดกิจกรรม
                  </Button>
                </Space>
              </div>
            </div>
          );
        })()}
      </Modal>
    </Layout>
  );
};

export default StudentActivityPage;