import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";
import { adminMenuItems } from "./adminMenu";
import { BrandLogo } from "@/components/ui/brand-logo";

interface AdminSidebarProps {
  collapsed: boolean;
}

export default function AdminSidebar({ collapsed }: AdminSidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="w-full h-full bg-white overflow-y-auto flex flex-col">
      {/* Logo Section */}
      <div
        className={`border-b border-gray-100 flex items-center justify-center ${
          collapsed ? "p-3" : "px-4 py-3"
        }`}
      >
        <BrandLogo
          size="sm"
          variant="dark"
          showText={!collapsed}
          linkTo="/admin"
        />
      </div>

      <div className={`flex-1 ${collapsed ? "p-2" : "p-4"}`}>
        {/* Navigation Menu */}
        <nav className="space-y-3">
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === "/admin"}
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
          className={`flex items-center w-full text-red-600 hover:bg-gray-100 rounded-lg transition-colors text-sm ${
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
