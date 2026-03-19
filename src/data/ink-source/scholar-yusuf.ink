EXTERNAL changeRelationship(npcId, amount)
EXTERNAL setLearningPath(path)
EXTERNAL startQuest(questId)
EXTERNAL getFlag(key)
EXTERNAL getLearningPath()

VAR quest_act_1_complete = false

-> main

=== main ===
{quest_act_1_complete:
  -> advanced_topics
- else:
  -> introduction
}

=== introduction ===
بسم الله الرحمن الرحيم. أنا يوسف، عالم المخطوطات.
~ changeRelationship("scholar-yusuf", 3)
هل تعلم أن بيت الحكمة في بغداد كان أعظم مكتبة في العالم؟
* [أخبرني المزيد عن بيت الحكمة]
  أسسه الخليفة هارون الرشيد في القرن الثامن الميلادي.
  ترجموا فيه كتب الإغريق والفرس والهنود إلى العربية.
  -> knowledge_hub
* [ما هذه المخطوطات؟]
  هذه مخطوطات من العصر الذهبي الإسلامي.
  فيها علوم الرياضيات والفلك والطب.
  -> knowledge_hub

=== advanced_topics ===
أهلاً بالعالم الشاب! أرى أنك تقدمت في رحلتك.
-> knowledge_hub

=== knowledge_hub ===
* [علمني كلمة جديدة]
  كلمة اليوم: مخطوط — manuscript.
  من جذر خ-ط-ط الذي يعني الكتابة.
  -> END
* [عن الخوارزمي]
  الخوارزمي أبو الجبر — كلمة algorithm مشتقة من اسمه!
  -> END
* [وداعاً]
  في أمان الله. العلم نور.
  -> END
