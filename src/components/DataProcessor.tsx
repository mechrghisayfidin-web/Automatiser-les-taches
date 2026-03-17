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
import { Textarea } from '@/components/ui/textarea'
import { 
  BarChart3, 
  Plus, 
  RefreshCw, 
  Play, 
  Trash2, 
  FileSpreadsheet,
  FileJson,
  Database,
  Download
} from 'lucide-react'

interface DataJob {
  id: string
  name: string
  sourceType: string
  sourcePath: string | null
  operations: string
  outputPath: string | null
  outputFormat: string
  schedule: string | null
  status: string
  lastRun: string | null
  createdAt: string
}

const sourceTypeLabels: Record<string, { label: string; icon: any }> = {
  csv: { label: 'CSV', icon: FileSpreadsheet },
  excel: { label: 'Excel', icon: FileSpreadsheet },
  json: { label: 'JSON', icon: FileJson },
  api: { label: 'API', icon: Database }
}

export function DataProcessor() {
  const [jobs, setJobs] = useState<DataJob[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    sourceType: 'csv',
    sourcePath: '',
    operations: '[]',
    outputPath: '',
    outputFormat: 'excel',
    schedule: ''
  })

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/data/jobs')
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
      const res = await fetch('/api/data/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setDialogOpen(false)
        fetchJobs()
        setFormData({ name: '', sourceType: 'csv', sourcePath: '', operations: '[]', outputPath: '', outputFormat: 'excel', schedule: '' })
      }
    } catch (error) {
      console.error('Error creating job:', error)
    }
  }

  const handleRunJob = async (jobId: string) => {
    setProcessing(true)
    try {
      const res = await fetch(`/api/data/jobs/${jobId}/run`, { method: 'POST' })
      if (res.ok) {
        const result = await res.json()
        setPreviewData(result)
        fetchJobs()
      }
    } catch (error) {
      console.error('Error running job:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handlePreview = async (jobId: string) => {
    try {
      const res = await fetch(`/api/data/jobs/${jobId}/preview`)
      if (res.ok) {
        const data = await res.json()
        setPreviewData(data)
      }
    } catch (error) {
      console.error('Error previewing job:', error)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المهمة؟')) return
    try {
      const res = await fetch(`/api/data/jobs/${jobId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchJobs()
      }
    } catch (error) {
      console.error('Error deleting job:', error)
    }
  }

  const handleDownload = async (jobId: string) => {
    try {
      const res = await fetch(`/api/data/jobs/${jobId}/download`)
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `data_export_${jobId}.xlsx`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading:', error)
    }
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="jobs" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
            مهام المعالجة
          </TabsTrigger>
          <TabsTrigger value="preview" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
            معاينة البيانات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">معالجة البيانات</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchJobs} className="border-slate-600 text-slate-300">
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
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
                  <DialogHeader>
                    <DialogTitle>إنشاء مهمة معالجة جديدة</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      حدد مصدر البيانات والعمليات المطلوبة
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
                      <Label htmlFor="sourceType">نوع المصدر</Label>
                      <Select value={formData.sourceType} onValueChange={(value) => setFormData({ ...formData, sourceType: value })}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="api">API</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="sourcePath">مسار المصدر / URL</Label>
                      <Input
                        id="sourcePath"
                        value={formData.sourcePath}
                        onChange={(e) => setFormData({ ...formData, sourcePath: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="/path/to/file.csv or https://api.example.com/data"
                      />
                    </div>
                    <div>
                      <Label htmlFor="operations">العمليات (JSON)</Label>
                      <Textarea
                        id="operations"
                        value={formData.operations}
                        onChange={(e) => setFormData({ ...formData, operations: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white font-mono text-sm"
                        rows={4}
                        placeholder='[{"type": "filter", "column": "price", "operator": ">", "value": 100}]'
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="outputFormat">صيغة الإخراج</Label>
                        <Select value={formData.outputFormat} onValueChange={(value) => setFormData({ ...formData, outputFormat: value })}>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="excel">Excel</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                            <SelectItem value="json">JSON</SelectItem>
                          </SelectContent>
                        </Select>
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
              <ScrollArea className="h-[400px]">
                {loading ? (
                  <div className="flex items-center justify-center h-48">
                    <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                    <p>لا توجد مهام معالجة. قم بإنشاء واحدة جديدة.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-700">
                    {jobs.map((job) => {
                      const Icon = sourceTypeLabels[job.sourceType]?.icon || Database
                      return (
                        <div key={job.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="bg-blue-500/10 p-2 rounded-lg">
                                <Icon className="h-5 w-5 text-blue-500" />
                              </div>
                              <div>
                                <h3 className="font-medium text-white">{job.name}</h3>
                                <p className="text-sm text-slate-400">{job.sourcePath}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="border-slate-600 text-slate-300">
                                    {sourceTypeLabels[job.sourceType]?.label}
                                  </Badge>
                                  <Badge variant="outline" className="border-slate-600 text-slate-300">
                                    إخراج: {job.outputFormat.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePreview(job.id)}
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                              >
                                <Database className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRunJob(job.id)}
                                disabled={processing}
                                className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(job.id)}
                                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                              >
                                <Download className="h-4 w-4" />
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

        <TabsContent value="preview">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">معاينة البيانات</CardTitle>
              <CardDescription>عرض البيانات المعالجة</CardDescription>
            </CardHeader>
            <CardContent>
              {previewData ? (
                <ScrollArea className="h-[400px]">
                  <pre className="text-sm text-slate-300 bg-slate-900 p-4 rounded-lg overflow-auto">
                    {JSON.stringify(previewData, null, 2)}
                  </pre>
                </ScrollArea>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>اختر مهمة للمعاينة</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
