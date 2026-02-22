import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  Modal,
  Input,
  message,
  Form,
  Tag,
  Descriptions,
  Image,
  Space,
  Button,
  Typography,
  ConfigProvider,
} from "antd";
import dayjs from "dayjs";
import {
  StarOutlined,
  ClockCircleOutlined,
  FolderOutlined,
  CheckSquareFilled,
  SyncOutlined,
  StopOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckSquareOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

// Services
import {
  CreatePost,
  GetAllPosts,
  UpdatePost,
  DeletePost,
  convertFileToBase64,
} from "../../../services/postServices";
import { getLocations } from "../../../services/metadataService";
import type { LocationInterface } from "../../../interfaces/Location";
import type {
  Post,
  CreatePostRequest,
  UpdatePostRequest,
} from "../../../interfaces/post";

// Components
import { DashboardView } from "./components/DashboardView";
import { ActivityForm } from "./components/ActivityForm";

const { TextArea } = Input;
const { Text } = Typography;

const ActivityManager: React.FC = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();

  // --- State ---
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // --- UI State ---
  const [currentView, setCurrentView] = useState<"dashboard" | "create">(
    "dashboard"
  );
  const [currentTab, setCurrentTab] = useState<string>("กิจกรรมทั้งหมด");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    setFilterType("all");
  }, [currentTab]);

  // --- Edit State ---
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Picture
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Locations
  const [locations, setLocations] = useState<LocationInterface[]>([]);

  // --- Modals ---
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [rejectTarget, setRejectTarget] = useState<Post | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [viewingPost, setViewingPost] = useState<Post | null>(null);

  // ==========================================
  // API
  // ==========================================
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await GetAllPosts();
      if (res?.status === 200) {
        let postsData: Post[] = [];
        if (Array.isArray(res.data)) postsData = res.data;
        else if (res.data?.data && Array.isArray(res.data.data))
          postsData = res.data.data;

        // Debug: Log status information
        console.log("📊 Total posts:", postsData.length);
        postsData.forEach((post, idx) => {
          console.log(`Post ${idx + 1}:`, {
            title: post.title,
            status_id: post.status_id,
            status_name: post.status?.status_name,
            status_name_lower: post.status?.status_name?.toLowerCase(),
          });
        });

        setPosts(postsData);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error(error);
      message.error("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const data = await getLocations();
      if (Array.isArray(data)) {
        setLocations(data);
      }
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
  };

  const onFileChange = ({
    fileList: newFileList,
  }: {
    fileList: UploadFile[];
  }) => {
    setFileList(newFileList);
  };

  // ==========================================
  // Create / Update post
  // ==========================================
  const handleFormSubmit = async (values: any) => {
    setLoading(true);
    try {
      let base64Image: string | undefined = undefined;

      if (fileList.length > 0) {
        const file = fileList[0];
        if (file.originFileObj) {
          base64Image = await convertFileToBase64(file.originFileObj);
        } else if (file.url) {
          base64Image = file.url.startsWith("data:")
            ? file.url
            : `data:image/jpeg;base64,${file.url}`;
        }
      }

      // Helper function to calculate time-based status
      const getTimeBasedStatusId = (
        startDate: string,
        stopDate: string
      ): number => {
        const now = new Date();
        const start = new Date(startDate);
        const stop = new Date(stopDate);

        if (now < start) return 4; // Upcoming
        else if (now >= start && now <= stop) return 5; // Active
        else return 6; // Ended
      };

      const currentStatusId = editingPost?.status_id;
      const liveStatusIds = [2, 4, 5, 6]; // Approved, Upcoming, Active, Ended

      const calculatedStatusId =
        !editingPost || (currentStatusId && liveStatusIds.includes(currentStatusId))
          ? getTimeBasedStatusId(
            values.startDate.toISOString(),
            values.endDate.toISOString()
          )
          : currentStatusId || 4;

      const basePayload = {
        title: values.activityName,
        detail: values.description,
        start_date: values.startDate ? values.startDate.toISOString() : "",
        stop_date: values.endDate ? values.endDate.toISOString() : "",
        start: values.regStartDate ? values.regStartDate.toISOString() : "",
        stop: values.regEndDate ? values.regEndDate.toISOString() : "",
        organizer: values.organizer,
        type: values.type,
        picture: base64Image || "",
        location_id: values.location_id,
      };

      let res;
      if (editingPost) {
        const updatePayload: UpdatePostRequest = {
          ...basePayload,
          ID: editingPost.ID,
          status_id: calculatedStatusId,
          user_id: editingPost.user_id || user?.id || 0,
        };
        res = await UpdatePost(editingPost.ID, updatePayload);
      } else {
        const createPayload: CreatePostRequest = {
          ...basePayload,
          user_id: user?.id || 0,
          status_id: calculatedStatusId,
        };
        res = await CreatePost(createPayload);
      }

      if (res && (res.status === 200 || res.status === 201)) {
        message.success(
          editingPost ? "แก้ไขข้อมูลสำเร็จ" : "สร้างกิจกรรมสำเร็จ"
        );
        handleCloseCreate();
        await fetchPosts();
      } else {
        message.error(
          `บันทึกไม่สำเร็จ: ${res?.data?.error || "ข้อมูลไม่ถูกต้อง"}`
        );
      }
    } catch (error) {
      console.error(error);
      message.error("เกิดข้อผิดพลาดที่ไม่คาดคิด");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Delete post
  // ==========================================
  const handleDeletePost = async (id: number) => {
    try {
      const res = await DeletePost(id);
      if (res?.status === 200) {
        message.success("ลบ post สำเร็จ");
        setPosts((prev) => prev.filter((p) => p.ID !== id));
      } else {
        message.error("ลบ post ไม่สำเร็จ");
      }
    } catch {
      message.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  // ==========================================
  // Approve/Reject
  // ==========================================
  const handleUpdateStatus = async (
    post: Post,
    action: "approve" | "reject",
    comment?: string
  ) => {
    const newStatusId = action === "approve" ? 2 : 3;
    const payload: UpdatePostRequest = {
      ID: post.ID,
      title: post.title,
      detail: post.detail,
      start_date: post.start_date,
      stop_date: post.stop_date,
      start: post.start,
      stop: post.stop,
      organizer: post.organizer || "ไม่ระบุ",
      type: post.type,
      picture: post.picture,
      location_id: post.location_id,
      status_id: newStatusId,
      user_id: post.user_id,
      comment: action === "reject" ? comment || "" : "",
    };

    try {
      const res = await UpdatePost(post.ID, payload);
      if (res?.status === 200) {
        message.success(
          action === "approve" ? "อนุมัติเรียบร้อย" : "ไม่อนุมัติเรียบร้อย"
        );
        await fetchPosts();
      } else {
        message.error("เกิดข้อผิดพลาด");
      }
    } catch {
      message.error("เชื่อมต่อไม่ได้");
    }
  };

  // ==========================================
  // UI HANDLERS
  // ==========================================
  const handleOpenCreate = () => {
    setEditingPost(null);
    form.resetFields();
    setFileList([]);
    setCurrentView("create");
  };

  const handleCloseCreate = () => {
    setEditingPost(null);
    form.resetFields();
    setFileList([]);
    setCurrentView("dashboard");
  };

  const handleOpenEditPost = (post: Post) => {
    setEditingPost(post);

    form.setFieldsValue({
      activityName: (post as any).title,
      description: (post as any).detail,
      startDate: (post as any).start_date
        ? dayjs((post as any).start_date)
        : null,
      endDate: (post as any).stop_date ? dayjs((post as any).stop_date) : null,
      regStartDate: (post as any).start ? dayjs((post as any).start) : null,
      regEndDate: (post as any).stop ? dayjs((post as any).stop) : null,
      organizer: (post as any).organizer,
      type: (post as any).type,
      location_id: (post as any).location_id,
    });

    if ((post as any).picture) {
      const pic = (post as any).picture;
      const imageUrl = pic.startsWith("data:")
        ? pic
        : `data:image/jpeg;base64,${pic}`;
      setFileList([
        { uid: "-1", name: "current.png", status: "done", url: imageUrl },
      ]);
    } else {
      setFileList([]);
    }

    setCurrentView("create");
  };

  const handleOpenDetail = (item: Post) => {
    setViewingPost(item);
    setIsDetailModalOpen(true);
  };

  const showRejectModal = (item: Post) => {
    setRejectTarget(item);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      message.error("กรุณาระบุเหตุผลที่ไม่อนุมัติ");
      return;
    }
    await handleUpdateStatus(rejectTarget, "reject", rejectReason.trim());
    setIsRejectModalOpen(false);
    setRejectReason("");
    setRejectTarget(null);
  };

  // ==========================================
  // Get all posts
  // ==========================================
  const safePosts = Array.isArray(posts) ? posts : [];

  const getStatusName = (post: Post): string => {
    const dbStatus = post.status?.status_name?.toLowerCase() || "pending";

    // Recalculate status for time-based states to keep UI in sync
    if (["active", "upcoming", "ended", "approved"].includes(dbStatus)) {
      if (!post.start_date || !post.stop_date) return dbStatus;

      const now = dayjs();
      const start = dayjs(post.start_date);
      const stop = dayjs(post.stop_date);

      if (now.isBefore(start)) return "upcoming";
      if (now.isAfter(stop)) return "ended";
      return "active";
    }

    return dbStatus;
  };

  const filteredPosts: Post[] = (() => {
    switch (currentTab) {
      case "กิจกรรมทั้งหมด":
        if (filterType === "all") return safePosts;
        if (filterType === "approved") {
          return safePosts.filter((p) =>
            p.user?.role?.name === "student" &&
            ["approved", "active", "upcoming", "ended"].includes(
              getStatusName(p)
            )
          );
        }
        return safePosts.filter((p) => getStatusName(p) === filterType);
      case "โพสต์รออนุมัติ":
        return safePosts.filter((p) => p.user?.role?.name === "student" && getStatusName(p) === "pending");

      case "ไม่อนุมัติ":
        return safePosts.filter((p) => p.user?.role?.name === "student" && getStatusName(p) === "rejected");

      default:
        return [];
    }
  })();

  const stats = [
    {
      title: "กิจกรรมทั้งหมด",
      count: safePosts.length,
      icon: <StarOutlined />,
      id: 1,
    },
    {
      title: "อนุมัติแล้ว",
      count: safePosts.filter((p) => p.user?.role?.name === "student" && ["approved", "active", "upcoming", "ended"].includes(getStatusName(p))).length,
      icon: <CheckSquareOutlined />,
      id: 2,
    },
    {
      title: "โพสต์รออนุมัติ",
      count: safePosts.filter((p) => p.user?.role?.name === "student" && getStatusName(p) === "pending").length,
      icon: <ClockCircleOutlined />,
      id: 3,
    },
    {
      title: "ไม่อนุมัติ",
      count: safePosts.filter((p) => p.user?.role?.name === "student" && getStatusName(p) === "rejected").length,
      icon: <FolderOutlined />,
      id: 4,
    },
  ];

  const renderStatusTag = (status: string) => {
    switch (status.toLowerCase()) {
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
            สิ้นสุดแล้ว (หมดอายุ)
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

  // ==========================================
  // RENDER
  // ==========================================
  if (currentView === "dashboard") {
    return (
      <>
        <DashboardView
          stats={stats}
          currentTab={currentTab}
          filterType={filterType}
          filteredPosts={filteredPosts}
          loading={loading}
          formatDateDisplay={formatDateDisplay}
          renderStatusTag={renderStatusTag}
          getStatusName={getStatusName}
          onTabChange={setCurrentTab}
          onFilterChange={setFilterType}
          onOpenCreate={handleOpenCreate}
          onViewDetail={handleOpenDetail}
          onEdit={handleOpenEditPost}
          onDelete={handleDeletePost}
          onReject={showRejectModal}
          onApprove={(item) => handleUpdateStatus(item, "approve")}
        />

        {/* Reject Modal */}
        <Modal
          open={isRejectModalOpen}
          onCancel={() => setIsRejectModalOpen(false)}
          onOk={handleRejectSubmit}
          okText="ไม่อนุมัติ"
          cancelText="ยกเลิก"
          okButtonProps={{ style: { backgroundColor: "black", borderColor: "black", color: "white" } }}
        >
          <Space direction="vertical" style={{ width: "100%", marginBottom: "24px", borderColor: "black" }}>
            <div>
              <Text type="danger">* </Text>
              <Text strong>เหตุผลที่ไม่อนุมัติ:</Text>
            </div>

            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: "black",
                  colorPrimaryHover: "black",
                  controlOutline: "rgba(0, 0, 0, 0.06)",
                },
              }}
            >
              <TextArea
                style={{ color: "black", borderColor: "black" }}
                rows={5}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="กรุณาระบุเหตุผลที่ไม่อนุมัติ"
                maxLength={500}
                showCount
              />
            </ConfigProvider>
          </Space>
        </Modal>

        {/* Detail Modal */}
        <Modal
          title="รายละเอียดกิจกรรม"
          open={isDetailModalOpen}
          onCancel={() => setIsDetailModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
              ปิด
            </Button>,
          ]}
          width={700}
        >
          {viewingPost && (
            <div>
              {viewingPost.picture && (
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <Image
                    width={300}
                    src={
                      viewingPost.picture.startsWith("data:")
                        ? viewingPost.picture
                        : `data:image/jpeg;base64,${viewingPost.picture}`
                    }
                    alt="Activity Cover"
                    style={{ borderRadius: "8px", objectFit: "cover" }}
                  />
                </div>
              )}
              <Descriptions bordered column={1}>
                <Descriptions.Item label="ชื่อกิจกรรม">
                  <Text strong>{viewingPost.title}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="สถานะ">
                  {renderStatusTag(getStatusName(viewingPost))}
                </Descriptions.Item>
                {getStatusName(viewingPost) === "rejected" &&
                  viewingPost.comment && (
                    <Descriptions.Item label="เหตุผลที่ไม่อนุมัติ">
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <div
                          style={{
                            padding: "12px",
                            background: "#fff2e8",
                            borderLeft: "4px solid #ff4d4f",
                            borderRadius: "4px",
                          }}
                        >
                          <Text type="danger">{viewingPost.comment}</Text>
                        </div>
                      </Space>
                    </Descriptions.Item>
                  )}
                <Descriptions.Item label="รายละเอียด">
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    {viewingPost.detail}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="ผู้จัดกิจกรรม">
                  <Space>
                    <UserOutlined /> {viewingPost.organizer || "-"}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="ประเภท">
                  <Tag color="purple">{viewingPost.type || "-"}</Tag>
                </Descriptions.Item>
                {viewingPost.start_date && (
                  <Descriptions.Item label="วันที่เริ่มต้น">
                    <Space>
                      <CalendarOutlined />{" "}
                      {formatDateDisplay(viewingPost.start_date)}
                    </Space>
                  </Descriptions.Item>
                )}
                {viewingPost.stop_date && (
                  <Descriptions.Item label="วันที่สิ้นสุด">
                    <Space>
                      <CalendarOutlined />{" "}
                      {formatDateDisplay(viewingPost.stop_date)}
                    </Space>
                  </Descriptions.Item>
                )}
                {viewingPost.start && (
                  <Descriptions.Item label="ลงทะเบียน">
                    <Space direction="vertical">
                      <Text>เริ่ม: {formatDateDisplay(viewingPost.start)}</Text>
                      <Text>
                        สิ้นสุด: {formatDateDisplay(viewingPost.stop)}
                      </Text>
                    </Space>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>
          )}
        </Modal>
      </>
    );
  }

  // VIEW: CREATE / EDIT
  if (currentView === "create") {
    return (
      <ActivityForm
        form={form}
        loading={loading}
        editingPost={editingPost}
        fileList={fileList}
        locations={locations}
        onFileChange={onFileChange}
        onFormSubmit={handleFormSubmit}
        onClose={handleCloseCreate}
      />
    );
  }

  return null;
};

export default ActivityManager;
