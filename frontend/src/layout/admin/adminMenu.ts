import {
  Calendar,
  MessageSquare,
  Users,
  Star,
  Trophy,
  Briefcase,
  Award,
  Coins,
} from "lucide-react";
import type { MenuItem } from "../student/studentMenu";

// Admin Menu Items - ครบ 10 ระบบ
export const adminMenuItems: MenuItem[] = [
 
  // ระบบจัดการกิจกรรมและการแข่งขัน
  {
    id: "events",
    label: "จัดการกิจกรรม",
    icon: Calendar,
    path: "/admin/events",
  },
  // ระบบสื่อสารภายในกิจกรรม
  {
    id: "communication",
    label: "การสื่อสาร",
    icon: MessageSquare,
    path: "/admin/communication",
  },
  // ระบบลงทะเบียนและจัดการทีม
  {
    id: "teams",
    label: "จัดการทีม",
    icon: Users,
    path: "/admin/registrations"
  },
  // ระบบประเมินและความคิดเห็นกิจกรรม
  {
    id: "feedback",
    label: "ประเมิน",
    icon: Star,
    path: "/admin/feedback",
  },
  // ระบบประกาศผลและสรุปกิจกรรม
  {
    id: "results",
    label: "ประกาศผล",
    icon: Trophy,
    path: "/admin/results",
  },
  // ระบบคลังผลงานนักศึกษา
  {
    id: "portfolio",
    label: "คลังผลงาน",
    icon: Briefcase,
    path: "/admin/portfolio",
  },
  // ระบบรับรองผลการเข้าร่วมกิจกรรม
  {
    id: "certificates",
    label: "ใบประกาศนียบัตร",
    icon: Award,
    path: "/admin/certificates",
  },
  // ระบบจัดการคะแนนและแต้มสะสม
  {
    id: "points",
    label: "คะแนนสะสม",
    icon: Coins,
    path: "/admin/points",
  },

];
