"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, Eye, Edit, Shield, Trash2 } from "lucide-react"
import { adminApi } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

export function UsersTab() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editForm, setEditForm] = useState({ role: "", is_active: true })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await adminApi.getAllUsers({ limit: 100 })
      setUsers(response.data || [])
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người dùng",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`Bạn có chắc chắn muốn ${currentStatus ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản này?`)) return
    
    try {
      await adminApi.updateUserStatus(userId, { is_active: !currentStatus })
      toast({
        title: "Thành công",
        description: `Đã ${!currentStatus ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản`,
      })
      loadUsers()
    } catch (error) {
      console.error("Error updating user status:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái tài khoản",
        variant: "destructive",
      })
    }
  }

  const handleViewDetail = (user: any) => {
    setSelectedUser(user)
    setShowDetailDialog(true)
  }

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setEditForm({
      role: user.role || "patient",
      is_active: user.is_active,
    })
    setShowEditDialog(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedUser) return
    
    try {
      // Update role if changed
      if (editForm.role && editForm.role !== selectedUser.role) {
        await adminApi.updateUserRole(selectedUser.user_id, { role_name: editForm.role })
      }
      
      // Update status if changed
      if (editForm.is_active !== selectedUser.is_active) {
        await adminApi.updateUserStatus(selectedUser.user_id, { is_active: editForm.is_active })
      }
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin người dùng",
      })
      setShowEditDialog(false)
      loadUsers()
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin người dùng",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.')) return
    
    try {
      await adminApi.deleteUser(userId)
      toast({
        title: "Thành công",
        description: "Đã xóa người dùng",
      })
      loadUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa người dùng. Có thể người dùng này có dữ liệu liên quan.",
        variant: "destructive",
      })
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "" || 
                         (statusFilter === "active" && user.is_active) ||
                         (statusFilter === "inactive" && !user.is_active)
    const matchesRole = roleFilter === "" || user.role === roleFilter
    return matchesSearch && matchesStatus && matchesRole
  })

  const getRoleBadge = (role: string) => {
    const roleMap: any = {
      'admin': { label: 'Admin', color: 'bg-red-100 text-red-800' },
      'doctor': { label: 'Bác sĩ', color: 'bg-blue-100 text-blue-800' },
      'nurse': { label: 'Y tá', color: 'bg-green-100 text-green-800' },
      'pharmacist': { label: 'Dược sĩ', color: 'bg-purple-100 text-purple-800' },
      'patient': { label: 'Bệnh nhân', color: 'bg-gray-100 text-gray-800' },
      'technician': { label: 'Kỹ thuật viên', color: 'bg-yellow-100 text-yellow-800' },
      'lab_assistant': { label: 'Trợ lý xét nghiệm', color: 'bg-indigo-100 text-indigo-800' },
      'driver': { label: 'Tài xế', color: 'bg-orange-100 text-orange-800' },
    }
    return roleMap[role?.toLowerCase()] || { label: role || 'User', color: 'bg-gray-100 text-gray-800' }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Quản lý người dùng & Phân quyền ({filteredUsers.length})
            </CardTitle>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm email, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter || "all"} onValueChange={(value) => setRoleFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tất cả vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="doctor">Bác sĩ</SelectItem>
                <SelectItem value="nurse">Y tá</SelectItem>
                <SelectItem value="pharmacist">Dược sĩ</SelectItem>
                <SelectItem value="patient">Bệnh nhân</SelectItem>
                <SelectItem value="technician">Kỹ thuật viên</SelectItem>
                <SelectItem value="lab_assistant">Trợ lý XN</SelectItem>
                <SelectItem value="driver">Tài xế</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Đã vô hiệu hóa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Đang tải...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">Không tìm thấy người dùng</h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Đăng nhập cuối</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const roleBadge = getRoleBadge(user.role)
                    
                    return (
                      <TableRow key={user.user_id}>
                        <TableCell className="font-medium">#{user.user_id.substring(0, 8)}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={roleBadge.color}>{roleBadge.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? "default" : "secondary"}>
                            {user.is_active ? "Hoạt động" : "Vô hiệu"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {user.last_login ? 
                            new Date(user.last_login).toLocaleString('vi-VN') : 
                            'Chưa đăng nhập'
                          }
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewDetail(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteUser(user.user_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={user.is_active ? "destructive" : "default"}
                              onClick={() => handleToggleStatus(user.user_id, user.is_active)}
                            >
                              {user.is_active ? "Khóa" : "Mở"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết người dùng</DialogTitle>
            <DialogDescription>Thông tin đầy đủ về người dùng</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">User ID</label>
                  <p className="font-mono text-sm">{selectedUser.user_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="font-semibold">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Vai trò</label>
                  <Badge className={getRoleBadge(selectedUser.role).color}>
                    {getRoleBadge(selectedUser.role).label}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                  <Badge variant={selectedUser.is_active ? "default" : "secondary"}>
                    {selectedUser.is_active ? "Hoạt động" : "Vô hiệu"}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Đăng nhập cuối</label>
                  <p className="text-sm">
                    {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                  <p className="text-sm">
                    {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString('vi-VN') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
            <DialogDescription>Cập nhật vai trò và trạng thái</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <p className="text-sm font-medium">{selectedUser.email}</p>
              </div>
              
              <div>
                <Label htmlFor="role">Vai trò</Label>
                <Select value={editForm.role || "patient"} onValueChange={(value) => setEditForm({...editForm, role: value})}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="doctor">Bác sĩ</SelectItem>
                    <SelectItem value="nurse">Y tá</SelectItem>
                    <SelectItem value="pharmacist">Dược sĩ</SelectItem>
                    <SelectItem value="patient">Bệnh nhân</SelectItem>
                    <SelectItem value="technician">Kỹ thuật viên</SelectItem>
                    <SelectItem value="lab_assistant">Trợ lý xét nghiệm</SelectItem>
                    <SelectItem value="driver">Tài xế</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <Select 
                  value={editForm.is_active ? "active" : "inactive"} 
                  onValueChange={(value) => setEditForm({...editForm, is_active: value === "active"})}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Vô hiệu hóa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Hủy</Button>
            <Button onClick={handleSaveEdit}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

