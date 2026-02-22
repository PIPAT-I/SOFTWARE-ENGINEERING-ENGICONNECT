import { Outlet } from "react-router-dom";
import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen  from-blue-50 via-indigo-50 to-purple-50 p-1">
      <div className="w-full h-[calc(100vh-0.5rem)] bg-white overflow-hidden flex flex-col rounded-xl">
        {/* Navbar */}
        <AdminNavbar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        
        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside
            className={`bg-white border-r border-gray-100 shrink-0 transition-all duration-300 ${
              collapsed ? "w-16" : "w-64"
            }`}
          >
            <AdminSidebar collapsed={collapsed} />
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-gray-50 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
