// All site content (fictional, classroom simulation). Each text is {ar, en}.
(function () {
  // ---------- illustrated thumbnails (offline, no external images) ----------
  const PAL = {
    sports: ['#0f7a3a', '#1fa35a', '#e9f7ee'], local: ['#f2994a', '#f2c94c', '#2d3a4a'], economy: ['#1e3a8a', '#3b82f6', '#fde047'],
    celeb: ['#7c3aed', '#ec4899', '#fde68a'], tech: ['#0f172a', '#06b6d4', '#a5f3fc'], health: ['#16a34a', '#a3e635', '#fff7ed'],
    food: ['#ea580c', '#facc15', '#fff7ed'], climate: ['#0369a1', '#38bdf8', '#fef3c7'], culture: ['#78350f', '#d97706', '#fef3c7'],
    crypto: ['#111827', '#f59e0b', '#fde68a'], education: ['#1d4ed8', '#60a5fa', '#fef9c3'], opinion: ['#334155', '#94a3b8', '#f8fafc'],
  };
  function thumb(cat, seed = 1) {
    const [a, b, c] = PAL[cat] || PAL.local; const r = (n) => ((Math.sin(seed * 9301 + n * 49297) + 1) / 2);
    let art = '';
    if (cat === 'sports') art = `<rect y="120" width="400" height="105" fill="${a}"/><path d="M0 120h400" stroke="#fff" stroke-width="3"/><circle cx="200" cy="172" r="30" fill="none" stroke="#fff" stroke-width="3"/><circle cx="${120 + r(1) * 160}" cy="150" r="14" fill="#fff"/><path d="M${126 + r(1) * 160} 144l-8 4 2 8 8 0 3-8z" fill="#222"/>${[...Array(18)].map((_, i) => `<circle cx="${i * 23 + 8}" cy="${70 + (i % 3) * 12}" r="7" fill="hsl(${i * 40},60%,${50 + (i % 2) * 15}%)"/>`).join('')}`;
    else if (cat === 'local') art = `<circle cx="${300 - r(2) * 80}" cy="60" r="32" fill="${c === '#2d3a4a' ? '#fff3c4' : c}"/>${[...Array(9)].map((_, i) => { const h = 50 + r(i + 3) * 90; return `<rect x="${i * 46}" y="${225 - h}" width="40" height="${h}" fill="${c}" opacity="${0.6 + r(i) * 0.4}"/>${[...Array(Math.floor(h / 22))].map((_, j) => `<rect x="${i * 46 + 8}" y="${225 - h + 10 + j * 20}" width="8" height="8" fill="#fde68a" opacity=".7"/><rect x="${i * 46 + 24}" y="${225 - h + 10 + j * 20}" width="8" height="8" fill="#fde68a" opacity=".5"/>`).join('')}`; }).join('')}`;
    else if (cat === 'economy' || cat === 'crypto') art = `${[...Array(8)].map((_, i) => { const h = 30 + r(i + 1) * 120 + i * 6; return `<rect x="${30 + i * 44}" y="${210 - h}" width="28" height="${h}" rx="3" fill="${c}" opacity=".85"/>`; }).join('')}<path d="M20 180 L120 140 L200 160 L300 80 L380 40" stroke="#fff" stroke-width="6" fill="none"/><path d="M360 34l22 4-8 20z" fill="#fff"/>${cat === 'crypto' ? `<circle cx="90" cy="70" r="34" fill="#f59e0b" stroke="#fde68a" stroke-width="6"/><text x="90" y="84" font-size="40" text-anchor="middle" fill="#fff" font-family="Arial" font-weight="bold">₿</text>` : ''}`;
    else if (cat === 'celeb') art = `<path d="M200 0 L120 225 L280 225z" fill="#fff" opacity=".18"/><path d="M60 0 L20 225 L130 225z" fill="#fff" opacity=".1"/>${[...Array(14)].map((_, i) => `<text x="${r(i) * 400}" y="${20 + r(i + 7) * 190}" font-size="${10 + r(i + 2) * 18}" fill="${c}">★</text>`).join('')}<circle cx="200" cy="120" r="34" fill="#1f1235"/><rect x="160" y="150" width="80" height="80" rx="30" fill="#1f1235"/>`;
    else if (cat === 'tech' || cat === 'education') art = `<rect x="140" y="20" width="120" height="200" rx="18" fill="#0b1020" stroke="${c}" stroke-width="4"/><rect x="152" y="40" width="96" height="150" rx="6" fill="${b}" opacity=".85"/>${[...Array(5)].map((_, i) => `<rect x="160" y="${52 + i * 26}" width="${50 + r(i) * 30}" height="10" rx="5" fill="#fff" opacity=".8"/>`).join('')}<circle cx="200" cy="205" r="6" fill="${c}"/>${[...Array(10)].map((_, i) => `<circle cx="${r(i + 20) * 400}" cy="${r(i + 30) * 225}" r="${2 + r(i) * 4}" fill="${c}" opacity=".6"/>`).join('')}`;
    else if (cat === 'health' || cat === 'food') art = `<ellipse cx="200" cy="170" rx="130" ry="36" fill="#fff"/><ellipse cx="200" cy="160" rx="110" ry="28" fill="${c}"/>${[...Array(7)].map((_, i) => `<circle cx="${130 + i * 24}" cy="${150 - r(i) * 20}" r="${14 + r(i + 4) * 8}" fill="hsl(${[10, 40, 90, 130, 30, 0, 50][i]},75%,55%)"/>`).join('')}<path d="M310 40 q30 30 0 70 q-30 -40 0 -70" fill="${b}"/>`;
    else if (cat === 'climate') art = `<circle cx="300" cy="70" r="38" fill="#fde047"/>${[0, 1, 2].map(i => `<path d="M0 ${150 + i * 25} q50 -20 100 0 t100 0 t100 0 t100 0 v80 h-400z" fill="#fff" opacity="${0.25 + i * 0.2}"/>`).join('')}`;
    else if (cat === 'culture') art = `${[...Array(5)].map((_, i) => `<rect x="${70 + i * 60}" y="80" width="22" height="120" fill="${c}"/>`).join('')}<path d="M50 80 L200 25 L350 80z" fill="${c}"/><rect x="50" y="200" width="300" height="14" fill="${c}"/>`;
    else art = `<rect x="40" y="40" width="320" height="145" rx="10" fill="#fff" opacity=".9"/>${[...Array(6)].map((_, i) => `<rect x="60" y="${60 + i * 20}" width="${200 + r(i) * 80}" height="8" rx="4" fill="${a}" opacity=".5"/>`).join('')}`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="225" fill="url(#g)"/>${art}</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  // ---------- generic paragraphs used to fill articles ----------
  const FILL = {
    ar: ['ومصادر قالت إن الخطوة دي جزء من خطة أكبر لتحسين الخدمات اللي بتتقدم للناس الفترة الجاية، مع متابعة دورية للتنفيذ على الأرض.', 'والناس على السوشيال انقسموا: ناس كتير رحبت بالقرار، وناس تانية طالبت بتفاصيل أكتر عن المواعيد والتكلفة.', 'وخبرا شايفين إن نجاح الخطوة دي معتمد على التنسيق بين الجهات المختلفة، وإنهم يسمعوا رأي الناس على طول ويعدّلوا الخطط على حسب احتياجاتهم.', 'ومن المنتظر إن تفاصيل أكتر تتعلن في الأيام الجاية، في مؤتمر صحفي هيحضره عدد من المسؤولين والمتخصصين.', 'والتقرير قال إن الأرقام الأولية مبشّرة، بس محتاجة مراجعة كويسة قبل ما حد يبني عليها أي قرار.'],
    en: [
      'Sources said the move is part of a wider plan to improve services over the coming months, with regular reviews of how the work is progressing on the ground.',
      'Reactions on social media were mixed: many welcomed the decision, while others asked for more detail about the timeline and the expected cost.',
      'Experts say success will depend on coordination between the agencies involved, and on listening to the people affected and adjusting plans to their needs.',
      'More details are expected to be announced in the coming days at a press conference attended by officials and specialists.',
      'The report noted that the early numbers are encouraging, but they need careful review before anyone builds future decisions on them.',
    ],
  };
  const body = (first, extra = [], n = 4, lang) => [first, ...extra, ...FILL[lang].slice(0, Math.max(0, n - 1 - extra.length))];

  // ============ SITE 1: Al-Khabar Now (busy local portal) ============
  const alkhabar = {
    name: { ar: 'الخبر الآن', en: 'Al-Khabar Now' },
    ticker: {
      ar: ['عاجل: امتحانات الميدترم في الجامعات تبدأ الأسبوع الجاي', 'عاجل: نجوم النيل يكسب ماتش نار قدام دلتا', 'عاجل: الأرصاد: الجو معتدل الصبح وبرد بالليل'],
      en: ['BREAKING: Midterm exams at universities start next week', 'BREAKING: Nile Stars win thriller against Delta FC', 'BREAKING: Forecast: mild days, cold nights'],
    },
    sections: { ar: ['الرئيسية', 'أخبار مصر', 'رياضة', 'فن', 'اقتصاد', 'تكنولوجيا', 'صحة', 'فيديو'], en: ['Home', 'Egypt', 'Sports', 'Arts', 'Economy', 'Tech', 'Health', 'Video'] },
    items: [
      { id: 'k-match', kind: 'serious', cat: 'sports', pages: 3, views: '48K',
        title: { ar: 'ماتش نار.. نجوم النيل يحسم القمة قدام دلتا في آخر دقايق', en: 'Nile Stars clinch dramatic late win over Delta FC' },
        body: {
          ar: ['ستاد القاهرة شهد امبارح ماتش نار بين نجوم النيل ودلتا في الأسبوع العاشر من الدوري، والمدرجات كانت مليانة.', 'دلتا بدأ الماتش جامد وجاب جول بدري في الدقيقة 12، وقبل نهاية الشوط الأول نجوم النيل عادل من ضربة جزا.', 'وفي الشوط التاني كل فريق سبق التاني، نجوم النيل جاب التاني، ودلتا رجع عادل في الدقيقة 78.', 'وقبل صفارة النهاية بدقيقتين، المهاجم الصغير كريم سامي خطف جول الفوز براسية جامدة، والماتش خلص بفوز نجوم النيل 3 أجوال مقابل جولين.', 'وبالفوز ده نجوم النيل وصل لـ 24 نقطة في صدارة الجدول، ودلتا وقف عند 19 نقطة في المركز الرابع.', 'ومدرب نجوم النيل قال في المؤتمر الصحفي بعد الماتش إن الفريق ورّى شخصية قوية، بس لسه الطريق طويل للدوري.'],
          en: ['Cairo International Stadium hosted a fiery clash last night between Nile Stars and Delta FC in week ten of the league, in front of a big crowd.', 'Delta started strongly and took an early lead in the 12th minute, before Nile Stars levelled from the penalty spot just before half-time.', 'In the second half the lead changed hands again: Nile Stars scored a second, then Delta equalised in the 78th minute.', 'Two minutes from time, young striker Karim Samy headed in the winner, and the match ended in a 3–2 win for Nile Stars.', 'The win lifts Nile Stars to 24 points at the top of the table, while Delta stay on 19 points in fourth place.', 'Nile Stars’ coach told the post-match press conference that the team showed real character, but the road to the title is still long.'],
        } },
      { id: 'k-shock', kind: 'clickbait', cat: 'celeb', views: '312K',
        title: { ar: 'شوف قبل ما يتمسح.. فيديو صادم لفنانة مشهورة على بحر الساحل', en: 'Watch before it’s deleted: shocking video of famous actress at the beach' },
        body: { ar: ['الناس على السوشيال اتداولت فيديو قصير لفنانة معروفة وهي في إجازتها في الساحل الشمالي، وكانت بتلعب مع ولادها على البحر.', 'والفيديو مافيهوش أي حاجة غريبة، بس جاب آلاف المشاهدات في كام ساعة.'], en: ['Social media users shared a short video of a well-known actress on holiday on the North Coast, playing with her children on the beach.', 'Nothing unusual happens in the video, but it racked up thousands of views within hours.'] } },
      { id: 'k-gold', kind: 'clickbait', cat: 'economy', views: '205K',
        title: { ar: 'مش هتصدق اللي حصل لسعر الدهب النهارده! (تحديث لحظة بلحظة)', en: 'You won’t believe what happened to gold prices today! (live)' },
        body: { ar: ['أسعار الدهب اتحركت حركة بسيطة النهارده، وسعر الجرام زاد شوية عن قفلة امبارح.', 'والخبرا بينصحوا إنك ماتشتريش ولا تبيع على حركة يوم واحد.'], en: ['Gold prices moved slightly today, with the price per gram up a little compared with yesterday’s close.', 'Experts advise against buying or selling based on a single day’s movement.'] } },
      { id: 'k-survey', kind: 'serious', cat: 'economy', views: '12K',
        title: { ar: 'استطلاع: 6 من كل 10 شباب بيشتروا أونلاين كل أسبوع', en: 'Survey: 6 in 10 young people shop online every week' },
        body: { ar: ['استطلاع جديد على 2000 شاب وبنت قال إن 60% منهم بيشتروا أونلاين مرة على الأقل كل أسبوع، والموبايل هو الوسيلة الأساسية للشرا.', 'والاستطلاع قال إن العروض اللي ليها وقت محدود وإعلانات السوشيال هما أكتر حاجة بتخلي الشباب يشتروا على طول.'], en: ['A recent survey of 2,000 young people found that 60% shop online at least once a week, mostly on their phones.', 'Time-limited offers and social media ads were the biggest triggers for impulse purchases.'] } },
      { id: 'k-drink', kind: 'clickbait', cat: 'health', views: '540K',
        title: { ar: 'مشروب سحري بيحرق دهون البطن في 3 أيام بس.. الدكاترة مصدومين', en: 'Magic drink burns belly fat in just 3 days — doctors are shocked' },
        body: { ar: ['اليومين دول انتشرت وصفات مشروبات بتوعد بنتايج سريعة في التخسيس، بس دكاترة التغذية بيأكدوا إن مافيش مشروب لوحده بيحرق دهون.', 'والمتخصصين بينصحوا بأكل متوازن ورياضة منتظمة بدل الحلول السريعة.'], en: ['Recipes for drinks promising rapid weight loss have been spreading, but nutritionists say no single drink burns fat on its own.', 'Specialists recommend a balanced diet and regular activity instead of quick fixes.'] } },
      { id: 'k-ids', kind: 'serious', cat: 'education', views: '9K',
        title: { ar: 'الجامعات هتجرّب كارنيه الطلبة الديجيتال الترم الجاي', en: 'Universities to pilot digital student ID cards next term' },
        body: { ar: ['عدد من الجامعات أعلن إنه هيبدأ يجرّب كارنيهات ديجيتال للطلبة على الموبايل، تتستخدم في دخول الجامعة والمكتبات ولجان الامتحانات.', 'وإدارات الجامعات أكدت إن بيانات الطلبة هتتحفظ بمعايير الخصوصية، والكارنيه البلاستيك هيفضل موجود للي عايزه.'], en: ['Several universities announced a pilot of digital student IDs on mobile phones, to be used for campus entry, libraries and exam halls.', 'University administrations said student data will be stored under privacy standards, and plastic cards will remain available.'] } },
      { id: 'k-sponsor', kind: 'sponsored', cat: 'crypto', views: '1.1M', scam: true,
        title: { ar: 'شاب مصري بيكسب 5000 جنيه في اليوم من موبايله.. اعرف السر قبل ما المقال يتمسح', en: 'Egyptian student earns 5,000 EGP a day from his phone — the secret' },
        body: { ar: ['محتوى إعلاني'], en: ['Advertorial'] } },
      { id: 'k-parks', kind: 'serious', cat: 'local', views: '7K',
        title: { ar: 'افتتاح 3 جناين جديدة وتطوير ممشى الحي', en: 'Three new public parks open as district upgrades walkways' },
        body: { ar: ['رئيس الحي افتتح 3 جناين جديدة فيها ألعاب للأطفال وممشى، ضمن خطة لزيادة المساحات الخضرا.', 'وقال إن الجناين هتفتح كل يوم من 7 الصبح لحد 11 بالليل برسوم رمزية.'], en: ['The district head opened three new public parks with children’s play areas and walking paths, as part of a plan to add green space.', 'He said the parks will be open daily from 7 am to 11 pm for a small fee.'] } },
    ],
    task: { q: { ar: 'الماتش بين نجوم النيل ودلتا خلص كام؟', en: 'What was the final score of Nile Stars vs Delta FC?' },
      choices: ['2 – 1', '3 – 2', '1 – 1', '3 – 1'], correct: 1,
      hint: { ar: 'دوّر في موقع "الخبر الآن"', en: 'Search on “Al-Khabar Now”' } },
    recall: { q: { ar: 'الإعلان اللي ملا الشاشة أول ما دخلت كان بيعلن عن إيه؟', en: 'What did the full-screen ad at the start advertise?' },
      choices: { ar: ['كمبوند سكني', 'شبكة موبايل', 'أبلكيشن توصيل أكل', 'بنك'], en: ['A housing compound', 'A mobile network', 'A food delivery app', 'A bank'] }, correct: 0 },
  };

  // ============ SITE 2: The Global Ledger (serious broadsheet, paywall) ============
  const ledger = {
    name: { ar: 'ذا جلوبال ليدجر', en: 'The Global Ledger' },
    sections: { ar: ['العالم', 'اقتصاد', 'تكنولوجيا', 'مناخ', 'ثقافة', 'رأي'], en: ['World', 'Business', 'Tech', 'Climate', 'Culture', 'Opinion'] },
    items: [
      { id: 'l-water', kind: 'serious', cat: 'climate', read: 7, lead: true,
        title: { ar: 'سباق مع الوقت: إزاي المدن اللي على البحر بتفكر في الميه من جديد', en: 'Racing the tide: how coastal cities are rethinking water' },
        dek: { ar: 'من إسكندرية لروتردام، المدن بتجرّب حلول جديدة لارتفاع البحر.', en: 'From Alexandria to Rotterdam, cities are testing new answers to rising seas.' },
        body: {
          ar: ['على طول الكورنيش، المهندسين بيراقبوا منسوب الميه بحساسات جديدة بتبعت قراياتها كل دقيقة. السؤال مابقاش هل البحر هيعلى، لكن المدينة هتتأقلم إزاي.', 'خبيرة التخطيط العمراني منى الشريف بتقول إن الحلول القديمة زي الحواجز الخرسانة مابقتش كفاية لوحدها، والمدن محتاجة «تعيش مع الميه بدل ما تحاربها».', 'وفيه مدن أوروبية بتجرّب ميادين عامة بتتحول لخزانات مؤقتة وقت العواصف، ومدن تانية بترجّع الكثبان الرملية والزرع اللي على الشط كخط دفاع طبيعي.', 'بس الحلول دي غالية، ومحتاجة تعاون بين الحكومات والسكان والقطاع الخاص، وده مش دايمًا موجود.', 'والباحثين شايفين إن البيانات المفتوحة ممكن تكون مفتاح مهم، لأنها بتخلي السكان يعرفوا المخاطر في مناطقهم ويشاركوا في القرار.', 'وفي الآخر، شكله كده مستقبل المدن اللي على البحر هيتكتب بقرارات بتتاخد في العشر سنين دول، مش بعدين خالص.'],
          en: ['Along the seafront, engineers watch water levels with new sensors that report every minute. The question is no longer whether the sea will rise, but how the city will adapt.', 'Urban planner Mona El-Sherif says traditional fixes such as concrete barriers are no longer enough on their own; cities need to “live with water instead of fighting it”.', 'Some European cities are trialling public squares that become temporary reservoirs during storms, while others are replanting dunes and coastal plants as a natural line of defence.', 'But these solutions are expensive, and they need cooperation between governments, residents and business that is not always there.', 'Researchers argue open data could be key, letting residents see the risks in their own neighbourhoods and take part in decisions.', 'In the end, the future of coastal cities looks set to be written by decisions made this decade, not in the distant future.'],
        } },
      { id: 'l-ai', kind: 'serious', cat: 'tech', read: 6,
        title: { ar: 'هل الذكاء الاصطناعي بيغيّر طريقة قرايتنا للأخبار؟', en: 'Is AI changing the way we read the news?' },
        dek: { ar: 'غرف الأخبار بتجرّب الملخصات الأوتوماتيك، والقرّاء مختلفين.', en: 'Newsrooms are testing automated summaries, and readers are divided.' },
        body: { ar: ['مؤسسات إعلامية كتير بدأت تقدم ملخصات قصيرة للمقالات بيكتبها الذكاء الاصطناعي، عشان تشد القارئ المستعجل.', 'بس دراسات أولية بتقول إن اللي بيكتفوا بالملخص بيفتكروا تفاصيل أقل وبيثقوا في المصدر أقل.', 'وباحثين في الإعلام بيحذروا إن «اقتصاد الانتباه» ممكن يخلي المؤسسات تفضّل السرعة على الدقة.', 'وفي المقابل، فيه ناس شايفة إن الأدوات دي ممكن توصل لجمهور جديد ماكانش بيقرا أخبار أصلًا.'], en: ['Many media organisations now offer short AI-written summaries of articles, aimed at readers in a hurry.', 'But early studies suggest readers who stop at the summary remember fewer details and trust the source less.', 'Media researchers warn that the “attention economy” may push outlets to put speed ahead of accuracy.', 'Others argue the tools could reach new audiences who never read the news at all.'] } },
      { id: 'l-markets', kind: 'serious', cat: 'economy', read: 5,
        title: { ar: 'الأسواق الناشئة بتراهن على الشباب الديجيتال', en: 'Emerging markets bet on digital-native youth' },
        dek: { ar: 'جيل زد بقى المحرك الأول للتجارة الأونلاين في المنطقة.', en: 'Gen Z is now the main engine of e-commerce in the region.' },
        body: { ar: ['تقارير اقتصادية بتقول إن الشباب اللي تحت 27 سنة بقوا أسرع شريحة بتكبر في التجارة الأونلاين في المنطقة.', 'والشركات بتتنافس عشان تشد الجيل ده بأبلكيشنات سهلة وطرق دفع مرنة.'], en: ['Economic reports show under-27s are now the fastest-growing group in the region’s e-commerce.', 'Companies are competing for this generation with easy-to-use apps and flexible payment options.'] } },
      { id: 'l-museum', kind: 'serious', cat: 'culture', read: 4,
        title: { ar: 'متاحف من غير حيطان: الثقافة بتنقل على الموبايل', en: 'Museums without walls: culture moves to the phone' },
        dek: { ar: 'جولات أونلاين وتجارب تفاعلية بتشد جمهور أصغر.', en: 'Virtual tours and interactive exhibits are drawing a younger crowd.' },
        body: { ar: ['المتاحف في العالم كله بقت بتقدم جولات أونلاين وتجارب تفاعلية على الموبايل.', 'واللي ماسكينها بيقولوا إن الهدف مش إنها تبقى بديل للزيارة الحقيقية، لكن إنها تفتح فضول جمهور جديد.'], en: ['Museums around the world are offering virtual tours and interactive experiences on phones.', 'Curators say the aim is not to replace real visits, but to spark curiosity in new audiences.'] } },
      { id: 'l-opinion', kind: 'serious', cat: 'opinion', read: 4,
        title: { ar: 'رأي: احنا مش بنستخدم الأبلكيشنات.. الأبلكيشنات هي اللي بتستخدمنا', en: 'Opinion: we don’t use apps — apps use us' },
        dek: { ar: 'عن النوتيفيكيشنز اللي مابتخلصش والتصميم اللي بيسرق وقتنا.', en: 'On endless notifications and design that steals our time.' },
        body: { ar: ['فتحت موبايلك كام مرة النهارده من غير سبب واضح؟ غالبًا أكتر ما تتخيل.', 'تصميم الأبلكيشنات الحديث مش هدفه راحتك وبس، هدفه إنك تفضل جوه أطول وقت ممكن.'], en: ['How many times did you open your phone today for no clear reason? Probably more than you think.', 'Modern app design isn’t only about your comfort; it’s about keeping you there as long as possible.'] } },
      { id: 'l-partner', kind: 'sponsored', cat: 'economy', read: 3, partner: true,
        title: { ar: '5 طرق ذكية تكبّر بيها فلوسك في 2026', en: '5 smart ways to grow your savings in 2026' },
        dek: { ar: 'بالتعاون مع بنك فيوتشر', en: 'In partnership with Future Bank' },
        body: { ar: ['محتوى مقدّم من شريك تجاري. ابدأ بإنك تحدد أهدافك المالية، وبعدين افتح حساب توفير ذكي من بنك فيوتشر بعايد مميز.'], en: ['Content from a commercial partner. Start by setting your goals, then open a Smart Savings account with Future Bank.'] } },
    ],
    recall: { q: { ar: 'النافذة اللي ظهرتلك في "ذا جلوبال ليدجر" كانت عايزاك تعمل إيه؟', en: 'What did the pop-up on The Global Ledger ask you to do?' },
      choices: { ar: ['تشترك في نشرة على الإيميل', 'تنزّل أبلكيشن', 'تدخل مسابقة', 'تقيّم الموقع'], en: ['Sign up for a newsletter', 'Download an app', 'Enter a contest', 'Rate the website'] }, correct: 0 },
  };

  // ============ SITE 3: ViralVault (clickbait) ============
  const foods = {
    ar: ['المانجا', 'الرمان', 'البطيخ', 'التوم', 'الخيار', 'البيض', 'الموز', 'العيش البلدي', 'البرتقان', 'العسل'],
    en: ['Mango', 'Pomegranate', 'Watermelon', 'Garlic', 'Cucumber', 'Eggs', 'Banana', 'Baladi bread', 'Oranges', 'Honey'],
  };
  const foodTips = {
    ar: ['قشّرها بالكوباية بدل السكينة.. أسهل وأنضف!', 'اخبطه بالمعلقة من ضهره والحبّات هتنزل لوحدها.', 'قطّعه صوابع بدل الشرايح عشان يتاكل بسهولة.', 'اهرسه قبل الطبيخ بعشر دقايق عشان تاخد فايدة أكتر.', 'ماتقشروش كله.. القشر مليان ألياف.', 'حطه في التلاجة بعيد عن الباب.', 'افتحه من تحت زي القرود! 🐒', 'سخّنه بشوية ميه عشان يرجع طري.', 'دحرجه على الترابيزة قبل ما تعصره عشان يطلع عصير أكتر.', 'ماتحطوش في ميه بتغلي عشان فوايده ماتروحش.'],
    en: ['Peel it with a glass instead of a knife — easier and cleaner!', 'Tap the back with a spoon and the seeds fall out.', 'Cut it into sticks, not slices, so it’s easier to eat.', 'Crush it ten minutes before cooking for more benefit.', 'Don’t peel it fully — the skin is full of fibre.', 'Keep them in the fridge, away from the door.', 'Open it from the bottom end like monkeys do! 🐒', 'Warm it with a splash of water to soften it again.', 'Roll them on the table before squeezing for more juice.', 'Never stir it into boiling water or it loses its benefits.'],
  };
  const viral = {
    name: { ar: 'فايرال فولت', en: 'ViralVault' },
    items: [
      { id: 'v-foods', kind: 'clickbait', cat: 'food', list: true, reading: '2.3K',
        title: { ar: '10 أكلات بتاكلها غلط طول عمرك.. رقم 7 هيصدمك! 😱', en: '10 foods you’ve been eating wrong your whole life — #7 will shock you! 😱' } },
      { id: 'v-phone', kind: 'clickbait', cat: 'tech', reading: '1.8K',
        title: { ar: 'الحركة البسيطة دي بتضاعف عمر بطارية موبايلك.. الشركات مش عايزاك تعرفها', en: 'This simple trick doubles your battery life — phone companies hate it' },
        body: { ar: ['الحركة هي: وطّي سطوع الشاشة واقفل الأبلكيشنات اللي شغالة في الخلفية. أيوه، بس كده.', 'والخبرا كمان بينصحوا إنك ماتشحنش لـ 100% على طول.'], en: ['The trick: lower your screen brightness and close apps running in the background. Yes, that’s it.', 'Experts also suggest not always charging to 100%.'] } },
      { id: 'v-star', kind: 'clickbait', cat: 'celeb', reading: '4.1K',
        title: { ar: 'نجم مشهور شكله اتغير خالص.. مش هتعرفه! 👀', en: 'Famous star looks totally different now — you won’t recognise him! 👀' },
        body: { ar: ['الممثل ظهر في صورة جديدة بعد ما ربّى دقنه عشان دور جديد.', 'وبس، هي دي الحكاية كلها.'], en: ['The actor appeared in a new photo after growing a beard for an upcoming role.', 'That’s the whole story.'] } },
      { id: 'v-quiz', kind: 'clickbait', cat: 'celeb', reading: '3.3K',
        title: { ar: 'اختبار: اختار مشروب وهنقولك شخصيتك الحقيقية ☕🧋', en: 'Quiz: pick a drink and we’ll reveal your true personality ☕🧋' },
        body: { ar: ['اختار مشروبك المفضل دلوقتي... والنتيجة بعد الإعلان!', 'النتيجة: إنت شخص بيحب المشروبات. 😄'], en: ['Choose your favourite drink now... results after the ad!', 'Your result: you are a person who enjoys drinks. 😄'] } },
      { id: 'v-sponsor', kind: 'sponsored', cat: 'crypto', reading: '9.9K', scam: true,
        title: { ar: 'طالب جامعة حوّل 500 جنيه لـ 50 ألف في شهر.. شوف عملها إزاي', en: 'University student turned 500 EGP into 50K in one month — here’s how' } },
      { id: 'v-science', kind: 'serious', cat: 'health', reading: '210',
        title: { ar: 'دراسة: النوم 7 ساعات بيحسّن التركيز في الامتحانات', en: 'Study: 7 hours of sleep improves focus during exams' },
        body: { ar: ['دراسة على مئات الطلبة لقت إن اللي ناموا 7 ساعات على الأقل قبل الامتحان جابوا نتايج أحسن في اختبارات التركيز والذاكرة.', 'والباحثين بينصحوا تبعد عن الشاشات قبل النوم بساعة.'], en: ['A study of hundreds of students found that those who slept at least 7 hours before an exam did better on focus and memory tests.', 'Researchers recommend avoiding screens for an hour before bed.'] } },
    ],
    feedTitles: {
      ar: ['قطة بتتصرف كأنها بني آدم.. الفيديو اللي بكّى الملايين 🐱', '15 صورة مش هتصدق إنها مش متعدلة 📸', 'إيه اللي بيحصل لجسمك لو شربت ميه على الريق؟', 'أغرب 10 شغلانات في العالم.. رقم 4 بجد!', 'تقدر تحل اللغز ده؟ 98% فشلوا 🧠', 'شوف رد فعل الجمهور لما اللعيب ده ظهر', '7 علامات بتقول إنك ذكي جدًا', 'كشري في 10 دقايق.. السر في الصلصة 🍝', 'ليه الأذكيا بيقعدوا في آخر المدرج؟', 'أبلكيشن جديد بيكشف مين دخل على بروفايلك؟ الحقيقة هنا'],
      en: ['Cat acts like a human — the video that made millions cry 🐱', '15 photos you won’t believe aren’t edited 📸', 'What happens to your body if you drink water first thing?', 'The 10 weirdest jobs in the world — #4 is real!', 'Can you solve this puzzle? 98% fail 🧠', 'Watch the crowd’s reaction when this player appeared', '7 signs you’re secretly very smart', 'Koshary in 10 minutes — the secret is the sauce 🍝', 'Why do smart people sit at the back of the class?', 'New app reveals who viewed your profile? The truth'],
    },
    foods, foodTips,
    task: { q: { ar: 'في مقال "10 أكلات بتاكلها غلط"، الأكلة رقم 7 إيه؟', en: 'In “10 foods you’ve been eating wrong”, what is food #7?' },
      choices: { ar: ['الموز', 'التوم', 'المانجا', 'البيض'], en: ['Banana', 'Garlic', 'Mango', 'Eggs'] }, correct: 0,
      hint: { ar: 'دوّر في موقع "فايرال فولت"', en: 'Search on “ViralVault”' } },
    recall: { q: { ar: 'إعلان الفيديو في "فايرال فولت" كان بيعلن عن إيه؟', en: 'What did the video ad on ViralVault advertise?' },
      choices: { ar: ['مشروب طاقة', 'موبايل', 'بنك', 'لعبة'], en: ['An energy drink', 'A mobile phone', 'A bank', 'A game'] }, correct: 0 },
  };

  // ============ Spot the ad ============
  const spot = [
    { ad: false, cat: 'education', src: { ar: 'الخبر الآن', en: 'Al-Khabar Now' }, t: { ar: 'جدول امتحانات الميدترم نزل على موقع الكلية', en: 'Midterm exam timetable now available on the faculty website' } },
    { ad: true, native: true, cat: 'crypto', src: { ar: 'نيل كوين · ممول', en: 'NileCoin · Sponsored' }, t: { ar: 'خبير اقتصادي: العملة دي هتضرب في 10 قبل آخر السنة', en: 'Economist: this coin will 10× before the end of the year' } },
    { ad: false, cat: 'sports', src: { ar: 'ذا جلوبال ليدجر', en: 'The Global Ledger' }, t: { ar: 'منتخب الشباب يطلع النهائي بعد ماتش صعب', en: 'Youth national team reaches the final after a tough match' } },
    { ad: true, native: true, cat: 'health', src: { ar: 'مقترح ليك', en: 'Recommended for you' }, t: { ar: 'دكاترة بيكشفوا: معلقة واحدة قبل النوم بتدوّب الدهون', en: 'Doctors reveal: one spoon before bed melts fat' } },
    { ad: false, cat: 'climate', src: { ar: 'ذا جلوبال ليدجر', en: 'The Global Ledger' }, t: { ar: 'موجة حر جاية آخر الأسبوع.. خلي بالك من نفسك', en: 'Heatwave expected this weekend — tips to stay safe' } },
    { ad: true, native: false, cat: 'tech', src: { ar: 'إعلان', en: 'Ad' }, t: { ar: 'نيل تل: 50 جيجا بـ 99 جنيه بس! اشترك دلوقتي', en: 'NileTel: 50GB for just 99 EGP! Subscribe now' } },
    { ad: false, cat: 'culture', src: { ar: 'الخبر الآن', en: 'Al-Khabar Now' }, t: { ar: 'معرض الكتاب أعلن مواعيده الجديدة', en: 'The book fair announces its new dates' } },
    { ad: true, native: true, cat: 'local', src: { ar: 'بالتعاون مع نايل جاردنز', en: 'Paid partnership · Nile Gardens' }, t: { ar: 'ليه الشباب بيعزّلوا للمدن الجديدة؟ حكايات حقيقية', en: 'Why are young people moving to new cities? Real stories' } },
    { ad: false, cat: 'economy', src: { ar: 'فايرال فولت', en: 'ViralVault' }, t: { ar: 'استطلاع: الطلبة بيقضّوا 6 ساعات في اليوم على الموبايل', en: 'Survey: students spend 6 hours a day on their phones' } },
    { ad: false, cat: 'tech', src: { ar: 'ذا جلوبال ليدجر', en: 'The Global Ledger' }, t: { ar: 'تحديث جديد بيضيف ميزة "وقت الشاشة" للموبايلات', en: 'New update adds a “screen time” feature to phones' } },
  ];

  window.CONTENT = { thumb, body, FILL, alkhabar, ledger, viral, spot };
})();
