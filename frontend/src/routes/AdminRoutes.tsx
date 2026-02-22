import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "@/layout/admin/AdminLayout";
import { Loadable } from "@/utils/Loadable";
const AdminProfileSkill = Loadable(lazy(() => import("@/pages/admin/profile-skill")));
const StudentProfileSkill = Loadable(lazy(() => import("@/pages/student/profile-skill/StudentProfile")));
const AdminCommunication = Loadable(lazy(() => import("@/pages/admin/communication")));
const AdminCommunicationChat = Loadable(lazy(() => import("@/pages/admin/communication/chat")));
const AdminTeams = Loadable(lazy(() => import("@/pages/admin/teams")));
const AdminFeedback = Loadable(lazy(() => import("@/pages/admin/feedback")));
const AdminResults = Loadable(lazy(() => import("@/pages/admin/results")));
const AdminCertificates = Loadable(lazy(() => import("@/pages/admin/certificates")));
const AdminPoints = Loadable(lazy(() => import("@/pages/admin/points")));
const AdminPointsRewards = Loadable(lazy(() => import("@/pages/admin/points/rewards")));
const AdminEvents = Loadable(lazy(() => import('@/pages/admin/events')));
const AdminPortfolio = Loadable(lazy(() => import('@/pages/admin/portfolio')));
const AdminPortfolioDetail = Loadable(lazy(() => import('@/pages/admin/portfolio/detail')));
const AdminRegistrationsPage = Loadable(lazy(() => import("@/pages/admin/registrations/AdminRegistrationsPage")));
const AdminRegistrationDetail = Loadable(lazy(() => import("@/pages/admin/registrations/AdminRegistrationsDetail")));

export const adminRoutes: RouteObject[] = [
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "profile-skill",
        element: <AdminProfileSkill />,
      },
      {
        path: "profile-skill/:userId",
        element: <StudentProfileSkill />,
      },
      // ระบบสื่อสารภายในกิจกรรม
      {
        path: "communication",
        element: <AdminCommunication />,
      },
      {
        path: "communication/chat/:postID",
        element: <AdminCommunicationChat />,
      },
      // ระบบลงทะเบียนและจัดการทีม
      {
        path: "teams",
        element: <AdminTeams />,
      },
      // ระบบประเมินและความคิดเห็นกิจกรรม
      {
        path: "feedback",
        element: <AdminFeedback />,
      },
      // ระบบประกาศผลและสรุปกิจกรรม
      {
        path: "results",
        element: <AdminResults />,
      },
      // ระบบคลังผลงานนักศึกษา
      {
        path: 'portfolio',
        element: <AdminPortfolio />,
      },

      {
        path: 'portfolio/:id',
        element: <AdminPortfolioDetail />,
      },
      // ระบบรับรองผลการเข้าร่วมกิจกรรม
      {
        path: "certificates",
        element: <AdminCertificates />,
      },
      // ระบบสะสมคะแนน
      {
        path: "points",
        element: <AdminPoints />,
      },
      {
        path: "points/rewards",
        element: <AdminPointsRewards />,
      },
      {
        path: 'events',
        element: <AdminEvents />,
      },
      {
        path: "registrations",
        element: <AdminRegistrationsPage />,
      },

      {
        path: "registrations/:id",
        element: <AdminRegistrationDetail />,
      },
    ],
  },
];
