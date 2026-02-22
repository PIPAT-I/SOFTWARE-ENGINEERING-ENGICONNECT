import {
  Layout,
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Form,
  Input,
  Upload,
  Select,
  DatePicker,
  ConfigProvider,
} from "antd";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import type { LocationInterface } from "../../../../interfaces/Location";
import type { Post } from "../../../../interfaces/post";
import enUS from "antd/es/date-picker/locale/en_US";

const { Title } = Typography;
const { TextArea } = Input;

const customLocale = {
  ...enUS,
  lang: {
    ...enUS.lang,
    now: "Today", 
  },
};

interface ActivityFormProps {
  form: any;
  loading: boolean;
  editingPost: Post | null;
  fileList: UploadFile[];
  locations: LocationInterface[];
  onFileChange: ({ fileList }: { fileList: UploadFile[] }) => void;
  onFormSubmit: (values: any) => void;
  onClose: () => void;
}

export const ActivityForm: React.FC<ActivityFormProps> = ({
  form,
  loading,
  editingPost,
  fileList,
  locations,
  onFileChange,
  onFormSubmit,
  onClose,
}) => {
  const isEdit = !!editingPost;

  return (
    <Layout style={{ minHeight: "100vh", background: "#fff" }}>
      <Card
        style={{
          borderRadius: "16px",
          border: "1px solid #d9d9d9",
          width: "100%",
        }}
        bodyStyle={{ padding: "40px" }}
      >
        <div style={{ marginBottom: "24px" }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={onClose}
            style={{ fontSize: "16px", padding: 0 }}
          >
            กลับหน้าหลัก
          </Button>
        </div>

        <Title level={3} style={{ marginBottom: "24px" }}>
          {isEdit ? "แก้ไขกิจกรรม" : "สร้างกิจกรรมใหม่"}
        </Title>

        <style>
          {`
            .ant-input:hover, .ant-input:focus, .ant-input-focused {
              border-color: #000 !important;
              box-shadow: none !important;
            }
            .ant-picker:hover, .ant-picker-focused {
              border-color: #000 !important;
              box-shadow: none !important;
            }
            .ant-select:not(.ant-select-disabled):hover .ant-select-selector {
              border-color: #000 !important;
            }
            .ant-select-focused .ant-select-selector {
              border-color: #000 !important;
              box-shadow: none !important;
            }
            .ant-upload.ant-upload-select-picture-card:hover {
              border-color: #000 !important;
            }
            .ant-picker-time-panel-cell-selected .ant-picker-time-panel-cell-inner {
              background-color: #ededed !important;
            }
            .ant-picker-now-btn {
              color: #000 !important;
            }
          `}
        </style>

        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#000",
              colorBorder: "#d9d9d9",
              colorPrimaryHover: "#000",
            },
            components: {
              Button: {
                primaryShadow: "none",
                defaultShadow: "none",
                dangerShadow: "none",
              },
              Input: {
                activeBorderColor: "#000",
                hoverBorderColor: "#000",
                activeShadow: "none",
              },
              Select: {
                colorPrimary: "#000",
                colorPrimaryHover: "#000",
                controlOutline: "none",
              },
              DatePicker: {
                colorPrimary: "#000",
                colorPrimaryHover: "#000",
                controlOutline: "none",
              },
              Upload: {
                colorPrimary: "#000",
                colorPrimaryHover: "#000",
              },
            },
          }}
        >
          <Form form={form} layout="vertical" onFinish={onFormSubmit}>
            <Form.Item
              name="activityName"
              label="ชื่อกิจกรรม"
              rules={[{ required: true, message: "กรุณาระบุชื่อกิจกรรม" }]}
            >
              <Input size="large" style={{ borderRadius: "8px" }} />
            </Form.Item>
            <Form.Item
              name="description"
              label="รายละเอียดกิจกรรม"
              rules={[{ required: true, message: "กรุณาระบุรายละเอียดกิจกรรม" }]}
            >
              <TextArea rows={4} size="large" style={{ borderRadius: "8px" }} />
            </Form.Item>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="startDate"
                  label="เริ่มต้นกิจกรรม"
                  rules={[
                    { required: true, message: "กรุณาเลือกวันเริ่มต้นกิจกรรม" },
                  ]}
                >
                  <DatePicker
                    locale={customLocale}
                    showTime
                    showNow={true}
                    format="YYYY-MM-DD HH:mm"
                    placeholder="กรุณาเลือกวันที่"
                    size="large"
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="endDate"
                  label="สิ้นสุดกิจกรรม"
                  dependencies={["startDate"]}
                  rules={[
                    { required: true, message: "กรุณาเลือกวันสิ้นสุดกิจกรรม" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const startDate = getFieldValue("startDate");
                        if (!value || !startDate) {
                          return Promise.resolve();
                        }
                        if (value.isBefore(startDate)) {
                          return Promise.reject(
                            new Error("วันสิ้นสุดกิจกรรมต้องอยู่หลังวันเริ่มต้น")
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <DatePicker
                    locale={customLocale}
                    showTime
                    showNow={true}
                    format="YYYY-MM-DD HH:mm"
                    size="large"
                    placeholder="กรุณาเลือกวันที่"
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="regStartDate"
                  label="เริ่มต้นลงทะเบียน"
                  dependencies={["startDate", "endDate"]}
                  rules={[
                    { required: true, message: "กรุณาเลือกวันเริ่มต้นลงทะเบียน" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const startDate = getFieldValue("startDate");
                        const endDate = getFieldValue("endDate");

                        if (!value) return Promise.resolve();

                        if (startDate && value.isBefore(startDate)) {
                          return Promise.reject(
                            new Error(
                              "วันเริ่มลงทะเบียนต้องไม่ก่อนวันเริ่มกิจกรรม"
                            )
                          );
                        }
                        if (endDate && value.isAfter(endDate)) {
                          return Promise.reject(
                            new Error(
                              "วันเริ่มลงทะเบียนต้องไม่หลังวันสิ้นสุดกิจกรรม"
                            )
                          );
                        }

                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <DatePicker
                    locale={customLocale}
                    showTime
                    showNow={true}
                    format="YYYY-MM-DD HH:mm"
                    size="large"
                    placeholder="กรุณาเลือกวันที่"
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="regEndDate"
                  label="สิ้นสุดลงทะเบียน"
                  dependencies={["regStartDate", "startDate", "endDate"]}
                  rules={[
                    { required: true, message: "กรุณาเลือกวันสิ้นสุดลงทะเบียน" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const regStartDate = getFieldValue("regStartDate");
                        const startDate = getFieldValue("startDate");
                        const endDate = getFieldValue("endDate");

                        if (!value) return Promise.resolve();

                        if (regStartDate && value.isBefore(regStartDate)) {
                          return Promise.reject(
                            new Error(
                              "วันสิ้นสุดลงทะเบียนต้องอยู่หลังวันเริ่มต้นลงทะเบียน"
                            )
                          );
                        }
                        if (startDate && value.isBefore(startDate)) {
                          return Promise.reject(
                            new Error(
                              "วันสิ้นสุดลงทะเบียนต้องไม่ก่อนวันเริ่มกิจกรรม"
                            )
                          );
                        }
                        if (endDate && value.isAfter(endDate)) {
                          return Promise.reject(
                            new Error(
                              "วันสิ้นสุดลงทะเบียนต้องไม่หลังวันสิ้นสุดกิจกรรม"
                            )
                          );
                        }

                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <DatePicker
                    locale={customLocale}
                    showTime
                    showNow={true}
                    format="YYYY-MM-DD HH:mm"
                    size="large"
                    placeholder="กรุณาเลือกวันที่"
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="organizer"
              label="ผู้จัดกิจกรรม"
              rules={[{ required: true, message: "กรุณาระบุผู้จัดกิจกรรม" }]}
            >
              <Input size="large" style={{ borderRadius: "8px" }} />
            </Form.Item>
            <Form.Item
              name="type"
              label="ประเภทกิจกรรม"
              rules={[{ required: true, message: "กรุณาระบุประเภทกิจกรรม" }]}
            >
              <Input size="large" style={{ borderRadius: "8px" }} />
            </Form.Item>

            <Form.Item
              name="location_id"
              label="สถานที่จัดกิจกรรม"
              rules={[{ required: true, message: "กรุณาเลือกสถานที่" }]}
            >
              <Select
                size="large"
                placeholder="เลือกสถานที่"
                allowClear
                style={{ borderRadius: "8px" }}
                options={locations.map((loc) => ({
                  value: loc.ID,
                  label: loc.building,
                }))}
              />
            </Form.Item>

            <Form.Item label="อัปโหลดรูปภาพ">
              <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={() => false}
                fileList={fileList}
                onChange={onFileChange}
              >
                {fileList.length < 1 && (
                  <div>
                    <UploadOutlined
                      style={{ fontSize: "24px", color: "#595959" }}
                    />
                  </div>
                )}
              </Upload>
            </Form.Item>

            <div style={{ marginTop: "40px" }}>
              <Space>
                <Button
                  size="large"
                  style={{ borderRadius: "8px", width: "120px" }}
                  onClick={onClose}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={loading}
                  style={{
                    background: "#000",
                    borderColor: "#000",
                    borderRadius: "8px",
                    width: "120px",
                  }}
                >
                  บันทึก
                </Button>
              </Space>
            </div>
          </Form>
        </ConfigProvider>
      </Card>
    </Layout>
  );
};
