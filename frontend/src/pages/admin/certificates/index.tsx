import React, { useState, useEffect } from 'react';
import { Layout, message } from 'antd';

// --- Services & Interfaces ---
import { GetAllPosts } from '../../../services/postServices';
import type { Post } from "../../../interfaces/post";
import {
    GetMyCertificate,
    CreateCertificate,
    UpdateCertificate,
    DeleteCertificate
} from '../../../services/certificateService';

// --- Components ---
import type { DataType } from './components/types';
import { customStyles } from './components/styles';
import DashboardContent from './components/DashboardContent';
import CreateCertificateContent from './components/CreateCertificateContent';
import ParticipantListContent from './components/ParticipantListContent';

const { Content } = Layout;

// ==========================================
// Main Component
// ==========================================
const CertificateApp: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<'dashboard' | 'create' | 'participants'>('dashboard');
    const [selectedActivity, setSelectedActivity] = useState<DataType | null>(null);
    const [tableData, setTableData] = useState<DataType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });

    // ✅ Certificate State (Sync with DB)
    const [certificates, setCertificates] = useState<Record<number, any>>({});

    const fetchCertificates = async () => {
        const res = await GetMyCertificate();
        if (res && res.status === 200) {
            const certMap: Record<number, any> = {};
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            data.forEach((c: any) => {
                if (c.post_id) certMap[c.post_id] = c;
            });
            setCertificates(certMap);
        }
    };

    const mapStatusDisplay = (apiStatus?: string): string => {
        if (apiStatus === 'approved' || apiStatus === 'active') return 'Success';
        if (apiStatus === 'pending') return 'Pending';
        if (apiStatus === 'rejected') return 'Rejected';
        return apiStatus || '-';
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await GetAllPosts();
            if (res && res.status === 200) {
                let rawPosts: Post[] = [];
                if (Array.isArray(res.data)) rawPosts = res.data;
                else if (res.data && Array.isArray((res.data as any).data)) rawPosts = (res.data as any).data;

                setStats({
                    total: rawPosts.length,
                    approved: rawPosts.filter(p => {
                        const s = p.status?.status_name?.toLowerCase();
                        return s === 'approved' || s === 'active' || s === 'ended';
                    }).length,
                    pending: rawPosts.filter(p => p.status?.status_name?.toLowerCase() === 'pending').length,
                });

                const mappedData: DataType[] = rawPosts.map((post) => {
                    const statusName = post.status?.status_name || '';
                    return {
                        key: post.ID?.toString() || Math.random().toString(),
                        activityID: post.ID || 0,
                        activity: post.title || "ไม่ระบุชื่อกิจกรรม",
                        category: post.type || "-",
                        dateHeld: post.start_date ? new Date(post.start_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : "-",
                        dateIssued: '-',
                        certificate: '-',
                        status: mapStatusDisplay(statusName.toLowerCase()),
                        statusRaw: statusName,
                        picture: post.picture,
                        detail: post.detail,
                        organizer: post.organizer,
                        hasCertificate: !!certificates[post.ID || 0],
                        certImage: certificates[post.ID || 0]?.picture_participation,
                        stopDate: post.stop_date
                    };
                });

                // Filter for ENDED activities only (Current Time > stop_date)
                const endedActivities = mappedData.filter(item => {
                    if (!item.stopDate) return false;
                    return new Date() > new Date(item.stopDate);
                });

                setTableData(endedActivities.reverse());
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
            message.error("ไม่สามารถโหลดข้อมูลได้");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCertificates();
        fetchPosts();
    }, []);

    // เมื่อ certificates เปลี่ยน ให้ re-fetch posts เพื่ออัปเดตสถานะ UI
    useEffect(() => {
        fetchPosts();
    }, [certificates]);

    const handleCreateClick = (item: DataType) => {
        setSelectedActivity(item);
        setCurrentPage('create');
    };

    const handleEditClick = (item: DataType) => {
        setSelectedActivity(item);
        setCurrentPage('create');
    };

    const handleDeleteCertificate = async (activityID: number) => {
        const cert = certificates[activityID];
        if (cert && cert.ID) {
            setLoading(true);
            try {
                const res = await DeleteCertificate(cert.ID);
                if (res && res.status === 200) {
                    message.success("ลบข้อมูลเรียบร้อยแล้ว");

                    // 1. ลบจาก local state ทันทีเพื่อให้ UI เปลี่ยนแปลงทันที (เหมือนไม่เคยถูกสร้าง)
                    setCertificates(prev => {
                        const updated = { ...prev };
                        delete updated[activityID];
                        return updated;
                    });

                    // 2. โหลดข้อมูลใหม่เพื่อความถูกต้อง
                    await fetchCertificates();
                } else {
                    message.error("ไม่สามารถลบข้อมูลเทมเพลตได้");
                }
            } catch (error) {
                console.error("Delete error:", error);
                message.error("เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อลบข้อมูล");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSaveCertificate = async (values: any) => {
        if (!selectedActivity) return;
        const activityID = selectedActivity.activityID;
        const existingCert = certificates[activityID];

        let res;
        if (existingCert && existingCert.ID) {
            // ✅ แก้ไขข้อมูล (PUT /api/certificate/:id)
            res = await UpdateCertificate(existingCert.ID, {
                ...values,
                ID: existingCert.ID
            });
        } else {
            // ✅ สร้างใหม่ (POST /api/certificate)
            res = await CreateCertificate({
                ...values,
                post_id: activityID,
                title_th: values.title_th,
                title_en: values.title_en || "",
                date: values.date || new Date().toISOString(),
                type: values.type || "participation"
            });
        }

        if (res && (res.status === 200 || res.status === 201)) {
            message.success(existingCert ? "แก้ไขใบประกาศสำเร็จแล้ว" : "สร้างใบประกาศสำเร็จแล้ว");
            fetchCertificates();
            setCurrentPage('dashboard');
        } else {
            message.error("บันทึกไม่สำเร็จ (ตรวจสอบ GIN Log)");
        }
    };

    const handleViewParticipants = (item: DataType) => {
        setSelectedActivity(item);
        setCurrentPage('participants');
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#ffffffff' }}>
            <style>{customStyles}</style>
            <Content style={{ padding: '24px', width: '100%' }}>
                {currentPage === 'dashboard' && (
                    <DashboardContent
                        onCreateClick={handleCreateClick}
                        onEditClick={handleEditClick}
                        onDeleteClick={handleDeleteCertificate}
                        onViewParticipants={handleViewParticipants}
                        tableData={tableData}
                        loading={loading}
                        stats={stats}
                    />
                )}
                {currentPage === 'create' && (
                    <CreateCertificateContent
                        onBack={() => setCurrentPage('dashboard')}
                        activity={selectedActivity}
                        initialData={selectedActivity ? certificates[selectedActivity.activityID] : null}
                        onSave={handleSaveCertificate}
                    />
                )}
                {currentPage === 'participants' && (
                    <ParticipantListContent
                        onBack={() => setCurrentPage('dashboard')}
                        activity={selectedActivity}
                        certTemplate={selectedActivity ? certificates[selectedActivity.activityID] : null}
                    />
                )}
            </Content>
        </Layout>
    );
};

export default CertificateApp;
