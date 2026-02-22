import { useAuth } from "@/context/AuthContext";


export default function StudentDashboard() {
  const { user } = useAuth();
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ยินดีต้อนรับกลับ, {user?.first_name}!</h1>
          <p className="text-gray-500 mt-1">นี่คือภาพรวมกิจกรรมของคุณ</p>
        </div>
      </div>
    </div>
  
  );
}
