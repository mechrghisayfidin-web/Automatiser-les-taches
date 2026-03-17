#!/usr/bin/env python3
"""
مساعد الأتمتة الذكي - الملف الرئيسي
Smart Automation Assistant - Main Entry Point

هذا الملف يعمل كنقطة دخول رئيسية لجميع مهام الأتمتة.
"""

import sys
import json
import logging
from datetime import datetime
from pathlib import Path

# إعداد التسجيل
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('automation.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

def main():
    """
    نقطة الدخول الرئيسية للبرنامج
    """
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'No arguments provided'
        }))
        return

    try:
        # تحليل المعاملات
        args = json.loads(sys.argv[1])
        task_type = args.get('taskType')
        task_id = args.get('taskId')
        config = args.get('config', {})

        logger.info(f"Starting task: {task_type} (ID: {task_id})")

        # تنفيذ المهمة بناءً على النوع
        result = execute_task(task_type, config)

        print(json.dumps({
            'success': True,
            'task_id': task_id,
            'task_type': task_type,
            'result': result,
            'timestamp': datetime.now().isoformat()
        }))

    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {e}")
        print(json.dumps({
            'success': False,
            'error': f'Invalid JSON: {str(e)}'
        }))
    except Exception as e:
        logger.error(f"Error executing task: {e}")
        print(json.dumps({
            'success': False,
            'error': str(e)
        }))

def execute_task(task_type: str, config: dict) -> dict:
    """
    تنفيذ المهمة بناءً على نوعها
    
    Args:
        task_type: نوع المهمة
        config: إعدادات المهمة
        
    Returns:
        dict: نتيجة التنفيذ
    """
    if task_type == 'file_organization':
        from file_organizers.organizer import organize_files
        return organize_files(config)
    
    elif task_type == 'data_processing':
        from data_processors.processor import process_data
        return process_data(config)
    
    elif task_type == 'web_scraping':
        from scrapers.scraper import scrape_web
        return scrape_web(config)
    
    elif task_type == 'email_automation':
        from email_automation.sender import send_emails
        return send_emails(config)
    
    else:
        raise ValueError(f"Unknown task type: {task_type}")

if __name__ == '__main__':
    main()
