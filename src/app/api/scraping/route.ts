import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/scraping - Get all scraping jobs
export async function GET() {
  try {
    const jobs = await db.scrapingJob.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Error fetching scraping jobs:', error)
    return NextResponse.json({ error: 'Error fetching scraping jobs' }, { status: 500 })
  }
}

// POST /api/scraping - Create a new scraping job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, url, selector, extractType, schedule } = body

    const job = await db.scrapingJob.create({
      data: {
        name,
        url,
        selector,
        extractType,
        schedule,
        status: 'active'
      }
    })

    await db.log.create({
      data: {
        level: 'info',
        message: `تم إنشاء وظيفة استخراج: ${name}`
      }
    })

    return NextResponse.json(job)
  } catch (error) {
    console.error('Error creating scraping job:', error)
    return NextResponse.json({ error: 'Error creating scraping job' }, { status: 500 })
  }
}
