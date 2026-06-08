import { useNavigate } from "react-router-dom";
import {
  Users,
  Shield,
  Megaphone,
  TrendingUp,
  Settings,
  Zap,
  Package,
  Gift,
  Activity,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const adminFeatures = [
  {
    title: "Người dùng",
    description: "Quản lý thành viên, thực hiện ban/unban, thay đổi số dư xu.",
    icon: Users,
    url: "/admin/users",
    color: "text-blue-500",
  },
  {
    title: "Giftcode",
    description: "Tạo và quản lý các mã quà tặng nạp xu cho người dùng.",
    icon: Gift,
    url: "/admin/giftcodes",
    color: "text-purple-500",
  },
  {
    title: "Thông báo",
    description: "Đăng tin tức mới, blog và thông báo quan trọng lên hệ thống.",
    icon: Megaphone,
    url: "/admin/announcements",
    color: "text-orange-500",
  },
  {
    title: "Sản phẩm VPS",
    description: "Cấu hình giá cả và các gói máy ảo Cloud Gaming.",
    icon: Package,
    url: "/admin/vps-products",
    color: "text-green-500",
  },
  {
    title: "Quản lý Workers",
    description: "Theo dõi tình trạng các máy chủ xử lý (Worker nodes).",
    icon: Zap,
    url: "/admin/workers",
    color: "text-yellow-500",
  },
  {
    title: "Vai trò & Quyền",
    description: "Phân quyền quản trị và các nhóm người dùng đặc biệt.",
    icon: Shield,
    url: "/admin/roles",
    color: "text-indigo-500",
  },
  {
    title: "Phân tích & Thống kê",
    description: "Xem biểu đồ tăng trưởng và hiệu suất hệ thống.",
    icon: TrendingUp,
    url: "/admin/analytics",
    color: "text-cyan-500",
  },
  {
    title: "Logs hệ thống",
    description: "Kiểm tra lịch sử thao tác và nhật ký lỗi server.",
    icon: Activity,
    url: "/admin/logs",
    color: "text-rose-500",
  },
  {
    title: "Cài đặt chung",
    description: "Cấu hình các tham số hệ thống, API và giao diện.",
    icon: Settings,
    url: "/admin/settings",
    color: "text-slate-500",
  },
];

export default function AdminHub() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-primary/10">
            <ShieldAlert className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Trung tâm Quản trị</h1>
        </div>
        <p className="text-muted-foreground">
          Cổng quản lý tập trung cho toàn bộ hệ thống LifeTech4Code.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminFeatures.map((feature) => (
          <Card 
            key={feature.title} 
            className="glass-card hover-lift cursor-pointer border-border/40 group overflow-hidden"
            onClick={() => navigate(feature.url)}
          >
            <CardHeader className="relative z-10">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-2xl bg-background/50 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <CardTitle className="mt-4">{feature.title}</CardTitle>
              <CardDescription className="line-clamp-2 mt-2">
                {feature.description}
              </CardDescription>
            </CardHeader>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
              <feature.icon className="w-32 h-32 rotate-12" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
