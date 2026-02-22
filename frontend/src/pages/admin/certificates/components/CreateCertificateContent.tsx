import React, { useState, useEffect } from 'react';
import { Layout, Card, Button, Typography, Space, Row, Col, Form, Input, Upload, message } from 'antd';
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import type { DataType } from './types';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface CreateCertificateContentProps {
    onBack: () => void;
    activity?: DataType | null;
    initialData?: any;
    onSave: (values: any) => void;
}

const CreateCertificateContent: React.FC<CreateCertificateContentProps> = ({ onBack, activity, initialData, onSave }) => {
    const [form] = Form.useForm();
    const [partFileList, setPartFileList] = useState<any[]>([]); // Participation image
    const [winFileList, setWinFileList] = useState<any[]>([]);   // Winner image

    useEffect(() => {
        if (initialData) {
            form.setFieldsValue(initialData);
            if (initialData.picture_participation) {
                setPartFileList([{ uid: '-1', name: 'p.png', status: 'done', url: initialData.picture_participation }]);
            }
            if (initialData.picture_winner) {
                setWinFileList([{ uid: '-2', name: 'w.png', status: 'done', url: initialData.picture_winner }]);
            }
        } else {
            form.resetFields();
            form.setFieldsValue({
                title_th: activity?.activity || "",
                title_en: "",
                detail: "ได้เข้าร่วมโครงการและผ่านการประเมินผลตามเกณฑ์ที่กำหนด",
                organizer: activity?.organizer
            });
            setPartFileList([]);
            setWinFileList([]);
        }
    }, [initialData, activity, form]);

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
        });
    };

    const onFinish = async (values: any) => {
        if (partFileList.length === 0 || winFileList.length === 0) {
            message.error("กรุณาอัปโหลดรูปพื้นหลังให้ครบทั้ง 2 ส่วน");
            return;
        }

        let pImg = partFileList[0]?.url || "";
        if (partFileList[0]?.originFileObj) {
            pImg = await convertToBase64(partFileList[0].originFileObj);
        }

        let wImg = winFileList[0]?.url || "";
        if (winFileList[0]?.originFileObj) {
            wImg = await convertToBase64(winFileList[0].originFileObj);
        }

        onSave({
            ...values,
            picture_participation: pImg,
            picture_winner: wImg
        });
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#fff' }}>
            <Card
                style={{
                    borderRadius: '16px',
                    border: '1px solid #d9d9d9',
                    width: '100%',
                }}
                bodyStyle={{ padding: '40px' }}
            >
                <div style={{ marginBottom: 24, cursor: 'pointer' }} onClick={onBack}>
                    <Space><ArrowLeftOutlined /><Text strong>ยกเลิกและกลับ</Text></Space>
                </div>
                <Title level={3} style={{ marginBottom: 32 }}>ออกแบบเทมเพลตใบประกาศ</Title>
                <Form form={form} layout="vertical" size="large" onFinish={onFinish}>

                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item label="หัวข้อใบประกาศ (ภาษาไทย)" name="title_th" rules={[{ required: true }]}>
                                <Input placeholder="เช่น เกียรติบัตรฉบับนี้ให้ไว้เพื่อแสดงว่า" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="หัวข้อใบประกาศ (ภาษาอังกฤษ)" name="title_en" rules={[{ required: true, message: 'กรุณากรอกหัวข้อภาษาอังกฤษ' }]}>
                                <Input placeholder="e.g. Certificate of Appreciation" />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="ข้อความรายละเอียดในใบประกาศ (จะปรากฏใต้ชื่อผู้ได้รับ)" name="detail" rules={[{ required: true, message: 'กรุณากรอกรายละเอียด' }]}>
                                <TextArea rows={3} placeholder="เช่น ได้เข้าร่วมโครงการและผ่านการประเมินผลตามเกณฑ์ที่กำหนด" />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="ชื่อองค์กร/หน่วยงาน" name="organizer" rules={[{ required: true, message: 'กรุณากรอกชื่อหน่วยงาน' }]}><Input /></Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={32} style={{ marginTop: 24 }}>
                        <Col span={12}>
                            <Card title="เทมเพลตสำหรับผู้เข้าร่วมทั่วไป" size="small" style={{ borderRadius: 8 }}>
                                <Form.Item
                                    label="อัปโหลด (.png/jpg)"
                                    required
                                >
                                    <Upload
                                        listType="picture-card"
                                        maxCount={1}
                                        fileList={partFileList}
                                        onChange={({ fileList }) => setPartFileList(fileList)}
                                        beforeUpload={() => false}
                                    >
                                        {partFileList.length < 1 && <UploadOutlined />}
                                    </Upload>
                                    {partFileList.length === 0 && <div style={{ color: '#ff4d4f', fontSize: '14px', marginTop: '8px' }}>กรุณาอัปโหลดรูปพื้นหลัง</div>}
                                </Form.Item>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card title="เทมเพลตสำหรับผู้ที่ได้รางวัล" size="small" style={{ borderRadius: 8 }}>
                                <Form.Item
                                    label="อัปโหลด (.png/jpg)"
                                    required
                                >
                                    <Upload
                                        listType="picture-card"
                                        maxCount={1}
                                        fileList={winFileList}
                                        onChange={({ fileList }) => setWinFileList(fileList)}
                                        beforeUpload={() => false}
                                    >
                                        {winFileList.length < 1 && <UploadOutlined />}
                                    </Upload>
                                    {winFileList.length === 0 && <div style={{ color: '#ff4d4f', fontSize: '14px', marginTop: '8px' }}>กรุณาอัปโหลดรูปพื้นหลัง</div>}
                                </Form.Item>
                            </Card>
                        </Col>
                    </Row>

                    <div style={{ marginTop: 40, textAlign: 'right' }}>
                        <Space>
                            <Button size="large" onClick={onBack}>ยกเลิก</Button>
                            <Button type="primary" htmlType="submit" size="large" style={{ background: 'black', minWidth: 200 }}>บันทึกเทมเพลต</Button>
                        </Space>
                    </div>
                </Form>
            </Card>
        </Layout>
    );
};

export default CreateCertificateContent;
