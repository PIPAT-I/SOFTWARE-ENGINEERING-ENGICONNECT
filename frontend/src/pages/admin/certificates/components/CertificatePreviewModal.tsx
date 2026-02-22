import React, { useState, useEffect } from 'react';
import { Button, Typography, Space, message, Modal } from 'antd';
import { PictureOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface CertificatePreviewModalProps {
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
}

const CertificatePreviewModal: React.FC<CertificatePreviewModalProps> = ({ open, onCancel, data }) => {
    const [currentType, setCurrentType] = useState<"participation" | "winner">(data.hasAward ? "winner" : "participation");
    const printRef = React.useRef<HTMLDivElement>(null);

    // Update currentType when data changes
    useEffect(() => {
        setCurrentType(data.hasAward ? "winner" : "participation");
    }, [data.hasAward, data.name]);

    const activeTemplate = currentType === "winner" ? data.template_winner : data.template_participation;

    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) return;

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
                        body { 
                            margin: 0; 
                            padding: 0; 
                            width: 100vw; 
                            height: 100vh; 
                            overflow: hidden; 
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: #fff;
                        }
                        .cert-page {
                            position: relative;
                            width: 100vw;
                            height: 100vh;
                            overflow: hidden;
                        }
                        .bg-img {
                            width: 100%;
                            height: 100%;
                            object-fit: fill; /* Use fill to ensure it matches the page exactly */
                            position: absolute;
                            top: 0;
                            left: 0;
                        }
                        .content-layer {
                            position: relative;
                            z-index: 10;
                            width: 100%;
                            height: 100%;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            text-align: center;
                            font-family: "Sarabun", sans-serif;
                            color: #1a1a1a;
                            padding: 40px;
                        }
                        .activity-name { font-size: 24px; margin-bottom: 60px; font-weight: bold; }
                        .student-name { font-size: 44px; font-weight: bold; color: #b8860b; margin-bottom: 20px; }
                        .cert-detail { font-size: 18px; width: 65%; line-height: 1.6; margin-bottom: 40px; }
                        .sign-section {
                            position: absolute;
                            bottom: 12%;
                            right: 10%;
                            text-align: center;
                            min-width: 250px;
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
                        function startPrint() {
                            window.print();
                            setTimeout(() => window.close(), 1000);
                        }
                        if (img.complete) {
                            startPrint();
                        } else {
                            img.onload = startPrint;
                            img.onerror = startPrint;
                        }
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
                <Button key="close" onClick={onCancel}>ยกเลิก</Button>,
                <Button key="print" type="primary" onClick={handlePrint} icon={<PictureOutlined />} style={{ background: 'black', borderColor: 'black' }}>พิมพ์/บันทึก PDF</Button>
            ]}
            width={950}
            title={null}
            centered
            bodyStyle={{ padding: '24px' }}
        >
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Space size="large">
                    <Button
                        type={currentType === 'participation' ? 'primary' : 'default'}
                        className="btn-outline-hover-black"
                        onClick={() => setCurrentType('participation')}
                        style={currentType === 'participation' ? { background: 'black', borderColor: 'black' } : {}}
                    >
                        เข้าร่วมกิจกรรม
                    </Button>
                    {data.hasAward && (
                        <Button
                            type={currentType === 'winner' ? 'primary' : 'default'}
                            className="btn-outline-hover-black"
                            onClick={() => setCurrentType('winner')}
                            style={currentType === 'winner' ? { background: 'black', borderColor: 'black' } : {}}
                        >
                            รางวัล
                        </Button>
                    )}
                </Space>
            </div>

            <div id="certificate-print-area" ref={printRef} style={{
                width: '100%',
                aspectRatio: '1.414/1',
                position: 'relative',
                background: '#fff',
                overflow: 'hidden',
                border: '12px double #d9d9d9',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderRadius: '4px'
            }}>
                {/* Background Image */}
                {activeTemplate ? (
                    <img
                        src={activeTemplate}
                        alt="template"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                        <Text>ไม่มีภาพพื้นหลัง</Text>
                    </div>
                )}

                {/* Overlay Content */}
                <div style={{
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '60px',
                    zIndex: 1
                }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>{data.title_th}</div>

                    <div style={{ fontSize: '42px', color: '#b8860b', fontStyle: 'italic', fontWeight: 'bold', margin: '20px 0' }}>{data.name}</div>
                    <div style={{ fontSize: '18px', maxWidth: '80%', lineHeight: 1.6 }}>{data.detail}</div>

                    <div style={{ position: 'absolute', bottom: '12%', right: '12%', textAlign: 'right' }}>
                        <div style={{ fontSize: '16px', fontWeight: 500 }}>{data.organizer}</div>
                        <div style={{ fontSize: '14px', color: '#666' }}>วันที่: {data.date}</div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default CertificatePreviewModal;
