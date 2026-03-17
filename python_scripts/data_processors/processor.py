#!/usr/bin/env python3
"""
وحدة معالجة البيانات
Data Processing Module

هذه الوحدة مسؤولة عن:
- تنظيف وتحويل البيانات الخام
- توليد ملفات Excel أو CSV مع مخططات
- دعم تحليل بيانات متعددة المصادر
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional, Union

try:
    import pandas as pd
    import numpy as np
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False
    logging.warning("Pandas not available. Data processing features will be limited.")

logger = logging.getLogger(__name__)


class DataProcessor:
    """
    فئة معالجة البيانات
    """
    
    SUPPORTED_OPERATIONS = [
        'filter', 'sort', 'group', 'aggregate', 'transform',
        'merge', 'pivot', 'clean', 'fillna', 'dropna',
        'rename', 'select', 'calculate', 'validate'
    ]
    
    def __init__(self, config: Dict):
        """
        تهيئة معالج البيانات
        
        Args:
            config: إعدادات المعالجة
        """
        self.config = config
        self.source_type = config.get('sourceType', 'csv')
        self.source_path = config.get('sourcePath', '')
        self.operations = config.get('operations', [])
        self.output_path = config.get('outputPath', '')
        self.output_format = config.get('outputFormat', 'excel')
        
        logger.info(f"DataProcessor initialized - Source: {self.source_path}")
    
    def process(self) -> Dict:
        """
        تنفيذ عملية المعالجة
        
        Returns:
            Dict: نتائج المعالجة
        """
        results = {
            'success': True,
            'rows_processed': 0,
            'rows_output': 0,
            'operations_applied': [],
            'errors': [],
            'output_file': None,
            'preview': None
        }
        
        if not PANDAS_AVAILABLE:
            results['success'] = False
            results['errors'].append('Pandas library not available')
            return results
        
        try:
            # قراءة البيانات
            df = self._read_data()
            results['rows_processed'] = len(df)
            logger.info(f"Read {len(df)} rows from {self.source_type}")
            
            # تطبيق العمليات
            for operation in self.operations:
                try:
                    df = self._apply_operation(df, operation)
                    results['operations_applied'].append(operation.get('type'))
                    logger.info(f"Applied operation: {operation.get('type')}")
                except Exception as e:
                    error_msg = f"Error in operation {operation.get('type')}: {str(e)}"
                    logger.error(error_msg)
                    results['errors'].append(error_msg)
            
            results['rows_output'] = len(df)
            
            # حفظ النتائج
            if self.output_path:
                output_file = self._save_data(df)
                results['output_file'] = output_file
            
            # معاينة البيانات
            results['preview'] = df.head(10).to_dict(orient='records')
            results['columns'] = list(df.columns)
            results['statistics'] = self._get_statistics(df)
            
        except Exception as e:
            results['success'] = False
            results['errors'].append(str(e))
            logger.error(f"Processing error: {e}")
        
        return results
    
    def _read_data(self) -> pd.DataFrame:
        """
        قراءة البيانات من المصدر
        
        Returns:
            pd.DataFrame: البيانات المقروءة
        """
        if self.source_type == 'csv':
            return pd.read_csv(self.source_path, encoding='utf-8')
        
        elif self.source_type == 'excel':
            return pd.read_excel(self.source_path)
        
        elif self.source_type == 'json':
            return pd.read_json(self.source_path)
        
        elif self.source_type == 'api':
            import requests
            response = requests.get(self.source_path)
            data = response.json()
            
            if isinstance(data, list):
                return pd.DataFrame(data)
            elif isinstance(data, dict):
                # محاولة العثور على البيانات في الاستجابة
                for key in ['data', 'results', 'items', 'records']:
                    if key in data:
                        return pd.DataFrame(data[key])
                return pd.DataFrame([data])
        
        else:
            raise ValueError(f"Unsupported source type: {self.source_type}")
    
    def _apply_operation(self, df: pd.DataFrame, operation: Dict) -> pd.DataFrame:
        """
        تطبيق عملية على البيانات
        
        Args:
            df: البيانات
            operation: تفاصيل العملية
            
        Returns:
            pd.DataFrame: البيانات بعد العملية
        """
        op_type = operation.get('type')
        
        if op_type == 'filter':
            column = operation.get('column')
            operator = operation.get('operator')
            value = operation.get('value')
            
            if operator == '==':
                df = df[df[column] == value]
            elif operator == '!=':
                df = df[df[column] != value]
            elif operator == '>':
                df = df[df[column] > value]
            elif operator == '<':
                df = df[df[column] < value]
            elif operator == '>=':
                df = df[df[column] >= value]
            elif operator == '<=':
                df = df[df[column] <= value]
            elif operator == 'contains':
                df = df[df[column].astype(str).str.contains(value, case=False, na=False)]
            elif operator == 'in':
                df = df[df[column].isin(value if isinstance(value, list) else [value])]
        
        elif op_type == 'sort':
            columns = operation.get('columns', [])
            ascending = operation.get('ascending', True)
            df = df.sort_values(by=columns, ascending=ascending)
        
        elif op_type == 'group':
            by = operation.get('by', [])
            agg = operation.get('aggregation', 'count')
            df = df.groupby(by).agg(agg).reset_index()
        
        elif op_type == 'aggregate':
            column = operation.get('column')
            func = operation.get('function', 'sum')
            result = df[column].agg(func)
            df = pd.DataFrame({column: [result]})
        
        elif op_type == 'select':
            columns = operation.get('columns', [])
            df = df[columns]
        
        elif op_type == 'rename':
            columns = operation.get('columns', {})
            df = df.rename(columns=columns)
        
        elif op_type == 'dropna':
            subset = operation.get('subset')
            df = df.dropna(subset=subset if subset else None)
        
        elif op_type == 'fillna':
            value = operation.get('value', 0)
            columns = operation.get('columns')
            if columns:
                df[columns] = df[columns].fillna(value)
            else:
                df = df.fillna(value)
        
        elif op_type == 'calculate':
            new_column = operation.get('newColumn')
            formula = operation.get('formula')
            # تقييم الصيغة البسيطة
            df[new_column] = df.eval(formula)
        
        elif op_type == 'pivot':
            index = operation.get('index')
            columns = operation.get('columns')
            values = operation.get('values')
            aggfunc = operation.get('aggfunc', 'sum')
            df = df.pivot_table(index=index, columns=columns, values=values, aggfunc=aggfunc).reset_index()
        
        elif op_type == 'merge':
            other_path = operation.get('otherPath')
            on = operation.get('on', [])
            how = operation.get('how', 'inner')
            other_df = pd.read_csv(other_path) if other_path.endswith('.csv') else pd.read_excel(other_path)
            df = df.merge(other_df, on=on, how=how)
        
        elif op_type == 'clean':
            # تنظيف البيانات
            df = df.apply(lambda x: x.str.strip() if x.dtype == 'object' else x)
            df = df.replace(['', 'null', 'NULL', 'None', 'N/A'], np.nan)
        
        return df
    
    def _save_data(self, df: pd.DataFrame) -> str:
        """
        حفظ البيانات في الملف المحدد
        
        Args:
            df: البيانات
            
        Returns:
            str: مسار الملف المحفوظ
        """
        os.makedirs(os.path.dirname(self.output_path) if os.path.dirname(self.output_path) else '.', exist_ok=True)
        
        if self.output_format == 'excel':
            output_file = self.output_path if self.output_path.endswith('.xlsx') else f"{self.output_path}.xlsx"
            
            # إنشاء ملف Excel مع تنسيق
            with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Data', index=False)
                
                # إضافة تنسيق
                worksheet = writer.sheets['Data']
                for idx, col in enumerate(df.columns):
                    max_length = max(
                        df[col].astype(str).str.len().max(),
                        len(col)
                    ) + 2
                    worksheet.column_dimensions[chr(65 + idx)].width = min(max_length, 50)
        
        elif self.output_format == 'csv':
            output_file = self.output_path if self.output_path.endswith('.csv') else f"{self.output_path}.csv"
            df.to_csv(output_file, index=False, encoding='utf-8')
        
        elif self.output_format == 'json':
            output_file = self.output_path if self.output_path.endswith('.json') else f"{self.output_path}.json"
            df.to_json(output_file, orient='records', force_ascii=False, indent=2)
        
        else:
            raise ValueError(f"Unsupported output format: {self.output_format}")
        
        logger.info(f"Data saved to {output_file}")
        return output_file
    
    def _get_statistics(self, df: pd.DataFrame) -> Dict:
        """
        حساب إحصائيات البيانات
        
        Args:
            df: البيانات
            
        Returns:
            Dict: الإحصائيات
        """
        stats = {
            'total_rows': len(df),
            'total_columns': len(df.columns),
            'numeric_columns': len(df.select_dtypes(include=[np.number]).columns),
            'text_columns': len(df.select_dtypes(include=['object']).columns),
            'missing_values': int(df.isnull().sum().sum()),
            'duplicate_rows': int(df.duplicated().sum())
        }
        
        # إحصائيات الأعمدة الرقمية
        numeric_df = df.select_dtypes(include=[np.number])
        if not numeric_df.empty:
            stats['numeric_stats'] = numeric_df.describe().to_dict()
        
        return stats


def process_data(config: Dict) -> Dict:
    """
    دالة معالجة البيانات - نقطة الدخول الرئيسية
    
    Args:
        config: إعدادات المعالجة
        
    Returns:
        Dict: نتائج المعالجة
    """
    processor = DataProcessor(config)
    return processor.process()


if __name__ == '__main__':
    # اختبار الوحدة
    test_config = {
        'sourceType': 'csv',
        'sourcePath': './test_data.csv',
        'operations': [
            {'type': 'filter', 'column': 'price', 'operator': '>', 'value': 100},
            {'type': 'sort', 'columns': ['price'], 'ascending': False}
        ],
        'outputPath': './output/report',
        'outputFormat': 'excel'
    }
    
    results = process_data(test_config)
    print(f"Results: {json.dumps(results, indent=2, default=str)}")
