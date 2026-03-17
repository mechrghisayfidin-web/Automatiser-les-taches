#!/usr/bin/env python3
"""
أدوات النظام المساعدة
System Utilities

هذه الوحدة تحتوي على:
- نظام التسجيل المتقدم
- نظام الجدولة
- أدوات مساعدة أخرى
"""

import os
import json
import logging
import schedule
import time
from datetime import datetime
from typing import Dict, Callable, Optional
from logging.handlers import RotatingFileHandler


class AutomationLogger:
    """
    نظام تسجيل متقدم للمهام المؤتمتة
    """
    
    _instance = None
    
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self, log_dir: str = 'logs', max_bytes: int = 10485760, backup_count: int = 5):
        """
        تهيئة نظام التسجيل
        
        Args:
            log_dir: مجلد السجلات
            max_bytes: الحجم الأقصى للملف (10MB افتراضياً)
            backup_count: عدد النسخ الاحتياطية
        """
        if hasattr(self, '_initialized') and self._initialized:
            return
        
        self.log_dir = log_dir
        os.makedirs(log_dir, exist_ok=True)
        
        # إعداد التسجيل
        self.logger = logging.getLogger('automation')
        self.logger.setLevel(logging.DEBUG)
        
        # تنسيق السجل
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # معالج الملف
        file_handler = RotatingFileHandler(
            os.path.join(log_dir, 'automation.log'),
            maxBytes=max_bytes,
            backupCount=backup_count,
            encoding='utf-8'
        )
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(formatter)
        
        # معالج الطباعة
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(formatter)
        
        # إضافة المعالجات
        if not self.logger.handlers:
            self.logger.addHandler(file_handler)
            self.logger.addHandler(console_handler)
        
        self._initialized = True
    
    def info(self, message: str, extra: Dict = None):
        """تسجيل معلومات"""
        self.logger.info(message, extra=extra)
    
    def warning(self, message: str, extra: Dict = None):
        """تسجيل تحذير"""
        self.logger.warning(message, extra=extra)
    
    def error(self, message: str, extra: Dict = None):
        """تسجيل خطأ"""
        self.logger.error(message, extra=extra)
    
    def debug(self, message: str, extra: Dict = None):
        """تسجيل تصحيح"""
        self.logger.debug(message, extra=extra)
    
    def task_start(self, task_id: str, task_name: str):
        """تسجيل بدء مهمة"""
        self.info(f"بدء المهمة [{task_id}]: {task_name}")
    
    def task_complete(self, task_id: str, task_name: str, duration: float = None):
        """تسجيل إكمال مهمة"""
        duration_msg = f" (المدة: {duration:.2f} ثانية)" if duration else ""
        self.info(f"إكمال المهمة [{task_id}]: {task_name}{duration_msg}")
    
    def task_error(self, task_id: str, task_name: str, error: str):
        """تسجيل خطأ في مهمة"""
        self.error(f"خطأ في المهمة [{task_id}]: {task_name} - {error}")


class TaskScheduler:
    """
    نظام جدولة المهام
    """
    
    def __init__(self):
        """تهيئة نظام الجدولة"""
        self.jobs: Dict[str, schedule.Job] = {}
        self.logger = AutomationLogger()
    
    def add_job(self, job_id: str, func: Callable, schedule_expr: str):
        """
        إضافة مهمة مجدولة
        
        Args:
            job_id: معرف المهمة
            func: الدالة المراد تنفيذها
            schedule_expr: تعبير الجدولة (cron format)
        """
        # تحليل تعبير cron البسيط
        # Format: minute hour day month weekday
        parts = schedule_expr.split()
        
        if len(parts) != 5:
            raise ValueError(f"Invalid cron expression: {schedule_expr}")
        
        minute, hour, day, month, weekday = parts
        
        # إنشاء المهمة المجدولة
        job = schedule.every()
        
        # تطبيق الجدولة
        if minute == '*' and hour == '*':
            job = job.minute
        elif hour != '*':
            if minute != '*':
                job = job.day.at(f"{hour.zfill(2)}:{minute.zfill(2)}")
            else:
                job = every().hour.at(f":{minute.zfill(2)}")
        else:
            job = job.minute
        
        job.do(func)
        self.jobs[job_id] = job
        self.logger.info(f"تمت إضافة مهمة مجدولة: {job_id}")
    
    def remove_job(self, job_id: str):
        """إزالة مهمة مجدولة"""
        if job_id in self.jobs:
            schedule.cancel_job(self.jobs[job_id])
            del self.jobs[job_id]
            self.logger.info(f"تمت إزالة المهمة: {job_id}")
    
    def run_pending(self):
        """تنفيذ المهام المعلقة"""
        schedule.run_pending()
    
    def run_continuously(self, interval: int = 1):
        """
        تشغيل المجدول بشكل مستمر
        
        Args:
            interval: الفاصل الزمني بالثواني
        """
        while True:
            self.run_pending()
            time.sleep(interval)


class ConfigManager:
    """
    مدير الإعدادات
    """
    
    def __init__(self, config_file: str = 'config.json'):
        """
        تهيئة مدير الإعدادات
        
        Args:
            config_file: ملف الإعدادات
        """
        self.config_file = config_file
        self.config: Dict = {}
        self.load()
    
    def load(self):
        """تحميل الإعدادات من الملف"""
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    self.config = json.load(f)
            except Exception as e:
                logging.error(f"Error loading config: {e}")
                self.config = {}
    
    def save(self):
        """حفظ الإعدادات إلى الملف"""
        try:
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logging.error(f"Error saving config: {e}")
    
    def get(self, key: str, default: any = None) -> any:
        """الحصول على قيمة إعداد"""
        return self.config.get(key, default)
    
    def set(self, key: str, value: any):
        """تعيين قيمة إعداد"""
        self.config[key] = value
        self.save()
    
    def get_all(self) -> Dict:
        """الحصول على جميع الإعدادات"""
        return self.config.copy()


# إنشاء مثيلات افتراضية
default_logger = AutomationLogger()
default_scheduler = TaskScheduler()
default_config = ConfigManager()


if __name__ == '__main__':
    # اختبار الوحدة
    logger = AutomationLogger()
    
    logger.info("اختبار نظام التسجيل")
    logger.warning("تحذير تجريبي")
    logger.error("خطأ تجريبي")
    
    print("تم اختبار نظام التسجيل بنجاح")
