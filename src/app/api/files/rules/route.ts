import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/files/rules - Get all file rules
export async function GET() {
  try {
    const rules = await db.fileRule.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(rules)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching rules' }, { status: 500 })
  }
}

// POST /api/files/rules - Create a new file rule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, sourceFolder, targetFolder, filePattern, namingRule, action } = body

    const rule = await db.fileRule.create({
      data: {
        name,
        sourceFolder,
        targetFolder,
        filePattern,
        namingRule,
        action,
        isActive: true
      }
    })

    await db.log.create({
      data: {
        level: 'info',
        message: `تم إنشاء قاعدة تنظيم: ${name}`
      }
    })

    return NextResponse.json(rule)
  } catch (error) {
    return NextResponse.json({ error: 'Error creating rule' }, { status: 500 })
  }
}
