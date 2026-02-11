/**
 * npcStoryArcs.js
 *
 * Story arc data overlay for NPCs.
 * Contains:
 *  - storyArc metadata for 15 key NPCs (NARR-07)
 *  - Relationship-gated dialogue trees (NARR-05)
 *  - Branch-point dialogue (NARR-03)
 *  - Guide Amira cross-zone evolution (NARR-11)
 *
 * This data is merged into the base npcs.json at import time
 * via mergeNpcStoryArcs() so we never mutate the static JSON.
 */

// ── Story Arc metadata per NPC ──
const NPC_STORY_ARC_META = {
  'scholar-yusuf': {
    storyArc: { arc: 'main_storyline', role: 'knowledge_keeper', branchPoint: 'scholars_dilemma' },
  },
  'merchant-fatima': {
    storyArc: { arc: 'main_storyline', role: 'manuscript_finder', branchPoint: 'scholars_dilemma' },
  },
  'student-khalid': {
    storyArc: { arc: 'oasis_village_arc', role: 'study_partner' },
  },
  'librarian-ibrahim': {
    storyArc: { arc: 'library_mysteries', role: 'archive_guardian' },
  },
  'scribe-amina': {
    storyArc: { arc: 'library_mysteries', role: 'calligraphy_master' },
  },
  'spice-seller-layla': {
    storyArc: { arc: 'marketplace_harmony', role: 'trade_disputant' },
  },
  'trader-hassan': {
    storyArc: { arc: 'marketplace_harmony', role: 'trade_disputant' },
  },
  'elder-tariq': {
    storyArc: {
      arc: 'main_storyline',
      role: 'desert_sage',
      branchPoint: 'desert_crossing',
    },
  },
  'storyteller-noor': {
    storyArc: { arc: 'desert_legends', role: 'lore_keeper' },
  },
  'wanderer-ali': {
    storyArc: { arc: 'main_storyline', role: 'caravan_guide', branchPoint: 'desert_crossing' },
  },
  'healer-khadija': {
    storyArc: { arc: 'mountain_wisdom_arc', role: 'trial_giver' },
  },
  'vizier-abbas': {
    storyArc: {
      arc: 'main_storyline',
      role: 'court_gatekeeper',
      branchPoint: 'palace_audience',
    },
  },
  'princess-aisha': {
    storyArc: { arc: 'royal_palace_arc', role: 'royal_ally' },
  },
  'poet-rumi': {
    storyArc: { arc: 'royal_palace_arc', role: 'wisdom_poet' },
  },
  'guide-amira': {
    storyArc: {
      arc: 'mentor_evolution',
      role: 'mentor',
      crossZone: true,
    },
  },
};

// ── Additional dialogue trees keyed by NPC id ──
// These are APPENDED to the NPC's existing dialogueTrees array.
const NPC_EXTRA_DIALOGUE_TREES = {
  // ─── Scholar Yusuf — manuscript dilemma + relationship secrets ───
  'scholar-yusuf': [
    {
      id: 'topic_personal_secrets',
      topic: 'personal',
      returnToHub: true,
      priority: 4,
      condition: { relationship: { min: 3 } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'أَنتَ طالِبٌ مُجتَهِد... أُريدُ أَن أُخبِرَكَ سِرّاً',
          english: 'You are a diligent student... I want to tell you a secret.',
          transliteration: 'anta taalibun mujtahid... uriidu an ukhbiraka sirran',
        },
        {
          speaker: 'npc',
          arabic: 'مَخطوطَتي الثَّمينَة اِختَفَت — تَحمِلُ أَسرارَ اللُّغَة القَديمَة',
          english:
            'My precious manuscript disappeared — it carries secrets of the ancient language.',
          transliteration:
            'makhtootatii ath-thamiina ikhtafat — tahmilu asraar al-lugha al-qadiima',
        },
        {
          speaker: 'npc',
          arabic: 'مَن يَقرَأُها يَتَعَلَّم كَلِمات لا يَعرِفُها أَحَد',
          english: 'Whoever reads it learns words that nobody knows.',
          transliteration: "man yaqra'uhaa yata'allam kalimaat laa ya'rifuhaa ahad",
          effects: [{ type: 'story_flag', flag: 'scholar_secret_revealed', value: true }],
        },
        {
          speaker: 'player',
          choices: [
            {
              arabic: 'سَأُساعِدُكَ في اِستِعادَتِها',
              english: 'I will help you recover it',
              next: 'hub',
              effects: [
                { type: 'quest_start', questId: 'scholars_dilemma' },
                { type: 'relationship_change', amount: 1 },
              ],
            },
            {
              arabic: 'مُثير لِلاِهتِمام',
              english: 'Interesting',
              next: 'hub',
            },
          ],
        },
      ],
    },
    {
      id: 'topic_dilemma_scholar_path',
      topic: 'personal',
      returnToHub: true,
      priority: 5,
      condition: { storyFlag: { key: 'manuscript_returned_scholar', value: true } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'شُكراً لِإِعادَة المَخطوطَة! أَنتَ صَديقٌ حَقيقي',
          english: 'Thank you for returning the manuscript! You are a true friend.',
          transliteration: "shukran li-i'aadat al-makhtoota! anta sadiiqun haqiiqii",
        },
        {
          speaker: 'npc',
          arabic: 'حِكمَة — المَعرِفَة العَميقَة. هَذا ما يَبحَثُ عَنهُ كُلّ عالِم',
          english: 'Hikma — deep wisdom. This is what every scholar seeks.',
          transliteration: "hikma — al-ma'rifa al-'amiiqa. haadha maa yabhathu 'anhu kullu 'aalim",
          teachWord: 'hikma',
        },
        {
          speaker: 'npc',
          arabic: 'مَعرِفَة — أُختُ الحِكمَة',
          english: "Ma'rifa — knowledge, the sister of wisdom.",
          transliteration: "ma'rifa — ukhtu al-hikma",
          teachWord: 'ma_rifa',
        },
      ],
    },
    {
      id: 'topic_dilemma_merchant_path',
      topic: 'personal',
      returnToHub: true,
      priority: 5,
      condition: { storyFlag: { key: 'manuscript_kept_merchant', value: true } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'أَنا حَزينٌ أَنَّ المَخطوطَة لَم تُعَد... لَكِنَّني أَفهَم',
          english: 'I am sad the manuscript was not returned... but I understand.',
          transliteration: "ana haziinun anna al-makhtoota lam tu'ad... lakinnanii afham",
        },
        {
          speaker: 'npc',
          arabic: 'العِلمُ لا يَحتاجُ إلى وَرَق — إنَّهُ في القَلب',
          english: "Knowledge doesn't need paper — it is in the heart.",
          transliteration: "al-'ilmu laa yahtaaju ilaa waraq — innahu fil-qalb",
        },
        {
          speaker: 'npc',
          arabic: 'صَبر — كَلِمَة مُهِمَّة جِدّاً لِلعالِم',
          english: 'Sabr — a very important word for a scholar (patience).',
          transliteration: "sabr — kalima muhimma jiddan lil-'aalim",
          teachWord: 'sabr',
        },
      ],
    },
  ],

  // ─── Merchant Fatima — manuscript dispute side + market secrets ───
  'merchant-fatima': [
    {
      id: 'topic_personal_market_secrets',
      topic: 'personal',
      returnToHub: true,
      priority: 4,
      condition: { relationship: { min: 3 } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'أَنتِ زَبونَة مُخلِصَة! سَأُخبِرُكِ سِرّاً',
          english: 'You are a loyal customer! I will tell you a secret.',
          transliteration: "anti zabuuna mukhlisa! sa-ukhbiruki sirran",
        },
        {
          speaker: 'npc',
          arabic: 'وَجَدتُ مَخطوطَة في السُّوق — تَبدو ثَمينَة جِدّاً',
          english: 'I found a manuscript at the market — it looks very valuable.',
          transliteration: 'wajadtu makhtoota fis-suuq — tabduu thamiina jiddan',
        },
        {
          speaker: 'npc',
          arabic: 'الشَّيخ يوسُف يَقولُ إنَّها لَهُ، لَكِنَّني وَجَدتُها',
          english: 'Scholar Yusuf says it is his, but I found it.',
          transliteration: 'ash-shaykh yuusuf yaquulu innahaa lahu, lakinnanii wajadtuhaa',
        },
        {
          speaker: 'player',
          choices: [
            {
              arabic: 'يَجِبُ أَن تُعيديها',
              english: 'You should return it',
              next: 'hub',
              effects: [{ type: 'relationship_change', amount: -1 }],
            },
            {
              arabic: 'مَن وَجَدَ شَيئاً فَهُوَ لَهُ',
              english: 'Finders keepers',
              next: 'hub',
              effects: [{ type: 'relationship_change', amount: 1 }],
            },
          ],
        },
      ],
    },
    {
      id: 'topic_dilemma_sided_merchant',
      topic: 'personal',
      returnToHub: true,
      priority: 5,
      condition: { storyFlag: { key: 'manuscript_kept_merchant', value: true } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'شُكراً لِدَعمِك! التِّجارَة تَحتاجُ أَصدِقاء',
          english: 'Thank you for your support! Trade needs friends.',
          transliteration: "shukran li-da'mik! at-tijaara tahtaaju asdiqaa'",
        },
        {
          speaker: 'npc',
          arabic: 'خُذ — هَذِهِ كَلِمَة مُهِمَّة: ثِقَة — تَعني الإيمان بِشَخص',
          english: 'Take — this is an important word: Thiqa — means trust in a person.',
          transliteration: "khudh — haadhihi kalima muhimma: thiqa — ta'nii al-iimaan bi-shakhs",
          teachWord: 'thiqa',
        },
      ],
    },
  ],

  // ─── Elder Tariq — desert crossing branch ───
  'elder-tariq': [
    {
      id: 'topic_personal_desert_wisdom',
      topic: 'personal',
      returnToHub: true,
      priority: 4,
      condition: { relationship: { min: 3 } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'يا وَلَدي، أَنا عِشتُ في هَذِهِ الصَّحراء سِتّينَ سَنَة',
          english: 'My child, I have lived in this desert for sixty years.',
          transliteration: 'ya waladii, ana ishtu fii haadhihi as-sahraa sittiin sana',
        },
        {
          speaker: 'npc',
          arabic: 'أَعرِفُ طَريقَين إلى الجَبَل — واحِد آمِن وَواحِد خَطير',
          english: 'I know two routes to the mountain — one safe and one dangerous.',
          transliteration: "a'rifu tariiqayn ilaa al-jabal — waahid aamin wa waahid khatiir",
        },
        {
          speaker: 'npc',
          arabic: 'الطَّريقُ الخَطيرُ يَمُرُّ عَبرَ أَطلال قَديمَة فيها كِتابات سِرِّيَّة',
          english: 'The dangerous route passes through ancient ruins with secret writings.',
          transliteration:
            'at-tariiqu al-khatiiru yamurru abra atlaal qadiima fiihaa kitaabaat sirriyya',
        },
        {
          speaker: 'player',
          choices: [
            {
              arabic: 'أَخبِرني أَكثَر',
              english: 'Tell me more',
              next: 'hub',
              effects: [{ type: 'quest_start', questId: 'desert_crossing' }],
            },
            {
              arabic: 'شُكراً يا شَيخ',
              english: 'Thank you, elder',
              next: 'hub',
            },
          ],
        },
      ],
    },
    {
      id: 'topic_caravan_aftermath',
      topic: 'personal',
      returnToHub: true,
      priority: 5,
      condition: { storyFlag: { key: 'chose_caravan_route', value: true } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'الحَمدُ لِلَّه! وَصَلتَ بِسَلامَة. الطَّريقُ الآمِنُ هُوَ الأَفضَل',
          english: 'Thank God! You arrived safely. The safe route is the best.',
          transliteration:
            "al-hamdu lillaah! wasalta bi-salaama. at-tariiqu al-aaminu huwa al-afdal",
        },
        {
          speaker: 'npc',
          arabic: 'سَلامَة — كَلِمَة جَميلَة تَعني الأَمان',
          english: 'Salama — a beautiful word meaning safety.',
          transliteration: "salaama — kalima jamiila ta'nii al-amaan",
          teachWord: 'salaama',
        },
      ],
    },
    {
      id: 'topic_ruins_aftermath',
      topic: 'personal',
      returnToHub: true,
      priority: 5,
      condition: { storyFlag: { key: 'chose_ruins_shortcut', value: true } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'يا لَلشَّجاعَة! نَجَوتَ مِن طَريقِ الأَطلال',
          english: 'What bravery! You survived the ruins route.',
          transliteration: "ya lash-shajaa'a! najawta min tariiq al-atlaal",
        },
        {
          speaker: 'npc',
          arabic: 'شَجاعَة — تَعني القُوَّة في القَلب',
          english: "Shaja'a — means strength in the heart (courage).",
          transliteration: "shajaa'a — ta'nii al-quwwa fil-qalb",
          teachWord: 'shajaa_a',
        },
      ],
    },
  ],

  // ─── Wanderer Ali — caravan route companion ───
  'wanderer-ali': [
    {
      id: 'topic_personal_travels',
      topic: 'personal',
      returnToHub: true,
      priority: 4,
      condition: { relationship: { min: 3 } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'سافَرتُ في كُلِّ مَكان... رَأَيتُ أَشياءَ عَجيبَة',
          english: 'I have traveled everywhere... I have seen wondrous things.',
          transliteration: "saafartu fii kulli makaan... ra'aytu ashyaa'a 'ajiiba",
        },
        {
          speaker: 'npc',
          arabic: 'في الصَّحراء تَعَلَّمتُ أَنَّ الصَّمتَ لُغَة',
          english: 'In the desert I learned that silence is a language.',
          transliteration: "fis-sahraa' ta'allamtu anna as-samta lugha",
        },
        {
          speaker: 'npc',
          arabic: 'رِحلَة — تَعني سَفَر طَويل',
          english: 'Rihla — means a long journey.',
          transliteration: "rihla — ta'nii safar tawiil",
          teachWord: 'rihla',
        },
      ],
    },
  ],

  // ─── Storyteller Noor — star map / desert legends ───
  'storyteller-noor': [
    {
      id: 'topic_personal_star_map',
      topic: 'personal',
      returnToHub: true,
      priority: 4,
      condition: { relationship: { min: 3 } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'هَل تَعرِفُ أَنَّ النُّجومَ تَحكي قِصَصاً؟',
          english: 'Did you know that stars tell stories?',
          transliteration: "hal ta'rifu anna an-nujuuma tahkii qisasan?",
        },
        {
          speaker: 'npc',
          arabic: 'جَدّي تَرَكَ لي خَريطَة نُجوم — مَكتوبَة بِالعَرَبِيَّة القَديمَة',
          english: 'My grandfather left me a star map — written in ancient Arabic.',
          transliteration:
            'jaddii taraka lii khariitat nujuum — maktuuba bil-arabiyya al-qadiima',
        },
        {
          speaker: 'player',
          choices: [
            {
              arabic: 'عَلِّمني أَسماء النُّجوم',
              english: 'Teach me the names of the stars',
              next: 'hub',
              effects: [{ type: 'quest_start', questId: 'bedouin_star_map' }],
            },
            {
              arabic: 'قِصَّة جَميلَة',
              english: 'Beautiful story',
              next: 'hub',
            },
          ],
        },
      ],
    },
  ],

  // ─── Librarian Ibrahim — lost chapter arc ───
  'librarian-ibrahim': [
    {
      id: 'topic_personal_lost_chapter',
      topic: 'personal',
      returnToHub: true,
      priority: 4,
      condition: { relationship: { min: 3 } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'هُناكَ فَصلٌ مَفقود مِن كِتابِ النَّحو القَديم',
          english: 'There is a missing chapter from the ancient grammar book.',
          transliteration: 'hunaaka faslun mafquud min kitaab an-nahw al-qadiim',
        },
        {
          speaker: 'npc',
          arabic: 'إذا ساعَدتَني في تَجميعِهِ، سَأُشارِكُكَ ما فيه',
          english: 'If you help me piece it together, I will share what is in it.',
          transliteration: "idhaa saa'adtanii fii tajmii'ihi, sa-ushaarikuka maa fiih",
        },
        {
          speaker: 'player',
          choices: [
            {
              arabic: 'بِكُلِّ سُرور',
              english: 'With pleasure',
              next: 'hub',
              effects: [{ type: 'quest_start', questId: 'library_lost_chapter' }],
            },
            {
              arabic: 'لاحِقاً',
              english: 'Later',
              next: 'hub',
            },
          ],
        },
      ],
    },
  ],

  // ─── Spice Seller Layla — marketplace rivalry ───
  'spice-seller-layla': [
    {
      id: 'topic_personal_rivalry',
      topic: 'personal',
      returnToHub: true,
      priority: 4,
      condition: { relationship: { min: 3 } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'التّاجِر حَسَّان يَبيعُ تَوابِلي بِسِعرٍ أَقَلّ! هَذا ظُلم',
          english: 'Trader Hassan is selling my spices at a lower price! This is unfair.',
          transliteration: "at-taajir hassaan yabii'u tawaabilii bi-si'rin aqall! haadha zulm",
        },
        {
          speaker: 'npc',
          arabic: 'هَل تَستَطيعُ أَن تَتَوَسَّط بَينَنا؟ أَنتَ تَعرِفُ كَلِمات التِّجارَة',
          english:
            'Can you mediate between us? You know the words of trade.',
          transliteration:
            "hal tastatii'u an tatawassat baynanaa? anta ta'rifu kalimaat at-tijaara",
        },
        {
          speaker: 'player',
          choices: [
            {
              arabic: 'سَأُحاوِل',
              english: 'I will try',
              next: 'hub',
              effects: [{ type: 'quest_start', questId: 'marketplace_rivalry' }],
            },
            {
              arabic: 'لَيسَ شَأني',
              english: "Not my business",
              next: 'hub',
            },
          ],
        },
      ],
    },
  ],

  // ─── Trader Hassan — marketplace rivalry other side ───
  'trader-hassan': [
    {
      id: 'topic_personal_trade_dispute',
      topic: 'personal',
      returnToHub: true,
      priority: 4,
      condition: { relationship: { min: 3 } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'لَيلى تَتَّهِمُني بِالغِشّ! لَكِنَّ أَسعاري عادِلَة',
          english: 'Layla accuses me of cheating! But my prices are fair.',
          transliteration: "laylaa tattahimunii bil-ghishsh! lakinna as'aarii aadila",
        },
        {
          speaker: 'npc',
          arabic: 'عَدل — كَلِمَة مُهِمَّة في التِّجارَة',
          english: "Adl — an important word in trade (justice/fairness).",
          transliteration: "adl — kalima muhimma fit-tijaara",
          teachWord: 'adl_trade',
        },
      ],
    },
  ],

  // ─── Healer Khadija — mountain trial ───
  'healer-khadija': [
    {
      id: 'topic_personal_healing_trial',
      topic: 'personal',
      returnToHub: true,
      priority: 4,
      condition: { relationship: { min: 3 } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'أَنتَ تَتَعَلَّم بِسُرعَة... هَل تُريدُ أَن تَعرِفَ أَسرارَ العِلاج؟',
          english: 'You learn quickly... Do you want to know the secrets of healing?',
          transliteration:
            "anta tata'allam bisur'a... hal turiidu an ta'rifa asraar al-'ilaaj?",
        },
        {
          speaker: 'npc',
          arabic: 'يَجِبُ أَن تَجتازَ اِمتِحاني أَوَّلاً — اِمتِحان المُعالِجَة',
          english: 'You must pass my test first — the Healer\'s Trial.',
          transliteration: 'yajibu an tajtaaza imtihaanii awwalan — imtihaan al-mu\'aalija',
        },
        {
          speaker: 'player',
          choices: [
            {
              arabic: 'أَنا جاهِز',
              english: 'I am ready',
              next: 'hub',
              effects: [{ type: 'quest_start', questId: 'mountain_healer_trial' }],
            },
            {
              arabic: 'أَحتاجُ وَقتاً',
              english: 'I need time',
              next: 'hub',
            },
          ],
        },
      ],
    },
  ],

  // ─── Vizier Abbas — palace audience branch ───
  'vizier-abbas': [
    {
      id: 'topic_personal_audience',
      topic: 'personal',
      returnToHub: true,
      priority: 4,
      condition: { relationship: { min: 3 } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'المَلِكُ يُريدُ أَن يَراك. لَكِن كَيفَ تُقَدِّمُ نَفسَك؟',
          english: 'The king wants to see you. But how will you present yourself?',
          transliteration: 'al-maliku yuriidu an yaraak. laakin kayfa tuqaddimu nafsak?',
        },
        {
          speaker: 'npc',
          arabic: 'هَل أَنتَ عالِم... أَم تاجِر؟ الإجابَة تُغَيِّرُ مَصيرَك',
          english: 'Are you a scholar... or a merchant? The answer changes your fate.',
          transliteration: 'hal anta aalim... am taajir? al-ijaaba tughayyiru masiirak',
        },
        {
          speaker: 'player',
          choices: [
            {
              arabic: 'أَنا عالِم',
              english: 'I am a scholar',
              next: 'hub',
              effects: [
                { type: 'quest_start', questId: 'palace_audience' },
                { type: 'story_flag', flag: 'palace_identity_hint', value: 'scholar' },
              ],
            },
            {
              arabic: 'أَنا تاجِر',
              english: 'I am a merchant',
              next: 'hub',
              effects: [
                { type: 'quest_start', questId: 'palace_audience' },
                { type: 'story_flag', flag: 'palace_identity_hint', value: 'merchant' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'topic_palace_scholar_path',
      topic: 'personal',
      returnToHub: true,
      priority: 5,
      condition: { storyFlag: { key: 'palace_scholar', value: true } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'المَلِكُ مَسرور بِعِلمِك. هاكَ كَلِمَة المُلوك: سُلطَة',
          english: "The king is pleased with your knowledge. Here is the word of kings: Sulta (authority).",
          transliteration: 'al-maliku masruur bi-ilmik. haaka kalimat al-muluuk: sulta',
          teachWord: 'sulta',
        },
      ],
    },
    {
      id: 'topic_palace_merchant_path',
      topic: 'personal',
      returnToHub: true,
      priority: 5,
      condition: { storyFlag: { key: 'palace_merchant', value: true } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'هَداياكَ أَعجَبَت المَلِك. هاكَ كَلِمَة: كَرَم — السَّخاء',
          english: "Your gifts impressed the king. Here is a word: Karam — generosity.",
          transliteration: "hadaayaaka a'jabat al-malik. haaka kalima: karam — as-sakhaa'",
          teachWord: 'karam',
        },
      ],
    },
  ],

  // ─── Princess Aisha — royal secrets ───
  'princess-aisha': [
    {
      id: 'topic_personal_royal_secrets',
      topic: 'personal',
      returnToHub: true,
      priority: 4,
      condition: { relationship: { min: 3 } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'أَنتَ مِن القَليلينَ الذينَ أَثِقُ بِهِم في هَذا القَصر',
          english: 'You are one of the few I trust in this palace.',
          transliteration: 'anta mina al-qaliiliin alladhiina athiqu bihim fii haadha al-qasr',
        },
        {
          speaker: 'npc',
          arabic: 'عائِلَة — كَلِمَة أُحِبُّها. العائِلَة هِيَ كُلّ شَيء',
          english: "Aa'ila — a word I love. Family is everything.",
          transliteration: "aa'ila — kalima uhibbuhaa. al-aa'ila hiya kullu shay'",
          teachWord: 'aa_ila',
        },
      ],
    },
  ],

  // ─── Poet Rumi — wisdom poetry ───
  'poet-rumi': [
    {
      id: 'topic_personal_hidden_poems',
      topic: 'personal',
      returnToHub: true,
      priority: 4,
      condition: { relationship: { min: 3 } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'لَدَيَّ قَصائِد لَم يَسمَعها أَحَد... أُريدُ أَن أُسمِعَكَ واحِدَة',
          english: 'I have poems nobody has heard... I want you to hear one.',
          transliteration:
            "ladayya qasaa'id lam yasma'haa ahad... uriidu an usmi'aka waahida",
        },
        {
          speaker: 'npc',
          arabic: 'جَمال — كَلِمَة الشُّعَراء. في كُلِّ شَيءٍ جَمال',
          english: "Jamal — the poet's word. There is beauty in everything.",
          transliteration: "jamal — kalimat ash-shu'araa'. fii kulli shay'in jamal",
          teachWord: 'jamal',
        },
      ],
    },
  ],

  // ─── Scribe Amina — calligraphy secrets ───
  'scribe-amina': [
    {
      id: 'topic_personal_calligraphy',
      topic: 'personal',
      returnToHub: true,
      priority: 4,
      condition: { relationship: { min: 3 } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'هَل تُريدُ أَن تَرى خَطّي السِّرّي؟ خَطّ النَّسخ القَديم',
          english: 'Do you want to see my secret script? The ancient Naskh style.',
          transliteration: 'hal turiidu an taraa khattii as-sirriy? khatt an-naskh al-qadiim',
        },
        {
          speaker: 'npc',
          arabic: 'فَنّ — تَعني الإبداع والمَهارَة',
          english: "Fann — means art, creativity, and skill.",
          transliteration: "fann — ta'nii al-ibdaa' wal-mahaara",
          teachWord: 'fann',
        },
      ],
    },
  ],

  // ─── Student Khalid — study partner evolution ───
  'student-khalid': [
    {
      id: 'topic_personal_study_partner',
      topic: 'personal',
      returnToHub: true,
      priority: 4,
      condition: { relationship: { min: 3 } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'أَنتَ أَفضَلُ صَديقٍ دَرَستُ مَعَه! هَل تُريدُ أَن نَكونَ شُرَكاء دائِمين؟',
          english: 'You are the best friend I have studied with! Shall we be permanent study partners?',
          transliteration:
            "anta afdalu sadiiqi darastu ma'ahu! hal turiidu an nakuuna shurakaa' daa'imiin?",
        },
        {
          speaker: 'npc',
          arabic: 'صَداقَة — تَعني العَلاقَة بَينَ الأَصدِقاء',
          english: "Sadaqa — means friendship, the bond between friends.",
          transliteration: "sadaaqa — ta'nii al-'alaaqa bayna al-asdiqaa'",
          teachWord: 'sadaaqa',
        },
      ],
    },
  ],

  // ─── Guide Amira — mentor evolution across zones (NARR-11) ───
  'guide-amira': [
    {
      id: 'topic_mentor_library',
      topic: 'about_zones',
      returnToHub: true,
      priority: 6,
      condition: { storyFlag: { key: 'library_access_granted', value: true } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'ما شاءَ اللَّه! وَصَلتَ المَكتَبَة! أَنا فَخورَة بِك',
          english: 'Wonderful! You reached the library! I am proud of you.',
          transliteration: "maa shaa'a allaah! wasalta al-maktaba! ana fakhuura bik",
        },
        {
          speaker: 'npc',
          arabic: 'المَكتَبَة مَليئَة بِالحِكمَة. اِبحَث عَن الكُتُبِ القَديمَة',
          english: 'The library is full of wisdom. Look for the ancient books.',
          transliteration: "al-maktaba malii'a bil-hikma. ibhath 'an al-kutub al-qadiima",
        },
      ],
    },
    {
      id: 'topic_mentor_marketplace',
      topic: 'about_zones',
      returnToHub: true,
      priority: 7,
      condition: { storyFlag: { key: 'marketplace_mediation_complete', value: true } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'سَمِعتُ أَنَّكَ تَوَسَّطتَ في السُّوق! أَنتَ تَكبُر',
          english: 'I heard you mediated at the market! You are growing.',
          transliteration: 'sami\'tu annaka tawassatta fis-suuq! anta takbur',
        },
        {
          speaker: 'npc',
          arabic: 'اللُّغَة لَيسَت كَلِمات فَقَط — إنَّها جُسور بَينَ النّاس',
          english: 'Language is not just words — it is bridges between people.',
          transliteration:
            'al-lugha laysat kalimaat faqat — innahaa jusuur bayna an-naas',
        },
      ],
    },
    {
      id: 'topic_mentor_desert',
      topic: 'about_zones',
      returnToHub: true,
      priority: 8,
      condition: { storyFlag: { key: 'caravan_path', value: true } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'اِختَرتَ طَريقَ القافِلَة — اِختِيار حَكيم',
          english: 'You chose the caravan route — a wise choice.',
          transliteration: 'ikhtarta tariiq al-qaafila — ikhtiyaar hakiim',
        },
        {
          speaker: 'npc',
          arabic: 'الحِكمَة في السَّفَر هِيَ أَن تَعرِفَ مَتى تَختار الأَمان',
          english: 'The wisdom of travel is knowing when to choose safety.',
          transliteration:
            "al-hikma fis-safar hiya an ta'rif mataa takhtaar al-amaan",
        },
      ],
    },
    {
      id: 'topic_mentor_ruins',
      topic: 'about_zones',
      returnToHub: true,
      priority: 8,
      condition: { storyFlag: { key: 'ruins_path', value: true } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'اِختَرتَ طَريقَ الأَطلال — اِختِيار شُجاع!',
          english: 'You chose the ruins route — a brave choice!',
          transliteration: 'ikhtarta tariiq al-atlaal — ikhtiyaar shujaa!',
        },
        {
          speaker: 'npc',
          arabic: 'الكِتابات القَديمَة التي وَجَدتَها — لا يَستَطيعُ الكَثيرونَ قِراءَتَها',
          english: 'The ancient writings you found — few can read them.',
          transliteration:
            "al-kitaabaat al-qadiima allatii wajadtahaa — laa yastatii'u al-kathiiruuna qiraa'atahaa",
        },
      ],
    },
    {
      id: 'topic_mentor_palace',
      topic: 'about_zones',
      returnToHub: true,
      priority: 9,
      condition: { storyFlag: { key: 'palace_audience_granted', value: true } },
      lines: [
        {
          speaker: 'npc',
          arabic: 'المَلِكُ قَبِلَك! رِحلَتُكَ تَقتَرِبُ مِنَ النِّهايَة',
          english: 'The king accepted you! Your journey nears its end.',
          transliteration: 'al-maliku qabilak! rihlatuka taqtaribu mina an-nihaaya',
        },
        {
          speaker: 'npc',
          arabic: 'لَكِنَّ النِّهايَة هِيَ بِدايَة جَديدَة — دائِماً',
          english: 'But the end is always a new beginning.',
          transliteration:
            "lakinna an-nihaaya hiya bidaaya jadiida — daa'iman",
        },
        {
          speaker: 'npc',
          arabic: 'أَنا فَخورَة بِكَ يا مُسافِر. لَقَد تَعَلَّمتَ الكَثير',
          english: 'I am proud of you, traveler. You have learned so much.',
          transliteration: 'ana fakhuura bika ya musaafir. laqad ta\'allamta al-kathiir',
        },
      ],
    },
  ],
};

/**
 * Merges story arc metadata and extra dialogue trees into NPC data.
 * Returns a new array — does NOT mutate the input.
 *
 * @param {Array} baseNpcs — the raw npcs.json array
 * @returns {Array} — enriched NPC array
 */
export function mergeNpcStoryArcs(baseNpcs) {
  return baseNpcs.map((npc) => {
    const meta = NPC_STORY_ARC_META[npc.id];
    const extraTrees = NPC_EXTRA_DIALOGUE_TREES[npc.id];

    if (!meta && !extraTrees) return npc;

    const merged = { ...npc };

    if (meta?.storyArc && !npc.storyArc) {
      merged.storyArc = meta.storyArc;
    }

    if (extraTrees && extraTrees.length > 0) {
      merged.dialogueTrees = [...(npc.dialogueTrees || []), ...extraTrees];
    }

    return merged;
  });
}

export { NPC_STORY_ARC_META, NPC_EXTRA_DIALOGUE_TREES };
