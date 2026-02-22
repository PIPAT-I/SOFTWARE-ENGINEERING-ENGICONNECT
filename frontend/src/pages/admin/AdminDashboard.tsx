
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ยินดีต้อนรับกลับ, {user?.first_name || "Admin"}!
          </h1>
          <p className="text-gray-500 mt-1">
            {user?.role?.name || "Admin"} · {user?.email || ""}
          </p>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">จัดการนักศึกษา</h3>
          <p className="text-gray-500 text-sm">จัดการข้อมูลและโปรไฟล์นักศึกษา</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">จัดการกิจกรรม</h3>
          <p className="text-gray-500 text-sm">สร้างและอนุมัติกิจกรรมต่างๆ</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">รายงานและสถิติ</h3>
          <p className="text-gray-500 text-sm">ดูข้อมูลและสถิติของระบบ</p>
        </div>
      </div>
    </div>
  );
}
