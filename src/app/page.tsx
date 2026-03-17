'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  FileText, 
  Globe, 
  Mail, 
  Database, 
  Settings, 
  Play, 
  Pause, 
  Trash2, 
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FolderTree,
  BarChart3,
  Zap
} from 'lucide-react'
import { TaskManager } from '@/components/TaskManager'
import { WebScraper } from '@/components/WebScraper'
import { FileOrganizer } from '@/components/FileOrganizer'
import { DataProcessor } from '@/components/DataProcessor'
import { EmailAutomation } from '@/components/EmailAutomation'
import { LogsViewer } from '@/components/LogsViewer'

export default function Home() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    runningTasks: 0,
    completedTasks: 0,
    failedTasks: 0
  })
  const [recentLogs, setRecentLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchLogs()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/tasks/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs?limit=10')
      if (res.ok) {
        const data = await res.json()
        setRecentLogs(data)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-500'
      case 'warning': return 'text-yellow-500'
      default: return 'text-green-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir="rtl">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">مساعد الأتمتة الذكي</h1>
                <p className="text-sm text-slate-400">أتمتة المهام وتحسين الكفاءة</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                النظام نشط
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">إجمالي المهام</p>
                  <p className="text-3xl font-bold text-white">{stats.totalTasks}</p>
                </div>
                <div className="bg-blue-500/10 p-3 rounded-lg">
                  <Database className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">قيد التنفيذ</p>
                  <p className="text-3xl font-bold text-blue-400">{stats.runningTasks}</p>
                </div>
                <div className="bg-blue-500/10 p-3 rounded-lg">
                  <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">مكتملة</p>
                  <p className="text-3xl font-bold text-green-400">{stats.completedTasks}</p>
                </div>
                <div className="bg-green-500/10 p-3 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">فاشلة</p>
                  <p className="text-3xl font-bold text-red-400">{stats.failedTasks}</p>
                </div>
                <div className="bg-red-500/10 p-3 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList className="bg-slate-800/50 border border-slate-700 w-full justify-start overflow-x-auto">
            <TabsTrigger value="tasks" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <Database className="h-4 w-4 ml-2" />
              المهام
            </TabsTrigger>
            <TabsTrigger value="scraping" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <Globe className="h-4 w-4 ml-2" />
              استخراج الويب
            </TabsTrigger>
            <TabsTrigger value="files" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <FolderTree className="h-4 w-4 ml-2" />
              تنظيم الملفات
            </TabsTrigger>
            <TabsTrigger value="data" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <BarChart3 className="h-4 w-4 ml-2" />
              معالجة البيانات
            </TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <Mail className="h-4 w-4 ml-2" />
              البريد الإلكتروني
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <FileText className="h-4 w-4 ml-2" />
              السجلات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <TaskManager />
          </TabsContent>

          <TabsContent value="scraping">
            <WebScraper />
          </TabsContent>

          <TabsContent value="files">
            <FileOrganizer />
          </TabsContent>

          <TabsContent value="data">
            <DataProcessor />
          </TabsContent>

          <TabsContent value="email">
            <EmailAutomation />
          </TabsContent>

          <TabsContent value="logs">
            <LogsViewer />
          </TabsContent>
        </Tabs>

        {/* Recent Activity */}
        <Card className="bg-slate-800/50 border-slate-700 mt-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-500" />
              النشاط الأخير
            </CardTitle>
            <CardDescription>آخر العمليات المنفذة</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              {recentLogs.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>لا توجد سجلات حتى الآن</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentLogs.map((log: any) => (
                    <div key={log.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/30">
                      <span className={getLevelColor(log.level)}>●</span>
                      <span className="text-white flex-1">{log.message}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(log.createdAt).toLocaleString('ar-SA')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 mt-auto py-4">
        <div className="container mx-auto px-4 text-center text-slate-400 text-sm">
          مساعد الأتمتة الذكي - جميع الحقوق محفوظة © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  )
}
