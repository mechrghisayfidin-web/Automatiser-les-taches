import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/email/jobs
export async function GET() {
  try {
    const jobs = await db.emailJob.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(jobs)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching jobs' }, { status: 500 })
  }
}

// POST /api/email/jobs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, recipients, subject, body: emailBody, attachments, schedule, condition } = body

    const job = await db.emailJob.create({
      data: {
        name,
        recipients,
        subject,
        body: emailBody,
        attachments,
        schedule,
        condition,
        status: 'active'
      }
    })

    await db.log.create({
      data: {
        level: 'info',
        message: `تم إنشاء وظيفة بريد: ${name}`
      }
    })

    return NextResponse.json(job)
  } catch (error) {
    return NextResponse.json({ error: 'Error creating job' }, { status: 500 })
  }
}
