import {
  Calendar,
  MessageSquare,
  Star,
  Trophy,
  Briefcase,
  Award,
  Coins,
  TableOfContents,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

// Type สำหรับ Menu Item
export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

// Student Menu Items - ตรงกับ routes ใน StudentRoutes.tsx
export const studentMenuItems: MenuItem[] = [
  // ระบบจัดการกิจกรรมและการแข่งขัน
  {
    id: "events",
    label: "กิจกรรมและการแข่งขัน",
    icon: Calendar,
    path: "/student/events",
  },
  // ระบบส่งแบบฟอร์มเสนอกิจกรรม
  {
    id: "proposal activity",
    label: "สถานะแบบฟอร์มเสนอกิจกรรม",
    icon: TableOfContents,
    path: "/student/activity/status_activity",
  },
  {
    id: "communication",
    label: "สื่อสารในกิจกรรม",
    icon: MessageSquare,
    path: "/student/communication",
  },
  // ระบบลงทะเบียนและจัดการทีม
  {
    id: "registration",
    label: "ลงทะเบียนและจัดการทีม",
    icon: ScrollText,
    path: "/student/registrations/MyRegistrationsPage",
  },
  // ระบบประเมินกิจกรรม
  {
    id: "feedback",
    label: "ประเมินกิจกรรม",
    icon: Star,
    path: "/student/feedback",
  },
  // ระบบประกาศผลและสรุปกิจกรรม
  {
    id: "results",
    label: "ผลกิจกรรม",
    icon: Trophy,
    path: "/student/results",
  },
  // ระบบคลังผลงานนักศึกษา
  {
    id: "portfolio",
    label: "คลังผลงาน",
    icon: Briefcase,
    path: "/student/portfolio",
  },
  // ระบบรับรองผลการเข้าร่วมกิจกรรม
  {
    id: "certificates",
    label: "ใบรับรอง",
    icon: Award,
    path: "/student/certificates",
  },
  // ระบบสะสมคะแนน
  {
    id: "points",
    label: "คะแนนสะสม",
    icon: Coins,
    path: "/student/points",
  },
];