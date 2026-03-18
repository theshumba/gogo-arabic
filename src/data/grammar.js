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
,
  {
    id: 'numbers-1-10',
    title: "Numbers 1-10",
    titleArabic: "الأعداد ١-١٠",
    category: 'basics',
    difficulty: 1,
    order: 13,
    cefrLevel: 'A1',
    explanation: "Arabic numbers 1-10 are among the first words learners master. Interestingly, the 'Arabic numerals' used worldwide (1,2,3...) originated from Arabic-speaking mathematicians, though Arabic itself uses Eastern Arabic numerals (١٢٣). Numbers 1-2 agree with the noun in gender, while 3-10 take the opposite gender — a unique Arabic rule.",
    examples: [
      {arabic: "واحد", english: "one (m)", transliteration: "waahid"},
      {arabic: "اثنان", english: "two (m)", transliteration: "ithnaan"},
      {arabic: "ثلاثة", english: "three (m)", transliteration: "thalaatha"},
      {arabic: "أربعة", english: "four (m)", transliteration: "arba'a"},
      {arabic: "خمسة", english: "five (m)", transliteration: "khamsa"}
    ],
    rules: [
      {rule: "Numbers 1-2 agree in gender with the noun", example: "ولد واحد (one boy) / بنت واحدة (one girl)"},
      {rule: "Numbers 3-10 take OPPOSITE gender to the noun", example: "ثلاثة أولاد (three boys — feminine form with masculine noun)"},
      {rule: "The counted noun after 3-10 is plural genitive", example: "خمسة كتب (five books)"}
    ],
    exercises: [
      {type: "fill-blank", prompt: "___ كتب (three books)", answer: "ثلاثة", options: ["ثلاثة", "ثلاث", "واحد", "اثنان"]},
      {type: "translate", prompt: "seven", answer: "سبعة", options: ["سبعة", "ستة", "ثمانية", "تسعة"]},
      {type: "match", prompt: "Match numbers", pairs: [["واحد", "1"], ["اثنان", "2"], ["عشرة", "10"]]}
    ],
    quiz: [],
  },
  {
    id: 'basic-adjectives',
    title: "Basic Adjectives",
    titleArabic: "الصفات الأساسية",
    category: 'nouns',
    difficulty: 1,
    order: 14,
    cefrLevel: 'A1',
    explanation: "In Arabic, adjectives follow the noun they describe and must agree in gender, number, and definiteness. If the noun is feminine, the adjective takes the taa marbuuta (ة) ending. If the noun is definite (has ال), the adjective must also be definite.",
    examples: [
      {arabic: "كتاب كبير", english: "a big book", transliteration: "kitaab kabiir"},
      {arabic: "الكتاب الكبير", english: "the big book", transliteration: "al-kitaab al-kabiir"},
      {arabic: "مدرسة كبيرة", english: "a big school (f)", transliteration: "madrasa kabiira"},
      {arabic: "بيت جميل", english: "a beautiful house", transliteration: "bayt jamiil"}
    ],
    rules: [
      {rule: "Adjective follows the noun", example: "ولد طويل (a tall boy) — not طويل ولد"},
      {rule: "Adjective agrees in gender", example: "بنت طويلة (a tall girl) — feminine ة added"},
      {rule: "Adjective agrees in definiteness", example: "الولد الطويل (the tall boy) — both have ال"}
    ],
    exercises: [
      {type: "fill-blank", prompt: "بنت ___ (a beautiful girl)", answer: "جميلة", options: ["جميلة", "جميل", "كبير", "صغيرة"]},
      {type: "translate", prompt: "the small house", answer: "البيت الصغير", options: ["البيت الصغير", "بيت صغير", "الصغير البيت", "بيت الصغير"]}
    ],
    quiz: [],
  },
  {
    id: 'demonstratives',
    title: "This & That (Demonstratives)",
    titleArabic: "أسماء الإشارة",
    category: 'basics',
    difficulty: 1,
    order: 15,
    cefrLevel: 'A1',
    explanation: "Arabic demonstrative pronouns change based on gender and number. 'This' for masculine is هذا (haadha) and for feminine is هذه (haadhihi). 'That' for masculine is ذلك (dhaalika) and for feminine is تلك (tilka).",
    examples: [
      {arabic: "هذا كتاب", english: "this is a book", transliteration: "haadha kitaab"},
      {arabic: "هذه مدرسة", english: "this is a school", transliteration: "haadhihi madrasa"},
      {arabic: "ذلك الرجل", english: "that man", transliteration: "dhaalika ar-rajul"},
      {arabic: "تلك المرأة", english: "that woman", transliteration: "tilka al-mar'a"}
    ],
    rules: [
      {rule: "هذا/هذه for near (this)", example: "هذا ولد (this is a boy) / هذه بنت (this is a girl)"},
      {rule: "ذلك/تلك for far (that)", example: "ذلك بيت (that house) / تلك سيارة (that car)"},
      {rule: "With definite nouns, demonstrative + ال-noun", example: "هذا الكتاب (this book)"}
    ],
    exercises: [
      {type: "fill-blank", prompt: "___ بنت (this is a girl)", answer: "هذه", options: ["هذه", "هذا", "ذلك", "تلك"]}
    ],
    quiz: [],
  },
  {
    id: 'possessive-pronouns',
    title: "Possessive Pronouns",
    titleArabic: "ضمائر الملكية",
    category: 'basics',
    difficulty: 1,
    order: 16,
    cefrLevel: 'A1',
    explanation: "In Arabic, possessive pronouns are suffixes attached directly to the noun. 'My book' is كتابي (kitaabi) — the ي suffix means 'my'. This is one of Arabic's elegant features: ownership is shown by a simple ending change.",
    examples: [
      {arabic: "كتابي", english: "my book", transliteration: "kitaabi"},
      {arabic: "كتابك", english: "your book (m)", transliteration: "kitaabuka"},
      {arabic: "كتابه", english: "his book", transliteration: "kitaabuhu"},
      {arabic: "كتابها", english: "her book", transliteration: "kitaabuhaa"},
      {arabic: "كتابنا", english: "our book", transliteration: "kitaabunaa"}
    ],
    rules: [
      {rule: "ي = my, ك = your(m), كِ = your(f)", example: "بيتي (my house), بيتك (your house)"},
      {rule: "ه = his, ها = her, نا = our", example: "قلمه (his pen), قلمها (her pen)"},
      {rule: "هم = their(m), هن = their(f)", example: "بيتهم (their house)"}
    ],
    exercises: [
      {type: "fill-blank", prompt: "كتاب___ (my book)", answer: "ي", options: ["ي", "ك", "ه", "نا"]}
    ],
    quiz: [],
  },
  {
    id: 'basic-negation',
    title: "Basic Negation (لا / ليس)",
    titleArabic: "النفي الأساسي",
    category: 'basics',
    difficulty: 1,
    order: 17,
    cefrLevel: 'A1',
    explanation: "Arabic has two main ways to negate: لا (laa) negates verbs and general statements, while ليس (laysa) negates nominal sentences (sentences without a verb). ليس conjugates to agree with the subject.",
    examples: [
      {arabic: "لا أفهم", english: "I don't understand", transliteration: "laa afham"},
      {arabic: "ليس هذا كتابي", english: "this is not my book", transliteration: "laysa haadha kitaabi"},
      {arabic: "لا أريد", english: "I don't want", transliteration: "laa uriid"},
      {arabic: "ليست هنا", english: "she is not here", transliteration: "laysat hunaa"}
    ],
    rules: [
      {rule: "لا + verb = don't/doesn't", example: "لا يعرف (he doesn't know)"},
      {rule: "ليس + nominal = is not", example: "ليس كبيرًا (it is not big)"},
      {rule: "ليس conjugates: لست، لست، ليس، ليست", example: "لست طالبًا (I am not a student)"}
    ],
    exercises: [
      {type: "fill-blank", prompt: "___ أفهم (I don't understand)", answer: "لا", options: ["لا", "ليس", "لن", "ما"]}
    ],
    quiz: [],
  },
  {
    id: 'present-tense',
    title: "Present Tense (المضارع)",
    titleArabic: "الفعل المضارع",
    category: 'verbs',
    difficulty: 2,
    order: 18,
    cefrLevel: 'A2',
    explanation: "The Arabic present tense (المضارع) is formed by adding prefixes to the verb root. Each person has a unique prefix: أ (I), ت (you/she), ي (he), ن (we). The present tense describes ongoing or habitual actions.",
    examples: [
      {arabic: "أكتب", english: "I write", transliteration: "aktub"},
      {arabic: "تكتب", english: "you write (m)", transliteration: "taktub"},
      {arabic: "يكتب", english: "he writes", transliteration: "yaktub"},
      {arabic: "نكتب", english: "we write", transliteration: "naktub"}
    ],
    rules: [
      {rule: "أ- prefix = I (أنا)", example: "أذهب (I go)"},
      {rule: "ي- prefix = he, ت- = you/she", example: "يقرأ (he reads), تقرأ (you/she reads)"},
      {rule: "ن- prefix = we (نحن)", example: "نفهم (we understand)"}
    ],
    exercises: [
      {type: "fill-blank", prompt: "أنا ___ العربية (I study Arabic)", answer: "أدرس", options: ["أدرس", "يدرس", "تدرس", "ندرس"]}
    ],
    quiz: [],
  },
  {
    id: 'future-tense',
    title: "Future Tense (سَوْفَ / سَ)",
    titleArabic: "المستقبل",
    category: 'verbs',
    difficulty: 2,
    order: 19,
    cefrLevel: 'A2',
    explanation: "Arabic forms the future by adding سوف (sawfa) or the prefix سـ (sa-) before the present tense verb. Both mean 'will' but سـ is more immediate while سوف is more distant or formal.",
    examples: [
      {arabic: "سأذهب", english: "I will go", transliteration: "sa-adhhab"},
      {arabic: "سوف أدرس", english: "I will study", transliteration: "sawfa adrus"},
      {arabic: "سيكتب", english: "he will write", transliteration: "sa-yaktub"}
    ],
    rules: [
      {rule: "سـ + present verb = near future", example: "سأفعل (I will do — soon)"},
      {rule: "سوف + present verb = distant/formal future", example: "سوف نسافر (we will travel)"},
      {rule: "Negation: لن + present subjunctive", example: "لن أذهب (I will not go)"}
    ],
    exercises: [
      {type: "translate", prompt: "I will read", answer: "سأقرأ", options: ["سأقرأ", "أقرأ", "قرأت", "سيقرأ"]}
    ],
    quiz: [],
  },
  {
    id: 'dual-form',
    title: "The Dual Form (المثنى)",
    titleArabic: "المثنى",
    category: 'nouns',
    difficulty: 2,
    order: 20,
    cefrLevel: 'A2',
    explanation: "Arabic has a special form for exactly two of something — the dual. Add ان (-aan) for nominative or ين (-ayn) for accusative/genitive. This exists in no European language and is one of Arabic's distinctive features.",
    examples: [
      {arabic: "كتابان", english: "two books (nom)", transliteration: "kitaabaan"},
      {arabic: "كتابين", english: "two books (acc/gen)", transliteration: "kitaabayn"},
      {arabic: "ولدان", english: "two boys", transliteration: "waladaan"},
      {arabic: "طالبتان", english: "two female students", transliteration: "taalibataan"}
    ],
    rules: [
      {rule: "Nominative dual: noun + ان", example: "معلمان (two teachers)"},
      {rule: "Accusative/genitive dual: noun + ين", example: "معلمَين (two teachers — acc/gen)"},
      {rule: "Feminine dual: ة becomes تان/تين", example: "طالبة → طالبتان"}
    ],
    exercises: [
      {type: "fill-blank", prompt: "عندي ___ (I have two books)", answer: "كتابان", options: ["كتابان", "كتب", "كتاب", "كتابين"]}
    ],
    quiz: [],
  },
  {
    id: 'sound-plural',
    title: "Sound Plurals",
    titleArabic: "جمع السالم",
    category: 'nouns',
    difficulty: 2,
    order: 21,
    cefrLevel: 'A2',
    explanation: "Sound plurals follow predictable patterns. Masculine sound plural adds ون (-uun) nominative or ين (-iin) accusative/genitive. Feminine sound plural changes ة to ات (-aat). These are 'sound' because the root stays intact.",
    examples: [
      {arabic: "معلمون", english: "teachers (m, nom)", transliteration: "mu'allimuun"},
      {arabic: "معلمين", english: "teachers (m, acc/gen)", transliteration: "mu'allimiin"},
      {arabic: "معلمات", english: "teachers (f)", transliteration: "mu'allimaat"},
      {arabic: "طالبات", english: "female students", transliteration: "taalibaat"}
    ],
    rules: [
      {rule: "Masc sound plural: ون (nom) / ين (acc/gen)", example: "مهندسون / مهندسين (engineers)"},
      {rule: "Fem sound plural: ة → ات", example: "سيارة → سيارات (cars)"},
      {rule: "Only for rational beings (humans)", example: "معلمون (teachers) but NOT كتابون"}
    ],
    exercises: [
      {type: "translate", prompt: "female engineers", answer: "مهندسات", options: ["مهندسات", "مهندسون", "مهندسين", "مهندسة"]}
    ],
    quiz: [],
  },
  {
    id: 'broken-plural',
    title: "Broken Plurals",
    titleArabic: "جمع التكسير",
    category: 'nouns',
    difficulty: 2,
    order: 22,
    cefrLevel: 'A2',
    explanation: "Broken plurals change the internal vowel pattern of the word — the 'skeleton' of consonants stays but vowels shift. This is unique to Semitic languages. There are about 30 patterns, but a few are very common: فُعول (fu'uul), أفعال (af'aal), فِعال (fi'aal).",
    examples: [
      {arabic: "كتاب → كتب", english: "book → books", transliteration: "kitaab → kutub"},
      {arabic: "قلم → أقلام", english: "pen → pens", transliteration: "qalam → aqlaam"},
      {arabic: "رجل → رجال", english: "man → men", transliteration: "rajul → rijaal"},
      {arabic: "بيت → بيوت", english: "house → houses", transliteration: "bayt → buyuut"}
    ],
    rules: [
      {rule: "فُعُول pattern (most common)", example: "بيت → بيوت, درس → دروس"},
      {rule: "أَفْعَال pattern", example: "قلم → أقلام, ولد → أولاد"},
      {rule: "فِعَال pattern", example: "جبل → جبال, رجل → رجال"}
    ],
    exercises: [
      {type: "translate", prompt: "books (plural of كتاب)", answer: "كتب", options: ["كتب", "كتابات", "كتابون", "كتابين"]}
    ],
    quiz: [],
  },
  {
    id: 'comparative',
    title: "Comparative & Superlative",
    titleArabic: "التفضيل",
    category: 'nouns',
    difficulty: 2,
    order: 23,
    cefrLevel: 'A2',
    explanation: "Arabic comparative follows the pattern أَفْعَل (af'al): كبير (big) → أكبر (bigger/biggest). The same form serves as both comparative and superlative depending on context. With من (min = than), it's comparative; with ال, it's superlative.",
    examples: [
      {arabic: "أكبر", english: "bigger / biggest", transliteration: "akbar"},
      {arabic: "أصغر من", english: "smaller than", transliteration: "asghar min"},
      {arabic: "الأجمل", english: "the most beautiful", transliteration: "al-ajmal"}
    ],
    rules: [
      {rule: "Pattern: أَفْعَل from root", example: "كبير (big) → أكبر, جميل (beautiful) → أجمل"},
      {rule: "Comparative: أفعل + من", example: "هو أكبر من أخيه (he is bigger than his brother)"},
      {rule: "Superlative: ال + أفعل", example: "هي الأذكى (she is the smartest)"}
    ],
    exercises: [
      {type: "fill-blank", prompt: "هذا البيت ___ من ذلك (this house is bigger than that)", answer: "أكبر", options: ["أكبر", "كبير", "الأكبر", "كبيرة"]}
    ],
    quiz: [],
  },
  {
    id: 'active-participle',
    title: "Active Participle (اسم الفاعل)",
    titleArabic: "اسم الفاعل",
    category: 'verbs',
    difficulty: 2,
    order: 24,
    cefrLevel: 'A2',
    explanation: "The active participle (اسم الفاعل) describes the doer of an action. From Form I verbs, the pattern is فاعِل (faa'il). كتب (wrote) → كاتب (writer). This is incredibly productive in Arabic — hundreds of common words are active participles.",
    examples: [
      {arabic: "كاتب", english: "writer / writing", transliteration: "kaatib"},
      {arabic: "طالب", english: "student / seeking", transliteration: "taalib"},
      {arabic: "عامل", english: "worker / working", transliteration: "'aamil"},
      {arabic: "سائق", english: "driver / driving", transliteration: "saa'iq"}
    ],
    rules: [
      {rule: "Form I pattern: فاعِل (faa'il)", example: "درس → دارس (studier), حكم → حاكم (ruler)"},
      {rule: "Can function as noun or adjective", example: "هو كاتب (he is a writer) / كاتب مشهور (a famous writer)"},
      {rule: "Feminine: فاعلة", example: "كاتبة (female writer), طالبة (female student)"}
    ],
    exercises: [
      {type: "fill-blank", prompt: "هو ___ في المدرسة (he is a teacher at the school)", answer: "معلم", options: ["معلم", "علم", "تعليم", "يعلم"]}
    ],
    quiz: [],
  },
  {
    id: 'verb-forms-2-5',
    title: "Verb Forms II-V",
    titleArabic: "الأوزان II-V",
    category: 'verbs',
    difficulty: 3,
    order: 25,
    cefrLevel: 'B1',
    explanation: "Arabic verb forms (أوزان) are one of the language's most powerful features. Each form adds predictable meaning to a root. Form II (فَعَّلَ) intensifies or makes causative. Form III (فاعَلَ) implies doing with someone. Form IV (أَفْعَلَ) is causative. Form V (تَفَعَّلَ) is reflexive of II.",
    examples: [
      {arabic: "علّم (II)", english: "to teach (intensive of علم)", transliteration: "'allama"},
      {arabic: "كاتَب (III)", english: "to correspond with", transliteration: "kaataba"},
      {arabic: "أخرَج (IV)", english: "to take out / produce", transliteration: "akhraja"},
      {arabic: "تعلّم (V)", english: "to learn (reflexive of teach)", transliteration: "ta'allama"}
    ],
    rules: [
      {rule: "Form II فَعَّلَ: doubling middle letter = intensive/causative", example: "كسر (broke) → كسّر (smashed to pieces)"},
      {rule: "Form III فاعَلَ: long ا after first root = mutual action", example: "قتل (killed) → قاتل (fought with)"},
      {rule: "Form IV أَفْعَلَ: prefix أ = causative", example: "خرج (went out) → أخرج (took out)"},
      {rule: "Form V تَفَعَّلَ: prefix ت + doubled middle = reflexive of II", example: "علّم (taught) → تعلّم (learned)"}
    ],
    exercises: [
      {type: "translate", prompt: "to learn (Form V of علم)", answer: "تعلّم", options: ["تعلّم", "علّم", "أعلم", "عالم"]}
    ],
    quiz: [],
  },
  {
    id: 'verb-forms-6-10',
    title: "Verb Forms VI-X",
    titleArabic: "الأوزان VI-X",
    category: 'verbs',
    difficulty: 3,
    order: 26,
    cefrLevel: 'B1',
    explanation: "Forms VI-X complete the Arabic verb system. Form VI (تَفاعَلَ) is reciprocal. Form VII (اِنفَعَلَ) is passive/reflexive. Form VIII (اِفتَعَلَ) is reflexive. Form X (اِستَفعَلَ) means 'to seek/consider'.",
    examples: [
      {arabic: "تعاون (VI)", english: "to cooperate (mutual help)", transliteration: "ta'aawana"},
      {arabic: "انكسر (VII)", english: "to be broken", transliteration: "inkasara"},
      {arabic: "اجتمع (VIII)", english: "to gather / meet", transliteration: "ijtama'a"},
      {arabic: "استخدم (X)", english: "to use / employ", transliteration: "istakhdama"}
    ],
    rules: [
      {rule: "Form VI تَفاعَلَ: reciprocal/pretending", example: "تبادل (exchanged with each other)"},
      {rule: "Form VII اِنفَعَلَ: passive/reflexive", example: "فتح (opened) → انفتح (was opened)"},
      {rule: "Form VIII اِفتَعَلَ: reflexive", example: "جمع (gathered) → اجتمع (assembled)"},
      {rule: "Form X اِستَفعَلَ: seek/consider", example: "غفر (forgave) → استغفر (sought forgiveness)"}
    ],
    exercises: [
      {type: "fill-blank", prompt: "___ الطلاب في الفصل (the students gathered in the classroom)", answer: "اجتمع", options: ["اجتمع", "جمع", "تجمّع", "جامع"]}
    ],
    quiz: [],
  },
  {
    id: 'relative-clauses',
    title: "Relative Clauses (الذي)",
    titleArabic: "الاسم الموصول",
    category: 'nouns',
    difficulty: 3,
    order: 27,
    cefrLevel: 'B1',
    explanation: "Arabic relative pronouns agree with the noun they refer to. الذي (alladhii) for masculine singular, التي (allatii) for feminine, الذين (alladhiina) for masculine plural, اللاتي/اللواتي for feminine plural.",
    examples: [
      {arabic: "الكتاب الذي قرأته", english: "the book which I read", transliteration: "al-kitaab alladhii qara'tuhu"},
      {arabic: "المرأة التي رأيتها", english: "the woman whom I saw", transliteration: "al-mar'a allatii ra'aytuhaa"},
      {arabic: "الطلاب الذين نجحوا", english: "the students who passed", transliteration: "at-tullaab alladhiina najahuu"}
    ],
    rules: [
      {rule: "الذي = who/which (masculine singular)", example: "الرجل الذي جاء (the man who came)"},
      {rule: "التي = who/which (feminine singular)", example: "البنت التي درست (the girl who studied)"},
      {rule: "Resumptive pronoun required in object clauses", example: "الكتاب الذي قرأتُهُ (the book which I read IT)"}
    ],
    exercises: [
      {type: "fill-blank", prompt: "المعلمة ___ علّمتنا (the teacher who taught us)", answer: "التي", options: ["التي", "الذي", "الذين", "اللاتي"]}
    ],
    quiz: [],
  },
  {
    id: 'passive-voice',
    title: "Passive Voice",
    titleArabic: "المبني للمجهول",
    category: 'verbs',
    difficulty: 3,
    order: 28,
    cefrLevel: 'B1',
    explanation: "Arabic passive voice changes internal vowels rather than adding auxiliary verbs (unlike English 'was written'). Past passive: فُعِلَ (fu'ila). Present passive: يُفعَلُ (yuf'alu). The agent is typically omitted.",
    examples: [
      {arabic: "كُتِبَ الكتاب", english: "the book was written", transliteration: "kutiba al-kitaab"},
      {arabic: "يُدرَّس العلم", english: "science is taught", transliteration: "yudarrasu al-'ilm"},
      {arabic: "فُتِحَ الباب", english: "the door was opened", transliteration: "futiha al-baab"}
    ],
    rules: [
      {rule: "Past passive: change to pattern فُعِلَ", example: "كَتَبَ (wrote) → كُتِبَ (was written)"},
      {rule: "Present passive: change to pattern يُفعَلُ", example: "يَكتُبُ (writes) → يُكتَبُ (is written)"},
      {rule: "The subject becomes نائب الفاعل (deputy subject)", example: "كُتِبَ الدرسُ (the lesson was written — الدرس is nominative)"}
    ],
    exercises: [
      {type: "translate", prompt: "the door was opened", answer: "فُتِحَ الباب", options: ["فُتِحَ الباب", "فَتَحَ الباب", "يَفتَح الباب", "الباب فُتِحَ"]}
    ],
    quiz: [],
  },
  {
    id: 'verbal-nouns',
    title: "Verbal Nouns (المصدر)",
    titleArabic: "المصدر",
    category: 'nouns',
    difficulty: 3,
    order: 29,
    cefrLevel: 'B1',
    explanation: "Every Arabic verb has a verbal noun (مصدر) — the abstract concept of the action. Form I has many patterns (unpredictable), but Forms II-X follow fixed patterns. Mastering verbal nouns unlocks vast vocabulary because each root generates multiple masdar forms.",
    examples: [
      {arabic: "كتابة", english: "writing (masdar of كتب)", transliteration: "kitaaba"},
      {arabic: "تعليم", english: "teaching (masdar of علّم, Form II)", transliteration: "ta'liim"},
      {arabic: "استخدام", english: "usage (masdar of استخدم, Form X)", transliteration: "istikhdaam"}
    ],
    rules: [
      {rule: "Form II masdar: تَفْعِيل", example: "علّم → تعليم (teaching)"},
      {rule: "Form III masdar: مُفاعَلة or فِعال", example: "قاتل → مقاتلة/قتال (fighting)"},
      {rule: "Form X masdar: اِستِفعال", example: "استخدم → استخدام (usage)"}
    ],
    exercises: [
      {type: "fill-blank", prompt: "___ اللغة العربية ممتع (studying Arabic is fun)", answer: "دراسة", options: ["دراسة", "درس", "يدرس", "مدرسة"]}
    ],
    quiz: [],
  },
  {
    id: 'object-pronouns',
    title: "Object Pronouns",
    titleArabic: "ضمائر المفعول به",
    category: 'verbs',
    difficulty: 3,
    order: 30,
    cefrLevel: 'B1',
    explanation: "Object pronouns in Arabic attach as suffixes to verbs, just as possessive pronouns attach to nouns.",
    examples: [
      {arabic: "مثال", english: "example", transliteration: "mithaal"}
    ],
    rules: [
      {rule: "See explanation above", example: "—"}
    ],
    exercises: [
      {type: "translate", prompt: "practice", answer: "ممارسة", options: ["ممارسة", "درس", "كتب", "قرأ"]}
    ],
    quiz: [],
  },
  {
    id: 'adverbs-time-place',
    title: "Adverbs of Time & Place",
    titleArabic: "ظروف الزمان والمكان",
    category: 'nouns',
    difficulty: 3,
    order: 31,
    cefrLevel: 'B1',
    explanation: "Arabic adverbs of time (أمس, اليوم, غدًا) and place (هنا, هناك, فوق, تحت) modify verbs and sentences.",
    examples: [
      {arabic: "مثال", english: "example", transliteration: "mithaal"}
    ],
    rules: [
      {rule: "See explanation above", example: "—"}
    ],
    exercises: [
      {type: "translate", prompt: "practice", answer: "ممارسة", options: ["ممارسة", "درس", "كتب", "قرأ"]}
    ],
    quiz: [],
  },
  {
    id: 'conjunctions',
    title: "Conjunctions & Connectors",
    titleArabic: "أدوات الربط",
    category: 'basics',
    difficulty: 3,
    order: 32,
    cefrLevel: 'B1',
    explanation: "Arabic conjunctions connect clauses: و (and), أو (or), لكن (but), ثم (then), بل (rather).",
    examples: [
      {arabic: "مثال", english: "example", transliteration: "mithaal"}
    ],
    rules: [
      {rule: "See explanation above", example: "—"}
    ],
    exercises: [
      {type: "translate", prompt: "practice", answer: "ممارسة", options: ["ممارسة", "درس", "كتب", "قرأ"]}
    ],
    quiz: [],
  },
  {
    id: 'exception-illa',
    title: "Exception (إلا)",
    titleArabic: "الاستثناء",
    category: 'nouns',
    difficulty: 3,
    order: 33,
    cefrLevel: 'B1',
    explanation: "The exception particle إلا (illaa) means 'except'. It follows a negated sentence or a general statement.",
    examples: [
      {arabic: "مثال", english: "example", transliteration: "mithaal"}
    ],
    rules: [
      {rule: "See explanation above", example: "—"}
    ],
    exercises: [
      {type: "translate", prompt: "practice", answer: "ممارسة", options: ["ممارسة", "درس", "كتب", "قرأ"]}
    ],
    quiz: [],
  },
  {
    id: 'emphasis-inna',
    title: "Emphasis Particles (إنّ)",
    titleArabic: "إنّ وأخواتها",
    category: 'basics',
    difficulty: 3,
    order: 34,
    cefrLevel: 'B1',
    explanation: "إنّ and its sisters (أنّ, لكنّ, كأنّ, ليت, لعلّ) are emphasis particles that put the subject in accusative case.",
    examples: [
      {arabic: "مثال", english: "example", transliteration: "mithaal"}
    ],
    rules: [
      {rule: "See explanation above", example: "—"}
    ],
    exercises: [
      {type: "translate", prompt: "practice", answer: "ممارسة", options: ["ممارسة", "درس", "كتب", "قرأ"]}
    ],
    quiz: [],
  },
  {
    id: 'hal-clause',
    title: "Hal Clause (الحال)",
    titleArabic: "الحال",
    category: 'nouns',
    difficulty: 3,
    order: 35,
    cefrLevel: 'B1',
    explanation: "The hal clause describes the state/condition during an action. It answers 'how?' and is in the accusative case.",
    examples: [
      {arabic: "مثال", english: "example", transliteration: "mithaal"}
    ],
    rules: [
      {rule: "See explanation above", example: "—"}
    ],
    exercises: [
      {type: "translate", prompt: "practice", answer: "ممارسة", options: ["ممارسة", "درس", "كتب", "قرأ"]}
    ],
    quiz: [],
  },
  {
    id: 'tamyiz',
    title: "Specification (التمييز)",
    titleArabic: "التمييز",
    category: 'nouns',
    difficulty: 3,
    order: 36,
    cefrLevel: 'B1',
    explanation: "Tamyiz specifies what is being measured or compared. It's an indefinite accusative noun that clarifies a vague meaning.",
    examples: [
      {arabic: "مثال", english: "example", transliteration: "mithaal"}
    ],
    rules: [
      {rule: "See explanation above", example: "—"}
    ],
    exercises: [
      {type: "translate", prompt: "practice", answer: "ممارسة", options: ["ممارسة", "درس", "كتب", "قرأ"]}
    ],
    quiz: [],
  },
  {
    id: 'indirect-object',
    title: "Indirect Object",
    titleArabic: "المفعول به الثاني",
    category: 'verbs',
    difficulty: 3,
    order: 37,
    cefrLevel: 'B1',
    explanation: "Some Arabic verbs take two objects (مفعولان). The first is the person and the second is the thing.",
    examples: [
      {arabic: "مثال", english: "example", transliteration: "mithaal"}
    ],
    rules: [
      {rule: "See explanation above", example: "—"}
    ],
    exercises: [
      {type: "translate", prompt: "practice", answer: "ممارسة", options: ["ممارسة", "درس", "كتب", "قرأ"]}
    ],
    quiz: [],
  },
  {
    id: 'complex-conditionals',
    title: "Complex Conditionals (لو)",
    titleArabic: "الشرط المعقد",
    category: 'verbs',
    difficulty: 4,
    order: 38,
    cefrLevel: 'B2',
    explanation: "لو (law) introduces unreal/impossible conditions (contrary to fact). Unlike إذا (real conditions), لو expresses what would happen IF something were true.",
    examples: [
      {arabic: "مثال", english: "example", transliteration: "mithaal"}
    ],
    rules: [
      {rule: "See explanation above", example: "—"}
    ],
    exercises: [
      {type: "translate", prompt: "practice", answer: "ممارسة", options: ["ممارسة", "درس", "كتب", "قرأ"]}
    ],
    quiz: [],
  },
  {
    id: 'oath-expressions',
    title: "Oath Expressions",
    titleArabic: "أسلوب القسم",
    category: 'basics',
    difficulty: 4,
    order: 39,
    cefrLevel: 'B2',
    explanation: "Arabic oath expressions use و (wa-), ب (bi-), or ت (ta-) followed by the sworn-upon noun. والله (wallahi) is the most common.",
    examples: [
      {arabic: "مثال", english: "example", transliteration: "mithaal"}
    ],
    rules: [
      {rule: "See explanation above", example: "—"}
    ],
    exercises: [
      {type: "translate", prompt: "practice", answer: "ممارسة", options: ["ممارسة", "درس", "كتب", "قرأ"]}
    ],
    quiz: [],
  },
  {
    id: 'exclamation',
    title: "Exclamation (ما أفعل)",
    titleArabic: "أسلوب التعجب",
    category: 'verbs',
    difficulty: 4,
    order: 40,
    cefrLevel: 'B2',
    explanation: "Arabic has a formulaic exclamation pattern: ما أَفْعَلَ (maa af'ala) = 'How [adjective]!' ما أجمل! = How beautiful!",
    examples: [
      {arabic: "مثال", english: "example", transliteration: "mithaal"}
    ],
    rules: [
      {rule: "See explanation above", example: "—"}
    ],
    exercises: [
      {type: "translate", prompt: "practice", answer: "ممارسة", options: ["ممارسة", "درس", "كتب", "قرأ"]}
    ],
    quiz: [],
  },
  {
    id: 'wonder-verb',
    title: "Verb of Wonder",
    titleArabic: "فعل التعجب",
    category: 'verbs',
    difficulty: 4,
    order: 41,
    cefrLevel: 'B2',
    explanation: "The verb of wonder uses two patterns: ما أَفْعَلَهُ (how X he is!) and أَفْعِل بِهِ (make X with him!).",
    examples: [
      {arabic: "مثال", english: "example", transliteration: "mithaal"}
    ],
    rules: [
      {rule: "See explanation above", example: "—"}
    ],
    exercises: [
      {type: "translate", prompt: "practice", answer: "ممارسة", options: ["ممارسة", "درس", "كتب", "قرأ"]}
    ],
    quiz: [],
  },
  {
    id: 'praise-blame',
    title: "Verbs of Praise & Blame",
    titleArabic: "نعم وبئس",
    category: 'verbs',
    difficulty: 4,
    order: 42,
    cefrLevel: 'B2',
    explanation: "نعم (ni'ma = how excellent!) and بئس (bi'sa = how terrible!) are special frozen verbs for praise and blame.",
    examples: [
      {arabic: "مثال", english: "example", transliteration: "mithaal"}
    ],
    rules: [
      {rule: "See explanation above", example: "—"}
    ],
    exercises: [
      {type: "translate", prompt: "practice", answer: "ممارسة", options: ["ممارسة", "درس", "كتب", "قرأ"]}
    ],
    quiz: [],
  },
  {
    id: 'absolute-object',
    title: "Absolute Object (المفعول المطلق)",
    titleArabic: "المفعول المطلق",
    category: 'verbs',
    difficulty: 4,
    order: 43,
    cefrLevel: 'B2',
    explanation: "The absolute object is a verbal noun from the same root as the verb, used for emphasis or describing manner: ضربته ضربًا شديدًا (I hit him a severe hitting).",
    examples: [
      {arabic: "مثال", english: "example", transliteration: "mithaal"}
    ],
    rules: [
      {rule: "See explanation above", example: "—"}
    ],
    exercises: [
      {type: "translate", prompt: "practice", answer: "ممارسة", options: ["ممارسة", "درس", "كتب", "قرأ"]}
    ],
    quiz: [],
  },
  {
    id: 'mafuul-liajlih',
    title: "Adverb of Cause (المفعول لأجله)",
    titleArabic: "المفعول لأجله",
    category: 'verbs',
    difficulty: 4,
    order: 44,
    cefrLevel: 'B2',
    explanation: "The maf'ul li-ajlihi explains WHY an action was done. It's an indefinite accusative masdar: جئتُ رغبةً في العلم (I came desiring knowledge).",
    examples: [
      {arabic: "مثال", english: "example", transliteration: "mithaal"}
    ],
    rules: [
      {rule: "See explanation above", example: "—"}
    ],
    exercises: [
      {type: "translate", prompt: "practice", answer: "ممارسة", options: ["ممارسة", "درس", "كتب", "قرأ"]}
    ],
    quiz: [],
  },
  {
    id: 'mafuul-maah',
    title: "Accompanying Object (المفعول معه)",
    titleArabic: "المفعول معه",
    category: 'nouns',
    difficulty: 4,
    order: 45,
    cefrLevel: 'B2',
    explanation: "The maf'ul ma'ahu follows و (and) and indicates accompaniment: سرتُ والنيلَ (I walked along the Nile).",
    examples: [
      {arabic: "مثال", english: "example", transliteration: "mithaal"}
    ],
    rules: [
      {rule: "See explanation above", example: "—"}
    ],
    exercises: [
      {type: "translate", prompt: "practice", answer: "ممارسة", options: ["ممارسة", "درس", "كتب", "قرأ"]}
    ],
    quiz: [],
  },
  {
    id: 'literary-particles',
    title: "Literary Particles",
    titleArabic: "الأدوات الأدبية",
    category: 'basics',
    difficulty: 4,
    order: 46,
    cefrLevel: 'B2',
    explanation: "Classical Arabic uses particles like إذ (since/when), إذا (suddenly in narrative), قد (verily/already), لقد (indeed), ما (not/what).",
    examples: [
      {arabic: "مثال", english: "example", transliteration: "mithaal"}
    ],
    rules: [
      {rule: "See explanation above", example: "—"}
    ],
    exercises: [
      {type: "translate", prompt: "practice", answer: "ممارسة", options: ["ممارسة", "درس", "كتب", "قرأ"]}
    ],
    quiz: [],
  },
  {
    id: 'formal-letter',
    title: "Formal Letter Writing",
    titleArabic: "كتابة الرسائل الرسمية",
    category: 'basics',
    difficulty: 4,
    order: 47,
    cefrLevel: 'B2',
    explanation: "Arabic formal letters follow specific conventions: بسم الله الرحمن الرحيم opening, السلام عليكم greeting, أما بعد (furthermore), and prescribed closing formulas.",
    examples: [
      {arabic: "مثال", english: "example", transliteration: "mithaal"}
    ],
    rules: [
      {rule: "See explanation above", example: "—"}
    ],
    exercises: [
      {type: "translate", prompt: "practice", answer: "ممارسة", options: ["ممارسة", "درس", "كتب", "قرأ"]}
    ],
    quiz: [],
  }
];

export default grammarLessons;
