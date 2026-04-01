# 🤖 مساعد الأتمتة الذكي - Smart Automation Assistant


## ⚡ Quick Start










<div align="center">
```bash
git clone https://github.com/USERNAME/Automatiser-les-taches.git
cd Automatiser-les-taches

# install frontend
npm install

# install python deps
pip install -r python_scripts/requirements.txt

# run app
npm run dev




![Python](https://img.shields.io/badge/Python-3.8+-blue?logo=python&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

**Transformez votre ordinateur en un « assistant intelligent » qui exécute automatiquement les tâches complexes et répétitives.**

</div>

---

## 📋   Aperçu

Un projet complet pour automatiser les tâches fastidieuses et répétitives grâce à [Python et Next.js]. Il offre une interface web conviviale pour la gestion et la planification des tâches avec exécution en arrière-plan.

## ✨ Principales fonctionnalités

### 1. 📁 Organisation automatique des fichiers

- **Tri automatique des dossiers** par type de fichier
- **Nommage intelligent** des fichiers basé sur la date ou le contenu
- **Déplacement/copie/archivage** des fichiers sans intervention humaine
- **Catégorisation automatique** : images, documents, vidéos, audio, code, données

```python
# Exemple de règle d'organisation

{
"sourceFolder": "/home/user/Downloads",

"targetFolder": "/home/user/Documents",

"filePattern": ".*\\.pdf$",

"namingRule": "{date}_{original}",

"action": "move"
}

```
### 2. 📊 Traitement des données
- **Nettoyage des données** et suppression des valeurs nulles
- **Opérations multiples** : filtrage, tri, regroupement, calcul
- **Prise en charge de plusieurs sources** : CSV, Excel, JSON, API
- **Exportation flexible** : Excel avec mise en forme CSV, JSON

```python

# Exemple d'opérations de traitement
opérations = [
{"type": "filter", "column": "price", "operator": "">", "value": 100},

{"type": "sort", "columns": ["price"], "ascending": False},

{"type": "group", "by": ["category"], "aggregation": "sum"}

] 
```

### 3. 🌐 استخراج البيانات من الويب (Web Scraping)
- **استخراج ذكي**: نصوص، روابط، صور، جداول
- **دعم Selenium** للصفحات الديناميكية
- **BeautifulSoup** للصفحات الثابتة
- **التحقق من الروابط** المكسورة
- **جدولة دورية** للتحديث التلقائي

```python
# مثال على وظيفة استخراج
{
    "url": "https://example.com/products",
    "selector": ".product-card",
    "extractType": "text",
    "schedule": "0 0 * * *"  # يومياً
}
```

### 4. 📧 أتمتة البريد الإلكتروني (Email Automation)
- **إرسال تقارير تلقائية** لمجموعات محددة
- **قوالب HTML** احترافية
- **دعم المرفقات**: PDF, Excel, CSV
- **شروط إرسال** قابلة للتخصيص

```python
# مثال على وظيفة بريد
{
    "recipients": "team@company.com",
    "subject": "تقرير يومي",
    "body": "<html>...</html>",
    "attachments": "/reports/daily.xlsx"
}
```

---

## 🏗️ هيكل المشروع

```
/home/z/my-project/
├── 📁 src/                          # Frontend (Next.js)
│   ├── 📁 app/
│   │   ├── 📁 api/                  # API Routes
│   │   │   ├── 📁 tasks/           # إدارة المهام
│   │   │   ├── 📁 scraping/        # استخراج الويب
│   │   │   ├── 📁 files/           # تنظيم الملفات
│   │   │   ├── 📁 data/            # معالجة البيانات
│   │   │   ├── 📁 email/           # البريد الإلكتروني
│   │   │   └── 📁 logs/            # السجلات
│   │   ├── page.tsx                # الصفحة الرئيسية
│   │   └── layout.tsx              # التخطيط العام
│   ├── 📁 components/               # مكونات React
│   │   ├── TaskManager.tsx
│   │   ├── WebScraper.tsx
│   │   ├── FileOrganizer.tsx
│   │   ├── DataProcessor.tsx
│   │   ├── EmailAutomation.tsx
│   │   └── LogsViewer.tsx
│   └── 📁 lib/                      # المكتبات المساعدة
│
├── 📁 python_scripts/               # Backend (Python)
│   ├── main.py                      # نقطة الدخول الرئيسية
│   ├── requirements.txt             # متطلبات Python
│   ├── 📁 file_organizers/
│   │   └── organizer.py            # وحدة تنظيم الملفات
│   ├── 📁 data_processors/
│   │   └── processor.py            # وحدة معالجة البيانات
│   ├── 📁 scrapers/
│   │   ├── scraper.py              # وحدة استخراج الويب
│   │   └── quick_scrape.py         # استخراج سريع
│   ├── 📁 email_automation/
│   │   └── sender.py               # وحدة إرسال البريد
│   └── 📁 utils/
│       └── logger.py               # نظام التسجيل
│
├── 📁 prisma/                       # قاعدة البيانات
│   └── schema.prisma               # هيكل الجداول
│
└── 📁 db/                           # ملفات قاعدة البيانات
    └── custom.db                   # قاعدة بيانات SQLite
```

---

## 🗄️ قاعدة البيانات

### الجداول الرئيسية:

| الجدول | الوصف |
|--------|-------|
| `Task` | المهام المجدولة |
| `Log` | سجلات التنفيذ |
| `ScrapingJob` | وظائف استخراج الويب |
| `EmailJob` | وظائف البريد الإلكتروني |
| `FileRule` | قواعد تنظيم الملفات |
| `DataJob` | مهام معالجة البيانات |
| `Setting` | إعدادات النظام |

---

## 🚀 التثبيت والتشغيل

### متطلبات النظام:
- Node.js 18+
- Python 3.8+
- Bun (لإدارة حزم Node.js)

### 1. تثبيت متطلبات Node.js:
```bash
cd /home/z/my-project
bun install
```

### 2. تثبيت متطلبات Python:
```bash
pip install -r python_scripts/requirements.txt
```

### 3. تهيئة قاعدة البيانات:
```bash
bun run db:push
```

### 4. تشغيل المشروع:
```bash
bun run dev
```

---

## 📖 دليل الاستخدام

### إضافة مهمة جديدة:

1. افتح لوحة التحكم في المتصفح
2. اختر نوع المهمة من التبويبات
3. اضغط على "مهمة جديدة" أو "قاعدة جديدة"
4. املأ التفاصيل المطلوبة
5. اضغط "إنشاء" ثم "تشغيل"

### جدولة مهمة:

استخدم تنسيق Cron للتعبير عن الجدولة:
```
┌───────────── الدقيقة (0-59)
│ ┌───────────── الساعة (0-23)
│ │ ┌───────────── اليوم (1-31)
│ │ │ ┌───────────── الشهر (1-12)
│ │ │ │ ┌───────────── يوم الأسبوع (0-6)
│ │ │ │ │
* * * * *
```

أمثلة:
- `0 0 * * *` - يومياً في منتصف الليل
- `0 9 * * 1` - أسبوعياً يوم الاثنين الساعة 9 صباحاً
- `0 */6 * * *` - كل 6 ساعات

---

## 🔧 التكوين

### إعدادات البريد الإلكتروني:
```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### إعدادات قاعدة البيانات:
```env
DATABASE_URL="file:./db/custom.db"
```

---

## 📝 أمثلة عملية

### مثال 1: تنظيم ملفات التحميل
```python
# نقل جميع ملفات PDF من التحميلات إلى مجلد المستندات
config = {
    "sourceFolder": "/home/user/Downloads",
    "targetFolder": "/home/user/Documents/PDFs",
    "filePattern": ".*\\.pdf$",
    "namingRule": "{date}_{original}",
    "action": "move"
}
```

### مثال 2: استخراج أسعار المنتجات
```python
# استخراج أسعار من موقع تجارة إلكترونية
config = {
    "url": "https://shop.example.com/products",
    "selector": ".product-price",
    "extractType": "text",
    "schedule": "0 9 * * *"
}
```

### مثال 3: معالجة ملف مبيعات
```python
# تحليل ملف مبيعات وإنشاء تقرير
config = {
    "sourceType": "excel",
    "sourcePath": "/data/sales.xlsx",
    "operations": [
        {"type": "filter", "column": "status", "operator": "==", "value": "completed"},
        {"type": "group", "by": ["product"], "aggregation": {"price": "sum"}}
    ],
    "outputFormat": "excel"
}
```

---

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:
1. عمل Fork للمشروع
2. إنشاء فرع جديد (`git checkout -b feature/amazing-feature`)
3. عمل Commit للتغييرات (`git commit -m 'Add amazing feature'`)
4. دفع الفرع (`git push origin feature/amazing-feature`)
5. فتح Pull Request

---

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

---

## 📞 الدعم

للأسئلة والمشاكل، يرجى فتح Issue في المستودع.

---

<div align="center">

**صنع بـ ❤️ لتحسين الإنتاجية وتوفير الوقت**

</div>
