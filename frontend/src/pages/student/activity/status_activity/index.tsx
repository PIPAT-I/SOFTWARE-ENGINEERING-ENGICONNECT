import * as React from "react";
import {  useNavigate } from "react-router-dom";
import {  ArrowLeft, Calendar, MapPin, Users, Trash2, Eye, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { GetPost, DeletePost, formatBase64ToDataURL } from "@/services/postServices";
import { getLocations } from "@/services/metadataService";

import type { Post } from "@/interfaces/post";
import type { LocationInterface } from "@/interfaces/Location";

type PostStatusKey =
  | "pending"
  | "approved"
  | "rejected"
  | "upcoming"
  | "active"
  | "ended"
  | "unknown";

const normalizePostStatus = (p: Post): PostStatusKey => {
  const sid = Number(p.status_id);
  if (sid === 1) return "pending";
  if (sid === 2) return "approved";
  if (sid === 3) return "rejected";
  if (sid === 4) return "upcoming";
  if (sid === 5) return "active";
  if (sid === 6) return "ended";

  const raw = p.status?.status_name?.toLowerCase?.() ?? "";
  if (raw.includes("pending")) return "pending";
  if (raw.includes("approved")) return "approved";
  if (raw.includes("rejected")) return "rejected";
  if (raw.includes("upcoming")) return "upcoming";
  if (raw.includes("active")) return "active";
  if (raw.includes("ended")) return "ended";

  return "unknown";
};

const StatusBadge = ({ status }: { status: PostStatusKey }) => {
  const config: Record<PostStatusKey, { color: string; label: string; icon?: string }> = {
    pending: { color: "bg-amber-100 text-amber-700 border-amber-300", label: "รออนุมัติ" },
    approved: { color: "bg-green-100 text-green-700 border-green-300", label: "อนุมัติแล้ว", icon: "✓" },
    rejected: { color: "bg-red-100 text-red-700 border-red-300", label: "ไม่อนุมัติ", icon: "✗" },
    upcoming: { color: "bg-slate-100 text-slate-700 border-slate-300", label: "ยังไม่เริ่ม", },
    active: { color: "bg-emerald-100 text-emerald-700 border-emerald-300", label: "กำลังดำเนินการ", icon: "▶" },
    ended: { color: "bg-slate-100 text-slate-700 border-slate-300", label: "สิ้นสุดแล้ว", icon: "■" },
    unknown: { color: "bg-slate-100 text-slate-700 border-slate-300", label: "ไม่ระบุ", icon: "?" },
  };

  const cfg = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <span>{cfg.icon}</span>
      <span>{cfg.label}</span>
    </span>
  );
};

interface PostCardProps {
  post: Post;
  locationText?: string;
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function PostCard({ post, locationText, onDelete }: PostCardProps) {
  const navigate = useNavigate();
  const status = normalizePostStatus(post);
  const [imgError, setImgError] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const posterUrl = post.picture ? formatBase64ToDataURL(post.picture) : "";

  const formatDate = (d?: string) => {
    if (!d) return "ไม่ระบุวันที่";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
  };

  const canDelete = status === "pending" || status === "rejected"; 

  return (
    <>
      <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 hover:border-slate-300">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-white from-slate-100 to-slate-200">
          {posterUrl && !imgError ? (
            <img
              src={posterUrl}
              alt={post.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Users className="size-16 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">ไม่มีรูปภาพ</p>
              </div>
            </div>
          )}

          {/* Status Badge Overlay */}
          <div className="absolute top-3 left-3">
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
            {post.title}
          </h3>

          {post.detail && (
            <p className="text-sm text-slate-600 line-clamp-2 mb-3">{post.detail}</p>
          )}

          {/* Date */}
          {(post.start_date || post.stop_date) && (
            <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
              <Calendar className="size-3.5 text-slate-400 flex-shrink-0" />
              <span className="line-clamp-1">
                {formatDate(post.start_date)}
                {post.stop_date && ` - ${formatDate(post.stop_date)}`}
              </span>
            </div>
          )}

          {/* Location */}
          {locationText && (
            <div className="flex items-center gap-2 text-xs text-slate-600 mb-4">
              <MapPin className="size-3.5 text-slate-400 flex-shrink-0" />
              <span className="line-clamp-1">{locationText}</span>
            </div>
          )}

          {/* Status Message for Rejected - แสดง comment */}
          {status === "rejected" && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="size-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-red-900 mb-1">ไม่ผ่านการอนุมัติ</p>
                  {post.comment && post.comment.trim() !== "" ? (
                    <p className="text-xs text-red-700 mb-1">
                      <span className="font-medium">เหตุผล:</span> {post.comment}
                    </p>
                  ) : (
                    <p className="text-xs text-red-700 mb-1">ไม่มีเหตุผลที่ระบุ</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-blue-100 pt-4 mt-4">
            {/* Action Buttons */}
            <div className="flex gap-2">
              {/* ปุ่มดูรายละเอียด - มีเสมอ */}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>navigate(`/student/activity/edit_activity/${post.ID}`)}
                className="flex-1 text-slate-600 hover:text-slate-700 hover:bg-slate-50 border-slate-200"
              >
                <Eye className="size-4 mr-1.5" />
                ดูรายละเอียดและแก้ไข
              </Button>

              {/* ปุ่มลบ - แสดงเฉพาะ Pending หรือ Rejected */}
              {canDelete && onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบโพสต์</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์ "{post.title}" การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteDialog(false);
                onDelete?.();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              ลบโพสต์
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface FilterTabsProps {
  activeFilter: PostStatusKey | "all";
  onFilterChange: (filter: PostStatusKey | "all") => void;
  counts: Record<PostStatusKey | "all", number>;
}

function FilterTabs({ activeFilter, onFilterChange, counts }: FilterTabsProps) {
  const tabs: { key: PostStatusKey | "all"; label: string; color: string }[] = [
    { key: "all", label: "ทั้งหมด", color: "text-slate-700" },
    { key: "pending", label: "รออนุมัติ", color: "text-amber-700" },
    { key: "approved", label: "อนุมัติแล้ว", color: "text-green-700" },
    { key: "rejected", label: "ไม่อนุมัติ", color: "text-red-700" },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onFilterChange(tab.key)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            activeFilter === tab.key
              ? "bg-slate-100 text-slate-700 shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          {tab.label}
          <span className="ml-2 px-2 py-0.5 rounded-full bg-white text-xs">
            {counts[tab.key] || 0}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function StatusActivityPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [locations, setLocations] = React.useState<LocationInterface[]>([]);
  const [activeFilter, setActiveFilter] = React.useState<PostStatusKey | "all">("all");

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [postsRes, locationsRes] = await Promise.all([
          GetPost(),
          getLocations(),
        ]);

        if (postsRes?.status === 200) {
          const data = Array.isArray(postsRes.data?.data) ? postsRes.data.data : [];
          setPosts(data);
        }

        if (Array.isArray(locationsRes)) {
          setLocations(locationsRes);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPosts = React.useMemo(() => {
    if (activeFilter === "all") return posts;
    return posts.filter((p) => normalizePostStatus(p) === activeFilter);
  }, [posts, activeFilter]);

  const counts: Record<PostStatusKey | "all", number> = React.useMemo(() => {
    const c: Record<PostStatusKey | "all", number> = {
      all: posts.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      upcoming: 0,
      active: 0,
      ended: 0,
      unknown: 0,
    };

    posts.forEach((p) => {
      const s = normalizePostStatus(p);
      c[s] = (c[s] || 0) + 1;
    });

    return c;
  }, [posts]);

  const getLocationText = (locationId?: number) => {
    if (!locationId) return undefined;
    const loc = locations.find((l) => l.ID === locationId);
    if (!loc) return undefined;
    const parts = [];
    if (loc.building) parts.push(loc.building);
    if (loc.location_detail) parts.push(loc.location_detail);
    return parts.join(" - ") || undefined;
  };

  const handleDelete = async (postId: number) => {
    try {
      const res = await DeletePost(postId);
      if (res?.status === 200) {
        setPosts((prev) => prev.filter((p) => p.ID !== postId));
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white from-slate-50 via-slate-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/student/events")}
              >
                <ArrowLeft className="size-5" />
              </Button>
              <h1 className="text-xl font-bold">สถานะกิจกรรมของฉัน</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <FilterTabs
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={counts}
          />
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <Users className="size-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600">ไม่มีโพสต์ในหมวดนี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.ID}
                post={post}
                locationText={getLocationText(post.location_id)}
                onView={() => navigate(`/student/activity/edit_activity/${post.ID}`)}
                onDelete={() => handleDelete(post.ID)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}