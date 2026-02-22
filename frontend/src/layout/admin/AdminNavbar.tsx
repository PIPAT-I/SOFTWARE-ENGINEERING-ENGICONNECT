import { useAuth } from "@/context/AuthContext";
import { Bell, PanelLeftClose, PanelLeft } from "lucide-react";
import { NavLink } from "react-router-dom";
import { getImageUrl } from "@/utils/imageUtils";

interface AdminNavbarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AdminNavbar({ collapsed, onToggle }: AdminNavbarProps) {
  const { user } = useAuth();

  return (
    <header className="h-14 bg-white border-b border-gray-100 px-4 flex items-center justify-between shrink-0">
      {/* Left - Toggle */}
      <button
        onClick={onToggle}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title={collapsed ? "ขยาย Sidebar" : "ย่อ Sidebar"}
      >
        {collapsed ? (
          <PanelLeft className="w-5 h-5 text-gray-600" />
        ) : (
          <PanelLeftClose className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Right - Notifications + Profile */}
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
        </button>

        {/* Profile */}
        <NavLink
          to="/admin/profile-skill"
          className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-500">ผู้ดูแลระบบ</p>
          </div>
          <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
            <img
              src={getImageUrl(user?.avatar_url)}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </NavLink>
      </div>
    </header>
  );
}
