#!/usr/bin/env python3
"""
وحدة تنظيم الملفات التلقائي
File Organization Module

هذه الوحدة مسؤولة عن:
- ترتيب المجلدات تلقائياً
- تسمية الملفات بناءً على محتواها أو تاريخها
- نقل الملفات إلى أرشيفات محددة
"""

import os
import re
import shutil
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

class FileOrganizer:
    """
    فئة تنظيم الملفات التلقائي
    """
    
    # تصنيفات الملفات الافتراضية
    FILE_CATEGORIES = {
        'images': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.ico'],
        'documents': ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt', '.xls', '.xlsx', '.ppt', '.pptx'],
        'videos': ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm'],
        'audio': ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a'],
        'archives': ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
        'code': ['.py', '.js', '.html', '.css', '.java', '.cpp', '.c', '.php', '.rb', '.go'],
        'data': ['.csv', '.json', '.xml', '.yaml', '.yml', '.sql', '.db']
    }
    
    def __init__(self, config: Dict):
        """
        تهيئة منظم الملفات
        
        Args:
            config: إعدادات التنظيم
        """
        self.config = config
        self.source_folder = config.get('sourceFolder', '')
        self.target_folder = config.get('targetFolder', '')
        self.file_pattern = config.get('filePattern', '.*')
        self.naming_rule = config.get('namingRule', '{original}')
        self.action = config.get('action', 'move')
        self.dry_run = config.get('dryRun', False)
        
        logger.info(f"FileOrganizer initialized - Source: {self.source_folder}, Target: {self.target_folder}")
    
    def organize(self) -> Dict:
        """
        تنفيذ عملية التنظيم
        
        Returns:
            Dict: نتائج التنظيم
        """
        results = {
            'processed': 0,
            'moved': 0,
            'copied': 0,
            'renamed': 0,
            'errors': [],
            'files': []
        }
        
        if not os.path.exists(self.source_folder):
            results['errors'].append(f"Source folder does not exist: {self.source_folder}")
            return results
        
        try:
            pattern = re.compile(self.file_pattern)
        except re.error as e:
            results['errors'].append(f"Invalid regex pattern: {e}")
            return results
        
        # التكرار على الملفات
        for root, _, files in os.walk(self.source_folder):
            for filename in files:
                filepath = os.path.join(root, filename)
                
                try:
                    # التحقق من النمط
                    if not pattern.search(filename):
                        continue
                    
                    results['processed'] += 1
                    
                    # تطبيق الإجراء
                    file_result = self._process_file(filepath, filename)
                    results['files'].append(file_result)
                    
                    if file_result['action'] == 'moved':
                        results['moved'] += 1
                    elif file_result['action'] == 'copied':
                        results['copied'] += 1
                    elif file_result['action'] == 'renamed':
                        results['renamed'] += 1
                        
                except Exception as e:
                    error_msg = f"Error processing {filename}: {str(e)}"
                    logger.error(error_msg)
                    results['errors'].append(error_msg)
        
        return results
    
    def _process_file(self, filepath: str, filename: str) -> Dict:
        """
        معالجة ملف واحد
        
        Args:
            filepath: مسار الملف
            filename: اسم الملف
            
        Returns:
            Dict: نتيجة المعالجة
        """
        result = {
            'original_path': filepath,
            'original_name': filename,
            'action': None,
            'new_path': None,
            'new_name': None
        }
        
        # تحديد الاسم الجديد
        new_name = self._generate_new_name(filename)
        
        # تحديد المسار الهدف
        if self.target_folder:
            # تصنيف الملف
            category = self._get_file_category(filename)
            target_dir = os.path.join(self.target_folder, category)
        else:
            target_dir = os.path.dirname(filepath)
        
        # إنشاء المجلد الهدف إذا لم يكن موجوداً
        if not self.dry_run:
            os.makedirs(target_dir, exist_ok=True)
        
        new_path = os.path.join(target_dir, new_name)
        
        # تنفيذ الإجراء
        if self.action == 'move':
            if not self.dry_run:
                shutil.move(filepath, new_path)
            result['action'] = 'moved'
        elif self.action == 'copy':
            if not self.dry_run:
                shutil.copy2(filepath, new_path)
            result['action'] = 'copied'
        elif self.action == 'rename':
            new_path = os.path.join(os.path.dirname(filepath), new_name)
            if not self.dry_run:
                os.rename(filepath, new_path)
            result['action'] = 'renamed'
        elif self.action == 'archive':
            archive_name = f"archive_{datetime.now().strftime('%Y%m%d')}.zip"
            archive_path = os.path.join(self.target_folder, archive_name)
            if not self.dry_run:
                import zipfile
                with zipfile.ZipFile(archive_path, 'a') as zf:
                    zf.write(filepath, new_name)
            result['action'] = 'archived'
        
        result['new_path'] = new_path
        result['new_name'] = new_name
        
        logger.info(f"Processed: {filename} -> {new_name} ({result['action']})")
        return result
    
    def _generate_new_name(self, original_name: str) -> str:
        """
        توليد اسم جديد للملف بناءً على قاعدة التسمية
        
        Args:
            original_name: الاسم الأصلي
            
        Returns:
            str: الاسم الجديد
        """
        if not self.naming_rule:
            return original_name
        
        name, ext = os.path.splitext(original_name)
        now = datetime.now()
        
        replacements = {
            '{original}': original_name,
            '{name}': name,
            '{ext}': ext,
            '{date}': now.strftime('%Y-%m-%d'),
            '{time}': now.strftime('%H-%M-%S'),
            '{datetime}': now.strftime('%Y%m%d_%H%M%S'),
            '{year}': now.strftime('%Y'),
            '{month}': now.strftime('%m'),
            '{day}': now.strftime('%d')
        }
        
        new_name = self.naming_rule
        for key, value in replacements.items():
            new_name = new_name.replace(key, value)
        
        # إضافة الامتداد إذا لم يكن موجوداً
        if ext and not new_name.endswith(ext):
            new_name += ext
        
        return new_name
    
    def _get_file_category(self, filename: str) -> str:
        """
        تحديد تصنيف الملف بناءً على امتداده
        
        Args:
            filename: اسم الملف
            
        Returns:
            str: التصنيف
        """
        ext = os.path.splitext(filename)[1].lower()
        
        for category, extensions in self.FILE_CATEGORIES.items():
            if ext in extensions:
                return category
        
        return 'other'


def organize_files(config: Dict) -> Dict:
    """
    دالة تنظيم الملفات - نقطة الدخول الرئيسية
    
    Args:
        config: إعدادات التنظيم
        
    Returns:
        Dict: نتائج التنظيم
    """
    organizer = FileOrganizer(config)
    return organizer.organize()


if __name__ == '__main__':
    # اختبار الوحدة
    test_config = {
        'sourceFolder': './test_source',
        'targetFolder': './test_target',
        'filePattern': '.*',
        'namingRule': '{date}_{original}',
        'action': 'move',
        'dryRun': True
    }
    
    results = organize_files(test_config)
    print(f"Results: {results}")
