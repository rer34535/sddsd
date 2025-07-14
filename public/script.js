document.addEventListener('DOMContentLoaded', createStars);

// --- CORE ANALYSIS LOGIC ---

async function analyzeText() {
    document.getElementById('loading').style.display = 'block';
    const resultsSection = document.getElementById('results');
    resultsSection.style.display = 'none';
    clearResults();

    const inputText = document.getElementById('inputText').value.trim().replace(/\s+/g, ' ');
    const birthDate = document.getElementById('birthDate').value;
    const entityType = document.getElementById('entityType').value;
    const analysisType = document.getElementById('analysisType').value;

    if (!inputText) {
        alert('الرجاء إدخال اسم أو كيان للتحليل.');
        document.getElementById('loading').style.display = 'none';
        return;
    }

    const apiKey = document.getElementById('openrouterKey').value.trim();
    if (!apiKey) {
        alert('لم يتم توفير مفتاح API. توقف التحليل.');
        document.getElementById('loading').style.display = 'none';
        return;
    }

    const gematriaResult = calculateAdvancedGematria(inputText);
    displayLocalResults(inputText, birthDate, entityType, analysisType, gematriaResult);
    resultsSection.style.display = 'block';

    // The AI prompt is now generated on the server, so we don't need createAIPrompt here.

    try {
        const aiData = {
            name: inputText,
            type: entityType === 'person' ? 'شخص' : 'دولة',
            date: birthDate || new Date().getFullYear(),
            analysisType: analysisType,
            apiKey: apiKey
        };

        const response = await fetch('/api/ai_analysis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(aiData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'حدث خطأ غير معروف من الخادم.');
        }

        const data = await response.json();
        const aiAnalysis = data.result;
        displayAIResults(aiAnalysis);

    } catch (error) {
        console.error('Error calling backend API:', error);
        document.getElementById('axes-results').innerHTML = `<p class="error">فشل الاتصال بالخادم. تأكد من أن الخادم يعمل وأن البيانات صحيحة.<br>${error.message}</p>`;
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

function clearResults() {
    document.getElementById('basic-info').innerHTML = '';
    document.getElementById('gematria-result').innerHTML = '';
    document.getElementById('elements-result').innerHTML = '';
    document.getElementById('axes-results').innerHTML = '<p>جاري توليد التحليل المعمق بواسطة الذكاء الاصطناعي...</p>';
    document.getElementById('summary-result').innerHTML = '';
    document.getElementById('recommendation-result').innerHTML = '';
}

function displayLocalResults(inputText, birthDate, entityType, analysisType, gematriaResult) {
    document.getElementById('basic-info').innerHTML = 
        `<p><strong>الاسم/الكيان:</strong> ${inputText}</p>` +
        `<p><strong>النوع:</strong> ${entityType === 'person' ? 'شخص' : 'دولة'}</p>` +
        `<p><strong>نوع التحليل:</strong> ${analysisType}</p>` +
        (birthDate ? `<p><strong>التاريخ:</strong> ${birthDate}</p>` : '');

    const mainPlanet = planetInfo[gematriaResult.composite];
    document.getElementById('gematria-result').innerHTML = 
        `<p><strong>الرقم الجفري النهائي:</strong> <span class="highlight">${gematriaResult.composite}</span></p>` +
        `<p><strong>الكوكب الحاكم:</strong> <span class="highlight" style="color:${mainPlanet.color};">${mainPlanet.name}</span></p>` +
        `<p><strong>التوازن الرقمي:</strong> ${calculateNumericalBalance(gematriaResult)}</p>`;

    document.getElementById('elements-result').innerHTML = analyzeElements(gematriaResult.elements);
}

const analysisAxes = {
    person: [
        "الصفات الجسدية", "المال والدخل", "المهنة/العمل", "الطموح والإنجاز",
        "الصحة والطاقة الحيوية", "العاطفة والعلاقات الحميمة", "الأسرة والجذور",
        "الأصدقاء والشبكات الاجتماعية", "السمعة والصورة العامة", "التفكير واتخاذ القرار",
        "الأسرار وما هو مخفي", "الأزمات/العقبات المحتملة", "الروحانية والرسائل الباطنية",
        "الشهرة والبشارات"
    ],
    country: [
        "الحاكم/النظام السياسي", "الشعب والتركيبة السكانية", "الاقتصاد والمال العام",
        "السمعة والعلاقات الدولية", "الجيش والقوات المسلحة", "الشرطة والأمن الداخلي",
        "البنية التحتية والنقل", "الإنترنت والاتصالات", "الديون والالتزامات",
        "الأزمات والكوارث الطبيعية", "العقبات والتحديات الهيكلية", "النجاحات والفرص",
        "القوة الخفية/التأثير الروحي", "العلاقات الخارجية والعلاقه مع الدول", "الحروب والكوارث"
    ]
};

/* The AI prompt is now handled by the server.
function createAIPrompt(inputText, entityType, analysisType, birthDate, gematriaResult) {
    const mainPlanet = planetInfo[gematriaResult.composite];
    return `
    ❖ “أنت محلل خبير في علوم الجفر والفلك والطاقة. قم بتحليل الاسم أو الكيان أو الحدث وفق الدمج الكامل بين هذه العلوم. 
    استخدم البيانات الأولية التالية كنقطة انطلاق، ثم قم بتوليد تحليل مفصل وعميق.

    --- البيانات الأولية (محسوبة مسبقًا) ---
    - الاسم/الكيان: ${inputText}
    - نوع الكيان: ${entityType}
    - تاريخ الميلاد/التأسيس: ${birthDate || 'غير متوفر'}
    - الرقم الجفري النهائي (المركب): ${gematriaResult.composite}
    - الكوكب الحاكم الرئيسي: ${mainPlanet.name} (عنصر: ${mainPlanet.element})
    - توزيع العناصر (نار/ماء/أرض/هواء): ${JSON.stringify(gematriaResult.elements)}

    --- المطلوب منك --- 
    --- المطلوب منك (مهم جدًا) ---
    1.  قم **بشكل إلزامي** بتحليل **جميع** المحاور التالية، واحدًا تلو الآخر، دون إهمال أي منها:
        ${analysisAxes[entityType].map((axis, index) => `- المحور ${index + 1}: ${axis}`).join('\n        ')}

    2.  لكل محور من المحاور المذكورة أعلاه، قدم قراءة طاقية شاملة تحتوي على:
        • **الوصف الطاقي:** تحليل مفصل للمحور.
        • **نسبة الاحتمالية:** رقم واضح بالنسبة المئوية (%).
        • **الفرصة/التحذير:** جملة واضحة تصف الفرصة أو التحذير.
        • **الكوكب المرتبط:** اسم الكوكب.
        • **التوقيت المرجح:** إطار زمني متوقع.

    🕰 نوع التحليل الزمني المطلوب: ${analysisType}

    🎯 أخرج النتيجة بتنسيق HTML غني ومرتب باستخدام h3, p, ul, li, strong. 
    ابدأ مباشرةً بـ <h2>📖 قراءة المحاور التحليلية</h2> ثم ضع كل محور في <div> خاص به مع كلاس "axis-card".
    بعد المحاور، قدم <h3>📝 ملخص التوصيف الطاقي</h3> و <h3>✨ توصية روحانية ختامية</h3> كل في <div> منفصل خاص به.
    `;
}*/

function displayAIResults(aiAnalysis) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = aiAnalysis;

    let summaryHTML = 'لم يتمكن النموذج من توليد ملخص.';
    let recommendationHTML = 'لم يتمكن النموذج من توليد توصية.';
    
    const allH3s = tempDiv.querySelectorAll('h3');
    allH3s.forEach(h3 => {
        if (h3.textContent.includes('ملخص')) {
            summaryHTML = h3.parentElement.innerHTML;
            h3.parentElement.remove();
        } else if (h3.textContent.includes('توصية')) {
            recommendationHTML = h3.parentElement.innerHTML;
            h3.parentElement.remove();
        }
    });

    const axesHTML = tempDiv.innerHTML;

    document.getElementById('axes-results').innerHTML = axesHTML;
    document.getElementById('summary-result').innerHTML = summaryHTML;
    document.getElementById('recommendation-result').innerHTML = recommendationHTML;
}


// --- CALCULATION HELPERS AND DATA ---

function createStars() {
    const starsContainer = document.getElementById('stars');
    if (!starsContainer) return;
    starsContainer.innerHTML = '';
    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = Math.random() * 4 + 1 + 'px';
        star.style.height = star.style.width;
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (Math.random() * 2 + 2) + 's';
        starsContainer.appendChild(star);
    }
}

const gematriaValues = {
    big: {
        'ا': 1, 'أ': 1, 'إ': 1, 'آ': 1, 'ء': 1,
        'ب': 2, 'ج': 3, 'د': 4, 'ه': 5, 'و': 6, 'ز': 7, 'ح': 8, 'ط': 9,
        'ي': 10, 'ك': 20, 'ل': 30, 'م': 40, 'ن': 50, 'س': 60, 'ع': 70, 'ف': 80, 'ص': 90,
        'ق': 100, 'ر': 200, 'ش': 300, 'ت': 400, 'ث': 500, 'خ': 600, 'ذ': 700, 'ض': 800, 'ظ': 900, 'غ': 1000
    },
    small: {
        'ا': 1, 'أ': 1, 'إ': 1, 'آ': 1, 'ء': 1,
        'ب': 2, 'ج': 3, 'د': 4, 'ه': 5, 'و': 6, 'ز': 7, 'ح': 8, 'ط': 9,
        'ي': 1, 'ك': 2, 'ل': 3, 'م': 4, 'ن': 5, 'س': 6, 'ع': 7, 'ف': 8, 'ص': 9,
        'ق': 1, 'ر': 2, 'ش': 3, 'ت': 4, 'ث': 5, 'خ': 6, 'ذ': 7, 'ض': 8, 'ظ': 9, 'غ': 1
    },
    positional: {
        'ا': 1, 'أ': 1, 'إ': 1, 'آ': 1, 'ء': 1,
        'ب': 2, 'ج': 3, 'د': 4, 'ه': 5, 'و': 6, 'ز': 7, 'ح': 8, 'ط': 9,
        'ي': 10, 'ك': 11, 'ل': 12, 'م': 13, 'ن': 14, 'س': 15, 'ع': 16, 'ف': 17, 'ص': 18,
        'ق': 19, 'ر': 20, 'ش': 21, 'ت': 22, 'ث': 23, 'خ': 24, 'ذ': 25, 'ض': 26, 'ظ': 27, 'غ': 28
    }
};

const elementTypes = {
    fire: ['ا', 'ه', 'ط', 'م', 'ف', 'ش', 'ذ'],
    water: ['ب', 'و', 'ي', 'ن', 'ص', 'ت', 'ض'],
    earth: ['ج', 'ز', 'ك', 'س', 'ق', 'ث', 'ظ'],
    air: ['د', 'ح', 'ل', 'ع', 'ر', 'خ', 'غ']
};

const planetInfo = {
    1: { name: 'الشمس', element: 'نار', traits: 'القيادة والإبداع والحيوية والكرامة', color: '#FFD700' },
    2: { name: 'القمر', element: 'ماء', traits: 'الحدس والعاطفة والحساسية والأمومة', color: '#C0C0C0' },
    3: { name: 'المشتري', element: 'نار', traits: 'التوسع والحكمة والتفاؤل والعدالة', color: '#FFA500' },
    4: { name: 'أورانوس', element: 'هواء', traits: 'التجديد والثورة والاستقلالية والإبداع', color: '#4FD0E7' },
    5: { name: 'عطارد', element: 'هواء', traits: 'التواصل والذكاء والمرونة والتجارة', color: '#87CEEB' },
    6: { name: 'الزهرة', element: 'أرض', traits: 'الجمال والحب والانسجام والفن', color: '#FFC0CB' },
    7: { name: 'نبتون', element: 'ماء', traits: 'الروحانية والخيال والحدس والتصوف', color: '#4169E1' },
    8: { name: 'زحل', element: 'أرض', traits: 'الانضباط والمسؤولية والصبر والحكمة', color: '#8B4513' },
    9: { name: 'المريخ', element: 'نار', traits: 'الطاقة والشجاعة والعزيمة والقتال', color: '#FF4500' }
};

function calculateAdvancedGematria(text) {
    let bigTotal = 0, smallTotal = 0, positionalTotal = 0;
    let elements = { fire: 0, water: 0, earth: 0, air: 0 };
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (gematriaValues.big[char]) {
            bigTotal += gematriaValues.big[char];
            smallTotal += gematriaValues.small[char];
            positionalTotal += gematriaValues.positional[char] * (i + 1);
            for (let element in elementTypes) {
                if (elementTypes[element].includes(char)) {
                    elements[element]++;
                    break;
                }
            }
        }
    }
    
    const bigFinal = reduceToSingleDigit(bigTotal);
    const smallFinal = reduceToSingleDigit(smallTotal);
    const positionalFinal = reduceToSingleDigit(positionalTotal);
    const compositeFinal = reduceToSingleDigit(Math.round((bigFinal + smallFinal + positionalFinal) / 3));
    
    return { big: { final: bigFinal }, small: { final: smallFinal }, positional: { final: positionalFinal }, composite: compositeFinal, elements };
}

function reduceToSingleDigit(num) {
    while (num > 9) {
        num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
}

function calculateNumericalBalance(gematriaResult) {
    const variance = Math.abs(gematriaResult.big.final - gematriaResult.small.final) + 
                           Math.abs(gematriaResult.small.final - gematriaResult.positional.final) + 
                           Math.abs(gematriaResult.positional.final - gematriaResult.big.final);
    if (variance <= 3) return 'متوازن جداً ⚖️';
    if (variance <= 6) return 'متوازن نسبياً ⚖️';
    if (variance <= 9) return 'متوسط التوازن ⚖️';
    return 'يحتاج توازن ⚖️';
}

function analyzeElements(elements) {
    const total = Object.values(elements).reduce((sum, count) => sum + count, 1); // Avoid division by zero
    let analysis = '<div style="margin: 15px 0;"><h4 style="color: #ffd700;">🌍 تحليل العناصر الأربعة:</h4>';
    
    for (let element in elements) {
        const percentage = ((elements[element] / total) * 100).toFixed(1);
        const elementName = { fire: 'ناري', water: 'مائي', earth: 'ترابي', air: 'هوائي' }[element];
        analysis += `<span class="element-badge ${element}">${elementName}: ${percentage}%</span>`;
    }
    analysis += '</div>';
    
    const dominantElement = Object.keys(elements).reduce((a, b) => elements[a] > elements[b] ? a : b);
    const dominantTraits = {
        fire: 'شخصية قيادية، طاقة عالية، إبداع وحماس، روح المبادرة',
        water: 'حساسية عالية، حدس قوي، عمق عاطفي، قدرة على الشفاء',
        earth: 'عملية وواقعية، استقرار وثبات، قدرة على البناء والإنجاز',
        air: 'فكر متقد، تواصل ممتاز، مرونة عقلية، حب المعرفة'
    };
    
    analysis += `<div class="planet-info" style="margin-top: 15px;">`;
    analysis += `<h4 style="color: #ffd700;">🔥 العنصر المهيمن والصفات:</h4>`;
    analysis += `<p>${dominantTraits[dominantElement]}</p></div>`;
    
    return analysis;
}
