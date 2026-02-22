import { createBrowserRouter } from "react-router-dom";
import { studentRoutes } from './StudentRoutes';
import { adminRoutes } from './AdminRoutes';
import { Loadable } from "@/utils/Loadable";
import { lazy } from "react";

const LandingPage = Loadable(lazy(() => import('@/layout/landing/LandingPage')));
const Register = Loadable(lazy(() => import('@/pages/auth/RegisterPage')));


const mainRoutes = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <LandingPage />,
    
  },
  {
    path: '/login',
    element: <LandingPage />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  
  ...studentRoutes,

  ...adminRoutes,

  
]);

export default mainRoutes;