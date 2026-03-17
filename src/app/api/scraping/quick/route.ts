import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

// POST /api/scraping/quick - Quick scrape without saving
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, selector } = body

    const scriptPath = path.join(process.cwd(), 'python_scripts', 'scrapers', 'quick_scrape.py')
    const result = await runPythonScript(scriptPath, { url, selector })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error quick scraping:', error)
    return NextResponse.json({ error: 'Error quick scraping' }, { status: 500 })
  }
}

async function runPythonScript(scriptPath: string, args: any): Promise<any> {
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
      if (code === 0) {
        try {
          resolve(JSON.parse(stdout))
        } catch {
          resolve({ success: true, data: stdout })
        }
      } else {
        resolve({ success: false, error: stderr || stdout })
      }
    })
    
    process.on('error', () => {
      resolve({ success: false, error: 'Failed to execute script' })
    })
  })
}
