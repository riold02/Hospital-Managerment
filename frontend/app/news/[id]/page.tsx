"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, User, ArrowLeft, Share2, Bookmark } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface NewsArticle {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  author: string
  published_date: string
  image_url?: string
  status: "published" | "draft"
  created_at: string
}

export default function NewsArticlePage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([])

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockArticles: NewsArticle[] = [
      {
        id: "1",
        title: "Kỹ thuật phẫu thuật tim mới tại MediCare Plus",
        excerpt:
          "Bệnh viện đã áp dụng thành công kỹ thuật phẫu thuật tim ít xâm lấn, giúp bệnh nhân hồi phục nhanh chóng và giảm thiểu biến chứng.",
        content: `
          <h2>Đột phá trong phẫu thuật tim</h2>
          <p>Bệnh viện MediCare Plus vừa áp dụng thành công kỹ thuật phẫu thuật tim ít xâm lấn mới nhất, mang lại nhiều lợi ích vượt trội cho bệnh nhân.</p>
          
          <h3>Ưu điểm của kỹ thuật mới</h3>
          <ul>
            <li>Giảm thời gian phẫu thuật xuống còn 2-3 giờ</li>
            <li>Vết mổ nhỏ, ít đau đớn sau phẫu thuật</li>
            <li>Thời gian hồi phục nhanh chóng, chỉ 3-5 ngày</li>
            <li>Giảm nguy cơ nhiễm trùng và biến chứng</li>
          </ul>
          
          <p>Theo BS. Nguyễn Thị Hoa, Trưởng khoa Tim mạch, kỹ thuật này đã được áp dụng thành công cho hơn 50 ca phẫu thuật với tỷ lệ thành công 98%.</p>
          
          <h3>Quy trình phẫu thuật</h3>
          <p>Quy trình phẫu thuật được thực hiện với sự hỗ trợ của robot phẫu thuật hiện đại, cho phép bác sĩ thực hiện các thao tác chính xác đến từng milimét.</p>
          
          <p>Bệnh nhân có thể đăng ký tư vấn và khám sàng lọc tại khoa Tim mạch từ thứ 2 đến thứ 6 hàng tuần.</p>
        `,
        category: "Công nghệ Y tế",
        author: "BS. Nguyễn Thị Hoa",
        published_date: "2024-12-15",
        image_url: "/modern-cardiac-surgery-equipment.png",
        status: "published",
        created_at: "2024-12-15T08:00:00Z",
      },
      {
        id: "2",
        title: "Chương trình khám sức khỏe miễn phí cho người cao tuổi",
        excerpt:
          "Trong tháng 12, bệnh viện tổ chức chương trình khám sức khỏe miễn phí dành cho người cao tuổi trên 65 tuổi.",
        content: `
          <h2>Chương trình khám sức khỏe miễn phí</h2>
          <p>Nhằm chăm sóc sức khỏe cộng đồng, bệnh viện MediCare Plus tổ chức chương trình khám sức khỏe miễn phí cho người cao tuổi.</p>
          
          <h3>Đối tượng tham gia</h3>
          <ul>
            <li>Người cao tuổi từ 65 tuổi trở lên</li>
            <li>Có thẻ BHYT hoặc thẻ căn cước công dân</li>
            <li>Đăng ký trước qua hotline hoặc trực tiếp tại bệnh viện</li>
          </ul>
          
          <h3>Các dịch vụ khám miễn phí</h3>
          <ul>
            <li>Khám tổng quát</li>
            <li>Đo huyết áp, đường huyết</li>
            <li>Siêu âm tim, bụng</li>
            <li>Xét nghiệm máu cơ bản</li>
            <li>Tư vấn dinh dưỡng</li>
          </ul>
          
          <p>Chương trình diễn ra từ ngày 1-31/12/2024, từ 8:00-16:00 các ngày trong tuần.</p>
        `,
        category: "Chương trình",
        author: "Phòng Truyền thông",
        published_date: "2024-12-12",
        image_url: "/elderly-health-checkup-program.png",
        status: "published",
        created_at: "2024-12-12T10:00:00Z",
      },
      {
        id: "3",
        title: "Hướng dẫn phòng chống cúm mùa đông",
        excerpt: "Các chuyên gia của chúng tôi chia sẻ những lời khuyên quan trọng để phòng chống cúm trong mùa đông.",
        content: `
          <h2>Phòng chống cúm mùa đông hiệu quả</h2>
          <p>Mùa đông là thời điểm cúm dễ bùng phát. Dưới đây là những lời khuyên từ các chuyên gia y tế.</p>
          
          <h3>Các biện pháp phòng ngừa</h3>
          <ul>
            <li>Rửa tay thường xuyên bằng xà phòng</li>
            <li>Đeo khẩu trang khi ra ngoài</li>
            <li>Tránh tiếp xúc với người bệnh</li>
            <li>Tăng cường sức đề kháng</li>
          </ul>
          
          <h3>Chế độ dinh dưỡng</h3>
          <p>Bổ sung vitamin C từ trái cây tươi, uống đủ nước, ăn nhiều rau xanh để tăng cường miễn dịch.</p>
          
          <h3>Khi nào cần đến bệnh viện?</h3>
          <ul>
            <li>Sốt cao trên 38.5°C kéo dài</li>
            <li>Ho, khó thở</li>
            <li>Đau đầu, mệt mỏi kéo dài</li>
          </ul>
          
          <p>Liên hệ hotline 1900-xxxx để được tư vấn miễn phí 24/7.</p>
        `,
        category: "Sức khỏe",
        author: "BS. Trần Minh Tuấn",
        published_date: "2024-12-10",
        image_url: "/winter-flu-prevention-tips.png",
        status: "published",
        created_at: "2024-12-10T14:00:00Z",
      },
    ]

    const currentArticle = mockArticles.find((a) => a.id === params.id)
    if (currentArticle) {
      setArticle(currentArticle)
      // Get related articles (same category, excluding current)
      const related = mockArticles
        .filter((a) => a.category === currentArticle.category && a.id !== currentArticle.id)
        .slice(0, 3)
      setRelatedArticles(related)
    }
    setLoading(false)
  }, [params.id])

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.excerpt,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Đã sao chép",
        description: "Liên kết bài viết đã được sao chép vào clipboard",
      })
    }
  }

  const handleBookmark = () => {
    toast({
      title: "Đã lưu",
      description: "Bài viết đã được thêm vào danh sách yêu thích",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy bài viết</h1>
          <Button onClick={() => router.push("/news")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách tin tức
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Button variant="ghost" onClick={() => router.push("/news")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách tin tức
        </Button>

        <article className="max-w-4xl mx-auto">
          {/* Article header */}
          <header className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="secondary">{article.category}</Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(article.published_date).toLocaleDateString("vi-VN")}
              </div>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">{article.title}</h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-6">{article.excerpt}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="w-4 h-4 mr-1" />
                {article.author}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Chia sẻ
                </Button>
                <Button variant="outline" size="sm" onClick={handleBookmark}>
                  <Bookmark className="w-4 h-4 mr-2" />
                  Lưu
                </Button>
              </div>
            </div>
          </header>

          {/* Featured image */}
          {article.image_url && (
            <div className="mb-8">
              <img
                src={article.image_url || "/placeholder.svg"}
                alt={article.title}
                className="w-full h-64 lg:h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Article content */}
          <div className="prose prose-lg max-w-none mb-12" dangerouslySetInnerHTML={{ __html: article.content }} />

          <Separator className="my-8" />

          {/* Related articles */}
          {relatedArticles.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Bài viết liên quan</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <div
                    key={relatedArticle.id}
                    className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/news/${relatedArticle.id}`)}
                  >
                    <img
                      src={relatedArticle.image_url || "/placeholder.svg?height=150&width=300&query=news"}
                      alt={relatedArticle.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-4">
                      <Badge variant="secondary" className="mb-2">
                        {relatedArticle.category}
                      </Badge>
                      <h3 className="font-semibold line-clamp-2 mb-2">{relatedArticle.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{relatedArticle.excerpt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </div>
  )
}
