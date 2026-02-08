/**
 * Grammar Lessons Data
 * Structured lessons covering Arabic grammar fundamentals
 */

export const grammarLessons = [
  {
    id: 'al-definite',
    title: 'The Definite Article: ال',
    titleArabic: 'أداة التعريف',
    category: 'basics',
    difficulty: 1,
    order: 1,
    explanation: `In Arabic, the definite article "the" is expressed by adding ال (al-) to the beginning of a word. This transforms an indefinite noun into a definite one.

For example:
• كتاب (kitaab) = "a book"
• الكتاب (al-kitaab) = "the book"

There's a twist though! Arabic has "sun letters" and "moon letters." When ال comes before a sun letter, the ل (L) sound assimilates into the following letter, though the spelling stays the same.

Sun letters: ت ث د ذ ر ز س ش ص ض ط ظ ل ن
Moon letters: أ ب ج ح خ ع غ ف ق ك م و ه ي`,
    examples: [
      {
        arabic: 'الكتاب',
        english: 'the book',
        transliteration: 'al-kitaab',
        breakdown: 'ال + كتاب',
      },
      {
        arabic: 'الشمس',
        english: 'the sun',
        transliteration: 'ash-shams',
        breakdown: 'ال + شمس (sun letter: ش)',
      },
      {
        arabic: 'القمر',
        english: 'the moon',
        transliteration: 'al-qamar',
        breakdown: 'ال + قمر (moon letter: ق)',
      },
      {
        arabic: 'البيت',
        english: 'the house',
        transliteration: 'al-bayt',
        breakdown: 'ال + بيت',
      },
    ],
    rules: [
      {
        rule: 'Sun letters assimilate the ل sound',
        example: 'الشمس → ash-shams (not al-shams)',
      },
      {
        rule: 'Moon letters keep the ل sound',
        example: 'القمر → al-qamar',
      },
      {
        rule: 'The spelling always uses ال regardless',
        example: 'Both sun and moon words are written with ال',
      },
    ],
    exercises: [
      {
        type: 'fill-blank',
        prompt: '___ كتاب (the book)',
        answer: 'ال',
        options: ['ال', 'إل', 'أل', 'لا'],
      },
      {
        type: 'translate',
        prompt: 'the house',
        answer: 'البيت',
        options: ['بيت', 'البيت', 'بيتي', 'بيتك'],
      },
      {
        type: 'fill-blank',
        prompt: '___ ولد (the boy)',
        answer: 'ال',
        options: ['ال', 'في', 'من', 'إلى'],
      },
      {
        type: 'translate',
        prompt: 'the girl',
        answer: 'البنت',
        options: ['بنت', 'البنت', 'بنتي', 'بنات'],
      },
      {
        type: 'match',
        prompt: 'Match the Arabic with English',
        pairs: [
          ['الولد', 'the boy'],
          ['البنت', 'the girl'],
          ['الكتاب', 'the book'],
          ['البيت', 'the house'],
        ],
      },
    ],
    quiz: [
      {
        question: 'Which word uses a sun letter?',
        options: ['القمر', 'الشمس', 'الكتاب', 'البيت'],
        correct: 1,
        explanation: 'الشمس (the sun) starts with ش, a sun letter, so it\'s pronounced "ash-shams"',
      },
      {
        question: 'How do you say "the book" in Arabic?',
        options: ['كتاب', 'الكتاب', 'كتابي', 'كتب'],
        correct: 1,
        explanation: 'الكتاب = "the book" (ال + كتاب)',
      },
      {
        question: 'What happens with sun letters?',
        options: [
          'The ال is removed',
          'The ل sound assimilates',
          'The word changes completely',
          'Nothing changes',
        ],
        correct: 1,
        explanation: 'With sun letters, the ل sound merges into the following letter, though spelling stays the same',
      },
      {
        question: 'Which is a moon letter?',
        options: ['ش', 'س', 'ت', 'ق'],
        correct: 3,
        explanation: 'ق is a moon letter, so القمر is pronounced "al-qamar"',
      },
    ],
  },

  {
    id: 'noun-adjective-agreement',
    title: 'Noun-Adjective Agreement',
    titleArabic: 'التوافق بين الاسم والصفة',
    category: 'nouns',
    difficulty: 2,
    order: 2,
    explanation: `In Arabic, adjectives must agree with the nouns they describe in three ways:
1. Gender (masculine/feminine)
2. Number (singular/dual/plural)
3. Definiteness (definite/indefinite)

Feminine adjectives usually end in ة (taa marbuuta). If the noun is definite (has ال), the adjective must also have ال.

The adjective comes AFTER the noun in Arabic (opposite of English).`,
    examples: [
      {
        arabic: 'ولد كبير',
        english: 'a big boy',
        transliteration: 'walad kabeer',
        breakdown: 'boy (masc.) + big (masc.)',
      },
      {
        arabic: 'بنت كبيرة',
        english: 'a big girl',
        transliteration: 'bint kabeerah',
        breakdown: 'girl (fem.) + big (fem.)',
      },
      {
        arabic: 'الولد الكبير',
        english: 'the big boy',
        transliteration: 'al-walad al-kabeer',
        breakdown: 'the boy (def.) + the big (def.)',
      },
      {
        arabic: 'البنت الكبيرة',
        english: 'the big girl',
        transliteration: 'al-bint al-kabeerah',
        breakdown: 'the girl (def. fem.) + the big (def. fem.)',
      },
    ],
    rules: [
      {
        rule: 'Adjective matches noun in gender',
        example: 'ولد كبير (masc.) vs بنت كبيرة (fem.)',
      },
      {
        rule: 'Adjective matches noun in definiteness',
        example: 'الولد الكبير (both definite)',
      },
      {
        rule: 'Adjective comes AFTER the noun',
        example: 'بيت جميل (beautiful house) not جميل بيت',
      },
      {
        rule: 'Feminine adjectives typically add ة',
        example: 'كبير → كبيرة',
      },
    ],
    exercises: [
      {
        type: 'translate',
        prompt: 'a big house',
        answer: 'بيت كبير',
        options: ['بيت كبير', 'كبير بيت', 'البيت الكبير', 'بيت كبيرة'],
      },
      {
        type: 'fill-blank',
        prompt: 'بنت _____ (a small girl)',
        answer: 'صغيرة',
        options: ['صغير', 'صغيرة', 'الصغيرة', 'الصغير'],
      },
      {
        type: 'translate',
        prompt: 'the beautiful girl',
        answer: 'البنت الجميلة',
        options: ['بنت جميلة', 'البنت الجميلة', 'الجميلة البنت', 'بنت الجميلة'],
      },
      {
        type: 'fill-blank',
        prompt: 'الولد _____ (the small boy)',
        answer: 'الصغير',
        options: ['صغير', 'الصغير', 'صغيرة', 'الصغيرة'],
      },
      {
        type: 'match',
        prompt: 'Match noun-adjective pairs',
        pairs: [
          ['ولد كبير', 'a big boy'],
          ['بنت كبيرة', 'a big girl'],
          ['الولد الكبير', 'the big boy'],
          ['البنت الكبيرة', 'the big girl'],
        ],
      },
    ],
    quiz: [
      {
        question: 'How do you say "a beautiful house"?',
        options: ['بيت جميل', 'جميل بيت', 'البيت الجميل', 'بيت جميلة'],
        correct: 0,
        explanation: 'Adjective comes after noun, both indefinite, بيت is masculine',
      },
      {
        question: 'What must adjectives agree with in Arabic?',
        options: [
          'Only gender',
          'Only definiteness',
          'Gender, number, and definiteness',
          'Nothing',
        ],
        correct: 2,
        explanation: 'Adjectives must match the noun in gender, number, and definiteness',
      },
      {
        question: 'Where does the adjective go in Arabic?',
        options: ['Before the noun', 'After the noun', 'Either position', 'At the end of sentence'],
        correct: 1,
        explanation: 'In Arabic, adjectives come AFTER the noun they describe',
      },
      {
        question: 'Which is correct for "the small girl"?',
        options: ['بنت صغيرة', 'البنت الصغيرة', 'الصغيرة البنت', 'بنت الصغيرة'],
        correct: 1,
        explanation: 'Both noun and adjective must be definite (have ال) and feminine',
      },
    ],
  },

  {
    id: 'personal-pronouns',
    title: 'Personal Pronouns',
    titleArabic: 'الضمائر الشخصية',
    category: 'basics',
    difficulty: 1,
    order: 3,
    explanation: `Personal pronouns are the basic building blocks of Arabic sentences. Here are the most common ones:

Singular:
• أنا (ana) = I
• أنت (anta) = you (masculine)
• أنتِ (anti) = you (feminine)
• هو (huwa) = he
• هي (hiya) = she

Plural:
• نحن (nahnu) = we
• أنتم (antum) = you (plural, masculine)
• أنتنّ (antunna) = you (plural, feminine)
• هم (hum) = they (masculine)
• هنّ (hunna) = they (feminine)

Arabic verbs change based on these pronouns, so learning them is crucial!`,
    examples: [
      {
        arabic: 'أنا طالب',
        english: 'I am a student',
        transliteration: 'ana taalib',
        breakdown: 'I + student (masc.)',
      },
      {
        arabic: 'أنتَ معلم',
        english: 'You are a teacher (masculine)',
        transliteration: 'anta muallim',
        breakdown: 'you (masc.) + teacher',
      },
      {
        arabic: 'هو كبير',
        english: 'He is big',
        transliteration: 'huwa kabeer',
        breakdown: 'he + big',
      },
      {
        arabic: 'نحن طلاب',
        english: 'We are students',
        transliteration: 'nahnu tullaab',
        breakdown: 'we + students',
      },
    ],
    rules: [
      {
        rule: 'Gender distinction in "you"',
        example: 'أنتَ (anta) for males, أنتِ (anti) for females',
      },
      {
        rule: 'Plural pronouns also have gender',
        example: 'هم (hum) for males, هنّ (hunna) for females',
      },
      {
        rule: 'Pronouns are often optional with verbs',
        example: 'The verb ending shows the pronoun',
      },
    ],
    exercises: [
      {
        type: 'translate',
        prompt: 'I',
        answer: 'أنا',
        options: ['أنا', 'أنت', 'هو', 'نحن'],
      },
      {
        type: 'translate',
        prompt: 'he',
        answer: 'هو',
        options: ['هي', 'هو', 'أنت', 'نحن'],
      },
      {
        type: 'translate',
        prompt: 'we',
        answer: 'نحن',
        options: ['أنا', 'أنت', 'نحن', 'هم'],
      },
      {
        type: 'fill-blank',
        prompt: '_____ طالب (I am a student)',
        answer: 'أنا',
        options: ['أنا', 'أنت', 'هو', 'هي'],
      },
      {
        type: 'match',
        prompt: 'Match the pronouns',
        pairs: [
          ['أنا', 'I'],
          ['أنت', 'you (masc.)'],
          ['هو', 'he'],
          ['نحن', 'we'],
        ],
      },
    ],
    quiz: [
      {
        question: 'What is "I" in Arabic?',
        options: ['أنت', 'أنا', 'هو', 'نحن'],
        correct: 1,
        explanation: 'أنا (ana) means "I"',
      },
      {
        question: 'How do you say "he" in Arabic?',
        options: ['هي', 'أنت', 'هو', 'هم'],
        correct: 2,
        explanation: 'هو (huwa) means "he"',
      },
      {
        question: 'What is the feminine form of "you"?',
        options: ['أنت', 'أنتِ', 'أنا', 'هي'],
        correct: 1,
        explanation: 'أنتِ (anti) is "you" for females',
      },
      {
        question: 'How do you say "we"?',
        options: ['أنا', 'أنتم', 'نحن', 'هم'],
        correct: 2,
        explanation: 'نحن (nahnu) means "we"',
      },
    ],
  },

  {
    id: 'possessive-suffixes',
    title: 'Possessive Suffixes',
    titleArabic: 'الضمائر المتصلة',
    category: 'nouns',
    difficulty: 2,
    order: 4,
    explanation: `In Arabic, possession is shown by adding suffixes to the end of nouns. These suffixes attach directly to the word (no separate word for "my", "your", etc.).

Common possessive suffixes:
• ـي (ee) = my
• ـك (ka) = your (masculine)
• ـكِ (ki) = your (feminine)
• ـه (hu) = his
• ـها (ha) = her
• ـنا (na) = our
• ـكم (kum) = your (plural)
• ـهم (hum) = their (masculine)

For example: كتاب (book) → كتابي (my book)`,
    examples: [
      {
        arabic: 'كتابي',
        english: 'my book',
        transliteration: 'kitaabee',
        breakdown: 'كتاب + ي',
      },
      {
        arabic: 'بيتك',
        english: 'your house',
        transliteration: 'baytuka',
        breakdown: 'بيت + ك',
      },
      {
        arabic: 'أمها',
        english: 'her mother',
        transliteration: 'ummuha',
        breakdown: 'أم + ها',
      },
      {
        arabic: 'معلمنا',
        english: 'our teacher',
        transliteration: 'muallimuna',
        breakdown: 'معلم + نا',
      },
    ],
    rules: [
      {
        rule: 'Suffixes attach directly to the noun',
        example: 'كتاب + ي = كتابي (no space)',
      },
      {
        rule: 'Gender matters for "your"',
        example: 'كتابك (your book, to a male) vs كتابكِ (to a female)',
      },
      {
        rule: 'Nouns with possessives are automatically definite',
        example: 'كتابي = "my book" (not "a my book")',
      },
    ],
    exercises: [
      {
        type: 'translate',
        prompt: 'my book',
        answer: 'كتابي',
        options: ['كتاب', 'كتابي', 'كتابك', 'كتابه'],
      },
      {
        type: 'fill-blank',
        prompt: 'بيت___ (your house)',
        answer: 'ك',
        options: ['ي', 'ك', 'ه', 'نا'],
      },
      {
        type: 'translate',
        prompt: 'his mother',
        answer: 'أمه',
        options: ['أم', 'أمي', 'أمه', 'أمها'],
      },
      {
        type: 'fill-blank',
        prompt: 'معلم___ (our teacher)',
        answer: 'نا',
        options: ['ي', 'ك', 'ه', 'نا'],
      },
      {
        type: 'match',
        prompt: 'Match possessive forms',
        pairs: [
          ['كتابي', 'my book'],
          ['كتابك', 'your book'],
          ['كتابه', 'his book'],
          ['كتابنا', 'our book'],
        ],
      },
    ],
    quiz: [
      {
        question: 'How do you say "my house"?',
        options: ['بيت', 'بيتي', 'بيتك', 'بيته'],
        correct: 1,
        explanation: 'بيتي = "my house" (بيت + ي)',
      },
      {
        question: 'What suffix means "our"?',
        options: ['ـي', 'ـك', 'ـه', 'ـنا'],
        correct: 3,
        explanation: 'ـنا (na) means "our"',
      },
      {
        question: 'Are nouns with possessive suffixes definite or indefinite?',
        options: ['Definite', 'Indefinite', 'Depends on context', 'Neither'],
        correct: 0,
        explanation: 'Possessive suffixes make nouns definite (they refer to a specific item)',
      },
      {
        question: 'How do you say "her book"?',
        options: ['كتابي', 'كتابك', 'كتابه', 'كتابها'],
        correct: 3,
        explanation: 'كتابها = "her book" (كتاب + ها)',
      },
    ],
  },

  {
    id: 'basic-verb-conjugation',
    title: 'Present Tense Verbs',
    titleArabic: 'الفعل المضارع',
    category: 'verbs',
    difficulty: 3,
    order: 5,
    explanation: `Arabic verbs in present tense follow patterns based on the pronoun. The basic pattern has prefixes and sometimes suffixes.

The verb يكتب (yaktubu) = "he writes" is our example:

• أكتب (aktubu) = I write
• تكتب (taktubu) = you write (masc.)
• تكتبين (taktubeen) = you write (fem.)
• يكتب (yaktubu) = he writes
• تكتب (taktubu) = she writes
• نكتب (naktubu) = we write
• يكتبون (yaktubuun) = they write (masc.)

Notice the prefixes: أ (I), ت (you/she), ي (he), ن (we)`,
    examples: [
      {
        arabic: 'أكتب',
        english: 'I write',
        transliteration: 'aktubu',
        breakdown: 'prefix أ + كتب',
      },
      {
        arabic: 'تكتب',
        english: 'you write',
        transliteration: 'taktubu',
        breakdown: 'prefix ت + كتب',
      },
      {
        arabic: 'يكتب',
        english: 'he writes',
        transliteration: 'yaktubu',
        breakdown: 'prefix ي + كتب',
      },
      {
        arabic: 'نكتب',
        english: 'we write',
        transliteration: 'naktubu',
        breakdown: 'prefix ن + كتب',
      },
    ],
    rules: [
      {
        rule: 'Prefixes change by pronoun',
        example: 'أ (I), ت (you/she), ي (he), ن (we)',
      },
      {
        rule: 'Some forms add suffixes too',
        example: 'تكتبين (you write, fem.) adds ين',
      },
      {
        rule: 'Root stays the same',
        example: 'كتب (k-t-b) appears in all forms',
      },
    ],
    exercises: [
      {
        type: 'fill-blank',
        prompt: '___كتب (I write)',
        answer: 'أ',
        options: ['أ', 'ت', 'ي', 'ن'],
      },
      {
        type: 'translate',
        prompt: 'he writes',
        answer: 'يكتب',
        options: ['أكتب', 'تكتب', 'يكتب', 'نكتب'],
      },
      {
        type: 'fill-blank',
        prompt: '___كتب (we write)',
        answer: 'ن',
        options: ['أ', 'ت', 'ي', 'ن'],
      },
      {
        type: 'translate',
        prompt: 'you write (masc.)',
        answer: 'تكتب',
        options: ['أكتب', 'تكتب', 'يكتب', 'نكتب'],
      },
      {
        type: 'match',
        prompt: 'Match verb forms',
        pairs: [
          ['أكتب', 'I write'],
          ['تكتب', 'you write'],
          ['يكتب', 'he writes'],
          ['نكتب', 'we write'],
        ],
      },
    ],
    quiz: [
      {
        question: 'What prefix is used for "I" in present tense?',
        options: ['ت', 'أ', 'ي', 'ن'],
        correct: 1,
        explanation: 'أ is the prefix for "I" (ana)',
      },
      {
        question: 'How do you say "he writes"?',
        options: ['أكتب', 'تكتب', 'يكتب', 'نكتب'],
        correct: 2,
        explanation: 'يكتب (yaktubu) = "he writes"',
      },
      {
        question: 'What prefix is used for "we"?',
        options: ['أ', 'ت', 'ي', 'ن'],
        correct: 3,
        explanation: 'ن is the prefix for "we" (nahnu)',
      },
      {
        question: 'Which part stays the same in all conjugations?',
        options: ['The prefix', 'The suffix', 'The root', 'Nothing'],
        correct: 2,
        explanation: 'The root letters (كتب) remain constant across conjugations',
      },
    ],
  },

  {
    id: 'question-words',
    title: 'Question Words',
    titleArabic: 'أدوات الاستفهام',
    category: 'questions',
    difficulty: 2,
    order: 6,
    explanation: `Question words help you ask for information. Here are the most essential ones:

• ما (maa) = what?
• من (man) = who?
• أين (ayna) = where?
• كيف (kayfa) = how?
• لماذا (limaadha) = why?
• متى (mata) = when?
• كم (kam) = how many/much?

Questions can be formed by putting these at the start of a sentence.`,
    examples: [
      {
        arabic: 'ما اسمك؟',
        english: 'What is your name?',
        transliteration: 'maa ismuka?',
        breakdown: 'what + your-name?',
      },
      {
        arabic: 'من أنت؟',
        english: 'Who are you?',
        transliteration: 'man anta?',
        breakdown: 'who + you?',
      },
      {
        arabic: 'أين البيت؟',
        english: 'Where is the house?',
        transliteration: 'ayna al-bayt?',
        breakdown: 'where + the-house?',
      },
      {
        arabic: 'كيف حالك؟',
        english: 'How are you?',
        transliteration: 'kayfa haaluka?',
        breakdown: 'how + your-condition?',
      },
    ],
    rules: [
      {
        rule: 'Question words usually come first',
        example: 'ما اسمك؟ (what your-name?)',
      },
      {
        rule: 'من is for people, ما for things',
        example: 'من هو؟ (who is he?) vs ما هذا؟ (what is this?)',
      },
      {
        rule: 'Use كم for counting',
        example: 'كم كتاباً؟ (how many books?)',
      },
    ],
    exercises: [
      {
        type: 'translate',
        prompt: 'what?',
        answer: 'ما',
        options: ['ما', 'من', 'أين', 'كيف'],
      },
      {
        type: 'translate',
        prompt: 'where?',
        answer: 'أين',
        options: ['ما', 'من', 'أين', 'متى'],
      },
      {
        type: 'fill-blank',
        prompt: '_____ اسمك؟ (What is your name?)',
        answer: 'ما',
        options: ['ما', 'من', 'أين', 'كيف'],
      },
      {
        type: 'translate',
        prompt: 'who?',
        answer: 'من',
        options: ['ما', 'من', 'أين', 'كيف'],
      },
      {
        type: 'match',
        prompt: 'Match question words',
        pairs: [
          ['ما', 'what?'],
          ['من', 'who?'],
          ['أين', 'where?'],
          ['كيف', 'how?'],
        ],
      },
    ],
    quiz: [
      {
        question: 'How do you say "what?" in Arabic?',
        options: ['من', 'ما', 'أين', 'كيف'],
        correct: 1,
        explanation: 'ما (maa) means "what?"',
      },
      {
        question: 'Which question word means "where?"',
        options: ['ما', 'من', 'أين', 'متى'],
        correct: 2,
        explanation: 'أين (ayna) means "where?"',
      },
      {
        question: 'How do you ask "Who are you?"',
        options: ['ما أنت؟', 'من أنت؟', 'أين أنت؟', 'كيف أنت؟'],
        correct: 1,
        explanation: 'من أنت؟ (man anta?) = "Who are you?"',
      },
      {
        question: 'What does كيف mean?',
        options: ['what', 'who', 'where', 'how'],
        correct: 3,
        explanation: 'كيف (kayfa) means "how"',
      },
    ],
  },

  {
    id: 'prepositions',
    title: 'Common Prepositions',
    titleArabic: 'حروف الجر',
    category: 'prepositions',
    difficulty: 2,
    order: 7,
    explanation: `Prepositions are small words that show relationships between things. Here are the most common ones:

• في (fee) = in, at
• على (ala) = on, upon
• من (min) = from
• إلى (ila) = to, toward
• مع (maa) = with
• عن (an) = about, from
• ب (bi) = with, by (attached to next word)
• ل (li) = to, for (attached to next word)

The prepositions ب and ل attach directly to the following word.`,
    examples: [
      {
        arabic: 'في البيت',
        english: 'in the house',
        transliteration: 'fee al-bayt',
        breakdown: 'in + the house',
      },
      {
        arabic: 'على الطاولة',
        english: 'on the table',
        transliteration: 'ala at-taawila',
        breakdown: 'on + the table',
      },
      {
        arabic: 'من المدرسة',
        english: 'from the school',
        transliteration: 'min al-madrasa',
        breakdown: 'from + the school',
      },
      {
        arabic: 'إلى المسجد',
        english: 'to the mosque',
        transliteration: 'ila al-masjid',
        breakdown: 'to + the mosque',
      },
    ],
    rules: [
      {
        rule: 'Prepositions come before nouns',
        example: 'في البيت (in the house)',
      },
      {
        rule: 'ب and ل attach to the next word',
        example: 'بالقلم (with the pen) - ب + القلم',
      },
      {
        rule: 'Prepositions can change ال',
        example: 'لـ + ال = لل (للبيت = to the house)',
      },
    ],
    exercises: [
      {
        type: 'translate',
        prompt: 'in',
        answer: 'في',
        options: ['في', 'على', 'من', 'إلى'],
      },
      {
        type: 'fill-blank',
        prompt: '_____ البيت (in the house)',
        answer: 'في',
        options: ['في', 'على', 'من', 'إلى'],
      },
      {
        type: 'translate',
        prompt: 'on',
        answer: 'على',
        options: ['في', 'على', 'من', 'إلى'],
      },
      {
        type: 'fill-blank',
        prompt: '_____ المدرسة (from the school)',
        answer: 'من',
        options: ['في', 'على', 'من', 'إلى'],
      },
      {
        type: 'match',
        prompt: 'Match prepositions',
        pairs: [
          ['في', 'in'],
          ['على', 'on'],
          ['من', 'from'],
          ['إلى', 'to'],
        ],
      },
    ],
    quiz: [
      {
        question: 'How do you say "in the house"?',
        options: ['في البيت', 'على البيت', 'من البيت', 'إلى البيت'],
        correct: 0,
        explanation: 'في البيت (fee al-bayt) = "in the house"',
      },
      {
        question: 'What does على mean?',
        options: ['in', 'on', 'from', 'to'],
        correct: 1,
        explanation: 'على (ala) means "on" or "upon"',
      },
      {
        question: 'Which preposition means "from"?',
        options: ['في', 'على', 'من', 'إلى'],
        correct: 2,
        explanation: 'من (min) means "from"',
      },
      {
        question: 'How do you say "to the mosque"?',
        options: ['في المسجد', 'على المسجد', 'من المسجد', 'إلى المسجد'],
        correct: 3,
        explanation: 'إلى المسجد (ila al-masjid) = "to the mosque"',
      },
    ],
  },
];

export const grammarCategories = [
  { id: 'basics', name: 'Basics', nameArabic: 'الأساسيات' },
  { id: 'nouns', name: 'Nouns', nameArabic: 'الأسماء' },
  { id: 'verbs', name: 'Verbs', nameArabic: 'الأفعال' },
  { id: 'questions', name: 'Questions', nameArabic: 'الأسئلة' },
  { id: 'prepositions', name: 'Prepositions', nameArabic: 'حروف الجر' },
];

export default grammarLessons;
