import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// --- دالة للحصول على مفتاح API ---
async function getApiKey() {
  if (process.env.OPENROUTER_API_KEY) {
    console.log("تم العثور على مفتاح API في متغيرات البيئة.");
    return process.env.OPENROUTER_API_KEY;
  } else {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise(resolve => {
      rl.question('🔑 الرجاء إدخال مفتاح OpenRouter API الخاص بك: ', (key) => {
        rl.close();
        resolve(key);
      });
    });
  }
}

// --- دالة لقراءة قالب البرومبت ---
function getAnalysisPrompt() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const promptFilePath = path.join(__dirname, 'ai_analysis_prompt.md');
    return fs.readFileSync(promptFilePath, 'utf-8');
  } catch (error) {
    console.error('Error reading prompt file:', error);
    return null;
  }
}

// --- الدالة الرئيسية لتشغيل التحليل ---
async function main() {
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.error('❌ لم يتم توفير مفتاح API. لا يمكن المتابعة.');
    return;
  }

  // إعداد عميل OpenAI باستخدام المفتاح الذي تم الحصول عليه
  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    defaultHeaders: {
      "HTTP-Referer": "<YOUR_SITE_URL>", // اختياري
      "X-Title": "<YOUR_SITE_NAME>",      // اختياري
    },
  });

  // --- أدخل بيانات التحليل هنا ---
  const analysisInput = {
    name: "سمر عفاف",
    type: "شخص",
    date: "2025",
    analysisType: "سنوي",
  };

  const promptTemplate = getAnalysisPrompt();
  if (!promptTemplate) {
    console.log('فشل في تحميل قالب البرومبت.');
    return;
  }

  const finalPrompt = `${promptTemplate}\n\n--- بيانات التحليل المطلوبة ---\n◼️ الاسم: ${analysisInput.name}\n◼️ نوع الكيان: ${analysisInput.type}\n◼️ التاريخ المطلوب تحليله: ${analysisInput.date}\n◼️ نوع التحليل: ${analysisInput.analysisType}\n`;

  console.log('⏳ جاري إرسال الطلب إلى النموذج...');

  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-exp:free",
      messages: [{ role: "user", content: finalPrompt }],
    });

    console.log('\n✨ --- نتيجة التحليل --- ✨');
    console.log(completion.choices[0].message.content);
    console.log('✨ -------------------- ✨');

  } catch (error) {
    console.error('\n❌ حدث خطأ أثناء استدعاء API:', error.message);
  }
}

main();