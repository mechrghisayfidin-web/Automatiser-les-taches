'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Play, 
  Pause, 
  Trash2, 
  Plus, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Settings,
  Edit,
  Calendar
} from 'lucide-react'

interface Task {
  id: string
  name: string
  description: string | null
  type: string
  status: string
  schedule: string | null
  config: string
  lastRun: string | null
  nextRun: string | null
  createdAt: string
}

const taskTypeLabels: Record<string, string> = {
  file_organization: 'تنظيم الملفات',
  data_processing: 'معالجة البيانات',
  web_scraping: 'استخراج الويب',
  email_automation: 'أتمتة البريد'
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'في الانتظار', color: 'bg-gray-500' },
  running: { label: 'قيد التنفيذ', color: 'bg-blue-500' },
  completed: { label: 'مكتمل', color: 'bg-green-500' },
  failed: { label: 'فشل', color: 'bg-red-500' }
}

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'file_organization',
    schedule: '',
    config: '{}'
  })

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks')
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setDialogOpen(false)
        fetchTasks()
        setFormData({ name: '', description: '', type: 'file_organization', schedule: '', config: '{}' })
      }
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleRunTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/run`, { method: 'POST' })
      if (res.ok) {
        fetchTasks()
      }
    } catch (error) {
      console.error('Error running task:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المهمة؟')) return
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchTasks()
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const { label, color } = statusLabels[status] || statusLabels.pending
    return <Badge className={`${color} text-white`}>{label}</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">إدارة المهام</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchTasks} className="border-slate-600 text-slate-300">
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 ml-2" />
                مهمة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle>إنشاء مهمة جديدة</DialogTitle>
                <DialogDescription className="text-slate-400">
                  أدخل تفاصيل المهمة الجديدة
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">اسم المهمة</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="type">نوع المهمة</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="file_organization">تنظيم الملفات</SelectItem>
                      <SelectItem value="data_processing">معالجة البيانات</SelectItem>
                      <SelectItem value="web_scraping">استخراج الويب</SelectItem>
                      <SelectItem value="email_automation">أتمتة البريد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="schedule">الجدولة (Cron Expression)</Label>
                  <Input
                    id="schedule"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="0 0 * * * (يومياً في منتصف الليل)"
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    إنشاء المهمة
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Calendar className="h-12 w-12 mx-auto mb-4" />
                <p>لا توجد مهام. قم بإنشاء مهمة جديدة.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {tasks.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-white">{task.name}</h3>
                          {getStatusBadge(task.status)}
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            {taskTypeLabels[task.type]}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-slate-400 mb-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          {task.lastRun && (
                            <span>آخر تنفيذ: {new Date(task.lastRun).toLocaleString('ar-SA')}</span>
                          )}
                          {task.schedule && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              مجدول: {task.schedule}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRunTask(task.id)}
                          className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
