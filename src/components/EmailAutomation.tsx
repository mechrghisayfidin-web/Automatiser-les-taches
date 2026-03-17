'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Mail, 
  Plus, 
  RefreshCw, 
  Send, 
  Trash2, 
  Settings,
  Clock,
  FileText,
  CheckCircle2
} from 'lucide-react'

interface EmailJob {
  id: string
  name: string
  recipients: string
  subject: string
  body: string | null
  attachments: string | null
  schedule: string | null
  condition: string | null
  status: string
  lastSent: string | null
  createdAt: string
}

export function EmailAutomation() {
  const [jobs, setJobs] = useState<EmailJob[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [quickEmail, setQuickEmail] = useState({
    recipients: '',
    subject: '',
    body: ''
  })
  const [formData, setFormData] = useState({
    name: '',
    recipients: '',
    subject: '',
    body: '',
    attachments: '',
    schedule: '',
    condition: ''
  })

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/email/jobs')
      if (res.ok) {
        const data = await res.json()
        setJobs(data)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/email/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setDialogOpen(false)
        fetchJobs()
        setFormData({ name: '', recipients: '', subject: '', body: '', attachments: '', schedule: '', condition: '' })
      }
    } catch (error) {
      console.error('Error creating job:', error)
    }
  }

  const handleSendJob = async (jobId: string) => {
    setSending(true)
    try {
      const res = await fetch(`/api/email/jobs/${jobId}/send`, { method: 'POST' })
      if (res.ok) {
        fetchJobs()
      }
    } catch (error) {
      console.error('Error sending email:', error)
    } finally {
      setSending(false)
    }
  }

  const handleQuickSend = async () => {
    if (!quickEmail.recipients || !quickEmail.subject) return
    setSending(true)
    try {
      const res = await fetch('/api/email/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quickEmail)
      })
      if (res.ok) {
        setQuickEmail({ recipients: '', subject: '', body: '' })
      }
    } catch (error) {
      console.error('Error sending quick email:', error)
    } finally {
      setSending(false)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الوظيفة؟')) return
    try {
      const res = await fetch(`/api/email/jobs/${jobId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchJobs()
      }
    } catch (error) {
      console.error('Error deleting job:', error)
    }
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="jobs" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
            الوظائف المحفوظة
          </TabsTrigger>
          <TabsTrigger value="quick" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
            إرسال سريع
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
            الإعدادات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">أتمتة البريد الإلكتروني</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchJobs} className="border-slate-600 text-slate-300">
                <RefreshCw className="h-4 w-4 ml-2" />
                تحديث
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 ml-2" />
                    وظيفة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
                  <DialogHeader>
                    <DialogTitle>إنشاء وظيفة بريد جديدة</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      حدد تفاصيل البريد الإلكتروني
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">اسم الوظيفة</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="recipients">المستلمون (مفصولين بفاصلة)</Label>
                      <Input
                        id="recipients"
                        type="email"
                        value={formData.recipients}
                        onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="email1@example.com, email2@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">الموضوع</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="body">المحتوى</Label>
                      <Textarea
                        id="body"
                        value={formData.body}
                        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="attachments">المرفقات (مسارات الملفات)</Label>
                      <Input
                        id="attachments"
                        value={formData.attachments}
                        onChange={(e) => setFormData({ ...formData, attachments: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="/path/to/file1.pdf, /path/to/file2.xlsx"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="schedule">الجدولة</Label>
                        <Input
                          id="schedule"
                          value={formData.schedule}
                          onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="0 0 * * *"
                        />
                      </div>
                      <div>
                        <Label htmlFor="condition">الشرط (اختياري)</Label>
                        <Input
                          id="condition"
                          value={formData.condition}
                          onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="data.value > 100"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                        إنشاء الوظيفة
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/10 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">إجمالي الوظائف</p>
                    <p className="text-xl font-bold text-white">{jobs.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/10 p-2 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">نشطة</p>
                    <p className="text-xl font-bold text-white">{jobs.filter(j => j.status === 'active').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/10 p-2 rounded-lg">
                    <Send className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">مرسلة</p>
                    <p className="text-xl font-bold text-white">{jobs.filter(j => j.lastSent).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                {loading ? (
                  <div className="flex items-center justify-center h-48">
                    <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Mail className="h-12 w-12 mx-auto mb-4" />
                    <p>لا توجد وظائف بريد. قم بإنشاء واحدة جديدة.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-700">
                    {jobs.map((job) => (
                      <div key={job.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="bg-purple-500/10 p-2 rounded-lg">
                              <Mail className="h-5 w-5 text-purple-500" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-white">{job.name}</h3>
                                <Badge variant="outline" className="border-slate-600 text-slate-300">
                                  {job.status === 'active' ? 'نشط' : 'متوقف'}
                                </Badge>
                              </div>
                              <p className="text-sm text-emerald-400">{job.subject}</p>
                              <p className="text-xs text-slate-400 mt-1">
                                إلى: {job.recipients}
                              </p>
                              {job.lastSent && (
                                <p className="text-xs text-slate-500 mt-1">
                                  آخر إرسال: {new Date(job.lastSent).toLocaleString('ar-SA')}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendJob(job.id)}
                              disabled={sending}
                              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteJob(job.id)}
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
        </TabsContent>

        <TabsContent value="quick">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">إرسال بريد سريع</CardTitle>
              <CardDescription>إرسال بريد إلكتروني مباشرة بدون حفظ الوظيفة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>المستلمون</Label>
                <Input
                  value={quickEmail.recipients}
                  onChange={(e) => setQuickEmail({ ...quickEmail, recipients: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label>الموضوع</Label>
                <Input
                  value={quickEmail.subject}
                  onChange={(e) => setQuickEmail({ ...quickEmail, subject: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label>المحتوى</Label>
                <Textarea
                  value={quickEmail.body}
                  onChange={(e) => setQuickEmail({ ...quickEmail, body: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  rows={6}
                />
              </div>
              <Button 
                onClick={handleQuickSend} 
                disabled={sending || !quickEmail.recipients || !quickEmail.subject}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {sending ? (
                  <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 ml-2" />
                )}
                إرسال البريد
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">إعدادات البريد الإلكتروني</CardTitle>
              <CardDescription>تكوين إعدادات SMTP للإرسال</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>خادم SMTP</Label>
                  <Input className="bg-slate-700 border-slate-600 text-white" placeholder="smtp.gmail.com" />
                </div>
                <div>
                  <Label>المنفذ</Label>
                  <Input className="bg-slate-700 border-slate-600 text-white" placeholder="587" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>البريد الإلكتروني</Label>
                  <Input className="bg-slate-700 border-slate-600 text-white" placeholder="your@email.com" />
                </div>
                <div>
                  <Label>كلمة المرور / App Password</Label>
                  <Input type="password" className="bg-slate-700 border-slate-600 text-white" />
                </div>
              </div>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Settings className="h-4 w-4 ml-2" />
                حفظ الإعدادات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
