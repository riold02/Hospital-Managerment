'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"

interface MessageSender {
  full_name?: string
}

interface Message {
  id: number
  message: string
  priority?: 'high' | 'medium' | 'low'
  created_at: string
  sender?: MessageSender
}

interface InboxTabProps {
  messages: Message[]
  getPriorityBadge: (priority: string) => React.ReactNode
}

export default function InboxTab({ messages, getPriorityBadge }: InboxTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-green-600" />
          Hộp thư & Thông báo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {messages && messages.length > 0 ? messages.map((message) => (
            <div key={message.id} className="p-4 rounded-lg border hover:bg-green-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{message.sender?.full_name || 'Hệ thống'}</h4>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(message.priority === "high" ? "Cao" : 
                                   message.priority === "medium" ? "Trung bình" : "Thấp")}
                  <span className="text-sm text-muted-foreground">
                    {new Date(message.created_at).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{message.message}</p>
            </div>
          )) : (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">Không có tin nhắn</h3>
              <p>Chưa có tin nhắn hoặc thông báo nào.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
