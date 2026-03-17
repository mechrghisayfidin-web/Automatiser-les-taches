import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/logs - Get logs with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const level = searchParams.get('level')
    const taskId = searchParams.get('taskId')

    const where: any = {}
    if (level && level !== 'all') where.level = level
    if (taskId) where.taskId = taskId

    const logs = await db.log.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { task: { select: { name: true } } }
    })

    return NextResponse.json(logs)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching logs' }, { status: 500 })
  }
}

// DELETE /api/logs - Clear all logs
export async function DELETE() {
  try {
    await db.log.deleteMany()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error clearing logs' }, { status: 500 })
  }
}
