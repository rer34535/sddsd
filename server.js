import express from 'express';
import OpenAI from 'openai';
import cors from 'cors';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import * as predictionsData from './predictionsData.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// خدمة الملفات الثابتة (index.html, css, js...)
// خدمة جميع الملفات الثابتة (index.html, style.css, script.js ...)
const staticPath = path.join(__dirname, 'public');
app.use(express.static(staticPath));

app.post('/api/ai_analysis', async (req, res) => {
    const { name, type, date, analysisType, birthDate, specialRequest, apiKey: providedApiKey } = req.body;
    const apiKey = providedApiKey || process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return res.status(401).json({ error: 'API key missing' });
    }

    try {
        // 1. قراءة قالب البرومبت
        const promptTemplate = await fs.readFile(path.join(__dirname, 'ai_analysis_prompt.md'), 'utf-8');

        // 2. اختيار بيانات التوقعات بناءً على نوع الكيان ونوع التحليل
        let knowledgeBase = '';
        const dataType = type === 'شخص' ? predictionsData.gufrPersonPredictions : predictionsData.gufrPredictions;
        // Ensure analysisType is a string and valid before using toLowerCase()
        const analysisTimeframe = (typeof analysisType === 'string' && analysisType) ? analysisType.toLowerCase() : 'general';

        if (dataType && dataType[analysisTimeframe]) {
            knowledgeBase = `\n\n🔮 استخدم قاعدة المعرفة التالية كمصدر أساسي لتوليد التحليل. يجب أن تكون النتائج متوافقة مع هذه البيانات:\n\n${JSON.stringify(dataType[analysisTimeframe], null, 2)}`;
        }

        // 3. تهيئة بيانات الإدخال
        let inputData = `◼️ الاسم: ${name}\n`;
        inputData += `◼️ نوع الكيان: ${type}\n`;
        if (date) inputData += `◼️ التاريخ المطلوب تحليله: ${date}\n`;
        if (analysisType) inputData += `◼️ نوع التحليل: ${analysisType}\n`;
        if (birthDate) inputData += `◼️ هل يوجد تاريخ ميلاد؟: نعم، ${birthDate}\n`;
        else inputData += `◼️ هل يوجد تاريخ ميلاد؟: لا\n`;
        if (specialRequest) inputData += `◼️ هل يُطلب وفق/حرز خاص؟: نعم، ${specialRequest}\n`;
        else inputData += `◼️ هل يُطلب وفق/حرز خاص؟: لا حاليًا\n`;

        // 4. دمج البرومبت مع بيانات الإدخال وقاعدة المعرفة
        const finalPrompt = `${promptTemplate}${knowledgeBase}\n\n✅ بيانات الإدخال للتحليل الحالي:\n\n${inputData}`;

        const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey,
        });

        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-exp:free",
            messages: [{ role: "user", content: finalPrompt }],
        });

        res.json({ result: completion.choices[0].message.content });

    } catch (error) {
        console.error('Error during AI analysis:', error);
        res.status(500).json({ error: `فشل في إجراء التحليل: ${error.message}` });
    }
});

// مسار favicon.ico وهمي لمنع أخطاء 404 في المتصفح
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
