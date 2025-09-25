"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Heart, Eye, EyeOff, Mail, Lock, User, Play, Calendar, Stethoscope, Shield, Activity } from "lucide-react"
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
    gender: "",
    contactNumber: "",
    address: "",
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
      if (!formData.gender) {
        newErrors.gender = "Giới tính là bắt buộc"
      }
      if (!formData.contactNumber) {
        newErrors.contactNumber = "Số điện thoại là bắt buộc"
      }
      if (!formData.address) {
        newErrors.address = "Địa chỉ là bắt buộc"
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
          // First, check if it's a demo account
          const demoAccount = demoAccounts.find(
            (acc) => acc.email === formData.email && acc.password === formData.password,
          )

          if (demoAccount) {
            console.log("Using demo account:", demoAccount.role)
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
            // Not a demo account, try real API authentication
            try {
              const response = await apiClient.login(formData.email, formData.password)
              console.log("Login API response:", response)

              // Clear any old demo data first
              localStorage.removeItem("user_info")
              localStorage.removeItem("user_role")

              await login(response.token)
              
              // The login function in auth-context now handles automatic redirection
              // based on user role, so we don't need manual redirect here
            } catch (apiError) {
              console.error("API authentication failed:", apiError)
              setErrors({ email: "Tài khoản không tồn tại hoặc mật khẩu không đúng." })
            }
          }
        } else {
          // Registration
          try {
            const response = await apiClient.registerPatient(
              formData.firstName, // first_name
              formData.lastName, // last_name
              formData.email,
              formData.password,
              formData.dateOfBirth,
              formData.gender,
              formData.contactNumber,
              formData.address,
            )

            await login(response.token)
            // Auto-redirect handled by login function based on user role
          } catch (error) {
            console.error("Registration error:", error)
            setErrors({ email: "Đăng ký thất bại, vui lòng thử lại." })
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
      // Create a proper demo token structure
      const demoUserData = {
        id: account.user_id,
        user_id: account.user_id,
        email: account.email,
        role: account.role.toLowerCase(),
        roles: [account.role.toLowerCase()],
        permissions: [],
        type: account.role === "Patient" ? "patient" : "staff",
        patient_id: account.role === "Patient" ? 1 : null,
        staff_id: account.role !== "Patient" ? 1 : null,
        profile: {
          first_name: account.firstName,
          last_name: account.lastName,
          position: account.role,
          staff_role: account.role !== "Patient" ? account.role : null,
        },
      }

      // Store demo token and user data
      const demoToken = `demo_${account.user_id}_${Date.now()}`
      localStorage.setItem("auth_token", demoToken)
      localStorage.setItem("user_role", account.role.toLowerCase())
      localStorage.setItem("user_info", JSON.stringify(demoUserData))

      // Set demo user directly without API call
      await login(demoToken)
      
      // The login function in auth-context now handles automatic redirection
      // based on user role, so we don't need manual redirect here
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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Bệnh viện MediCare Plus</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/#services" className="text-muted-foreground hover:text-foreground transition-colors">
              Dịch vụ
            </a>
            <a href="/#doctors" className="text-muted-foreground hover:text-foreground transition-colors">
              Bác sĩ
            </a>
            <a href="/#news" className="text-muted-foreground hover:text-foreground transition-colors">
              Tin tức
            </a>
            <a href="/#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
              Đánh giá
            </a>
            <a href="/#contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Liên hệ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <a href="/">Trang chủ</a>
            </Button>
            <Button>Đặt lịch khám</Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-700 to-teal-800">
            {/* Medical themed background image */}
            <img
              src="/modern-hospital-interior-with-medical-equipment--c.jpg"
              alt="Modern Hospital Interior"
              className="w-full h-full object-cover opacity-30"
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 via-transparent to-transparent" />

            {/* Floating medical elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white space-y-8 px-12">
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto shadow-2xl border border-white/30">
                    <Heart className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold drop-shadow-lg">MediCare Plus</h1>
                    <p className="text-xl text-white/90 drop-shadow">Hệ thống quản lý bệnh viện</p>
                  </div>
                </div>

                <div className="space-y-6 max-w-md">
                  <h2 className="text-3xl font-bold drop-shadow-lg">Chăm sóc sức khỏe hiện đại</h2>
                  <p className="text-lg text-white/90 drop-shadow leading-relaxed">
                    Hệ thống quản lý bệnh viện toàn diện với công nghệ tiên tiến, mang đến trải nghiệm chăm sóc sức khỏe
                    tốt nhất cho bệnh nhân và đội ngũ y tế.
                  </p>

                  <div className="grid grid-cols-3 gap-6 mt-12">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/30">
                        <Stethoscope className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-sm text-white/90">Khám bệnh</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/30">
                        <Activity className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-sm text-white/90">Theo dõi</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/30">
                        <Shield className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-sm text-white/90">Bảo mật</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-20 left-20 opacity-10">
              <div className="w-32 h-32 bg-white/20 rounded-3xl rotate-12 backdrop-blur-sm" />
            </div>
            <div className="absolute bottom-32 right-32 opacity-15">
              <div className="w-40 h-40 bg-white/15 rounded-full backdrop-blur-sm" />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile header for small screens */}
            <div className="text-center lg:hidden mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <span className="text-2xl font-bold text-primary">MediCare Plus</span>
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {isLogin ? "Chào mừng trở lại" : "Tạo tài khoản"}
              </h1>
              <p className="text-muted-foreground">
                {isLogin ? "Đăng nhập để truy cập hệ thống" : "Tham gia hệ thống chăm sóc sức khỏe"}
              </p>
            </div>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="space-y-1 pb-6">
                <div className="flex w-full bg-muted/50 rounded-xl p-1">
                  <Button
                    variant={isLogin ? "default" : "ghost"}
                    className="flex-1 rounded-lg font-semibold transition-all duration-200"
                    onClick={() => setIsLogin(true)}
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    variant={!isLogin ? "default" : "ghost"}
                    className="flex-1 rounded-lg font-semibold transition-all duration-200"
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
                            className={cn(
                              "pl-10",
                              errors.firstName && "border-destructive focus-visible:ring-destructive",
                            )}
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
                            className={cn(
                              "pl-10",
                              errors.lastName && "border-destructive focus-visible:ring-destructive",
                            )}
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
                            className={cn(
                              "pl-10",
                              errors.dateOfBirth && "border-destructive focus-visible:ring-destructive",
                            )}
                            value={formData.dateOfBirth}
                            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                          />
                        </div>
                        {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Giới tính</Label>
                        <select
                          id="gender"
                          className={cn(
                            "w-full px-3 py-2 border border-input rounded-md bg-background text-sm",
                            errors.gender && "border-destructive",
                          )}
                          value={formData.gender}
                          onChange={(e) => handleInputChange("gender", e.target.value)}
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </select>
                        {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactNumber">Số điện thoại</Label>
                        <Input
                          id="contactNumber"
                          type="tel"
                          placeholder="0123456789"
                          className={cn(errors.contactNumber && "border-destructive focus-visible:ring-destructive")}
                          value={formData.contactNumber}
                          onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                        />
                        {errors.contactNumber && <p className="text-sm text-destructive">{errors.contactNumber}</p>}
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="address">Địa chỉ</Label>
                        <Input
                          id="address"
                          placeholder="Nhập địa chỉ của bạn"
                          className={cn(errors.address && "border-destructive focus-visible:ring-destructive")}
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                        />
                        {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Địa chỉ Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="bacsi@medicareplus.vn"
                        className={cn(
                          "pl-10 h-12 rounded-xl",
                          errors.email && "border-destructive focus-visible:ring-destructive",
                        )}
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Mật khẩu
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu của bạn"
                        className={cn(
                          "pl-10 pr-10 h-12 rounded-xl",
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
                      <Button variant="link" className="px-0 text-sm text-primary hover:text-primary/80">
                        Quên mật khẩu?
                      </Button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full font-semibold h-12 rounded-xl text-base"
                    size="lg"
                    disabled={isLoading}
                  >
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
                        <span className="bg-card px-3 text-muted-foreground font-medium">Tài khoản demo</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground text-center font-medium">
                        Chọn vai trò để trải nghiệm hệ thống:
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {demoAccounts.map((account) => (
                          <Button
                            key={account.role}
                            variant="outline"
                            size="sm"
                            className="justify-start text-xs bg-transparent hover:bg-primary/10 font-medium h-10 rounded-xl border-2"
                            onClick={() => handleDemoLogin(account)}
                          >
                            <Play className="w-3 h-3 mr-2" />
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

                {isLogin && (
                  <p className="text-center text-sm text-muted-foreground">
                    Chưa có tài khoản?{" "}
                    <Button
                      variant="link"
                      className="px-0 text-primary hover:text-primary/80 font-semibold"
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
                      className="px-0 text-primary hover:text-primary/80 font-semibold"
                      onClick={() => setIsLogin(true)}
                    >
                      Đăng nhập tại đây
                    </Button>
                  </p>
                )}
              </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              Bằng cách tiếp tục, bạn đồng ý với{" "}
              <Button
                variant="link"
                className="px-0 text-xs h-auto text-primary hover:text-primary/80 underline font-medium"
              >
                Điều khoản Dịch vụ
              </Button>{" "}
              và{" "}
              <Button
                variant="link"
                className="px-0 text-xs h-auto text-primary hover:text-primary/80 underline font-medium"
              >
                Chính sách Bảo mật
              </Button>
            </p>
          </div>
        </div>
      </div>

      <footer className="bg-muted/50 border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">Bệnh viện MediCare Plus</span>
            </div>
            <p className="text-muted-foreground text-center md:text-right">
              © 2025 Bệnh viện MediCare Plus. Tất cả quyền được bảo lưu. | Nhà cung cấp Dịch vụ Y tế được Cấp phép
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
