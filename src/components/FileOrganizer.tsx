'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  FolderTree, 
  Plus, 
  RefreshCw, 
  Play, 
  Trash2, 
  FolderOpen,
  Move,
  Copy,
  FileEdit,
  Archive
} from 'lucide-react'

interface FileRule {
  id: string
  name: string
  sourceFolder: string
  targetFolder: string
  filePattern: string | null
  namingRule: string | null
  action: string
  isActive: boolean
  createdAt: string
}

const actionLabels: Record<string, { label: string; icon: any }> = {
  move: { label: 'نقل', icon: Move },
  copy: { label: 'نسخ', icon: Copy },
  rename: { label: 'إعادة تسمية', icon: FileEdit },
  archive: { label: 'أرشفة', icon: Archive }
}

export function FileOrganizer() {
  const [rules, setRules] = useState<FileRule[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [organizing, setOrganizing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    sourceFolder: '',
    targetFolder: '',
    filePattern: '',
    namingRule: '',
    action: 'move'
  })

  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/files/rules')
      if (res.ok) {
        const data = await res.json()
        setRules(data)
      }
    } catch (error) {
      console.error('Error fetching rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/files/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setDialogOpen(false)
        fetchRules()
        setFormData({ name: '', sourceFolder: '', targetFolder: '', filePattern: '', namingRule: '', action: 'move' })
      }
    } catch (error) {
      console.error('Error creating rule:', error)
    }
  }

  const handleRunRule = async (ruleId: string) => {
    setOrganizing(true)
    try {
      const res = await fetch(`/api/files/rules/${ruleId}/run`, { method: 'POST' })
      if (res.ok) {
        fetchRules()
      }
    } catch (error) {
      console.error('Error running rule:', error)
    } finally {
      setOrganizing(false)
    }
  }

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/files/rules/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })
      if (res.ok) {
        fetchRules()
      }
    } catch (error) {
      console.error('Error toggling rule:', error)
    }
  }

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه القاعدة؟')) return
    try {
      const res = await fetch(`/api/files/rules/${ruleId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchRules()
      }
    } catch (error) {
      console.error('Error deleting rule:', error)
    }
  }

  const handleRunAll = async () => {
    setOrganizing(true)
    try {
      const res = await fetch('/api/files/run-all', { method: 'POST' })
      if (res.ok) {
        fetchRules()
      }
    } catch (error) {
      console.error('Error running all rules:', error)
    } finally {
      setOrganizing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">تنظيم الملفات</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchRules} className="border-slate-600 text-slate-300">
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRunAll} 
            disabled={organizing}
            className="border-emerald-600 text-emerald-400"
          >
            <Play className="h-4 w-4 ml-2" />
            تشغيل الكل
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 ml-2" />
                قاعدة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
              <DialogHeader>
                <DialogTitle>إنشاء قاعدة تنظيم جديدة</DialogTitle>
                <DialogDescription className="text-slate-400">
                  حدد كيفية تنظيم ملفاتك تلقائياً
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">اسم القاعدة</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sourceFolder">المجلد المصدر</Label>
                  <Input
                    id="sourceFolder"
                    value={formData.sourceFolder}
                    onChange={(e) => setFormData({ ...formData, sourceFolder: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="/home/user/Downloads"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="targetFolder">المجلد الهدف</Label>
                  <Input
                    id="targetFolder"
                    value={formData.targetFolder}
                    onChange={(e) => setFormData({ ...formData, targetFolder: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="/home/user/Documents"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="filePattern">نمط الملفات (Regex)</Label>
                  <Input
                    id="filePattern"
                    value={formData.filePattern}
                    onChange={(e) => setFormData({ ...formData, filePattern: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder=".*\.pdf$"
                  />
                </div>
                <div>
                  <Label htmlFor="namingRule">قاعدة التسمية</Label>
                  <Input
                    id="namingRule"
                    value={formData.namingRule}
                    onChange={(e) => setFormData({ ...formData, namingRule: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="{date}_{original}"
                  />
                </div>
                <div>
                  <Label htmlFor="action">الإجراء</Label>
                  <Select value={formData.action} onValueChange={(value) => setFormData({ ...formData, action: value })}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="move">نقل</SelectItem>
                      <SelectItem value="copy">نسخ</SelectItem>
                      <SelectItem value="rename">إعادة تسمية</SelectItem>
                      <SelectItem value="archive">أرشفة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    إنشاء القاعدة
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
                <FolderOpen className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">مجلدات مُدارة</p>
                <p className="text-xl font-bold text-white">{new Set(rules.map(r => r.sourceFolder)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <Move className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">قواعد نشطة</p>
                <p className="text-xl font-bold text-white">{rules.filter(r => r.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/10 p-2 rounded-lg">
                <Archive className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">إجمالي القواعد</p>
                <p className="text-xl font-bold text-white">{rules.length}</p>
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
            ) : rules.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FolderTree className="h-12 w-12 mx-auto mb-4" />
                <p>لا توجد قواعد تنظيم. قم بإنشاء واحدة جديدة.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {rules.map((rule) => {
                  const Icon = actionLabels[rule.action]?.icon || Move
                  return (
                    <div key={rule.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="bg-emerald-500/10 p-2 rounded-lg">
                            <Icon className="h-5 w-5 text-emerald-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-white">{rule.name}</h3>
                              <Badge variant="outline" className="border-slate-600 text-slate-300">
                                {actionLabels[rule.action]?.label}
                              </Badge>
                            </div>
                            <div className="text-sm text-slate-400 space-y-1">
                              <p className="flex items-center gap-2">
                                <FolderOpen className="h-3 w-3" />
                                <span>من: {rule.sourceFolder}</span>
                              </p>
                              <p className="flex items-center gap-2">
                                <FolderTree className="h-3 w-3" />
                                <span>إلى: {rule.targetFolder}</span>
                              </p>
                              {rule.filePattern && (
                                <code className="text-xs bg-slate-700 px-2 py-0.5 rounded">
                                  {rule.filePattern}
                                </code>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rule.isActive}
                            onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRunRule(rule.id)}
                            disabled={organizing}
                            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRule(rule.id)}
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
    </div>
  )
}
