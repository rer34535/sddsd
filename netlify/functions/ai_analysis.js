import fs from 'fs/promises';
import path from 'path';
import { OpenAI } from 'openai';
import * as predictionsData from '../../../predictionsData.js';

const openrouterApiKey = process.env.OPENROUTER_API_KEY;

// Helper function to get the project root directory
const getProjectRoot = () => {
    // In Netlify functions, the CWD is the root of the project.
    return process.cwd();
};

export async function handler(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const body = JSON.parse(event.body);
        const { type, analysisType, inputData, apiKey } = body;

        const finalApiKey = apiKey || openrouterApiKey;

        if (!finalApiKey) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'API key is required.' })
            };
        }

        const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: finalApiKey,
        });

        const projectRoot = getProjectRoot();
        const promptTemplatePath = path.join(projectRoot, 'ai_analysis_prompt.md');
        const promptTemplate = await fs.readFile(promptTemplatePath, 'utf-8');

        let knowledgeBase = '';
        const dataType = type === 'شخص' ? predictionsData.gufrPersonPredictions : predictionsData.gufrPredictions;
        const analysisTimeframe = analysisType ? analysisType.toLowerCase() : 'general';

        if (dataType && dataType[analysisTimeframe]) {
            knowledgeBase = `\n\n🔮 استخدم قاعدة المعرفة التالية كمصدر أساسي لتوليد التحليل. يجب أن تكون النتائج متوافقة مع هذه البيانات:\n\n${JSON.stringify(dataType[analysisTimeframe], null, 2)}`;
        }

        const finalPrompt = `${promptTemplate}\n\n${knowledgeBase}\n\n✅ بيانات الإدخال للتحليل الحالي:\n\n${inputData}`;

        const completion = await openai.chat.completions.create({
            model: 'google/gemini-pro',
            messages: [{ role: 'user', content: finalPrompt }],
        });

        const result = completion.choices[0]?.message?.content;

        if (!result) {
            throw new Error('No result from AI model');
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ result })
        };

    } catch (error) {
        console.error('Error during AI analysis:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An error occurred during AI analysis.', details: error.message })
        };
    }
}
