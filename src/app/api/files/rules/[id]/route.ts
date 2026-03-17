import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PATCH /api/files/rules/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const rule = await db.fileRule.update({
      where: { id },
      data: body
    })
    return NextResponse.json(rule)
  } catch (error) {
    return NextResponse.json({ error: 'Error updating rule' }, { status: 500 })
  }
}

// DELETE /api/files/rules/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.fileRule.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting rule' }, { status: 500 })
  }
}
