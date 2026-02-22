import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import ProtectedRoute from "./ProtectedRoute";
import StudentLayout from "@/layout/student/StudentLayout";
import { Loadable } from "@/utils/Loadable";
const StudentProfileSkill = Loadable(
  lazy(() => import("@/pages/student/profile-skill/StudentProfile"))
);
const StudentEvents = Loadable(lazy(() => import("@/pages/student/events")));

const StudentCommunication = Loadable(
  lazy(() => import("@/pages/student/communication"))
);
const StudentCommunicationChat = Loadable(
  lazy(() => import("@/pages/student/communication/chat"))
);
const StudentTeams = Loadable(lazy(() => import("@/pages/student/teams")));
const StudentFeedback = Loadable(
  lazy(() => import("@/pages/student/feedback"))
);
const StudentResults = Loadable(lazy(() => import("@/pages/student/results")));
const StudentPortfolio = Loadable(
  lazy(() => import("@/pages/student/portfolio"))
);
const StudentPortfolioCreate = Loadable(
  lazy(() => import("@/pages/student/portfolio/create"))
);
const StudentPortfolioDetail = Loadable(
  lazy(() => import("@/pages/student/portfolio/detail"))
);
const StudentPortfolioEdit = Loadable(
  lazy(() => import("@/pages/student/portfolio/edit"))
);
const StudentCertificates = Loadable(
  lazy(() => import("@/pages/student/certificates"))
);
const StudentPoints = Loadable(lazy(() => import("@/pages/student/points")));
const StudentPointsReward = Loadable(
  lazy(() => import("@/pages/student/points/reward"))
);
const EditProfile = Loadable(
  lazy(() => import("@/pages/student/profile-skill/EditProfile"))
);
const OtherStudentPortfolio = Loadable(
  lazy(() => import("@/pages/student/portfolio/checkother"))
);

const StudentStatusActivity = Loadable(
  lazy(() => import("@/pages/student/activity/status_activity"))
);
const StudentEditActivity = Loadable(
  lazy(() => import("@/pages/student/activity/edit_activity"))
);
const StudentDetailActivity = Loadable(
  lazy(() => import("@/pages/student/activity/detail_activity"))
);
const StudentCreateRegistration = Loadable(
  lazy(() => import("@/pages/student/registrations/CreateRegistration"))
);
const StudentMyRegistrations = Loadable(
  lazy(() => import("@/pages/student/registrations/MyRegistrationsPage"))
);
const StudentRegistrationDetail = Loadable(
  lazy(() => import("@/pages/student/registrations/EditeRegistration"))
);
const StudentProposalActivity = Loadable(
  lazy(() => import("@/pages/student/activity/proposal_Activity"))
);

export const studentRoutes: RouteObject[] = [
  {
    path: "/student",
    element: (
      <ProtectedRoute allowedRoles={["student"]}>
        <StudentLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <StudentEvents />,
      },

      {
        path: "profile-skill",
        element: <StudentProfileSkill />,
      },
      {
        path: "profile-skill/edit",
        element: <EditProfile />,
      },
      {
        path: "profile-skill/:userId",
        element: <StudentProfileSkill />,
      },
      {
        path: "profile-skill/:studentId/portfolio",
        element: <OtherStudentPortfolio />,
      },
      {
        path: "profile-skill/:studentId/portfolio/:id",
        element: <StudentPortfolioDetail />,
      },
      {
        path: "events",
        element: <StudentEvents />,
      },

      {
        path: "communication",
        element: <StudentCommunication />,
      },
      {
        path: "communication/chat/:postID",
        element: <StudentCommunicationChat />,
      },
      {
        path: "teams",
        element: <StudentTeams />,
      },

      {
        path: "feedback",
        element: <StudentFeedback />,
      },
      {
        path: "results",
        element: <StudentResults />,
      },
      {
        path: "portfolio",
        element: <StudentPortfolio />,
      },
      {
        path: "portfolio/create",
        element: <StudentPortfolioCreate />,
      },
      {
        path: "portfolio/:id",
        element: <StudentPortfolioDetail />,
      },
      {
        path: "portfolio/edit/:id",
        element: <StudentPortfolioEdit />,
      },
      {
        path: "certificates",
        element: <StudentCertificates />,
      },
       {
        path: "activity/proposal_Activity",
        element: <StudentProposalActivity />,
      },
      {
        path: "points",
        element: <StudentPoints />,
      },
      {
        path: "points/reward",
        element: <StudentPointsReward />,
      },
      {
        path: "activity/status_activity",
        element: <StudentStatusActivity />,
      },

      {
        path: "activity/edit_activity/:id",
        element: <StudentEditActivity />
      },

      {
        path: "activity/detail_activity/:id",
        element: <StudentDetailActivity />
      },

      {
        path: "activities/:id/register",
        element: <StudentCreateRegistration />,
      },

      {
        path: "registrations/MyRegistrationsPage",
        element: <StudentMyRegistrations />,
      },
      {
        path: "registrations/:id",
        element: <StudentRegistrationDetail />,
      },

    ],
  },
];
