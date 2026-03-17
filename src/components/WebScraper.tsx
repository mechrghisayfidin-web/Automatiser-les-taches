'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Globe, 
  Plus, 
  RefreshCw, 
  Play, 
  Trash2, 
  Link, 
  Image, 
  FileText,
  Table,
  Code
} from 'lucide-react'

interface ScrapingJob {
  id: string
  name: string
  url: string
  selector: string | null
  extractType: string
  schedule: string | null
  lastResult: string | null
  status: string
  createdAt: string
}

const extractTypeLabels: Record<string, { label: string; icon: any }> = {
  text: { label: 'نص', icon: FileText },
  links: { label: 'روابط', icon: Link },
  images: { label: 'صور', icon: Image },
  tables: { label: 'جداول', icon: Table },
  custom: { label: 'مخصص', icon: Code }
}

export function WebScraper() {
  const [jobs, setJobs] = useState<ScrapingJob[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [scrapingResult, setScrapingResult] = useState<any>(null)
  const [quickScrape, setQuickScrape] = useState({ url: '', selector: '' })
  const [quickScraping, setQuickScraping] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    selector: '',
    extractType: 'text',
    schedule: ''
  })

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/scraping')
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
      const res = await fetch('/api/scraping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setDialogOpen(false)
        fetchJobs()
        setFormData({ name: '', url: '', selector: '', extractType: 'text', schedule: '' })
      }
    } catch (error) {
      console.error('Error creating job:', error)
    }
  }

  const handleRunJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/scraping/${jobId}/run`, { method: 'POST' })
      if (res.ok) {
        const result = await res.json()
        setScrapingResult(result)
        fetchJobs()
      }
    } catch (error) {
      console.error('Error running job:', error)
    }
  }

  const handleQuickScrape = async () => {
    if (!quickScrape.url) return
    setQuickScraping(true)
    try {
      const res = await fetch('/api/scraping/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quickScrape)
      })
      if (res.ok) {
        const result = await res.json()
        setScrapingResult(result)
      }
    } catch (error) {
      console.error('Error quick scraping:', error)
    } finally {
      setQuickScraping(false)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الوظيفة؟')) return
    try {
      const res = await fetch(`/api/scraping/${jobId}`, { method: 'DELETE' })
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
            استخراج سريع
          </TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
            النتائج
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">وظائف استخراج الويب</h2>
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
                    <DialogTitle>إنشاء وظيفة استخراج جديدة</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      أدخل تفاصيل وظيفة استخراج البيانات
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
                      <Label htmlFor="url">رابط الموقع</Label>
                      <Input
                        id="url"
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="https://example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="extractType">نوع الاستخراج</Label>
                      <Select value={formData.extractType} onValueChange={(value) => setFormData({ ...formData, extractType: value })}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="text">نص</SelectItem>
                          <SelectItem value="links">روابط</SelectItem>
                          <SelectItem value="images">صور</SelectItem>
                          <SelectItem value="tables">جداول</SelectItem>
                          <SelectItem value="custom">مخصص</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="selector">محدد CSS (اختياري)</Label>
                      <Input
                        id="selector"
                        value={formData.selector}
                        onChange={(e) => setFormData({ ...formData, selector: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder=".content, #main, article"
                      />
                    </div>
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

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                {loading ? (
                  <div className="flex items-center justify-center h-48">
                    <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Globe className="h-12 w-12 mx-auto mb-4" />
                    <p>لا توجد وظائف استخراج. قم بإنشاء واحدة جديدة.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-700">
                    {jobs.map((job) => {
                      const Icon = extractTypeLabels[job.extractType]?.icon || FileText
                      return (
                        <div key={job.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="bg-emerald-500/10 p-2 rounded-lg">
                                <Icon className="h-5 w-5 text-emerald-500" />
                              </div>
                              <div>
                                <h3 className="font-medium text-white">{job.name}</h3>
                                <p className="text-sm text-slate-400 truncate max-w-md">{job.url}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="border-slate-600 text-slate-300">
                                    {extractTypeLabels[job.extractType]?.label}
                                  </Badge>
                                  {job.selector && (
                                    <code className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                                      {job.selector}
                                    </code>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRunJob(job.id)}
                                className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                              >
                                <Play className="h-4 w-4" />
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
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quick">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">استخراج سريع</CardTitle>
              <CardDescription>استخراج بيانات من أي موقع بدون حفظ الوظيفة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>رابط الموقع</Label>
                <Input
                  value={quickScrape.url}
                  onChange={(e) => setQuickScrape({ ...quickScrape, url: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label>محدد CSS (اختياري)</Label>
                <Input
                  value={quickScrape.selector}
                  onChange={(e) => setQuickScrape({ ...quickScrape, selector: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder=".content, #main"
                />
              </div>
              <Button 
                onClick={handleQuickScrape} 
                disabled={quickScraping || !quickScrape.url}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {quickScraping ? (
                  <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                ) : (
                  <Globe className="h-4 w-4 ml-2" />
                )}
                استخراج البيانات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">نتائج الاستخراج</CardTitle>
            </CardHeader>
            <CardContent>
              {scrapingResult ? (
                <ScrollArea className="h-[400px]">
                  <pre className="text-sm text-slate-300 bg-slate-900 p-4 rounded-lg overflow-auto">
                    {JSON.stringify(scrapingResult, null, 2)}
                  </pre>
                </ScrollArea>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>لا توجد نتائج بعد. قم بتشغيل وظيفة استخراج.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
