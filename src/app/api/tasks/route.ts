import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/tasks - Get all tasks
export async function GET() {
  try {
    const tasks = await db.task.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Error fetching tasks' }, { status: 500 })
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, type, schedule, config } = body

    const task = await db.task.create({
      data: {
        name,
        description,
        type,
        schedule,
        config: config || '{}',
        status: 'pending'
      }
    })

    // Log task creation
    await db.log.create({
      data: {
        taskId: task.id,
        level: 'info',
        message: `تم إنشاء المهمة: ${name}`
      }
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Error creating task' }, { status: 500 })
  }
}
