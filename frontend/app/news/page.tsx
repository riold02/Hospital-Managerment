"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, ArrowRight, User } from "lucide-react"
import { SearchBar } from "@/components/shared/SearchBar"

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

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Mock data for demonstration
  useEffect(() => {
    const mockArticles: NewsArticle[] = [
      {
        id: "1",
        title: "Kỹ thuật phẫu thuật tim mới tại MediCare Plus",
        excerpt:
          "Bệnh viện đã áp dụng thành công kỹ thuật phẫu thuật tim ít xâm lấn, giúp bệnh nhân hồi phục nhanh chóng và giảm thiểu biến chứng.",
        content: "Nội dung chi tiết về kỹ thuật phẫu thuật tim mới...",
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
        content: "Chi tiết về chương trình khám sức khỏe...",
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
        content: "Hướng dẫn chi tiết về phòng chống cúm...",
        category: "Sức khỏe",
        author: "BS. Trần Minh Tuấn",
        published_date: "2024-12-10",
        image_url: "/winter-flu-prevention-tips.png",
        status: "published",
        created_at: "2024-12-10T14:00:00Z",
      },
    ]

    setArticles(mockArticles)
    setFilteredArticles(mockArticles)
    setLoading(false)
  }, [])

  // Filter articles based on search and category
  useEffect(() => {
    let filtered = articles.filter((article) => article.status === "published")

    if (searchQuery) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((article) => article.category === selectedCategory)
    }

    setFilteredArticles(filtered)
  }, [articles, searchQuery, selectedCategory])

  const categories = ["Công nghệ Y tế", "Chương trình", "Sức khỏe", "Thông báo"]

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <div className="h-48 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">Tin tức Y tế</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Cập nhật những thông tin mới nhất về y tế, sức khỏe và các hoạt động của bệnh viện
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <SearchBar placeholder="Tìm kiếm tin tức..." onSearch={setSearchQuery} />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <Card
              key={article.id}
              className="hover:shadow-lg transition-shadow group cursor-pointer"
              onClick={() => router.push(`/news/${article.id}`)}
            >
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <img
                  src={article.image_url || "/placeholder.svg?height=200&width=400&query=news article"}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{article.category}</Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(article.published_date).toLocaleDateString("vi-VN")}
                  </div>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">{article.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="w-4 h-4 mr-1" />
                    {article.author}
                  </div>
                  <Button variant="ghost" className="p-0 h-auto font-semibold group-hover:text-primary">
                    Đọc thêm
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Không tìm thấy tin tức nào.</p>
          </div>
        )}
      </div>
    </div>
  )
}
