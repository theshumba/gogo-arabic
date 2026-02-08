/**
 * Reading Comprehension Passages
 *
 * Collection of Arabic passages with English translations,
 * transliterations, and comprehension questions.
 * Designed for progressive difficulty levels (1-4).
 */

export const PASSAGES = [
  // Difficulty 1: Simple, present tense, basic vocabulary
  {
    id: 'market_visit',
    title: 'A Visit to the Market',
    titleArabic: 'زيارة إلى السوق',
    difficulty: 1,
    arabic: 'ذهبتُ إلى السوق. اشتريتُ خبزاً وفواكه. السوق كبير وجميل.',
    english: 'I went to the market. I bought bread and fruits. The market is big and beautiful.',
    transliteration: 'dhahabtu ila as-suq. ishtaraytu khubzan wa fawaakih. as-suq kabeer wa jameel.',
    vocabHighlights: ['السوق', 'خبز', 'فواكه', 'كبير', 'جميل'],
    questions: [
      {
        question: 'Where did the narrator go?',
        questionArabic: 'إلى أين ذهب الراوي؟',
        options: ['The school', 'The market', 'The library', 'The park'],
        correct: 1,
      },
      {
        question: 'What did they buy?',
        questionArabic: 'ماذا اشترى؟',
        options: ['Meat and fish', 'Bread and fruits', 'Clothes and shoes', 'Books and pens'],
        correct: 1,
      },
      {
        question: 'How is the market described?',
        questionArabic: 'كيف وصف السوق؟',
        options: ['Small and quiet', 'Big and beautiful', 'Old and dark', 'New and modern'],
        correct: 1,
      },
    ],
  },
  {
    id: 'my_family',
    title: 'My Family',
    titleArabic: 'عائلتي',
    difficulty: 1,
    arabic: 'عائلتي كبيرة. لي أب وأم. لي أخ وأخت. نحن سعداء.',
    english: 'My family is big. I have a father and mother. I have a brother and sister. We are happy.',
    transliteration: 'aa\'ilatee kabeerah. lee ab wa umm. lee akh wa ukht. nahnu su\'adaa.',
    vocabHighlights: ['عائلة', 'أب', 'أم', 'أخ', 'أخت', 'سعداء'],
    questions: [
      {
        question: 'How is the family described?',
        questionArabic: 'كيف وصفت العائلة؟',
        options: ['Small', 'Big', 'Sad', 'Busy'],
        correct: 1,
      },
      {
        question: 'Who are the family members mentioned?',
        questionArabic: 'من هم أفراد العائلة المذكورون؟',
        options: [
          'Father, mother, uncle',
          'Father, mother, brother, sister',
          'Mother, grandmother, sister',
          'Father, brother, cousin'
        ],
        correct: 1,
      },
      {
        question: 'How does the family feel?',
        questionArabic: 'كيف تشعر العائلة؟',
        options: ['Tired', 'Sad', 'Happy', 'Angry'],
        correct: 2,
      },
    ],
  },

  // Difficulty 2: More complex sentences, past/future tense
  {
    id: 'day_at_school',
    title: 'A Day at School',
    titleArabic: 'يوم في المدرسة',
    difficulty: 2,
    arabic: 'استيقظتُ مبكراً. ذهبتُ إلى المدرسة مع صديقي. درسنا اللغة العربية والرياضيات. المعلمة لطيفة جداً.',
    english: 'I woke up early. I went to school with my friend. We studied Arabic and mathematics. The teacher is very kind.',
    transliteration: 'istayqadhtu mubakkiran. dhahabtu ila al-madrasah ma\'a sadeeqee. darasna al-lughah al-\'arabiyyah wa ar-riyadhiyaat. al-mu\'allimah lateefah jiddan.',
    vocabHighlights: ['استيقظ', 'المدرسة', 'صديق', 'درس', 'المعلمة', 'لطيف'],
    questions: [
      {
        question: 'When did the narrator wake up?',
        questionArabic: 'متى استيقظ الراوي؟',
        options: ['Late', 'Early', 'At noon', 'At night'],
        correct: 1,
      },
      {
        question: 'Who went to school with the narrator?',
        questionArabic: 'من ذهب إلى المدرسة مع الراوي؟',
        options: ['His brother', 'His friend', 'His mother', 'Alone'],
        correct: 1,
      },
      {
        question: 'What subjects did they study?',
        questionArabic: 'ما المواد التي درسوها؟',
        options: [
          'Science and history',
          'Arabic and mathematics',
          'English and art',
          'Geography and sports'
        ],
        correct: 1,
      },
    ],
  },
  {
    id: 'weather_today',
    title: 'The Weather Today',
    titleArabic: 'الطقس اليوم',
    difficulty: 2,
    arabic: 'الطقس اليوم جميل. الشمس مشرقة والسماء صافية. الأطفال يلعبون في الحديقة. الجو دافئ وممتع.',
    english: 'The weather today is beautiful. The sun is shining and the sky is clear. The children are playing in the garden. The atmosphere is warm and pleasant.',
    transliteration: 'at-taqs al-yawm jameel. ash-shams mushriqah wa as-samaa\'u saafiyah. al-atfaalu yal\'abuna fee al-hadeeqah. al-jaww daafi\' wa mumti\'.',
    vocabHighlights: ['الطقس', 'الشمس', 'السماء', 'الحديقة', 'دافئ', 'ممتع'],
    questions: [
      {
        question: 'How is the weather described?',
        questionArabic: 'كيف وصف الطقس؟',
        options: ['Cold and rainy', 'Beautiful', 'Windy', 'Stormy'],
        correct: 1,
      },
      {
        question: 'What are the children doing?',
        questionArabic: 'ماذا يفعل الأطفال؟',
        options: ['Studying', 'Playing in the garden', 'Sleeping', 'Eating'],
        correct: 1,
      },
      {
        question: 'How is the sky described?',
        questionArabic: 'كيف وصفت السماء؟',
        options: ['Dark', 'Cloudy', 'Clear', 'Red'],
        correct: 2,
      },
    ],
  },

  // Difficulty 3: Complex narratives, descriptive language
  {
    id: 'cooking_traditional',
    title: 'Cooking Traditional Food',
    titleArabic: 'طبخ الطعام التقليدي',
    difficulty: 3,
    arabic: 'أمي تطبخ طعاماً تقليدياً. تستخدم الأرز واللحم والتوابل. رائحة الطعام جميلة. سنأكل مع العائلة الكبيرة. هذا تقليد عائلي قديم.',
    english: 'My mother cooks traditional food. She uses rice, meat, and spices. The smell of the food is beautiful. We will eat with the extended family. This is an old family tradition.',
    transliteration: 'ummee tatbukh ta\'aaman taqleediyyan. tasta\'mil al-aruzz wa al-lahm wa at-tawaabil. raa\'ihat at-ta\'aam jameelah. sanaakul ma\'a al-\'aa\'ilah al-kabeerah. hadha taqleed \'aa\'ilyy qadeem.',
    vocabHighlights: ['تطبخ', 'تقليدي', 'الأرز', 'اللحم', 'التوابل', 'تقليد'],
    questions: [
      {
        question: 'Who is cooking the food?',
        questionArabic: 'من يطبخ الطعام؟',
        options: ['The father', 'The mother', 'The grandmother', 'The sister'],
        correct: 1,
      },
      {
        question: 'What ingredients are mentioned?',
        questionArabic: 'ما المكونات المذكورة؟',
        options: [
          'Bread and cheese',
          'Rice, meat, and spices',
          'Vegetables and fruits',
          'Fish and potatoes'
        ],
        correct: 1,
      },
      {
        question: 'Who will they eat with?',
        questionArabic: 'مع من سيأكلون؟',
        options: ['Friends', 'Neighbors', 'Extended family', 'Alone'],
        correct: 2,
      },
    ],
  },
  {
    id: 'desert_journey',
    title: 'A Journey Through the Desert',
    titleArabic: 'رحلة عبر الصحراء',
    difficulty: 3,
    arabic: 'سافرنا عبر الصحراء الواسعة. رأينا الجمال والواحات الخضراء. الليل في الصحراء بارد والنجوم واضحة. تعلمنا الكثير عن حياة البدو.',
    english: 'We traveled through the vast desert. We saw camels and green oases. The night in the desert is cold and the stars are clear. We learned a lot about the Bedouin life.',
    transliteration: 'saafarna \'abr as-sahraa\' al-waasi\'ah. ra\'ayna al-jimaal wa al-waahaat al-khadhraa\'. al-layl fee as-sahraa\' baarid wa an-nujuum waadhihah. ta\'allamnaa al-katheer \'an hayaat al-badw.',
    vocabHighlights: ['سافر', 'الصحراء', 'الجمال', 'الواحة', 'البدو', 'النجوم'],
    questions: [
      {
        question: 'What landscape did they travel through?',
        questionArabic: 'عبر أي مشهد سافروا؟',
        options: ['Mountains', 'Forest', 'Desert', 'Ocean'],
        correct: 2,
      },
      {
        question: 'What animals did they see?',
        questionArabic: 'ما الحيوانات التي رأوها؟',
        options: ['Horses', 'Camels', 'Lions', 'Birds'],
        correct: 1,
      },
      {
        question: 'How is the desert night described?',
        questionArabic: 'كيف وصف ليل الصحراء؟',
        options: ['Hot and humid', 'Cold with clear stars', 'Rainy', 'Cloudy'],
        correct: 1,
      },
    ],
  },

  // Difficulty 4: Advanced vocabulary, literary style
  {
    id: 'old_library',
    title: 'The Old Library',
    titleArabic: 'المكتبة القديمة',
    difficulty: 4,
    arabic: 'زرتُ مكتبة قديمة في وسط المدينة. الكتب فيها عمرها مئات السنين. بعضها مكتوب بخط اليد الجميل. المكتبة كنز من المعرفة والتاريخ. قضيتُ ساعات في قراءة المخطوطات القديمة.',
    english: 'I visited an old library in the city center. The books there are hundreds of years old. Some are written in beautiful calligraphy. The library is a treasure of knowledge and history. I spent hours reading ancient manuscripts.',
    transliteration: 'zurtu maktabah qadeemah fee wasat al-madeenah. al-kutub feehaa \'umruhaa mi\'aat as-sineen. ba\'dhuhaa maktoob bi-khatt al-yad al-jameel. al-maktabah kanz min al-ma\'rifah wa at-taareekh. qadaytu saa\'aat fee qiraa\'at al-makhtootoat al-qadeemah.',
    vocabHighlights: ['المكتبة', 'قديمة', 'مخطوطات', 'المعرفة', 'التاريخ', 'خط اليد'],
    questions: [
      {
        question: 'Where is the library located?',
        questionArabic: 'أين تقع المكتبة؟',
        options: ['In the suburbs', 'In the city center', 'In the countryside', 'Near the sea'],
        correct: 1,
      },
      {
        question: 'How old are the books?',
        questionArabic: 'كم عمر الكتب؟',
        options: ['A few years', 'Tens of years', 'Hundreds of years', 'Thousands of years'],
        correct: 2,
      },
      {
        question: 'What is the library described as?',
        questionArabic: 'كيف وصفت المكتبة؟',
        options: [
          'A small room',
          'A modern building',
          'A treasure of knowledge and history',
          'A quiet place'
        ],
        correct: 2,
      },
    ],
  },
  {
    id: 'letter_to_friend',
    title: 'A Letter to a Friend',
    titleArabic: 'رسالة إلى صديق',
    difficulty: 4,
    arabic: 'عزيزي أحمد، أكتب إليك من المدينة الجديدة. الحياة هنا مختلفة تماماً. التقيتُ بأناس جدد وتعلمتُ أشياء كثيرة. أفتقدك كثيراً وأتطلع لزيارتك قريباً. أرجو أن تكون بخير.',
    english: 'Dear Ahmed, I am writing to you from the new city. Life here is completely different. I met new people and learned many things. I miss you a lot and look forward to visiting you soon. I hope you are well.',
    transliteration: 'azeezee ahmad, aktubu ilayka min al-madeenah al-jadeedah. al-hayaah hunaa mukhtalifah tamaman. iltaqaytu bi-unaas judud wa ta\'allamtu ashyaa\' katheerah. aftaqiduka katheeran wa atatalla\' li-ziyaaratik qareeban. arjoo an takoona bi-khayr.',
    vocabHighlights: ['عزيز', 'رسالة', 'مختلف', 'التقى', 'أفتقد', 'أتطلع'],
    questions: [
      {
        question: 'Who is the letter addressed to?',
        questionArabic: 'إلى من موجهة الرسالة؟',
        options: ['Mohamed', 'Ahmed', 'Hassan', 'Ali'],
        correct: 1,
      },
      {
        question: 'How does the writer describe life in the new city?',
        questionArabic: 'كيف وصف الكاتب الحياة في المدينة الجديدة؟',
        options: [
          'The same',
          'A little different',
          'Completely different',
          'Difficult'
        ],
        correct: 2,
      },
      {
        question: 'What does the writer express about their friend?',
        questionArabic: 'ماذا عبّر الكاتب عن صديقه؟',
        options: [
          'Anger',
          'Indifference',
          'Missing them and looking forward to visiting',
          'Disappointment'
        ],
        correct: 2,
      },
    ],
  },
];

/**
 * Get passages filtered by difficulty
 * @param {number} difficulty - Difficulty level (1-4)
 * @returns {Array} Filtered passages
 */
export function getPassagesByDifficulty(difficulty) {
  if (!difficulty) return PASSAGES;
  return PASSAGES.filter(p => p.difficulty === difficulty);
}

/**
 * Get a random passage of specified difficulty
 * @param {number} difficulty - Difficulty level (1-4)
 * @returns {Object} Random passage
 */
export function getRandomPassage(difficulty) {
  const filtered = difficulty ? getPassagesByDifficulty(difficulty) : PASSAGES;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

/**
 * Get passage by ID
 * @param {string} id - Passage ID
 * @returns {Object|null} Passage object or null
 */
export function getPassageById(id) {
  return PASSAGES.find(p => p.id === id) || null;
}
