import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/tasks/stats - Get task statistics
export async function GET() {
  try {
    const [total, running, completed, failed] = await Promise.all([
      db.task.count(),
      db.task.count({ where: { status: 'running' } }),
      db.task.count({ where: { status: 'completed' } }),
      db.task.count({ where: { status: 'failed' } })
    ])

    return NextResponse.json({
      totalTasks: total,
      runningTasks: running,
      completedTasks: completed,
      failedTasks: failed
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Error fetching stats' }, { status: 500 })
  }
}
