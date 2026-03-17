#!/usr/bin/env python3
"""
أدوات مساعدة لاستخراج البيانات من الويب
Quick Scraper Utility
"""

import sys
import json
from scrapers.scraper import scrape_web

def main():
    """نقطة الدخول للاستخراج السريع"""
    if len(sys.argv) < 2:
        print(json.dumps({'success': False, 'error': 'No arguments provided'}))
        return
    
    try:
        args = json.loads(sys.argv[1])
        result = scrape_web({
            'url': args.get('url', ''),
            'selector': args.get('selector', ''),
            'extractType': 'text'
        })
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))

if __name__ == '__main__':
    main()
