import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LogOut, PanelLeftClose, PanelLeft } from "lucide-react";
import { studentMenuItems } from "./studentMenu";
import { getImageUrl } from "@/utils/imageUtils";


interface StudentSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}
export default function StudentSidebar({
  collapsed,
  onToggle,
}: StudentSidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <aside className="w-full h-full bg-white overflow-y-auto flex flex-col">
    

      {/* Toggle Button */}
      <div
        className={`p-2 border-b border-gray-100 flex ${
          collapsed ? "justify-center" : "justify-end"
        }`}
      >
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title={collapsed ? "ขยาย" : "ย่อ"}
        >
          {collapsed ? (
            <PanelLeft className="w-4 h-4 text-gray-600" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      <div className={`flex-1 ${collapsed ? "p-2" : "p-4"}`}>
        {/* Profile Section */}
        <div
          className={`flex flex-col items-center mb-4 pb-3 border-b border-gray-100 ${
            collapsed ? "space-y-1" : "space-y-2"
          }`}
        >
          <NavLink
            to="/student/profile-skill"
            className="group"
            title="จัดการโปรไฟล์"
          >
            <div
              className={`bg-white rounded-full flex items-center justify-center overflow-hidden transition-all ${
                collapsed ? "w-10 h-10" : "w-14 h-14"
              } group-hover:ring-2 group-hover:ring-black`}
            >
              <img
                src={getImageUrl(user?.avatar_url)}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </NavLink>

          {!collapsed && (
            <>
              <div className="text-center w-full">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {user?.first_name || "ชื่อ"}-{user?.last_name || "สกุล"}
                </h3>
                <p className="text-xs text-gray-400">
                  @{user?.sut_id || "tag"}
                </p>
                <NavLink to="/student/profile-skill"></NavLink>
              </div>
            </>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-3">
          {studentMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === "/student"}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center rounded-lg transition-colors text-sm ${
                    collapsed ? "justify-center p-2" : "gap-2 px-2 py-2"
                  } ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className={`border-t border-gray-100 ${collapsed ? "p-2" : "p-3"}`}>
        <button
          onClick={handleLogout}
          title={collapsed ? "ออกจากระบบ" : undefined}
          className={`flex items-center w-full text-red-500 hover:bg-red-100 rounded-lg transition-colors text-sm ${
            collapsed ? "justify-center p-2" : "gap-2 px-3 py-2"
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="font-medium">ออกจากระบบ</span>}
        </button>
      </div>
    </aside>
  );
}
