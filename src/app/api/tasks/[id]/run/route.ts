import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { spawn } from 'child_process'
import path from 'path'

// POST /api/tasks/[id]/run - Run a task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get the task
    const task = await db.task.findUnique({ where: { id } })
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    
    // Update task status to running
    await db.task.update({
      where: { id },
      data: { status: 'running', lastRun: new Date() }
    })
    
    // Log task start
    await db.log.create({
      data: {
        taskId: id,
        level: 'info',
        message: `بدء تنفيذ المهمة: ${task.name}`
      }
    })
    
    // Run the Python script based on task type
    const scriptPath = path.join(process.cwd(), 'python_scripts', 'main.py')
    const result = await runPythonScript(scriptPath, {
      taskId: id,
      taskType: task.type,
      config: JSON.parse(task.config)
    })
    
    // Update task status based on result
    const status = result.success ? 'completed' : 'failed'
    await db.task.update({
      where: { id },
      data: { status }
    })
    
    // Log result
    await db.log.create({
      data: {
        taskId: id,
        level: result.success ? 'info' : 'error',
        message: result.success 
          ? `تم تنفيذ المهمة بنجاح: ${task.name}`
          : `فشل تنفيذ المهمة: ${task.name}`,
        details: result.output
      }
    })
    
    return NextResponse.json({ 
      success: result.success, 
      output: result.output,
      status 
    })
  } catch (error) {
    console.error('Error running task:', error)
    
    // Update task status to failed
    await db.task.update({
      where: { id: (await params).id },
      data: { status: 'failed' }
    })
    
    return NextResponse.json({ 
      error: 'Error running task',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to run Python scripts
async function runPythonScript(scriptPath: string, args: any): Promise<{ success: boolean; output: string }> {
  return new Promise((resolve) => {
    const process = spawn('python3', [scriptPath, JSON.stringify(args)])
    
    let stdout = ''
    let stderr = ''
    
    process.stdout.on('data', (data) => {
      stdout += data.toString()
    })
    
    process.stderr.on('data', (data) => {
      stderr += data.toString()
    })
    
    process.on('close', (code) => {
      resolve({
        success: code === 0,
        output: stdout || stderr
      })
    })
    
    process.on('error', (error) => {
      resolve({
        success: false,
        output: `Error executing script: ${error.message}`
      })
    })
  })
}
