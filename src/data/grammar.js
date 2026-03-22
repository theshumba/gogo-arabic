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
    cefrLevel: 'A1',
    explanation: `In Arabic, the definite article "the" is expressed by adding ال (al-) to the beginning of a word. This transforms an indefinite noun into a definite one.

For example:
• كتاب (kitaab) = "a book"
• الكتاب (al-kitaab) = "the book"

There's a twist though! Arabic has "sun letters" and "moon letters." When ال comes before a sun letter, the ل (L) sound assimilates into the following letter, though the spelling stays the same.

Sun letters: ت ث د ذ ر ز س ش ص ض ط ظ ل ن
Moon letters: أ ب ج ح خ ع غ ف ق ك م و ه ي`,
    examples: [
      { arabic: 'الكتاب', english: 'the book', transliteration: 'al-kitaab', breakdown: 'ال + كتاب' },
      { arabic: 'الشمس', english: 'the sun', transliteration: 'ash-shams', breakdown: 'ال + شمس (sun letter: ش)' },
      { arabic: 'القمر', english: 'the moon', transliteration: 'al-qamar', breakdown: 'ال + قمر (moon letter: ق)' },
      { arabic: 'البيت', english: 'the house', transliteration: 'al-bayt', breakdown: 'ال + بيت' },
    ],
    rules: [
      { rule: 'Sun letters assimilate the ل sound', example: 'الشمس → ash-shams (not al-shams)' },
      { rule: 'Moon letters keep the ل sound', example: 'القمر → al-qamar' },
      { rule: 'The spelling always uses ال regardless', example: 'Both sun and moon words are written with ال' },
    ],
    exercises: [
      { type: 'fill-blank', prompt: '___ كتاب (the book)', answer: 'ال', options: ['ال', 'إل', 'أل', 'لا'] },
      { type: 'translate', prompt: 'the house', answer: 'البيت', options: ['بيت', 'البيت', 'بيتي', 'بيتك'] },
      { type: 'fill-blank', prompt: '___ ولد (the boy)', answer: 'ال', options: ['ال', 'في', 'من', 'إلى'] },
      { type: 'translate', prompt: 'the girl', answer: 'البنت', options: ['بنت', 'البنت', 'بنتي', 'بنات'] },
      { type: 'match', prompt: 'Match the Arabic with English', pairs: [['الولد', 'the boy'], ['البنت', 'the girl'], ['الكتاب', 'the book'], ['البيت', 'the house']] },
      { type: 'true-false', statement: 'الشمس is pronounced "al-shams" (the ل is fully pronounced)', answer: 'false', options: ['true', 'false'] },
      { type: 'true-false', statement: 'القمر is a moon-letter word so ال stays as "al-"', answer: 'true', options: ['true', 'false'] },
      { type: 'error-identification', sentence: 'إل كتاب على الطاولة', error: 'إل', correction: 'ال', answer: 'إل', options: ['إل', 'كتاب', 'على', 'No error'] },
      { type: 'classify', prompt: 'Classify as sun or moon letter', categories: ['Sun', 'Moon'], items: [{ text: 'ش', category: 'Sun' }, { text: 'ب', category: 'Moon' }, { text: 'ر', category: 'Sun' }, { text: 'ق', category: 'Moon' }] },
      { type: 'multiple-select', prompt: 'Select all sun letters:', correctAnswers: ['ت', 'ش', 'ر'], options: ['ت', 'ب', 'ش', 'ر', 'ق'], answer: 'ت,ش,ر' },
      { type: 'word-order', prompt: 'Which sentence is correct?', answer: 'الكتاب على الطاولة', options: ['الكتاب على الطاولة', 'على الكتاب الطاولة', 'الطاولة الكتاب على', 'على الطاولة الكتاب'] },
      { type: 'cloze', text: '___ شمس ساطعة و___ قمر مضيء', blanks: [{ answer: 'ال', options: ['ال', 'إل', 'أل'] }, { answer: 'ال', options: ['ال', 'في', 'من'] }] },
    ],
    quiz: [
      { question: 'Which word uses a sun letter?', options: ['القمر', 'الشمس', 'الكتاب', 'البيت'], correct: 1, explanation: 'الشمس (the sun) starts with ش, a sun letter, so it\'s pronounced "ash-shams"' },
      { question: 'How do you say "the book" in Arabic?', options: ['كتاب', 'الكتاب', 'كتابي', 'كتب'], correct: 1, explanation: 'الكتاب = "the book" (ال + كتاب)' },
      { question: 'What happens with sun letters?', options: ['The ال is removed', 'The ل sound assimilates', 'The word changes completely', 'Nothing changes'], correct: 1, explanation: 'With sun letters, the ل sound merges into the following letter, though spelling stays the same' },
      { question: 'Which is a moon letter?', options: ['ش', 'س', 'ت', 'ق'], correct: 3, explanation: 'ق is a moon letter, so القمر is pronounced "al-qamar"' },
    ],
  },

  {
    id: 'noun-adjective-agreement',
    title: 'Noun-Adjective Agreement',
    titleArabic: 'التوافق بين الاسم والصفة',
    category: 'nouns',
    difficulty: 2,
    order: 2,
    cefrLevel: 'A1',
    explanation: `In Arabic, adjectives must agree with the nouns they describe in three ways:
1. Gender (masculine/feminine)
2. Number (singular/dual/plural)
3. Definiteness (definite/indefinite)

Feminine adjectives usually end in ة (taa marbuuta). If the noun is definite (has ال), the adjective must also have ال.

The adjective comes AFTER the noun in Arabic (opposite of English).`,
    examples: [
      { arabic: 'ولد كبير', english: 'a big boy', transliteration: 'walad kabeer', breakdown: 'boy (masc.) + big (masc.)' },
      { arabic: 'بنت كبيرة', english: 'a big girl', transliteration: 'bint kabeerah', breakdown: 'girl (fem.) + big (fem.)' },
      { arabic: 'الولد الكبير', english: 'the big boy', transliteration: 'al-walad al-kabeer', breakdown: 'the boy (def.) + the big (def.)' },
      { arabic: 'البنت الكبيرة', english: 'the big girl', transliteration: 'al-bint al-kabeerah', breakdown: 'the girl (def. fem.) + the big (def. fem.)' },
    ],
    rules: [
      { rule: 'Adjective matches noun in gender', example: 'ولد كبير (masc.) vs بنت كبيرة (fem.)' },
      { rule: 'Adjective matches noun in definiteness', example: 'الولد الكبير (both definite)' },
      { rule: 'Adjective comes AFTER the noun', example: 'بيت جميل (beautiful house) not جميل بيت' },
      { rule: 'Feminine adjectives typically add ة', example: 'كبير → كبيرة' },
    ],
    exercises: [
      { type: 'translate', prompt: 'a big house', answer: 'بيت كبير', options: ['بيت كبير', 'كبير بيت', 'البيت الكبير', 'بيت كبيرة'] },
      { type: 'fill-blank', prompt: 'بنت _____ (a small girl)', answer: 'صغيرة', options: ['صغير', 'صغيرة', 'الصغيرة', 'الصغير'] },
      { type: 'translate', prompt: 'the beautiful girl', answer: 'البنت الجميلة', options: ['بنت جميلة', 'البنت الجميلة', 'الجميلة البنت', 'بنت الجميلة'] },
      { type: 'fill-blank', prompt: 'الولد _____ (the small boy)', answer: 'الصغير', options: ['صغير', 'الصغير', 'صغيرة', 'الصغيرة'] },
      { type: 'match', prompt: 'Match noun-adjective pairs', pairs: [['ولد كبير', 'a big boy'], ['بنت كبيرة', 'a big girl'], ['الولد الكبير', 'the big boy'], ['البنت الكبيرة', 'the big girl']] },
      { type: 'sentence-transformation', prompt: 'Change to feminine: الولد طويل', answer: 'البنت طويلة', hint: 'masculine → feminine (add ة)', options: ['البنت طويلة', 'البنت طويل', 'الولد طويلة', 'بنت طويلة'] },
      { type: 'sentence-transformation', prompt: 'Make definite: بيت كبير', answer: 'البيت الكبير', hint: 'add ال to both noun and adjective', options: ['البيت الكبير', 'البيت كبير', 'بيت الكبير', 'الكبير البيت'] },
      { type: 'error-identification', sentence: 'هذا بنت جميلة', error: 'هذا', correction: 'هذه', answer: 'هذا', options: ['هذا', 'بنت', 'جميلة', 'No error'] },
      { type: 'true-false', statement: 'In Arabic, the adjective comes before the noun', answer: 'false', options: ['true', 'false'] },
      { type: 'true-false', statement: 'بنت كبيرة is correct (feminine noun + feminine adjective)', answer: 'true', options: ['true', 'false'] },
      { type: 'word-order', prompt: 'Which correctly describes "the tall girl"?', answer: 'البنت الطويلة', options: ['البنت الطويلة', 'الطويلة البنت', 'بنت الطويلة', 'البنت طويل'] },
      { type: 'build-sentence', prompt: 'Build: "a beautiful house"', answer: 'بيت جميل', options: ['بيت جميل', 'جميل بيت', 'البيت الجميل', 'بيت جميلة'] },
    ],
    quiz: [
      { question: 'How do you say "a beautiful house"?', options: ['بيت جميل', 'جميل بيت', 'البيت الجميل', 'بيت جميلة'], correct: 0, explanation: 'Adjective comes after noun, both indefinite, بيت is masculine' },
      { question: 'What must adjectives agree with in Arabic?', options: ['Only gender', 'Only definiteness', 'Gender, number, and definiteness', 'Nothing'], correct: 2, explanation: 'Adjectives must match the noun in gender, number, and definiteness' },
      { question: 'Where does the adjective go in Arabic?', options: ['Before the noun', 'After the noun', 'Either position', 'At the end of sentence'], correct: 1, explanation: 'In Arabic, adjectives come AFTER the noun they describe' },
      { question: 'Which is correct for "the small girl"?', options: ['بنت صغيرة', 'البنت الصغيرة', 'الصغيرة البنت', 'بنت الصغيرة'], correct: 1, explanation: 'Both noun and adjective must be definite (have ال) and feminine' },
    ],
  },

  {
    id: 'personal-pronouns',
    title: 'Personal Pronouns',
    titleArabic: 'الضمائر الشخصية',
    category: 'basics',
    difficulty: 1,
    order: 3,
    cefrLevel: 'A1',
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
• هم (hum) = they (masculine)
• هنّ (hunna) = they (feminine)

Arabic verbs change based on these pronouns, so learning them is crucial!`,
    examples: [
      { arabic: 'أنا طالب', english: 'I am a student', transliteration: 'ana taalib', breakdown: 'I + student (masc.)' },
      { arabic: 'أنتَ معلم', english: 'You are a teacher (masculine)', transliteration: 'anta muallim', breakdown: 'you (masc.) + teacher' },
      { arabic: 'هو كبير', english: 'He is big', transliteration: 'huwa kabeer', breakdown: 'he + big' },
      { arabic: 'نحن طلاب', english: 'We are students', transliteration: 'nahnu tullaab', breakdown: 'we + students' },
    ],
    rules: [
      { rule: 'Gender distinction in "you"', example: 'أنتَ (anta) for males, أنتِ (anti) for females' },
      { rule: 'Plural pronouns also have gender', example: 'هم (hum) for males, هنّ (hunna) for females' },
      { rule: 'Pronouns are often optional with verbs', example: 'The verb ending shows the pronoun' },
    ],
    exercises: [
      { type: 'translate', prompt: 'I', answer: 'أنا', options: ['أنا', 'أنت', 'هو', 'نحن'] },
      { type: 'translate', prompt: 'he', answer: 'هو', options: ['هي', 'هو', 'أنت', 'نحن'] },
      { type: 'translate', prompt: 'we', answer: 'نحن', options: ['أنا', 'أنت', 'نحن', 'هم'] },
      { type: 'fill-blank', prompt: '_____ طالب (I am a student)', answer: 'أنا', options: ['أنا', 'أنت', 'هو', 'هي'] },
      { type: 'match', prompt: 'Match the pronouns', pairs: [['أنا', 'I'], ['أنت', 'you (masc.)'], ['هو', 'he'], ['نحن', 'we']] },
      { type: 'true-false', statement: 'أنتِ (anti) is the masculine form of "you"', answer: 'false', options: ['true', 'false'] },
      { type: 'true-false', statement: 'هم refers to a masculine plural "they"', answer: 'true', options: ['true', 'false'] },
      { type: 'error-identification', sentence: 'أنا هو معلم كبير', error: 'هو', correction: '(remove هو)', answer: 'هو', options: ['أنا', 'هو', 'معلم', 'No error'] },
      { type: 'word-order', prompt: 'Which is correct for "She is a student"?', answer: 'هي طالبة', options: ['هي طالبة', 'طالبة هي', 'هو طالبة', 'أنا طالبة'] },
      { type: 'multiple-select', prompt: 'Select all plural pronouns:', correctAnswers: ['نحن', 'هم', 'أنتم'], options: ['أنا', 'نحن', 'هم', 'هو', 'أنتم'], answer: 'نحن,هم,أنتم' },
      { type: 'classify', prompt: 'Classify as singular or plural', categories: ['Singular', 'Plural'], items: [{ text: 'أنا', category: 'Singular' }, { text: 'نحن', category: 'Plural' }, { text: 'هو', category: 'Singular' }, { text: 'هم', category: 'Plural' }] },
      { type: 'build-sentence', prompt: 'Build: "We are students"', answer: 'نحن طلاب', options: ['نحن طلاب', 'طلاب نحن', 'هم طلاب', 'نحن طالب'] },
    ],
    quiz: [
      { question: 'What is "I" in Arabic?', options: ['أنت', 'أنا', 'هو', 'نحن'], correct: 1, explanation: 'أنا (ana) means "I"' },
      { question: 'How do you say "he" in Arabic?', options: ['هي', 'أنت', 'هو', 'هم'], correct: 2, explanation: 'هو (huwa) means "he"' },
      { question: 'What is the feminine form of "you"?', options: ['أنت', 'أنتِ', 'أنا', 'هي'], correct: 1, explanation: 'أنتِ (anti) is "you" for females' },
      { question: 'How do you say "we"?', options: ['أنا', 'أنتم', 'نحن', 'هم'], correct: 2, explanation: 'نحن (nahnu) means "we"' },
    ],
  },

  {
    id: 'possessive-suffixes',
    title: 'Possessive Suffixes',
    titleArabic: 'الضمائر المتصلة',
    category: 'nouns',
    difficulty: 2,
    order: 4,
    cefrLevel: 'A1',
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
      { arabic: 'كتابي', english: 'my book', transliteration: 'kitaabee', breakdown: 'كتاب + ي' },
      { arabic: 'بيتك', english: 'your house', transliteration: 'baytuka', breakdown: 'بيت + ك' },
      { arabic: 'أمها', english: 'her mother', transliteration: 'ummuha', breakdown: 'أم + ها' },
      { arabic: 'معلمنا', english: 'our teacher', transliteration: 'muallimuna', breakdown: 'معلم + نا' },
    ],
    rules: [
      { rule: 'Suffixes attach directly to the noun', example: 'كتاب + ي = كتابي (no space)' },
      { rule: 'Gender matters for "your"', example: 'كتابك (your book, to a male) vs كتابكِ (to a female)' },
      { rule: 'Nouns with possessives are automatically definite', example: 'كتابي = "my book" (not "a my book")' },
    ],
    exercises: [
      { type: 'translate', prompt: 'my book', answer: 'كتابي', options: ['كتاب', 'كتابي', 'كتابك', 'كتابه'] },
      { type: 'fill-blank', prompt: 'بيت___ (your house, masc.)', answer: 'ك', options: ['ي', 'ك', 'ه', 'نا'] },
      { type: 'translate', prompt: 'his mother', answer: 'أمه', options: ['أم', 'أمي', 'أمه', 'أمها'] },
      { type: 'fill-blank', prompt: 'معلم___ (our teacher)', answer: 'نا', options: ['ي', 'ك', 'ه', 'نا'] },
      { type: 'match', prompt: 'Match possessive forms', pairs: [['كتابي', 'my book'], ['كتابك', 'your book'], ['كتابه', 'his book'], ['كتابنا', 'our book']] },
      { type: 'true-false', statement: 'كتابي means "a book" (indefinite)', answer: 'false', options: ['true', 'false'] },
      { type: 'true-false', statement: 'ـنا suffix means "our"', answer: 'true', options: ['true', 'false'] },
      { type: 'error-identification', sentence: 'ذهبت إلى بيت ي أمس', error: 'بيت ي', correction: 'بيتي', answer: 'بيت ي', options: ['ذهبت', 'إلى', 'بيت ي', 'No error'] },
      { type: 'classify', prompt: 'Classify by possessor', categories: ['1st person', '3rd person'], items: [{ text: 'كتابي', category: '1st person' }, { text: 'كتابه', category: '3rd person' }, { text: 'كتابنا', category: '1st person' }, { text: 'كتابها', category: '3rd person' }] },
      { type: 'word-order', prompt: 'Which is "his house"?', answer: 'بيته', options: ['بيته', 'بيتها', 'بيتي', 'بيتك'] },
      { type: 'multiple-select', prompt: 'Select all "my" forms:', correctAnswers: ['كتابي', 'بيتي'], options: ['كتابي', 'بيتك', 'بيتي', 'أمه'], answer: 'كتابي,بيتي' },
      { type: 'build-sentence', prompt: 'Build: "her house"', answer: 'بيتها', options: ['بيتها', 'بيته', 'بيتي', 'بيتك'] },
    ],
    quiz: [
      { question: 'How do you say "my house"?', options: ['بيت', 'بيتي', 'بيتك', 'بيته'], correct: 1, explanation: 'بيتي = "my house" (بيت + ي)' },
      { question: 'What suffix means "our"?', options: ['ـي', 'ـك', 'ـه', 'ـنا'], correct: 3, explanation: 'ـنا (na) means "our"' },
      { question: 'Are nouns with possessive suffixes definite or indefinite?', options: ['Definite', 'Indefinite', 'Depends on context', 'Neither'], correct: 0, explanation: 'Possessive suffixes make nouns definite (they refer to a specific item)' },
      { question: 'How do you say "her book"?', options: ['كتابي', 'كتابك', 'كتابه', 'كتابها'], correct: 3, explanation: 'كتابها = "her book" (كتاب + ها)' },
    ],
  },

  {
    id: 'basic-verb-conjugation',
    title: 'Present Tense Verbs',
    titleArabic: 'الفعل المضارع',
    category: 'verbs',
    difficulty: 3,
    order: 5,
    cefrLevel: 'A1',
    explanation: `Arabic verbs in present tense follow patterns based on the pronoun. The basic pattern has prefixes and sometimes suffixes.

The verb كَتَبَ (kataba) = "he wrote" becomes يكتب in present:

• أكتب (aktubu) = I write
• تكتب (taktubu) = you write (masc.)
• يكتب (yaktubu) = he writes
• تكتب (taktubu) = she writes
• نكتب (naktubu) = we write

Notice the prefixes: أ (I), ت (you/she), ي (he), ن (we)`,
    examples: [
      { arabic: 'أكتب', english: 'I write', transliteration: 'aktubu', breakdown: 'prefix أ + كتب' },
      { arabic: 'تكتب', english: 'you write', transliteration: 'taktubu', breakdown: 'prefix ت + كتب' },
      { arabic: 'يكتب', english: 'he writes', transliteration: 'yaktubu', breakdown: 'prefix ي + كتب' },
      { arabic: 'نكتب', english: 'we write', transliteration: 'naktubu', breakdown: 'prefix ن + كتب' },
    ],
    rules: [
      { rule: 'Prefixes change by pronoun', example: 'أ (I), ت (you/she), ي (he), ن (we)' },
      { rule: 'Some forms add suffixes too', example: 'يكتبون (they write) adds ون' },
      { rule: 'Root stays the same', example: 'كتب (k-t-b) appears in all forms' },
    ],
    exercises: [
      { type: 'fill-blank', prompt: '___كتب (I write)', answer: 'أ', options: ['أ', 'ت', 'ي', 'ن'] },
      { type: 'translate', prompt: 'he writes', answer: 'يكتب', options: ['أكتب', 'تكتب', 'يكتب', 'نكتب'] },
      { type: 'fill-blank', prompt: '___كتب (we write)', answer: 'ن', options: ['أ', 'ت', 'ي', 'ن'] },
      { type: 'translate', prompt: 'you write (masc.)', answer: 'تكتب', options: ['أكتب', 'تكتب', 'يكتب', 'نكتب'] },
      { type: 'match', prompt: 'Match verb forms', pairs: [['أكتب', 'I write'], ['تكتب', 'you write'], ['يكتب', 'he writes'], ['نكتب', 'we write']] },
      { type: 'conjugation-drill', prompt: 'Conjugate كَتَبَ for أنا (present)', verb: 'كَتَبَ', root: 'ك-ت-ب', pronoun: 'أنا', paradigm: 'present', answer: 'أكتب', options: ['أكتب', 'يكتب', 'تكتب', 'نكتب'] },
      { type: 'conjugation-drill', prompt: 'Conjugate كَتَبَ for هو (present)', verb: 'كَتَبَ', root: 'ك-ت-ب', pronoun: 'هو', paradigm: 'present', answer: 'يكتب', options: ['أكتب', 'يكتب', 'تكتب', 'نكتب'] },
      { type: 'conjugation-drill', prompt: 'Conjugate ذَهَبَ for نحن (present)', verb: 'ذَهَبَ', root: 'ذ-ه-ب', pronoun: 'نحن', paradigm: 'present', answer: 'نذهب', options: ['أذهب', 'يذهب', 'تذهب', 'نذهب'] },
      { type: 'true-false', statement: 'The prefix ي is used for "I" in present tense', answer: 'false', options: ['true', 'false'] },
      { type: 'error-identification', sentence: 'أنا يكتب الدرس كل يوم', error: 'يكتب', correction: 'أكتب', answer: 'يكتب', options: ['أنا', 'يكتب', 'الدرس', 'No error'] },
      { type: 'word-order', prompt: 'Which is correct for "We write the lesson"?', answer: 'نكتب الدرس', options: ['نكتب الدرس', 'الدرس نكتب', 'يكتب الدرس', 'كتب نحن'] },
      { type: 'build-sentence', prompt: 'Build: "He writes the book"', answer: 'يكتب الكتاب', options: ['يكتب الكتاب', 'أكتب الكتاب', 'الكتاب يكتب', 'يكتب كتاب'] },
    ],
    quiz: [
      { question: 'What prefix is used for "I" in present tense?', options: ['ت', 'أ', 'ي', 'ن'], correct: 1, explanation: 'أ is the prefix for "I" (ana)' },
      { question: 'How do you say "he writes"?', options: ['أكتب', 'تكتب', 'يكتب', 'نكتب'], correct: 2, explanation: 'يكتب (yaktubu) = "he writes"' },
      { question: 'What prefix is used for "we"?', options: ['أ', 'ت', 'ي', 'ن'], correct: 3, explanation: 'ن is the prefix for "we" (nahnu)' },
      { question: 'Which part stays the same in all conjugations?', options: ['The prefix', 'The suffix', 'The root', 'Nothing'], correct: 2, explanation: 'The root letters (كتب) remain constant across conjugations' },
    ],
  },

  {
    id: 'question-words',
    title: 'Question Words',
    titleArabic: 'أدوات الاستفهام',
    category: 'questions',
    difficulty: 2,
    order: 6,
    cefrLevel: 'A1',
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
      { arabic: 'ما اسمك؟', english: 'What is your name?', transliteration: 'maa ismuka?', breakdown: 'what + your-name?' },
      { arabic: 'من أنت؟', english: 'Who are you?', transliteration: 'man anta?', breakdown: 'who + you?' },
      { arabic: 'أين البيت؟', english: 'Where is the house?', transliteration: 'ayna al-bayt?', breakdown: 'where + the-house?' },
      { arabic: 'كيف حالك؟', english: 'How are you?', transliteration: 'kayfa haaluka?', breakdown: 'how + your-condition?' },
    ],
    rules: [
      { rule: 'Question words usually come first', example: 'ما اسمك؟ (what your-name?)' },
      { rule: 'من is for people, ما for things', example: 'من هو؟ (who is he?) vs ما هذا؟ (what is this?)' },
      { rule: 'Use كم for counting', example: 'كم كتاباً؟ (how many books?)' },
    ],
    exercises: [
      { type: 'translate', prompt: 'what?', answer: 'ما', options: ['ما', 'من', 'أين', 'كيف'] },
      { type: 'translate', prompt: 'where?', answer: 'أين', options: ['ما', 'من', 'أين', 'متى'] },
      { type: 'fill-blank', prompt: '_____ اسمك؟ (What is your name?)', answer: 'ما', options: ['ما', 'من', 'أين', 'كيف'] },
      { type: 'translate', prompt: 'who?', answer: 'من', options: ['ما', 'من', 'أين', 'كيف'] },
      { type: 'match', prompt: 'Match question words', pairs: [['ما', 'what?'], ['من', 'who?'], ['أين', 'where?'], ['كيف', 'how?']] },
      { type: 'true-false', statement: 'من is used to ask about things, not people', answer: 'false', options: ['true', 'false'] },
      { type: 'true-false', statement: 'متى means "when?"', answer: 'true', options: ['true', 'false'] },
      { type: 'error-identification', sentence: 'من هذا الكتاب؟', error: 'من', correction: 'ما', answer: 'من', options: ['من', 'هذا', 'الكتاب', 'No error'] },
      { type: 'word-order', prompt: 'Which correctly asks "Where is the school?"', answer: 'أين المدرسة؟', options: ['أين المدرسة؟', 'المدرسة أين؟', 'ما المدرسة؟', 'أين مدرسة؟'] },
      { type: 'classify', prompt: 'Classify question words by usage', categories: ['People', 'Things/Places'], items: [{ text: 'من', category: 'People' }, { text: 'ما', category: 'Things/Places' }, { text: 'أين', category: 'Things/Places' }] },
      { type: 'multiple-select', prompt: 'Select all time-related question words:', correctAnswers: ['متى', 'كم'], options: ['متى', 'أين', 'كم', 'من'], answer: 'متى,كم' },
      { type: 'build-sentence', prompt: 'Build: "How are you?"', answer: 'كيف حالك؟', options: ['كيف حالك؟', 'حالك كيف؟', 'ما حالك؟', 'كيف أنت؟'] },
    ],
    quiz: [
      { question: 'How do you say "what?" in Arabic?', options: ['من', 'ما', 'أين', 'كيف'], correct: 1, explanation: 'ما (maa) means "what?"' },
      { question: 'Which question word means "where?"', options: ['ما', 'من', 'أين', 'متى'], correct: 2, explanation: 'أين (ayna) means "where?"' },
      { question: 'How do you ask "Who are you?"', options: ['ما أنت؟', 'من أنت؟', 'أين أنت؟', 'كيف أنت؟'], correct: 1, explanation: 'من أنت؟ (man anta?) = "Who are you?"' },
      { question: 'What does كيف mean?', options: ['what', 'who', 'where', 'how'], correct: 3, explanation: 'كيف (kayfa) means "how"' },
    ],
  },

  {
    id: 'prepositions',
    title: 'Common Prepositions',
    titleArabic: 'حروف الجر',
    category: 'prepositions',
    difficulty: 2,
    order: 7,
    cefrLevel: 'A1',
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
      { arabic: 'في البيت', english: 'in the house', transliteration: 'fee al-bayt', breakdown: 'in + the house' },
      { arabic: 'على الطاولة', english: 'on the table', transliteration: 'ala at-taawila', breakdown: 'on + the table' },
      { arabic: 'من المدرسة', english: 'from the school', transliteration: 'min al-madrasa', breakdown: 'from + the school' },
      { arabic: 'إلى المسجد', english: 'to the mosque', transliteration: 'ila al-masjid', breakdown: 'to + the mosque' },
    ],
    rules: [
      { rule: 'Prepositions come before nouns', example: 'في البيت (in the house)' },
      { rule: 'ب and ل attach to the next word', example: 'بالقلم (with the pen) - ب + القلم' },
      { rule: 'Prepositions can change ال', example: 'لـ + ال = لل (للبيت = to the house)' },
    ],
    exercises: [
      { type: 'translate', prompt: 'in', answer: 'في', options: ['في', 'على', 'من', 'إلى'] },
      { type: 'fill-blank', prompt: '_____ البيت (in the house)', answer: 'في', options: ['في', 'على', 'من', 'إلى'] },
      { type: 'translate', prompt: 'on', answer: 'على', options: ['في', 'على', 'من', 'إلى'] },
      { type: 'fill-blank', prompt: '_____ المدرسة (from the school)', answer: 'من', options: ['في', 'على', 'من', 'إلى'] },
      { type: 'match', prompt: 'Match prepositions', pairs: [['في', 'in'], ['على', 'on'], ['من', 'from'], ['إلى', 'to']] },
      { type: 'true-false', statement: 'في means "on" in Arabic', answer: 'false', options: ['true', 'false'] },
      { type: 'true-false', statement: 'ب and ل attach directly to the following word', answer: 'true', options: ['true', 'false'] },
      { type: 'error-identification', sentence: 'الكتاب على من الطاولة', error: 'من', correction: '(remove من)', answer: 'من', options: ['الكتاب', 'على', 'من', 'No error'] },
      { type: 'word-order', prompt: 'Which correctly says "The book is on the table"?', answer: 'الكتاب على الطاولة', options: ['الكتاب على الطاولة', 'على الكتاب الطاولة', 'الطاولة على الكتاب', 'الكتاب الطاولة على'] },
      { type: 'cloze', text: 'الكتاب ___ الطاولة والقلم ___ الكتاب', blanks: [{ answer: 'على', options: ['على', 'في', 'من'] }, { answer: 'في', options: ['في', 'على', 'إلى'] }] },
      { type: 'classify', prompt: 'Classify prepositions by meaning', categories: ['Location', 'Direction'], items: [{ text: 'في', category: 'Location' }, { text: 'على', category: 'Location' }, { text: 'إلى', category: 'Direction' }, { text: 'من', category: 'Direction' }] },
      { type: 'build-sentence', prompt: 'Build: "from the school"', answer: 'من المدرسة', options: ['من المدرسة', 'إلى المدرسة', 'في المدرسة', 'المدرسة من'] },
    ],
    quiz: [
      { question: 'How do you say "in the house"?', options: ['في البيت', 'على البيت', 'من البيت', 'إلى البيت'], correct: 0, explanation: 'في البيت (fee al-bayt) = "in the house"' },
      { question: 'What does على mean?', options: ['in', 'on', 'from', 'to'], correct: 1, explanation: 'على (ala) means "on" or "upon"' },
      { question: 'Which preposition means "from"?', options: ['في', 'على', 'من', 'إلى'], correct: 2, explanation: 'من (min) means "from"' },
      { question: 'How do you say "to the mosque"?', options: ['في المسجد', 'على المسجد', 'من المسجد', 'إلى المسجد'], correct: 3, explanation: 'إلى المسجد (ila al-masjid) = "to the mosque"' },
    ],
  },

  {
    id: 'colors-and-shapes',
    title: 'Colors and Shapes',
    titleArabic: 'الألوان والأشكال',
    category: 'vocabulary',
    difficulty: 1,
    order: 8,
    cefrLevel: 'A1',
    explanation: `Colors in Arabic follow the pattern أَفْعَل (masculine) and فَعْلاء (feminine).

Common colors:
• أحمر / حمراء (ahmar/hamraa) = red
• أزرق / زرقاء (azraq/zarqaa) = blue
• أخضر / خضراء (akhdar/khadraa) = green
• أصفر / صفراء (asfar/safraa) = yellow
• أبيض / بيضاء (abyad/baydaa) = white
• أسود / سوداء (aswad/sawdaa) = black

Colors agree with the noun in gender!`,
    examples: [
      { arabic: 'الكتاب أحمر', english: 'the book is red', transliteration: 'al-kitaab ahmar', breakdown: 'the book + red (masc.)' },
      { arabic: 'السيارة حمراء', english: 'the car is red', transliteration: 'as-sayyaara hamraa', breakdown: 'the car (fem.) + red (fem.)' },
      { arabic: 'البيت أبيض', english: 'the house is white', transliteration: 'al-bayt abyad', breakdown: 'the house + white' },
      { arabic: 'السماء زرقاء', english: 'the sky is blue', transliteration: 'as-samaa zarqaa', breakdown: 'the sky (fem.) + blue (fem.)' },
    ],
    rules: [
      { rule: 'Colors have masculine and feminine forms', example: 'أحمر (masc.) / حمراء (fem.)' },
      { rule: 'Color agrees with the noun it describes', example: 'قلم أحمر (red pen) / سيارة حمراء (red car)' },
      { rule: 'Colors come after the noun', example: 'الكتاب الأخضر (the green book)' },
    ],
    exercises: [
      { type: 'translate', prompt: 'red (masculine)', answer: 'أحمر', options: ['أحمر', 'حمراء', 'أزرق', 'أصفر'] },
      { type: 'translate', prompt: 'blue (feminine)', answer: 'زرقاء', options: ['أزرق', 'زرقاء', 'زرق', 'أزرقة'] },
      { type: 'fill-blank', prompt: 'السيارة ___ (the car is red, fem.)', answer: 'حمراء', options: ['أحمر', 'حمراء', 'أحمرة', 'حمر'] },
      { type: 'match', prompt: 'Match colors', pairs: [['أحمر', 'red (m)'], ['أزرق', 'blue (m)'], ['أبيض', 'white (m)'], ['أسود', 'black (m)']] },
      { type: 'true-false', statement: 'أبيض is the feminine form of "white"', answer: 'false', options: ['true', 'false'] },
      { type: 'true-false', statement: 'Colors come after the noun in Arabic', answer: 'true', options: ['true', 'false'] },
      { type: 'sentence-transformation', prompt: 'Change to feminine color: القميص أخضر', answer: 'المنديل خضراء', hint: 'change adjective to feminine form', options: ['المنديل خضراء', 'القميص خضراء', 'القميص أخضر', 'المنديل أخضر'] },
      { type: 'error-identification', sentence: 'السيارة أحمر جميلة', error: 'أحمر', correction: 'حمراء', answer: 'أحمر', options: ['السيارة', 'أحمر', 'جميلة', 'No error'] },
      { type: 'classify', prompt: 'Classify as masculine or feminine color form', categories: ['Masculine', 'Feminine'], items: [{ text: 'أحمر', category: 'Masculine' }, { text: 'زرقاء', category: 'Feminine' }, { text: 'أبيض', category: 'Masculine' }, { text: 'سوداء', category: 'Feminine' }] },
      { type: 'multiple-select', prompt: 'Select all masculine color forms:', correctAnswers: ['أحمر', 'أزرق', 'أصفر'], options: ['أحمر', 'حمراء', 'أزرق', 'زرقاء', 'أصفر'], answer: 'أحمر,أزرق,أصفر' },
      { type: 'word-order', prompt: 'Which correctly says "the green book"?', answer: 'الكتاب الأخضر', options: ['الكتاب الأخضر', 'الأخضر الكتاب', 'كتاب أخضر', 'الكتاب خضراء'] },
      { type: 'build-sentence', prompt: 'Build: "the white house"', answer: 'البيت الأبيض', options: ['البيت الأبيض', 'الأبيض البيت', 'بيت أبيض', 'البيت بيضاء'] },
    ],
    quiz: [
      { question: 'How do you say "red" for a masculine noun?', options: ['حمراء', 'أحمر', 'أحمرة', 'حمر'], correct: 1, explanation: 'أحمر (ahmar) is the masculine form of "red"' },
      { question: 'Which is the feminine form of أزرق (blue)?', options: ['زرق', 'أزرقة', 'زرقاء', 'أزرقاء'], correct: 2, explanation: 'زرقاء (zarqaa) is the feminine form of "blue"' },
      { question: 'How do you say "the sky is blue" (sky = سماء, feminine)?', options: ['السماء أزرق', 'السماء زرقاء', 'السماء أزرقة', 'زرقاء السماء'], correct: 1, explanation: 'السماء زرقاء — sky is feminine, so use the feminine color form زرقاء' },
      { question: 'What color is أسود?', options: ['white', 'red', 'green', 'black'], correct: 3, explanation: 'أسود (aswad) means "black"' },
    ],
  },

  {
    id: 'numbers-1-10',
    title: 'Numbers 1-10',
    titleArabic: 'الأعداد ١-١٠',
    category: 'basics',
    difficulty: 1,
    order: 13,
    cefrLevel: 'A1',
    explanation: `Arabic numbers 1-10 are among the first words learners master. Arabic itself uses Eastern Arabic numerals (١٢٣). Numbers 1-2 agree with the noun in gender, while 3-10 take the opposite gender — a unique Arabic rule.

Numbers 1-10:
١ واحد (waahid) — ٢ اثنان (ithnaan) — ٣ ثلاثة (thalaatha)
٤ أربعة (arba'a) — ٥ خمسة (khamsa) — ٦ ستة (sitta)
٧ سبعة (sab'a) — ٨ ثمانية (thamaaniya) — ٩ تسعة (tis'a) — ١٠ عشرة ('ashara)`,
    examples: [
      { arabic: 'واحد', english: 'one (m)', transliteration: 'waahid' },
      { arabic: 'ثلاثة كتب', english: 'three books', transliteration: 'thalaathat kutub', breakdown: 'three (fem. form) + books (masc. noun)' },
      { arabic: 'خمسة طلاب', english: 'five students', transliteration: 'khamsat tullaab' },
      { arabic: 'عشرة بنات', english: 'ten girls', transliteration: 'ashrat banaat' },
    ],
    rules: [
      { rule: 'Numbers 1-2 agree in gender with the noun', example: 'ولد واحد (one boy) / بنت واحدة (one girl)' },
      { rule: 'Numbers 3-10 take OPPOSITE gender to the noun', example: 'ثلاثة أولاد (three boys — feminine form with masculine noun)' },
      { rule: 'The counted noun after 3-10 is plural genitive', example: 'خمسة كتب (five books)' },
    ],
    exercises: [
      { type: 'fill-blank', prompt: '___ كتب (three books)', answer: 'ثلاثة', options: ['ثلاثة', 'ثلاث', 'واحد', 'اثنان'] },
      { type: 'translate', prompt: 'seven', answer: 'سبعة', options: ['سبعة', 'ستة', 'ثمانية', 'تسعة'] },
      { type: 'match', prompt: 'Match numbers', pairs: [['واحد', '1'], ['خمسة', '5'], ['عشرة', '10'], ['ثلاثة', '3']] },
      { type: 'translate', prompt: 'ten', answer: 'عشرة', options: ['تسعة', 'عشرة', 'ثمانية', 'سبعة'] },
      { type: 'fill-blank', prompt: '___ بنات (five girls)', answer: 'خمس', options: ['خمسة', 'خمس', 'خمسون', 'أربعة'] },
      { type: 'true-false', statement: 'Numbers 3-10 take the same gender as the noun they count', answer: 'false', options: ['true', 'false'] },
      { type: 'true-false', statement: 'واحد is the masculine form of "one"', answer: 'true', options: ['true', 'false'] },
      { type: 'error-identification', sentence: 'عندي ثلاث كتب', error: 'ثلاث', correction: 'ثلاثة', answer: 'ثلاث', options: ['عندي', 'ثلاث', 'كتب', 'No error'] },
      { type: 'word-order', prompt: 'Which is "two boys"?', answer: 'ولدان', options: ['ولدان', 'ولدين', 'ولد اثنان', 'اثنان ولد'] },
      { type: 'conjugation-drill', prompt: 'What is the Arabic for "four" (masc.)?', verb: 'عدد', root: 'ع-د-د', pronoun: 'م', paradigm: 'present', answer: 'أربعة', options: ['أربعة', 'أربع', 'أربعون', 'ربعة'] },
      { type: 'classify', prompt: 'Classify numbers as small or large (1-5 vs 6-10)', categories: ['1-5', '6-10'], items: [{ text: 'واحد', category: '1-5' }, { text: 'سبعة', category: '6-10' }, { text: 'ثلاثة', category: '1-5' }, { text: 'تسعة', category: '6-10' }] },
      { type: 'build-sentence', prompt: 'Build: "I have five books"', answer: 'عندي خمسة كتب', options: ['عندي خمسة كتب', 'عندي خمس كتب', 'خمسة كتب عندي', 'كتب خمسة عندي'] },
    ],
    quiz: [
      { question: 'What is the Arabic for "seven"?', options: ['ستة', 'سبعة', 'ثمانية', 'تسعة'], correct: 1, explanation: 'سبعة (sab\'a) means "seven"' },
      { question: 'Which rule applies to numbers 3-10?', options: ['Same gender as noun', 'Opposite gender to noun', 'No gender', 'Always masculine'], correct: 1, explanation: 'Numbers 3-10 take the OPPOSITE gender to the noun they count' },
      { question: 'How do you say "one girl"?', options: ['بنت واحد', 'بنت واحدة', 'واحدة بنت', 'واحد بنت'], correct: 1, explanation: 'بنت واحدة — number 1 agrees with feminine noun بنت' },
      { question: 'What does عشرة mean?', options: ['eight', 'nine', 'ten', 'hundred'], correct: 2, explanation: 'عشرة (\'ashara) means "ten"' },
    ],
  },

  {
    id: 'basic-adjectives',
    title: 'Basic Adjectives',
    titleArabic: 'الصفات الأساسية',
    category: 'nouns',
    difficulty: 1,
    order: 14,
    cefrLevel: 'A1',
    explanation: `In Arabic, adjectives follow the noun they describe and must agree in gender, number, and definiteness. If the noun is feminine, the adjective takes the taa marbuuta (ة) ending. If the noun is definite (has ال), the adjective must also be definite.

Common adjectives:
• كبير/كبيرة = big
• صغير/صغيرة = small
• جميل/جميلة = beautiful
• طويل/طويلة = tall/long
• قصير/قصيرة = short
• جديد/جديدة = new
• قديم/قديمة = old`,
    examples: [
      { arabic: 'كتاب كبير', english: 'a big book', transliteration: 'kitaab kabiir' },
      { arabic: 'الكتاب الكبير', english: 'the big book', transliteration: 'al-kitaab al-kabiir' },
      { arabic: 'مدرسة كبيرة', english: 'a big school (f)', transliteration: 'madrasa kabiira' },
      { arabic: 'بيت جميل', english: 'a beautiful house', transliteration: 'bayt jamiil' },
    ],
    rules: [
      { rule: 'Adjective follows the noun', example: 'ولد طويل (a tall boy) — not طويل ولد' },
      { rule: 'Adjective agrees in gender', example: 'بنت طويلة (a tall girl) — feminine ة added' },
      { rule: 'Adjective agrees in definiteness', example: 'الولد الطويل (the tall boy) — both have ال' },
    ],
    exercises: [
      { type: 'fill-blank', prompt: 'بنت ___ (a beautiful girl)', answer: 'جميلة', options: ['جميلة', 'جميل', 'كبير', 'صغيرة'] },
      { type: 'translate', prompt: 'the small house', answer: 'البيت الصغير', options: ['البيت الصغير', 'بيت صغير', 'الصغير البيت', 'بيت الصغير'] },
      { type: 'fill-blank', prompt: 'رجل ___ (a tall man)', answer: 'طويل', options: ['طويل', 'طويلة', 'الطويل', 'قصير'] },
      { type: 'translate', prompt: 'a new book', answer: 'كتاب جديد', options: ['كتاب جديد', 'جديد كتاب', 'الكتاب الجديد', 'كتاب جديدة'] },
      { type: 'match', prompt: 'Match adjective forms', pairs: [['كبير', 'big (m)'], ['كبيرة', 'big (f)'], ['صغير', 'small (m)'], ['صغيرة', 'small (f)']] },
      { type: 'sentence-transformation', prompt: 'Change to feminine: ولد طويل', answer: 'بنت طويلة', hint: 'add ة to make adjective feminine', options: ['بنت طويلة', 'بنت طويل', 'ولد طويلة', 'بنت الطويلة'] },
      { type: 'sentence-transformation', prompt: 'Make definite: بيت قديم', answer: 'البيت القديم', hint: 'add ال to both noun and adjective', options: ['البيت القديم', 'البيت قديم', 'بيت القديم', 'القديم البيت'] },
      { type: 'true-false', statement: 'جميل and جميلة mean the same thing', answer: 'true', options: ['true', 'false'] },
      { type: 'error-identification', sentence: 'البنت طويل جداً', error: 'طويل', correction: 'طويلة', answer: 'طويل', options: ['البنت', 'طويل', 'جداً', 'No error'] },
      { type: 'classify', prompt: 'Classify as masculine or feminine adjective', categories: ['Masculine', 'Feminine'], items: [{ text: 'كبير', category: 'Masculine' }, { text: 'كبيرة', category: 'Feminine' }, { text: 'صغير', category: 'Masculine' }, { text: 'جميلة', category: 'Feminine' }] },
      { type: 'word-order', prompt: 'Which is correct for "the old school"?', answer: 'المدرسة القديمة', options: ['المدرسة القديمة', 'القديمة المدرسة', 'مدرسة قديمة', 'المدرسة قديم'] },
      { type: 'build-sentence', prompt: 'Build: "a tall boy"', answer: 'ولد طويل', options: ['ولد طويل', 'طويل ولد', 'الولد الطويل', 'ولد طويلة'] },
    ],
    quiz: [
      { question: 'What is the feminine form of كبير?', options: ['كبيرة', 'كبيرات', 'الكبير', 'كبيرون'], correct: 0, explanation: 'كبيرة (kabiirah) is the feminine form — add ة to the masculine' },
      { question: 'How do you say "a tall girl"?', options: ['بنت طويل', 'بنت طويلة', 'البنت الطويلة', 'طويلة بنت'], correct: 1, explanation: 'بنت طويلة — adjective comes after noun and agrees in gender' },
      { question: 'What does جديد mean?', options: ['old', 'big', 'new', 'small'], correct: 2, explanation: 'جديد (jadiid) means "new"' },
      { question: 'Which is "the beautiful school"?', options: ['مدرسة جميلة', 'المدرسة الجميلة', 'الجميلة المدرسة', 'مدرسة الجميلة'], correct: 1, explanation: 'المدرسة الجميلة — both definite, both feminine' },
    ],
  },

  {
    id: 'demonstratives',
    title: 'This & That (Demonstratives)',
    titleArabic: 'أسماء الإشارة',
    category: 'basics',
    difficulty: 1,
    order: 15,
    cefrLevel: 'A1',
    explanation: `Arabic demonstrative pronouns change based on gender and number. "This" for masculine is هذا (haadha) and for feminine is هذه (haadhihi). "That" for masculine is ذلك (dhaalika) and for feminine is تلك (tilka).

• هذا = this (masculine) — used before masculine nouns
• هذه = this (feminine) — used before feminine nouns
• ذلك = that (masculine)
• تلك = that (feminine)`,
    examples: [
      { arabic: 'هذا كتاب', english: 'this is a book', transliteration: 'haadha kitaab' },
      { arabic: 'هذه مدرسة', english: 'this is a school', transliteration: 'haadhihi madrasa' },
      { arabic: 'ذلك الرجل', english: 'that man', transliteration: 'dhaalika ar-rajul' },
      { arabic: 'تلك المرأة', english: 'that woman', transliteration: 'tilka al-maraa' },
    ],
    rules: [
      { rule: 'هذا/هذه for near (this)', example: 'هذا ولد (this is a boy) / هذه بنت (this is a girl)' },
      { rule: 'ذلك/تلك for far (that)', example: 'ذلك بيت (that house) / تلك سيارة (that car)' },
      { rule: 'With definite nouns, demonstrative + ال-noun', example: 'هذا الكتاب (this book)' },
    ],
    exercises: [
      { type: 'fill-blank', prompt: '___ بنت (this is a girl)', answer: 'هذه', options: ['هذه', 'هذا', 'ذلك', 'تلك'] },
      { type: 'translate', prompt: 'this book (masc.)', answer: 'هذا الكتاب', options: ['هذا الكتاب', 'هذه الكتاب', 'ذلك الكتاب', 'هذا كتاب'] },
      { type: 'fill-blank', prompt: '___ رجل طويل (that is a tall man)', answer: 'ذلك', options: ['هذا', 'هذه', 'ذلك', 'تلك'] },
      { type: 'match', prompt: 'Match demonstratives', pairs: [['هذا', 'this (m)'], ['هذه', 'this (f)'], ['ذلك', 'that (m)'], ['تلك', 'that (f)']] },
      { type: 'translate', prompt: 'that school (f)', answer: 'تلك المدرسة', options: ['تلك المدرسة', 'ذلك المدرسة', 'هذه المدرسة', 'تلك مدرسة'] },
      { type: 'true-false', statement: 'هذا is used before feminine nouns', answer: 'false', options: ['true', 'false'] },
      { type: 'true-false', statement: 'تلك means "that" for feminine nouns', answer: 'true', options: ['true', 'false'] },
      { type: 'error-identification', sentence: 'هذا مدرسة جميلة', error: 'هذا', correction: 'هذه', answer: 'هذا', options: ['هذا', 'مدرسة', 'جميلة', 'No error'] },
      { type: 'sentence-transformation', prompt: 'Change to "that": هذا الكتاب', answer: 'ذلك الكتاب', hint: 'هذا (this, m) → ذلك (that, m)', options: ['ذلك الكتاب', 'تلك الكتاب', 'ذلك كتاب', 'هذا الكتاب'] },
      { type: 'word-order', prompt: 'Which correctly says "this is a car"?', answer: 'هذه سيارة', options: ['هذه سيارة', 'هذا سيارة', 'سيارة هذه', 'هذه السيارة'] },
      { type: 'classify', prompt: 'Classify demonstratives by distance', categories: ['Near (this)', 'Far (that)'], items: [{ text: 'هذا', category: 'Near (this)' }, { text: 'ذلك', category: 'Far (that)' }, { text: 'هذه', category: 'Near (this)' }, { text: 'تلك', category: 'Far (that)' }] },
      { type: 'build-sentence', prompt: 'Build: "that is a beautiful girl"', answer: 'تلك بنت جميلة', options: ['تلك بنت جميلة', 'هذه بنت جميلة', 'ذلك بنت جميلة', 'تلك جميلة بنت'] },
    ],
    quiz: [
      { question: 'Which demonstrative goes with masculine nouns for "this"?', options: ['هذه', 'هذا', 'تلك', 'ذلك'], correct: 1, explanation: 'هذا (haadha) is "this" for masculine nouns' },
      { question: 'How do you say "that school" (school = مدرسة, feminine)?', options: ['ذلك المدرسة', 'تلك المدرسة', 'هذه المدرسة', 'هذا المدرسة'], correct: 1, explanation: 'تلك المدرسة — تلك is "that" for feminine nouns' },
      { question: 'What does ذلك mean?', options: ['this (f)', 'this (m)', 'that (f)', 'that (m)'], correct: 3, explanation: 'ذلك (dhaalika) means "that" for masculine nouns' },
      { question: 'Which is correct for "this is a boy"?', options: ['هذه ولد', 'هذا ولد', 'ذلك ولد', 'تلك ولد'], correct: 1, explanation: 'هذا ولد — هذا for masculine noun ولد' },
    ],
  },

  {
    id: 'possessive-pronouns',
    title: 'Possessive Pronouns',
    titleArabic: 'ضمائر الملكية',
    category: 'basics',
    difficulty: 1,
    order: 16,
    cefrLevel: 'A1',
    explanation: `In Arabic, possessive pronouns are suffixes attached directly to the noun. "My book" is كتابي (kitaabi) — the ي suffix means "my". This is one of Arabic's elegant features: ownership is shown by a simple ending change.

Key suffixes:
• ـي = my (I)
• ـك = your (you, masc.)
• ـكِ = your (you, fem.)
• ـه = his (he)
• ـها = her (she)
• ـنا = our (we)
• ـكم = your (you all)
• ـهم = their (they, masc.)`,
    examples: [
      { arabic: 'كتابي', english: 'my book', transliteration: 'kitaabi' },
      { arabic: 'كتابك', english: 'your book (m)', transliteration: 'kitaabuka' },
      { arabic: 'كتابه', english: 'his book', transliteration: 'kitaabuhu' },
      { arabic: 'كتابها', english: 'her book', transliteration: 'kitaabuhaa' },
      { arabic: 'كتابنا', english: 'our book', transliteration: 'kitaabunaa' },
    ],
    rules: [
      { rule: 'ي = my, ك = your(m), كِ = your(f)', example: 'بيتي (my house), بيتك (your house)' },
      { rule: 'ه = his, ها = her, نا = our', example: 'قلمه (his pen), قلمها (her pen)' },
      { rule: 'هم = their(m), هن = their(f)', example: 'بيتهم (their house)' },
    ],
    exercises: [
      { type: 'fill-blank', prompt: 'كتاب___ (my book)', answer: 'ي', options: ['ي', 'ك', 'ه', 'نا'] },
      { type: 'translate', prompt: 'her pen', answer: 'قلمها', options: ['قلمي', 'قلمك', 'قلمه', 'قلمها'] },
      { type: 'fill-blank', prompt: 'بيت___ (their house, m)', answer: 'هم', options: ['ه', 'ها', 'نا', 'هم'] },
      { type: 'match', prompt: 'Match possessive pronouns', pairs: [['كتابي', 'my book'], ['كتابك', 'your book (m)'], ['كتابه', 'his book'], ['كتابها', 'her book']] },
      { type: 'translate', prompt: 'our school', answer: 'مدرستنا', options: ['مدرستنا', 'مدرستي', 'مدرستك', 'مدرستهم'] },
      { type: 'true-false', statement: 'ـها means "his" in Arabic', answer: 'false', options: ['true', 'false'] },
      { type: 'true-false', statement: 'Possessive suffixes in Arabic attach directly to the noun', answer: 'true', options: ['true', 'false'] },
      { type: 'error-identification', sentence: 'هذا هو بيته ها', error: 'ها', correction: '(remove ها)', answer: 'ها', options: ['هذا', 'بيته', 'ها', 'No error'] },
      { type: 'sentence-transformation', prompt: 'Change to "his": كتابي', answer: 'كتابه', hint: 'change ي (my) to ه (his)', options: ['كتابه', 'كتابها', 'كتابك', 'كتابنا'] },
      { type: 'classify', prompt: 'Classify by possessor', categories: ['Singular', 'Plural'], items: [{ text: 'كتابي', category: 'Singular' }, { text: 'كتابنا', category: 'Plural' }, { text: 'كتابه', category: 'Singular' }, { text: 'كتابهم', category: 'Plural' }] },
      { type: 'word-order', prompt: 'Which is "his book"?', answer: 'كتابه', options: ['كتابه', 'كتابها', 'كتابي', 'كتابنا'] },
      { type: 'build-sentence', prompt: 'Build: "our teacher"', answer: 'معلمنا', options: ['معلمنا', 'معلمي', 'معلمه', 'معلمهم'] },
    ],
    quiz: [
      { question: 'Which suffix means "my"?', options: ['ـك', 'ـي', 'ـه', 'ـنا'], correct: 1, explanation: 'ـي (ee) is the suffix for "my"' },
      { question: 'How do you say "his house"?', options: ['بيتي', 'بيتك', 'بيته', 'بيتها'], correct: 2, explanation: 'بيته — ه suffix means "his"' },
      { question: 'What does ـها mean when attached to a noun?', options: ['my', 'his', 'her', 'our'], correct: 2, explanation: 'ـها (haa) means "her" when attached to a noun' },
      { question: 'How do you say "our school"?', options: ['مدرستي', 'مدرستك', 'مدرسته', 'مدرستنا'], correct: 3, explanation: 'مدرستنا = "our school" (مدرسة + نا)' },
    ],
  },

  {
    id: 'basic-negation',
    title: 'Basic Negation (لا / ليس)',
    titleArabic: 'النفي الأساسي',
    category: 'basics',
    difficulty: 1,
    order: 17,
    cefrLevel: 'A1',
    explanation: `Arabic has two main ways to negate: لا (laa) negates verbs and general statements, while ليس (laysa) negates nominal sentences (sentences without a verb). ليس conjugates to agree with the subject.

لا with verbs:
• لا أفهم = I don't understand
• لا يذهب = he doesn't go

ليس with nouns/adjectives:
• ليس طويلاً = he is not tall
• لست مريضاً = I am not sick`,
    examples: [
      { arabic: 'لا أفهم', english: 'I don\'t understand', transliteration: 'laa afham' },
      { arabic: 'ليس هذا كتابي', english: 'this is not my book', transliteration: 'laysa haadha kitaabi' },
      { arabic: 'لا أريد', english: 'I don\'t want', transliteration: 'laa uriid' },
      { arabic: 'ليست هنا', english: 'she is not here', transliteration: 'laysat hunaa' },
    ],
    rules: [
      { rule: 'لا + verb = don\'t/doesn\'t', example: 'لا يعرف (he doesn\'t know)' },
      { rule: 'ليس + nominal = is not', example: 'ليس كبيرًا (it is not big)' },
      { rule: 'ليس conjugates: لست، لست، ليس، ليست', example: 'لست طالبًا (I am not a student)' },
    ],
    exercises: [
      { type: 'fill-blank', prompt: '___ أفهم (I don\'t understand)', answer: 'لا', options: ['لا', 'ليس', 'لن', 'ما'] },
      { type: 'translate', prompt: 'he is not here', answer: 'ليس هنا', options: ['ليس هنا', 'لا هنا', 'لست هنا', 'ما هنا'] },
      { type: 'fill-blank', prompt: '___ هذا الكتاب جيداً (this book is not good)', answer: 'ليس', options: ['لا', 'ليس', 'لن', 'غير'] },
      { type: 'match', prompt: 'Match negation patterns', pairs: [['لا أذهب', 'I don\'t go'], ['ليس هنا', 'he is not here'], ['لا يفهم', 'he doesn\'t understand'], ['ليست طالبة', 'she is not a student']] },
      { type: 'true-false', statement: 'لا is used to negate verbs', answer: 'true', options: ['true', 'false'] },
      { type: 'true-false', statement: 'ليس never changes form', answer: 'false', options: ['true', 'false'] },
      { type: 'error-identification', sentence: 'ليس أذهب إلى المدرسة', error: 'ليس', correction: 'لا', answer: 'ليس', options: ['ليس', 'أذهب', 'المدرسة', 'No error'] },
      { type: 'sentence-transformation', prompt: 'Negate: أنا طالب (I am a student)', answer: 'لست طالباً', hint: 'use ليس conjugated for أنا', options: ['لست طالباً', 'لا طالب', 'ليس طالب', 'لا أنا طالب'] },
      { type: 'word-order', prompt: 'Which correctly says "I don\'t write"?', answer: 'لا أكتب', options: ['لا أكتب', 'أكتب لا', 'ليس أكتب', 'لا يكتب'] },
      { type: 'classify', prompt: 'Classify negation: use لا or ليس', categories: ['لا (verbs)', 'ليس (nouns/adj)'], items: [{ text: 'لا أذهب', category: 'لا (verbs)' }, { text: 'ليس كبيرًا', category: 'ليس (nouns/adj)' }, { text: 'لا يكتب', category: 'لا (verbs)' }, { text: 'لست هنا', category: 'ليس (nouns/adj)' }] },
      { type: 'multiple-select', prompt: 'Select all verb negation examples:', correctAnswers: ['لا أذهب', 'لا يفهم'], options: ['لا أذهب', 'ليس هنا', 'لا يفهم', 'لست طالباً'], answer: 'لا أذهب,لا يفهم' },
      { type: 'build-sentence', prompt: 'Build: "she is not a teacher"', answer: 'ليست معلمة', options: ['ليست معلمة', 'لا معلمة', 'ليس معلمة', 'لست معلمة'] },
    ],
    quiz: [
      { question: 'Which particle negates verbs in Arabic?', options: ['ليس', 'لا', 'غير', 'عدم'], correct: 1, explanation: 'لا (laa) is used before verbs to negate them' },
      { question: 'How do you say "I am not a student" (nominal sentence)?', options: ['لا طالب', 'لست طالباً', 'ليس طالباً', 'ما طالباً'], correct: 1, explanation: 'لست طالباً — لست is ليس conjugated for أنا' },
      { question: 'What does ليست mean?', options: ['is not (masc.)', 'is not (fem.)', 'do not', 'will not'], correct: 1, explanation: 'ليست is the feminine form of ليس (is not)' },
      { question: 'Which is correct for "he doesn\'t know"?', options: ['ليس يعرف', 'لا يعرف', 'لست يعرف', 'ما يعرف'], correct: 1, explanation: 'لا يعرف (laa ya\'rif) = "he doesn\'t know"' },
    ],
  },

  {
    id: 'present-tense',
    title: 'Present Tense (المضارع)',
    titleArabic: 'الفعل المضارع',
    category: 'verbs',
    difficulty: 2,
    order: 18,
    cefrLevel: 'A2',
    explanation: `The Arabic present tense (المضارع) is formed by adding prefixes to the verb root. Each person has a unique prefix: أ (I), ت (you/she), ي (he), ن (we). The present tense describes ongoing or habitual actions.

Full conjugation of كَتَبَ (to write):
• أكتب = I write
• تكتب = you write (m) / she writes
• يكتب = he writes
• نكتب = we write
• يكتبون = they write (m)
• تكتبن = they write (f)`,
    examples: [
      { arabic: 'أكتب', english: 'I write', transliteration: 'aktub' },
      { arabic: 'تكتب', english: 'you write (m)', transliteration: 'taktub' },
      { arabic: 'يكتب', english: 'he writes', transliteration: 'yaktub' },
      { arabic: 'نكتب', english: 'we write', transliteration: 'naktub' },
    ],
    rules: [
      { rule: 'أ- prefix = I (أنا)', example: 'أذهب (I go)' },
      { rule: 'ي- prefix = he, ت- = you/she', example: 'يقرأ (he reads), تقرأ (you/she reads)' },
      { rule: 'ن- prefix = we (نحن)', example: 'نفهم (we understand)' },
    ],
    exercises: [
      { type: 'fill-blank', prompt: 'أنا ___ العربية (I study Arabic)', answer: 'أدرس', options: ['أدرس', 'يدرس', 'تدرس', 'ندرس'] },
      { type: 'translate', prompt: 'she reads', answer: 'تقرأ', options: ['أقرأ', 'تقرأ', 'يقرأ', 'نقرأ'] },
      { type: 'fill-blank', prompt: 'هو ___ في البيت (he lives in the house)', answer: 'يسكن', options: ['يسكن', 'تسكن', 'أسكن', 'نسكن'] },
      { type: 'match', prompt: 'Match conjugations of ذَهَبَ', pairs: [['أذهب', 'I go'], ['يذهب', 'he goes'], ['تذهب', 'she goes'], ['نذهب', 'we go']] },
      { type: 'conjugation-drill', prompt: 'Conjugate قَرَأَ for أنا (present)', verb: 'قَرَأَ', root: 'ق-ر-أ', pronoun: 'أنا', paradigm: 'present', answer: 'أقرأ', options: ['أقرأ', 'يقرأ', 'تقرأ', 'نقرأ'] },
      { type: 'conjugation-drill', prompt: 'Conjugate فَهِمَ for هو (present)', verb: 'فَهِمَ', root: 'ف-ه-م', pronoun: 'هو', paradigm: 'present', answer: 'يفهم', options: ['أفهم', 'يفهم', 'تفهم', 'نفهم'] },
      { type: 'conjugation-drill', prompt: 'Conjugate سَكَنَ for نحن (present)', verb: 'سَكَنَ', root: 'س-ك-ن', pronoun: 'نحن', paradigm: 'present', answer: 'نسكن', options: ['أسكن', 'يسكن', 'تسكن', 'نسكن'] },
      { type: 'true-false', statement: 'The prefix ت is used for both "you (m)" and "she" in present tense', answer: 'true', options: ['true', 'false'] },
      { type: 'error-identification', sentence: 'نحن يدرس في المدرسة', error: 'يدرس', correction: 'ندرس', answer: 'يدرس', options: ['نحن', 'يدرس', 'المدرسة', 'No error'] },
      { type: 'sentence-transformation', prompt: 'Change subject to هو: أكتب الدرس', answer: 'يكتب الدرس', hint: 'أنا (أ) → هو (ي)', options: ['يكتب الدرس', 'تكتب الدرس', 'نكتب الدرس', 'كتب الدرس'] },
      { type: 'word-order', prompt: 'Which correctly says "We understand Arabic"?', answer: 'نفهم العربية', options: ['نفهم العربية', 'العربية نفهم', 'يفهم العربية', 'نفهم عربية'] },
      { type: 'build-sentence', prompt: 'Build: "She lives in Egypt"', answer: 'تسكن في مصر', options: ['تسكن في مصر', 'يسكن في مصر', 'أسكن في مصر', 'سكنت في مصر'] },
    ],
    quiz: [
      { question: 'What prefix marks "he" in present tense?', options: ['أ', 'ت', 'ي', 'ن'], correct: 2, explanation: 'ي is the prefix for "he" (huwa) in present tense' },
      { question: 'How do you say "we understand"?', options: ['أفهم', 'يفهم', 'تفهم', 'نفهم'], correct: 3, explanation: 'نفهم — ن prefix for نحن (we)' },
      { question: 'Which form means "she writes"?', options: ['أكتب', 'يكتب', 'تكتب', 'نكتب'], correct: 2, explanation: 'تكتب can mean "you write (m)" OR "she writes"' },
      { question: 'What does أدرس mean?', options: ['he studies', 'you study', 'I study', 'we study'], correct: 2, explanation: 'أدرس = "I study" (أ prefix = I)' },
    ],
  },

  {
    id: 'future-tense',
    title: 'Future Tense (سَوْفَ / سَ)',
    titleArabic: 'المستقبل',
    category: 'verbs',
    difficulty: 2,
    order: 19,
    cefrLevel: 'A2',
    explanation: `Arabic forms the future by adding سوف (sawfa) or the prefix سـ (sa-) before the present tense verb. Both mean "will" but سـ is more immediate while سوف is more distant or formal.

• سأذهب = I will go (soon)
• سوف أذهب = I will go (formal/distant)
• Negation: لن + subjunctive = will not`,
    examples: [
      { arabic: 'سأذهب', english: 'I will go', transliteration: 'sa-adhhab' },
      { arabic: 'سوف أدرس', english: 'I will study', transliteration: 'sawfa adrus' },
      { arabic: 'سيكتب', english: 'he will write', transliteration: 'sa-yaktub' },
      { arabic: 'لن أذهب', english: 'I will not go', transliteration: 'lan adhhab' },
    ],
    rules: [
      { rule: 'سـ + present verb = near future', example: 'سأفعل (I will do — soon)' },
      { rule: 'سوف + present verb = distant/formal future', example: 'سوف نسافر (we will travel)' },
      { rule: 'Negation: لن + present subjunctive', example: 'لن أذهب (I will not go)' },
    ],
    exercises: [
      { type: 'translate', prompt: 'I will read', answer: 'سأقرأ', options: ['سأقرأ', 'أقرأ', 'قرأت', 'سيقرأ'] },
      { type: 'fill-blank', prompt: '___ يكتب الدرس غداً (he will write the lesson tomorrow)', answer: 'سوف', options: ['سوف', 'كان', 'قد', 'لن'] },
      { type: 'translate', prompt: 'she will study', answer: 'ستدرس', options: ['ستدرس', 'تدرس', 'درست', 'سأدرس'] },
      { type: 'match', prompt: 'Match future forms of ذَهَبَ', pairs: [['سأذهب', 'I will go'], ['سيذهب', 'he will go'], ['ستذهب', 'she will go'], ['سنذهب', 'we will go']] },
      { type: 'conjugation-drill', prompt: 'Conjugate كَتَبَ for هو (future)', verb: 'كَتَبَ', root: 'ك-ت-ب', pronoun: 'هو', paradigm: 'future', answer: 'سيكتب', options: ['سأكتب', 'سيكتب', 'ستكتب', 'سنكتب'] },
      { type: 'conjugation-drill', prompt: 'Conjugate سَافَرَ for أنا (future)', verb: 'سَافَرَ', root: 'س-ف-ر', pronoun: 'أنا', paradigm: 'future', answer: 'سأسافر', options: ['سأسافر', 'سيسافر', 'ستسافر', 'سنسافر'] },
      { type: 'true-false', statement: 'سوف is more formal than سـ prefix', answer: 'true', options: ['true', 'false'] },
      { type: 'true-false', statement: 'لن أذهب means "I went"', answer: 'false', options: ['true', 'false'] },
      { type: 'error-identification', sentence: 'أنا سوف سيذهب إلى السوق', error: 'سيذهب', correction: 'أذهب', answer: 'سيذهب', options: ['أنا', 'سوف', 'سيذهب', 'No error'] },
      { type: 'sentence-transformation', prompt: 'Change to future: أنا أدرس العربية', answer: 'أنا سأدرس العربية', hint: 'add سـ before the verb', options: ['أنا سأدرس العربية', 'أنا سيدرس العربية', 'أنا سوف يدرس', 'سأدرس أنا'] },
      { type: 'word-order', prompt: 'Which correctly says "We will travel tomorrow"?', answer: 'سنسافر غداً', options: ['سنسافر غداً', 'غداً سنسافر', 'نسافر غداً سوف', 'سوف سنسافر'] },
      { type: 'build-sentence', prompt: 'Build: "He will not come"', answer: 'لن يأتي', options: ['لن يأتي', 'لا يأتي', 'لم يأتِ', 'ليس يأتي'] },
    ],
    quiz: [
      { question: 'How do you say "he will write"?', options: ['يكتب', 'كتب', 'سيكتب', 'سأكتب'], correct: 2, explanation: 'سيكتب = "he will write" (سـ prefix + يكتب)' },
      { question: 'Which particle indicates "will not" (future negation)?', options: ['لا', 'لم', 'لن', 'ليس'], correct: 2, explanation: 'لن (lan) + subjunctive = will not' },
      { question: 'What is the difference between سـ and سوف?', options: ['No difference', 'سـ is more formal', 'سوف is more formal/distant', 'سوف is only for past'], correct: 2, explanation: 'سوف is more formal and can indicate a more distant future' },
      { question: 'How do you say "I will go"?', options: ['ذهبت', 'أذهب', 'سأذهب', 'يذهب'], correct: 2, explanation: 'سأذهب = "I will go" (سـ + أذهب)' },
    ],
  },

  {
    id: 'dual-form',
    title: 'The Dual Form (المثنى)',
    titleArabic: 'المثنى',
    category: 'nouns',
    difficulty: 2,
    order: 20,
    cefrLevel: 'A2',
    explanation: `Arabic has a special form for exactly two of something — the dual. Add ان (-aan) for nominative or ين (-ayn) for accusative/genitive. This exists in no European language and is one of Arabic's distinctive features.

• كتابان = two books (nominative)
• كتابَيْن = two books (accusative/genitive)
• بيتان = two houses (nominative)
• مدرستان = two schools (nominative, feminine)`,
    examples: [
      { arabic: 'كتابان', english: 'two books (nom)', transliteration: 'kitaabaan' },
      { arabic: 'كتابين', english: 'two books (acc/gen)', transliteration: 'kitaabayn' },
      { arabic: 'ولدان', english: 'two boys', transliteration: 'waladaan' },
      { arabic: 'طالبتان', english: 'two female students', transliteration: 'taalibataan' },
    ],
    rules: [
      { rule: 'Nominative dual: noun + ان', example: 'معلمان (two teachers)' },
      { rule: 'Accusative/genitive dual: noun + ين', example: 'معلمَين (two teachers — acc/gen)' },
      { rule: 'Feminine dual: ة becomes تان/تين', example: 'طالبة → طالبتان' },
    ],
    exercises: [
      { type: 'fill-blank', prompt: 'عندي ___ (I have two books)', answer: 'كتابان', options: ['كتابان', 'كتب', 'كتاب', 'كتابين'] },
      { type: 'translate', prompt: 'two boys (nominative)', answer: 'ولدان', options: ['ولد', 'ولدان', 'ولدين', 'أولاد'] },
      { type: 'fill-blank', prompt: 'قرأت ___ (I read two books — accusative)', answer: 'كتابين', options: ['كتابان', 'كتابين', 'كتب', 'كتابات'] },
      { type: 'match', prompt: 'Match dual forms', pairs: [['كتابان', 'two books (nom)'], ['كتابين', 'two books (acc)'], ['ولدان', 'two boys (nom)'], ['طالبتان', 'two students (f, nom)']] },
      { type: 'true-false', statement: 'Arabic has a special form for exactly two of something', answer: 'true', options: ['true', 'false'] },
      { type: 'true-false', statement: 'ان and ين dual endings are used in the same cases', answer: 'false', options: ['true', 'false'] },
      { type: 'error-identification', sentence: 'عندي معلمين في الصف (nominative context)', error: 'معلمين', correction: 'معلمان', answer: 'معلمين', options: ['عندي', 'معلمين', 'الصف', 'No error'] },
      { type: 'sentence-transformation', prompt: 'Change to dual: كتاب (singular)', answer: 'كتابان', hint: 'add ان for nominative dual', options: ['كتابان', 'كتابين', 'كتب', 'كتابات'] },
      { type: 'classify', prompt: 'Classify dual nouns by case', categories: ['Nominative (ان)', 'Accusative/Gen (ين)'], items: [{ text: 'كتابان', category: 'Nominative (ان)' }, { text: 'كتابين', category: 'Accusative/Gen (ين)' }, { text: 'ولدان', category: 'Nominative (ان)' }, { text: 'ولدين', category: 'Accusative/Gen (ين)' }] },
      { type: 'word-order', prompt: 'Which is the nominative dual of "school"?', answer: 'مدرستان', options: ['مدرستان', 'مدرستين', 'مدرسات', 'مدرسة'] },
      { type: 'multiple-select', prompt: 'Select all nominative dual forms:', correctAnswers: ['كتابان', 'ولدان'], options: ['كتابان', 'كتابين', 'ولدان', 'ولدين'], answer: 'كتابان,ولدان' },
      { type: 'build-sentence', prompt: 'Build: "I have two teachers"', answer: 'عندي معلمان', options: ['عندي معلمان', 'عندي معلمين', 'عندي معلم', 'معلمان عندي'] },
    ],
    quiz: [
      { question: 'What is the nominative dual of كتاب?', options: ['كتب', 'كتابان', 'كتابين', 'كتابات'], correct: 1, explanation: 'كتابان (kitaabaan) is the nominative dual — add ان' },
      { question: 'Which ending is used for accusative/genitive dual?', options: ['ان', 'ون', 'ين', 'ات'], correct: 2, explanation: 'ين (-ayn) is used for the accusative and genitive dual' },
      { question: 'How does the feminine dual form change?', options: ['ة stays the same', 'ة → تان (nom) / تين (acc)', 'ة → ان', 'ة is dropped'], correct: 1, explanation: 'Feminine ة becomes تان in nominative and تين in accusative/genitive' },
      { question: 'What does ولدان mean?', options: ['many boys', 'one boy', 'two boys (nom)', 'two boys (acc)'], correct: 2, explanation: 'ولدان (waladaan) = "two boys" in the nominative case' },
    ],
  },

  {
    id: 'sound-plural',
    title: 'Sound Plurals',
    titleArabic: 'جمع السالم',
    category: 'nouns',
    difficulty: 2,
    order: 21,
    cefrLevel: 'A2',
    explanation: `Sound plurals follow predictable patterns. Masculine sound plural adds ون (-uun) nominative or ين (-iin) accusative/genitive. Feminine sound plural changes ة to ات (-aat). These are "sound" because the root stays intact.

Masculine sound plural:
• معلم → معلمون (teachers, nom)
• معلم → معلمين (teachers, acc/gen)

Feminine sound plural:
• معلمة → معلمات (female teachers)
• سيارة → سيارات (cars)`,
    examples: [
      { arabic: 'معلمون', english: 'teachers (m, nom)', transliteration: 'mu\'allimuun' },
      { arabic: 'معلمين', english: 'teachers (m, acc/gen)', transliteration: 'mu\'allimiin' },
      { arabic: 'معلمات', english: 'teachers (f)', transliteration: 'mu\'allimaat' },
      { arabic: 'طالبات', english: 'female students', transliteration: 'taalibaat' },
    ],
    rules: [
      { rule: 'Masc sound plural: ون (nom) / ين (acc/gen)', example: 'مهندسون / مهندسين (engineers)' },
      { rule: 'Fem sound plural: ة → ات', example: 'سيارة → سيارات (cars)' },
      { rule: 'Only for rational beings (humans) in masculine', example: 'معلمون (teachers) but NOT كتابون' },
    ],
    exercises: [
      { type: 'translate', prompt: 'female engineers', answer: 'مهندسات', options: ['مهندسات', 'مهندسون', 'مهندسين', 'مهندسة'] },
      { type: 'fill-blank', prompt: 'الطلاب ___ في الفصل (the students are in the classroom — nominative)', answer: 'موجودون', options: ['موجودون', 'موجودين', 'موجودة', 'موجود'] },
      { type: 'translate', prompt: 'cars (plural of سيارة)', answer: 'سيارات', options: ['سيارات', 'سيارون', 'سيارين', 'سائرة'] },
      { type: 'match', prompt: 'Match singular and plural', pairs: [['معلم', 'معلمون'], ['طالبة', 'طالبات'], ['مهندس', 'مهندسون'], ['ممرضة', 'ممرضات']] },
      { type: 'sentence-transformation', prompt: 'Make plural: معلمة (teacher, f)', answer: 'معلمات', hint: 'change ة to ات', options: ['معلمات', 'معلمون', 'معلمين', 'معلمة'] },
      { type: 'true-false', statement: 'The masculine sound plural uses ات ending', answer: 'false', options: ['true', 'false'] },
      { type: 'true-false', statement: 'كتابات is NOT a valid sound plural (كتاب is not human)', answer: 'true', options: ['true', 'false'] },
      { type: 'error-identification', sentence: 'المعلمات جميلون في هذا الصف', error: 'جميلون', correction: 'جميلات', answer: 'جميلون', options: ['المعلمات', 'جميلون', 'هذا', 'No error'] },
      { type: 'classify', prompt: 'Classify plurals as sound masculine or sound feminine', categories: ['Masculine (ون/ين)', 'Feminine (ات)'], items: [{ text: 'معلمون', category: 'Masculine (ون/ين)' }, { text: 'معلمات', category: 'Feminine (ات)' }, { text: 'طالبون', category: 'Masculine (ون/ين)' }, { text: 'طالبات', category: 'Feminine (ات)' }] },
      { type: 'word-order', prompt: 'Which is "the female students are present"?', answer: 'الطالبات موجودات', options: ['الطالبات موجودات', 'الطالبون موجودات', 'الطالبات موجودون', 'موجودات الطالبات'] },
      { type: 'multiple-select', prompt: 'Select all sound feminine plural forms:', correctAnswers: ['معلمات', 'طالبات'], options: ['معلمات', 'معلمون', 'طالبات', 'طالبون'], answer: 'معلمات,طالبات' },
      { type: 'build-sentence', prompt: 'Build: "The engineers are here" (masc)', answer: 'المهندسون هنا', options: ['المهندسون هنا', 'المهندسات هنا', 'المهندسين هنا', 'هنا المهندسون'] },
    ],
    quiz: [
      { question: 'What ending forms the masculine sound plural (nominative)?', options: ['ات', 'ون', 'ين', 'ان'], correct: 1, explanation: 'ون (-uun) forms the nominative masculine sound plural' },
      { question: 'How do you form the feminine sound plural?', options: ['Add ون', 'Change ة to ات', 'Add ان', 'Change to أفعال pattern'], correct: 1, explanation: 'Feminine sound plural: change ة → ات (e.g. سيارة → سيارات)' },
      { question: 'What does معلمات mean?', options: ['teachers (m)', 'teacher (f, sing)', 'female teachers', 'the teacher'], correct: 2, explanation: 'معلمات = "female teachers" (sound feminine plural)' },
      { question: 'Which sentence uses the masculine sound plural correctly?', options: ['المعلمون موجودون', 'المعلمون موجودات', 'المعلمات موجودون', 'معلمون موجود'], correct: 0, explanation: 'المعلمون موجودون — both subject and predicate are masculine plural' },
    ],
  },

  {
    id: 'broken-plural',
    title: 'Broken Plurals',
    titleArabic: 'جمع التكسير',
    category: 'nouns',
    difficulty: 2,
    order: 22,
    cefrLevel: 'A2',
    explanation: `Broken plurals change the internal vowel pattern of the word — the "skeleton" of consonants stays but vowels shift. This is unique to Semitic languages. There are about 30 patterns, but a few are very common:

• فُعُول (fu'uul): بيت → بيوت, درس → دروس
• أَفْعَال (af'aal): قلم → أقلام, ولد → أولاد
• فِعَال (fi'aal): جبل → جبال, رجل → رجال
• فُعَل (fu'al): كلمة → كلم, غرفة → غرف`,
    examples: [
      { arabic: 'كتاب → كتب', english: 'book → books', transliteration: 'kitaab → kutub' },
      { arabic: 'قلم → أقلام', english: 'pen → pens', transliteration: 'qalam → aqlaam' },
      { arabic: 'رجل → رجال', english: 'man → men', transliteration: 'rajul → rijaal' },
      { arabic: 'بيت → بيوت', english: 'house → houses', transliteration: 'bayt → buyuut' },
    ],
    rules: [
      { rule: 'فُعُول pattern (most common)', example: 'بيت → بيوت, درس → دروس' },
      { rule: 'أَفْعَال pattern', example: 'قلم → أقلام, ولد → أولاد' },
      { rule: 'فِعَال pattern', example: 'جبل → جبال, رجل → رجال' },
    ],
    exercises: [
      { type: 'translate', prompt: 'books (plural of كتاب)', answer: 'كتب', options: ['كتب', 'كتابات', 'كتابون', 'كتابين'] },
      { type: 'fill-blank', prompt: 'عندي ثلاثة ___ (I have three pens)', answer: 'أقلام', options: ['أقلام', 'قلمات', 'قلمون', 'أقلامات'] },
      { type: 'translate', prompt: 'houses (plural)', answer: 'بيوت', options: ['بيوت', 'بيتات', 'بيتون', 'أبيات'] },
      { type: 'match', prompt: 'Match singular and broken plural', pairs: [['كتاب', 'كتب'], ['بيت', 'بيوت'], ['قلم', 'أقلام'], ['رجل', 'رجال']] },
      { type: 'true-false', statement: 'Broken plurals follow a completely unpredictable pattern', answer: 'false', options: ['true', 'false'] },
      { type: 'true-false', statement: 'كتب is the broken plural of كتاب', answer: 'true', options: ['true', 'false'] },
      { type: 'error-identification', sentence: 'عندي خمسة كتابات للدراسة', error: 'كتابات', correction: 'كتب', answer: 'كتابات', options: ['عندي', 'خمسة', 'كتابات', 'No error'] },
      { type: 'classify', prompt: 'Classify by broken plural pattern', categories: ['أَفْعَال', 'فُعُول'], items: [{ text: 'أقلام', category: 'أَفْعَال' }, { text: 'بيوت', category: 'فُعُول' }, { text: 'أولاد', category: 'أَفْعَال' }, { text: 'دروس', category: 'فُعُول' }] },
      { type: 'sentence-transformation', prompt: 'Make plural: درس (lesson)', answer: 'دروس', hint: 'pattern: فُعُول', options: ['دروس', 'درسات', 'درسون', 'أدراس'] },
      { type: 'word-order', prompt: 'Which is correct: "I studied many lessons"?', answer: 'درست دروساً كثيرة', options: ['درست دروساً كثيرة', 'درست درسات كثيرة', 'درست دروسات', 'كثيرة دروس درست'] },
      { type: 'multiple-select', prompt: 'Select all أَفْعَال pattern plurals:', correctAnswers: ['أقلام', 'أولاد'], options: ['أقلام', 'بيوت', 'أولاد', 'رجال'], answer: 'أقلام,أولاد' },
      { type: 'build-sentence', prompt: 'Build: "He has many pens"', answer: 'عنده أقلام كثيرة', options: ['عنده أقلام كثيرة', 'عنده قلمات كثيرة', 'كثيرة أقلام عنده', 'عنده كثير قلم'] },
    ],
    quiz: [
      { question: 'What is the broken plural of بيت (house)?', options: ['بيوت', 'بيتات', 'بيتون', 'أبيات'], correct: 0, explanation: 'بيوت (buyuut) follows the فُعُول pattern' },
      { question: 'What is the broken plural of قلم (pen)?', options: ['قلمات', 'أقلام', 'قلمون', 'قلائم'], correct: 1, explanation: 'أقلام (aqlaam) follows the أَفْعَال pattern' },
      { question: 'What is special about broken plurals?', options: ['They add ون', 'They change internal vowels', 'They add ات', 'They double the last letter'], correct: 1, explanation: 'Broken plurals change the internal vowel pattern while keeping the root consonants' },
      { question: 'What is the plural of كتاب (book)?', options: ['كتابات', 'كتابون', 'كتب', 'أكتاب'], correct: 2, explanation: 'كتب (kutub) is the broken plural of كتاب (follows فُعُل pattern)' },
    ],
  },

  {
    id: 'comparative',
    title: 'Comparative & Superlative',
    titleArabic: 'التفضيل',
    category: 'nouns',
    difficulty: 2,
    order: 23,
    cefrLevel: 'A2',
    explanation: `Arabic comparative follows the pattern أَفْعَل (af'al): كبير (big) → أكبر (bigger/biggest). The same form serves as both comparative and superlative depending on context. With من (min = than), it's comparative; with ال, it's superlative.

• أكبر من = bigger than
• الأكبر = the biggest
• أجمل من = more beautiful than
• الأجمل = the most beautiful`,
    examples: [
      { arabic: 'أكبر', english: 'bigger / biggest', transliteration: 'akbar' },
      { arabic: 'أصغر من', english: 'smaller than', transliteration: 'asghar min' },
      { arabic: 'الأجمل', english: 'the most beautiful', transliteration: 'al-ajmal' },
      { arabic: 'أطول من', english: 'taller than', transliteration: 'atwal min' },
    ],
    rules: [
      { rule: 'Pattern: أَفْعَل from root', example: 'كبير (big) → أكبر, جميل (beautiful) → أجمل' },
      { rule: 'Comparative: أفعل + من', example: 'هو أكبر من أخيه (he is bigger than his brother)' },
      { rule: 'Superlative: ال + أفعل', example: 'هي الأذكى (she is the smartest)' },
    ],
    exercises: [
      { type: 'fill-blank', prompt: 'هذا البيت ___ من ذلك (this house is bigger than that)', answer: 'أكبر', options: ['أكبر', 'كبير', 'الأكبر', 'كبيرة'] },
      { type: 'translate', prompt: 'smaller than', answer: 'أصغر من', options: ['أصغر من', 'صغير من', 'الأصغر', 'أصغر'] },
      { type: 'fill-blank', prompt: 'هو ___ طالب في الصف (he is the best student)', answer: 'أفضل', options: ['أفضل', 'فضل', 'جيد', 'الجيد'] },
      { type: 'match', prompt: 'Match adjective to comparative', pairs: [['كبير', 'أكبر'], ['صغير', 'أصغر'], ['جميل', 'أجمل'], ['طويل', 'أطول']] },
      { type: 'sentence-transformation', prompt: 'Make comparative: هو كبير', answer: 'هو أكبر من أخيه', hint: 'use أفعل pattern + من', options: ['هو أكبر من أخيه', 'هو الأكبر', 'هو كبير جداً', 'هو أكبر'] },
      { type: 'true-false', statement: 'أكبر can mean both "bigger" and "biggest" depending on context', answer: 'true', options: ['true', 'false'] },
      { type: 'true-false', statement: 'The superlative always uses من (than)', answer: 'false', options: ['true', 'false'] },
      { type: 'error-identification', sentence: 'هي أجمل من هو بكثير', error: 'هو', correction: 'منه', answer: 'هو', options: ['هي', 'أجمل', 'هو', 'No error'] },
      { type: 'classify', prompt: 'Classify as comparative or superlative usage', categories: ['Comparative (+ من)', 'Superlative (ال +)'], items: [{ text: 'أكبر من', category: 'Comparative (+ من)' }, { text: 'الأكبر', category: 'Superlative (ال +)' }, { text: 'أجمل من', category: 'Comparative (+ من)' }, { text: 'الأجمل', category: 'Superlative (ال +)' }] },
      { type: 'word-order', prompt: 'Which correctly says "she is the most beautiful"?', answer: 'هي الأجمل', options: ['هي الأجمل', 'هي أجمل', 'الأجمل هي', 'هي أجمل من'] },
      { type: 'multiple-select', prompt: 'Select all comparative forms:', correctAnswers: ['أكبر من', 'أطول من'], options: ['أكبر من', 'الأكبر', 'أطول من', 'الأطول'], answer: 'أكبر من,أطول من' },
      { type: 'build-sentence', prompt: 'Build: "This book is better than that one"', answer: 'هذا الكتاب أفضل من ذلك', options: ['هذا الكتاب أفضل من ذلك', 'هذا الكتاب الأفضل', 'ذلك أفضل من هذا الكتاب', 'هذا الكتاب أفضل'] },
    ],
    quiz: [
      { question: 'What is the comparative of كبير (big)?', options: ['كبيرة', 'أكبر', 'كبار', 'كبير جداً'], correct: 1, explanation: 'أكبر (akbar) follows the أَفْعَل pattern' },
      { question: 'How do you say "smaller than"?', options: ['أصغر', 'أصغر من', 'الأصغر', 'صغير جداً'], correct: 1, explanation: 'أصغر من = "smaller than" (comparative + من)' },
      { question: 'How do you form the superlative?', options: ['Add من after أفعل', 'Add ال before أفعل', 'Add جداً after adjective', 'Use أكثر'], correct: 1, explanation: 'Superlative: ال + أفعل form (e.g. الأكبر = the biggest)' },
      { question: 'What is the comparative of جميل (beautiful)?', options: ['جميلة', 'أجمل', 'الأجمل', 'جميل جداً'], correct: 1, explanation: 'أجمل follows the أَفْعَل pattern (root: ج-م-ل)' },
    ],
  },

  {
    id: 'active-participle',
    title: 'Active Participle (اسم الفاعل)',
    titleArabic: 'اسم الفاعل',
    category: 'verbs',
    difficulty: 2,
    order: 24,
    cefrLevel: 'A2',
    explanation: `The active participle (اسم الفاعل) describes the doer of an action. From Form I verbs, the pattern is فاعِل (faa'il). كتب (wrote) → كاتب (writer). This is incredibly productive in Arabic — hundreds of common words are active participles.

Pattern: فاعِل (faa'il) for Form I verbs

Examples:
• كَتَبَ → كاتِب (writer)
• دَرَسَ → دارِس (studier)
• سَكَنَ → ساكِن (resident)
• عَمِلَ → عامِل (worker)`,
    examples: [
      { arabic: 'كاتب', english: 'writer / writing', transliteration: 'kaatib' },
      { arabic: 'طالب', english: 'student / seeking', transliteration: 'taalib' },
      { arabic: 'عامل', english: 'worker / working', transliteration: '\'aamil' },
      { arabic: 'سائق', english: 'driver / driving', transliteration: 'saa\'iq' },
    ],
    rules: [
      { rule: 'Form I pattern: فاعِل (faa\'il)', example: 'درس → دارس (studier), حكم → حاكم (ruler)' },
      { rule: 'Can function as noun or adjective', example: 'هو كاتب (he is a writer) / كاتب مشهور (a famous writer)' },
      { rule: 'Feminine: فاعلة', example: 'كاتبة (female writer), طالبة (female student)' },
    ],
    exercises: [
      { type: 'fill-blank', prompt: 'هو ___ في المدرسة (he is a teacher at the school)', answer: 'معلم', options: ['معلم', 'علم', 'تعليم', 'يعلم'] },
      { type: 'translate', prompt: 'active participle of كَتَبَ', answer: 'كاتب', options: ['كاتب', 'مكتوب', 'كتابة', 'يكتب'] },
      { type: 'fill-blank', prompt: 'هي ___ للامتحان (she is studying for the exam — act. part.)', answer: 'دارسة', options: ['دارسة', 'دارس', 'تدرس', 'مدروسة'] },
      { type: 'match', prompt: 'Match verb to active participle', pairs: [['كَتَبَ', 'كاتب'], ['دَرَسَ', 'دارس'], ['عَمِلَ', 'عامل'], ['سَكَنَ', 'ساكن']] },
      { type: 'conjugation-drill', prompt: 'Form active participle of ذَهَبَ (to go)', verb: 'ذَهَبَ', root: 'ذ-ه-ب', pronoun: 'م', paradigm: 'present', answer: 'ذاهب', options: ['ذاهب', 'مذهوب', 'ذهاب', 'ذهب'] },
      { type: 'sentence-transformation', prompt: 'Change to feminine: هو كاتب', answer: 'هي كاتبة', hint: 'add ة to فاعِل to make فاعِلة', options: ['هي كاتبة', 'هي كاتب', 'هو كاتبة', 'هي كاتبات'] },
      { type: 'true-false', statement: 'Active participles in Arabic follow the pattern فاعِل for Form I verbs', answer: 'true', options: ['true', 'false'] },
      { type: 'true-false', statement: 'كاتبة is the masculine active participle', answer: 'false', options: ['true', 'false'] },
      { type: 'error-identification', sentence: 'هي طالب في الجامعة (she is a student)', error: 'طالب', correction: 'طالبة', answer: 'طالب', options: ['هي', 'طالب', 'الجامعة', 'No error'] },
      { type: 'classify', prompt: 'Classify as active participle or regular verb form', categories: ['Active Participle', 'Verb Form'], items: [{ text: 'كاتب', category: 'Active Participle' }, { text: 'يكتب', category: 'Verb Form' }, { text: 'دارس', category: 'Active Participle' }, { text: 'درس', category: 'Verb Form' }] },
      { type: 'word-order', prompt: 'Which correctly says "a famous writer"?', answer: 'كاتب مشهور', options: ['كاتب مشهور', 'مشهور كاتب', 'الكاتب المشهور', 'يكتب مشهور'] },
      { type: 'build-sentence', prompt: 'Build: "She is a resident of this city"', answer: 'هي ساكنة في هذه المدينة', options: ['هي ساكنة في هذه المدينة', 'هي ساكن في هذه المدينة', 'هي تسكن في هذه المدينة', 'ساكنة هي في المدينة'] },
    ],
    quiz: [
      { question: 'What pattern forms the active participle (Form I)?', options: ['مَفْعول', 'فاعِل', 'فَعّال', 'أَفْعَل'], correct: 1, explanation: 'فاعِل (faa\'il) is the Form I active participle pattern' },
      { question: 'What is the active participle of كَتَبَ (to write)?', options: ['مكتوب', 'كتابة', 'كاتب', 'يكتب'], correct: 2, explanation: 'كاتب (kaatib) = "writer" — the active participle of كَتَبَ' },
      { question: 'How do you say "female student" using the active participle pattern?', options: ['طالب', 'طالبة', 'طلاب', 'مطلوبة'], correct: 1, explanation: 'طالبة (taaliba) is the feminine active participle — add ة to طالب' },
      { question: 'Which of these is an active participle?', options: ['مكتوب', 'يكتب', 'كتابة', 'كاتب'], correct: 3, explanation: 'كاتب (kaatib) follows the فاعِل pattern — it\'s an active participle meaning "writer"' },
    ],
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

export const grammarCategories = [
  { id: 'basics', name: 'Basics', nameArabic: 'الأساسيات' },
  { id: 'nouns', name: 'Nouns', nameArabic: 'الأسماء' },
  { id: 'verbs', name: 'Verbs', nameArabic: 'الأفعال' },
  { id: 'questions', name: 'Questions', nameArabic: 'الأسئلة' },
  { id: 'prepositions', name: 'Prepositions', nameArabic: 'حروف الجر' },
  { id: 'vocabulary', name: 'Vocabulary', nameArabic: 'المفردات' },
];

export default grammarLessons;
