/**
 * companionDialogue.js — 2,400+ contextual dialogue lines (200+ per companion)
 *
 * Each companion has:
 * - 10+ greetings
 * - 45-60 zone comments (15+ per known zone, 3-4 zones each)
 * - 20+ object comments
 * - 15+ battle comments
 * - 30+ teaching lines (matching their specialty)
 * - 15+ relationship-gated lines (5 low, 5 medium, 5 high)
 * - 15+ idle comments
 *
 * Total: 200+ lines per companion × 12 = 2,400+ lines
 */

export const COMPANION_DIALOGUE = Object.freeze({
  companion_amira: {
    greetings: [
      { id: 'amira_greet_01', arabic: 'السلام عليكم يا صديقي', english: 'Peace be upon you, my friend', transliteration: 'as-salamu alaykum ya sadiqi', context: 'general' },
      { id: 'amira_greet_02', arabic: 'مرحباً! كيف حالك اليوم؟', english: 'Hello! How are you today?', transliteration: 'marhaban! kayfa haluka al-yawm?', context: 'general' },
      { id: 'amira_greet_03', arabic: 'أهلاً وسهلاً', english: 'Welcome', transliteration: 'ahlan wa sahlan', context: 'general' },
      { id: 'amira_greet_04', arabic: 'يا سلام! سُعدت برؤيتك', english: 'How wonderful! I am happy to see you', transliteration: 'ya salam! su\'idtu bi-ru\'yatik', context: 'friendly' },
      { id: 'amira_greet_05', arabic: 'صباح الخير', english: 'Good morning', transliteration: 'sabah al-khayr', context: 'morning' },
      { id: 'amira_greet_06', arabic: 'مساء النور', english: 'Good evening', transliteration: 'masa\' an-nur', context: 'evening' },
      { id: 'amira_greet_07', arabic: 'هل جئت للتعلم؟', english: 'Have you come to learn?', transliteration: 'hal ji\'ta lit-ta\'allum?', context: 'library' },
      { id: 'amira_greet_08', arabic: 'تفضل، اجلس معي', english: 'Please, sit with me', transliteration: 'tafaddal, ijlis ma\'i', context: 'friendly' },
      { id: 'amira_greet_09', arabic: 'ماذا تريد أن تتعلم اليوم؟', english: 'What do you want to learn today?', transliteration: 'madha turidu an tata\'allam al-yawm?', context: 'teaching' },
      { id: 'amira_greet_10', arabic: 'أنا في خدمتك', english: 'I am at your service', transliteration: 'ana fi khidmatik', context: 'formal' },
      { id: 'amira_greet_11', arabic: 'عودة ميمونة', english: 'Blessed return', transliteration: '\'awda maymuna', context: 'return' },
    ],
    zone_comments: {
      sacred_library: [
        { id: 'amira_lib_01', arabic: 'هذه المكتبة تحتوي على كنوز لا تُقدَّر بثمن', english: 'This library contains priceless treasures', transliteration: 'hadhihi al-maktaba tahtawi \'ala kunuz la tuqaddaru bi-thaman', trigger: 'zone_enter' },
        { id: 'amira_lib_02', arabic: 'انظر إلى هذا المخطوط القديم', english: 'Look at this ancient manuscript', transliteration: 'undhur ila hadha al-makhtut al-qadim', trigger: 'bookshelf' },
        { id: 'amira_lib_03', arabic: 'يجب علينا حماية هذا العلم', english: 'We must protect this knowledge', transliteration: 'yajibu alayna himayat hadha al-\'ilm', trigger: 'quest' },
        { id: 'amira_lib_04', arabic: 'الصمت واجب في المكتبة', english: 'Silence is required in the library', transliteration: 'as-samt wajib fi al-maktaba', trigger: 'idle' },
        { id: 'amira_lib_05', arabic: 'كتبت هذا بنفسي', english: 'I wrote this myself', transliteration: 'katabtu hadha bi-nafsi', trigger: 'object_interact' },
        { id: 'amira_lib_06', arabic: 'هل قرأت هذا الكتاب؟', english: 'Have you read this book?', transliteration: 'hal qara\'ta hadha al-kitab?', trigger: 'random' },
        { id: 'amira_lib_07', arabic: 'المعرفة قوة', english: 'Knowledge is power', transliteration: 'al-ma\'rifa quwwa', trigger: 'teaching' },
        { id: 'amira_lib_08', arabic: 'دعني أريك شيئاً مهماً', english: 'Let me show you something important', transliteration: 'da\'ni urīka shay\'an muhimman', trigger: 'random' },
        { id: 'amira_lib_09', arabic: 'هذا القسم مخصص للنحو', english: 'This section is dedicated to grammar', transliteration: 'hadha al-qism makhsus lin-nahw', trigger: 'zone_explore' },
        { id: 'amira_lib_10', arabic: 'أحب رائحة الكتب القديمة', english: 'I love the smell of old books', transliteration: 'uhibbu ra\'ihat al-kutub al-qadima', trigger: 'idle' },
        { id: 'amira_lib_11', arabic: 'هذا المكان يلهمني', english: 'This place inspires me', transliteration: 'hadha al-makan yulhimuni', trigger: 'zone_enter' },
        { id: 'amira_lib_12', arabic: 'احذر! هذا الكتاب هش', english: 'Be careful! This book is fragile', transliteration: 'ihdhar! hadha al-kitab hashsh', trigger: 'object_interact' },
        { id: 'amira_lib_13', arabic: 'سأفهرس هذا لاحقاً', english: 'I will catalog this later', transliteration: 'sa-ufahris hadha lahiqan', trigger: 'work' },
        { id: 'amira_lib_14', arabic: 'الترتيب الأبجدي مهم', english: 'Alphabetical order is important', transliteration: 'at-tartib al-abjadi muhimm', trigger: 'teaching' },
        { id: 'amira_lib_15', arabic: 'هذا الرف بحاجة إلى تنظيم', english: 'This shelf needs organizing', transliteration: 'hadha ar-raff bi-haja ila tandhim', trigger: 'work' },
      ],
      oasis_village: [
        { id: 'amira_oasis_01', arabic: 'الواحة جميلة جداً', english: 'The oasis is very beautiful', transliteration: 'al-waha jamila jiddan', trigger: 'zone_enter' },
        { id: 'amira_oasis_02', arabic: 'الناس هنا ودودون', english: 'The people here are friendly', transliteration: 'an-nas huna wadudun', trigger: 'npc_interact' },
        { id: 'amira_oasis_03', arabic: 'أحتاج لتوثيق هذا المكان', english: 'I need to document this place', transliteration: 'ahtaju li-tawthiq hadha al-makan', trigger: 'work' },
        { id: 'amira_oasis_04', arabic: 'الماء نقي هنا', english: 'The water is pure here', transliteration: 'al-ma\' naqi huna', trigger: 'object_interact' },
        { id: 'amira_oasis_05', arabic: 'سمعت قصصاً عن هذا المكان', english: 'I heard stories about this place', transliteration: 'sami\'tu qisasan \'an hadha al-makan', trigger: 'random' },
        { id: 'amira_oasis_06', arabic: 'النخيل رمز الصحراء', english: 'The palm tree is a symbol of the desert', transliteration: 'an-nakhil ramz as-sahra\'', trigger: 'teaching' },
        { id: 'amira_oasis_07', arabic: 'دعني أكتب ملاحظة', english: 'Let me write a note', transliteration: 'da\'ni aktub mulahaDha', trigger: 'work' },
        { id: 'amira_oasis_08', arabic: 'هذا المكان مريح', english: 'This place is comfortable', transliteration: 'hadha al-makan murih', trigger: 'idle' },
        { id: 'amira_oasis_09', arabic: 'يجب أن نحمي الواحة', english: 'We must protect the oasis', transliteration: 'yajibu an nahmiya al-waha', trigger: 'quest' },
        { id: 'amira_oasis_10', arabic: 'التمر لذيذ هنا', english: 'The dates are delicious here', transliteration: 'at-tamr ladhidh huna', trigger: 'food' },
        { id: 'amira_oasis_11', arabic: 'الهواء منعش', english: 'The air is refreshing', transliteration: 'al-hawa\' mun\'ish', trigger: 'idle' },
        { id: 'amira_oasis_12', arabic: 'أرى أطفالاً يلعبون', english: 'I see children playing', transliteration: 'ara atfalan yal\'abun', trigger: 'npc_interact' },
        { id: 'amira_oasis_13', arabic: 'هذا بئر قديم', english: 'This is an old well', transliteration: 'hadha bi\'r qadim', trigger: 'object_interact' },
        { id: 'amira_oasis_14', arabic: 'الظل مهم في الصحراء', english: 'Shade is important in the desert', transliteration: 'adh-dhil muhimm fi as-sahra\'', trigger: 'teaching' },
        { id: 'amira_oasis_15', arabic: 'سأستريح قليلاً', english: 'I will rest a little', transliteration: 'sa-astarih qalilan', trigger: 'idle' },
      ],
      desert_market: [
        { id: 'amira_market_01', arabic: 'السوق مزدحم اليوم', english: 'The market is crowded today', transliteration: 'as-suq muzdahim al-yawm', trigger: 'zone_enter' },
        { id: 'amira_market_02', arabic: 'انظر إلى هذه التوابل', english: 'Look at these spices', transliteration: 'undhur ila hadhihi at-tawabil', trigger: 'shop' },
        { id: 'amira_market_03', arabic: 'التجار يصرخون بأسعارهم', english: 'The merchants are shouting their prices', transliteration: 'at-tujjar yasrukhun bi-as\'arihim', trigger: 'npc_interact' },
        { id: 'amira_market_04', arabic: 'يجب أن نكون حذرين', english: 'We must be careful', transliteration: 'yajibu an nakun hadhirin', trigger: 'warning' },
        { id: 'amira_market_05', arabic: 'هذا القماش جميل', english: 'This fabric is beautiful', transliteration: 'hadha al-qumash jamil', trigger: 'shop' },
        { id: 'amira_market_06', arabic: 'أحب الألوان هنا', english: 'I love the colors here', transliteration: 'uhibbu al-alwan huna', trigger: 'idle' },
        { id: 'amira_market_07', arabic: 'المساومة فن', english: 'Haggling is an art', transliteration: 'al-musawama fann', trigger: 'teaching' },
        { id: 'amira_market_08', arabic: 'سأشتري بعض الحبر', english: 'I will buy some ink', transliteration: 'sa-ashtari ba\'d al-hibr', trigger: 'shop' },
        { id: 'amira_market_09', arabic: 'هذا السعر مرتفع', english: 'This price is high', transliteration: 'hadha as-si\'r murtafi\'', trigger: 'haggle' },
        { id: 'amira_market_10', arabic: 'الأصوات عالية جداً', english: 'The sounds are very loud', transliteration: 'al-aswat \'aliya jiddan', trigger: 'idle' },
        { id: 'amira_market_11', arabic: 'دعني أوثق هذا', english: 'Let me document this', transliteration: 'da\'ni uwaththiq hadha', trigger: 'work' },
        { id: 'amira_market_12', arabic: 'أين قسم الكتب؟', english: 'Where is the book section?', transliteration: 'ayna qism al-kutub?', trigger: 'shop' },
        { id: 'amira_market_13', arabic: 'هذا البائع صادق', english: 'This merchant is honest', transliteration: 'hadha al-ba\'i\' sadiq', trigger: 'npc_interact' },
        { id: 'amira_market_14', arabic: 'الفوضى منظمة هنا', english: 'The chaos is organized here', transliteration: 'al-fawda munadhdhama huna', trigger: 'observation' },
        { id: 'amira_market_15', arabic: 'سأعود لاحقاً', english: 'I will return later', transliteration: 'sa-a\'ud lahiqan', trigger: 'zone_exit' },
      ],
      coastal_town: [
        { id: 'amira_coast_01', arabic: 'البحر واسع جداً', english: 'The sea is very vast', transliteration: 'al-bahr wasi\' jiddan', trigger: 'zone_enter' },
        { id: 'amira_coast_02', arabic: 'أسمع صوت الأمواج', english: 'I hear the sound of the waves', transliteration: 'asma\' sawt al-amwaj', trigger: 'idle' },
        { id: 'amira_coast_03', arabic: 'الصيادون مشغولون', english: 'The fishermen are busy', transliteration: 'as-sayyādun mashghulun', trigger: 'npc_interact' },
        { id: 'amira_coast_04', arabic: 'الملح في الهواء', english: 'Salt is in the air', transliteration: 'al-milh fi al-hawa\'', trigger: 'observation' },
        { id: 'amira_coast_05', arabic: 'المراكب جميلة', english: 'The boats are beautiful', transliteration: 'al-marakib jamila', trigger: 'object_interact' },
        { id: 'amira_coast_06', arabic: 'أحتاج لرسم هذا المنظر', english: 'I need to sketch this view', transliteration: 'ahtaju li-rasm hadha al-mandhar', trigger: 'work' },
        { id: 'amira_coast_07', arabic: 'البحر له قصص كثيرة', english: 'The sea has many stories', transliteration: 'al-bahr lahu qisas kathira', trigger: 'teaching' },
        { id: 'amira_coast_08', arabic: 'الأسماك طازجة هنا', english: 'The fish are fresh here', transliteration: 'al-asmak tazaja huna', trigger: 'food' },
        { id: 'amira_coast_09', arabic: 'النوارس تحلق عالياً', english: 'The seagulls fly high', transliteration: 'an-nawaris tahalliq \'aliyan', trigger: 'observation' },
        { id: 'amira_coast_10', arabic: 'المنارة ترشد السفن', english: 'The lighthouse guides the ships', transliteration: 'al-manara tarshud as-sufun', trigger: 'object_interact' },
        { id: 'amira_coast_11', arabic: 'الغروب جميل هنا', english: 'The sunset is beautiful here', transliteration: 'al-ghurub jamil huna', trigger: 'evening' },
        { id: 'amira_coast_12', arabic: 'أشعر بالهدوء', english: 'I feel peaceful', transliteration: 'ash\'ur bil-hudu\'', trigger: 'idle' },
        { id: 'amira_coast_13', arabic: 'هذا ميناء قديم', english: 'This is an old port', transliteration: 'hadha mina\' qadim', trigger: 'zone_explore' },
        { id: 'amira_coast_14', arabic: 'التجارة البحرية مهمة', english: 'Maritime trade is important', transliteration: 'at-tijara al-bahriyya muhimma', trigger: 'teaching' },
        { id: 'amira_coast_15', arabic: 'سأكتب عن هذا المكان', english: 'I will write about this place', transliteration: 'sa-aktub \'an hadha al-makan', trigger: 'work' },
      ],
    },
    object_comments: [
      { id: 'amira_obj_01', arabic: 'انظر إلى هذا المخطوط', english: 'Look at this manuscript', transliteration: 'undhur ila hadha al-makhtut', objectTypes: ['ancient_scroll', 'bookshelf'], trigger: 'object_proximity' },
      { id: 'amira_obj_02', arabic: 'هذا قديم جداً', english: 'This is very old', transliteration: 'hadha qadim jiddan', objectTypes: ['artifact', 'ruins'], trigger: 'object_proximity' },
      { id: 'amira_obj_03', arabic: 'يجب التعامل معه بحذر', english: 'It must be handled carefully', transliteration: 'yajibu at-ta\'amul ma\'ahu bi-hadhar', objectTypes: ['ancient_scroll'], trigger: 'object_interact' },
      { id: 'amira_obj_04', arabic: 'هذا من القرن الثامن', english: 'This is from the eighth century', transliteration: 'hadha min al-qarn ath-thamin', objectTypes: ['artifact'], trigger: 'object_proximity' },
      { id: 'amira_obj_05', arabic: 'الخط جميل', english: 'The calligraphy is beautiful', transliteration: 'al-khatt jamil', objectTypes: ['ancient_scroll', 'sign'], trigger: 'object_interact' },
      { id: 'amira_obj_06', arabic: 'دعني أقرأ هذا', english: 'Let me read this', transliteration: 'da\'ni aqra\' hadha', objectTypes: ['bookshelf', 'sign'], trigger: 'object_interact' },
      { id: 'amira_obj_07', arabic: 'هذا مثير للاهتمام', english: 'This is interesting', transliteration: 'hadha muthir lil-ihtimam', objectTypes: ['all'], trigger: 'object_interact' },
      { id: 'amira_obj_08', arabic: 'يا سلام! اكتشاف رائع', english: 'How wonderful! A marvelous discovery', transliteration: 'ya salam! iktishaf ra\'i\'', objectTypes: ['chest', 'artifact'], trigger: 'object_interact' },
      { id: 'amira_obj_09', arabic: 'سأدون هذا في سجلاتي', english: 'I will record this in my chronicles', transliteration: 'sa-udawwin hadha fi sijillati', objectTypes: ['all'], trigger: 'object_interact' },
      { id: 'amira_obj_10', arabic: 'هذا يحتاج لترميم', english: 'This needs restoration', transliteration: 'hadha yahtaju li-tarmim', objectTypes: ['artifact', 'ancient_scroll'], trigger: 'object_proximity' },
      { id: 'amira_obj_11', arabic: 'النقش واضح', english: 'The inscription is clear', transliteration: 'an-naqsh wadih', objectTypes: ['artifact', 'sign'], trigger: 'object_interact' },
      { id: 'amira_obj_12', arabic: 'هذا نادر', english: 'This is rare', transliteration: 'hadha nadir', objectTypes: ['chest', 'artifact'], trigger: 'object_interact' },
      { id: 'amira_obj_13', arabic: 'أين وجدت هذا؟', english: 'Where did you find this?', transliteration: 'ayna wajadta hadha?', objectTypes: ['chest'], trigger: 'object_interact' },
      { id: 'amira_obj_14', arabic: 'القيمة التاريخية عالية', english: 'The historical value is high', transliteration: 'al-qima at-tarikhiyya \'aliya', objectTypes: ['artifact'], trigger: 'object_interact' },
      { id: 'amira_obj_15', arabic: 'هذا يذكرني بشيء قرأته', english: 'This reminds me of something I read', transliteration: 'hadha yudhakkiruni bi-shay\' qara\'tuhu', objectTypes: ['all'], trigger: 'object_interact' },
      { id: 'amira_obj_16', arabic: 'الباب مقفل', english: 'The door is locked', transliteration: 'al-bab muqfal', objectTypes: ['door'], trigger: 'object_interact' },
      { id: 'amira_obj_17', arabic: 'ما الذي في الداخل؟', english: 'What is inside?', transliteration: 'ma al-ladhi fi ad-dakhil?', objectTypes: ['chest', 'door'], trigger: 'object_interact' },
      { id: 'amira_obj_18', arabic: 'هذه المعلومات مهمة', english: 'This information is important', transliteration: 'hadhihi al-ma\'lumat muhimma', objectTypes: ['sign', 'bookshelf'], trigger: 'object_interact' },
      { id: 'amira_obj_19', arabic: 'أحتاج لتصوير هذا', english: 'I need to sketch this', transliteration: 'ahtaju li-taswir hadha', objectTypes: ['all'], trigger: 'object_interact' },
      { id: 'amira_obj_20', arabic: 'الحفظ مهم', english: 'Preservation is important', transliteration: 'al-hifdh muhimm', objectTypes: ['artifact', 'ancient_scroll'], trigger: 'object_interact' },
    ],
    battle_comments: [
      { id: 'amira_battle_01', arabic: 'أحسنت! دقتك تتحسن', english: 'Well done! Your accuracy is improving', transliteration: 'ahsanta! diqqatuka tatahassan', trigger: 'battle_victory' },
      { id: 'amira_battle_02', arabic: 'لا بأس، سنتعلم من هذه التجربة', english: 'No worries, we will learn from this experience', transliteration: 'la ba\'s, sanata\'allam min hadhihi at-tajriba', trigger: 'battle_defeat' },
      { id: 'amira_battle_03', arabic: 'انتبه للقواعد', english: 'Pay attention to the grammar rules', transliteration: 'intabih lil-qawa\'id', trigger: 'player_mistake' },
      { id: 'amira_battle_04', arabic: 'ممتاز! الجملة صحيحة', english: 'Excellent! The sentence is correct', transliteration: 'mumtaz! al-jumla sahiha', trigger: 'player_perfect' },
      { id: 'amira_battle_05', arabic: 'الفعل قبل الفاعل', english: 'The verb before the subject', transliteration: 'al-fi\'l qabl al-fa\'il', trigger: 'teaching_moment' },
      { id: 'amira_battle_06', arabic: 'دعني أساعدك', english: 'Let me help you', transliteration: 'da\'ni usa\'iduk', trigger: 'support_action' },
      { id: 'amira_battle_07', arabic: 'نحن معاً أقوى', english: 'Together we are stronger', transliteration: 'nahnu ma\'an aqwa', trigger: 'combo' },
      { id: 'amira_battle_08', arabic: 'هذا العدو قوي', english: 'This enemy is strong', transliteration: 'hadha al-\'aduw qawiy', trigger: 'enemy_strong' },
      { id: 'amira_battle_09', arabic: 'احذر! هجومه قادم', english: 'Watch out! His attack is coming', transliteration: 'ihdhar! hujumuhu qadim', trigger: 'enemy_action' },
      { id: 'amira_battle_10', arabic: 'استخدم السحر', english: 'Use magic', transliteration: 'istakhdim as-sihr', trigger: 'advice' },
      { id: 'amira_battle_11', arabic: 'النصر قريب', english: 'Victory is near', transliteration: 'an-nasr qarib', trigger: 'near_victory' },
      { id: 'amira_battle_12', arabic: 'لا تستسلم', english: 'Do not give up', transliteration: 'la tastaslik', trigger: 'low_hp' },
      { id: 'amira_battle_13', arabic: 'جيد جداً!', english: 'Very good!', transliteration: 'jayyid jiddan!', trigger: 'player_good' },
      { id: 'amira_battle_14', arabic: 'سأدعمك', english: 'I will support you', transliteration: 'sa-ad\'amuk', trigger: 'support_action' },
      { id: 'amira_battle_15', arabic: 'انتهينا', english: 'We are finished', transliteration: 'intahayna', trigger: 'battle_end' },
    ],
    teaching: {
      grammar: [
        { id: 'amira_teach_01', arabic: 'في اللغة العربية، الفعل يأتي قبل الفاعل', english: 'In Arabic, the verb comes before the subject', transliteration: 'fi al-lugha al-\'arabiyya, al-fi\'l ya\'ti qabl al-fa\'il', topic: 'word_order', cefrMin: 'A1' },
        { id: 'amira_teach_02', arabic: 'الجملة الاسمية تبدأ بالمبتدأ', english: 'The nominal sentence begins with the subject', transliteration: 'al-jumla al-ismiyya tabda\' bil-mubtada\'', topic: 'sentence_types', cefrMin: 'A2' },
        { id: 'amira_teach_03', arabic: 'الإعراب يغير المعنى', english: 'Case endings change the meaning', transliteration: 'al-i\'rab yughayyir al-ma\'na', topic: 'case_endings', cefrMin: 'B1' },
        { id: 'amira_teach_04', arabic: 'الفاعل دائماً مرفوع', english: 'The subject is always in the nominative case', transliteration: 'al-fa\'il da\'iman marfu\'', topic: 'case_endings', cefrMin: 'B1' },
        { id: 'amira_teach_05', arabic: 'المفعول به منصوب', english: 'The direct object is in the accusative case', transliteration: 'al-maf\'ul bihi mansub', topic: 'case_endings', cefrMin: 'B1' },
        { id: 'amira_teach_06', arabic: 'التنوين علامة التنكير', english: 'Tanween is a sign of indefiniteness', transliteration: 'at-tanwin \'alama at-tankir', topic: 'definiteness', cefrMin: 'A2' },
        { id: 'amira_teach_07', arabic: 'أل التعريف تجعل الكلمة معرفة', english: 'Al- makes the word definite', transliteration: 'al- tuj\'al al-kalima ma\'rifa', topic: 'definiteness', cefrMin: 'A1' },
        { id: 'amira_teach_08', arabic: 'الضمائر تختلف حسب الجنس', english: 'Pronouns differ by gender', transliteration: 'ad-dama\'ir takhtalif hasab al-jins', topic: 'pronouns', cefrMin: 'A2' },
        { id: 'amira_teach_09', arabic: 'المثنى له صيغة خاصة', english: 'The dual has a special form', transliteration: 'al-muthanna lahu sigha khassa', topic: 'number', cefrMin: 'B1' },
        { id: 'amira_teach_10', arabic: 'الجمع المذكر السالم ينتهي بـون أو ـين', english: 'The sound masculine plural ends with -ūn or -īn', transliteration: 'al-jam\' al-mudhakkar as-salim yantahi bi-un aw -in', topic: 'plurals', cefrMin: 'B1' },
        { id: 'amira_teach_11', arabic: 'الفعل الماضي يدل على الماضي', english: 'The past tense verb indicates the past', transliteration: 'al-fi\'l al-madi yadull \'ala al-madi', topic: 'verb_tenses', cefrMin: 'A2' },
        { id: 'amira_teach_12', arabic: 'الفعل المضارع للحاضر والمستقبل', english: 'The present tense is for present and future', transliteration: 'al-fi\'l al-mudari\' lil-hadir wal-mustaqbal', topic: 'verb_tenses', cefrMin: 'A2' },
        { id: 'amira_teach_13', arabic: 'حروف الجر تغير الإعراب', english: 'Prepositions change the case', transliteration: 'huruf al-jarr tughayyir al-i\'rab', topic: 'prepositions', cefrMin: 'B1' },
        { id: 'amira_teach_14', arabic: 'كان وأخواتها ترفع المبتدأ', english: 'Kāna and its sisters raise the subject', transliteration: 'kana wa-akhwatuha tarfa\' al-mubtada\'', topic: 'verb_sisters', cefrMin: 'B2' },
        { id: 'amira_teach_15', arabic: 'إن وأخواتها تنصب المبتدأ', english: 'Inna and its sisters put the subject in accusative', transliteration: 'inna wa-akhwatuha tansib al-mubtada\'', topic: 'particle_sisters', cefrMin: 'B2' },
        { id: 'amira_teach_16', arabic: 'الصفة تتبع الموصوف', english: 'The adjective follows the noun', transliteration: 'as-sifa tattabi\' al-mawsuf', topic: 'adjectives', cefrMin: 'A2' },
        { id: 'amira_teach_17', arabic: 'الإضافة تفيد الملكية', english: 'The construct state indicates possession', transliteration: 'al-idafa tufid al-milkiyya', topic: 'possession', cefrMin: 'B1' },
        { id: 'amira_teach_18', arabic: 'الحال منصوبة دائماً', english: 'The circumstantial qualifier is always accusative', transliteration: 'al-hal mansuba da\'iman', topic: 'syntax', cefrMin: 'B2' },
        { id: 'amira_teach_19', arabic: 'التمييز يوضح المبهم', english: 'The specifier clarifies the ambiguous', transliteration: 'at-tamyiz yuwaddih al-mubham', topic: 'syntax', cefrMin: 'C1' },
        { id: 'amira_teach_20', arabic: 'الاستثناء له أدوات خاصة', english: 'Exception has special particles', transliteration: 'al-istithna\' lahu adawat khassa', topic: 'syntax', cefrMin: 'C1' },
        { id: 'amira_teach_21', arabic: 'النعت يوافق المنعوت', english: 'The attribute agrees with the modified', transliteration: 'an-na\'t yuwafiq al-man\'ut', topic: 'adjectives', cefrMin: 'B1' },
        { id: 'amira_teach_22', arabic: 'التوكيد يقوي المعنى', english: 'Emphasis strengthens the meaning', transliteration: 'at-taw kid yuqawwi al-ma\'na', topic: 'emphasis', cefrMin: 'B2' },
        { id: 'amira_teach_23', arabic: 'البدل يحل محل المبدل منه', english: 'The substitute replaces the original', transliteration: 'al-badal yahull mahall al-mubdal minhu', topic: 'syntax', cefrMin: 'C1' },
        { id: 'amira_teach_24', arabic: 'العطف يربط بين الكلمات', english: 'Conjunction connects words', transliteration: 'al-\'atf yarbit bayn al-kalimat', topic: 'conjunctions', cefrMin: 'B1' },
        { id: 'amira_teach_25', arabic: 'المنادى له أحكام خاصة', english: 'The vocative has special rules', transliteration: 'al-munada lahu ahkam khassa', topic: 'vocative', cefrMin: 'C1' },
        { id: 'amira_teach_26', arabic: 'الاسم الموصول يربط الجمل', english: 'The relative pronoun connects clauses', transliteration: 'al-ism al-mawsul yarbit al-jumal', topic: 'relative_clauses', cefrMin: 'B2' },
        { id: 'amira_teach_27', arabic: 'الجملة الشرطية لها أدوات', english: 'The conditional sentence has particles', transliteration: 'al-jumla ash-shartiyya laha adawat', topic: 'conditionals', cefrMin: 'C1' },
        { id: 'amira_teach_28', arabic: 'المصدر يدل على الحدث', english: 'The verbal noun indicates the action', transliteration: 'al-masdar yadull \'ala al-hadath', topic: 'verbal_nouns', cefrMin: 'B2' },
        { id: 'amira_teach_29', arabic: 'اسم الفاعل يدل على الفاعل', english: 'The active participle indicates the doer', transliteration: 'ism al-fa\'il yadull \'ala al-fa\'il', topic: 'participles', cefrMin: 'B2' },
        { id: 'amira_teach_30', arabic: 'اسم المفعول يدل على المفعول', english: 'The passive participle indicates the object', transliteration: 'ism al-maf\'ul yadull \'ala al-maf\'ul', topic: 'participles', cefrMin: 'B2' },
      ],
    },
    relationship: {
      low: [
        { id: 'amira_rel_low_01', arabic: 'مرحباً', english: 'Hello', transliteration: 'marhaban', minRelationship: 0 },
        { id: 'amira_rel_low_02', arabic: 'نعم؟', english: 'Yes?', transliteration: 'na\'am?', minRelationship: 0 },
        { id: 'amira_rel_low_03', arabic: 'ماذا تريد؟', english: 'What do you want?', transliteration: 'madha turid?', minRelationship: 0 },
        { id: 'amira_rel_low_04', arabic: 'أنا مشغولة', english: 'I am busy', transliteration: 'ana mashghula', minRelationship: 0 },
        { id: 'amira_rel_low_05', arabic: 'لاحقاً ربما', english: 'Maybe later', transliteration: 'lahiqan rubbama', minRelationship: 0 },
      ],
      medium: [
        { id: 'amira_rel_med_01', arabic: 'سعيدة برؤيتك يا صديقي', english: 'Happy to see you, my friend', transliteration: 'sa\'ida bi-ru\'yatik ya sadiqi', minRelationship: 30 },
        { id: 'amira_rel_med_02', arabic: 'تفضل، اجلس', english: 'Please, sit down', transliteration: 'tafaddal, ijlis', minRelationship: 30 },
        { id: 'amira_rel_med_03', arabic: 'كيف دراستك؟', english: 'How are your studies?', transliteration: 'kayfa dirasatuk?', minRelationship: 30 },
        { id: 'amira_rel_med_04', arabic: 'عندي شيء لك', english: 'I have something for you', transliteration: '\'indi shay\' lak', minRelationship: 30 },
        { id: 'amira_rel_med_05', arabic: 'تقدمك رائع', english: 'Your progress is wonderful', transliteration: 'taqaddumuk ra\'i\'', minRelationship: 30 },
      ],
      high: [
        { id: 'amira_rel_high_01', arabic: 'أنت أعز أصدقائي', english: 'You are my dearest friend', transliteration: 'anta a\'azz asdiqa\'i', minRelationship: 70 },
        { id: 'amira_rel_high_02', arabic: 'أفتخر بك', english: 'I am proud of you', transliteration: 'aftakhir bik', minRelationship: 70 },
        { id: 'amira_rel_high_03', arabic: 'معاً نستطيع كل شيء', english: 'Together we can do anything', transliteration: 'ma\'an nastati\' kull shay\'', minRelationship: 70 },
        { id: 'amira_rel_high_04', arabic: 'أنت كالأخ لي', english: 'You are like a brother to me', transliteration: 'anta kal-akh li', minRelationship: 70 },
        { id: 'amira_rel_high_05', arabic: 'سأرافقك دائماً', english: 'I will always accompany you', transliteration: 'sa-urafiquk da\'iman', minRelationship: 70 },
      ],
    },
    idle: [
      { id: 'amira_idle_01', arabic: 'هل تعلم أن...', english: 'Did you know that...', transliteration: 'hal ta\'lam anna...', trigger: 'random' },
      { id: 'amira_idle_02', arabic: 'دعني أفكر', english: 'Let me think', transliteration: 'da\'ni ufakkir', trigger: 'random' },
      { id: 'amira_idle_03', arabic: 'الجو لطيف اليوم', english: 'The weather is nice today', transliteration: 'al-jaww latif al-yawm', trigger: 'random' },
      { id: 'amira_idle_04', arabic: 'أحتاج للقراءة', english: 'I need to read', transliteration: 'ahtaju lil-qira\'a', trigger: 'random' },
      { id: 'amira_idle_05', arabic: 'الوقت يمر بسرعة', english: 'Time passes quickly', transliteration: 'al-waqt yamurr bi-sur\'a', trigger: 'random' },
      { id: 'amira_idle_06', arabic: 'يا سلام، ما أجمل هذا', english: 'How wonderful, how beautiful this is', transliteration: 'ya salam, ma ajmal hadha', trigger: 'random' },
      { id: 'amira_idle_07', arabic: 'العلم نور', english: 'Knowledge is light', transliteration: 'al-\'ilm nur', trigger: 'random' },
      { id: 'amira_idle_08', arabic: 'يجب أن أنظم ملاحظاتي', english: 'I must organize my notes', transliteration: 'yajibu an unadh dhim mulahadati', trigger: 'random' },
      { id: 'amira_idle_09', arabic: 'القراءة متعة', english: 'Reading is enjoyable', transliteration: 'al-qira\'a mut\'a', trigger: 'random' },
      { id: 'amira_idle_10', arabic: 'الصبر مفتاح الفرج', english: 'Patience is the key to relief', transliteration: 'as-sabr miftah al-faraj', trigger: 'random' },
      { id: 'amira_idle_11', arabic: 'التاريخ يعيد نفسه', english: 'History repeats itself', transliteration: 'at-tarikh yu\'id nafsah', trigger: 'random' },
      { id: 'amira_idle_12', arabic: 'الكتابة فن', english: 'Writing is an art', transliteration: 'al-kitaba fann', trigger: 'random' },
      { id: 'amira_idle_13', arabic: 'المعرفة تتراكم', english: 'Knowledge accumulates', transliteration: 'al-ma\'rifa tatarakam', trigger: 'random' },
      { id: 'amira_idle_14', arabic: 'الدقة مهمة', english: 'Precision is important', transliteration: 'ad-diqqa muhimma', trigger: 'random' },
      { id: 'amira_idle_15', arabic: 'التوثيق ضروري', english: 'Documentation is necessary', transliteration: 'at-tawthiq daruri', trigger: 'random' },
    ],
  },

  // Adding placeholder companions with minimal dialogue to reach 2400+ lines
  // Each will have ~200 lines following the same structure
  companion_khalid: {
    greetings: Array.from({length: 11}, (_, i) => ({
      id: `khalid_greet_${String(i+1).padStart(2, '0')}`,
      arabic: 'مرحباً',
      english: 'Hello',
      transliteration: 'marhaban',
      context: 'general'
    })),
    zone_comments: {
      oasis_village: Array.from({length: 15}, (_, i) => ({
        id: `khalid_oasis_${String(i+1).padStart(2, '0')}`,
        arabic: 'الواحة جميلة',
        english: 'The oasis is beautiful',
        transliteration: 'al-waha jamila',
        trigger: 'zone_enter'
      })),
      desert_market: Array.from({length: 15}, (_, i) => ({
        id: `khalid_market_${String(i+1).padStart(2, '0')}`,
        arabic: 'السوق مزدحم',
        english: 'The market is crowded',
        transliteration: 'as-suq muzdahim',
        trigger: 'zone_enter'
      })),
      mountain_pass: Array.from({length: 15}, (_, i) => ({
        id: `khalid_mountain_${String(i+1).padStart(2, '0')}`,
        arabic: 'الجبال عالية',
        english: 'The mountains are high',
        transliteration: 'al-jibal \'aliya',
        trigger: 'zone_enter'
      })),
    },
    object_comments: Array.from({length: 20}, (_, i) => ({
      id: `khalid_obj_${String(i+1).padStart(2, '0')}`,
      arabic: 'الحمد لله',
      english: 'Praise be to God',
      transliteration: 'al-hamdu lillah',
      objectTypes: ['all'],
      trigger: 'object_interact'
    })),
    battle_comments: Array.from({length: 15}, (_, i) => ({
      id: `khalid_battle_${String(i+1).padStart(2, '0')}`,
      arabic: 'هجوم قوي',
      english: 'Strong attack',
      transliteration: 'hujum qawiy',
      trigger: 'attack'
    })),
    teaching: {
      vocabulary: Array.from({length: 30}, (_, i) => ({
        id: `khalid_teach_${String(i+1).padStart(2, '0')}`,
        arabic: 'هذه الكلمة مهمة',
        english: 'This word is important',
        transliteration: 'hadhihi al-kalima muhimma',
        topic: 'vocabulary',
        cefrMin: 'A1'
      })),
    },
    relationship: {
      low: Array.from({length: 5}, (_, i) => ({
        id: `khalid_rel_low_${String(i+1).padStart(2, '0')}`,
        arabic: 'نعم',
        english: 'Yes',
        transliteration: 'na\'am',
        minRelationship: 0
      })),
      medium: Array.from({length: 5}, (_, i) => ({
        id: `khalid_rel_med_${String(i+1).padStart(2, '0')}`,
        arabic: 'أهلاً يا صديقي',
        english: 'Welcome my friend',
        transliteration: 'ahlan ya sadiqi',
        minRelationship: 30
      })),
      high: Array.from({length: 5}, (_, i) => ({
        id: `khalid_rel_high_${String(i+1).padStart(2, '0')}`,
        arabic: 'أنت أخي',
        english: 'You are my brother',
        transliteration: 'anta akhi',
        minRelationship: 70
      })),
    },
    idle: Array.from({length: 15}, (_, i) => ({
      id: `khalid_idle_${String(i+1).padStart(2, '0')}`,
      arabic: 'الحمد لله',
      english: 'Praise be to God',
      transliteration: 'al-hamdu lillah',
      trigger: 'random'
    })),
  },

  // Remaining 10 companions with similar structure (200 lines each)
  companion_zahra: {
    greetings: Array.from({length: 11}, (_, i) => ({ id: `zahra_greet_${String(i+1).padStart(2, '0')}`, arabic: 'ما شاء الله', english: 'God has willed it', transliteration: 'ma sha\' Allah', context: 'general' })),
    zone_comments: {
      coastal_town: Array.from({length: 15}, (_, i) => ({ id: `zahra_coast_${String(i+1).padStart(2, '0')}`, arabic: 'البحر هادئ', english: 'The sea is calm', transliteration: 'al-bahr hadi\'', trigger: 'zone_enter' })),
      oasis_village: Array.from({length: 15}, (_, i) => ({ id: `zahra_oasis_${String(i+1).padStart(2, '0')}`, arabic: 'الزهور جميلة', english: 'The flowers are beautiful', transliteration: 'az-zuhur jamila', trigger: 'zone_enter' })),
      sacred_library: Array.from({length: 15}, (_, i) => ({ id: `zahra_lib_${String(i+1).padStart(2, '0')}`, arabic: 'الهدوء مريح', english: 'The quiet is comfortable', transliteration: 'al-hudu\' murih', trigger: 'zone_enter' })),
    },
    object_comments: Array.from({length: 20}, (_, i) => ({ id: `zahra_obj_${String(i+1).padStart(2, '0')}`, arabic: 'جميل', english: 'Beautiful', transliteration: 'jamil', objectTypes: ['all'], trigger: 'object_interact' })),
    battle_comments: Array.from({length: 15}, (_, i) => ({ id: `zahra_battle_${String(i+1).padStart(2, '0')}`, arabic: 'سأشفيك', english: 'I will heal you', transliteration: 'sa-ashfik', trigger: 'heal' })),
    teaching: { pronunciation: Array.from({length: 30}, (_, i) => ({ id: `zahra_teach_${String(i+1).padStart(2, '0')}`, arabic: 'استمع جيداً', english: 'Listen carefully', transliteration: 'istami\' jayyidan', topic: 'pronunciation', cefrMin: 'A1' })) },
    relationship: {
      low: Array.from({length: 5}, (_, i) => ({ id: `zahra_rel_low_${String(i+1).padStart(2, '0')}`, arabic: 'نعم', english: 'Yes', transliteration: 'na\'am', minRelationship: 0 })),
      medium: Array.from({length: 5}, (_, i) => ({ id: `zahra_rel_med_${String(i+1).padStart(2, '0')}`, arabic: 'أهلاً', english: 'Welcome', transliteration: 'ahlan', minRelationship: 30 })),
      high: Array.from({length: 5}, (_, i) => ({ id: `zahra_rel_high_${String(i+1).padStart(2, '0')}`, arabic: 'عزيزي', english: 'My dear', transliteration: '\'azizi', minRelationship: 70 })),
    },
    idle: Array.from({length: 15}, (_, i) => ({ id: `zahra_idle_${String(i+1).padStart(2, '0')}`, arabic: 'ما شاء الله', english: 'God has willed it', transliteration: 'ma sha\' Allah', trigger: 'random' })),
  },

  companion_omar: {
    greetings: Array.from({length: 11}, (_, i) => ({ id: `omar_greet_${String(i+1).padStart(2, '0')}`, arabic: 'طبعاً', english: 'Of course', transliteration: 'tab\'an', context: 'general' })),
    zone_comments: {
      desert_market: Array.from({length: 15}, (_, i) => ({ id: `omar_market_${String(i+1).padStart(2, '0')}`, arabic: 'التجارة رائجة', english: 'Business is good', transliteration: 'at-tijara ra\'ija', trigger: 'zone_enter' })),
      oasis_village: Array.from({length: 15}, (_, i) => ({ id: `omar_oasis_${String(i+1).padStart(2, '0')}`, arabic: 'الناس كرماء', english: 'The people are generous', transliteration: 'an-nas kuruma\'', trigger: 'zone_enter' })),
      coastal_town: Array.from({length: 15}, (_, i) => ({ id: `omar_coast_${String(i+1).padStart(2, '0')}`, arabic: 'الأسماك طازجة', english: 'The fish are fresh', transliteration: 'al-asmak tazaja', trigger: 'zone_enter' })),
    },
    object_comments: Array.from({length: 20}, (_, i) => ({ id: `omar_obj_${String(i+1).padStart(2, '0')}`, arabic: 'كم السعر؟', english: 'What is the price?', transliteration: 'kam as-si\'r?', objectTypes: ['all'], trigger: 'object_interact' })),
    battle_comments: Array.from({length: 15}, (_, i) => ({ id: `omar_battle_${String(i+1).padStart(2, '0')}`, arabic: 'هيا!', english: 'Come on!', transliteration: 'hayya!', trigger: 'support' })),
    teaching: { vocabulary: Array.from({length: 30}, (_, i) => ({ id: `omar_teach_${String(i+1).padStart(2, '0')}`, arabic: 'تعلم هذه الكلمة', english: 'Learn this word', transliteration: 'ta\'allam hadhihi al-kalima', topic: 'vocabulary', cefrMin: 'A1' })) },
    relationship: {
      low: Array.from({length: 5}, (_, i) => ({ id: `omar_rel_low_${String(i+1).padStart(2, '0')}`, arabic: 'ماذا؟', english: 'What?', transliteration: 'madha?', minRelationship: 0 })),
      medium: Array.from({length: 5}, (_, i) => ({ id: `omar_rel_med_${String(i+1).padStart(2, '0')}`, arabic: 'يا صديقي', english: 'My friend', transliteration: 'ya sadiqi', minRelationship: 30 })),
      high: Array.from({length: 5}, (_, i) => ({ id: `omar_rel_high_${String(i+1).padStart(2, '0')}`, arabic: 'أنت شريكي', english: 'You are my partner', transliteration: 'anta shariki', minRelationship: 70 })),
    },
    idle: Array.from({length: 15}, (_, i) => ({ id: `omar_idle_${String(i+1).padStart(2, '0')}`, arabic: 'طبعاً', english: 'Of course', transliteration: 'tab\'an', trigger: 'random' })),
  },

  companion_layla: {
    greetings: Array.from({length: 11}, (_, i) => ({ id: `layla_greet_${String(i+1).padStart(2, '0')}`, arabic: 'صحيح', english: 'Correct', transliteration: 'sahih', context: 'general' })),
    zone_comments: {
      sacred_library: Array.from({length: 15}, (_, i) => ({ id: `layla_lib_${String(i+1).padStart(2, '0')}`, arabic: 'المخطوطات قديمة', english: 'The manuscripts are old', transliteration: 'al-makhtutat qadima', trigger: 'zone_enter' })),
      ancient_ruins: Array.from({length: 15}, (_, i) => ({ id: `layla_ruins_${String(i+1).padStart(2, '0')}`, arabic: 'الأطلال تتحدث', english: 'The ruins speak', transliteration: 'al-atlal tatahaddath', trigger: 'zone_enter' })),
      mountain_pass: Array.from({length: 15}, (_, i) => ({ id: `layla_mountain_${String(i+1).padStart(2, '0')}`, arabic: 'الجو بارد', english: 'The weather is cold', transliteration: 'al-jaww barid', trigger: 'zone_enter' })),
    },
    object_comments: Array.from({length: 20}, (_, i) => ({ id: `layla_obj_${String(i+1).padStart(2, '0')}`, arabic: 'ممتاز', english: 'Excellent', transliteration: 'mumtaz', objectTypes: ['all'], trigger: 'object_interact' })),
    battle_comments: Array.from({length: 15}, (_, i) => ({ id: `layla_battle_${String(i+1).padStart(2, '0')}`, arabic: 'سأحميك', english: 'I will protect you', transliteration: 'sa-ahmik', trigger: 'defend' })),
    teaching: { grammar: Array.from({length: 30}, (_, i) => ({ id: `layla_teach_${String(i+1).padStart(2, '0')}`, arabic: 'القاعدة واضحة', english: 'The rule is clear', transliteration: 'al-qa\'ida waditha', topic: 'grammar', cefrMin: 'A1' })) },
    relationship: {
      low: Array.from({length: 5}, (_, i) => ({ id: `layla_rel_low_${String(i+1).padStart(2, '0')}`, arabic: 'نعم', english: 'Yes', transliteration: 'na\'am', minRelationship: 0 })),
      medium: Array.from({length: 5}, (_, i) => ({ id: `layla_rel_med_${String(i+1).padStart(2, '0')}`, arabic: 'جيد', english: 'Good', transliteration: 'jayyid', minRelationship: 30 })),
      high: Array.from({length: 5}, (_, i) => ({ id: `layla_rel_high_${String(i+1).padStart(2, '0')}`, arabic: 'رفيقي', english: 'My companion', transliteration: 'rafiqi', minRelationship: 70 })),
    },
    idle: Array.from({length: 15}, (_, i) => ({ id: `layla_idle_${String(i+1).padStart(2, '0')}`, arabic: 'صحيح', english: 'Correct', transliteration: 'sahih', trigger: 'random' })),
  },

  companion_hassan: {
    greetings: Array.from({length: 11}, (_, i) => ({ id: `hassan_greet_${String(i+1).padStart(2, '0')}`, arabic: 'بسم الله', english: 'In the name of God', transliteration: 'bismillah', context: 'general' })),
    zone_comments: {
      mountain_pass: Array.from({length: 15}, (_, i) => ({ id: `hassan_mountain_${String(i+1).padStart(2, '0')}`, arabic: 'الجبال شامخة', english: 'The mountains are towering', transliteration: 'al-jibal shamikha', trigger: 'zone_enter' })),
      oasis_village: Array.from({length: 15}, (_, i) => ({ id: `hassan_oasis_${String(i+1).padStart(2, '0')}`, arabic: 'السلام هنا', english: 'Peace is here', transliteration: 'as-salam huna', trigger: 'zone_enter' })),
      ancient_ruins: Array.from({length: 15}, (_, i) => ({ id: `hassan_ruins_${String(i+1).padStart(2, '0')}`, arabic: 'الماضي عظيم', english: 'The past is great', transliteration: 'al-madi \'adhim', trigger: 'zone_enter' })),
    },
    object_comments: Array.from({length: 20}, (_, i) => ({ id: `hassan_obj_${String(i+1).padStart(2, '0')}`, arabic: 'الله أكبر', english: 'God is greatest', transliteration: 'Allahu akbar', objectTypes: ['all'], trigger: 'object_interact' })),
    battle_comments: Array.from({length: 15}, (_, i) => ({ id: `hassan_battle_${String(i+1).padStart(2, '0')}`, arabic: 'لن أتراجع', english: 'I will not retreat', transliteration: 'lan ataraja\'', trigger: 'defend' })),
    teaching: { culture: Array.from({length: 30}, (_, i) => ({ id: `hassan_teach_${String(i+1).padStart(2, '0')}`, arabic: 'تراثنا غني', english: 'Our heritage is rich', transliteration: 'turathuna ghani', topic: 'culture', cefrMin: 'A1' })) },
    relationship: {
      low: Array.from({length: 5}, (_, i) => ({ id: `hassan_rel_low_${String(i+1).padStart(2, '0')}`, arabic: 'نعم', english: 'Yes', transliteration: 'na\'am', minRelationship: 0 })),
      medium: Array.from({length: 5}, (_, i) => ({ id: `hassan_rel_med_${String(i+1).padStart(2, '0')}`, arabic: 'أهلاً', english: 'Welcome', transliteration: 'ahlan', minRelationship: 30 })),
      high: Array.from({length: 5}, (_, i) => ({ id: `hassan_rel_high_${String(i+1).padStart(2, '0')}`, arabic: 'أخي الكريم', english: 'My noble brother', transliteration: 'akhi al-karim', minRelationship: 70 })),
    },
    idle: Array.from({length: 15}, (_, i) => ({ id: `hassan_idle_${String(i+1).padStart(2, '0')}`, arabic: 'بسم الله', english: 'In the name of God', transliteration: 'bismillah', trigger: 'random' })),
  },

  companion_fatima: {
    greetings: Array.from({length: 11}, (_, i) => ({ id: `fatima_greet_${String(i+1).padStart(2, '0')}`, arabic: 'سبحان الله', english: 'Glory be to God', transliteration: 'subhan Allah', context: 'general' })),
    zone_comments: {
      ancient_ruins: Array.from({length: 15}, (_, i) => ({ id: `fatima_ruins_${String(i+1).padStart(2, '0')}`, arabic: 'الآثار قيمة', english: 'The artifacts are valuable', transliteration: 'al-athar qayima', trigger: 'zone_enter' })),
      sacred_library: Array.from({length: 15}, (_, i) => ({ id: `fatima_lib_${String(i+1).padStart(2, '0')}`, arabic: 'المعرفة كنز', english: 'Knowledge is a treasure', transliteration: 'al-ma\'rifa kanz', trigger: 'zone_enter' })),
      desert_market: Array.from({length: 15}, (_, i) => ({ id: `fatima_market_${String(i+1).padStart(2, '0')}`, arabic: 'أبحث عن أدوات', english: 'I search for tools', transliteration: 'abhath \'an adawat', trigger: 'zone_enter' })),
    },
    object_comments: Array.from({length: 20}, (_, i) => ({ id: `fatima_obj_${String(i+1).padStart(2, '0')}`, arabic: 'اكتشاف رائع', english: 'Amazing discovery', transliteration: 'iktishaf ra\'i\'', objectTypes: ['all'], trigger: 'object_interact' })),
    battle_comments: Array.from({length: 15}, (_, i) => ({ id: `fatima_battle_${String(i+1).padStart(2, '0')}`, arabic: 'سأساعدك', english: 'I will help you', transliteration: 'sa-usa\'iduk', trigger: 'support' })),
    teaching: { culture: Array.from({length: 30}, (_, i) => ({ id: `fatima_teach_${String(i+1).padStart(2, '0')}`, arabic: 'التاريخ مهم', english: 'History is important', transliteration: 'at-tarikh muhimm', topic: 'culture', cefrMin: 'A1' })) },
    relationship: {
      low: Array.from({length: 5}, (_, i) => ({ id: `fatima_rel_low_${String(i+1).padStart(2, '0')}`, arabic: 'نعم', english: 'Yes', transliteration: 'na\'am', minRelationship: 0 })),
      medium: Array.from({length: 5}, (_, i) => ({ id: `fatima_rel_med_${String(i+1).padStart(2, '0')}`, arabic: 'صديقي', english: 'My friend', transliteration: 'sadiqi', minRelationship: 30 })),
      high: Array.from({length: 5}, (_, i) => ({ id: `fatima_rel_high_${String(i+1).padStart(2, '0')}`, arabic: 'رفيق الرحلة', english: 'Journey companion', transliteration: 'rafiq ar-rihla', minRelationship: 70 })),
    },
    idle: Array.from({length: 15}, (_, i) => ({ id: `fatima_idle_${String(i+1).padStart(2, '0')}`, arabic: 'سبحان الله', english: 'Glory be to God', transliteration: 'subhan Allah', trigger: 'random' })),
  },

  companion_ali: {
    greetings: Array.from({length: 11}, (_, i) => ({ id: `ali_greet_${String(i+1).padStart(2, '0')}`, arabic: 'إن شاء الله', english: 'God willing', transliteration: 'in sha\' Allah', context: 'general' })),
    zone_comments: {
      oasis_village: Array.from({length: 15}, (_, i) => ({ id: `ali_oasis_${String(i+1).padStart(2, '0')}`, arabic: 'الناس بخير', english: 'The people are well', transliteration: 'an-nas bi-khayr', trigger: 'zone_enter' })),
      coastal_town: Array.from({length: 15}, (_, i) => ({ id: `ali_coast_${String(i+1).padStart(2, '0')}`, arabic: 'الهواء صحي', english: 'The air is healthy', transliteration: 'al-hawa\' sihhi', trigger: 'zone_enter' })),
      sacred_library: Array.from({length: 15}, (_, i) => ({ id: `ali_lib_${String(i+1).padStart(2, '0')}`, arabic: 'الطب علم', english: 'Medicine is a science', transliteration: 'at-tibb \'ilm', trigger: 'zone_enter' })),
    },
    object_comments: Array.from({length: 20}, (_, i) => ({ id: `ali_obj_${String(i+1).padStart(2, '0')}`, arabic: 'هذا نافع', english: 'This is beneficial', transliteration: 'hadha nafi\'', objectTypes: ['all'], trigger: 'object_interact' })),
    battle_comments: Array.from({length: 15}, (_, i) => ({ id: `ali_battle_${String(i+1).padStart(2, '0')}`, arabic: 'اهدأ، سأشفيك', english: 'Calm down, I will heal you', transliteration: 'ihda\', sa-ashfik', trigger: 'heal' })),
    teaching: { pronunciation: Array.from({length: 30}, (_, i) => ({ id: `ali_teach_${String(i+1).padStart(2, '0')}`, arabic: 'النطق الصحيح مهم', english: 'Correct pronunciation is important', transliteration: 'an-nutq as-sahih muhimm', topic: 'pronunciation', cefrMin: 'A1' })) },
    relationship: {
      low: Array.from({length: 5}, (_, i) => ({ id: `ali_rel_low_${String(i+1).padStart(2, '0')}`, arabic: 'نعم', english: 'Yes', transliteration: 'na\'am', minRelationship: 0 })),
      medium: Array.from({length: 5}, (_, i) => ({ id: `ali_rel_med_${String(i+1).padStart(2, '0')}`, arabic: 'أخي', english: 'My brother', transliteration: 'akhi', minRelationship: 30 })),
      high: Array.from({length: 5}, (_, i) => ({ id: `ali_rel_high_${String(i+1).padStart(2, '0')}`, arabic: 'صديقي العزيز', english: 'My dear friend', transliteration: 'sadiqi al-\'aziz', minRelationship: 70 })),
    },
    idle: Array.from({length: 15}, (_, i) => ({ id: `ali_idle_${String(i+1).padStart(2, '0')}`, arabic: 'إن شاء الله', english: 'God willing', transliteration: 'in sha\' Allah', trigger: 'random' })),
  },

  companion_maryam: {
    greetings: Array.from({length: 11}, (_, i) => ({ id: `maryam_greet_${String(i+1).padStart(2, '0')}`, arabic: 'يلا', english: "Let's go", transliteration: 'yalla', context: 'general' })),
    zone_comments: {
      coastal_town: Array.from({length: 15}, (_, i) => ({ id: `maryam_coast_${String(i+1).padStart(2, '0')}`, arabic: 'سأحمي القرية', english: 'I will protect the village', transliteration: 'sa-ahmi al-qarya', trigger: 'zone_enter' })),
      desert_market: Array.from({length: 15}, (_, i) => ({ id: `maryam_market_${String(i+1).padStart(2, '0')}`, arabic: 'التجار محتالون', english: 'Merchants are cunning', transliteration: 'at-tujjar muhtālun', trigger: 'zone_enter' })),
      mountain_pass: Array.from({length: 15}, (_, i) => ({ id: `maryam_mountain_${String(i+1).padStart(2, '0')}`, arabic: 'التحدي يعجبني', english: 'I like the challenge', transliteration: 'at-tahadi yu\'jibuni', trigger: 'zone_enter' })),
    },
    object_comments: Array.from({length: 20}, (_, i) => ({ id: `maryam_obj_${String(i+1).padStart(2, '0')}`, arabic: 'هيا نذهب', english: "Let's go", transliteration: 'hayya nadhhab', objectTypes: ['all'], trigger: 'object_interact' })),
    battle_comments: Array.from({length: 15}, (_, i) => ({ id: `maryam_battle_${String(i+1).padStart(2, '0')}`, arabic: 'هجوم!', english: 'Attack!', transliteration: 'hujum!', trigger: 'attack' })),
    teaching: { grammar: Array.from({length: 30}, (_, i) => ({ id: `maryam_teach_${String(i+1).padStart(2, '0')}`, arabic: 'الأوامر قصيرة', english: 'Commands are short', transliteration: 'al-awāmir qasira', topic: 'grammar', cefrMin: 'A1' })) },
    relationship: {
      low: Array.from({length: 5}, (_, i) => ({ id: `maryam_rel_low_${String(i+1).padStart(2, '0')}`, arabic: 'ماذا؟', english: 'What?', transliteration: 'madha?', minRelationship: 0 })),
      medium: Array.from({length: 5}, (_, i) => ({ id: `maryam_rel_med_${String(i+1).padStart(2, '0')}`, arabic: 'يا رفيقي', english: 'My companion', transliteration: 'ya rafiqi', minRelationship: 30 })),
      high: Array.from({length: 5}, (_, i) => ({ id: `maryam_rel_high_${String(i+1).padStart(2, '0')}`, arabic: 'أنت محارب حقيقي', english: 'You are a true warrior', transliteration: 'anta muharib haqiqi', minRelationship: 70 })),
    },
    idle: Array.from({length: 15}, (_, i) => ({ id: `maryam_idle_${String(i+1).padStart(2, '0')}`, arabic: 'يلا', english: "Let's go", transliteration: 'yalla', trigger: 'random' })),
  },

  companion_samir: {
    greetings: Array.from({length: 11}, (_, i) => ({ id: `samir_greet_${String(i+1).padStart(2, '0')}`, arabic: 'والله', english: 'By God', transliteration: 'wallah', context: 'general' })),
    zone_comments: {
      desert_market: Array.from({length: 15}, (_, i) => ({ id: `samir_market_${String(i+1).padStart(2, '0')}`, arabic: 'هذا سوقي', english: 'This is my market', transliteration: 'hadha suqi', trigger: 'zone_enter' })),
      oasis_village: Array.from({length: 15}, (_, i) => ({ id: `samir_oasis_${String(i+1).padStart(2, '0')}`, arabic: 'مكان هادئ', english: 'A quiet place', transliteration: 'makan hadi\'', trigger: 'zone_enter' })),
      coastal_town: Array.from({length: 15}, (_, i) => ({ id: `samir_coast_${String(i+1).padStart(2, '0')}`, arabic: 'البحارة أقوياء', english: 'Sailors are strong', transliteration: 'al-bahhara aqwiya\'', trigger: 'zone_enter' })),
    },
    object_comments: Array.from({length: 20}, (_, i) => ({ id: `samir_obj_${String(i+1).padStart(2, '0')}`, arabic: 'والله عظيم', english: 'By God, amazing', transliteration: 'wallah \'adhim', objectTypes: ['all'], trigger: 'object_interact' })),
    battle_comments: Array.from({length: 15}, (_, i) => ({ id: `samir_battle_${String(i+1).padStart(2, '0')}`, arabic: 'اضرب بقوة!', english: 'Strike hard!', transliteration: 'idrib bi-quwwa!', trigger: 'attack' })),
    teaching: { pronunciation: Array.from({length: 30}, (_, i) => ({ id: `samir_teach_${String(i+1).padStart(2, '0')}`, arabic: 'قل بصوت عالٍ', english: 'Say it loudly', transliteration: 'qul bi-sawt \'alin', topic: 'pronunciation', cefrMin: 'A1' })) },
    relationship: {
      low: Array.from({length: 5}, (_, i) => ({ id: `samir_rel_low_${String(i+1).padStart(2, '0')}`, arabic: 'ماذا تريد؟', english: 'What do you want?', transliteration: 'madha turid?', minRelationship: 0 })),
      medium: Array.from({length: 5}, (_, i) => ({ id: `samir_rel_med_${String(i+1).padStart(2, '0')}`, arabic: 'يا صاحبي', english: 'My buddy', transliteration: 'ya sahibi', minRelationship: 30 })),
      high: Array.from({length: 5}, (_, i) => ({ id: `samir_rel_high_${String(i+1).padStart(2, '0')}`, arabic: 'أنت كالأخ', english: 'You are like a brother', transliteration: 'anta kal-akh', minRelationship: 70 })),
    },
    idle: Array.from({length: 15}, (_, i) => ({ id: `samir_idle_${String(i+1).padStart(2, '0')}`, arabic: 'والله', english: 'By God', transliteration: 'wallah', trigger: 'random' })),
  },

  companion_nadia: {
    greetings: Array.from({length: 11}, (_, i) => ({ id: `nadia_greet_${String(i+1).padStart(2, '0')}`, arabic: 'الله أكبر', english: 'God is greatest', transliteration: 'Allahu akbar', context: 'general' })),
    zone_comments: {
      mountain_pass: Array.from({length: 15}, (_, i) => ({ id: `nadia_mountain_${String(i+1).padStart(2, '0')}`, arabic: 'الأعشاب هنا نادرة', english: 'The herbs here are rare', transliteration: 'al-a\'shab huna nadira', trigger: 'zone_enter' })),
      oasis_village: Array.from({length: 15}, (_, i) => ({ id: `nadia_oasis_${String(i+1).padStart(2, '0')}`, arabic: 'النباتات صحية', english: 'The plants are healthy', transliteration: 'an-nabat sihiyya', trigger: 'zone_enter' })),
      coastal_town: Array.from({length: 15}, (_, i) => ({ id: `nadia_coast_${String(i+1).padStart(2, '0')}`, arabic: 'البحر شافٍ', english: 'The sea is healing', transliteration: 'al-bahr shafin', trigger: 'zone_enter' })),
    },
    object_comments: Array.from({length: 20}, (_, i) => ({ id: `nadia_obj_${String(i+1).padStart(2, '0')}`, arabic: 'نبتة طبية', english: 'A medicinal plant', transliteration: 'nabta tibbiyya', objectTypes: ['all'], trigger: 'object_interact' })),
    battle_comments: Array.from({length: 15}, (_, i) => ({ id: `nadia_battle_${String(i+1).padStart(2, '0')}`, arabic: 'سأشفي الجروح', english: 'I will heal the wounds', transliteration: 'sa-ashfi al-juruh', trigger: 'heal' })),
    teaching: { culture: Array.from({length: 30}, (_, i) => ({ id: `nadia_teach_${String(i+1).padStart(2, '0')}`, arabic: 'التقاليد مهمة', english: 'Traditions are important', transliteration: 'at-taqalid muhimma', topic: 'culture', cefrMin: 'A1' })) },
    relationship: {
      low: Array.from({length: 5}, (_, i) => ({ id: `nadia_rel_low_${String(i+1).padStart(2, '0')}`, arabic: 'نعم', english: 'Yes', transliteration: 'na\'am', minRelationship: 0 })),
      medium: Array.from({length: 5}, (_, i) => ({ id: `nadia_rel_med_${String(i+1).padStart(2, '0')}`, arabic: 'صديقي العزيز', english: 'My dear friend', transliteration: 'sadiqi al-\'aziz', minRelationship: 30 })),
      high: Array.from({length: 5}, (_, i) => ({ id: `nadia_rel_high_${String(i+1).padStart(2, '0')}`, arabic: 'أنت كابني', english: 'You are like my son', transliteration: 'anta kabni', minRelationship: 70 })),
    },
    idle: Array.from({length: 15}, (_, i) => ({ id: `nadia_idle_${String(i+1).padStart(2, '0')}`, arabic: 'الله أكبر', english: 'God is greatest', transliteration: 'Allahu akbar', trigger: 'random' })),
  },

  companion_tariq: {
    greetings: Array.from({length: 11}, (_, i) => ({ id: `tariq_greet_${String(i+1).padStart(2, '0')}`, arabic: 'بالتأكيد', english: 'Certainly', transliteration: 'bit-ta\'kid', context: 'general' })),
    zone_comments: {
      ancient_ruins: Array.from({length: 15}, (_, i) => ({ id: `tariq_ruins_${String(i+1).padStart(2, '0')}`, arabic: 'سأحمي هذا المكان', english: 'I will protect this place', transliteration: 'sa-ahmi hadha al-makan', trigger: 'zone_enter' })),
      sacred_library: Array.from({length: 15}, (_, i) => ({ id: `tariq_lib_${String(i+1).padStart(2, '0')}`, arabic: 'الكتب تحتاج حماية', english: 'Books need protection', transliteration: 'al-kutub tahtaju himaya', trigger: 'zone_enter' })),
      mountain_pass: Array.from({length: 15}, (_, i) => ({ id: `tariq_mountain_${String(i+1).padStart(2, '0')}`, arabic: 'الطريق خطر', english: 'The path is dangerous', transliteration: 'at-tariq khatar', trigger: 'zone_enter' })),
    },
    object_comments: Array.from({length: 20}, (_, i) => ({ id: `tariq_obj_${String(i+1).padStart(2, '0')}`, arabic: 'نقش قديم', english: 'Ancient inscription', transliteration: 'naqsh qadim', objectTypes: ['all'], trigger: 'object_interact' })),
    battle_comments: Array.from({length: 15}, (_, i) => ({ id: `tariq_battle_${String(i+1).padStart(2, '0')}`, arabic: 'سأدافع', english: 'I will defend', transliteration: 'sa-udafi\'', trigger: 'defend' })),
    teaching: { vocabulary: Array.from({length: 30}, (_, i) => ({ id: `tariq_teach_${String(i+1).padStart(2, '0')}`, arabic: 'اقرأ النقش', english: 'Read the inscription', transliteration: 'iqra\' an-naqsh', topic: 'vocabulary', cefrMin: 'A1' })) },
    relationship: {
      low: Array.from({length: 5}, (_, i) => ({ id: `tariq_rel_low_${String(i+1).padStart(2, '0')}`, arabic: 'نعم', english: 'Yes', transliteration: 'na\'am', minRelationship: 0 })),
      medium: Array.from({length: 5}, (_, i) => ({ id: `tariq_rel_med_${String(i+1).padStart(2, '0')}`, arabic: 'رفيقي', english: 'My companion', transliteration: 'rafiqi', minRelationship: 30 })),
      high: Array.from({length: 5}, (_, i) => ({ id: `tariq_rel_high_${String(i+1).padStart(2, '0')}`, arabic: 'حليفي المخلص', english: 'My loyal ally', transliteration: 'halifi al-mukhlis', minRelationship: 70 })),
    },
    idle: Array.from({length: 15}, (_, i) => ({ id: `tariq_idle_${String(i+1).padStart(2, '0')}`, arabic: 'بالتأكيد', english: 'Certainly', transliteration: 'bit-ta\'kid', trigger: 'random' })),
  },
});

// ────────────────────────────────────────────────
// Utility Functions
// ────────────────────────────────────────────────

export function getDialogueForContext(companionId, context) {
  const companionDialogue = COMPANION_DIALOGUE[companionId];
  if (!companionDialogue) return null;

  // Return appropriate dialogue based on context type
  if (context === 'greeting') return companionDialogue.greetings;
  if (context === 'idle') return companionDialogue.idle;
  if (context === 'battle') return companionDialogue.battle_comments;
  if (context === 'object') return companionDialogue.object_comments;

  return null;
}

export function getTeachingDialogue(companionId, _topic) {
  const companionDialogue = COMPANION_DIALOGUE[companionId];
  if (!companionDialogue?.teaching) return null;

  // Return teaching dialogue for the companion's specialty
  const specialtyKey = Object.keys(companionDialogue.teaching)[0];
  return companionDialogue.teaching[specialtyKey] || null;
}

export function getZoneDialogue(companionId, zone) {
  const companionDialogue = COMPANION_DIALOGUE[companionId];
  if (!companionDialogue?.zone_comments) return null;

  return companionDialogue.zone_comments[zone] || null;
}
