'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { 
  FileText, 
  RefreshCw, 
  Trash2, 
  Download,
  Search,
  Filter,
  AlertCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

interface Log {
  id: string
  taskId: string | null
  level: string
  message: string
  details: string | null
  createdAt: string
}

const levelConfig: Record<string, { color: string; icon: any; bgColor: string }> = {
  info: { color: 'text-blue-400', icon: Info, bgColor: 'bg-blue-500/10' },
  warning: { color: 'text-yellow-400', icon: AlertTriangle, bgColor: 'bg-yellow-500/10' },
  error: { color: 'text-red-400', icon: AlertCircle, bgColor: 'bg-red-500/10' }
}

export function LogsViewer() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [levelFilter])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const url = levelFilter === 'all' 
        ? '/api/logs?limit=100' 
        : `/api/logs?limit=100&level=${levelFilter}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setLogs(data)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearLogs = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع السجلات؟')) return
    try {
      const res = await fetch('/api/logs', { method: 'DELETE' })
      if (res.ok) {
        setLogs([])
      }
    } catch (error) {
      console.error('Error clearing logs:', error)
    }
  }

  const handleExportLogs = async () => {
    try {
      const res = await fetch('/api/logs/export')
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `logs_${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting logs:', error)
    }
  }

  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const stats = {
    total: logs.length,
    errors: logs.filter(l => l.level === 'error').length,
    warnings: logs.filter(l => l.level === 'warning').length,
    info: logs.filter(l => l.level === 'info').length
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">سجلات النظام</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchLogs} className="border-slate-600 text-slate-300">
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportLogs} className="border-slate-600 text-slate-300">
            <Download className="h-4 w-4 ml-2" />
            تصدير
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearLogs} className="border-red-600 text-red-400">
            <Trash2 className="h-4 w-4 ml-2" />
            مسح الكل
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-500/10 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">إجمالي السجلات</p>
                <p className="text-xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 p-2 rounded-lg">
                <Info className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">معلومات</p>
                <p className="text-xl font-bold text-blue-400">{stats.info}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500/10 p-2 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">تحذيرات</p>
                <p className="text-xl font-bold text-yellow-400">{stats.warnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/10 p-2 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">أخطاء</p>
                <p className="text-xl font-bold text-red-400">{stats.errors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white pr-10"
                placeholder="بحث في السجلات..."
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                <Filter className="h-4 w-4 ml-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="info">معلومات</SelectItem>
                <SelectItem value="warning">تحذيرات</SelectItem>
                <SelectItem value="error">أخطاء</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p>لا توجد سجلات</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {filteredLogs.map((log) => {
                  const config = levelConfig[log.level] || levelConfig.info
                  const Icon = config.icon
                  return (
                    <div key={log.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`${config.bgColor} p-2 rounded-lg`}>
                          <Icon className={`h-4 w-4 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={`border-current ${config.color}`}>
                              {log.level.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {new Date(log.createdAt).toLocaleString('ar-SA')}
                            </span>
                          </div>
                          <p className="text-white">{log.message}</p>
                          {log.details && (
                            <pre className="mt-2 text-xs text-slate-400 bg-slate-900 p-2 rounded overflow-x-auto">
                              {log.details}
                            </pre>
                          )}
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
