import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import PatientAppointmentBooking from "@/components/shared/PatientAppointmentBooking"
import {
  Heart,
  Shield,
  Users,
  Clock,
  Star,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  Activity,
  UserCheck,
  Calendar,
  ArrowRight,
} from "lucide-react"

export default function HospitalLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Bệnh viện MediCare Plus</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">
              Dịch vụ
            </a>
            <a href="#doctors" className="text-muted-foreground hover:text-foreground transition-colors">
              Bác sĩ
            </a>
            <a href="#news" className="text-muted-foreground hover:text-foreground transition-colors">
              Tin tức
            </a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
              Đánh giá
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Liên hệ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <a href="/auth">Đăng nhập</a>
            </Button>
            <Button>Đặt lịch khám</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              <Shield className="w-4 h-4 mr-2" />
              Dịch vụ Y tế Tin cậy từ năm 1985
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Sức khỏe của bạn, <span className="text-primary">Ưu tiên</span> của chúng tôi
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Trải nghiệm dịch vụ y tế đẳng cấp thế giới với đội ngũ chuyên gia tận tâm. Từ khám sức khỏe định kỳ đến
              điều trị chuyên khoa, chúng tôi luôn sẵn sàng phục vụ bạn 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                Đặt lịch khám
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                Cấp cứu
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Appointment Booking Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Đặt lịch hẹn nhanh chóng</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Đặt lịch khám với bác sĩ chuyên khoa chỉ trong vài phút. Chúng tôi sẽ xác nhận lịch hẹn của bạn sớm nhất.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Quick Stats */}
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-blue-600">24/7</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Dịch vụ cấp cứu</p>
              </CardContent>
            </Card>

            {/* Appointment Booking Card */}
            <div className="md:col-span-1">
              <PatientAppointmentBooking 
                className="h-full"
              />
            </div>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-green-600">50+</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Bác sĩ chuyên khoa</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Dịch vụ Y tế của chúng tôi</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Dịch vụ chăm sóc sức khỏe toàn diện được cung cấp bởi các chuyên gia giàu kinh nghiệm với công nghệ hiện
              đại nhất.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Heart className="w-8 h-8" />,
                title: "Tim mạch",
                description: "Chăm sóc tim mạch tiên tiến với các phương pháp chẩn đoán và điều trị hiện đại.",
              },
              {
                icon: <Activity className="w-8 h-8" />,
                title: "Cấp cứu",
                description: "Dịch vụ cấp cứu 24/7 với phản ứng nhanh chóng và chăm sóc y tế chuyên nghiệp.",
              },
              {
                icon: <UserCheck className="w-8 h-8" />,
                title: "Nội tổng quát",
                description: "Chăm sóc sức khỏe ban đầu toàn diện cho bệnh nhân ở mọi lứa tuổi và tình trạng sức khỏe.",
              },
              {
                icon: <Stethoscope className="w-8 h-8" />,
                title: "Nhi khoa",
                description:
                  "Chăm sóc chuyên khoa cho trẻ sơ sinh, trẻ em và thanh thiếu niên trong môi trường thân thiện.",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Phẫu thuật",
                description: "Các ca phẫu thuật tiên tiến được thực hiện bởi các bác sĩ phẫu thuật có tay nghề cao.",
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Y học gia đình",
                description: "Chăm sóc sức khỏe toàn diện cho cả gia đình tại một địa điểm.",
              },
            ].map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                    {service.icon}
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">{service.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Doctor Highlights */}
      <section id="doctors" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Gặp gỡ các Bác sĩ Chuyên gia</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Đội ngũ bác sĩ được chứng nhận với nhiều thập kỷ kinh nghiệm và sự chăm sóc đầy lòng trắc ẩn.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "BS. Nguyễn Thị Hoa",
                specialty: "Trưởng khoa Tim mạch",
                experience: "15+ năm kinh nghiệm",
                image: "/doctor-female-2.png",
              },
              {
                name: "BS. Trần Minh Tuấn",
                specialty: "Y học Cấp cứu",
                experience: "12+ năm kinh nghiệm",
                image: "/professional-male-doctor-in-scrubs.png",
              },
              {
                name: "BS. Lê Thị Mai",
                specialty: "Chuyên khoa Nhi",
                experience: "10+ năm kinh nghiệm",
                image: "/friendly-female-pediatrician-with-stethoscope.png",
              },
            ].map((doctor, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                    <img
                      src={doctor.image || "/placeholder.svg"}
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-xl text-primary">{doctor.name}</CardTitle>
                  <CardDescription className="text-base font-medium">{doctor.specialty}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="mb-4">
                    <Clock className="w-4 h-4 mr-1" />
                    {doctor.experience}
                  </Badge>
                  <p className="text-muted-foreground">
                    Tận tâm cung cấp dịch vụ chăm sóc bệnh nhân xuất sắc với sự tập trung vào đổi mới và lòng trắc ẩn.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Tin tức Y tế</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Cập nhật những thông tin mới nhất về y tế, sức khỏe và các hoạt động của bệnh viện.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Kỹ thuật phẫu thuật tim mới tại MediCare Plus",
                excerpt:
                  "Bệnh viện đã áp dụng thành công kỹ thuật phẫu thuật tim ít xâm lấn, giúp bệnh nhân hồi phục nhanh chóng...",
                date: "15/12/2024",
                category: "Công nghệ Y tế",
                image: "/modern-cardiac-surgery-equipment.png",
              },
              {
                title: "Chương trình khám sức khỏe miễn phí cho người cao tuổi",
                excerpt:
                  "Trong tháng 12, bệnh viện tổ chức chương trình khám sức khỏe miễn phí dành cho người cao tuổi trên 65 tuổi...",
                date: "12/12/2024",
                category: "Chương trình",
                image: "/elderly-health-checkup-program.png",
              },
              {
                title: "Hướng dẫn phòng chống cúm mùa đông",
                excerpt:
                  "Các chuyên gia của chúng tôi chia sẻ những lời khuyên quan trọng để phòng chống cúm trong mùa đông...",
                date: "10/12/2024",
                category: "Sức khỏe",
                image: "/winter-flu-prevention-tips.png",
              },
            ].map((article, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow group cursor-pointer">
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={article.image || "/placeholder.svg"}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{article.category}</Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-1" />
                      {article.date}
                    </div>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed mb-4">{article.excerpt}</p>
                  <Button variant="ghost" className="p-0 h-auto font-semibold group-hover:text-primary">
                    Đọc thêm
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <a href="/news">Xem tất cả tin tức</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Bệnh nhân nói gì về chúng tôi</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Những câu chuyện thực tế từ các bệnh nhân đã trải nghiệm dịch vụ chăm sóc đặc biệt của chúng tôi.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Chị Nguyễn Thị Lan",
                rating: 5,
                comment:
                  "Đội ngũ nhân viên tại Bệnh viện MediCare Plus đã vượt xa mong đợi trong quá trình điều trị cho tôi. Chuyên nghiệp, chu đáo và dịch vụ thực sự xuất sắc.",
              },
              {
                name: "Anh Trần Văn Nam",
                rating: 5,
                comment:
                  "Bác sĩ Hoa đã cứu sống tôi với chuyên môn tim mạch của bà ấy. Tôi mãi mãi biết ơn sự chăm sóc tuyệt vời mà tôi đã nhận được.",
              },
              {
                name: "Chị Phạm Thị Hương",
                rating: 5,
                comment:
                  "Là một người mẹ, tôi đánh giá cao sự nhẹ nhàng và kiên nhẫn của Bác sĩ Mai với các con tôi. Rất khuyến khích bệnh viện này.",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">"{testimonial.comment}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Liên hệ với chúng tôi</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sẵn sàng đặt lịch hẹn hoặc có câu hỏi? Chúng tôi luôn sẵn sàng hỗ trợ 24/7.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-primary mx-auto mb-4">
                  <Phone className="w-8 h-8" />
                </div>
                <CardTitle>Gọi cho chúng tôi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary mb-2">(028) 123-4567</p>
                <p className="text-muted-foreground">Đường dây cấp cứu 24/7</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-primary mx-auto mb-4">
                  <Mail className="w-8 h-8" />
                </div>
                <CardTitle>Email cho chúng tôi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-primary mb-2">info@medicareplus.vn</p>
                <p className="text-muted-foreground">Chúng tôi sẽ phản hồi trong vòng 24 giờ</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-primary mx-auto mb-4">
                  <MapPin className="w-8 h-8" />
                </div>
                <CardTitle>Đến thăm chúng tôi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold mb-2">123 Đường Y tế</p>
                <p className="text-muted-foreground">Quận Y tế, TP.HCM 70000</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
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
