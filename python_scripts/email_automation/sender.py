#!/usr/bin/env python3
"""
وحدة أتمتة البريد الإلكتروني
Email Automation Module

هذه الوحدة مسؤولة عن:
- إرسال تقارير تلقائية عبر البريد الإلكتروني
- تخصيص الرسائل بناءً على النتائج
- دعم مرفقات وتقارير PDF/Excel
"""

import os
import json
import logging
import smtplib
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)


class EmailSender:
    """
    فئة إرسال البريد الإلكتروني
    """
    
    def __init__(self, config: Dict):
        """
        تهيئة مرسل البريد الإلكتروني
        
        Args:
            config: إعدادات الإرسال
        """
        self.config = config
        self.smtp_server = config.get('smtpServer', os.getenv('SMTP_SERVER', 'smtp.gmail.com'))
        self.smtp_port = config.get('smtpPort', int(os.getenv('SMTP_PORT', '587')))
        self.smtp_username = config.get('smtpUsername', os.getenv('SMTP_USERNAME', ''))
        self.smtp_password = config.get('smtpPassword', os.getenv('SMTP_PASSWORD', ''))
        self.use_tls = config.get('useTLS', True)
        
        self.recipients = config.get('recipients', '').split(',') if isinstance(config.get('recipients'), str) else config.get('recipients', [])
        self.subject = config.get('subject', 'تقرير تلقائي')
        self.body = config.get('body', '')
        self.attachments = config.get('attachments', '').split(',') if isinstance(config.get('attachments'), str) else config.get('attachments', [])
        self.condition = config.get('condition')
        
        # تنظيف قائمة المستلمين
        self.recipients = [r.strip() for r in self.recipients if r.strip()]
        self.attachments = [a.strip() for a in self.attachments if a.strip()]
        
        logger.info(f"EmailSender initialized - Recipients: {len(self.recipients)}")
    
    def send(self) -> Dict:
        """
        إرسال البريد الإلكتروني
        
        Returns:
            Dict: نتيجة الإرسال
        """
        results = {
            'success': True,
            'recipients': self.recipients,
            'subject': self.subject,
            'timestamp': datetime.now().isoformat(),
            'attachments_sent': [],
            'errors': []
        }
        
        # التحقق من الشرط
        if self.condition and not self._check_condition():
            results['success'] = False
            results['errors'].append('Condition not met')
            return results
        
        # التحقق من وجود مستلمين
        if not self.recipients:
            results['success'] = False
            results['errors'].append('No recipients specified')
            return results
        
        try:
            # إنشاء الرسالة
            msg = self._create_message()
            
            # إضافة المرفقات
            for attachment_path in self.attachments:
                try:
                    self._add_attachment(msg, attachment_path)
                    results['attachments_sent'].append(attachment_path)
                except Exception as e:
                    error_msg = f"Failed to attach {attachment_path}: {str(e)}"
                    logger.error(error_msg)
                    results['errors'].append(error_msg)
            
            # إرسال البريد
            self._send_email(msg)
            
            logger.info(f"Email sent successfully to {len(self.recipients)} recipients")
            
        except Exception as e:
            results['success'] = False
            results['errors'].append(str(e))
            logger.error(f"Email sending error: {e}")
        
        return results
    
    def _check_condition(self) -> bool:
        """
        التحقق من الشرط المحدد
        
        Returns:
            bool: نتيجة الشرط
        """
        if not self.condition:
            return True
        
        try:
            # تقييم الشرط البسيط
            # مثال: "data.value > 100"
            # يمكن توسيع هذه الوظيفة لدعم شروط معقدة
            
            # للتبسيط، نفترض أن الشرط صحيح دائماً
            # في التطبيق الحقيقي، يمكن استخدام eval() مع حماية
            return True
            
        except Exception as e:
            logger.error(f"Condition check error: {e}")
            return False
    
    def _create_message(self) -> MIMEMultipart:
        """
        إنشاء رسالة البريد الإلكتروني
        
        Returns:
            MIMEMultipart: الرسالة
        """
        msg = MIMEMultipart()
        msg['From'] = self.smtp_username
        msg['To'] = ', '.join(self.recipients)
        msg['Subject'] = self.subject
        
        # تحديد نوع المحتوى
        if self._contains_html(self.body):
            msg.attach(MIMEText(self.body, 'html', 'utf-8'))
        else:
            msg.attach(MIMEText(self.body, 'plain', 'utf-8'))
        
        return msg
    
    def _contains_html(self, text: str) -> bool:
        """
        التحقق مما إذا كان النص يحتوي على HTML
        
        Args:
            text: النص
            
        Returns:
            bool: يحتوي على HTML
        """
        html_tags = ['<html', '<body', '<div', '<p>', '<br', '<h1', '<h2', '<table']
        return any(tag in text.lower() for tag in html_tags)
    
    def _add_attachment(self, msg: MIMEMultipart, filepath: str):
        """
        إضافة مرفق إلى الرسالة
        
        Args:
            msg: الرسالة
            filepath: مسار الملف
        """
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Attachment not found: {filepath}")
        
        with open(filepath, 'rb') as f:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(f.read())
            encoders.encode_base64(part)
            
            filename = os.path.basename(filepath)
            part.add_header(
                'Content-Disposition',
                f'attachment; filename= "{filename}"'
            )
            msg.attach(part)
        
        logger.info(f"Attachment added: {filepath}")
    
    def _send_email(self, msg: MIMEMultipart):
        """
        إرسال البريد الإلكتروني عبر SMTP
        
        Args:
            msg: الرسالة
        """
        if self.use_tls:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                if self.smtp_username and self.smtp_password:
                    server.login(self.smtp_username, self.smtp_password)
                server.sendmail(self.smtp_username, self.recipients, msg.as_string())
        else:
            with smtplib.SMTP_SSL(self.smtp_server, self.smtp_port) as server:
                if self.smtp_username and self.smtp_password:
                    server.login(self.smtp_username, self.smtp_password)
                server.sendmail(self.smtp_username, self.recipients, msg.as_string())


class EmailTemplate:
    """
    فئة قوالب البريد الإلكتروني
    """
    
    @staticmethod
    def report_template(title: str, data: Dict) -> str:
        """
        إنشاء قالب تقرير
        
        Args:
            title: عنوان التقرير
            data: بيانات التقرير
            
        Returns:
            str: محتوى HTML
        """
        return f"""
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, sans-serif; direction: rtl; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; }}
                .content {{ background: #f9f9f9; padding: 20px; border-radius: 10px; margin-top: 20px; }}
                .footer {{ text-align: center; color: #666; margin-top: 20px; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>{title}</h1>
                    <p>تم إنشاء هذا التقرير تلقائياً في {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                </div>
                <div class="content">
                    {EmailTemplate._format_data(data)}
                </div>
                <div class="footer">
                    <p>مساعد الأتمتة الذكي - جميع الحقوق محفوظة</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    @staticmethod
    def _format_data(data: Dict) -> str:
        """
        تنسيق البيانات للعرض
        
        Args:
            data: البيانات
            
        Returns:
            str: HTML منسق
        """
        html = '<table style="width: 100%; border-collapse: collapse;">'
        
        for key, value in data.items():
            html += f'''
            <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; font-weight: bold;">{key}</td>
                <td style="padding: 10px;">{value}</td>
            </tr>
            '''
        
        html += '</table>'
        return html
    
    @staticmethod
    def alert_template(alert_type: str, message: str, details: Dict = None) -> str:
        """
        إنشاء قالب تنبيه
        
        Args:
            alert_type: نوع التنبيه
            message: رسالة التنبيه
            details: تفاصيل إضافية
            
        Returns:
            str: محتوى HTML
        """
        colors = {
            'info': '#3498db',
            'warning': '#f39c12',
            'error': '#e74c3c',
            'success': '#27ae60'
        }
        
        color = colors.get(alert_type, '#333')
        
        return f"""
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, sans-serif; direction: rtl; }}
                .alert {{ background: {color}; color: white; padding: 20px; border-radius: 10px; }}
                .details {{ background: #f9f9f9; padding: 15px; border-radius: 10px; margin-top: 15px; }}
            </style>
        </head>
        <body>
            <div class="alert">
                <h2>⚠️ تنبيه: {alert_type.upper()}</h2>
                <p>{message}</p>
            </div>
            {f'<div class="details"><pre>{json.dumps(details, indent=2, ensure_ascii=False)}</pre></div>' if details else ''}
        </body>
        </html>
        """


def send_emails(config: Dict) -> Dict:
    """
    دالة إرسال البريد الإلكتروني - نقطة الدخول الرئيسية
    
    Args:
        config: إعدادات الإرسال
        
    Returns:
        Dict: نتائج الإرسال
    """
    sender = EmailSender(config)
    return sender.send()


if __name__ == '__main__':
    # اختبار الوحدة
    test_config = {
        'recipients': 'test@example.com',
        'subject': 'تقرير اختباري',
        'body': 'هذا بريد اختباري من مساعد الأتمتة الذكي.',
        'attachments': ''
    }
    
    results = send_emails(test_config)
    print(f"Results: {json.dumps(results, indent=2, ensure_ascii=False)}")
