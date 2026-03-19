EXTERNAL changeRelationship(npcId, amount)
EXTERNAL setLearningPath(path)
EXTERNAL startQuest(questId)
EXTERNAL getFlag(key)
EXTERNAL getLearningPath()

VAR quest_act_1_complete = false

-> main

=== main ===
{quest_act_1_complete:
  -> deep_collection
- else:
  -> welcome
}

=== welcome ===
أهلاً! أنا إبراهيم، أمين المكتبة.
~ changeRelationship("librarian-ibrahim", 3)
هذه المكتبة تحتوي على آلاف المخطوطات.
* [ما أهم كتاب هنا؟]
  كتاب الحيل لبني موسى — عن الآلات الميكانيكية.
  كُتب في القرن التاسع وما زلنا نتعلم منه!
  -> library_hub
* [كيف أجد كتاباً؟]
  المخطوطات مرتبة حسب الموضوع.
  الطب هنا، الفلك هناك، والرياضيات في الطابق العلوي.
  -> library_hub

=== deep_collection ===
عودة طيبة! عندي مخطوطات جديدة لأريك.
-> library_hub

=== library_hub ===
* [أريد أن أقرأ]
  تفضل. "اقرأ" — أول كلمة نزلت في القرآن.
  -> END
* [عن المكتبة]
  هذه المكتبة نموذج لبيت الحكمة الأصلي.
  -> END
* [شكراً]
  العفو. المعرفة حق للجميع.
  -> END
