#!/usr/bin/env python3
"""
وحدة استخراج البيانات من الويب
Web Scraping Module

هذه الوحدة مسؤولة عن:
- جمع بيانات من مواقع الإنترنت
- دعم جدولة دورية للتحديث
- معالجة الحالات الخاصة
"""

import re
import json
import logging
import time
from datetime import datetime
from typing import Dict, List, Optional, Any
from urllib.parse import urljoin, urlparse

try:
    from bs4 import BeautifulSoup
    BS4_AVAILABLE = True
except ImportError:
    BS4_AVAILABLE = False

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

logger = logging.getLogger(__name__)


class WebScraper:
    """
    فئة استخراج البيانات من الويب
    """
    
    USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    
    def __init__(self, config: Dict):
        """
        تهيئة مستخرج البيانات
        
        Args:
            config: إعدادات الاستخراج
        """
        self.config = config
        self.url = config.get('url', '')
        self.selector = config.get('selector', '')
        self.extract_type = config.get('extractType', 'text')
        self.use_selenium = config.get('useSelenium', False)
        self.wait_time = config.get('waitTime', 10)
        self.headers = config.get('headers', {
            'User-Agent': self.USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
        })
        
        logger.info(f"WebScraper initialized - URL: {self.url}")
    
    def scrape(self) -> Dict:
        """
        تنفيذ عملية الاستخراج
        
        Returns:
            Dict: نتائج الاستخراج
        """
        results = {
            'success': True,
            'url': self.url,
            'extract_type': self.extract_type,
            'timestamp': datetime.now().isoformat(),
            'data': [],
            'errors': [],
            'metadata': {}
        }
        
        try:
            # التحقق من الرابط
            if not self._validate_url(self.url):
                results['success'] = False
                results['errors'].append('Invalid URL')
                return results
            
            # التحقق من الرابط
            link_status = self._check_link(self.url)
            results['metadata']['link_status'] = link_status
            
            if link_status['broken']:
                results['success'] = False
                results['errors'].append(f"Broken link: {link_status['status_code']}")
                return results
            
            # استخراج البيانات
            if self.use_selenium and SELENIUM_AVAILABLE:
                html = self._fetch_with_selenium()
            else:
                html = self._fetch_with_requests()
            
            if html:
                results['data'] = self._extract_data(html)
                results['metadata']['items_found'] = len(results['data'])
            else:
                results['success'] = False
                results['errors'].append('Failed to fetch page content')
                
        except Exception as e:
            results['success'] = False
            results['errors'].append(str(e))
            logger.error(f"Scraping error: {e}")
        
        return results
    
    def _validate_url(self, url: str) -> bool:
        """
        التحقق من صحة الرابط
        
        Args:
            url: الرابط
            
        Returns:
            bool: صحة الرابط
        """
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc])
        except:
            return False
    
    def _check_link(self, url: str) -> Dict:
        """
        التحقق من حالة الرابط
        
        Args:
            url: الرابط
            
        Returns:
            Dict: حالة الرابط
        """
        if not REQUESTS_AVAILABLE:
            return {'broken': False, 'status_code': None, 'message': 'Requests not available'}
        
        try:
            response = requests.head(url, headers=self.headers, timeout=10, allow_redirects=True)
            return {
                'broken': response.status_code >= 400,
                'status_code': response.status_code,
                'message': 'OK' if response.status_code < 400 else 'Error'
            }
        except Exception as e:
            return {
                'broken': True,
                'status_code': None,
                'message': str(e)
            }
    
    def _fetch_with_requests(self) -> Optional[str]:
        """
        جلب الصفحة باستخدام requests
        
        Returns:
            Optional[str]: محتوى HTML
        """
        if not REQUESTS_AVAILABLE:
            logger.error("Requests library not available")
            return None
        
        try:
            response = requests.get(self.url, headers=self.headers, timeout=30)
            response.raise_for_status()
            return response.text
        except Exception as e:
            logger.error(f"Requests fetch error: {e}")
            return None
    
    def _fetch_with_selenium(self) -> Optional[str]:
        """
        جلب الصفحة باستخدام Selenium
        
        Returns:
            Optional[str]: محتوى HTML
        """
        if not SELENIUM_AVAILABLE:
            logger.error("Selenium library not available")
            return None
        
        driver = None
        try:
            options = Options()
            options.add_argument('--headless')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument(f'--user-agent={self.USER_AGENT}')
            
            driver = webdriver.Chrome(options=options)
            driver.get(self.url)
            
            # انتظار تحميل الصفحة
            time.sleep(2)
            
            # انتظار عنصر محدد
            if self.selector:
                try:
                    WebDriverWait(driver, self.wait_time).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, self.selector))
                    )
                except:
                    pass
            
            return driver.page_source
            
        except Exception as e:
            logger.error(f"Selenium fetch error: {e}")
            return None
        finally:
            if driver:
                driver.quit()
    
    def _extract_data(self, html: str) -> List[Dict]:
        """
        استخراج البيانات من HTML
        
        Args:
            html: محتوى HTML
            
        Returns:
            List[Dict]: البيانات المستخرجة
        """
        if not BS4_AVAILABLE:
            logger.error("BeautifulSoup not available")
            return []
        
        soup = BeautifulSoup(html, 'html.parser')
        data = []
        
        if self.extract_type == 'text':
            data = self._extract_text(soup)
        elif self.extract_type == 'links':
            data = self._extract_links(soup)
        elif self.extract_type == 'images':
            data = self._extract_images(soup)
        elif self.extract_type == 'tables':
            data = self._extract_tables(soup)
        elif self.extract_type == 'custom':
            data = self._extract_custom(soup)
        
        return data
    
    def _extract_text(self, soup: BeautifulSoup) -> List[Dict]:
        """
        استخراج النصوص
        """
        elements = soup.select(self.selector) if self.selector else soup.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div'])
        
        return [
            {
                'type': 'text',
                'content': el.get_text(strip=True),
                'tag': el.name,
                'class': el.get('class', [])
            }
            for el in elements
            if el.get_text(strip=True)
        ]
    
    def _extract_links(self, soup: BeautifulSoup) -> List[Dict]:
        """
        استخراج الروابط
        """
        elements = soup.select(self.selector) if self.selector else soup.find_all('a', href=True)
        
        links = []
        for el in elements:
            href = el.get('href', '')
            if href:
                links.append({
                    'type': 'link',
                    'text': el.get_text(strip=True),
                    'url': urljoin(self.url, href),
                    'is_external': urlparse(href).netloc != urlparse(self.url).netloc if href.startswith('http') else False
                })
        
        return links
    
    def _extract_images(self, soup: BeautifulSoup) -> List[Dict]:
        """
        استخراج الصور
        """
        elements = soup.select(self.selector) if self.selector else soup.find_all('img')
        
        return [
            {
                'type': 'image',
                'src': urljoin(self.url, el.get('src', '')),
                'alt': el.get('alt', ''),
                'title': el.get('title', '')
            }
            for el in elements
            if el.get('src')
        ]
    
    def _extract_tables(self, soup: BeautifulSoup) -> List[Dict]:
        """
        استخراج الجداول
        """
        tables = soup.select(self.selector) if self.selector else soup.find_all('table')
        
        result = []
        for idx, table in enumerate(tables):
            rows = []
            for tr in table.find_all('tr'):
                cells = [td.get_text(strip=True) for td in tr.find_all(['td', 'th'])]
                if cells:
                    rows.append(cells)
            
            if rows:
                result.append({
                    'type': 'table',
                    'index': idx,
                    'headers': rows[0] if rows else [],
                    'rows': rows[1:] if len(rows) > 1 else []
                })
        
        return result
    
    def _extract_custom(self, soup: BeautifulSoup) -> List[Dict]:
        """
        استخراج مخصص
        """
        if not self.selector:
            return []
        
        elements = soup.select(self.selector)
        
        return [
            {
                'type': 'custom',
                'html': str(el),
                'text': el.get_text(strip=True),
                'attributes': dict(el.attrs)
            }
            for el in elements
        ]


def scrape_web(config: Dict) -> Dict:
    """
    دالة استخراج البيانات - نقطة الدخول الرئيسية
    
    Args:
        config: إعدادات الاستخراج
        
    Returns:
        Dict: نتائج الاستخراج
    """
    scraper = WebScraper(config)
    return scraper.scrape()


if __name__ == '__main__':
    # اختبار الوحدة
    test_config = {
        'url': 'https://example.com',
        'selector': 'p',
        'extractType': 'text',
        'useSelenium': False
    }
    
    results = scrape_web(test_config)
    print(f"Results: {json.dumps(results, indent=2, ensure_ascii=False)}")
