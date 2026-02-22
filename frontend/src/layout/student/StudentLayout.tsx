import { Outlet } from "react-router-dom";
import { useState } from "react";
import StudentSidebar from "./StudentSidebar";

export default function StudentLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="fixed insert-0 h-screen w-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-1">
      <div className="w-full h-[calc(100vh-0.5rem)] bg-white overflow-hidden flex rounded-xl">
        {/* Sidebar */}
        <aside
          className={`bg-white border-r border-gray-100 shrink-0 transition-all duration-300 ${
            collapsed ? "w-16" : "w-64"
          }`}
        >
          <StudentSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
