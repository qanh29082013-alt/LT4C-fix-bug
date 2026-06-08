import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, UserPlus, Server, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassBackground } from "@/components/glass";
import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");

type FormMode = "login" | "register";

interface FormError {
  field?: string;
  message: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [mode, setMode] = useState<FormMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<FormError | null>(null);
  const [success, setSuccess] = useState("");

  const resetForm = useCallback(() => {
    setError(null);
    setSuccess("");
  }, []);

  const switchMode = useCallback((newMode: FormMode) => {
    setMode(newMode);
    resetForm();
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setEmail("");
    setDisplayName("");
  }, [resetForm]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    resetForm();

    if (!username.trim()) {
      setError({ field: "username", message: "Vui lòng nhập tên đăng nhập." });
      return;
    }
    if (username.trim().length < 3) {
      setError({ field: "username", message: "Tên đăng nhập phải có ít nhất 3 ký tự." });
      return;
    }
    if (!password) {
      setError({ field: "password", message: "Vui lòng nhập mật khẩu." });
      return;
    }
    if (password.length < 6) {
      setError({ field: "password", message: "Mật khẩu phải có ít nhất 6 ký tự." });
      return;
    }

    if (mode === "register") {
      if (password !== confirmPassword) {
        setError({ field: "confirmPassword", message: "Mật khẩu xác nhận không khớp." });
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = mode === "register" ? "/auth/register" : "/auth/login";
      const body: Record<string, string> = { username: username.trim(), password };
      if (mode === "register") {
        if (email.trim()) body.email = email.trim();
        if (displayName.trim()) body.display_name = displayName.trim();
      }

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const detail = (data as { detail?: string }).detail || "Đã xảy ra lỗi. Vui lòng thử lại.";
        setError({ message: detail });
        return;
      }

      if (mode === "register") {
        setSuccess("Đăng ký thành công! Đang chuyển hướng...");
      }

      // Refresh auth context then navigate
      refresh();
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 500);
    } catch {
      setError({ message: "Không thể kết nối tới server. Vui lòng kiểm tra lại." });
    } finally {
      setLoading(false);
    }
  }, [username, password, confirmPassword, email, displayName, mode, navigate, refresh, resetForm]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <GlassBackground className="pointer-events-none opacity-70" />

      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-[100px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/10 blur-[80px]" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* Back to landing */}
        <div className="absolute left-6 top-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Trang chủ
          </Button>
        </div>

        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground shadow-lg shadow-primary/25">
            <Server className="h-6 w-6" />
          </span>
          <span className="text-2xl font-bold gradient-text">LifeTech4Code</span>
        </div>

        {/* Card */}
        <div className="w-full max-w-md">
          <div className="glass-surface rounded-3xl border border-white/10 p-8 shadow-2xl shadow-black/20 backdrop-blur-2xl">
            {/* Tabs */}
            <div className="mb-8 flex rounded-2xl bg-white/5 p-1.5">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                  mode === "login"
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LogIn className="h-4 w-4" />
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                  mode === "register"
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserPlus className="h-4 w-4" />
                Đăng ký
              </button>
            </div>

            {/* Title */}
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold">
                {mode === "login" ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "login"
                  ? "Đăng nhập để truy cập bảng điều khiển của bạn"
                  : "Điền thông tin để bắt đầu sử dụng dịch vụ"}
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-fade-in">
                {error.message}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400 animate-fade-in">
                {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <label htmlFor="login-username" className="text-sm font-medium text-muted-foreground">
                  Tên đăng nhập
                </label>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập..."
                  autoComplete="username"
                  className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-foreground outline-none backdrop-blur-sm transition-all duration-300 placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/50 ${
                    error?.field === "username" ? "border-red-500/50" : "border-white/10 hover:border-white/20"
                  }`}
                />
              </div>

              {/* Email - only in register mode */}
              {mode === "register" && (
                <div className="space-y-2 animate-fade-in">
                  <label htmlFor="login-email" className="text-sm font-medium text-muted-foreground">
                    Email <span className="text-muted-foreground/50">(tùy chọn)</span>
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground outline-none backdrop-blur-sm transition-all duration-300 placeholder:text-muted-foreground/50 hover:border-white/20 focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              )}

              {/* Display name - only in register mode */}
              {mode === "register" && (
                <div className="space-y-2 animate-fade-in">
                  <label htmlFor="login-display-name" className="text-sm font-medium text-muted-foreground">
                    Tên hiển thị <span className="text-muted-foreground/50">(tùy chọn)</span>
                  </label>
                  <input
                    id="login-display-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Tên hiển thị của bạn..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground outline-none backdrop-blur-sm transition-all duration-300 placeholder:text-muted-foreground/50 hover:border-white/20 focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              )}

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="login-password" className="text-sm font-medium text-muted-foreground">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    autoComplete={mode === "register" ? "new-password" : "current-password"}
                    className={`w-full rounded-xl border bg-white/5 px-4 py-3 pr-12 text-sm text-foreground outline-none backdrop-blur-sm transition-all duration-300 placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/50 ${
                      error?.field === "password" ? "border-red-500/50" : "border-white/10 hover:border-white/20"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm password - only in register mode */}
              {mode === "register" && (
                <div className="space-y-2 animate-fade-in">
                  <label htmlFor="login-confirm-password" className="text-sm font-medium text-muted-foreground">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    id="login-confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu..."
                    autoComplete="new-password"
                    className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-foreground outline-none backdrop-blur-sm transition-all duration-300 placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/50 ${
                      error?.field === "confirmPassword" ? "border-red-500/50" : "border-white/10 hover:border-white/20"
                    }`}
                  />
                </div>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-primary via-accent to-secondary py-3 text-sm font-semibold shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:brightness-110 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </span>
                ) : mode === "login" ? (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Đăng nhập
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Đăng ký tài khoản
                  </span>
                )}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Hoặc tiếp tục với</span>
                </div>
              </div>

              {/* Google Login Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.href = `${API_BASE_URL}/auth/google/login`}
                className="w-full rounded-xl border-white/10 bg-white/5 py-3 text-sm font-semibold transition-all duration-300 hover:bg-white/10 hover:border-white/20"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Tiếp tục với Google
                </div>
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground/60">
                {mode === "login" ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
                <button
                  type="button"
                  onClick={() => switchMode(mode === "login" ? "register" : "login")}
                  className="font-semibold text-primary transition-colors hover:text-accent"
                >
                  {mode === "login" ? "Đăng ký ngay" : "Đăng nhập"}
                </button>
              </p>
            </div>
          </div>

          {/* Bottom info */}
          <p className="mt-6 text-center text-xs text-muted-foreground/40">
            © {new Date().getFullYear()} LifeTech4Code. Mọi quyền được bảo lưu.
          </p>
        </div>
      </div>
    </div>
  );
}
