"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Heart, Eye, EyeOff, Mail, Lock, User, Play, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { demoAccounts } from "@/lib/demo-accounts"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = "Email là bắt buộc"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Vui lòng nhập địa chỉ email hợp lệ"
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc"
    } else if (formData.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự"
    }

    if (!isLogin) {
      if (!formData.firstName) {
        newErrors.firstName = "Họ là bắt buộc"
      }
      if (!formData.lastName) {
        newErrors.lastName = "Tên là bắt buộc"
      }
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = "Ngày sinh là bắt buộc"
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.dateOfBirth)) {
        newErrors.dateOfBirth = "Ngày sinh phải theo định dạng YYYY-MM-DD"
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Mật khẩu không khớp"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setIsLoading(true)
      try {
        if (isLogin) {
          try {
            const response = await apiClient.login(formData.email, formData.password)
            await login(response.token)
            router.push("/dashboard")
          } catch (apiError) {
            console.log("API authentication failed, trying demo accounts:", apiError)

            const demoAccount = demoAccounts.find(
              (acc) => acc.email === formData.email && acc.password === formData.password,
            )

            if (demoAccount) {
              // Demo: lưu "token" giả để hợp với flow AuthProvider
              await login("demo_token")

              const roleRoutes: Record<string, string> = {
                Admin: "/dashboard/admin",
                Doctor: "/dashboard/doctor",
                Nurse: "/dashboard/nurse",
                Patient: "/dashboard/patient",
                Pharmacist: "/dashboard/pharmacist",
                Technician: "/dashboard/technician",
                "Lab Assistant": "/dashboard/lab",
                Driver: "/dashboard/driver",
                Worker: "/dashboard/worker",
              }

              router.push(roleRoutes[demoAccount.role] || "/dashboard")
            } else {
              setErrors({ email: "Tài khoản không tồn tại hoặc mật khẩu không đúng." })
            }
          }
        } else {
          try {
            const response = await apiClient.post("/auth/register/patient", {
              email: formData.email,
              password: formData.password,
              first_name: formData.firstName,
              last_name: formData.lastName,
              date_of_birth: formData.dateOfBirth,
            })

            const loginResponse = await apiClient.login(formData.email, formData.password)
            await login(loginResponse.token)
            router.push("/dashboard/patient")
          } catch (apiError) {
            setErrors({
              email: "Đăng ký thất bại. Vui lòng thử lại sau.",
            })
          }
        }
      } catch (error) {
        console.error("Authentication failed:", error)
        setErrors({ email: "Đăng nhập thất bại. Vui lòng thử lại." })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleDemoLogin = async (account: (typeof demoAccounts)[0]) => {
    setIsLoading(true)
    try {
      const demoToken = JSON.stringify({
        user_id: account.user_id,
        role: account.role,
        email: account.email,
        firstName: account.firstName,
        lastName: account.lastName,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      })

      login(demoToken)

      const roleRoutes: Record<string, string> = {
        Admin: "/dashboard/admin",
        Doctor: "/dashboard/doctor",
        Nurse: "/dashboard/nurse",
        Patient: "/dashboard/patient",
        Pharmacist: "/dashboard/pharmacist",
        Technician: "/dashboard/technician",
        "Lab Assistant": "/dashboard/lab",
        Driver: "/dashboard/driver",
        Worker: "/dashboard/worker",
      }

      router.push(roleRoutes[account.role] || "/dashboard")
    } catch (error) {
      console.error("Demo login failed:", error)
      setErrors({ email: "Đăng nhập demo thất bại. Vui lòng thử lại." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Bệnh viện MediCare Plus</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{isLogin ? "Chào mừng trở lại" : "Tạo tài khoản"}</h1>
          <p className="text-muted-foreground">
            {isLogin
              ? "Đăng nhập để truy cập bảng điều khiển y tế của bạn"
              : "Tham gia hệ thống quản lý y tế của chúng tôi"}
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex w-full">
              <Button
                variant={isLogin ? "default" : "ghost"}
                className="flex-1 rounded-r-none"
                onClick={() => setIsLogin(true)}
              >
                Đăng nhập
              </Button>
              <Button
                variant={!isLogin ? "default" : "ghost"}
                className="flex-1 rounded-l-none"
                onClick={() => setIsLogin(false)}
              >
                Đăng ký
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Họ</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        placeholder="Nguyễn"
                        className={cn("pl-10", errors.firstName && "border-destructive focus-visible:ring-destructive")}
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                      />
                    </div>
                    {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Tên</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="lastName"
                        placeholder="Văn An"
                        className={cn("pl-10", errors.lastName && "border-destructive focus-visible:ring-destructive")}
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                      />
                    </div>
                    {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        placeholder="YYYY-MM-DD"
                        className={cn("pl-10", errors.dateOfBirth && "border-destructive focus-visible:ring-destructive")}
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      />
                    </div>
                    {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth}</p>}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Địa chỉ Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="bacsi@medicareplus.vn"
                    className={cn("pl-10", errors.email && "border-destructive focus-visible:ring-destructive")}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu của bạn"
                    className={cn(
                      "pl-10 pr-10",
                      errors.password && "border-destructive focus-visible:ring-destructive",
                    )}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Xác nhận mật khẩu của bạn"
                      className={cn(
                        "pl-10",
                        errors.confirmPassword && "border-destructive focus-visible:ring-destructive",
                      )}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground">
                      Ghi nhớ tôi
                    </Label>
                  </div>
                  <Button variant="link" className="px-0 text-sm text-accent hover:text-accent/80">
                    Quên mật khẩu?
                  </Button>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Tạo tài khoản"}
              </Button>
            </form>

            {isLogin && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Tài khoản demo</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">Chọn vai trò để trải nghiệm hệ thống:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {demoAccounts.map((account) => (
                      <Button
                        key={account.role}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs bg-transparent"
                        onClick={() => handleDemoLogin(account)}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        {account.role === "Admin" && "Quản trị viên"}
                        {account.role === "Doctor" && "Bác sĩ"}
                        {account.role === "Nurse" && "Y tá"}
                        {account.role === "Patient" && "Bệnh nhân"}
                        {account.role === "Pharmacist" && "Dược sĩ"}
                        {account.role === "Technician" && "Kỹ thuật viên"}
                        {account.role === "Lab Assistant" && "Xét nghiệm"}
                        {account.role === "Driver" && "Tài xế"}
                        {account.role === "Worker" && "Nhân viên"}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Hoặc tiếp tục với</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full bg-transparent">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <svg className="mr-2 h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
            </div>

            {isLogin && (
              <p className="text-center text-sm text-muted-foreground">
                Chưa có tài khoản?{" "}
                <Button
                  variant="link"
                  className="px-0 text-accent hover:text-accent/80"
                  onClick={() => setIsLogin(false)}
                >
                  Đăng ký tại đây
                </Button>
              </p>
            )}

            {!isLogin && (
              <p className="text-center text-sm text-muted-foreground">
                Đã có tài khoản?{" "}
                <Button
                  variant="link"
                  className="px-0 text-accent hover:text-accent/80"
                  onClick={() => setIsLogin(true)}
                >
                  Đăng nhập tại đây
                </Button>
              </p>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Bằng cách tiếp tục, bạn đồng ý với{" "}
          <Button variant="link" className="px-0 text-xs h-auto text-accent hover:text-accent/80">
            Điều khoản Dịch vụ
          </Button>{" "}
          và{" "}
          <Button variant="link" className="px-0 text-xs h-auto text-accent hover:text-accent/80">
            Chính sách Bảo mật
          </Button>
        </p>
      </div>
    </div>
  )
}
