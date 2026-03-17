import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/data/jobs
export async function GET() {
  try {
    const jobs = await db.dataJob.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(jobs)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching jobs' }, { status: 500 })
  }
}

// POST /api/data/jobs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, sourceType, sourcePath, operations, outputPath, outputFormat, schedule } = body

    const job = await db.dataJob.create({
      data: {
        name,
        sourceType,
        sourcePath,
        operations,
        outputPath,
        outputFormat,
        schedule,
        status: 'active'
      }
    })

    await db.log.create({
      data: {
        level: 'info',
        message: `تم إنشاء مهمة معالجة: ${name}`
      }
    })

    return NextResponse.json(job)
  } catch (error) {
    return NextResponse.json({ error: 'Error creating job' }, { status: 500 })
  }
}
