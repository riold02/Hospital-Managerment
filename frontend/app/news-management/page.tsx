"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"
import { SearchBar } from "@/components/shared/SearchBar"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { useToast } from "@/hooks/use-toast"

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

export default function NewsManagementPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    image_url: "",
    status: "draft" as "published" | "draft",
  })

  // Mock data for demonstration
  useEffect(() => {
    const mockArticles: NewsArticle[] = [
      {
        id: "1",
        title: "Kỹ thuật phẫu thuật tim mới tại MediCare Plus",
        excerpt: "Bệnh viện đã áp dụng thành công kỹ thuật phẫu thuật tim ít xâm lấn...",
        content: "Nội dung chi tiết về kỹ thuật phẫu thuật tim mới...",
        category: "Công nghệ Y tế",
        author: "BS. Nguyễn Thị Hoa",
        published_date: "2024-12-15",
        image_url: "/cardiac-surgery.png",
        status: "published",
        created_at: "2024-12-15T08:00:00Z",
      },
      {
        id: "2",
        title: "Chương trình khám sức khỏe miễn phí",
        excerpt: "Trong tháng 12, bệnh viện tổ chức chương trình khám sức khỏe miễn phí...",
        content: "Chi tiết về chương trình khám sức khỏe...",
        category: "Chương trình",
        author: "Phòng Truyền thông",
        published_date: "2024-12-12",
        status: "draft",
        created_at: "2024-12-12T10:00:00Z",
      },
    ]

    setArticles(mockArticles)
    setFilteredArticles(mockArticles)
    setLoading(false)
  }, [])

  // Filter articles
  useEffect(() => {
    let filtered = articles

    if (searchQuery) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((article) => article.status === selectedStatus)
    }

    setFilteredArticles(filtered)
  }, [articles, searchQuery, selectedStatus])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingArticle) {
      // Update existing article
      const updatedArticles = articles.map((article) =>
        article.id === editingArticle.id
          ? {
              ...article,
              ...formData,
              published_date:
                formData.status === "published" ? new Date().toISOString().split("T")[0] : article.published_date,
            }
          : article,
      )
      setArticles(updatedArticles)
      toast({
        title: "Thành công",
        description: "Tin tức đã được cập nhật thành công.",
      })
    } else {
      // Create new article
      const newArticle: NewsArticle = {
        id: Date.now().toString(),
        ...formData,
        author: "Admin", // In real app, get from auth context
        published_date: formData.status === "published" ? new Date().toISOString().split("T")[0] : "",
        created_at: new Date().toISOString(),
      }
      setArticles([newArticle, ...articles])
      toast({
        title: "Thành công",
        description: "Tin tức đã được tạo thành công.",
      })
    }

    resetForm()
  }

  const handleEdit = (article: NewsArticle) => {
    setEditingArticle(article)
    setFormData({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      image_url: article.image_url || "",
      status: article.status,
    })
    setIsFormOpen(true)
  }

  const handleDelete = (id: string) => {
    setArticles(articles.filter((article) => article.id !== id))
    toast({
      title: "Thành công",
      description: "Tin tức đã được xóa thành công.",
    })
  }

  const resetForm = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "",
      image_url: "",
      status: "draft",
    })
    setEditingArticle(null)
    setIsFormOpen(false)
  }

  const columns = [
    {
      key: "title",
      label: "Tiêu đề",
      render: (article: NewsArticle) => (
        <div className="max-w-xs">
          <p className="font-medium truncate">{article?.title || "N/A"}</p>
          <p className="text-sm text-muted-foreground truncate">{article?.category || "N/A"}</p>
        </div>
      ),
    },
    {
      key: "author",
      label: "Tác giả",
      render: (article: NewsArticle) => article?.author || "N/A",
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (article: NewsArticle) => <StatusBadge status={article?.status || "draft"} type="news" />,
    },
    {
      key: "published_date",
      label: "Ngày xuất bản",
      render: (article: NewsArticle) =>
        article?.published_date ? new Date(article.published_date).toLocaleDateString("vi-VN") : "-",
    },
    {
      key: "created_at",
      label: "Ngày tạo",
      render: (article: NewsArticle) =>
        article?.created_at ? new Date(article.created_at).toLocaleDateString("vi-VN") : "N/A",
    },
    {
      key: "actions",
      label: "Hành động",
      render: (article: NewsArticle) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(article)}>
            <Edit className="w-4 h-4" />
          </Button>
          <ConfirmDialog
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa tin tức này không?"
            onConfirm={() => handleDelete(article?.id || "")}
          >
            <Button variant="ghost" size="sm">
              <Trash2 className="w-4 h-4" />
            </Button>
          </ConfirmDialog>
        </div>
      ),
    },
  ]

  const categories = ["Công nghệ Y tế", "Chương trình", "Sức khỏe", "Thông báo"]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý Tin tức</h1>
          <p className="text-muted-foreground">Tạo và quản lý các tin tức của bệnh viện</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm tin tức mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingArticle ? "Chỉnh sửa tin tức" : "Thêm tin tức mới"}</DialogTitle>
              <DialogDescription>
                {editingArticle ? "Cập nhật thông tin tin tức" : "Tạo tin tức mới cho bệnh viện"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Danh mục *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="excerpt">Tóm tắt *</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="content">Nội dung *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  required
                />
              </div>
              <div>
                <Label htmlFor="image_url">URL hình ảnh</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "published" | "draft") => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Bản nháp</SelectItem>
                    <SelectItem value="published">Đã xuất bản</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Hủy
                </Button>
                <Button type="submit">{editingArticle ? "Cập nhật" : "Tạo tin tức"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchBar placeholder="Tìm kiếm tin tức..." onSearch={setSearchQuery} />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="published">Đã xuất bản</SelectItem>
            <SelectItem value="draft">Bản nháp</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredArticles}
        total={filteredArticles.length}
        page={1}
        pageSize={10}
        onPageChange={() => {}}
        onSort={() => {}}
        onFilter={() => {}}
        loading={loading}
      />
    </div>
  )
}
